import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Select from 'react-select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronLeft, ChevronRight, Loader2, Pencil } from 'lucide-react';
import moment from 'moment';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { useSelector } from 'react-redux';
import SignatureCanvas from 'react-signature-canvas';
import axiosInstance from '@/lib/axios';
import { BlinkingDots } from '@/components/shared/blinking-dots';

type TContact = {
  name?: string;
  address?: string;
  telephone?: string;
};

type StepField = {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'date' | 'checkbox' | 'contact' | 'multi-text' | 'multi-select' | 'signature' | 'review';
  placeholder?: string;
  skipable?: boolean;
};

type Step = {
  id: number;
  title: string;
  description: string;
  fields: StepField[];
};

const CONTACT_LABELS: Record<string, string> = {
  socialWorker: 'Social Worker (Care Manager)',
  generalPractitioner: 'General Practitioner',
  hospitalConsultants: 'Hospital Consultants',
  pharmacist: 'Pharmacist',
  communityNurse: 'Community Nurse',
  nextOfKin1: 'Next of Kin (1)',
  nextOfKin2: 'Next of Kin (2)',
  keyHolder: 'Key Holder',
  otherAgency: 'Other Agency Providing Services',
};

const INFORMATION_SOURCE_OPTIONS = [
  { value: 'person', label: 'From the person themselves' },
  { value: 'relative', label: 'From a relative / friend' },
  { value: 'agencies', label: 'From other agencies' },
  { value: 'other', label: 'From other sources' },
  { value: 'observation', label: 'Through observation' },
];

const STEPS: Step[] = [
  {
    id: 1,
    title: 'Assessment Info',
    description: 'Basic assessment identifiers',
    fields: [
      { key: 'serviceUserIdNumber', label: 'Service User ID Number', type: 'text', placeholder: 'e.g. SU-001' },
      { key: 'dateOfAssessment', label: 'Date of Assessment', type: 'date' },
      { key: 'assessorName', label: "Assessor's Name", type: 'text', placeholder: 'Full name' },
      { key: 'assessorSignature', label: "Assessor's Signature", type: 'signature' },
    ],
  },
  {
    id: 3,
    title: 'Personal Details',
    description: 'Service user personal information',
    fields: [
      { key: 'myAddress', label: 'My Address', type: 'textarea', placeholder: 'Full address' },
      { key: 'myName', label: 'My Name', type: 'text', placeholder: 'Full name' },
      { key: 'preferredName', label: 'Preferred Name', type: 'text', placeholder: 'What name do they prefer?', skipable: true },
      { key: 'myPhoneNumber', label: 'Phone Number', type: 'text', placeholder: 'Contact number' },
      { key: 'myBirthday', label: 'Date of Birth', type: 'date' },
    ],
  },
  {
    id: 4,
    title: 'Preferences & Interests',
    description: 'Likes, dislikes and communication tips',
    fields: [
      { key: 'importantPeopleToMe', label: 'Important People to Me', type: 'textarea', placeholder: 'Who is important in their life?', skipable: true },
      { key: 'areasOfHighRisk', label: 'Areas of High Risk', type: 'textarea', placeholder: 'Any identified risk areas', skipable: true },
      { key: 'backgroundSkillsAndInterests', label: 'Background, Skills & Interests', type: 'textarea', placeholder: 'What are their skills and interests?' },
      { key: 'likes', label: 'Likes', type: 'textarea', placeholder: 'Things they enjoy', skipable: true },
      { key: 'dislikes', label: 'Dislikes', type: 'textarea', placeholder: 'Things they do not like', skipable: true },
      { key: 'tipsForTalkingToMe', label: 'Tips for Talking to Me', type: 'textarea', placeholder: 'Communication tips', skipable: true },
      { key: 'criticalCareAndSupportNeeds', label: 'Critical Care & Support Needs', type: 'multi-text', placeholder: 'Add a need and press Enter', skipable: true },
    ],
  },
  {
    id: 5,
    title: 'Contacts',
    description: 'Professional and personal contacts',
    fields: [{ key: 'contacts', label: 'Contacts', type: 'contact', skipable: true }],
  },
  {
    id: 6,
    title: 'Background & Needs',
    description: 'Personal history and cultural background',
    fields: [
      { key: 'importantAboutMyPast', label: 'What is important about my past?', type: 'textarea', placeholder: 'Details about their past', skipable: true },
      { key: 'howMyPastAffectsMeToday', label: 'How does my past affect me today?', type: 'textarea', placeholder: 'Impact of past on present', skipable: true },
      { key: 'howToSupportMeWithMyPast', label: 'How to support me with my past', type: 'textarea', placeholder: 'Support strategies', skipable: true },
      { key: 'importantAboutMyCulturalBackground', label: 'Important about my cultural background', type: 'textarea', placeholder: 'Cultural considerations', skipable: true },
      { key: 'howToSupportMyCulturalIdentity', label: 'How to support my cultural identity', type: 'textarea', placeholder: 'Cultural support strategies', skipable: true },
      { key: 'myUseOfLanguage', label: 'My use of language', type: 'textarea', placeholder: 'Language preferences', skipable: true },
      { key: 'peopleAndOrganisationsImportantToMe', label: 'People & organisations important to me', type: 'textarea', placeholder: 'Key people and organisations', skipable: true },
    ],
  },
  {
    id: 7,
    title: 'Beliefs',
    description: 'Personal beliefs and spiritual needs',
    fields: [
      { key: 'myBeliefs', label: 'These are my beliefs, which are important to me', type: 'textarea', placeholder: 'Describe their beliefs', skipable: true },
      { key: 'howToHelpSustainMyBeliefs', label: 'How you can help sustain my beliefs', type: 'textarea', placeholder: 'Support strategies', skipable: true },
      { key: 'specificSupportInformation', label: 'Specific information to help support me', type: 'textarea', placeholder: 'Additional support info', skipable: true },
    ],
  },
  {
    id: 2,
    title: 'Information Source',
    description: 'How was this information gathered?',
    fields: [
      { key: 'informationFrom', label: 'Information Source', type: 'multi-select', placeholder: 'Select all that apply', skipable: true },
    ],
  },
  {
    id: 8,
    title: 'Review',
    description: 'Review all information before submitting',
    fields: [{ key: 'review', label: 'Review', type: 'review' }],
  },
];

