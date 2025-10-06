import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { useEffect, useState } from 'react';
import { CustomDatePicker } from '@/components/shared/CustomDatePicker';

// --- SCHEMA ---
const medicalHistorySchema = z.object({
  // All fields are optional with default value of false
  advisedMedicalWorkRestriction: z.boolean().default(false),
  advisedMedicalWorkRestrictionComment: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  dateOfBirth: z.date().nullable().optional(),
  jobRole: z.string().optional(),
  sex: z.enum(['male', 'female'], {
    required_error: 'Sex is required'
  }),

  undueFatigue: z.boolean().default(false),
  undueFatigueDetails: z.string().optional(),
  bronchitis: z.boolean().default(false),
  bronchitisDetails: z.string().optional(),
  breathlessness: z.boolean().default(false),
  breathlessnessDetails: z.string().optional(),
  allergies: z.boolean().default(false),
  allergiesDetails: z.string().optional(),
  pneumonia: z.boolean().default(false),
  pneumoniaDetails: z.string().optional(),
  hayFever: z.boolean().default(false),
  hayFeverDetails: z.string().optional(),
  shortnessOfBreath: z.boolean().default(false),
  shortnessOfBreathDetails: z.string().optional(),
  jundice: z.boolean().default(false),
  jundiceDetails: z.string().optional(),
  stomachProblems: z.boolean().default(false),
  stomachProblemsDetails: z.string().optional(),
  stomachUlcer: z.boolean().default(false),
  stomachUlcerDetails: z.string().optional(),
  hernias: z.boolean().default(false),
  herniasDetails: z.string().optional(),
  bowelProblem: z.boolean().default(false),
  bowelProblemDetails: z.string().optional(),
  diabetesMellitus: z.boolean().default(false),
  diabetesMellitusDetails: z.string().optional(),
  nervousDisorder: z.boolean().default(false),
  nervousDisorderDetails: z.string().optional(),
  dizziness: z.boolean().default(false),
  dizzinessDetails: z.string().optional(),
  earProblems: z.boolean().default(false),
  earProblemsDetails: z.string().optional(),
  hearingDefect: z.boolean().default(false),
  hearingDefectDetails: z.string().optional(),
  epilepsy: z.boolean().default(false),
  epilepsyDetails: z.string().optional(),
  eyeProblems: z.boolean().default(false),
  eyeProblemsDetails: z.string().optional(),
  ppeAllergy: z.boolean().default(false),
  ppeAllergyDetails: z.string().optional(),

  rheumaticFever: z.boolean().default(false),
  rheumaticFeverDetails: z.string().optional(),
  highBloodPressure: z.boolean().default(false),
  highBloodPressureDetails: z.string().optional(),
  lowBloodPressure: z.boolean().default(false),
  lowBloodPressureDetails: z.string().optional(),
  palpitations: z.boolean().default(false),
  palpitationsDetails: z.string().optional(),
  heartAttack: z.boolean().default(false),
  heartAttackDetails: z.string().optional(),
  angina: z.boolean().default(false),
  anginaDetails: z.string().optional(),
  asthma: z.boolean().default(false),
  asthmaDetails: z.string().optional(),
  chronicLungProblems: z.boolean().default(false),
  chronicLungProblemsDetails: z.string().optional(),
  stroke: z.boolean().default(false),
  strokeDetails: z.string().optional(),
  heartMurmur: z.boolean().default(false),
  heartMurmurDetails: z.string().optional(),
  backProblems: z.boolean().default(false),
  backProblemsDetails: z.string().optional(),
  jointProblems: z.boolean().default(false),
  jointProblemsDetails: z.string().optional(),
  swollenLegs: z.boolean().default(false),
  swollenLegsDetails: z.string().optional(),
  varicoseVeins: z.boolean().default(false),
  varicoseVeinsDetails: z.string().optional(),
  rheumatism: z.boolean().default(false),
  rheumatismDetails: z.string().optional(),
  migraine: z.boolean().default(false),
  migraineDetails: z.string().optional(),
  drugReaction: z.boolean().default(false),
  drugReactionDetails: z.string().optional(),
  visionCorrection: z.boolean().default(false),
  visionCorrectionDetails: z.string().optional(),
  skinConditions: z.boolean().default(false),
  skinConditionsDetails: z.string().optional(),
  alcoholHealthProblems: z.boolean().default(false),
  alcoholHealthProblemsDetails: z.string().optional(),

  seriousIllnessDetails: z.string().optional(),

  recentIllHealth: z.boolean().default(false),
  recentIllHealthComment: z.string().optional(),
  attendingClinic: z.boolean().default(false),
  attendingClinicComment: z.string().optional(),
  hadChickenPox: z.boolean().default(false),
  hadChickenPoxComment: z.string().optional(),
  otherCommunicableDisease: z.boolean().default(false),
  otherCommunicableDiseaseComment: z.string().optional(),

  inocDiphtheria: z.boolean().default(false),
  inocDiphtheriaComment: z.string().optional(),
  inocHepatitisB: z.boolean().default(false),
  inocHepatitisBComment: z.string().optional(),
  inocTuberculosis: z.boolean().default(false),
  inocTuberculosisComment: z.string().optional(),
  inocRubella: z.boolean().default(false),
  inocRubellaComment: z.string().optional(),
  inocVaricella: z.boolean().default(false),
  inocVaricellaComment: z.string().optional(),
  inocPolio: z.boolean().default(false),
  inocPolioComment: z.string().optional(),
  inocTetanus: z.boolean().default(false),
  inocTetanusComment: z.string().optional(),
  testedHIV: z.boolean().default(false),
  testedHIVComment: z.string().optional(),
  inocOther: z.string().optional(),
  inocOtherComment: z.string().optional(),

  daysSickLastYear: z.string().optional(),

  // ✅ CONSENT & DECLARATION FIELDS - Fixed to use proper boolean with default
  consentMedicalDeclaration: z.boolean().default(false).refine((val) => val === true, {
    message: 'Required'
  }),
  consentVaccination: z.boolean().default(false).refine((val) => val === true, {
    message: 'Required'
  }),
  consentTerminationClause: z.boolean().default(false).refine((val) => val === true, {
    message: 'Required'
  }),

  // ✅ GDPR DECLARATION FIELDS - Fixed to use proper boolean with default
  declarationCorrectUpload: z.boolean().default(false),
  declarationContactReferee: z.boolean().default(false),
  disciplinaryInvestigation: z.boolean().default(false),
  disciplinaryInvestigationDetails: z.string().optional(),
  abuseInvestigation: z.boolean().default(false),
  abuseInvestigationDetails: z.string().optional(),
  appliedBefore: z.boolean().default(false),
});

