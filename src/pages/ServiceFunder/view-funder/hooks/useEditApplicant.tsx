import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '@/lib/axios';

// ✅ 1. Define Interfaces based on your specific fields
interface FormData {
  // General
  type: string;
  title: string;
  firstName: string;
  middleInitial: string;
  lastName: string;
  startDate: string;
  lastDutyDate: string;
  status: string;
  servicePriority: string;
  branch: string;
  area: string;
  description: string;
  address: string;
  city: string;
  postCode: string;
  country: string;

  // Contact
  phone: string;
  fax: string;
  email: string;
  mobile: string;
  otherPhone: string;
  website: string;

  // Travel
  travelType: string;

  // Service User
  serviceUser: string;

  // Invoice (Nested Object)
  invoice: {
    phone: string;
    fax: string;
    mobile: string;
    other: string;
    email: string;
    website: string;
    deliveryType: string;
    linked: boolean | string; // Allow boolean for strict handling
    type: string;
    name: string;
    address: string;
    cityTown: string;
    county: string;
    postCode: string;
    customerExternalId: string;
    invoiceRun: string;
    invoiceFormat: string;
    invoiceGrouping: string;
    [key: string]: any;
  };

  purchaseOrder: string;

  // Arrays
  travelDetails: Array<{
    fromDate: string;
    distance: string;
    type: string;
    reason: string;
    linkedInvoiceRateSheet: string;
  }>;

  adhocInvoice: Array<{
    invoiceStartDate: string;
    invoiceEndDate: string;
    invoiceType: any;
    invoiceValue: string;
    invoiceSummary: string;
    note: string;
  }>;

  [key: string]: any;
}

interface ValidationResult {
  isValid: boolean;
  missingFields: string[];
}

interface TabValidation {
  [key: string]: ValidationResult;
}

