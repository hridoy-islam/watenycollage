import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '@/lib/axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {
  ArrowLeft,
  User,
  Stethoscope,
  Briefcase,
  ChevronRight,
  ChevronLeft,
  Save,
  X,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type ContractType = 'GP' | 'Personal' | 'Professional';
type ContactStatus = 'Priority' | 'Secondary' | 'Do not contact';
type FamilyAppAccess = 'yes' | 'no';

interface FormData {
  // General Information
  firstName: string;
  lastName: string;
  fullName: string;
  relationship: string;
  organization: string;
  speciality: string;
  observation: string;
  isUnpaidCarer: boolean;
  isNextOfKin: boolean;
  isDependant: boolean;

  // Legal details (Personal & Professional)
  isProxyForSubjectOfCare: boolean;
  lpaHealthAndWellbeing: boolean;
  lpaFinancial: boolean;
  lpaDateAppointed: Date | null;
  lpaFormLocation: string;

  // Contact details (Personal & Professional)
  postcode: string;
  address: string;
  telephone1: string;
  telephone2: string;
  email: string;
  contactStatusPriority: boolean;
  contactStatusSecondary: boolean;
  contactStatusDoNotContact: boolean;
  contactableTimes: string;

  // Family app status (Personal & Professional)
  familyAppAccessYes: boolean;
  familyAppAccessNo: boolean;
  familyAppAccessJustification: string;

  // GP specific
  gpPracticeCode: string;
  gpPracticeName: string;
  gpBuildingName: string;
  gpAddressLine1: string;
  gpAddressLine2: string;
  gpTownCity: string;
  gpCountry: string;
  gpPostcode: string;
  gpPhoneNumber: string;
  gpEmail: string;

  // Professional specific
  professionalType: string;
  professionalRegistrationNumber: string;
  regulatoryBody: string;

  note: string;
}

const emptyForm: FormData = {
  firstName: '',
  lastName: '',
  fullName: '',
  relationship: '',
  organization: '',
  speciality: '',
  observation: '',
  isUnpaidCarer: false,
  isNextOfKin: false,
  isDependant: false,

  isProxyForSubjectOfCare: false,
  lpaHealthAndWellbeing: false,
  lpaFinancial: false,
  lpaDateAppointed: null,
  lpaFormLocation: '',

  postcode: '',
  address: '',
  telephone1: '',
  telephone2: '',
  email: '',
  contactStatusPriority: false,
  contactStatusSecondary: false,
  contactStatusDoNotContact: false,
  contactableTimes: '',

  familyAppAccessYes: false,
  familyAppAccessNo: false,
  familyAppAccessJustification: '',

  gpPracticeCode: '',
  gpPracticeName: '',
  gpBuildingName: '',
  gpAddressLine1: '',
  gpAddressLine2: '',
  gpTownCity: '',
  gpCountry: '',
  gpPostcode: '',
  gpPhoneNumber: '',
  gpEmail: '',

  professionalType: '',
  professionalRegistrationNumber: '',
  regulatoryBody: '',

  note: ''
};

const contractTypeMeta: Record<
  ContractType,
  { label: string; icon: React.ReactNode; description: string }
> = {
  GP: {
    label: 'GP',
    icon: <Stethoscope className="h-8 w-8" />,
    description: 'General practitioner or medical practice'
  },
  Personal: {
    label: 'Personal',
    icon: <User className="h-8 w-8" />,
    description: 'Family member, friend, or personal contact'
  },
  Professional: {
    label: 'Professional',
    icon: <Briefcase className="h-8 w-8" />,
    description: 'Healthcare professional or service provider'
  }
};

const RELATIONSHIP_OPTIONS = [
  'Spouse',
  'Partner',
  'Parent',
  'Child',
  'Sibling',
  'Friend',
  'Neighbour',
  'Other'
];