export type MedicalHistoryFormValues = z.infer<typeof medicalHistorySchema>;

// Define step structure - UPDATED to include GDPR fields in step 1
const STEPS = [
  // {
  //   id: 1,
  //   title: 'Consent & Declaration',
  //   fields: [
  //     'consentMedicalDeclaration',
  //     'consentVaccination',
  //     'consentTerminationClause',
  //     'declarationCorrectUpload',
  //     'declarationContactReferee',
  //     'disciplinaryInvestigation',
  //     'disciplinaryInvestigationDetails',
  //     'abuseInvestigation',
  //     'abuseInvestigationDetails',
  //     'appliedBefore'
  //   ]
  // },
  {
    id: 1,
    title: 'Personal Information',
    fields: ['firstName', 'lastName', 'dateOfBirth', 'jobRole', 'sex']
  },
  {
    id: 2,
    title: 'Occupational History',
    fields: [
      'advisedMedicalWorkRestriction',
      'advisedMedicalWorkRestrictionComment'
    ]
  },
  {
    id: 3,
    title: 'Past Medical History',
    fields: [
      'undueFatigue',
      'undueFatigueDetails',
      'bronchitis',
      'bronchitisDetails',
      'breathlessness',
      'breathlessnessDetails',
      'allergies',
      'allergiesDetails',
      'pneumonia',
      'pneumoniaDetails',
      'hayFever',
      'hayFeverDetails',
      'shortnessOfBreath',
      'shortnessOfBreathDetails',
      'jundice',
      'jundiceDetails',
      'stomachProblems',
      'stomachProblemsDetails',
      'stomachUlcer',
      'stomachUlcerDetails',
      'hernias',
      'herniasDetails',
      'bowelProblem',
      'bowelProblemDetails',
      'diabetesMellitus',
      'diabetesMellitusDetails',
      'nervousDisorder',
      'nervousDisorderDetails',
      'dizziness',
      'dizzinessDetails',
      'earProblems',
      'earProblemsDetails',
      'hearingDefect',
      'hearingDefectDetails',
      'epilepsy',
      'epilepsyDetails',
      'eyeProblems',
      'eyeProblemsDetails',
      'ppeAllergy',
      'ppeAllergyDetails'
    ]
  },
  {
    id: 4,
    title: 'Additional Medical Conditions',
    fields: [
      'rheumaticFever',
      'rheumaticFeverDetails',
      'highBloodPressure',
      'highBloodPressureDetails',
      'lowBloodPressure',
      'lowBloodPressureDetails',
      'palpitations',
      'palpitationsDetails',
      'heartAttack',
      'heartAttackDetails',
      'angina',
      'anginaDetails',
      'asthma',
      'asthmaDetails',
      'chronicLungProblems',
      'chronicLungProblemsDetails',
      'stroke',
      'strokeDetails',
      'heartMurmur',
      'heartMurmurDetails',
      'backProblems',
      'backProblemsDetails',
      'jointProblems',
      'jointProblemsDetails',
      'swollenLegs',
      'swollenLegsDetails',
      'varicoseVeins',
      'varicoseVeinsDetails',
      'rheumatism',
      'rheumatismDetails',
      'migraine',
      'migraineDetails',
      'drugReaction',
      'drugReactionDetails',
      'visionCorrection',
      'visionCorrectionDetails',
      'skinConditions',
      'skinConditionsDetails',
      'alcoholHealthProblems',
      'alcoholHealthProblemsDetails'
    ]
  },
  { id: 5, title: 'Serious Illness', fields: ['seriousIllnessDetails'] },
  {
    id: 6,
    title: 'Specific Questions',
    fields: [
      'recentIllHealth',
      'recentIllHealthComment',
      'attendingClinic',
      'attendingClinicComment',
      'hadChickenPox',
      'hadChickenPoxComment',
      'otherCommunicableDisease',
      'otherCommunicableDiseaseComment'
    ]
  },
  {
    id: 7,
    title: 'Inoculations',
    fields: [
      'inocDiphtheria',
      'inocDiphtheriaComment',
      'inocHepatitisB',
      'inocHepatitisBComment',
      'inocTuberculosis',
      'inocTuberculosisComment',
      'inocRubella',
      'inocRubellaComment',
      'inocVaricella',
      'inocVaricellaComment',
      'inocPolio',
      'inocPolioComment',
      'inocTetanus',
      'inocTetanusComment',
      'testedHIV',
      'testedHIVComment',
      'inocOther',
      'inocOtherComment'
    ]
  },
  { id: 8, title: 'Additional Information', fields: ['daysSickLastYear'] }
];

