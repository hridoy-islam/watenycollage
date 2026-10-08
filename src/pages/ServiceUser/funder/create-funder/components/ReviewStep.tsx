import React from 'react';
import { useFormContext } from 'react-hook-form';
import { ServiceFunderFormData } from './validation';
import {
  User,
  MapPin,
  Phone,
  Briefcase,
  FileText,
  User2,
  UserCircleIcon,
  Globe,
  Calendar,
  FileInput,
} from 'lucide-react';

// 📅 Helper to format ISO date string to dd-MM-yyyy
const formatDate = (isoString: string): string => {
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return isoString; // fallback if invalid

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // months are 0-indexed
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
};

// 🔠 Helper to smart-format any value for display
const formatValue = (value: any): string => {
  if (value === null || value === undefined || value === '') {
    return '';
  }

  // Handle boolean → Yes/No
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }

  // Handle ISO date strings
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z?$/.test(value)) {
    return formatDate(value);
  }

  // Handle react-select object: { value: 'abc', label: 'Abc' }
  if (typeof value === 'object' && value !== null) {
    if (value.label) return capitalizeWords(value.label);
    if (value.value) return capitalizeWords(value.value);
    return String(value); // fallback
  }

  // Capitalize string values
  if (typeof value === 'string') {
    return capitalizeWords(value);
  }

  // Fallback: convert anything else to string
  return String(value);
};

// 🔤 Capitalizes first letter of each word
const capitalizeWords = (str: string): string => {
  return str
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const ReviewStep: React.FC = () => {
  const { watch } = useFormContext<ServiceFunderFormData>();
  const formData = watch();

  const sections = [
    {
      title: 'Personal Information',
      icon: User,
      fields: [
        { label: 'Type', value: formData.type },
        { label: 'Title', value: formData.title },
        { label: 'First Name', value: formData.firstName },
        { label: 'Middle Initial', value: formData.middleInitial?.toUpperCase() }, // Keep uppercase for initials
        { label: 'Last Name', value: formData.lastName },
        { label: 'Description', value: formData.description },
      ]
    },
    {
      title: 'Equality',
      icon: UserCircleIcon,
      fields: [
        { label: 'Gender', value: formData.gender },
        { label: 'Marital Status', value: formData.maritalStatus },
        { label: 'Ethnic Origin', value: formData.ethnicOrigin },
        { label: 'Religion', value: formData.religion }
      ]
    },
    {
      title: 'Address & Location',
      icon: MapPin,
      fields: [
        { label: 'Address', value: formData.address },
        { label: 'City', value: formData.city },
        { label: 'Country', value: formData.country },
        { label: 'Post Code', value: formData.postCode?.toUpperCase() }, // Postcode always uppercase
        { label: 'Area', value: formData.area },
        { label: 'Branch', value: formData.branch }
      ]
    },
    {
      title: 'Contact Information',
      icon: Phone,
      fields: [
        { label: 'Phone', value: formData.phone },
        { label: 'Fax', value: formData.fax },
        { label: 'Mobile', value: formData.mobile },
        { label: 'Other', value: formData.other },
        { label: 'Email', value: formData.email },
        { label: 'Website', value: formData.website }
      ]
    },
    {
      title: 'Employment / Service Details',
      icon: Briefcase,
      fields: [
        { label: 'Start Date', value: formData.startDate },
        { label: 'Status', value: formData.status },
        { label: 'Travel Type', value: formData.travelType },
        {
          label: 'Purchase Order Required',
          value: typeof formData.purchaseOrder === 'boolean'
            ? formData.purchaseOrder
              ? 'Yes'
              : 'No'
            : formData.purchaseOrder
        }
      ]
    },
    {
      title: 'Invoice Details',
      icon: FileText,
      fields: [
        {
          label: 'Linked',
          value: typeof formData.invoice?.linked === 'boolean'
            ? formData.invoice.linked
              ? 'Yes'
              : 'No'
            : formData.invoice?.linked
        },
        { label: 'Type', value: formData.invoice?.type },
        { label: 'Name', value: formData.invoice?.name },
        { label: 'Address', value: formData.invoice?.address },
        { label: 'City / Town', value: formData.invoice?.cityTown },
        { label: 'County', value: formData.invoice?.county },
        { label: 'Post Code', value: formData.invoice?.postCode?.toUpperCase() },
        { label: 'Customer External ID', value: formData.invoice?.customerExternalId },
        { label: 'Invoice Run', value: formData.invoice?.invoiceRun },
        { label: 'Invoice Format', value: formData.invoice?.invoiceFormat },
        { label: 'Invoice Grouping', value: formData.invoice?.invoiceGrouping },
        { label: 'Phone', value: formData.invoice?.phone },
        { label: 'Fax', value: formData.invoice?.fax },
        { label: 'Mobile', value: formData.invoice?.mobile },
        { label: 'Other', value: formData.invoice?.other },
        { label: 'Email', value: formData.invoice?.email },
        { label: 'Website', value: formData.invoice?.website }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {sections.map((section, index) => {
        const Icon = section.icon;
        const hasData = section.fields.some((field) => {
          const val = field.value;
          return val !== null && val !== undefined && val !== '';
        });

        if (!hasData) return null;

        return (
          <div key={index} className="rounded-lg bg-gray-50 p-6">
            <div className="mb-4 flex items-center">
              <div className="mr-3 rounded-lg bg-blue-100 p-2">
                <Icon className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                {section.title}
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {section.fields.map((field, fieldIndex) => {
                const displayValue = formatValue(field.value);

                if (!displayValue) return null;

                return (
                  <div
                    key={fieldIndex}
                    className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm"
                  >
                    <dt className="text-xs font-semibold text-gray-500 tracking-wide uppercase mb-1">
                      {field.label}
                    </dt>
                    <dd className="text-sm font-medium text-gray-900 break-words">
                      {displayValue}
                    </dd>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};