// ─────────────────────────────────────────────────────────────────
// IMPORTANT: These components live OUTSIDE CreateEmergencyContractPage.
// If they were defined inside the component (as they originally were),
// React would treat them as brand-new component types on every
// keystroke/state update, unmounting and remounting the entire form
// subtree each time — which is what caused focus loss and the page
// jumping/scrolling to the submit button while typing.
// ─────────────────────────────────────────────────────────────────

const CustomDateInput = ({
  value,
  onClick
}: {
  value?: string;
  onClick?: () => void;
}) => (
  <div className="relative">
    <Input
      value={value}
      onClick={onClick}
      readOnly
      placeholder="Select date"
      className="cursor-pointer border-gray-200 pr-10 text-black"
    />
    <Calendar className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
  </div>
);

function FormSection({
  title,
  description,
  children,
  className = ''
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={`border-0 shadow-none ${className}`}>
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-semibold text-black">
          {title}
        </CardTitle>
        {description && (
          <CardDescription className="text-sm text-black">
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-6">{children}</CardContent>
    </Card>
  );
}

function FormField({
  label,
  htmlFor,
  required = false,
  children
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor} className="text-sm font-medium text-black">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </Label>
      {children}
    </div>
  );
}

export default function CreateEmergencyContractPage() {
  const { sid } = useParams<{ sid: string }>();
  const navigate = useNavigate();
  const [step, setStep] = useState<'type' | 'form'>('type');
  const [selectedType, setSelectedType] = useState<ContractType | null>(null);
  const [formData, setFormData] = useState<FormData>(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTypeSelect = (type: ContractType) => {
    setSelectedType(type);
    setStep('form');
    // Scroll to top when entering form view
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const updateField = <K extends keyof FormData>(
    field: K,
    value: FormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const getContactStatus = (): ContactStatus | '' => {
    if (formData.contactStatusPriority) return 'Priority';
    if (formData.contactStatusSecondary) return 'Secondary';
    if (formData.contactStatusDoNotContact) return 'Do not contact';
    return '';
  };

  const getFamilyAppAccess = (): FamilyAppAccess | '' => {
    if (formData.familyAppAccessYes) return 'yes';
    if (formData.familyAppAccessNo) return 'no';
    return '';
  };

  const handleContactStatusChange = (status: ContactStatus) => {
    updateField('contactStatusPriority', status === 'Priority');
    updateField('contactStatusSecondary', status === 'Secondary');
    updateField('contactStatusDoNotContact', status === 'Do not contact');
  };

  const handleFamilyAppAccessChange = (access: FamilyAppAccess) => {
    updateField('familyAppAccessYes', access === 'yes');
    updateField('familyAppAccessNo', access === 'no');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sid || !selectedType) return;
    setIsSubmitting(true);

    try {
      const payload: Record<string, unknown> = {
        serviceUserId: sid,
        contractType: selectedType,
        note: formData.note
      };

      if (selectedType === 'GP') {
        Object.assign(payload, {
          fullName: formData.fullName,
          gpPracticeCode: formData.gpPracticeCode,
          gpPracticeName: formData.gpPracticeName,
          gpBuildingName: formData.gpBuildingName,
          gpAddressLine1: formData.gpAddressLine1,
          gpAddressLine2: formData.gpAddressLine2,
          gpTownCity: formData.gpTownCity,
          gpCountry: formData.gpCountry,
          gpPostcode: formData.gpPostcode,
          gpEmail: formData.gpEmail,
          gpPhoneNumber: formData.gpPhoneNumber
        });
      } else {
        Object.assign(payload, {
          firstName: formData.firstName,
          lastName: formData.lastName,
          observation: formData.observation,

          isProxyForSubjectOfCare: formData.isProxyForSubjectOfCare,
          lpaHealthAndWellbeing: formData.lpaHealthAndWellbeing,
          lpaFinancial: formData.lpaFinancial,
          lpaDateAppointed: formData.lpaDateAppointed
            ? new Date(
                Date.UTC(
                  formData.lpaDateAppointed.getFullYear(),
                  formData.lpaDateAppointed.getMonth(),
                  formData.lpaDateAppointed.getDate()
                )
              ).toISOString()
            : undefined,
          lpaFormLocation: formData.lpaFormLocation,

          postcode: formData.postcode,
          address: formData.address,
          telephone1: formData.telephone1,
          telephone2: formData.telephone2,
          email: formData.email,
          contactStatus: getContactStatus() || undefined,
          contactableTimes: formData.contactableTimes,

          familyAppAccess: getFamilyAppAccess() === 'yes',
          familyAppAccessJustification: formData.familyAppAccessJustification
        });

        if (selectedType === 'Personal') {
          Object.assign(payload, {
            relationship: formData.relationship,
            isUnpaidCarer: formData.isUnpaidCarer,
            isNextOfKin: formData.isNextOfKin,
            isDependant: formData.isDependant
          });
        }

        if (selectedType === 'Professional') {
          Object.assign(payload, {
            professionalType: formData.professionalType,
            organization: formData.organization,
            speciality: formData.speciality
          });
        }
      }

      await axiosInstance.post('/serviceuser-emergency-contract', payload);
      navigate(-1);
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderLegalDetails = () => (
    <FormSection
      title="Legal Details"
      description="Legal authority and documentation"
    >
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Checkbox
            id="isProxyForSubjectOfCare"
            checked={formData.isProxyForSubjectOfCare}
            onCheckedChange={(checked) =>
              updateField('isProxyForSubjectOfCare', checked === true)
            }
          />
          <Label
            htmlFor="isProxyForSubjectOfCare"
            className="cursor-pointer text-sm text-black"
          >
            Proxy for Subject of Care
          </Label>
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-medium text-black">
            Lasting Power of Attorney
          </Label>
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <Checkbox
                id="lpaHealthAndWellbeing"
                checked={formData.lpaHealthAndWellbeing}
                onCheckedChange={(checked) =>
                  updateField('lpaHealthAndWellbeing', checked === true)
                }
              />
              <Label
                htmlFor="lpaHealthAndWellbeing"
                className="cursor-pointer text-sm text-black"
              >
                Health and wellbeing
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="lpaFinancial"
                checked={formData.lpaFinancial}
                onCheckedChange={(checked) =>
                  updateField('lpaFinancial', checked === true)
                }
              />
              <Label
                htmlFor="lpaFinancial"
                className="cursor-pointer text-sm text-black"
              >
                Financial
              </Label>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label
              htmlFor="lpaDateAppointed"
              className="text-sm font-medium text-black w-full"
            >
              LPA Date Appointed
            </Label>
            <DatePicker
              selected={formData.lpaDateAppointed}
              onChange={(date: Date | null) =>
                updateField('lpaDateAppointed', date)
              }
              dateFormat="dd/MM/yyyy"
              customInput={<CustomDateInput />}
              placeholderText="Select date"
              className="w-full"
              wrapperClassName="w-full"
              popperPlacement="bottom-start"
              showMonthDropdown
              showYearDropdown
              dropdownMode='select'
              preventOpenOnFocus={false}
              onFocus={(e) => {
                // Prevent scroll into view
                e.preventDefault();
              }}
            />
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="lpaFormLocation"
              className="text-sm font-medium text-black"
            >
              LPA Form Location
            </Label>
            <Input
              id="lpaFormLocation"
              value={formData.lpaFormLocation}
              onChange={(e) => updateField('lpaFormLocation', e.target.value)}
              placeholder="Physical location of the form"
              className="border-gray-200 text-black"
            />
          </div>
        </div>
      </div>
    </FormSection>
  );

  const renderContactDetails = () => (
    <FormSection
      title="Contact Details"
      description="Primary contact information"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField label="Postcode" htmlFor="postcode">
            <Input
              id="postcode"
              value={formData.postcode}
              onChange={(e) => updateField('postcode', e.target.value)}
              placeholder="Enter postcode"
              className="border-gray-200 text-black"
            />
          </FormField>
          <FormField label="Address" htmlFor="address">
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => updateField('address', e.target.value)}
              placeholder="Enter address manually"
              className="border-gray-200 text-black"
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField label="Telephone 1" htmlFor="telephone1">
            <Input
              id="telephone1"
              type="tel"
              value={formData.telephone1}
              onChange={(e) => updateField('telephone1', e.target.value)}
              placeholder="Primary phone number"
              className="border-gray-200 text-black"
            />
          </FormField>
          <FormField label="Telephone 2" htmlFor="telephone2">
            <Input
              id="telephone2"
              type="tel"
              value={formData.telephone2}
              onChange={(e) => updateField('telephone2', e.target.value)}
              placeholder="Secondary phone number"
              className="border-gray-200 text-black"
            />
          </FormField>
        </div>

        <FormField label="Email address" htmlFor="email">
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => updateField('email', e.target.value)}
            placeholder="email@example.com"
            className="border-gray-200 text-black"
          />
        </FormField>

        <div className="space-y-3">
          <Label className="text-sm font-medium text-black">
            Contact status
          </Label>
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <Checkbox
                id="contactStatusPriority"
                checked={formData.contactStatusPriority}
                onCheckedChange={(checked) => {
                  if (checked) {
                    handleContactStatusChange('Priority');
                  } else {
                    updateField('contactStatusPriority', false);
                  }
                }}
              />
              <Label
                htmlFor="contactStatusPriority"
                className="cursor-pointer text-sm text-black"
              >
                Priority
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="contactStatusSecondary"
                checked={formData.contactStatusSecondary}
                onCheckedChange={(checked) => {
                  if (checked) {
                    handleContactStatusChange('Secondary');
                  } else {
                    updateField('contactStatusSecondary', false);
                  }
                }}
              />
              <Label
                htmlFor="contactStatusSecondary"
                className="cursor-pointer text-sm text-black"
              >
                Secondary
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="contactStatusDoNotContact"
                checked={formData.contactStatusDoNotContact}
                onCheckedChange={(checked) => {
                  if (checked) {
                    handleContactStatusChange('Do not contact');
                  } else {
                    updateField('contactStatusDoNotContact', false);
                  }
                }}
              />
              <Label
                htmlFor="contactStatusDoNotContact"
                className="cursor-pointer text-sm text-black"
              >
                Do not contact
              </Label>
            </div>
          </div>
        </div>

        <FormField label="Contactable times" htmlFor="contactableTimes">
          <Textarea
            id="contactableTimes"
            value={formData.contactableTimes}
            onChange={(e) => updateField('contactableTimes', e.target.value)}
            rows={2}
            placeholder="e.g., Monday-Friday 9am-5pm"
            className="border-gray-200 text-black"
          />
        </FormField>
      </div>
    </FormSection>
  );

  const renderFamilyAppStatus = () => (
    <FormSection
      title="Family App Status"
      description="Access permissions for family application"
    >
      <div className="space-y-6">
        <div className="space-y-3">
          <Label className="text-sm font-medium text-black">Access</Label>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Checkbox
                id="familyAppAccessYes"
                checked={formData.familyAppAccessYes}
                onCheckedChange={(checked) => {
                  if (checked) {
                    handleFamilyAppAccessChange('yes');
                  } else {
                    updateField('familyAppAccessYes', false);
                  }
                }}
              />
              <Label
                htmlFor="familyAppAccessYes"
                className="cursor-pointer text-sm text-black"
              >
                Yes
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="familyAppAccessNo"
                checked={formData.familyAppAccessNo}
                onCheckedChange={(checked) => {
                  if (checked) {
                    handleFamilyAppAccessChange('no');
                  } else {
                    updateField('familyAppAccessNo', false);
                  }
                }}
              />
              <Label
                htmlFor="familyAppAccessNo"
                className="cursor-pointer text-sm text-black"
              >
                No
              </Label>
            </div>
          </div>
          <p className="text-xs italic text-black">
            This decision should always be in the service user's best interests
            if they cannot make it themselves. If no is selected, you will not
            be able to send an invite.
          </p>
        </div>

        <FormField
          label="Justification of decision"
          htmlFor="familyAppAccessJustification"
        >
          <Textarea
            id="familyAppAccessJustification"
            value={formData.familyAppAccessJustification}
            onChange={(e) =>
              updateField('familyAppAccessJustification', e.target.value)
            }
            rows={3}
            placeholder="Please provide justification for this decision..."
            className="border-gray-200 text-black"
          />
        </FormField>
      </div>
    </FormSection>
  );

  const renderGPForm = () => (
    <>
      <FormSection
        title="General Information"
        description="Doctor and practice details"
      >
        <div className="space-y-6">
          <FormField label="Doctor name" htmlFor="fullName" required>
            <Input
              id="fullName"
              value={formData.fullName}
              onChange={(e) => updateField('fullName', e.target.value)}
              placeholder="Enter doctor's full name"
              className="border-gray-200 text-black"
            />
          </FormField>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormField label="GP practice code" htmlFor="gpPracticeCode">
              <Input
                id="gpPracticeCode"
                value={formData.gpPracticeCode}
                onChange={(e) => updateField('gpPracticeCode', e.target.value)}
                placeholder="Practice code"
                className="border-gray-200 text-black"
              />
            </FormField>
            <FormField label="Surgery / Practice name" htmlFor="gpPracticeName">
              <Input
                id="gpPracticeName"
                value={formData.gpPracticeName}
                onChange={(e) => updateField('gpPracticeName', e.target.value)}
                placeholder="Practice name"
                className="border-gray-200 text-black"
              />
            </FormField>
          </div>
        </div>
      </FormSection>

      <FormSection
        title="Practice Address"
        description="Surgery or practice location"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormField label="Building name" htmlFor="gpBuildingName">
              <Input
                id="gpBuildingName"
                value={formData.gpBuildingName}
                onChange={(e) => updateField('gpBuildingName', e.target.value)}
                placeholder="Building name"
                className="border-gray-200 text-black"
              />
            </FormField>
            <FormField label="Address line 1" htmlFor="gpAddressLine1">
              <Input
                id="gpAddressLine1"
                value={formData.gpAddressLine1}
                onChange={(e) => updateField('gpAddressLine1', e.target.value)}
                placeholder="Street address"
                className="border-gray-200 text-black"
              />
            </FormField>
            <FormField label="Address line 2" htmlFor="gpAddressLine2">
              <Input
                id="gpAddressLine2"
                value={formData.gpAddressLine2}
                onChange={(e) => updateField('gpAddressLine2', e.target.value)}
                placeholder="Address line 2"
                className="border-gray-200 text-black"
              />
            </FormField>
            <FormField label="Town / City" htmlFor="gpTownCity">
              <Input
                id="gpTownCity"
                value={formData.gpTownCity}
                onChange={(e) => updateField('gpTownCity', e.target.value)}
                placeholder="Town or city"
                className="border-gray-200 text-black"
              />
            </FormField>
            <FormField label="Country" htmlFor="gpCountry">
              <Input
                id="gpCountry"
                value={formData.gpCountry}
                onChange={(e) => updateField('gpCountry', e.target.value)}
                placeholder="Country"
                className="border-gray-200 text-black"
              />
            </FormField>
            <FormField label="Postcode" htmlFor="gpPostcode">
              <Input
                id="gpPostcode"
                value={formData.gpPostcode}
                onChange={(e) => updateField('gpPostcode', e.target.value)}
                placeholder="Postcode"
                className="border-gray-200 text-black"
              />
            </FormField>
          </div>
        </div>
      </FormSection>

      <FormSection
        title="Contact Information"
        description="How to reach the practice"
      >
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField label="Email address" htmlFor="gpEmail">
            <Input
              id="gpEmail"
              type="email"
              value={formData.gpEmail}
              onChange={(e) => updateField('gpEmail', e.target.value)}
              placeholder="practice@email.com"
              className="border-gray-200 text-black"
            />
          </FormField>
          <FormField label="Phone number" htmlFor="gpPhoneNumber">
            <Input
              id="gpPhoneNumber"
              type="tel"
              value={formData.gpPhoneNumber}
              onChange={(e) => updateField('gpPhoneNumber', e.target.value)}
              placeholder="Phone number"
              className="border-gray-200 text-black"
            />
          </FormField>
        </div>
      </FormSection>
    </>
  );

  const renderPersonalForm = () => (
    <>
      <FormSection
        title="Personal Information"
        description="Contact person details"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormField label="First Name" htmlFor="firstName" required>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => updateField('firstName', e.target.value)}
                placeholder="First name"
                className="border-gray-200 text-black"
              />
            </FormField>
            <FormField label="Last Name" htmlFor="lastName" required>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => updateField('lastName', e.target.value)}
                placeholder="Last name"
                className="border-gray-200 text-black"
              />
            </FormField>
          </div>

          <FormField
            label="Relationship / Role"
            htmlFor="relationship"
            required
          >
            <Select
              value={formData.relationship}
              onValueChange={(value) => updateField('relationship', value)}
            >
              <SelectTrigger
                id="relationship"
                className="border-gray-200 text-black"
              >
                <SelectValue placeholder="Select relationship" />
              </SelectTrigger>
              <SelectContent>
                {RELATIONSHIP_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <div className="space-y-3">
            <Label className="text-sm font-medium text-black">
              Roles & Responsibilities
            </Label>
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="isUnpaidCarer"
                  checked={formData.isUnpaidCarer}
                  onCheckedChange={(checked) =>
                    updateField('isUnpaidCarer', checked === true)
                  }
                />
                <Label
                  htmlFor="isUnpaidCarer"
                  className="cursor-pointer text-sm text-black"
                >
                  Unpaid Carer
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="isNextOfKin"
                  checked={formData.isNextOfKin}
                  onCheckedChange={(checked) =>
                    updateField('isNextOfKin', checked === true)
                  }
                />
                <Label
                  htmlFor="isNextOfKin"
                  className="cursor-pointer text-sm text-black"
                >
                  Next of Kin
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="isDependant"
                  checked={formData.isDependant}
                  onCheckedChange={(checked) =>
                    updateField('isDependant', checked === true)
                  }
                />
                <Label
                  htmlFor="isDependant"
                  className="cursor-pointer text-sm text-black"
                >
                  Dependant
                </Label>
              </div>
            </div>
          </div>

          <FormField
            label="Observation about this person"
            htmlFor="observation"
          >
            <Textarea
              id="observation"
              value={formData.observation}
              onChange={(e) => updateField('observation', e.target.value)}
              rows={3}
              placeholder="Any additional observations or notes..."
              className="border-gray-200 text-black"
            />
          </FormField>
        </div>
      </FormSection>

      {renderLegalDetails()}
      {renderContactDetails()}
      {renderFamilyAppStatus()}
    </>
  );

  const renderProfessionalForm = () => (
    <>
      <FormSection
        title="Professional Information"
        description="Healthcare professional details"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormField label="First Name" htmlFor="firstName" required>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => updateField('firstName', e.target.value)}
                placeholder="First name"
                className="border-gray-200 text-black"
              />
            </FormField>
            <FormField label="Last Name" htmlFor="lastName" required>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => updateField('lastName', e.target.value)}
                placeholder="Last name"
                className="border-gray-200 text-black"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormField label="Role" htmlFor="professionalType" required>
              <Input
                id="professionalType"
                value={formData.professionalType}
                onChange={(e) =>
                  updateField('professionalType', e.target.value)
                }
                placeholder="e.g., Doctor, Nurse, Social Worker"
                className="border-gray-200 text-black"
              />
            </FormField>
            <FormField label="Organisation" htmlFor="organization" required>
              <Input
                id="organization"
                value={formData.organization}
                onChange={(e) => updateField('organization', e.target.value)}
                placeholder="Organisation name"
                className="border-gray-200 text-black"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormField label="Speciality" htmlFor="speciality">
              <Input
                id="speciality"
                value={formData.speciality}
                onChange={(e) => updateField('speciality', e.target.value)}
                placeholder="Area of speciality"
                className="border-gray-200 text-black"
              />
            </FormField>
            <FormField
              label="Registration Number"
              htmlFor="professionalRegistrationNumber"
            >
              <Input
                id="professionalRegistrationNumber"
                value={formData.professionalRegistrationNumber}
                onChange={(e) =>
                  updateField('professionalRegistrationNumber', e.target.value)
                }
                placeholder="Professional registration number"
                className="border-gray-200 text-black"
              />
            </FormField>
          </div>

          <FormField label="Regulatory Body" htmlFor="regulatoryBody">
            <Input
              id="regulatoryBody"
              value={formData.regulatoryBody}
              onChange={(e) => updateField('regulatoryBody', e.target.value)}
              placeholder="e.g., GMC, NMC, HCPC"
              className="border-gray-200 text-black"
            />
          </FormField>

          <FormField
            label="Observation about this person"
            htmlFor="observation"
          >
            <Textarea
              id="observation"
              value={formData.observation}
              onChange={(e) => updateField('observation', e.target.value)}
              rows={3}
              placeholder="Any additional observations or notes..."
              className="border-gray-200 text-black"
            />
          </FormField>
        </div>
      </FormSection>

      {renderLegalDetails()}
      {renderContactDetails()}
      {renderFamilyAppStatus()}
    </>
  );

  if (step === 'type') {
    return (
      <div className="w-full max-w-none">
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Button
                type="button"
                onClick={() => navigate(-1)}
                className="border-gray-200 "
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <div>
                <CardTitle className="text-2xl font-bold text-black">
                  Add Emergency Contract
                </CardTitle>
                <CardDescription className="mt-1 text-black">
                  Choose the type of emergency contract to add to this service
                  user's record
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-6 py-4 md:grid-cols-3">
              {(
                Object.entries(contractTypeMeta) as [
                  ContractType,
                  (typeof contractTypeMeta)[ContractType]
                ][]
              ).map(([type, meta]) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleTypeSelect(type)}
                  className="group flex cursor-pointer flex-col items-center gap-6 rounded-xl border-2 border-gray-200 p-8 transition-all hover:border-watney hover:bg-watney/5 hover:shadow-lg"
                >
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-50 transition-colors group-hover:bg-watney/10">
                    <div className="text-gray-600 transition-colors group-hover:text-watney">
                      {meta.icon}
                    </div>
                  </div>
                  <div className="text-center">
                    <span className="text-lg font-semibold text-black transition-colors group-hover:text-watney">
                      {meta.label}
                    </span>
                    <p className="mt-2 text-sm text-black">
                      {meta.description}
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-black transition-all group-hover:translate-x-1 group-hover:text-watney" />
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-none">
      <Card className="border-gray-200 ">
        <CardHeader className="border-b border-gray-200 bg-gray-50/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                type="button"
                onClick={() => setStep('type')}
                className="border-gray-200 "
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back to Type Selection
              </Button>
              <div>
                <div className="flex items-center gap-3">
                  <CardTitle className="text-2xl font-bold text-black">
                    Add {selectedType} Contract
                  </CardTitle>
                  <Badge className="text-sm ">
                    {selectedType}
                  </Badge>
                </div>
                <CardDescription className="mt-1 text-black">
                  Fill in the details for the {selectedType?.toLowerCase()}{' '}
                  emergency contact
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8 overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-8">
            {selectedType === 'GP' && renderGPForm()}
            {selectedType === 'Personal' && renderPersonalForm()}
            {selectedType === 'Professional' && renderProfessionalForm()}

            <FormSection
              title="Additional Notes"
              description="Any other relevant information"
            >
              <Textarea
                id="note"
                value={formData.note}
                onChange={(e) => updateField('note', e.target.value)}
                placeholder="Additional notes or comments..."
                rows={4}
                className="border-gray-200 text-black"
              />
            </FormSection>

            <div className="flex items-center justify-end gap-3  pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
                className=""
              >
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className=" text-white"
              >
                {isSubmitting ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Contract
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}