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
import { useEffect } from 'react';
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
    required_error: 'Sex is required',
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

  // ✅ NEW CONSENT & DECLARATION FIELDS
  consentMedicalDeclaration: z.boolean().refine((val) => val === true, {
    message: 'Required'
  }),
  consentVaccination: z.boolean().refine((val) => val === true, {
    message: 'Required'
  }),
  consentTerminationClause: z.boolean().refine((val) => val === true, {
    message: 'Required'
  })
});

export type MedicalHistoryFormValues = z.infer<typeof medicalHistorySchema>;

// --- COMPONENT ---
export function PostEmployementStep({
  defaultValues,
  onSaveAndContinue,
  setCurrentStep
}) {
const form = useForm<MedicalHistoryFormValues>({
  resolver: zodResolver(medicalHistorySchema),
  defaultValues: {
    firstName: defaultValues.firstName || '',
    lastName: defaultValues.lastName || '',
    dateOfBirth: defaultValues.dateOfBirth ? new Date(defaultValues.dateOfBirth) : undefined,
    jobRole: defaultValues.jobRole || '',
    sex: defaultValues.sex || undefined,

    advisedMedicalWorkRestriction: defaultValues.advisedMedicalWorkRestriction || undefined,
    undueFatigue: defaultValues.undueFatigue || undefined,
    bronchitis: defaultValues.bronchitis || undefined,
    breathlessness: defaultValues.breathlessness || undefined,
    allergies: defaultValues.allergies || undefined,
    pneumonia: defaultValues.pneumonia || undefined,
    hayFever: defaultValues.hayFever || undefined,
    shortnessOfBreath: defaultValues.shortnessOfBreath || undefined,
    jundice: defaultValues.jundice || undefined,
    stomachProblems: defaultValues.stomachProblems || undefined,
    stomachUlcer: defaultValues.stomachUlcer || undefined,
    hernias: defaultValues.hernias || undefined,
    bowelProblem: defaultValues.bowelProblem || undefined,
    diabetesMellitus: defaultValues.diabetesMellitus || undefined,
    nervousDisorder: defaultValues.nervousDisorder || undefined,
    dizziness: defaultValues.dizziness || undefined,
    earProblems: defaultValues.earProblems || undefined,
    hearingDefect: defaultValues.hearingDefect || undefined,
    epilepsy: defaultValues.epilepsy || undefined,
    eyeProblems: defaultValues.eyeProblems || undefined,
    ppeAllergy: defaultValues.ppeAllergy || undefined,
    rheumaticFever: defaultValues.rheumaticFever || undefined,
    highBloodPressure: defaultValues.highBloodPressure || undefined,
    lowBloodPressure: defaultValues.lowBloodPressure || undefined,
    palpitations: defaultValues.palpitations || undefined,
    heartAttack: defaultValues.heartAttack || undefined,
    angina: defaultValues.angina || undefined,
    asthma: defaultValues.asthma || undefined,
    chronicLungProblems: defaultValues.chronicLungProblems || undefined,
    stroke: defaultValues.stroke || undefined,
    heartMurmur: defaultValues.heartMurmur || undefined,
    backProblems: defaultValues.backProblems || undefined,
    jointProblems: defaultValues.jointProblems || undefined,
    swollenLegs: defaultValues.swollenLegs || undefined,
    varicoseVeins: defaultValues.varicoseVeins || undefined,
    rheumatism: defaultValues.rheumatism || undefined,
    migraine: defaultValues.migraine || undefined,
    drugReaction: defaultValues.drugReaction || undefined,
    visionCorrection: defaultValues.visionCorrection || undefined,
    skinConditions: defaultValues.skinConditions || undefined,
    alcoholHealthProblems: defaultValues.alcoholHealthProblems || undefined,
    recentIllHealth: defaultValues.recentIllHealth || undefined,
    attendingClinic: defaultValues.attendingClinic || undefined,
    hadChickenPox: defaultValues.hadChickenPox || undefined,
    otherCommunicableDisease: defaultValues.otherCommunicableDisease || undefined,
    inocDiphtheria: defaultValues.inocDiphtheria || undefined,
    inocHepatitisB: defaultValues.inocHepatitisB || undefined,
    inocTuberculosis: defaultValues.inocTuberculosis || undefined,
    inocRubella: defaultValues.inocRubella || undefined,
    inocVaricella: defaultValues.inocVaricella || undefined,
    inocPolio: defaultValues.inocPolio || undefined,
    inocTetanus: defaultValues.inocTetanus || undefined,
    testedHIV: defaultValues.testedHIV || undefined,
    consentMedicalDeclaration: defaultValues.consentMedicalDeclaration || undefined,
    consentVaccination: defaultValues.consentVaccination || undefined,
    consentTerminationClause: defaultValues.consentTerminationClause || undefined,

    ...defaultValues, // keep other non-boolean fields
  }
});


  useEffect(() => {
    if (defaultValues) {
      form.reset({
        ...defaultValues,
        dateOfBirth: defaultValues.dateOfBirth
          ? new Date(defaultValues.dateOfBirth)
          : undefined
      });
    }
  }, [defaultValues, form]);
  const onSubmit = (data: MedicalHistoryFormValues) => {
    console.log(data);
    onSaveAndContinue(data);
  };

  const handleBack = () => {
    setCurrentStep(11);
  };

const renderCheckboxField = (
  name: keyof MedicalHistoryFormValues,
  label: string,
  commentName?: keyof MedicalHistoryFormValues
) => (
  <div className="grid grid-cols-1 items-start gap-4 border-b border-gray-100 py-3 sm:grid-cols-3">
    {/* Question */}
    <FormLabel className="font-medium self-center">{label}</FormLabel>

    {/* Yes/No Checkboxes using shadcn/ui */}
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex items-center space-x-6">
          {/* Yes Option */}
          <div className="flex items-center space-x-2 mt-2">
            <Checkbox
              checked={field.value === true}
              onCheckedChange={() => field.onChange(true)}
              id={`${String(name)}-yes`}
            />
            <label
              htmlFor={`${String(name)}-yes`}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Yes
            </label>
          </div>

          {/* No Option */}
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={field.value === false}
              onCheckedChange={() => field.onChange(false)}
              id={`${String(name)}-no`}
            />
            <label
              htmlFor={`${String(name)}-no`}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              No
            </label>
          </div>

          <FormMessage />
        </FormItem>
      )}
    />

    {/* Conditional Comment Field */}
    {commentName && (
      <FormField
        control={form.control}
        name={commentName}
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <Textarea
                {...field}
                placeholder="Details (if Yes)..."
                className="w-full border-gray-300"
                disabled={form.watch(name) !== true} // Only enabled if "Yes"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    )}

    {/* Placeholder for alignment */}
    {!commentName && <div></div>}
  </div>
);
  const renderSection = (title: string, children: React.ReactNode) => (
    <div className="space-y-4">
      <h3 className="border-b pb-2 text-lg font-semibold">{title}</h3>
      {children}
    </div>
  );

  return (
    <Card className="border-none shadow-none">
      <CardHeader>
        <h2 className="text-xl font-semibold">
          Post-Employment Medical Questionnaire
        </h2>
        <p className="text-sm text-gray-400">
          Please answer all questions honestly. Your responses will be treated
          confidentially.
        </p>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* PERSONAL INFORMATION */}
            {renderSection(
              'Employee Personal Information',
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* First Name */}
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Employee Forename</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="First Name" disabled />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Last Name */}
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Employee Surename</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Last Name"  disabled/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Date of Birth */}
                <FormField
                  control={form.control}
                  name="dateOfBirth"
                  render={({ field }) => {
                    const value = field.value ? new Date(field.value) : null;

                    return (
                      <FormItem className="mt-2 flex w-full flex-col">
                        <FormLabel>
                          Date of Birth (MM/DD/YYYY)
                        </FormLabel>
                        <FormControl className="w-full">
                          <CustomDatePicker
                            selected={value}
                            onChange={(date) => field.onChange(date)}
                            placeholder="Use your official birth date"
                            disabled
                          />
                        </FormControl>
                        <p className="text-xs text-gray-400">
                          Example: MM/DD/YYYY or 01/24/1995
                        </p>
                        <FormMessage />
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
                      <FormLabel>Position Applied For</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Job Role" disabled />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Sex */}
                <FormField
                  control={form.control}
                  name="sex"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-4">
                      <FormLabel className='mt-2'>Sex <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <div className="flex space-x-4">
                          <label className="flex items-center space-x-1">
                            <Checkbox
                              checked={field.value === 'male'}
                              onCheckedChange={() => field.onChange('male')}
                            />
                            <span>Male</span>
                          </label>
                          <label className="flex items-center space-x-1">
                            <Checkbox
                              checked={field.value === 'female'}
                              onCheckedChange={() => field.onChange('female')}
                            />
                            <span>Female</span>
                          </label>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
            {/* OCCUPATIONAL HISTORY */}
            {renderSection(
              'Occupational History',
              <>
                {renderCheckboxField(
                  'advisedMedicalWorkRestriction',
                  'Have you ever been advised for medical reasons not to do any particular kind of work?',
                  'advisedMedicalWorkRestrictionComment'
                )}
              </>
            )}

            {/* PAST MEDICAL HISTORY */}
            {renderSection(
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
                {renderCheckboxField(
                  'allergies',
                  'Allergies',
                  'allergiesDetails'
                )}
                {renderCheckboxField(
                  'pneumonia',
                  'Pneumonia',
                  'pneumoniaDetails'
                )}
                {renderCheckboxField(
                  'hayFever',
                  'Hay Fever',
                  'hayFeverDetails'
                )}
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
            )}

            {/* MORE MEDICAL CONDITIONS */}
            {renderSection(
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
                {renderCheckboxField(
                  'stroke',
                  'Stroke or TIA',
                  'strokeDetails'
                )}
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
            )}

            {/* SERIOUS ILLNESS */}
            {renderSection(
              'Serious Illness / Hospitalization (Last 5 Years)',
              <FormField
                control={form.control}
                name="seriousIllnessDetails"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Please detail any serious illness, hospital admission,
                      operation or accident that caused 5+ days off work in last
                      5 years
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Details..."
                        className="w-full border-gray-300"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* SPECIFIC QUESTIONS */}
            {renderSection(
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
            )}

            {/* INOCULATIONS */}
            {renderSection(
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
                  <FormLabel>Other (please specify)</FormLabel>
                  <FormField
                    control={form.control}
                    name="inocOther"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Other inoculations..."
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="inocOtherComment"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input {...field} placeholder="Details..." />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            {/* DAYS SICK */}
            {renderSection(
              'Additional Information',
              <FormField
                control={form.control}
                name="daysSickLastYear"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Number of days sickness in the past year (i.e. In the last
                      12 months)
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Number of days sick..."
                        className="w-full md:w-[33vw]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* ✅ NEW SECTION: CONSENT & DECLARATION */}
            {renderSection(
              'Consent & Declaration',
              <div className="space-y-6 text-sm">
                {/* Night Working Notice */}
                <div className="rounded-md bg-blue-50 p-4 text-blue-800">
                  <strong>Night Working:</strong> Employees who are regularly
                  required to work more than three hours a shift between 11.00
                  p.m. and 6.00 a.m. are entitled to a regular assessment of
                  their suitability to work nights. If you would like the
                  opportunity to have a free health assessment, you must contact
                  management at any time.
                </div>

                {/* Consent Checkboxes */}
                <FormField
                  control={form.control}
                  name="consentMedicalDeclaration"
                  render={({ field }) => (
                    <FormItem className="flex items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          I declare that the information I have given on this
                          document is, to the best of my knowledge, a true and
                          complete account of my medical history.
                        </FormLabel>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

               

                <FormField
                  control={form.control}
                  name="consentVaccination"
                  render={({ field }) => (
                    <FormItem className="flex items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          I understand and accept that it will be a condition of
                          my contract of employment to be fully immunised (if
                          not already) against Hepatitis B, Tuberculosis and
                          Rubella within the first three months of my employment
                          and remain regularly immunised.
                        </FormLabel>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="consentTerminationClause"
                  render={({ field }) => (
                    <FormItem className="flex items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          I understand and accept that if I do not comply with
                          the above obligations or should any information come
                          to light following my employment with Everycare
                          Romford which shows that medical information disclosed
                          by myself was misleading or false, Everycare Romford
                          may terminate my employment.
                        </FormLabel>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* NAVIGATION BUTTONS */}
            <div className="mt-8 flex justify-between">
              <Button
                type="button"
                variant="outline"
                className="bg-watney text-white hover:bg-watney/90"
                onClick={handleBack}
              >
                Back
              </Button>
              <Button
                type="submit"
                className="bg-watney text-white hover:bg-watney/90"
              >
                Next
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
