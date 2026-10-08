import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
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

type StepField = {
  key: string;
  label: string;
  type:
    | 'text'
    | 'textarea'
    | 'date'
    | 'checkbox'
    | 'multi-text'
    | 'signature'
    | 'review';
  placeholder?: string;
  skipable?: boolean;
};

type Section = {
  title: string;
  fields: StepField[];
};

type Step = {
  id: number;
  title: string;
  description: string;
  sections?: Section[];
  fields?: StepField[];
};

function getStepAllFields(step: Step): StepField[] {
  return step.sections
    ? step.sections.flatMap((s) => s.fields)
    : (step.fields ?? []);
}

// Group 3 contacts together by prefix
function contactFields(
  prefix: string,
  nameLabel: string,
  addrLabel: string,
  phoneLabel: string
): StepField[] {
  return [
    {
      key: `${prefix}Name`,
      label: `${nameLabel}`,
      type: 'text' as const,
      placeholder: 'Name',
      skipable: true
    },
    {
      key: `${prefix}Address`,
      label: `${addrLabel}`,
      type: 'text' as const,
      placeholder: 'Address',
      skipable: true
    },
    {
      key: `${prefix}Telephone`,
      label: `${phoneLabel}`,
      type: 'text' as const,
      placeholder: 'Telephone',
      skipable: true
    }
  ];
}

function mField(key: string, label: string): StepField {
  return {
    key,
    label,
    type: 'textarea' as const,
    placeholder: label,
    skipable: true
  };
}

// Helper for a "maintenance outcome" block: can-do / find-difficult / help / risks,
// with optional extra fields inserted before "help" (used by Food & Drink).
function outcomeStep(
  id: number,
  title: string,
  keyPrefix: string,
  helpLabel: string,
  riskLabel: string,
  extraFields: StepField[] = []
): Step {
  return {
    id,
    title,
    description: title,
    fields: [
      mField(`${keyPrefix}CanDo`, 'What I can still do for myself'),
      mField(`${keyPrefix}FindDifficult`, 'What I find difficult'),
      ...extraFields,
      mField(`${keyPrefix}Help`, helpLabel),
      mField(`${keyPrefix}Risks`, riskLabel)
    ]
  };
}

