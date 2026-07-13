import { useState, useEffect } from 'react';
import axiosInstance from '@/lib/axios';

interface FormData {
  // Personal Information
  serviceUserType: string | null;
  title: string | null;
  image?: any;
  firstName: string;
  middleInitial?: string;
  lastName: string;
  preferredName?: string;
  dateOfBirth: string;
  gender: string | null;
  maritalStatus?: string | null;
  ethnicOrigin?: string | null;
  religion?: string;

  // Address & Location
  address: string;
  city: string;
  postCode: string;
  country: string;

  // Contact Information
  phone?: string;
  fax?: string;
  mobile?: string;
  other?: string;
  email: string;
  website?: string;

  // Employment / Service Details
  startDate: string;
  lastDutyDate?: string;
  status: string | null;
  servicePriority: string | null;
  serviceLocationExId: string;
  timesheetSignature: boolean;
  timesheetSignatureNote?: string;

  // Additional Fields
  phoneNumber?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  disability?: string;
  ethnicity?: string;
  nationality?: string;
  preferredLanguage?: string;

  // Arrays
  emergencyContacts: Array<{
    emergencyContactName: string;
    relationship: string;
    address: string;
    cityOrTown: string;
    country: string;
    postCode: string;
    note: string;
    phone: string;
    mobile: string;
    email: string;
    emailRota?: boolean;
    sendInvoice?: boolean;
  }>;

  criticalInfo: Array<{
    date: string;
    type: { value: string; label: string } | null;
    details: string;
  }>;

  primaryBranch: Array<{
    fromDate: string;
    branch: string;
    area: string;
    note: string;
  }>;
  notes: Array<{
    date: string;
    type: string;
    note: string;
  }>;

  // Allow flexible key-value access
  [key: string]: any;
}

interface ValidationResult {
  isValid: boolean;
  missingFields: string[];
}

interface TabValidation {
  [key: string]: ValidationResult;
}

