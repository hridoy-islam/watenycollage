import React from 'react';
import { EditableField } from '../components/EditableField';
import { countries } from '@/types';
import { Button } from '@/components/ui/button';
import { Trash } from 'lucide-react';

interface EmergencyContact {
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
  emailRota: boolean;
  sendInvoice: boolean;
}

interface EmergencyContactTabProps {
  formData: any;
  onUpdate: (field: string, value: any) => void;
  isFieldSaving: Record<string, boolean>;
  getMissingFields: (tab: string, formData: Record<string, any>) => string[];
}

const EmergencyContactTab: React.FC<EmergencyContactTabProps> = ({
  formData,
  onUpdate,
  isFieldSaving,
  getMissingFields
}) => {
  const contacts: EmergencyContact[] = formData.emergencyContacts || [];

  const booleanOptions = [
    { value: true, label: 'Yes' },
    { value: false, label: 'No' }
  ];

  const relationshipOptions = [
    { value: 'Parent', label: 'Parent' },
    { value: 'Spouse', label: 'Spouse' },
    { value: 'Sibling', label: 'Sibling' },
    { value: 'Child', label: 'Child' },
    { value: 'Friend', label: 'Friend' },
    { value: 'Other', label: 'Other' }
  ];

  const countryOptions = countries.map((country) => ({
    value: country,
    label: country
  }));

  const updateContactField = <K extends keyof EmergencyContact>(
    index: number,
    field: K,
    value: EmergencyContact[K]
  ) => {
    const updated = [...contacts];
    updated[index][field] = value;
    onUpdate('emergencyContacts', updated);
  };

  const addNewContact = () => {
    const updated = [
      ...contacts,
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
    ];
    onUpdate('emergencyContacts', updated);
  };

  // ✅ Updated remove function with check
  const removeContact = (index: number) => {
    if (contacts.length <= 1) return; // Prevent deletion if only 1 item exists

    const updated = contacts.filter((_, i) => i !== index);
    onUpdate('emergencyContacts', updated);
  };

  const missingFields = getMissingFields('emergency', formData);

  const isFieldMissing = (index: number, field: keyof EmergencyContact) => {
    return missingFields.includes(`${field}[${index}]`);
  };

  return (
    <div className="space-y-2">
      <h1 className="text-xl font-semibold text-gray-900">Emergency Contact</h1>

      {contacts.map((contact, index) => (
        <div
          key={index}
          className="rounded-lg border border-gray-300 bg-white p-6 shadow-sm"
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Emergency Contact #{index + 1}
            </h3>

            {/* ✅ Button is now disabled if length is 1 */}
            <Button
              type="button"
              variant="destructive"
              size="icon"
              onClick={() => removeContact(index)}
              disabled={contacts.length <= 1} 
              title={contacts.length <= 1 ? "At least one contact is required" : "Remove contact"}
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <EditableField
              id={`emergencyContactName-${index}`}
              label="Name"
              value={contact.emergencyContactName}
              type="text"
              onUpdate={(val) =>
                updateContactField(index, 'emergencyContactName', val)
              }
              required
              isSaving={isFieldSaving[`emergencyContactName[${index}]`]}
              isMissing={isFieldMissing(index, 'emergencyContactName')}
            />

            <EditableField
              id={`relationship-${index}`}
              label="Relationship"
              value={contact.relationship}
              type="select"
              options={relationshipOptions}
              onUpdate={(val) => updateContactField(index, 'relationship', val)}
              required
              isSaving={isFieldSaving[`relationship[${index}]`]}
              isMissing={isFieldMissing(index, 'relationship')}
            />

            <EditableField
              id={`address-${index}`}
              label="Address"
              value={contact.address}
              type="text"
              onUpdate={(val) => updateContactField(index, 'address', val)}
              isSaving={isFieldSaving[`address[${index}]`]}
            />

            <EditableField
              id={`cityOrTown-${index}`}
              label="City / Town"
              value={contact.cityOrTown}
              type="text"
              onUpdate={(val) => updateContactField(index, 'cityOrTown', val)}
              isSaving={isFieldSaving[`cityOrTown[${index}]`]}
            />

            <EditableField
              id={`country-${index}`}
              label="Country"
              value={contact.country}
              type="select"
              options={countryOptions}
              onUpdate={(val) => updateContactField(index, 'country', val)}
              isSaving={isFieldSaving[`country[${index}]`]}
            />

            <EditableField
              id={`postCode-${index}`}
              label="Post Code"
              value={contact.postCode}
              type="text"
              onUpdate={(val) => updateContactField(index, 'postCode', val)}
              isSaving={isFieldSaving[`postCode[${index}]`]}
            />

            <EditableField
              id={`note-${index}`}
              label="Note"
              value={contact.note}
              type="text"
              onUpdate={(val) => updateContactField(index, 'note', val)}
              isSaving={isFieldSaving[`note[${index}]`]}
            />

            <EditableField
              id={`phone-${index}`}
              label="Phone"
              value={contact.phone}
              type="text"
              onUpdate={(val) => updateContactField(index, 'phone', val)}
              isSaving={isFieldSaving[`phone[${index}]`]}
            />

            <EditableField
              id={`mobile-${index}`}
              label="Mobile"
              value={contact.mobile}
              type="text"
              onUpdate={(val) => updateContactField(index, 'mobile', val)}
              isSaving={isFieldSaving[`mobile[${index}]`]}
            />

            <EditableField
              id={`email-${index}`}
              label="Email"
              value={contact.email}
              type="email"
              onUpdate={(val) => updateContactField(index, 'email', val)}
              isSaving={isFieldSaving[`email[${index}]`]}
            />

            <EditableField
              id={`emailRota-${index}`}
              label="Email Rota"
              value={contact.emailRota}
              type="select"
              options={booleanOptions}
              onUpdate={(val) => updateContactField(index, 'emailRota', val)}
              isSaving={isFieldSaving[`emailRota[${index}]`]}
            />

            <EditableField
              id={`sendInvoice-${index}`}
              label="Send Invoice"
              value={contact.sendInvoice}
              type="select"
              options={booleanOptions}
              onUpdate={(val) => updateContactField(index, 'sendInvoice', val)}
              isSaving={isFieldSaving[`sendInvoice[${index}]`]}
            />
          </div>
        </div>
      ))}

      <div className="flex justify-end">
        <Button
          onClick={addNewContact}
          className="rounded bg-watney px-4 py-2 text-white hover:bg-watney/90"
        >
          Add More
        </Button>
      </div>
    </div>
  );
};

export default EmergencyContactTab;