export const useEditApplicant = () => {
  const [loading, setLoading] = useState(true);
  const { funderid:id } = useParams(); // Using ID from params
  const [activeTab, setActiveTab] = useState('general');
  const [isFieldSaving, setIsFieldSaving] = useState<Record<string, boolean>>({});

  // ✅ 2. Initialize State with YOUR specific fields
  const [formData, setFormData] = useState<FormData>({
    type: '',
    title: '',
    firstName: '',
    middleInitial: '',
    lastName: '',
    startDate: '',
    lastDutyDate: '',
    status: '',
    servicePriority: '',
    branch: '',
    area: '',
    description: '',
    address: '',
    city: '',
    postCode: '',
    country: '',
    phone: '',
    fax: '',
    email: '',
    mobile: '',
    otherPhone: '',
    website: '',
    travelType: '',
    serviceUser: '',
    invoice: {
      phone: '',
      fax: '',
      mobile: '',
      other: '',
      email: '',
      website: '',
      deliveryType: '',
      linked: '',
      type: '',
      name: '',
      address: '',
      cityTown: '',
      county: '',
      postCode: '',
      customerExternalId: '',
      invoiceRun: '',
      invoiceFormat: '',
      invoiceGrouping: ''
    },
    purchaseOrder: '',
    travelDetails: [
      {
        fromDate: '',
        distance: '',
        type: '',
        reason: '',
        linkedInvoiceRateSheet: ''
      }
    ],
    adhocInvoice: [
      {
        invoiceStartDate: '',
        invoiceEndDate: '',
        invoiceType: undefined,
        invoiceValue: '',
        invoiceSummary: '',
        note: ''
      }
    ]
  });

  // ✅ 3. Define Required Fields Configuration
  const requiredFieldsByTab = {
    general: [
      { field: 'type', label: 'Funder Type' },
      { field: 'title', label: 'Title' },
      { field: 'firstName', label: 'First Name' },
      { field: 'lastName', label: 'Last Name' },
      { field: 'startDate', label: 'Start Date' },
      { field: 'status', label: 'Status' },
      { field: 'branch', label: 'Branch' },
      { field: 'area', label: 'Area' },
      { field: 'description', label: 'Description' },
      { field: 'address', label: 'Full Address' },
      { field: 'city', label: 'City/Town' },
      { field: 'postCode', label: 'Postal Code' },
      { field: 'country', label: 'Country' }
    ],
    contact: [
      { field: 'phone', label: 'Phone Number' },
      { field: 'mobile', label: 'Mobile Phone' },
      { field: 'email', label: 'Email' }
    ],
    travel: [{ field: 'travelType', label: 'Travel Type' }],
    travelDetails: [
      { field: 'fromDate', label: 'From Date' },
      { field: 'type', label: 'Travel Type' },
      { field: 'linkedInvoiceRateSheet', label: 'Linked Invoice Rate Sheet' }
    ],
    invoice: [
      { field: 'invoice.linked', label: 'Linked' },
      { field: 'invoice.type', label: 'Type' },
      { field: 'invoice.name', label: 'Name' },
      { field: 'invoice.address', label: 'Address' },
      { field: 'invoice.cityTown', label: 'City / Town' },
      { field: 'invoice.postCode', label: 'Post Code' },
      { field: 'invoice.customerExternalId', label: 'Customer External ID' },
      { field: 'invoice.invoiceRun', label: 'Invoice Run' },
      { field: 'invoice.invoiceFormat', label: 'Invoice Format' },
      { field: 'invoice.invoiceGrouping', label: 'Invoice Grouping' }
    ],
    invoiceContact: [
      { field: 'invoice.email', label: 'Email' },
      { field: 'invoice.deliveryType', label: 'Invoice Delivery Type' }
    ],
    po: [{ field: 'purchaseOrder', label: 'Requires Purchase Order?' }],
    adhocInvoice: [
      { field: 'invoiceStartDate', label: 'Invoice Start Date' },
      { field: 'invoiceEndDate', label: 'Invoice End Date' },
      { field: 'invoiceType', label: 'Invoice Type' },
      { field: 'invoiceValue', label: 'Invoice Value' },
      { field: 'invoiceSummary', label: 'Invoice Summary' },
      { field: 'note', label: 'Note' }
    ]
  };

  // ✅ 4. Validation Helpers (Adapted for your specific arrays)
  const getMissingFields = (
    tab: keyof typeof requiredFieldsByTab,
    formData: Record<string, any>
  ) => {
    // Special handling for invoice tab to look inside nested object
    if (tab === 'invoice' || tab === 'invoiceContact') {
      return requiredFieldsByTab[tab]
        .filter(({ field }) => {
          const key = field.replace('invoice.', '');
          const value = formData.invoice?.[key];
          return isFieldEmpty(value);
        })
        .map(({ field }) => field);
    }

    return requiredFieldsByTab[tab]
      .filter(({ field }) => isFieldEmpty(formData[field]))
      .map(({ field }) => field);
  };

  const isFieldEmpty = (value: any): boolean => {
    if (value === null || value === undefined) return true;
    if (typeof value === 'string') return value.trim() === '';
    if (typeof value === 'boolean') return false; // Booleans aren't empty
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === 'object') {
      if ('value' in value) return isFieldEmpty(value.value);
      return Object.keys(value).length === 0;
    }
    return false;
  };

  const validateTab = (tabId: string): ValidationResult => {
    const missingFields: string[] = [];

    // Specific Array Validation: Travel Details
    if (tabId === 'travelDetails') {
      formData.travelDetails?.forEach((info: any, index: number) => {
        requiredFieldsByTab.travelDetails.forEach(({ field }) => {
          if (isFieldEmpty(info[field])) {
            missingFields.push(`${field}[${index}]`);
          }
        });
      });
      return { isValid: missingFields.length === 0, missingFields };
    }

    // Specific Array Validation: Adhoc Invoice
    if (tabId === 'adhocInvoice') {
      formData.adhocInvoice?.forEach((info: any, index: number) => {
        requiredFieldsByTab.adhocInvoice.forEach(({ field }) => {
          if (isFieldEmpty(info[field])) {
            missingFields.push(`${field}[${index}]`);
          }
        });
      });
      return { isValid: missingFields.length === 0, missingFields };
    }

    // Specific Nested Object Validation: Invoice
    if (tabId === 'invoice' || tabId === 'invoiceContact') {
      const requiredFields = requiredFieldsByTab[tabId as keyof typeof requiredFieldsByTab] || [];
      requiredFields.forEach(({ field }) => {
        const key = field.replace('invoice.', '');
        const value = formData.invoice?.[key];
        if (isFieldEmpty(value)) {
          missingFields.push(field);
        }
      });
      return { isValid: missingFields.length === 0, missingFields };
    }

    // Generic Validation
    const requiredFields = requiredFieldsByTab[tabId as keyof typeof requiredFieldsByTab] || [];
    requiredFields.forEach(({ field }) => {
      if (isFieldEmpty(formData[field])) {
        missingFields.push(field);
      }
    });

    return { isValid: missingFields.length === 0, missingFields };
  };

  const getTabValidation = (): TabValidation => {
    const validation: TabValidation = {};
    Object.keys(requiredFieldsByTab).forEach((tabId) => {
      validation[tabId] = validateTab(tabId);
    });
    return validation;
  };

  // ✅ 5. REAL API INTEGRATION (Unified Logic)
  const updateFieldOnServer = async (field: string, value: any) => {
    if (!id) return;

    setIsFieldSaving((prev) => ({ ...prev, [field]: true }));

    // 1. Optimistically Update UI (Handle Nested 'invoice.' keys)
    const prevFormData = { ...formData }; // Backup for rollback
    
    setFormData((prev) => {
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        return {
          ...prev,
          [parent]: {
            ...(prev as any)[parent],
            [child]: value
          }
        };
      }
      return { ...prev, [field]: value };
    });

    // 2. Prepare Payload (Extract .value if object, handle primitives)
    let payloadValue = value;
    if (value && typeof value === 'object' && 'value' in value) {
      payloadValue = value.value;
    }

    try {
      // 3. Send Request
      // NOTE: If using nested fields like 'invoice.linked', decide if backend expects
      // "invoice.linked": val OR "invoice": { "linked": val }
      // Assuming your backend accepts flat keys or you format it here:
      
      let payload = {};
      if (field.includes('.')) {
         // Construct nested payload if required by backend, 
         // OR send flat key if your backend handles "invoice.linked"
         const [parent, child] = field.split('.');
         payload = { [parent]: { ...formData[parent as keyof FormData], [child]: payloadValue } };
         // OR simply: payload = { [field]: payloadValue }; depending on API
         // Using flat update for now based on typical patterns, or full object merge:
         await axiosInstance.patch(`/service-funder/${id}`, { [field]: payloadValue }); 
      } else {
         payload = { [field]: payloadValue };
         await axiosInstance.patch(`/service-funder/${id}`, payload);
      }

      // Optional: If server returns updated data, merge it here
      // const res = await axiosInstance.patch(...);
      // if (res.data?.data) setFormData(prev => ({...prev, ...res.data.data}));

    } catch (error) {
      console.error(`Failed to update ${field}:`, error);
      // Rollback UI
      setFormData(prevFormData);
    } finally {
      setIsFieldSaving((prev) => ({ ...prev, [field]: false }));
    }
  };

  // ✅ 6. Unified Handlers
  const handleFieldUpdate = async (field: string, value: any) => {
    await updateFieldOnServer(field, value);
  };

  const handleDateChange = async (field: string, value: string) => {
    await updateFieldOnServer(field, value);
  };

  const handleSelectChange = async (field: string, value: any) => {
    await updateFieldOnServer(field, value);
  };

  const handleCheckboxChange = async (field: string, value: boolean) => {
    await updateFieldOnServer(field, value);
  };

  // ✅ 7. Load Initial Data
  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const loadInitialData = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get(`/service-funder/${id}`);
        const data = response.data.data;

        // Normalize Data (Ensure nested objects exist and handle nulls)
        setFormData({
            type: data.type || '',
            title: data.title || '',
            firstName: data.firstName || '',
            middleInitial: data.middleInitial || '',
            lastName: data.lastName || '',
            startDate: data.startDate || '',
            lastDutyDate: data.lastDutyDate || '',
            status: data.status || '',
            servicePriority: data.servicePriority || '',
            branch: data.branch || '',
            area: data.area || '',
            description: data.description || '',
            address: data.address || '',
            city: data.city || '',
            postCode: data.postCode || '',
            country: data.country || '',
            phone: data.phone || '',
            fax: data.fax || '',
            email: data.email || '',
            mobile: data.mobile || '',
            otherPhone: data.otherPhone || '',
            website: data.website || '',
            travelType: data.travelType || '',
            serviceUser: data.serviceUser || '',
            invoice: {
              phone: data.invoice?.phone || '',
              fax: data.invoice?.fax || '',
              mobile: data.invoice?.mobile || '',
              other: data.invoice?.other || '',
              email: data.invoice?.email || '',
              website: data.invoice?.website || '',
              deliveryType: data.invoice?.deliveryType || '',
              linked: data.invoice?.linked ?? '', // Use ?? to preserve false
              type: data.invoice?.type || '',
              name: data.invoice?.name || '',
              address: data.invoice?.address || '',
              cityTown: data.invoice?.cityTown || '',
              county: data.invoice?.county || '',
              postCode: data.invoice?.postCode || '',
              customerExternalId: data.invoice?.customerExternalId || '',
              invoiceRun: data.invoice?.invoiceRun || '',
              invoiceFormat: data.invoice?.invoiceFormat || '',
              invoiceGrouping: data.invoice?.invoiceGrouping || ''
            },
            purchaseOrder: data.purchaseOrder || '',
            travelDetails: Array.isArray(data.travelDetails) && data.travelDetails.length > 0
              ? data.travelDetails
              : [],
            adhocInvoice: Array.isArray(data.adhocInvoice) && data.adhocInvoice.length > 0
              ? data.adhocInvoice
              : []
        });

      } catch (error) {
        console.error('Failed to load funder data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [id]);

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