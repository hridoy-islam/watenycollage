import { useState, useEffect } from 'react';
import axiosInstance from '@/lib/axios';
import { toast } from '@/components/ui/use-toast';

// 1. Updated Interface for Schedule Data
interface FormData {
  // --- General Info ---
  date: string;
  startTime: string;
  endTime: string;
  timeInMinutes: string | number;
  travelTime: string | number;
  
  // --- People & Location ---
  employee: string;
  serviceUser: string;
  branch: string;
  area: string;

  // --- Service Details ---
  serviceType: string;
  visitType: string;
  serviceFunder: string;

  // --- Rates ---
  payRate: string | number;
  invoiceRate: string | number;

  // --- Summary/Status ---
  cancellation: string;
  status: string;

  // --- Admin/Equipment ---
  purchaseOrder: boolean;
  glovesAprons: boolean;
  uniform: boolean;
  idBadge: boolean;

  // --- Dynamic Arrays (Index-wise objects) ---
  expenses: any[];
  tags: any[];
  breaks: any[];
  notes: any[];
  logs: any[];

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

export const useEditApplicant = (scheduleData?: any, 
  onScheduleUpdate?: (updatedFields: any) => void) => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [isFieldSaving, setIsFieldSaving] = useState<Record<string, boolean>>({});

  // 2. Initial State aligned with Schedule Schema
  const [formData, setFormData] = useState<FormData>({
    date: '',
    startTime: '',
    endTime: '',
    timeInMinutes: '',
    travelTime: '',
    employee: '',
    serviceUser: '',
    branch: '',
    area: '',
    serviceType: '',
    visitType: '',
    serviceFunder: '',
    payRate: '',
    invoiceRate: '',
    cancellation: '',
    status: '',
    purchaseOrder: false,
    glovesAprons: false,
    uniform: false,
    idBadge: false,
    expenses: [],
    tags: [],
    breaks: [],
    notes: [],
    logs: [],
  });

  // 3. Prefill Logic
  useEffect(() => {
    if (scheduleData) {
      setFormData((prev) => ({
        ...prev,
        ...scheduleData,
        // Safe mapping for Date
        date: scheduleData.date ? String(scheduleData.date).split('T')[0] : prev.date,
        
        // Handle IDs if objects are passed (Population handling)
        employee: typeof scheduleData.employee === 'object' ? scheduleData.employee?._id : scheduleData.employee,
        serviceUser: typeof scheduleData.serviceUser === 'object' ? scheduleData.serviceUser?._id : scheduleData.serviceUser,
        serviceFunder: typeof scheduleData.serviceFunder === 'object' ? scheduleData.serviceFunder?._id : scheduleData.serviceFunder,
        
        // Ensure arrays exist
        expenses: scheduleData.expenses || [],
        tags: scheduleData.tags || [],
        breaks: scheduleData.breaks || [],
        notes: scheduleData.notes || [],
      }));
    }
  }, [scheduleData]);

  // 4. The "Rulebook": Define Required Fields per Tab
  const requiredFieldsByTab = {
    general: [
      { field: 'date', label: 'Date' },
      { field: 'startTime', label: 'Start Time' },
      { field: 'endTime', label: 'End Time' },
      { field: 'timeInMinutes', label: 'Time (Minutes)' },
      { field: 'travelTime', label: 'Travel Time' },

      { field: 'branch', label: 'Branch' },
      { field: 'area', label: 'Area' },
      { field: 'serviceUser', label: 'Service User' },
      { field: 'serviceFunder', label: 'Funder' },

      { field: 'employeeBranch', label: 'Employee Branch' },
      { field: 'employeeArea', label: 'Employee Area' },
      { field: 'employee', label: 'Employee' },

      { field: 'serviceType', label: 'Service Type' },
      { field: 'visitType', label: 'Visit Type' },
      { field: 'payRate', label: 'Pay Rate' },
      { field: 'invoiceRate', label: 'Invoice Rate' }
    ],
    // Index-wise Arrays
    expense: [
      { field: 'expenseType', label: 'Expense Type' },
      { field: 'payAmount', label: 'Pay Amount' }
    ],
    tag: [
      { field: 'tag', label: 'Tag' },
      { field: 'deliveryOption', label: 'Delivery Option' }
    ],
    break: [
      { field: 'startDate', label: 'Start Date' },
      { field: 'startTime', label: 'Start Time' },
      { field: 'endTime', label: 'End Time' },
      { field: 'type', label: 'Type' }
    ],
    // Other tabs
    equipment: [],
    dayOnOff: [
          { field: 'plannedDate', label: 'Planned Date' },
      { field: 'actualDate', label: 'Actual Date' },
      { field: 'plannedStartTime', label: 'Start Time' },
      { field: 'actualEndTime', label: 'End Time' },
      { field: 'duration', label: 'Duration' }
    ],
    note: [],
    po: [],
    logs: []
  };

 