const STEPS: Step[] = [
  // === PAGE 1: Personal Details ===
  {
    id: 1,
    title: 'Personal Details',
    description: 'Contact information',
    fields: [
      {
        key: 'myAddress',
        label: 'My Address',
        type: 'textarea',
        placeholder: 'Full address',
        skipable: true
      },
      {
        key: 'myName',
        label: 'My Name',
        type: 'text',
        placeholder: 'Full name',
        skipable: true
      },
      {
        key: 'preferredName',
        label: 'I like to be known as',
        type: 'text',
        placeholder: 'Preferred name',
        skipable: true
      },
      {
        key: 'myPhoneNumber',
        label: 'My Phone Number',
        type: 'text',
        placeholder: 'Contact number',
        skipable: true
      },
      { key: 'myBirthday', label: 'My Birthday', type: 'date', skipable: true }
    ]
  },
  {
    id: 2,
    title: 'Personal Details',
    description: 'Important people and risk areas',
    fields: [
      {
        key: 'importantPeopleToMe',
        label: 'Important People to Me',
        type: 'textarea',
        placeholder: 'Who is important in their life?',
        skipable: true
      },
      {
        key: 'areasOfHighRisk',
        label: 'Areas of High Risk for Me Are',
        type: 'textarea',
        placeholder: 'Any identified risk areas',
        skipable: true
      }
    ]
  },
  {
    id: 3,
    title: 'Personal Details',
    description: 'Background, skills and preferences',
    fields: [
      {
        key: 'backgroundSkillsAndInterests',
        label: 'My Background, Skills & Interests',
        type: 'textarea',
        placeholder: 'What are their skills and interests?',
        skipable: true
      },
      {
        key: 'likes',
        label: 'I Like',
        type: 'textarea',
        placeholder: 'Things they enjoy',
        skipable: true
      },
      {
        key: 'dislikes',
        label: 'I Dislike',
        type: 'textarea',
        placeholder: 'Things they do not like',
        skipable: true
      }
    ]
  },
  {
    id: 4,
    title: 'Communication Tips',
    description: 'Tips for effective communication',
    fields: [
      {
        key: 'tipsForTalkingToMe',
        label: 'Tips for Talking to Me',
        type: 'textarea',
        placeholder: 'Communication tips',
        skipable: true
      }
    ]
  },
  {
    id: 5,
    title: 'Critical Care & Support Needs',
    description: 'My critical care and support needs are:',
    fields: [
      {
        key: 'criticalCareAndSupportNeeds',
        label: 'My Critical Care & Support Needs',
        type: 'multi-text',
        placeholder: 'Add a need',
        skipable: true
      }
    ]
  },
  // === PAGE 2: Assessment & Contacts ===
  {
    id: 6,
    title: 'Assessment Info & Signature',
    description: 'Assessment identifiers and assessor signature',
    fields: [
      {
        key: 'serviceUserIdNumber',
        label: 'Service User ID Number',
        type: 'text',
        placeholder: 'e.g. SU-001',
        skipable: true
      },
      {
        key: 'dateOfAssessment',
        label: 'Date of Assessment',
        type: 'date',
        skipable: true
      },
      {
        key: 'assessorName',
        label: "Assessor's Name",
        type: 'text',
        placeholder: 'Full name',
        skipable: true
      },
      {
        key: 'assessorSignature',
        label: "Assessor's Signature",
        type: 'signature',
        skipable: true
      }
    ]
  },
  // Contacts — flat Name/Address/Telephone fields per contact, split into 4 steps
  {
    id: 7,
    title: 'Contacts',
    description: 'Social worker and GP',
    sections: [
      {
        title: 'Social Worker (Care Manager)',
        fields: contactFields('socialWorker', 'Name', 'Address', 'Telephone')
      },
      {
        title: 'General Practitioner',
        fields: contactFields(
          'generalPractitioner',
          'Name',
          'Address',
          'Telephone'
        )
      }
    ]
  },
  {
    id: 8,
    title: 'Contacts',
    description: 'Hospital consultants and pharmacist',
    sections: [
      {
        title: 'Hospital Consultants',
        fields: contactFields(
          'hospitalConsultants',
          'Name',
          'Address',
          'Telephone'
        )
      },
      {
        title: 'Pharmacist',
        fields: contactFields('pharmacist', 'Name', 'Address', 'Telephone')
      }
    ]
  },
  {
    id: 9,
    title: 'Contacts',
    description: 'Community nurse and next of kin',
    sections: [
      {
        title: 'Community Nurse',
        fields: contactFields('communityNurse', 'Name', 'Address', 'Telephone')
      },
      {
        title: 'Next of Kin (1)',
        fields: contactFields('nextOfKin1', 'Name', 'Address', 'Telephone')
      }
    ]
  },
  {
    id: 10,
    title: 'Contacts',
    description: 'Next of kin, key holder and other agency',
    sections: [
      {
        title: 'Next of Kin (2)',
        fields: contactFields('nextOfKin2', 'Name', 'Address', 'Telephone')
      },
      {
        title: 'Key Holder',
        fields: contactFields('keyHolder', 'Name', 'Address', 'Telephone')
      },
      {
        title: 'Other Agency Providing Services',
        fields: contactFields('otherAgency', 'Name', 'Address', 'Telephone')
      }
    ]
  },
  // === PAGE 3: My Service Delivery Plan / Needs Assessment ===
  {
    id: 11,
    title: 'My Service Delivery Plan / Needs Assessment in Detail',
    description: 'My past',
    fields: [
      {
        key: 'importantAboutMyPast',
        label: 'What is important for you to know about my past',
        type: 'textarea',
        placeholder: 'Details about their past',
        skipable: true
      },
      {
        key: 'howMyPastAffectsMeToday',
        label: 'How my past affects the way I am today',
        type: 'textarea',
        placeholder: 'Impact of past on present',
        skipable: true
      },
      {
        key: 'howToSupportMeWithMyPast',
        label:
          'How you can support me to make the best use of my past and overcome any difficulties it causes for me',
        type: 'textarea',
        placeholder: 'Support strategies',
        skipable: true
      }
    ]
  },
  {
    id: 12,
    title: 'My Service Delivery Plan / Needs Assessment in Detail',
    description: 'Cultural background',
    fields: [
      {
        key: 'importantAboutMyCulturalBackground',
        label:
          'What it is important for you to know about my cultural background',
        type: 'textarea',
        placeholder: 'Cultural considerations',
        skipable: true
      },
      {
        key: 'howToSupportMyCulturalIdentity',
        label: 'How you can support me to maintain my cultural identity',
        type: 'textarea',
        placeholder: 'Cultural support strategies',
        skipable: true
      },
      {
        key: 'myUseOfLanguage',
        label: 'What you need to know about my use of language',
        type: 'textarea',
        placeholder: 'Language preferences',
        skipable: true
      }
    ]
  },
  {
    id: 13,
    title: 'My Service Delivery Plan / Needs Assessment in Detail',
    description: 'Important people and organisations',
    fields: [
      {
        key: 'peopleAndOrganisationsImportantToMe',
        label: 'People and organisations which are important to me',
        type: 'textarea',
        placeholder: 'Key people and organisations',
        skipable: true
      }
    ]
  },
  // === PAGE 4: Beliefs ===
  {
    id: 14,
    title: 'Beliefs',
    description: '',
    fields: [
      {
        key: 'myBeliefs',
        label: 'These are my beliefs, which are important to me',
        type: 'textarea',
        placeholder: 'Describe their beliefs',
        skipable: true
      },
      {
        key: 'howToHelpSustainMyBeliefs',
        label: 'This is how you can help me sustain my beliefs',
        type: 'textarea',
        placeholder: 'Support strategies',
        skipable: true
      },
      {
        key: 'specificSupportInformation',
        label: 'Specific information which may be useful to help support me',
        type: 'textarea',
        placeholder: 'Additional support info',
        skipable: true
      }
    ]
  },
  // === PAGE 5: Maintenance / Prevention Outcomes (README order) ===
  outcomeStep(
    15,
    'My basic physical needs are being met',
    'physicalNeeds',
    'How you can help me with my physical health',
    'What are the identified risks?'
  ),
  outcomeStep(
    16,
    'Being clean and presentable in appearance',
    'cleanPresentable',
    'How you can help me being clean and presentable in appearance',
    'What (if any) are the identified risks?'
  ),
  // Having appropriate food and drink at appropriate times — split into 3 steps
  {
    id: 17,
    title: 'Having appropriate food and drink at appropriate times',
    description: 'What I can do and find difficult',
    fields: [
      mField('foodAndDrinkCanDo', 'What I can still do for myself'),
      mField('foodAndDrinkFindDifficult', 'What I find difficult')
    ]
  },
  {
    id: 18,
    title: 'Having appropriate food and drink at appropriate times',
    description: 'Preferences',
    fields: [
      mField('foodAndDrinkThingsIEnjoy', 'Things I enjoy'),
      mField('foodAndDrinkThingsIDoNotLike', 'Things I do not like'),
      mField(
        'foodAndDrinkHowAndWhereIPreferToEat',
        'This is how and where I prefer to eat'
      ),
      mField('foodAndDrinkThingsIMustHave', 'These are the things I must have')
    ]
  },
  {
    id: 19,
    title: 'Having appropriate food and drink at appropriate times',
    description: 'Support and risks',
    fields: [
      mField('foodAndDrinkHelp', 'How you can help me with eating and drinking'),
      mField('foodAndDrinkRisks', 'What (if any) are the identified risks?')
    ]
  },
  outcomeStep(
    20,
    'Being physically comfortable',
    'physicallyComfortable',
    'How you can help me being physically comfortable',
    'What (if any) are the identified risks?'
  ),
  outcomeStep(
    21,
    'Ensuring personal safety and security',
    'personalSafety',
    'How you can help me with my feel safe and secure',
    'What (if any) are the identified risks?'
  ),
  outcomeStep(
    22,
    'Having a clean and tidy home environment',
    'cleanTidyHome',
    'How you can help me have a clean and tidy home environment',
    'What (if any) are the identified risks?'
  ),
  outcomeStep(
    23,
    'Keeping alert and active',
    'alertAndActive',
    'How you can help me keep alert and active',
    'What (if any) are the identified risks?'
  ),
  outcomeStep(
    24,
    'Having social contact & company including opportunities to contribute as well as receive help',
    'socialContact',
    'How you can help me have contact and company',
    'What (if any) are the identified risks?'
  ),
  outcomeStep(
    25,
    'Having control over daily routines',
    'dailyRoutines',
    'How you can help me have control over daily routines',
    'What (if any) are the identified risks?'
  ),
  // === PAGE 6: Change Outcomes — split into two steps ===
  {
    id: 26,
    title: 'Improvements in physical symptoms and / or behaviour',
    description: '',
    fields: [
      mField(
        'physicalSymptomsHelpImprove',
        'How you can help me improve my physical symptoms'
      ),
      mField(
        'physicalSymptomsSupportImprove',
        'How you can support me to improve my behaviour'
      ),
      mField('physicalSymptomsOther', 'Other')
    ]
  },
  {
    id: 27,
    title: 'Improvements in morale and well-being',
    description: '',
    fields: [
      mField(
        'moraleWellbeingSupportImprove',
        'How you can support me to improve my morale & well-being'
      )
    ]
  },
  // === PAGE 7: Service Process Outcomes — split into two steps ===
  {
    id: 28,
    title: 'Service Process Outcomes',
    description: '',
    sections: [
      {
        title: 'Feeling valued and respected',
        fields: [
          mField(
            'feelingValuedRespectedSupport',
            'How you will treat and value me in a respectful, person-centred way'
          )
        ]
      },
      {
        title: 'Being treated as an individual',
        fields: [
          mField(
            'treatedAsIndividualSupport',
            'How you will treat me as an individual, and deliver support in the way I want it'
          )
        ]
      }
    ]
  },
  {
    id: 29,
    title: 'Service Process Outcomes',
    description: '',
    sections: [
      {
        title: 'Having a say and control over services',
        fields: [
          mField(
            'sayAndControlSupport',
            'How you will support me to have a say, and exercise control over the service I receive'
          )
        ]
      },
      {
        title: 'Compatibility with & respect for cultural & religious preferences',
        fields: [
          mField(
            'culturalReligiousCompatibilitySupport',
            'How you will ensure compatibility with & respect for my cultural & religious preferences'
          )
        ]
      }
    ]
  },
  // === PAGE 8: Sign-off ===
  {
    id: 30,
    title: 'Sign-off',
    description: 'Information source and assessment sign-off',
    sections: [
      {
        title: 'With information from: (please tick)',
        fields: [
          {
            key: 'informationFromPerson',
            label: 'Person',
            type: 'checkbox',
            skipable: true
          },
          {
            key: 'informationFromRelative',
            label: 'Relative',
            type: 'checkbox',
            skipable: true
          },
          {
            key: 'informationFromAgencies',
            label: 'Agencies',
            type: 'checkbox',
            skipable: true
          },
          {
            key: 'informationFromOther',
            label: 'Other',
            type: 'checkbox',
            skipable: true
          },
          {
            key: 'informationFromObservation',
            label: 'Observation',
            type: 'checkbox',
            skipable: true
          }
        ]
      },
      {
        title: 'Agreed with',
        fields: [
          {
            key: 'signatureOfPerson',
            label: 'Signature of Person',
            type: 'signature',
            skipable: true
          },
          {
            key: 'signatureOfRelative',
            label: 'Signature of Relative / Carer',
            type: 'signature',
            skipable: true
          }
        ]
      }
    ]
  },
  // Final review
  {
    id: 31,
    title: 'Review',
    description: 'Review all information before submitting',
    fields: [{ key: 'review', label: 'Review', type: 'review' }]
  }
];

