import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '@/lib/axios';

interface ValidationResult {
  isValid: boolean;
  missingFields: string[];
}

interface TabValidation {
  [key: string]: ValidationResult;
}

export const useEditApplicant = () => {
  const [loading, setLoading] = useState(true); // ✅ Start as true while fetching
  const { id, funderId } = useParams<{ id?: string; funderId?: string }>();
  const [activeTab, setActiveTab] = useState('general');
  const [isFieldSaving, setIsFieldSaving] = useState<Record<string, boolean>>(
    {}
  );
  const [formData, setFormData] = useState({
    type: '',
    title: '',
    firstName: '',
    middleInitial: '',
    lastName: '',
    startDate: '',
    lastDutyDate: '',
    serviceUser:'',
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

  // Define required fields for each tab
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
  // ✅ Fetch funder data on mount
  useEffect(() => {
    const fetchFunderData = async () => {
      if (!funderId) {
        setLoading(false);
        return;
      }

      try {
        const response = await axiosInstance.get(
          `/service-funder/${funderId}`
        );
        const data = response.data.data;

        // Normalize data — ensure nested objects exist
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
          travelType: data.travelType || '',
          serviceUser:data.serviceUser||'',
          website: data.website || '',
          invoice: {
            phone: data.invoice?.phone || '',
            fax: data.invoice?.fax || '',
            mobile: data.invoice?.mobile || '',
            other: data.invoice?.other || '',
            email: data.invoice?.email || '',
            website: data.invoice?.website || '',
            deliveryType: data.invoice?.deliveryType || '',
            linked: data.invoice?.linked || '',
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
          travelDetails:
            Array.isArray(data.travelDetails) && data.travelDetails.length > 0
              ? data.travelDetails.map((td: any) => ({
                  fromDate: td.fromDate || '',
                  distance: td.distance || '',
                  type: td.type || '',
                  reason: td.reason || '',
                  linkedInvoiceRateSheet: td.linkedInvoiceRateSheet || ''
                }))
              : [],
          adhocInvoice:
            Array.isArray(data.adhocInvoice) && data.adhocInvoice.length > 0
              ? data.adhocInvoice.map((ai: any) => ({
                  invoiceStartDate: ai.invoiceStartDate || '',
                  invoiceEndDate: ai.invoiceEndDate || '',
                  invoiceType: ai.invoiceType || undefined,
                  invoiceValue: ai.invoiceValue || '',
                  invoiceSummary: ai.invoiceSummary || '',
                  note: ai.note || ''
                }))
              : []
        });
      } catch (error) {
        console.error('Failed to fetch funder data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFunderData();
  }, [funderId]);


  // Helper function to check if a field is empty
const isFieldEmpty = (value: any): boolean => {
  if (value === null || value === undefined) return true;
  
  if (typeof value === 'string') {
    return value.trim() === '';
  }
  
  if (typeof value === 'boolean') {
    return false; // booleans are never "empty"
  }
  
  if (Array.isArray(value)) {
    return value.length === 0;
  }
  
  if (typeof value === 'object') {
    // Handle react-select objects {value, label}
    if ('value' in value) {
      return isFieldEmpty(value.value);
    }
    // Handle empty objects
    return Object.keys(value).length === 0;
  }
  
  return false;
};



const getMissingFields = (
  tab: keyof typeof requiredFieldsByTab,
  formData: Record<string, any>
) => {
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

// Function to check if a specific field is missing (for use in components)
const isFieldMissing = (fieldName: string, tabId: string): boolean => {
  const validation = validateTab(tabId);
  return validation.missingFields.includes(fieldName);
};

 
const validateTab = (tabId: string): ValidationResult => {
  const missingFields: string[] = [];

  if (tabId === 'travelDetails') {
    formData.travelDetails?.forEach((info: any, index: number) => {
      requiredFieldsByTab.travelDetails.forEach(({ field }) => {
        const value = info[field];
        const isEmpty =
          value === null ||
          value === undefined ||
          (typeof value === 'string' && value.trim() === '') ||
          (typeof value === 'object' && !value?.value);

        if (isEmpty) {
          missingFields.push(`${field}[${index}]`);
        }
      });
    });

    return {
      isValid: missingFields.length === 0,
      missingFields
    };
  }

  if (tabId === 'invoice' || tabId === 'invoiceContact') {
    const requiredFields = requiredFieldsByTab[tabId as keyof typeof requiredFieldsByTab] || [];
    
    requiredFields.forEach(({ field }) => {
      const key = field.replace('invoice.', ''); // e.g. "invoice.email" → "email"
      const value = formData.invoice?.[key];

      // More robust empty check
      const isEmpty = 
        value === null ||
        value === undefined ||
        (typeof value === 'string' && value.trim() === '') ||
        (typeof value === 'object' && value !== null && (
          // For select objects with {value, label} structure
          (!value.value || (typeof value.value === 'string' && value.value.trim() === '')) ||
          // For empty objects
          Object.keys(value).length === 0
        )) ||
        (Array.isArray(value) && value.length === 0);

      if (isEmpty) {
        missingFields.push(field);
      }
    });

    return {
      isValid: missingFields.length === 0,
      missingFields
    };
  }

  if (tabId === 'adhocInvoice') {
    formData.adhocInvoice?.forEach((info: any, index: number) => {
      requiredFieldsByTab.adhocInvoice.forEach(({ field }) => {
        const value = info[field];
        const isEmpty =
          value === null ||
          value === undefined ||
          (typeof value === 'string' && value.trim() === '') ||
          (typeof value === 'object' && !value?.value);

        if (isEmpty) {
          missingFields.push(`${field}[${index}]`);
        }
      });
    });

    return {
      isValid: missingFields.length === 0,
      missingFields
    };
  }

  const requiredFields =
    requiredFieldsByTab[tabId as keyof typeof requiredFieldsByTab] || [];

  requiredFields.forEach(({ field }) => {
    const value = formData[field];
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      missingFields.push(field);
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

  // ✅ Generic field update with PATCH
  const handleFieldUpdate = async (field: string, value: any) => {
    if (!funderId) return;

    setIsFieldSaving((prev) => ({ ...prev, [field]: true }));

    try {
      // Optimistically update UI
      setFormData((prev) => ({ ...prev, [field]: value }));

      // Send PATCH request
      await axiosInstance.patch(`/service-funder/${funderId}`, {
        [field]: value
      });
    } catch (error) {
      console.error(`Failed to update ${field}:`, error);
      // Revert on error (optional)
    } finally {
      setIsFieldSaving((prev) => ({ ...prev, [field]: false }));
    }
  };

  // ✅ Date field update
  const handleDateChange = async (field: string, value: string) => {
    if (!funderId) return;

    setIsFieldSaving((prev) => ({ ...prev, [field]: true }));

    try {
      setFormData((prev) => ({ ...prev, [field]: value }));
      await axiosInstance.patch(`/service-funder/${funderId}`, {
        [field]: value
      });
    } catch (error) {
      console.error(`Failed to update ${field}:`, error);
    } finally {
      setIsFieldSaving((prev) => ({ ...prev, [field]: false }));
    }
  };

  // ✅ Select field update (handles {value, label} objects)
  const handleSelectChange = async (field: string, value: any) => {
    if (!funderId) return;

    setIsFieldSaving((prev) => ({ ...prev, [field]: true }));

    // Extract value if it's an object
    const payloadValue =
      typeof value === 'object' && value !== null ? value.value : value;

    try {
      setFormData((prev) => ({ ...prev, [field]: value })); // Keep full object in UI for display
      await axiosInstance.patch(`/service-funder/${funderId}`, {
        [field]: payloadValue // Send only string value to backend
      });
    } catch (error) {
      console.error(`Failed to update ${field}:`, error);
    } finally {
      setIsFieldSaving((prev) => ({ ...prev, [field]: false }));
    }
  };

  // ✅ Checkbox (boolean) field update
  const handleCheckboxChange = async (field: string, value: boolean) => {
    if (!funderId) return;

    setIsFieldSaving((prev) => ({ ...prev, [field]: true }));

    try {
      setFormData((prev) => ({ ...prev, [field]: value }));
      await axiosInstance.patch(`/service-funder/${funderId}`, {
        [field]: value
      });
    } catch (error) {
      console.error(`Failed to update ${field}:`, error);
    } finally {
      setIsFieldSaving((prev) => ({ ...prev, [field]: false }));
    }
  };

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