// --- COMPONENT ---
export function PostEmployementStep({
  defaultValues,
  onSaveAndContinue,
  setCurrentStep,
  onSave,
  subStep,
  subStepInfo,
  onSubStepChange,
  saveAndLogout
}) {
  const [currentStep, setCurrentStepState] = useState(subStep || 1);
  const totalSteps = STEPS.length;

  // Fixed form initialization with proper default values for all fields
  const form = useForm({
    resolver: zodResolver(medicalHistorySchema),
    defaultValues: {
      // Personal Information
      firstName: defaultValues?.firstName || '',
      lastName: defaultValues?.lastName || '',
      dateOfBirth: defaultValues?.dateOfBirth ? new Date(defaultValues.dateOfBirth) : null,
      jobRole: defaultValues?.jobRole || '',
      sex: defaultValues?.sex || undefined,

      // Consent & Declaration Fields
      // consentMedicalDeclaration: defaultValues?.consentMedicalDeclaration ?? false,
      // consentVaccination: defaultValues?.consentVaccination ?? false,
      // consentTerminationClause: defaultValues?.consentTerminationClause ?? false,

      // GDPR Declaration Fields
      // declarationCorrectUpload: defaultValues?.declarationCorrectUpload ?? false,
      // declarationContactReferee: defaultValues?.declarationContactReferee ?? false,
      // disciplinaryInvestigation: defaultValues?.disciplinaryInvestigation ?? false,
      // disciplinaryInvestigationDetails: defaultValues?.disciplinaryInvestigationDetails || '',
      // abuseInvestigation: defaultValues?.abuseInvestigation ?? false,
      // abuseInvestigationDetails: defaultValues?.abuseInvestigationDetails || '',
      // appliedBefore: defaultValues?.appliedBefore ?? false,

      // Occupational History
      advisedMedicalWorkRestriction: defaultValues?.advisedMedicalWorkRestriction ?? false,
      advisedMedicalWorkRestrictionComment: defaultValues?.advisedMedicalWorkRestrictionComment || '',

      // Initialize all boolean fields with false if not provided
      ...Object.keys(medicalHistorySchema.shape).reduce((acc, key) => {
        const schemaField = medicalHistorySchema.shape[key];
        if (schemaField?._def?.typeName === 'ZodBoolean' && !(key in acc)) {
          acc[key] = false;
        } else if (schemaField?._def?.typeName === 'ZodString' && !(key in acc)) {
          acc[key] = '';
        }
        return acc;
      }, {})
    }
  });

  // const watchDisciplinary = form.watch('disciplinaryInvestigation');
  // const watchAbuse = form.watch('abuseInvestigation');

  // Fixed useEffect for form reset
  useEffect(() => {
    if (defaultValues) {
      // Create a clean object with only valid schema fields
      const validKeys = Object.keys(medicalHistorySchema.shape);
      const sanitizedValues = {};

      validKeys.forEach((key) => {
        if (key === 'dateOfBirth') {
          sanitizedValues[key] = defaultValues.dateOfBirth
            ? new Date(defaultValues.dateOfBirth)
            : null;
        } else if (defaultValues[key] !== undefined) {
          sanitizedValues[key] = defaultValues[key];
        } else {
          // Set default values for undefined fields
          const schemaField = medicalHistorySchema.shape[key];
          if (schemaField?._def?.typeName === 'ZodBoolean') {
            sanitizedValues[key] = false;
          } else if (schemaField?._def?.typeName === 'ZodString') {
            sanitizedValues[key] = '';
          }
        }
      });

      form.reset(sanitizedValues);
    }
  }, [defaultValues, form]);

  const handleNext = async (e?: React.MouseEvent | React.KeyboardEvent) => {
    e?.preventDefault();
    e?.stopPropagation();

    const currentStepFields = STEPS[currentStep - 1].fields;
    const isValid = await form.trigger(currentStepFields as any);

    if (isValid) {
      const currentStepData = currentStepFields.reduce((acc, field) => {
        acc[field] = form.getValues(field as keyof MedicalHistoryFormValues);
        return acc;
      }, {} as Partial<MedicalHistoryFormValues>);

      if (onSave) onSave(currentStepData);

      if (currentStep < totalSteps) {
        const nextStep = currentStep + 1;
        setCurrentStepState(nextStep);
        if (onSubStepChange) {
          onSubStepChange(nextStep);
        }
      }
    }
  };

  const handleNextClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleNext(e);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      if (currentStep < totalSteps) {
        handleNext(e);
      }
    }
  };

  const handleBack = () => {
    if (currentStep === 1) {
      const currentFormData = form.getValues();
      if (onSave) onSave(currentFormData);

      if (setCurrentStep) {
        setCurrentStep(13);
      }
    } else {
      const currentStepFields = STEPS[currentStep - 1].fields;
      const currentStepData = currentStepFields.reduce((acc, field) => {
        acc[field] = form.getValues(field as keyof MedicalHistoryFormValues);
        return acc;
      }, {} as Partial<MedicalHistoryFormValues>);

      if (onSave) onSave(currentStepData);

      const prevStep = currentStep - 1;
      setCurrentStepState(prevStep);
      if (onSubStepChange) {
        onSubStepChange(prevStep);
      }
    }
  };

  const handleSubmit = async () => {
    const currentStepFields = STEPS[currentStep - 1].fields;
    const isValid = await form.trigger(currentStepFields as any);

    if (!isValid) {
      return;
    }

    const allFormData = form.getValues();
    if (onSaveAndContinue) {
      onSaveAndContinue(allFormData);
    }
  };

  const onSubmit = async (
    data: MedicalHistoryFormValues,
    e?: React.BaseSyntheticEvent
  ) => {
    e?.preventDefault();
    e?.stopPropagation();
    await handleSubmit();
  };

  const renderCheckboxField = (
    name: keyof MedicalHistoryFormValues,
    label: string,
    commentName?: keyof MedicalHistoryFormValues
  ) => (
    <div className="grid grid-cols-1 items-start gap-4 border-b border-gray-100 py-3 sm:grid-cols-3">
      <FormLabel className="self-center font-medium text-lg">{label}</FormLabel>

      <FormField
        control={form.control}
        name={name}
        render={({ field }) => (
          <FormItem className="flex items-center space-x-6">
            <div className="mt-2 flex items-center space-x-2">
              <Checkbox
                checked={field.value === true}
                onCheckedChange={() => field.onChange(true)}
                id={`${String(name)}-yes`}
              />
              <label
                htmlFor={`${String(name)}-yes`}
                className="text-lg font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Yes
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                checked={field.value === false}
                onCheckedChange={() => field.onChange(false)}
                id={`${String(name)}-no`}
              />
              <label
                htmlFor={`${String(name)}-no`}
                className="text-lg font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                No
              </label>
            </div>

            <FormMessage />
          </FormItem>
        )}
      />

      {commentName && (
        <FormField
          control={form.control}
          name={commentName}
          render={({ field }) => {
            const isDisabled = form.watch(name) !== true && !form.getValues(commentName);

            return (
              <FormItem>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Details (if Yes)..."
                    className={`w-full border ${isDisabled ? 'border-gray-300 bg-gray-100' : 'border-black'
                      } `}
                    disabled={isDisabled}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />
      )}

      {!commentName && <div></div>}
    </div>
  );

  const renderSection = (title: string, children: React.ReactNode) => (
    <div className="space-y-2 text-lg">{children}</div>
  );

  // Render current step content
  const renderCurrentStep = () => {
    const step = STEPS[currentStep - 1];

    switch (step.id) {
      // case 1:
      //   return renderSection(
      //     'Consent & Declaration',
      //     <div className="space-y-6">
      //       {/* Night Working Notice */}
      //       <div className="rounded-md bg-blue-50 p-4 text-blue-800 text-lg">
      //         <strong>Night Working:</strong> Employees who are regularly
      //         required to work more than three hours a shift between 11.00 p.m.
      //         and 6.00 a.m. are entitled to a regular assessment of their
      //         suitability to work nights. If you would like the opportunity to
      //         have a free health assessment, you must contact management at any
      //         time.
      //       </div>

      //       {/* Consent Checkboxes */}
      //       <FormField
      //         control={form.control}
      //         name="consentMedicalDeclaration"
      //         render={({ field }) => (
      //           <FormItem className="flex items-start space-x-3 space-y-0">
      //             <FormControl>
      //               <Checkbox
      //                 checked={field.value}
      //                 onCheckedChange={field.onChange}
      //               />
      //             </FormControl>
      //             <div className="space-y-1 leading-none">
      //               <FormLabel className="text-lg">
      //                 I declare that the information I have given on this
      //                 document is, to the best of my knowledge, a true and
      //                 complete account of my medical history.
      //               </FormLabel>
      //             </div>
      //             <FormMessage className="text-md" />
      //           </FormItem>
      //         )}
      //       />

      //       <FormField
      //         control={form.control}
      //         name="consentVaccination"
      //         render={({ field }) => (
      //           <FormItem className="flex items-start space-x-3 space-y-0">
      //             <FormControl>
      //               <Checkbox
      //                 checked={field.value}
      //                 onCheckedChange={field.onChange}
      //               />
      //             </FormControl>
      //             <div className="space-y-1 leading-none">
      //               <FormLabel className="text-lg">
      //                 I understand and accept that it will be a condition of my
      //                 contract of employment to be fully immunised (if not
      //                 already) against Hepatitis B, Tuberculosis and Rubella
      //                 within the first three months of my employment and remain
      //                 regularly immunised.
      //               </FormLabel>
      //             </div>
      //             <FormMessage className="text-md" />
      //           </FormItem>
      //         )}
      //       />

      //       <FormField
      //         control={form.control}
      //         name="consentTerminationClause"
      //         render={({ field }) => (
      //           <FormItem className="flex items-start space-x-3 space-y-0">
      //             <FormControl>
      //               <Checkbox
      //                 checked={field.value}
      //                 onCheckedChange={field.onChange}
      //               />
      //             </FormControl>
      //             <div className="space-y-1 leading-none">
      //               <FormLabel className="text-lg">
      //                 I understand and accept that if I do not comply with the
      //                 above obligations or should any information come to light
      //                 following my employment with Everycare Romford which shows
      //                 that medical information disclosed by myself was
      //                 misleading or false, Everycare Romford may terminate my
      //                 employment.
      //               </FormLabel>
      //             </div>
      //             <FormMessage className="text-md" />
      //           </FormItem>
      //         )}
      //       />

      //       {/* <div className="overflow-x-auto">
      //         <h1 className='font-bold text-2xl mt-16'> GDPR Declaration</h1>
      //         <table className="w-full border-collapse text-lg">
      //           <tbody>
           
      //             <tr className="border-b border-gray-300">
      //               <td className="py-4 align-bottom w-32 ">
      //                 <FormField
      //                   control={form.control}
      //                   name="declarationContactReferee"
      //                   render={({ field }) => (
      //                     <FormItem>
      //                       <div className="flex gap-4">
      //                         <FormControl>
      //                           <label className="flex items-center cursor-pointer">
      //                             <Checkbox
      //                               checked={field.value === true}
      //                               onCheckedChange={() => field.onChange(true)}
      //                             />
      //                             <FormLabel className="ml-2 text-lg cursor-pointer">Yes</FormLabel>
      //                           </label>
      //                         </FormControl>
      //                         <FormControl>
      //                           <label className="flex items-center cursor-pointer">
      //                             <Checkbox
      //                               checked={field.value === false}
      //                               onCheckedChange={() => field.onChange(false)}
      //                             />
      //                             <FormLabel className="ml-2 text-lg cursor-pointer">No</FormLabel>
      //                           </label>
      //                         </FormControl>
      //                       </div>
      //                       <FormMessage className="text-md" />
      //                     </FormItem>
      //                   )}
      //                 />
      //               </td>
      //               <td className=" px-4 py-4 align-top">
      //                 <span className="text-lg font-medium">
      //                   I,&nbsp;
      //                   <span className="font-medium">
      //                     {defaultValues?.title} {defaultValues?.firstName}{' '}
      //                     {defaultValues?.initial} {defaultValues?.lastName}
      //                   </span>
      //                   , hereby authorize Everycare Romford to contact the mentioned referees to avail my reference as a part of the recruitment process.
      //                   <span className="text-red-500">*</span>
      //                 </span>
      //               </td>
      //             </tr>

      //             <tr>
      //               <td colSpan={2} className="py-2"></td>
      //             </tr>

           
      //             <tr className="border-b border-gray-300">
      //               <td className=" py-4 align-top w-32">
      //                 <FormField
      //                   control={form.control}
      //                   name="declarationCorrectUpload"
      //                   render={({ field }) => (
      //                     <FormItem>
      //                       <div className="flex gap-4">
      //                         <FormControl>
      //                           <label className="flex items-center cursor-pointer">
      //                             <Checkbox
      //                               checked={field.value === true}
      //                               onCheckedChange={() => field.onChange(true)}
      //                             />
      //                             <FormLabel className="ml-2 text-lg cursor-pointer">Yes</FormLabel>
      //                           </label>
      //                         </FormControl>
      //                         <FormControl>
      //                           <label className="flex items-center cursor-pointer">
      //                             <Checkbox
      //                               checked={field.value === false}
      //                               onCheckedChange={() => field.onChange(false)}
      //                             />
      //                             <FormLabel className="ml-2 text-lg cursor-pointer">No</FormLabel>
      //                           </label>
      //                         </FormControl>
      //                       </div>
      //                       <FormMessage className="text-md" />
      //                     </FormItem>
      //                   )}
      //                 />
      //               </td>
      //               <td className="px-4 py-4 align-top">
      //                 <span className="text-lg font-medium">
      //                   Do you declare that all uploaded documents and information are correct and authentic?{' '}
      //                   <span className="text-red-500">*</span>
      //                 </span>
      //               </td>
      //             </tr>

                  
      //             <tr className="border-b border-gray-300">
      //               <td className=" py-4 align-top w-32">
      //                 <FormField
      //                   control={form.control}
      //                   name="disciplinaryInvestigation"
      //                   render={({ field }) => (
      //                     <FormItem>
      //                       <div className="flex gap-4">
      //                         <FormControl>
      //                           <label className="flex items-center cursor-pointer">
      //                             <Checkbox
      //                               checked={field.value === true}
      //                               onCheckedChange={() => field.onChange(true)}
      //                             />
      //                             <FormLabel className="ml-2 text-lg cursor-pointer">Yes</FormLabel>
      //                           </label>
      //                         </FormControl>
      //                         <FormControl>
      //                           <label className="flex items-center cursor-pointer">
      //                             <Checkbox
      //                               checked={field.value === false}
      //                               onCheckedChange={() => field.onChange(false)}
      //                             />
      //                             <FormLabel className="ml-2 text-lg cursor-pointer">No</FormLabel>
      //                           </label>
      //                         </FormControl>
      //                       </div>
      //                       <FormMessage className="text-md" />
      //                     </FormItem>
      //                   )}
      //                 />
      //               </td>
      //               <td className="px-4 py-4 align-top">
      //                 <span className="text-lg font-medium">
      //                   Have you ever been subject to a disciplinary investigation by an employer, or been required to attend such a process (whether or not this resulted in dismissal)?{' '}
      //                   <span className="text-red-500">*</span>
      //                 </span>
      //               </td>
      //             </tr>

      //             {watchDisciplinary && (
      //               <tr className="border-b border-gray-300">
      //                 <td colSpan={2} className=" py-4">
      //                   <FormField
      //                     control={form.control}
      //                     name="disciplinaryInvestigationDetails"
      //                     render={({ field }) => (
      //                       <FormItem>
      //                         <FormLabel className="text-watney">
      //                           Please provide details and outcome{' '}
      //                           <span className="text-red-500">*</span>
      //                         </FormLabel>
      //                         <FormControl>
      //                           <Textarea
      //                             placeholder="Enter details here..."
      //                             className="min-h-[100px] p-4 text-lg mt-2 w-full"
      //                             {...field}
      //                           />
      //                         </FormControl>
      //                         <FormMessage className="text-md" />
      //                       </FormItem>
      //                     )}
      //                   />
      //                 </td>
      //               </tr>
      //             )}

      //             <tr className="border-b border-gray-300">
      //               <td className=" py-4 align-top w-32">
      //                 <FormField
      //                   control={form.control}
      //                   name="abuseInvestigation"
      //                   render={({ field }) => (
      //                     <FormItem>
      //                       <div className="flex gap-4">
      //                         <FormControl>
      //                           <label className="flex items-center cursor-pointer">
      //                             <Checkbox
      //                               checked={field.value === true}
      //                               onCheckedChange={() => field.onChange(true)}
      //                             />
      //                             <FormLabel className="ml-2 text-lg cursor-pointer">Yes</FormLabel>
      //                           </label>
      //                         </FormControl>
      //                         <FormControl>
      //                           <label className="flex items-center cursor-pointer">
      //                             <Checkbox
      //                               checked={field.value === false}
      //                               onCheckedChange={() => field.onChange(false)}
      //                             />
      //                             <FormLabel className="ml-2 text-lg cursor-pointer">No</FormLabel>
      //                           </label>
      //                         </FormControl>
      //                       </div>
      //                       <FormMessage className="text-md" />
      //                     </FormItem>
      //                   )}
      //                 />
      //               </td>
      //               <td className="px-4 py-4 align-top">
      //                 <span className="text-lg font-medium">
      //                   Have you ever been investigated or been involved (in any way) in an investigation/enquiry regarding abuse or any other inappropriate behaviour?{' '}
      //                   <span className="text-red-500">*</span>
      //                 </span>
      //               </td>
      //             </tr>

      //             {watchAbuse && (
      //               <tr className="border-b border-gray-300">
      //                 <td colSpan={2} className=" py-4">
      //                   <FormField
      //                     control={form.control}
      //                     name="abuseInvestigationDetails"
      //                     render={({ field }) => (
      //                       <FormItem>
      //                         <FormLabel className="text-watney">
      //                           Please provide details and outcome{' '}
      //                           <span className="text-red-500">*</span>
      //                         </FormLabel>
      //                         <FormControl>
      //                           <Textarea
      //                             placeholder="Enter details here..."
      //                             className="min-h-[100px] p-4 text-lg mt-2 w-full"
      //                             {...field}
      //                           />
      //                         </FormControl>
      //                         <FormMessage className="text-md" />
      //                       </FormItem>
      //                     )}
      //                   />
      //                 </td>
      //               </tr>
      //             )}

      //             <tr className="border-b border-gray-300">
      //               <td className=" py-4 align-top w-32">
      //                 <FormField
      //                   control={form.control}
      //                   name="appliedBefore"
      //                   render={({ field }) => (
      //                     <FormItem>
      //                       <div className="flex gap-4">
      //                         <FormControl>
      //                           <label className="flex items-center cursor-pointer">
      //                             <Checkbox
      //                               checked={field.value === true}
      //                               onCheckedChange={() => field.onChange(true)}
      //                             />
      //                             <FormLabel className="ml-2 text-lg cursor-pointer">Yes</FormLabel>
      //                           </label>
      //                         </FormControl>
      //                         <FormControl>
      //                           <label className="flex items-center cursor-pointer">
      //                             <Checkbox
      //                               checked={field.value === false}
      //                               onCheckedChange={() => field.onChange(false)}
      //                             />
      //                             <FormLabel className="ml-2 text-lg cursor-pointer">No</FormLabel>
      //                           </label>
      //                         </FormControl>
      //                       </div>
      //                       <FormMessage className="text-md" />
      //                     </FormItem>
      //                   )}
      //                 />
      //               </td>
      //               <td className="px-4 py-4 align-top">
      //                 <span className="text-lg font-medium">
      //                   Have you previously applied for a role with this organisation? <span className="text-red-500">*</span>
      //                 </span>
      //               </td>
      //             </tr>
      //           </tbody>
      //         </table>
      //       </div> */}
      //     </div>
      //   );
      case 1:
        return renderSection(
          'Employee Personal Information',
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* First Name */}
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-medium">Employee Forename</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="First Name"
                      disabled
                      className=" placeholder:text-gray-500"
                    />
                  </FormControl>
                  <FormMessage className="text-md" />
                </FormItem>
              )}
            />

            {/* Last Name */}
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-medium">Employee Surename</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Last Name"
                      disabled
                      className=" placeholder:text-gray-500"
                    />
                  </FormControl>
                  <FormMessage className="text-md" />
                </FormItem>
              )}
            />

            {/* Date of Birth - Fixed version */}
            <FormField
              control={form.control}
              name="dateOfBirth"
              render={({ field }) => {
                let value: Date | null = null;

                if (field.value) {
                  value =
                    field.value instanceof Date
                      ? field.value
                      : new Date(field.value);

                  if (isNaN(value.getTime())) value = null; // Invalid date fallback
                }

                return (
                  <FormItem className="mt-2 flex w-full flex-col">
                    <FormLabel className="text-lg font-medium">Date of Birth (MM/DD/YYYY)</FormLabel>
                    <FormControl className="w-full">
                      <CustomDatePicker
                        selected={value}
                        onChange={(date) =>
                          field.onChange(
                            date instanceof Date && !isNaN(date.getTime())
                              ? date
                              : null
                          )
                        }
                        placeholder="Use your official birth date"
                        disabled
                      />
                    </FormControl>
                    <p className="text-md text-gray-400">
                      Example: MM/DD/YYYY or 01/24/1995
                    </p>
                    <FormMessage className="text-md" />
                  </FormItem>
                );
              }}
            />

            {/* Job Role / Position Applied For */}
            <FormField
              control={form.control}
              name="jobRole"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-medium">Position Applied For</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Job Role"
                      disabled
                      className=" placeholder:text-gray-500"
                    />
                  </FormControl>
                  <FormMessage className="text-md" />
                </FormItem>
              )}
            />

            {/* Sex */}
            <FormField
              control={form.control}
              name="sex"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-4">
                  <FormLabel className="mt-2 text-lg font-medium">
                    Sex <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="flex space-x-4">
                      <label className="flex items-center space-x-1 text-lg">
                        <Checkbox
                          checked={field.value === 'male'}

                          onCheckedChange={() => field.onChange('male')}
                        />
                        <span>Male</span>
                      </label>
                      <label className="flex items-center space-x-1 text-lg">
                        <Checkbox


                          checked={field.value === 'female'}
                          onCheckedChange={() => field.onChange('female')}
                        />
                        <span>Female</span>
                      </label>
                    </div>
                  </FormControl>
                  <FormMessage className="text-md" />
                </FormItem>
              )}
            />
          </div>
        );

      case 2:
        return renderSection(
          'Occupational History',
          <>
            {renderCheckboxField(
              'advisedMedicalWorkRestriction',
              'Have you ever been advised for medical reasons not to do any particular kind of work?',
              'advisedMedicalWorkRestrictionComment'
            )}
          </>
        );

      case 3:
        return renderSection(
          'Past Medical History',
          <div className="space-y-2">
            {renderCheckboxField(
              'undueFatigue',
              'Undue Fatigue',
              'undueFatigueDetails'
            )}
            {renderCheckboxField(
              'bronchitis',
              'Bronchitis',
              'bronchitisDetails'
            )}
            {renderCheckboxField(
              'breathlessness',
              'Breathlessness',
              'breathlessnessDetails'
            )}
            {renderCheckboxField('allergies', 'Allergies', 'allergiesDetails')}
            {renderCheckboxField('pneumonia', 'Pneumonia', 'pneumoniaDetails')}
            {renderCheckboxField('hayFever', 'Hay Fever', 'hayFeverDetails')}
            {renderCheckboxField(
              'shortnessOfBreath',
              'Shortness of breath/persistent cough/wheeze',
              'shortnessOfBreathDetails'
            )}
            {renderCheckboxField('jundice', 'Jundice', 'jundiceDetails')}
            {renderCheckboxField(
              'stomachProblems',
              'Stomach problem/vomiting/Diarrhoea',
              'stomachProblemsDetails'
            )}
            {renderCheckboxField(
              'stomachUlcer',
              'Stomach ulcer',
              'stomachUlcerDetails'
            )}
            {renderCheckboxField('hernias', 'Hernias', 'herniasDetails')}
            {renderCheckboxField(
              'bowelProblem',
              'Bowel problem',
              'bowelProblemDetails'
            )}
            {renderCheckboxField(
              'diabetesMellitus',
              'Diabetes Mellitus',
              'diabetesMellitusDetails'
            )}
            {renderCheckboxField(
              'nervousDisorder',
              'Nervous disorder/mental illness, nerves anxiety/depression/phobias/stress',
              'nervousDisorderDetails'
            )}
            {renderCheckboxField(
              'dizziness',
              'Dizziness/fainting attacks',
              'dizzinessDetails'
            )}
            {renderCheckboxField(
              'earProblems',
              'Ear problems i.e. chronic ear infection/ perforated ear drum',
              'earProblemsDetails'
            )}
            {renderCheckboxField(
              'hearingDefect',
              'Hearing defect',
              'hearingDefectDetails'
            )}
            {renderCheckboxField(
              'epilepsy',
              'Epilepsy/fits/blackouts',
              'epilepsyDetails'
            )}
            {renderCheckboxField(
              'eyeProblems',
              'Eye problems/infections/irritations',
              'eyeProblemsDetails'
            )}
            {renderCheckboxField(
              'ppeAllergy',
              'Allergic reaction to personal protective equipment eg gloves, masks, latex allergy',
              'ppeAllergyDetails'
            )}
          </div>
        );

      case 4:
        return renderSection(
          'Additional Medical Conditions',
          <div className="space-y-2">
            {renderCheckboxField(
              'rheumaticFever',
              'Rheumatic fever',
              'rheumaticFeverDetails'
            )}
            {renderCheckboxField(
              'highBloodPressure',
              'High blood pressure',
              'highBloodPressureDetails'
            )}
            {renderCheckboxField(
              'lowBloodPressure',
              'Low blood pressure',
              'lowBloodPressureDetails'
            )}
            {renderCheckboxField(
              'palpitations',
              'Palpitations',
              'palpitationsDetails'
            )}
            {renderCheckboxField(
              'heartAttack',
              'Heart attack',
              'heartAttackDetails'
            )}
            {renderCheckboxField('angina', 'Angina', 'anginaDetails')}
            {renderCheckboxField('asthma', 'Asthma', 'asthmaDetails')}
            {renderCheckboxField(
              'chronicLungProblems',
              'Other long standing chronic lung problems',
              'chronicLungProblemsDetails'
            )}
            {renderCheckboxField('stroke', 'Stroke or TIA', 'strokeDetails')}
            {renderCheckboxField(
              'heartMurmur',
              'Heart murmur',
              'heartMurmurDetails'
            )}
            {renderCheckboxField(
              'backProblems',
              'Back problems',
              'backProblemsDetails'
            )}
            {renderCheckboxField(
              'jointProblems',
              'Joint problems',
              'jointProblemsDetails'
            )}
            {renderCheckboxField(
              'swollenLegs',
              'Swollen legs/leg ulcers/DVT',
              'swollenLegsDetails'
            )}
            {renderCheckboxField(
              'varicoseVeins',
              'Varicose veins',
              'varicoseVeinsDetails'
            )}
            {renderCheckboxField(
              'rheumatism',
              'Rheumatism',
              'rheumatismDetails'
            )}
            {renderCheckboxField('migraine', 'Migraine', 'migraineDetails')}
            {renderCheckboxField(
              'drugReaction',
              'Adverse reaction to drugs',
              'drugReactionDetails'
            )}
            {renderCheckboxField(
              'visionCorrection',
              'Glasses/contact lenses for sight purposes',
              'visionCorrectionDetails'
            )}
            {renderCheckboxField(
              'skinConditions',
              'Skin conditions i.e. contact dermatitis/skin irritation/areas of damaged or broken skin e.g. psoriasis/eczema/acne',
              'skinConditionsDetails'
            )}
            {renderCheckboxField(
              'alcoholHealthProblems',
              'Alcohol related health problems',
              'alcoholHealthProblemsDetails'
            )}
          </div>
        );

      case 5:
        return renderSection(
          'Serious Illness / Hospitalization (Last 5 Years)',
          <FormField
            control={form.control}
            name="seriousIllnessDetails"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg font-medium">
                  Please detail any serious illness, hospital admission,
                  operation or accident that caused 5+ days off work in last 5
                  years
                </FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Details..."
                    className="min-h-[100px]  p-4 text-lg border-gray-300"
                  />
                </FormControl>
                <FormMessage className="text-md" />
              </FormItem>
            )}
          />
        );

      case 6:
        return renderSection(
          'Specific Questions',
          <div className="space-y-2">
            {renderCheckboxField(
              'recentIllHealth',
              'Have you had any recent ill health?',
              'recentIllHealthComment'
            )}
            {renderCheckboxField(
              'attendingClinic',
              'Are you attending a hospital clinic or doctor at the present time? Please give details',
              'attendingClinicComment'
            )}
            {renderCheckboxField(
              'hadChickenPox',
              'Have you had Varicella (Chicken pox)?',
              'hadChickenPoxComment'
            )}
            {renderCheckboxField(
              'otherCommunicableDisease',
              'Have you had any other serious communicable disease? If so, please give details',
              'otherCommunicableDiseaseComment'
            )}
          </div>
        );

      case 7:
        return renderSection(
          'Inoculations',
          <div className="space-y-2">
            {renderCheckboxField(
              'inocDiphtheria',
              'Diphtheria',
              'inocDiphtheriaComment'
            )}
            {renderCheckboxField(
              'inocHepatitisB',
              'Hepatitis B',
              'inocHepatitisBComment'
            )}
            {renderCheckboxField(
              'inocTuberculosis',
              'Tuberculosis (BCG)',
              'inocTuberculosisComment'
            )}
            {renderCheckboxField(
              'inocRubella',
              'Rubella (German Measles)',
              'inocRubellaComment'
            )}
            {renderCheckboxField(
              'inocVaricella',
              'Varicella (Chicken Pox)',
              'inocVaricellaComment'
            )}
            {renderCheckboxField('inocPolio', 'Polio', 'inocPolioComment')}
            {renderCheckboxField(
              'inocTetanus',
              'Tetanus',
              'inocTetanusComment'
            )}
            {renderCheckboxField(
              'testedHIV',
              'Have you ever undergone a test for HIV?',
              'testedHIVComment'
            )}
            <div className="grid grid-cols-1 items-center gap-4 border-b border-gray-100 py-2 sm:grid-cols-3">
              <FormLabel className="text-lg font-medium">Other (please specify)</FormLabel>
              <FormField
                control={form.control}
                name="inocOther"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Other inoculations..."
                        className=" placeholder:text-gray-500"
                      />
                    </FormControl>
                    <FormMessage className="text-md" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="inocOtherComment"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Details..."
                        className=" placeholder:text-gray-500"
                      />
                    </FormControl>
                    <FormMessage className="text-md" />
                  </FormItem>
                )}
              />
            </div>
          </div>
        );

      case 8:
        return renderSection(
          'Additional Information',
          <FormField
            control={form.control}
            name="daysSickLastYear"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg font-medium">
                  Number of days sickness in the past year (i.e. In the last 12
                  months)
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Number of days sick..."
                    className=" w-full md:w-[33vw]"
                  />
                </FormControl>
                <FormMessage className="text-md" />
              </FormItem>
            )}
          />
        );


      default:
        return null;
    }
  };

  return (
    <Card className="border-none shadow-none">
      <CardHeader>
        <h2 className="text-2xl font-semibold">
          Medical Questionnaire
        </h2>
        <p className="text-md text-gray-400">
          Please answer all questions honestly. Your responses will be treated
          confidentially.
        </p>
      </CardHeader>
      <CardContent>
        {/* {renderProgressBar()} */}

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8"
            onKeyDown={(e) => {
              // Prevent form submission on Enter key in all steps
              if (e.key === 'Enter') {
                e.preventDefault();
                e.stopPropagation();
              }
            }}
          >
            {/* Current Step Content */}
            <div className="mb-6">
              <h3 className="mb-4 text-lg font-semibold">
                {STEPS[currentStep - 1]?.title}
              </h3>
              {renderCurrentStep()}
            </div>

            {/* NAVIGATION BUTTONS */}
            <div className="mt-8 flex justify-between">
              <Button
                type="button"
                variant="outline"
                className=" bg-watney  text-lg text-white hover:bg-watney/90"
                onClick={handleBack}
              >
                Back
              </Button>

              <Button
                onClick={() => saveAndLogout()}
                className="bg-watney  text-white hover:bg-watney/90"
              >
                Save And Exit
              </Button>

              {currentStep === totalSteps ? (
                <Button
                  type="submit"
                  className=" bg-watney  text-lg text-white hover:bg-watney/90"
                >
                  Save and Next
                </Button>
              ) : (
                <Button
                  type="button"
                  className=" bg-watney  text-lg text-white hover:bg-watney/90"
                  onClick={handleNextClick} // Use the new handler
                >
                  Save and Next
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