function setNestedValue(
  obj: Record<string, unknown>,
  path: string,
  value: unknown
) {
  const keys = path.split('.');
  let current = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!current[key] || typeof current[key] !== 'object') {
      current[key] = {};
    }
    current = current[key] as Record<string, unknown>;
  }
  current[keys[keys.length - 1]] = value;
}

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object')
      return (acc as Record<string, unknown>)[key];
    return undefined;
  }, obj);
}

function toISODateString(date: Date | null | undefined): string | undefined {
  if (!date) return undefined;
  return new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  ).toISOString();
}

export default function CreateServiceUserAssessmentPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(() => {
    const saved = sessionStorage.getItem('assessmentCurrentStep');
    const step = saved ? Number(saved) : 0;
    if (step < 0 || step >= STEPS.length) {
      sessionStorage.removeItem('assessmentCurrentStep');
      sessionStorage.removeItem('assessmentRecordId');
      return 0;
    }
    return step;
  });
  const [recordId, setRecordId] = useState<string | null>(() => {
    return sessionStorage.getItem('assessmentRecordId') || null;
  });
  const [loading, setLoading] = useState(
    !!sessionStorage.getItem('assessmentRecordId')
  );
  const [submitting, setSubmitting] = useState(false);
  // "My critical care and support needs are" opens with one empty field visible,
  // matching the README (which lists 5 numbered blank lines on the paper form).
  const [formData, setFormData] = useState<Record<string, unknown>>({
    criticalCareAndSupportNeeds: ['']
  });
  const [signatureUrl, setSignatureUrl] = useState<string>('');
  const [signatureSaving, setSignatureSaving] = useState(false);
  const [personSigUrl, setPersonSigUrl] = useState<string | undefined>(
    undefined
  );
  const [relativeSigUrl, setRelativeSigUrl] = useState<string | undefined>(
    undefined
  );
  const [personSigSaving, setPersonSigSaving] = useState(false);
  const [relativeSigSaving, setRelativeSigSaving] = useState(false);
  const signatureRef = useRef<SignatureCanvas>(null);
  const personSignRef = useRef<SignatureCanvas>(null);
  const relativeSignRef = useRef<SignatureCanvas>(null);
  const stepRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const { user } = useSelector((state: any) => state.auth);