  // 5. "The Judge": Check for missing values
  const getMissingFields = (
    tab: keyof typeof requiredFieldsByTab,
    currentFormData: Record<string, any>
  ) => {
    // For normal fields
    const fields = requiredFieldsByTab[tab] || [];
    return fields
      .filter(({ field }) => {
        // Skip validation if we are looking at array tabs (handled in validateTab)
        if (['expense', 'tag', 'break'].includes(tab)) return false; 
        
        const val = currentFormData[field];
        return val === null || val === undefined || String(val).trim() === '';
      })
      .map(({ field }) => field);
  };

  const validateTab = (tabId: string): ValidationResult => {
    const missingFields: string[] = [];

    // --- A. Handle Array/Index-Wise Tabs ---

    if (tabId === 'expense') {
      formData.expenses?.forEach((item: any, index: number) => {
        requiredFieldsByTab.expense.forEach(({ field }) => {
          const val = item[field];
          if (val === null || val === undefined || String(val).trim() === '') {
            // Format: fieldName[index] -> e.g., "expenseType[0]"
            missingFields.push(`${field}[${index}]`);
          }
        });
      });
      return { isValid: missingFields.length === 0, missingFields };
    }

    if (tabId === 'tag') {
      formData.tags?.forEach((item: any, index: number) => {
        requiredFieldsByTab.tag.forEach(({ field }) => {
          const val = item[field];
          if (val === null || val === undefined || String(val).trim() === '') {
             // Format: tag[0]
            missingFields.push(`${field}[${index}]`);
          }
        });
      });
      return { isValid: missingFields.length === 0, missingFields };
    }

    if (tabId === 'break') {
      formData.breaks?.forEach((item: any, index: number) => {
        requiredFieldsByTab.break.forEach(({ field }) => {
          const val = item[field];
          if (val === null || val === undefined || String(val).trim() === '') {
             // Format: startTime[0]
            missingFields.push(`${field}[${index}]`);
          }
        });
      });
      return { isValid: missingFields.length === 0, missingFields };
    }

    // --- B. Handle Standard Tabs ---
    const requiredFields = requiredFieldsByTab[tabId as keyof typeof requiredFieldsByTab] || [];
    
    requiredFields.forEach(({ field }) => {
      const value = formData[field];
      const isValid = value !== null && value !== undefined && String(value).trim() !== '';
      
      if (!isValid) {
        missingFields.push(field);
      }
    });

    return {
      isValid: missingFields.length === 0,
      missingFields
    };
  };

  // 6. Expose Validation State
  const getTabValidation = (): TabValidation => {
    const validation: TabValidation = {};
    Object.keys(requiredFieldsByTab).forEach((tabId) => {
      validation[tabId] = validateTab(tabId);
    });
    return validation;
  };

  // 7. API Logic (Patch Request)
  const saveFieldToBackend = async (field: string, value: any) => {
    // Optimistic Update
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    if (!scheduleData?._id) return;

    setIsFieldSaving((prev) => ({ ...prev, [field]: true }));

    try {
      await axiosInstance.patch(`/schedules/${scheduleData._id}`, {
        [field]: value
      });

      if (onScheduleUpdate) {
        onScheduleUpdate({ _id: formData._id, [field]: value });
      }
    } catch (error: any) {
      console.error(`Failed to update ${field}:`, error);
      toast({ 
        title: "Update Failed", 
        description: error.response?.data?.message || `Could not save ${field}`, 
        variant: "destructive" 
      });
    } finally {
      setIsFieldSaving((prev) => ({ ...prev, [field]: false }));
    }
  };

  // --- Handlers ---

  const handleFieldUpdate = async (field: string, value: any) => {
    await saveFieldToBackend(field, value);
  };

  const handleDateChange = async (field: string, value: string) => {
    await saveFieldToBackend(field, value);
  };

  const handleSelectChange = async (field: string, value: string) => {
    await saveFieldToBackend(field, value);
  };

  const handleCheckboxChange = async (field: string, value: boolean) => {
    await saveFieldToBackend(field, value);
  };

  // --- New: Array Handler (Crucial for Expense/Tag/Break updates) ---
  const handleArrayUpdate = async (
    arrayName: 'expenses' | 'tags' | 'breaks' | 'notes', 
    index: number, 
    field: string, 
    value: any
  ) => {
    const currentArray = [...formData[arrayName]];
    
    // Update the specific item in the array
    currentArray[index] = {
      ...currentArray[index],
      [field]: value
    };

    // Save the ENTIRE array to the backend (Standard Mongoose Patch)
    await saveFieldToBackend(arrayName, currentArray);
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
    handleArrayUpdate, // Exporting this for your Tabs to use
    isFieldSaving,
    getTabValidation,
    validateTab,
    requiredFieldsByTab,
    getMissingFields
  };
};