function setNestedValue(obj: Record<string, unknown>, path: string, value: unknown) {
  const keys = path.split('.');
  let current = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    if (!current[keys[i]] || typeof current[keys[i]] !== 'object') {
      current[keys[i]] = {};
    }
    current = current[keys[i]] as Record<string, unknown>;
  }
  current[keys[keys.length - 1]] = value;
}

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object') return (acc as Record<string, unknown>)[key];
    return undefined;
  }, obj);
}

function toISODateString(date: Date | null | undefined): string | undefined {
  if (!date) return undefined;
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())).toISOString();
}

export default function CreateServiceUserAssessmentPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(() => {
    const saved = sessionStorage.getItem('assessmentCurrentStep');
    return saved ? Number(saved) : 0;
  });
  const [recordId, setRecordId] = useState<string | null>(() => {
    return sessionStorage.getItem('assessmentRecordId') || null;
  });
  const [loading, setLoading] = useState(!!sessionStorage.getItem('assessmentRecordId'));
  const [submitting, setSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<Record<string, unknown>>({
    contacts: {},
    informationFrom: {},
    criticalCareAndSupportNeeds: [],
    maintenancePreventionOutcomes: [],
    changeOutcomes: [],
    serviceProcessOutcomes: [],
  });
  const [signatureUrl, setSignatureUrl] = useState<string>('');
  const [signatureSaving, setSignatureSaving] = useState(false);
  const signatureRef = useRef<SignatureCanvas>(null);
  const stepRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const { user } = useSelector((state: any) => state.auth);

  const animateIn = useCallback(() => {
    if (stepRef.current) {
      gsap.fromTo(stepRef.current, { opacity: 0, x: 40 }, { opacity: 1, x: 0, duration: 0.4, ease: 'power2.out' });
    }
    if (contentRef.current) {
      const fields = contentRef.current.querySelectorAll('.step-field');
      gsap.fromTo(fields, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.3, stagger: 0.05, ease: 'power2.out' });
    }
  }, []);

  useEffect(() => {
    animateIn();
  }, [currentStep, animateIn]);

  useEffect(() => {
    if (recordId) {
      sessionStorage.setItem('assessmentRecordId', recordId);
    } else {
      sessionStorage.removeItem('assessmentRecordId');
    }
  }, [recordId]);

  useEffect(() => {
    sessionStorage.setItem('assessmentCurrentStep', String(currentStep));
  }, [currentStep]);

  useEffect(() => {
    const savedId = sessionStorage.getItem('assessmentRecordId');
    if (savedId) {
      const restore = async () => {
        try {
          const res = await axiosInstance.get(`/serviceuser-assessment/${savedId}`);
          const recordData = res.data?.data;
          if (recordData) {
            setFormData((prev) => ({ ...prev, ...recordData }));
            if (recordData.assessorSignature) {
              setSignatureUrl(recordData.assessorSignature);
            }
          }
        } catch {
          sessionStorage.removeItem('assessmentRecordId');
          sessionStorage.removeItem('assessmentCurrentStep');
          setRecordId(null);
          setCurrentStep(0);
        } finally {
          setLoading(false);
        }
      };
      restore();
    } else {
      setLoading(false);
    }
  }, []);

  const hasUnfilledRequired = (step: Step): boolean => {
    return step.fields.some((field) => {
      if (field.skipable) return false;
      if (field.type === 'contact' || field.type === 'multi-select' || field.type === 'signature' || field.type === 'review') return false;
      const value = getNestedValue(formData, field.key);
      if (field.type === 'multi-text') return !Array.isArray(value) || value.length === 0;
      return !value || (typeof value === 'string' && value.trim() === '');
    });
  };

  const validateStep = (step: Step): boolean => {
    const errors: Record<string, string> = {};

    step.fields.forEach((field) => {
      if (!field.skipable) {
        if (field.key === 'serviceUserIdNumber') {
          const value = getNestedValue(formData, field.key);
          if (!value || (typeof value === 'string' && value.trim() === '')) {
            errors[field.key] = 'Service User ID Number is required';
          }
        } else if (field.type === 'signature') {
          if (!signatureUrl) {
            errors[field.key] = 'Signature is required';
          }
        } else if (field.type !== 'contact' && field.type !== 'multi-select' && field.type !== 'review') {
          const value = getNestedValue(formData, field.key);
          if (!value || (typeof value === 'string' && value.trim() === '') || (Array.isArray(value) && value.length === 0)) {
            errors[field.key] = `${field.label} is required`;
          }
        }
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const updateField = (key: string, value: unknown) => {
    setFormData((prev) => {
      const next = { ...prev };
      setNestedValue(next, key, value);
      return next;
    });
    if (validationErrors[key]) {
      setValidationErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const persistStep = async (isFinal: boolean): Promise<boolean> => {
    try {
      setSubmitting(true);

      const today = toISODateString(new Date());
      const payload: Record<string, unknown> = {
        ...formData,
        assessorSignature: signatureUrl || formData.assessorSignature,
        completedBy: user._id,
        lastReviewedBy: user._id,
        completedDate: today,
        lastReviewedDate: today,
      };

      if (isFinal) {
        payload.isCompleted = true;
      }

      let isCreate = false;

      const doPost = async () => {
        isCreate = true;
        await axiosInstance.post('/serviceuser-assessment', payload);
        try {
          const serviceUserIdNumber = payload.serviceUserIdNumber as string;
          if (serviceUserIdNumber) {
            const res = await axiosInstance.get('/serviceuser-assessment', {
              params: { serviceUserIdNumber },
            });
            const records = res.data?.data?.result || res.data?.data;
            if (Array.isArray(records) && records.length > 0) {
              setRecordId(records[0]._id ?? null);
            }
          }
        } catch {
          /* GET failed silently - recordId stays null, will be fetched on next step */
        }
      };

      if (!recordId) {
        await doPost();
      } else {
        try {
          const res = await axiosInstance.patch(`/serviceuser-assessment/${recordId}`, payload);
          if (res.data?.success === false) {
            setRecordId(null);
            await doPost();
          }
        } catch (patchError: any) {
          if (patchError?.response?.status === 404) {
            setRecordId(null);
            await doPost();
          } else {
            throw patchError;
          }
        }
      }

      if (isFinal) {
        toast({ title: isCreate ? 'Assessment Created' : 'Assessment Updated' });
      }
      return true;
    } catch (error: any) {
      toast({ title: 'Error', description: error?.response?.data?.message || 'Failed to save this step', variant: 'destructive' });
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = async () => {
    if (!validateStep(STEPS[currentStep])) {
      toast({ title: 'Error', description: 'Please fill in all required fields', variant: 'destructive' });
      return;
    }
    if (currentStep >= STEPS.length - 1) return;
    const ok = await persistStep(false);
    if (!ok) return;
    gsap.to(stepRef.current, {
      opacity: 0, x: -40, duration: 0.2, ease: 'power2.in',
      onComplete: () => setCurrentStep((s) => s + 1),
    });
  };

  const handleSkip = () => {
    if (hasUnfilledRequired(STEPS[currentStep])) {
      toast({ title: 'Error', description: 'Please fill in all required fields before skipping', variant: 'destructive' });
      return;
    }
    if (currentStep >= STEPS.length - 1) return;
    gsap.to(stepRef.current, {
      opacity: 0, x: -40, duration: 0.2, ease: 'power2.in',
      onComplete: () => setCurrentStep((s) => s + 1),
    });
  };

  const handleBack = () => {
    if (currentStep > 0) {
      gsap.to(stepRef.current, {
        opacity: 0, x: 40, duration: 0.2, ease: 'power2.in',
        onComplete: () => setCurrentStep((s) => s - 1),
      });
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(STEPS[currentStep])) {
      toast({ title: 'Error', description: 'Please fill in all required fields', variant: 'destructive' });
      return;
    }
    const ok = await persistStep(true);
    if (!ok) return;
    navigate('../serviceuser-assessment');
  };

  const handleSaveSignature = async () => {
    if (!signatureRef.current) return;
    const dataUrl = signatureRef.current.toDataURL();
    if (!dataUrl) return;
    setSignatureSaving(true);
    try {
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], 'signature.png', { type: 'image/png' });
      const uploadFormData = new FormData();
      uploadFormData.append('entityId', user._id || '');
      uploadFormData.append('file_type', 'careerDoc');
      uploadFormData.append('file', file);
      const response = await axiosInstance.post('/documents', uploadFormData);
      if (response.status === 200) {
        const url = response.data?.data?.fileUrl || response.data?.data?.url || response.data?.url;
        if (url) {
          setSignatureUrl(url);
          updateField('assessorSignature', url);
        }
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error?.response?.data?.message || 'Failed to upload signature', variant: 'destructive' });
    } finally {
      setSignatureSaving(false);
    }
  };

  const handleClearSignature = () => {
    signatureRef.current?.clear();
  };

  const handleUpdateSignature = () => {
    setSignatureUrl('');
    signatureRef.current?.clear();
  };

  const step = STEPS[currentStep];
  const isFirst = currentStep === 0;
  const isLast = currentStep === STEPS.length - 1;
  const canSkip = !hasUnfilledRequired(step) && currentStep < STEPS.length - 1;

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center gap-4">
          <Button size="icon" onClick={()=> navigate('/dashboard/people-planner/serviceuser-assessment')} disabled={submitting} className="border-gray-300">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        <div>
          <h1 className="text-2xl font-bold">Outcomes Based Service Delivery Plan</h1>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <BlinkingDots/>
        </div>
      ) : (
        <>
          <Card ref={stepRef} className="w-full border-gray-300">
            <CardContent className="p-6 space-y-6">
              <div>
                <h2 className="text-xl font-semibold">{step.title}</h2>
                <p className="text-sm ">{step.description}</p>
              </div>
              <Separator  />
              <div ref={contentRef}>
                {step.fields.some((f) => f.type === 'review') ? (
                  <ReviewStep formData={formData} signatureUrl={signatureUrl} />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {step.fields.map((field) => (
                      <FieldRenderer
                        key={field.key}
                        field={field}
                        formData={formData}
                        updateField={updateField}
                        error={validationErrors[field.key]}
                        signatureUrl={signatureUrl}
                        signatureRef={signatureRef}
                        onSaveSignature={handleSaveSignature}
                        onClearSignature={handleClearSignature}
                        onUpdateSignature={handleUpdateSignature}
                        signatureSaving={signatureSaving}
                      />
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between">
            <div>
              {!isFirst && (
                <Button variant="outline" onClick={handleBack} disabled={submitting} className="border-gray-300">
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              )}
            </div>
            <div className="flex items-center gap-3">
              {step.fields.some((f) => f.skipable) && !isLast && (
                <Button variant="outline" onClick={handleSkip} disabled={!canSkip || submitting} >
                  Skip
                </Button>
              )}
              {isLast ? (
                <Button onClick={handleSubmit} disabled={submitting} className="bg-watney text-white hover:bg-watney/90">
                  {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {submitting ? 'Saving...' : 'Save Assessment'}
                </Button>
              ) : (
                <Button onClick={handleNext} disabled={submitting} className="bg-watney text-white hover:bg-watney/90">
                  {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function formatFieldValue(value: unknown): string {
  if (value === undefined || value === null || value === '') return '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (Array.isArray(value)) return value.length > 0 ? value.join(', ') : '—';
  if (typeof value === 'object') return 'See details below';
  return String(value);
}

function getFieldDisplayValue(field: StepField, formData: Record<string, unknown>, signatureUrl: string): string {
  if (field.type === 'signature') return signatureUrl ? 'Signature provided' : '—';
  if (field.type === 'contact') return 'See contacts section below';
  if (field.type === 'multi-select') {
    const infoFrom = (formData.informationFrom as Record<string, boolean>) || {};
    const selected = Object.entries(infoFrom).filter(([, v]) => v).map(([k]) => {
      const opt = INFORMATION_SOURCE_OPTIONS.find((o) => o.value === k);
      return opt ? opt.label : k;
    });
    return selected.length > 0 ? selected.join(', ') : '—';
  }
  if (field.type === 'multi-text') {
    const arr = getNestedValue(formData, field.key) as string[] | undefined;
    return arr && arr.length > 0 ? arr.filter(Boolean).join(', ') : '—';
  }
  const value = getNestedValue(formData, field.key);
  if (field.type === 'date' && value) {
    try {
      return moment(value as string).format('DD/MM/YYYY');
    } catch {
      return String(value);
    }
  }
  return formatFieldValue(value);
}

function ReviewStep({
  formData,
  signatureUrl,
}: {
  formData: Record<string, unknown>;
  signatureUrl: string;
}) {
  const reviewSteps = STEPS.filter((s) => s.id !== 8);

  return (
    <div className="space-y-6">
      {reviewSteps.map((step) => {
        const filledFields = step.fields.filter((f) => {
          if (f.type === 'signature') return !!signatureUrl;
          if (f.type === 'contact') return Object.keys((formData.contacts as Record<string, unknown>) || {}).length > 0;
          const val = getNestedValue(formData, f.key);
          if (Array.isArray(val)) return val.length > 0 && val.some(Boolean);
          if (typeof val === 'object') return Object.keys(val || {}).length > 0;
          return val !== undefined && val !== null && val !== '';
        });
        if (filledFields.length === 0) return null;

        return (
          <div key={step.id} className="border border-gray-300 rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-base">{step.title}</h3>
            <Separator />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filledFields.map((field) => (
                <div key={field.key}>
                  <span className="text-sm ">{field.label}</span>
                  <p className="text-sm font-medium">{getFieldDisplayValue(field, formData, signatureUrl)}</p>
                </div>
              ))}
            </div>
            {step.fields.some((f) => f.type === 'contact') && renderContactDetails(formData)}
          </div>
        );
      })}
    </div>
  );
}

function renderContactDetails(formData: Record<string, unknown>) {
  const contacts = (formData.contacts as Record<string, TContact>) || {};
  const filled = Object.entries(CONTACT_LABELS).filter(([key]) => {
    const c = contacts[key];
    return c?.name || c?.address || c?.telephone;
  });
  if (filled.length === 0) return null;

  return (
    <div className="mt-2 space-y-2 pl-2 border-l-2 border-gray-200">
      {filled.map(([key, label]) => {
        const c = contacts[key];
        return (
          <div key={key} className="text-sm">
            <span className="font-medium">{label}:</span>
            <div className=" ml-2">
              {c?.name && <div>Name: {c.name}</div>}
              {c?.address && <div>Address: {c.address}</div>}
              {c?.telephone && <div>Tel: {c.telephone}</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ContactFields({
  formData,
  updateField,
}: {
  formData: Record<string, unknown>;
  updateField: (key: string, value: unknown) => void;
}) {
  const contacts = (formData.contacts as Record<string, TContact>) || {};

  return (
    <div className="space-y-4 md:col-span-2">
      {(Object.keys(CONTACT_LABELS) as Array<keyof typeof CONTACT_LABELS>).map((key) => {
        const contact = contacts[key] || {};
        return (
          <div key={key} className="space-y-3 p-4 border border-gray-300 rounded-lg">
            <Label className="font-semibold">{CONTACT_LABELS[key]}</Label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <Label className="text-xs ">Name</Label>
                <Input
                  value={contact.name || ''}
                  onChange={(e) => updateField(`contacts.${key}.name`, e.target.value)}
                  placeholder="Name"
                  className="border-gray-300"
                />
              </div>
              <div>
                <Label className="text-xs ">Address</Label>
                <Input
                  value={contact.address || ''}
                  onChange={(e) => updateField(`contacts.${key}.address`, e.target.value)}
                  placeholder="Address"
                  className="border-gray-300"
                />
              </div>
              <div>
                <Label className="text-xs ">Telephone</Label>
                <Input
                  value={contact.telephone || ''}
                  onChange={(e) => updateField(`contacts.${key}.telephone`, e.target.value)}
                  placeholder="Telephone"
                  className="border-gray-300"
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MultiTextInput({
  value = [],
  onChange,
}: {
  value?: string[];
  onChange: (val: string[]) => void;
  placeholder?: string;
}) {
  const addItem = () => {
    onChange([...value, '']);
  };

  const updateItem = (index: number, text: string) => {
    const next = [...value];
    next[index] = text;
    onChange(next);
  };

  const removeItem = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      {value.map((item, i) => (
        <div key={i} className="flex gap-2">
          <Input
            value={item}
            onChange={(e) => updateItem(i, e.target.value)}
            placeholder="Enter a need"
            className="border-gray-300"
          />
          <Button type="button" variant="destructive" onClick={() => removeItem(i)} size="sm" >
            &times;
          </Button>
        </div>
      ))}
    </div>
  );
}

function FieldRenderer({
  field,
  formData,
  updateField,
  error,
  signatureUrl,
  signatureRef,
  onSaveSignature,
  onClearSignature,
  onUpdateSignature,
  signatureSaving,
}: {
  field: StepField;
  formData: Record<string, unknown>;
  updateField: (key: string, value: unknown) => void;
  error?: string;
  signatureUrl?: string;
  signatureRef?: React.RefObject<SignatureCanvas>;
  onSaveSignature?: () => void;
  onClearSignature?: () => void;
  onUpdateSignature?: () => void;
  signatureSaving?: boolean;
}) {
  const value = getNestedValue(formData, field.key);

  const isRequired = !field.skipable;

  if (field.type === 'contact') {
    return <ContactFields formData={formData} updateField={updateField} />;
  }

  if (field.type === 'signature') {
    return (
      <div className="step-field space-y-2 md:col-span-2">
        <Label>
          {field.label} {isRequired && <span className="text-red-500">*</span>}
        </Label>
        {signatureUrl ? (
          <div className="flex flex-col items-start gap-3 rounded-lg border border-gray-300 bg-gray-50 p-4 max-w-sm">
            <img
              src={signatureUrl}
              alt="Signature"
              className="h-16 rounded border border-gray-300 bg-white object-contain"
            />
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={onUpdateSignature}
              className="border-gray-300"
            >
              <Pencil className="mr-1 h-4 w-4" /> Update Signature
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="rounded-lg border border-gray-300 bg-white max-w-sm">
              <SignatureCanvas
                ref={signatureRef}
                penColor="black"
                canvasProps={{
                  width: 400,
                  height: 120,
                  className: 'rounded-lg signature-canvas w-full max-w-sm',
                }}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClearSignature}
                disabled={signatureSaving}
                className="border-gray-300"
              >
                Clear
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={onSaveSignature}
                disabled={signatureSaving}
                className="bg-watney text-white hover:bg-watney/90"
              >
                {signatureSaving ? (
                  <>
                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Signature'
                )}
              </Button>
            </div>
          </div>
        )}
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    );
  }

  if (field.type === 'multi-select') {
    const infoFrom = (formData.informationFrom as Record<string, boolean>) || {};
    const selectedOptions = INFORMATION_SOURCE_OPTIONS.filter((opt) => infoFrom[opt.value]);
    return (
      <div className="step-field space-y-2 md:col-span-2">
        <Label>
          {field.label} {isRequired && <span className="text-red-500">*</span>}
        </Label>
        <Select
          isMulti
          options={INFORMATION_SOURCE_OPTIONS}
          value={selectedOptions}
          onChange={(selected) => {
            const next = INFORMATION_SOURCE_OPTIONS.reduce((acc, opt) => {
              acc[opt.value] = !!selected?.some((s) => s.value === opt.value);
              return acc;
            }, {} as Record<string, boolean>);
            updateField('informationFrom', next);
          }}
          placeholder={field.placeholder || 'Select all that apply'}
          classNamePrefix="react-select"
          styles={{
    control: (base) => ({
      ...base,
      minHeight: '48px',
      height: '48px',
      borderColor: '#d1d5db',
      borderRadius: '0.75rem',
      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      '&:hover': {
        borderColor: '#d1d5db',
      },
    }),
    valueContainer: (base) => ({
      ...base,
      height: '48px',
      padding: '0 8px',
    }),
    input: (base) => ({
      ...base,
      margin: '0px',
    }),
    indicatorsContainer: (base) => ({
      ...base,
      height: '48px',
    }),
    placeholder: (base) => ({
      ...base,
      color: '#9ca3af',
    }),
  }}
        />
      </div>
    );
  }

  if (field.type === 'checkbox') {
    return (
      <div className="step-field flex items-center gap-3">
        <Checkbox id={field.key} checked={!!value} onCheckedChange={(checked) => updateField(field.key, !!checked)} />
        <Label htmlFor={field.key} className="cursor-pointer">
          {field.label} {isRequired && <span className="text-red-500">*</span>}
        </Label>
      </div>
    );
  }

  if (field.type === 'date') {
    const dateValue = value ? new Date(value as string) : null;
    return (
      <div className="step-field space-y-2">
        <Label>
          {field.label} (DD/MM/YYYY) {isRequired && <span className="text-red-500">*</span>}
        </Label>
        <DatePicker
          selected={dateValue}
          onChange={(date: Date | null) => updateField(field.key, toISODateString(date))}
          dateFormat="dd/MM/yyyy"
          placeholderText="Pick a date"
          wrapperClassName="w-full"
          showMonthDropdown
          portalId='root'
          showYearDropdown
          dropdownMode='select'
          className={cn(
            "flex h-12 w-full rounded-xl border bg-white px-3 py-1 text-sm shadow-sm placeholder: focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed",
            error ? "border-red-500" : "border-gray-300"
          )}
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    );
  }

  if (field.type === 'multi-text') {
    return (
      <div className="step-field space-y-2 md:col-span-2">
        <div className="flex items-center gap-2">
          <Label>
            {field.label} {isRequired && <span className="text-red-500">*</span>}
          </Label>
          <Button type="button" size="sm" onClick={() => {
            const arr = (value as string[]) || [];
            updateField(field.key, [...arr, '']);
          }} className="border-gray-300">
            Add
          </Button>
        </div>
        <MultiTextInput value={(value as string[]) || []} onChange={(val) => updateField(field.key, val)} />
      </div>
    );
  }

  if (field.type === 'textarea') {
    return (
      <div className="step-field space-y-2 md:col-span-2">
        <Label>
          {field.label} {isRequired && <span className="text-red-500">*</span>}
        </Label>
        <Textarea
          value={(value as string) || ''}
          onChange={(e) => updateField(field.key, e.target.value)}
          placeholder={field.placeholder}
          rows={3}
          className={cn("border-gray-300", error && "border-red-500")}
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    );
  }

  return (
    <div className="step-field space-y-2">
      <Label>
        {field.label} {isRequired && <span className="text-red-500">*</span>}
      </Label>
      <Input
        value={(value as string) || ''}
        onChange={(e) => updateField(field.key, e.target.value)}
        placeholder={field.placeholder}
        className={cn(
          "border-gray-300",
          error && "border-red-500 focus-visible:ring-red-500"
        )}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