const [originalData, setOriginalData] = useState<Record<string, unknown>>({});

  const animateIn = useCallback(() => {
    if (stepRef.current) {
      gsap.fromTo(
        stepRef.current,
        { opacity: 0, x: 40 },
        { opacity: 1, x: 0, duration: 0.4, ease: 'power2.out' }
      );
    }
    if (contentRef.current) {
      const fields = contentRef.current.querySelectorAll('.step-field');
      gsap.fromTo(
        fields,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.3, stagger: 0.05, ease: 'power2.out' }
      );
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
        const res = await axiosInstance.get(
          `/serviceuser-assessment/${savedId}`
        );
        const recordData = res.data?.data;
        if (recordData) {
          // Store the original fetched data
          setOriginalData(recordData);
          
          setFormData((prev) => ({
            ...prev,
            ...recordData,
            // keep at least one visible input even if the saved record has none
            criticalCareAndSupportNeeds:
              Array.isArray(recordData.criticalCareAndSupportNeeds) &&
              recordData.criticalCareAndSupportNeeds.length > 0
                ? recordData.criticalCareAndSupportNeeds
                : ['']
          }));
          if (recordData.assessorSignature) {
            setSignatureUrl(recordData.assessorSignature);
          }
          if (recordData.signatureOfPerson) {
            setPersonSigUrl(recordData.signatureOfPerson);
          }
          if (recordData.signatureOfRelative) {
            setRelativeSigUrl(recordData.signatureOfRelative);
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

   useEffect(() => {
    return () => {
      sessionStorage.removeItem('assessmentRecordId');
      sessionStorage.removeItem('assessmentCurrentStep');
    };
  }, []);

  
  function getStepPayload(step: Step): Record<string, unknown> {
    const payload: Record<string, unknown> = {};
    const stepFields = getStepAllFields(step);
    stepFields.forEach((field) => {
      if (field.type === 'review') return;
      if (field.type === 'signature') {
        if (field.key === 'signatureOfPerson' && personSigUrl)
          payload.signatureOfPerson = personSigUrl;
        else if (field.key === 'signatureOfRelative' && relativeSigUrl)
          payload.signatureOfRelative = relativeSigUrl;
        else if (signatureUrl) payload.assessorSignature = signatureUrl;
        return;
      }
      let value = getNestedValue(formData, field.key);
      if (field.type === 'multi-text' && Array.isArray(value)) {
        // drop blank rows before saving
        value = (value as string[]).filter((v) => v && v.trim() !== '');
      }
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value) && value.length === 0) return;
        if (typeof value === 'string' && value.trim() === '') return;
        setNestedValue(payload, field.key, value);
      }
    });
    return payload;
  }

  const updateField = (key: string, value: unknown) => {
    setFormData((prev) => {
      const next = { ...prev };
      setNestedValue(next, key, value);
      return next;
    });
  };

  const persistStep = async (
    step: Step,
    isFinal: boolean
  ): Promise<boolean> => {
    try {
      setSubmitting(true);

      const payload = getStepPayload(step);

      if (isFinal) {
        payload.isCompleted = true;
        payload.completedBy = user._id;
        payload.completedDate = toISODateString(new Date());
      }
      payload.lastReviewedBy = user._id;
      payload.lastReviewedDate = toISODateString(new Date());

      if (!recordId) {
        const res = await axiosInstance.post(
          '/serviceuser-assessment',
          payload
        );
        const newId = res.data?.data?._id || res.data?.data?.id;
        if (newId) {
          setRecordId(newId);
        } else {
          toast({
            title: 'Error',
            description: 'Could not get record ID from creation',
            variant: 'destructive'
          });
          return false;
        }
      } else {
        try {
          await axiosInstance.patch(
            `/serviceuser-assessment/${recordId}`,
            payload
          );
        } catch (patchError: any) {
          // The stored record id is stale (e.g. it was already completed/removed
          // on the backend). Self-heal by creating a fresh record instead of
          // failing the whole step.
          if (patchError?.response?.status === 404) {
            sessionStorage.removeItem('assessmentRecordId');
            const res = await axiosInstance.post(
              '/serviceuser-assessment',
              payload
            );
            const newId = res.data?.data?._id || res.data?.data?.id;
            if (newId) {
              setRecordId(newId);
            } else {
              toast({
                title: 'Error',
                description: 'Could not get record ID from creation',
                variant: 'destructive'
              });
              return false;
            }
          } else {
            throw patchError;
          }
        }
      }

      if (isFinal) {
        toast({
          title: 'Assessment Created',
          description: 'The assessment has been saved successfully'
        });
      }
      return true;
    } catch (error: any) {
      toast({
        title: 'Error',
        description:
          error?.response?.data?.message || 'Failed to save this step',
        variant: 'destructive'
      });
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = async () => {
    if (currentStep >= STEPS.length - 1) return;
    const ok = await persistStep(STEPS[currentStep], false);
    if (!ok) return;
    gsap.to(stepRef.current, {
      opacity: 0,
      x: -40,
      duration: 0.2,
      ease: 'power2.in',
      onComplete: () => setCurrentStep((s) => s + 1)
    });
  };

  const handleSkip = () => {
    if (currentStep >= STEPS.length - 1) return;
    gsap.to(stepRef.current, {
      opacity: 0,
      x: -40,
      duration: 0.2,
      ease: 'power2.in',
      onComplete: () => setCurrentStep((s) => s + 1)
    });
  };

  const handleBack = () => {
    if (currentStep > 0) {
      gsap.to(stepRef.current, {
        opacity: 0,
        x: 40,
        duration: 0.2,
        ease: 'power2.in',
        onComplete: () => setCurrentStep((s) => s - 1)
      });
    }
  };

  const handleSubmit = async () => {
    const ok = await persistStep(STEPS[currentStep], true);
    if (!ok) return;
    sessionStorage.removeItem('assessmentRecordId');
    sessionStorage.removeItem('assessmentCurrentStep');
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
        const url =
          response.data?.data?.fileUrl ||
          response.data?.data?.url ||
          response.data?.url;
        if (url) {
          setSignatureUrl(url);
          updateField('assessorSignature', url);
        }
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description:
          error?.response?.data?.message || 'Failed to upload signature',
        variant: 'destructive'
      });
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

  const handleSavePersonSign = async () => {
    const dataUrl = personSignRef.current?.toDataURL();
    if (!dataUrl) return;
    setPersonSigSaving(true);
    try {
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], 'person-sign.png', { type: 'image/png' });
      const uploadFormData = new FormData();
      uploadFormData.append('entityId', user._id || '');
      uploadFormData.append('file_type', 'careerDoc');
      uploadFormData.append('file', file);
      const response = await axiosInstance.post('/documents', uploadFormData);
      if (response.status === 200) {
        const url =
          response.data?.data?.fileUrl ||
          response.data?.data?.url ||
          response.data?.url;
        if (url) {
          setPersonSigUrl(url);
          updateField('signatureOfPerson', url);
        }
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description:
          error?.response?.data?.message || 'Failed to upload signature',
        variant: 'destructive'
      });
    } finally {
      setPersonSigSaving(false);
    }
  };

  const handleClearPersonSign = () => {
    personSignRef.current?.clear();
  };

  const handleUpdatePersonSign = () => {
    setPersonSigUrl(undefined);
    personSignRef.current?.clear();
  };

  const handleSaveRelativeSign = async () => {
    const dataUrl = relativeSignRef.current?.toDataURL();
    if (!dataUrl) return;
    setRelativeSigSaving(true);
    try {
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], 'relative-sign.png', { type: 'image/png' });
      const uploadFormData = new FormData();
      uploadFormData.append('entityId', user._id || '');
      uploadFormData.append('file_type', 'careerDoc');
      uploadFormData.append('file', file);
      const response = await axiosInstance.post('/documents', uploadFormData);
      if (response.status === 200) {
        const url =
          response.data?.data?.fileUrl ||
          response.data?.data?.url ||
          response.data?.url;
        if (url) {
          setRelativeSigUrl(url);
          updateField('signatureOfRelative', url);
        }
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description:
          error?.response?.data?.message || 'Failed to upload signature',
        variant: 'destructive'
      });
    } finally {
      setRelativeSigSaving(false);
    }
  };

  const handleClearRelativeSign = () => {
    relativeSignRef.current?.clear();
  };

  const handleUpdateRelativeSign = () => {
    setRelativeSigUrl(undefined);
    relativeSignRef.current?.clear();
  };

  const step = STEPS[currentStep];
  const stepFields = getStepAllFields(step);
  const isFirst = currentStep === 0;
  const isLast = currentStep === STEPS.length - 1;
  const hasSkipable = stepFields.some((f) => f.skipable);

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center gap-4">
        <Button
          size="icon"
          onClick={() =>
            navigate('/dashboard/people-planner/serviceuser-assessment')
          }
          disabled={submitting}
          className="border-gray-300"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">
            Outcomes Based Service Delivery Plan
          </h1>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <BlinkingDots />
        </div>
      ) : (
        <>
          <Card ref={stepRef} className="w-full border-gray-300">
            <CardContent className="space-y-6 p-6">
              <div>
                <h2 className="text-xl font-semibold">{step.title}</h2>
                {/* <p className="text-sm ">{step.description}</p> */}
              </div>
              <Separator />
              <div ref={contentRef}>
                {stepFields.some((f) => f.type === 'review') ? (
                  <ReviewStep
                    formData={formData}
                     originalData={originalData}
                    signatureUrl={signatureUrl}
                    personSigUrl={personSigUrl}
                    relativeSigUrl={relativeSigUrl}
                  />
                ) : step.sections ? (
                  <div className="space-y-8">
                    {step.sections.map((section, si) => (
                      <div key={si} className="space-y-3">
                        <h3 className="text-base font-semibold text-gray-700">
                          {section.title}
                        </h3>
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                          {section.fields.map((field) => (
                            <FieldRenderer
                              key={field.key}
                              field={field}
                              formData={formData}
                              updateField={updateField}
                              signatureUrl={signatureUrl}
                              signatureRef={signatureRef}
                              onSaveSignature={handleSaveSignature}
                              onClearSignature={handleClearSignature}
                              onUpdateSignature={handleUpdateSignature}
                              signatureSaving={signatureSaving}
                              personSignRef={personSignRef}
                              personSigUrl={personSigUrl}
                              onSavePersonSign={handleSavePersonSign}
                              onClearPersonSign={handleClearPersonSign}
                              onUpdatePersonSign={handleUpdatePersonSign}
                              personSigSaving={personSigSaving}
                              relativeSignRef={relativeSignRef}
                              relativeSigUrl={relativeSigUrl}
                              onSaveRelativeSign={handleSaveRelativeSign}
                              onClearRelativeSign={handleClearRelativeSign}
                              onUpdateRelativeSign={handleUpdateRelativeSign}
                              relativeSigSaving={relativeSigSaving}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    {step.fields?.map((field) => (
                      <FieldRenderer
                        key={field.key}
                        field={field}
                        formData={formData}
                        updateField={updateField}
                        signatureUrl={signatureUrl}
                        signatureRef={signatureRef}
                        onSaveSignature={handleSaveSignature}
                        onClearSignature={handleClearSignature}
                        onUpdateSignature={handleUpdateSignature}
                        signatureSaving={signatureSaving}
                        personSignRef={personSignRef}
                        personSigUrl={personSigUrl}
                        onSavePersonSign={handleSavePersonSign}
                        onClearPersonSign={handleClearPersonSign}
                        onUpdatePersonSign={handleUpdatePersonSign}
                        personSigSaving={personSigSaving}
                        relativeSignRef={relativeSignRef}
                        relativeSigUrl={relativeSigUrl}
                        onSaveRelativeSign={handleSaveRelativeSign}
                        onClearRelativeSign={handleClearRelativeSign}
                        onUpdateRelativeSign={handleUpdateRelativeSign}
                        relativeSigSaving={relativeSigSaving}
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
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={submitting}
                  className="border-gray-300"
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              )}
            </div>
            <div className="flex items-center gap-3">
              {hasSkipable && !isLast && (
                <Button
                  variant="outline"
                  onClick={handleSkip}
                  disabled={submitting}
                >
                  Skip
                </Button>
              )}
              {isLast ? (
                <Button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="bg-watney text-white hover:bg-watney/90"
                >
                  {submitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  {submitting ? 'Saving...' : 'Save Assessment'}
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  disabled={submitting}
                  className="bg-watney text-white hover:bg-watney/90"
                >
                  {submitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
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

function getFieldDisplayValue(
  field: StepField,
  formData: Record<string, unknown>,
  signatureUrl: string,
  personSigUrl?: string,
  relativeSigUrl?: string
): string {
  if (field.type === 'signature') {
    if (field.key === 'signatureOfPerson')
      return personSigUrl ? 'Signature provided' : '—';
    if (field.key === 'signatureOfRelative')
      return relativeSigUrl ? 'Signature provided' : '—';
    return signatureUrl ? 'Signature provided' : '—';
  }
  if (field.type === 'multi-text') {
    const arr = getNestedValue(formData, field.key) as string[] | undefined;
    const filtered = arr ? arr.filter((v) => v && v.trim() !== '') : [];
    return filtered.length > 0 ? filtered.join(', ') : '—';
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
   originalData,
  signatureUrl,
  personSigUrl,
  relativeSigUrl
}: {
  formData: Record<string, unknown>;
  originalData: Record<string, unknown>;
  signatureUrl: string;
  personSigUrl?: string;
  relativeSigUrl?: string;
}) {
   const mergedData = { ...originalData, ...formData };
  
  const reviewSteps = STEPS.filter((s) => s.fields?.[0]?.type !== 'review');

  function hasFilledValue(field: StepField): boolean {
    if (field.type === 'signature') {
      if (field.key === 'signatureOfPerson') return !!personSigUrl;
      if (field.key === 'signatureOfRelative') return !!relativeSigUrl;
      return !!signatureUrl;
    }
    // Check both merged data and original data
    const val = getNestedValue(mergedData, field.key);
    const originalVal = getNestedValue(originalData, field.key);
    
    if (field.type === 'multi-text' && Array.isArray(val)) {
      return val.some((v) => v && String(v).trim() !== '');
    }
    if (Array.isArray(val)) return val.length > 0 && val.some(Boolean);
    if (typeof val === 'object') return Object.keys(val || {}).length > 0;
    
    // Show if value exists in either merged or original data
    const hasFormValue = val !== undefined && val !== null && val !== '';
    const hasOriginalValue = originalVal !== undefined && originalVal !== null && originalVal !== '';
    
    return hasFormValue || hasOriginalValue;
  }

  function renderFields(fields: StepField[]) {
    return fields.filter(hasFilledValue).map((field) => (
      <div key={field.key}>
        <span className="text-sm">{field.label}</span>
        <p className="text-sm font-medium">
          {getFieldDisplayValue(
            field,
            mergedData, // Use merged data
            signatureUrl,
            personSigUrl,
            relativeSigUrl
          )}
        </p>
      </div>
    ));
  }
  return (
    <div className="space-y-6">
      {reviewSteps.map((step) => {
        if (step.sections) {
          const filledSections = step.sections.filter((s) =>
            s.fields.some(hasFilledValue)
          );
          if (filledSections.length === 0) return null;
          return (
            <div
              key={step.id}
              className="space-y-4 rounded-lg border border-gray-300 p-4"
            >
              <h3 className="text-base font-semibold">{step.title}</h3>
              <Separator />
              {filledSections.map((section, si) => {
                const filled = section.fields.filter(hasFilledValue);
                if (filled.length === 0) return null;
                return (
                  <div key={si} className="space-y-2">
                    <p className="text-sm font-medium text-gray-600">
                      {section.title}
                    </p>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      {filled.map((field) => (
                        <div key={field.key}>
                          <span className="text-sm ">{field.label}</span>
                          <p className="text-sm font-medium">
                            {getFieldDisplayValue(
                              field,
                               mergedData,
                              signatureUrl,
                              personSigUrl,
                              relativeSigUrl
                            )}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        }

        const filledFields = (step.fields ?? []).filter(hasFilledValue);
        if (filledFields.length === 0) return null;

        return (
          <div
            key={step.id}
            className="space-y-3 rounded-lg border border-gray-300 p-4"
          >
            <h3 className="text-base font-semibold">{step.title}</h3>
            <Separator />
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {renderFields(filledFields)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MultiTextInput({
  value = [],
  onChange
}: {
  value?: string[];
  onChange: (val: string[]) => void;
  placeholder?: string;
}) {
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
          <Button
            type="button"
            variant="destructive"
            onClick={() => removeItem(i)}
            size="sm"
          >
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
  personSignRef,
  personSigUrl,
  onSavePersonSign,
  onClearPersonSign,
  onUpdatePersonSign,
  personSigSaving,
  relativeSignRef,
  relativeSigUrl,
  onSaveRelativeSign,
  onClearRelativeSign,
  onUpdateRelativeSign,
  relativeSigSaving
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
  personSignRef?: React.RefObject<SignatureCanvas>;
  personSigUrl?: string;
  onSavePersonSign?: () => void;
  onClearPersonSign?: () => void;
  onUpdatePersonSign?: () => void;
  personSigSaving?: boolean;
  relativeSignRef?: React.RefObject<SignatureCanvas>;
  relativeSigUrl?: string;
  onSaveRelativeSign?: () => void;
  onClearRelativeSign?: () => void;
  onUpdateRelativeSign?: () => void;
  relativeSigSaving?: boolean;
}) {
  const value = getNestedValue(formData, field.key);

  const isRequired = !field.skipable;

  if (field.type === 'signature') {
    const isPerson = field.key === 'signatureOfPerson';
    const isRelative = field.key === 'signatureOfRelative';
    const ref = isPerson
      ? personSignRef
      : isRelative
        ? relativeSignRef
        : signatureRef;
    const url = isPerson
      ? personSigUrl
      : isRelative
        ? relativeSigUrl
        : signatureUrl;
    const saving = isPerson
      ? personSigSaving
      : isRelative
        ? relativeSigSaving
        : signatureSaving;
    const onSave = isPerson
      ? onSavePersonSign
      : isRelative
        ? onSaveRelativeSign
        : onSaveSignature;
    const onClear = isPerson
      ? onClearPersonSign
      : isRelative
        ? onClearRelativeSign
        : onClearSignature;
    const onUpdate = isPerson
      ? onUpdatePersonSign
      : isRelative
        ? onUpdateRelativeSign
        : onUpdateSignature;

    return (
      <div className="step-field space-y-2 md:col-span-2">
        <Label>
          {field.label} {isRequired && <span className="text-red-500">*</span>}
        </Label>
        {url ? (
          <div className="flex max-w-sm flex-col items-start gap-3 rounded-lg border border-gray-300 bg-gray-50 p-4">
            <img
              src={url}
              alt="Signature"
              className="h-16 rounded border border-gray-300 bg-white object-contain"
            />
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={onUpdate}
              className="border-gray-300"
            >
              <Pencil className="mr-1 h-4 w-4" /> Update Signature
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="max-w-sm rounded-lg border border-gray-300 bg-white">
              <SignatureCanvas
                ref={ref}
                penColor="black"
                canvasProps={{
                  width: 400,
                  height: 120,
                  className: 'rounded-lg signature-canvas w-full max-w-sm'
                }}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClear}
                disabled={saving}
                className="border-gray-300"
              >
                Clear
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={onSave}
                disabled={saving}
                className="bg-watney text-white hover:bg-watney/90"
              >
                {saving ? (
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

  if (field.type === 'checkbox') {
    return (
      <div className="step-field flex items-center gap-3">
        <Checkbox
          id={field.key}
          checked={!!value}
          onCheckedChange={(checked) => updateField(field.key, !!checked)}
        />
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
          {field.label} (DD/MM/YYYY){' '}
          {isRequired && <span className="text-red-500">*</span>}
        </Label>
        <DatePicker
          selected={dateValue}
          onChange={(date: Date | null) =>
            updateField(field.key, toISODateString(date))
          }
          dateFormat="dd/MM/yyyy"
          placeholderText="Pick a date"
          wrapperClassName="w-full"
          showMonthDropdown
          portalId="root"
          showYearDropdown
          dropdownMode="select"
          className={cn(
            'placeholder: flex h-12 w-full rounded-xl border bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed',
            error ? 'border-red-500' : 'border-gray-300'
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
            {field.label}{' '}
            {isRequired && <span className="text-red-500">*</span>}
          </Label>
          <Button
            type="button"
            size="sm"
            onClick={() => {
              const arr = (value as string[]) || [];
              updateField(field.key, [...arr, '']);
            }}
            className="border-gray-300"
          >
            Add
          </Button>
        </div>
        <MultiTextInput
          value={(value as string[]) || []}
          onChange={(val) => updateField(field.key, val)}
        />
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
          className={cn('border-gray-300', error && 'border-red-500')}
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
          'border-gray-300',
          error && 'border-red-500 focus-visible:ring-red-500'
        )}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}