export const useEditApplicant = (serviceUserId: string) => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [isFieldSaving, setIsFieldSaving] = useState<Record<string, boolean>>(
    {}
  );
  const [formData, setFormData] = useState<FormData>({
    serviceUserType: '',
    title: '',
    firstName: '',
    middleInitial: '',
    lastName: '',
    preferredName: '',
    dateOfBirth: '',
    gender: '',
    maritalStatus: '',
    ethnicOrigin: '',
    religion: '',
    address: '',
    city: '',
    postCode: '',
    country: '',
    phone: '',
    fax: '',
    mobile: '',
    other: '',
    email: '',
    website: '',
    startDate: '',
    lastDutyDate: '',
    status: '',
    servicePriority: '',
    serviceLocationExId: '',
    timesheetSignature: false,
    timesheetSignatureNote: '',
    phoneNumber: '',
    emergencyContact: '',
    emergencyPhone: '',
    disability: '',
    ethnicity: '',
    nationality: '',
    preferredLanguage: '',
    glovesAprons:false,
    uniform:false,
    idBadge:false,

    emergencyContacts: [
      {
        emergencyContactName: '',
        relationship: '',
        address: '',
        cityOrTown: '',
        country: '',
        postCode: '',
        note: '',
        phone: '',
        mobile: '',
        email: '',
        emailRota: false,
        sendInvoice: false
      }
    ],
    criticalInfo: [{ date: '', type: null, details: '' }],
    primaryBranch: [
      {
        fromDate: '',
        branch: '',
        area: '',
        note: ''
      }
    ],
    notes: [{ date: '', type: '', note: '' }]
  });

  // Define required fields for each tab
  const requiredFieldsByTab = {
    general: [
      { field: 'serviceUserType', label: 'Service User Type' },
      { field: 'title', label: 'Title' },
      { field: 'firstName', label: 'First Name' },
      { field: 'lastName', label: 'Last Name' },
      { field: 'dateOfBirth', label: 'Date of Birth' },
      { field: 'startDate', label: 'Start Date' },
      // { field: 'lastDutyDate', label: 'Last Duty Date' },
      { field: 'status', label: 'Status' },
      { field: 'servicePriority', label: 'Service Priority' },
      { field: 'address', label: 'Full Address' },
      { field: 'city', label: 'City/Town' }, // ✅ Fixed: was 'cityOrTown' but field is 'city'
      { field: 'postCode', label: 'Postal Code' },
      { field: 'country', label: 'Country' }
    ],
    contact: [
      { field: 'phone', label: 'Phone Number' },
      { field: 'mobile', label: 'Mobile Phone' }, // ✅ Fixed: was 'mobilePhone' but field is 'mobile'
      { field: 'email', label: 'Email' }
    ],
    equality: [
      { field: 'gender', label: 'Gender' },

      // { field: 'maritalStatus', label: 'Marital Status' },
      // { field: 'ethnicOrigin', label: 'Ethnic Origin' },
      // { field: 'religion', label: 'Religion' }
    ],
    other: [
      // { field: 'serviceLocationExId', label: 'Service Location Ex ID' },
      { field: 'timesheetSignature', label: 'Timesheet Signature Required' },
      {
        field: 'timesheetSignatureNote',
        label: 'Timesheet Signature Note',
        conditional: (formData: FormData) =>
          formData.timesheetSignature === true
      }
    ],
    emergency: [
      { field: 'emergencyContactName', label: 'Name' },
      { field: 'relationship', label: 'Relationship' }
    ],
    criticalInfo: [
      { field: 'date', label: 'Date' },
      { field: 'type', label: 'Type' },
      { field: 'details', label: 'Details' }
    ],
    equipment: [
      // { field: 'glovesAprons', label: 'Gloves and Aprons' },
      // { field: 'uniform', label: 'Uniform' },
      // { field: 'idBadge', label: 'ID Badge' }
    ],
    primaryBranch: [
      { field: 'fromDate', label: 'From Date' },
      { field: 'branch', label: 'Branch' },
      { field: 'area', label: 'Area' }
    ],
    notes: [
      { field: 'date', label: 'Date' },
      { field: 'type', label: 'Type' },
      { field: 'note', label: 'Note' }
    ]
  };

  const getMissingFields = (
    tab: keyof typeof requiredFieldsByTab,
    formData: Record<string, any>
  ) => {
    const fields = requiredFieldsByTab[tab] || [];
    return fields
      .filter(({ field, conditional }) => {
        // Respect conditional fields
        if (conditional && !conditional(formData)) {
          return false;
        }

        const value = formData[field];
        return (
          value === null ||
          value === undefined ||
          (typeof value === 'string' && value.trim() === '')
        );
      })
      .map(({ field }) => field);
  };

  const validateTab = (tabId: string): ValidationResult => {
    const missingFields: string[] = [];

    if (tabId === 'emergency') {
      formData.emergencyContacts?.forEach((contact: any, index: number) => {
        requiredFieldsByTab.emergency.forEach(({ field }) => {
          if (!contact[field] || contact[field].toString().trim() === '') {
            missingFields.push(`${field}[${index}]`);
          }
        });
      });
      return { isValid: missingFields.length === 0, missingFields };
    }

    if (tabId === 'primaryBranch') {
      formData.primaryBranch?.forEach((item: any, index: number) => {
        requiredFieldsByTab.primaryBranch.forEach(({ field }) => {
          const value = item[field];
          const isEmpty =
            value === null ||
            value === undefined ||
            (typeof value === 'string' && value.trim() === '') ||
            (typeof value === 'object' && !value.value);
          if (isEmpty) {
            missingFields.push(`${field}[${index}]`);
          }
        });
      });
      return { isValid: missingFields.length === 0, missingFields };
    }

    if (tabId === 'criticalInfo') {
      formData.criticalInfo?.forEach((info: any, index: number) => {
        requiredFieldsByTab.criticalInfo.forEach(({ field }) => {
          const value = info[field];
          const isEmpty =
            value === null ||
            value === undefined ||
            (typeof value === 'string' && value.trim() === '') ||
            (typeof value === 'object' && !value.value);
          if (isEmpty) {
            missingFields.push(`${field}[${index}]`);
          }
        });
      });
      return { isValid: missingFields.length === 0, missingFields };
    }

    if (tabId === 'notes') {
      // Fix case: 'note' not 'Note'
      formData.notes?.forEach((info: any, index: number) => {
        requiredFieldsByTab.notes.forEach(({ field }) => {
          const value = info[field];
          const isEmpty =
            value === null ||
            value === undefined ||
            (typeof value === 'string' && value.trim() === '') ||
            (typeof value === 'object' && !value.value);
          if (isEmpty) {
            missingFields.push(`${field}[${index}]`);
          }
        });
      });
      return { isValid: missingFields.length === 0, missingFields };
    }

    const requiredFields =
      requiredFieldsByTab[tabId as keyof typeof requiredFieldsByTab] || [];

    requiredFields.forEach((fieldObj) => {
      // Check conditional
      if (fieldObj.conditional && !fieldObj.conditional(formData)) {
        return; // Skip if conditional returns false
      }

      const value = formData[fieldObj.field];
      if (
        value === null ||
        value === undefined ||
        (typeof value === 'string' && value.trim() === '')
      ) {
        missingFields.push(fieldObj.field);
      }
    });

    return {
      isValid: missingFields.length === 0,
      missingFields
    };
  };

  const getTabValidation = (): TabValidation => {
    const validation: TabValidation = {};
    Object.keys(requiredFieldsByTab).forEach((tabId) => {
      validation[tabId] = validateTab(tabId);
    });
    return validation;
  };

  // ✅ REAL API INTEGRATION
  const updateFieldOnServer = async (field: string, value: any) => {
    setIsFieldSaving((prev) => ({ ...prev, [field]: true }));

    // Optimistically update UI
    const prevValue = formData[field];
    setFormData((prev) => ({ ...prev, [field]: value }));

    try {
      const payload = { [field]: value };
      const res = await axiosInstance.patch(`/users/${serviceUserId}`, payload);

      if (res.data?.data) {
        // Merge server response to ensure consistency
        setFormData((prev) => ({ ...prev, ...res.data.data }));
      }
    } catch (error) {
      console.error(`Failed to update ${field}:`, error);
      // Rollback on error
      setFormData((prev) => ({ ...prev, [field]: prevValue }));
    } finally {
      setIsFieldSaving((prev) => ({ ...prev, [field]: false }));
    }
  };

  // ✅ Unified handlers
  const handleFieldUpdate = async (field: string, value: any) => {
    await updateFieldOnServer(field, value);
  };

  const handleDateChange = async (field: string, value: string) => {
    await updateFieldOnServer(field, value);
  };

  const handleSelectChange = async (field: string, value: string) => {
    await updateFieldOnServer(field, value);
  };

  const handleCheckboxChange = async (field: string, value: boolean) => {
    await updateFieldOnServer(field, value);
  };

  // ✅ Load initial data
  useEffect(() => {
    if (!serviceUserId) return;

    const loadInitialData = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get(`/users/${serviceUserId}`);
        if (res.data?.data) {
          setFormData(res.data.data);
        }
      } catch (error) {
        console.error('Failed to load applicant data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  return {
    loading,
    activeTab,
    setActiveTab,
    formData,
    handleFieldUpdate,
    handleDateChange,
    handleSelectChange,
    handleCheckboxChange,
    isFieldSaving,
    getTabValidation,
    validateTab,
    requiredFieldsByTab,
    getMissingFields
  };
};
