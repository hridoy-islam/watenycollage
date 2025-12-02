import { useState, useEffect } from 'react';
import {
  useForm,
  Control,
  UseFormWatch,
  UseFormSetValue,
  FormState
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { CustomDatePicker } from '@/components/shared/CustomDatePicker';
import { MoveLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '@/lib/axios';
import { useSelector } from 'react-redux';
import { BlinkingDots } from '@/components/shared/blinking-dots';

// --- Zod Schema ---
const simpleBoolean = z
  .boolean()
  .default(false)
  .refine((val) => val === true, { message: 'You must agree to proceed' });

const requiredBoolean = z.boolean({
  required_error: 'Please select Yes or No'
});
const optionalString = z.string().optional();

const medicalHistorySchema = z
  .object({
    firstName: z.string().min(1, 'Required'),
    lastName: z.string().min(1, 'Required'),
    address: z.string().min(1, 'Required'),
    dateOfBirth: z.date({ required_error: 'Date of Birth is required' }),
    positionApplied: z.string().min(1, 'Required'),
    postcode: z.string().min(1, 'Required'),
    sex: z.enum(['male', 'female'], { required_error: 'Required' }),

    workRestrictions: requiredBoolean,
    workRestrictionsDetails: optionalString,
    undueFatigue: requiredBoolean,
    undueFatigueDetails: optionalString,
    bronchitis: requiredBoolean,
    bronchitisDetails: optionalString,
    breathlessness: requiredBoolean,
    breathlessnessDetails: optionalString,
    allergies: requiredBoolean,
    allergiesDetails: optionalString,
    pneumonia: requiredBoolean,
    pneumoniaDetails: optionalString,
    hayFever: requiredBoolean,
    hayFeverDetails: optionalString,
    shortnessOfBreath: requiredBoolean,
    shortnessOfBreathDetails: optionalString,
    jaundice: requiredBoolean,
    jaundiceDetails: optionalString,
    stomachProblem: requiredBoolean,
    stomachProblemDetails: optionalString,
    stomachUlcer: requiredBoolean,
    stomachUlcerDetails: optionalString,
    hernias: requiredBoolean,
    herniasDetails: optionalString,
    bowelProblem: requiredBoolean,
    bowelProblemDetails: optionalString,
    diabetes: requiredBoolean,
    diabetesDetails: optionalString,
    nervousDisorder: requiredBoolean,
    nervousDisorderDetails: optionalString,
    dizziness: requiredBoolean,
    dizzinessDetails: optionalString,
    earProblems: requiredBoolean,
    earProblemsDetails: optionalString,
    hearingDefect: requiredBoolean,
    hearingDefectDetails: optionalString,
    epilepsy: requiredBoolean,
    epilepsyDetails: optionalString,
    eyeProblems: requiredBoolean,
    eyeProblemsDetails: optionalString,
    ppeAllergy: requiredBoolean,
    ppeAllergyDetails: optionalString,
    rheumaticFever: requiredBoolean,
    rheumaticFeverDetails: optionalString,
    highBP: requiredBoolean,
    highBPDetails: optionalString,
    lowBP: requiredBoolean,
    lowBPDetails: optionalString,
    palpitations: requiredBoolean,
    palpitationsDetails: optionalString,
    heartAttack: requiredBoolean,
    heartAttackDetails: optionalString,
    angina: requiredBoolean,
    anginaDetails: optionalString,
    asthma: requiredBoolean,
    asthmaDetails: optionalString,
    chronicLungProblems: requiredBoolean,
    chronicLungProblemsDetails: optionalString,
    stroke: requiredBoolean,
    strokeDetails: optionalString,
    heartMurmur: requiredBoolean,
    heartMurmurDetails: optionalString,
    backProblems: requiredBoolean,
    backProblemsDetails: optionalString,
    jointProblems: requiredBoolean,
    jointProblemsDetails: optionalString,
    swollenLegs: requiredBoolean,
    swollenLegsDetails: optionalString,
    varicoseVeins: requiredBoolean,
    varicoseVeinsDetails: optionalString,
    rheumatism: requiredBoolean,
    rheumatismDetails: optionalString,
    migraine: requiredBoolean,
    migraineDetails: optionalString,
    drugReaction: requiredBoolean,
    drugReactionDetails: optionalString,
    visionCorrection: requiredBoolean,
    visionCorrectionDetails: optionalString,
    skinConditions: requiredBoolean,
    skinConditionsDetails: optionalString,
    alcoholHealth: requiredBoolean,
    alcoholHealthDetails: optionalString,
    seriousIllnessHistory: requiredBoolean,
    seriousIllnessHistoryDetails: optionalString,
    recentIllHealth: requiredBoolean,
    recentIllHealthDetails: optionalString,
    attendingClinic: requiredBoolean,
    attendingClinicDetails: optionalString,
    chickenPox: requiredBoolean,
    chickenPoxDetails: optionalString,
    communicableDisease: requiredBoolean,
    communicableDiseaseDetails: optionalString,
    inocDiphtheria: requiredBoolean,
    inocDiphtheriaDetails: optionalString,
    inocHepB: requiredBoolean,
    inocHepBDetails: optionalString,
    inocTB: requiredBoolean,
    inocTBDetails: optionalString,
    inocRubella: requiredBoolean,
    inocRubellaDetails: optionalString,
    inocVaricella: requiredBoolean,
    inocVaricellaDetails: optionalString,
    inocPolio: requiredBoolean,
    inocPolioDetails: optionalString,
    inocTetanus: requiredBoolean,
    inocTetanusDetails: optionalString,
    hivTest: requiredBoolean,
    hivTestDetails: optionalString,
    inocOther: requiredBoolean,
    inocOtherDetails: optionalString,
    daysSickness: z.string().min(1, 'Required'),
    declTrueAccount: simpleBoolean,
    declDataProcessing: simpleBoolean,
    declVaccination: simpleBoolean,
    declTermination: simpleBoolean
  })
  

type FormValues = z.infer<typeof medicalHistorySchema>;

// ✅ MOVED OUTSIDE — Stable component
const YesNoQuestion = ({
  name,
  detailsName,
  label,
  placeholder = 'Please provide details...',
  control,
  watch,
  setValue,
  formState
}: {
  name: keyof FormValues;
  detailsName: keyof FormValues;
  label: string;
  placeholder?: string;
  control: Control<FormValues>;
  watch: UseFormWatch<FormValues>;
  setValue: UseFormSetValue<FormValues>;
  formState: FormState<FormValues>;
}) => {
  const fieldValue = watch(name);
  const isYes = fieldValue === true;
  const isNo = fieldValue === false;
  const detailsError = formState.errors[detailsName]?.message;
  const boolError = formState.errors[name]?.message;

  return (
    <div className="rounded-lg border border-gray-100 bg-gray-50/50 p-4 transition-all hover:border-gray-200">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div className="mt-1 flex-1">
          <FormLabel className="text-start text-base font-normal leading-relaxed text-gray-800">
            {label}
          </FormLabel>
          {boolError && (
            <p className="mt-1 text-sm font-medium text-red-500">{boolError}</p>
          )}
        </div>

        <div className="flex flex-row items-center gap-6">
          <div className="flex items-center space-x-2">
            <Checkbox
              id={`${String(name)}-yes`}
              checked={isYes}
              onCheckedChange={() =>
                setValue(name, true, { shouldValidate: true })
              }
              className="border-gray-400 data-[state=checked]:border-watney data-[state=checked]:bg-watney"
            />
            <FormLabel
              htmlFor={`${String(name)}-yes`}
              className="cursor-pointer select-none font-medium text-gray-700"
            >
              Yes
            </FormLabel>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id={`${String(name)}-no`}
              checked={isNo}
              onCheckedChange={() => {
                setValue(name, false, { shouldValidate: true });
                setValue(detailsName, '');
              }}
              className="border-gray-400 data-[state=checked]:border-watney data-[state=checked]:bg-watney"
            />
            <FormLabel
              htmlFor={`${String(name)}-no`}
              className="cursor-pointer select-none font-medium text-gray-700"
            >
              No
            </FormLabel>
          </div>
        </div>
      </div>
      {isYes && (
        <FormField
          control={control}
          name={detailsName}
          render={({ field }) => (
            <FormItem className="mt-4 animate-in fade-in slide-in-from-top-2">
              <FormControl>
                <Textarea
                  {...field}
                  placeholder={placeholder}
                  className={`min-h-[80px] resize-y bg-white ${
                    detailsError ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  );
};

// --- Main Component ---
export default function PostEmploymentMedicalForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isAlreadySubmitted, setIsAlreadySubmitted] = useState(false);
  const [userExists, setUserExists] = useState(true);
  const { user } = useSelector((state: any) => state.auth);
  const {id} = useParams()


  const isAdmin= user.role==='admin' 

  const form = useForm<FormValues>({
    resolver: zodResolver(medicalHistorySchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      address: '',
      postcode: '',
      dateOfBirth: undefined,
      positionApplied: '',
      sex: undefined,

      workRestrictions: undefined,
      workRestrictionsDetails: '',
      undueFatigue: undefined,
      undueFatigueDetails: '',
      bronchitis: undefined,
      bronchitisDetails: '',
      breathlessness: undefined,
      breathlessnessDetails: '',
      allergies: undefined,
      allergiesDetails: '',
      pneumonia: undefined,
      pneumoniaDetails: '',
      hayFever: undefined,
      hayFeverDetails: '',
      shortnessOfBreath: undefined,
      shortnessOfBreathDetails: '',
      jaundice: undefined,
      jaundiceDetails: '',
      stomachProblem: undefined,
      stomachProblemDetails: '',
      stomachUlcer: undefined,
      stomachUlcerDetails: '',
      hernias: undefined,
      herniasDetails: '',
      bowelProblem: undefined,
      bowelProblemDetails: '',
      diabetes: undefined,
      diabetesDetails: '',
      nervousDisorder: undefined,
      nervousDisorderDetails: '',
      dizziness: undefined,
      dizzinessDetails: '',
      earProblems: undefined,
      earProblemsDetails: '',
      hearingDefect: undefined,
      hearingDefectDetails: '',
      epilepsy: undefined,
      epilepsyDetails: '',
      eyeProblems: undefined,
      eyeProblemsDetails: '',
      ppeAllergy: undefined,
      ppeAllergyDetails: '',
      rheumaticFever: undefined,
      rheumaticFeverDetails: '',
      highBP: undefined,
      highBPDetails: '',
      lowBP: undefined,
      lowBPDetails: '',
      palpitations: undefined,
      palpitationsDetails: '',
      heartAttack: undefined,
      heartAttackDetails: '',
      angina: undefined,
      anginaDetails: '',
      asthma: undefined,
      asthmaDetails: '',
      chronicLungProblems: undefined,
      chronicLungProblemsDetails: '',
      stroke: undefined,
      strokeDetails: '',
      heartMurmur: undefined,
      heartMurmurDetails: '',
      backProblems: undefined,
      backProblemsDetails: '',
      jointProblems: undefined,
      jointProblemsDetails: '',
      swollenLegs: undefined,
      swollenLegsDetails: '',
      varicoseVeins: undefined,
      varicoseVeinsDetails: '',
      rheumatism: undefined,
      rheumatismDetails: '',
      migraine: undefined,
      migraineDetails: '',
      drugReaction: undefined,
      drugReactionDetails: '',
      visionCorrection: undefined,
      visionCorrectionDetails: '',
      skinConditions: undefined,
      skinConditionsDetails: '',
      alcoholHealth: undefined,
      alcoholHealthDetails: '',
      seriousIllnessHistory: undefined,
      seriousIllnessHistoryDetails: '',
      recentIllHealth: undefined,
      recentIllHealthDetails: '',
      attendingClinic: undefined,
      attendingClinicDetails: '',
      chickenPox: undefined,
      chickenPoxDetails: '',
      communicableDisease: undefined,
      communicableDiseaseDetails: '',
      inocDiphtheria: undefined,
      inocDiphtheriaDetails: '',
      inocHepB: undefined,
      inocHepBDetails: '',
      inocTB: undefined,
      inocTBDetails: '',
      inocRubella: undefined,
      inocRubellaDetails: '',
      inocVaricella: undefined,
      inocVaricellaDetails: '',
      inocPolio: undefined,
      inocPolioDetails: '',
      inocTetanus: undefined,
      inocTetanusDetails: '',
      hivTest: undefined,
      hivTestDetails: '',
      inocOther: undefined,
      inocOtherDetails: '',
      daysSickness: ''
    }
  });

  useEffect(() => {
    const fetchUser = async () => {
      if (!id) {
        setError('Invalid user ID');
        setLoading(false);
        return;
      }

      try {
        const res = await axiosInstance.get(`/users/${id}`);
        const userData = res.data.data;

        if (userData.medicalDone) {
          setIsAlreadySubmitted(false);
          setLoading(false);
          return;
        }

        const applicationRes = await axiosInstance.get(
          `/application-job?applicantId=${id}`
        );
        const appliedJobTitle =
          applicationRes.data.data.result[0]?.jobId?.jobTitle;

        form.reset({
          ...form.getValues(),
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          address: userData.postalAddressLine1 || '',
          postcode: userData.postalPostCode || '',
          dateOfBirth: userData.dateOfBirth
            ? new Date(userData.dateOfBirth)
            : undefined,
          positionApplied: appliedJobTitle || '',
          sex: userData.gender || undefined
        });

        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch user:', err);
        setError('Failed to load user data. Please try again.');
        setUserExists(false);
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  const onSubmit = async (data: FormValues) => {
    if (!id) return;
    setSubmitting(true);
    try {
      await axiosInstance.post('/medical-form', { ...data, userId: id });
      await axiosInstance.patch(`/users/${id}`, { medicalDone: true });
      setIsSubmitted(true);
    } catch (err) {
      console.error('Submission failed:', err);
      alert('Failed to submit form. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-6">
        <BlinkingDots size="large" color="bg-watney" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Card className="p-6 text-center">
          <CardTitle className="text-red-600">Error</CardTitle>
          <CardDescription>{error}</CardDescription>
          <Button
            onClick={() => window.location.reload()}
            className="mt-4 bg-watney text-white"
          >
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  if (isAlreadySubmitted) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-3xl border-t-4 border-t-red-500 p-8 text-center shadow-lg">
          <CardTitle className="mb-4 text-3xl text-red-500">
            Form Already Submitted
          </CardTitle>
          <CardDescription className="mb-6">
            You have already completed the Post-Employment Medical
            Questionnaire.
          </CardDescription>
          <Button className="mx-auto" onClick={() => navigate('/dashboard')}>
            Go Home
          </Button>
        </Card>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-4xl border-t-4 border-t-watney p-8 text-center shadow-lg">
          <CardTitle className="mb-4 text-3xl text-watney">
            Thank you!
          </CardTitle>
          <CardDescription className="mb-6 text-black text-3xl">
            Your medical questionnaire is complete.
          </CardDescription>
          <Button
            className="mx-auto bg-watney text-white hover:bg-watney/90 p-6"
            onClick={() => navigate('/dashboard')}
          >
            Done
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex justify-center">
      <div className="w-full py-6">
        <Card>
          <CardHeader className="relative">
            <div className="flex items-center justify-between">
              <CardTitle className="text-3xl font-bold text-watney">
                Post-Employment Medical Questionnaire
              </CardTitle>
              <Button
                className="border-none bg-watney text-white hover:bg-watney/90"
                onClick={() => navigate(-1)}
              >
                <MoveLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </div>
            <CardDescription className="mt-2 text-left text-base text-gray-600">
              Please read carefully before completing. The information contained
              within will remain confidential.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 md:p-10">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-10"
              >
                {/* Personal Information */}
                <section className="space-y-6">
                  <h3 className="flex items-center border-b pb-2 text-xl font-bold text-gray-900">
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                    <div>
                      <FormLabel className="block text-sm font-medium text-gray-700">
                        First Name
                      </FormLabel>
                      <p className="mt-1 text-gray-900">
                        {form.getValues('firstName')}
                      </p>
                    </div>
                    <div>
                      <FormLabel className="block text-sm font-medium text-gray-700">
                        Last Name
                      </FormLabel>
                      <p className="mt-1 text-gray-900">
                        {form.getValues('lastName')}
                      </p>
                    </div>
                    <div>
                      <FormLabel className="block text-sm font-medium text-gray-700">
                        Address
                      </FormLabel>
                      <p className="mt-1 text-gray-900">
                        {form.getValues('address')}
                      </p>
                    </div>
                    <div>
                      <FormLabel className="block text-sm font-medium text-gray-700">
                        Postcode
                      </FormLabel>
                      <p className="mt-1 text-gray-900">
                        {form.getValues('postcode')}
                      </p>
                    </div>
                    <div>
                      <FormLabel className="block text-sm font-medium text-gray-700">
                        Date of Birth
                      </FormLabel>
                      <p className="mt-1 text-gray-900">
                        {form.getValues('dateOfBirth')
                          ? new Date(
                              form.getValues('dateOfBirth')
                            ).toLocaleDateString()
                          : '—'}
                      </p>
                    </div>
                    <div>
                      <FormLabel className="block text-sm font-medium text-gray-700">
                        Position Applied For
                      </FormLabel>
                      <p className="mt-1 text-gray-900">
                        {form.getValues('positionApplied')}
                      </p>
                    </div>
                  </div>
                  <div>
                    <FormLabel className="block text-sm font-medium text-gray-700">
                      Sex
                    </FormLabel>
                    <div className="flex gap-6 pt-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="sex-male"
                          checked={form.watch('sex') === 'male'}
                          onCheckedChange={() => form.setValue('sex', 'male')}
                          className="border-gray-400 data-[state=checked]:border-watney data-[state=checked]:bg-watney"
                        />
                        <FormLabel
                          htmlFor="sex-male"
                          className="cursor-pointer select-none"
                        >
                          Male
                        </FormLabel>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="sex-female"
                          checked={form.watch('sex') === 'female'}
                          onCheckedChange={() => form.setValue('sex', 'female')}
                          className="border-gray-400 data-[state=checked]:border-watney data-[state=checked]:bg-watney"
                        />
                        <FormLabel
                          htmlFor="sex-female"
                          className="cursor-pointer select-none"
                        >
                          Female
                        </FormLabel>
                      </div>
                    </div>
                    {form.formState.errors.sex && (
                      <p className="mt-1 text-sm text-red-500">
                        {form.formState.errors.sex.message}
                      </p>
                    )}
                  </div>
                </section>

                {/* Occupational History */}
                <section className="space-y-6">
                  <h3 className="flex items-center border-b pb-2 text-xl font-bold text-gray-900">
                    Occupational History
                  </h3>
                  <YesNoQuestion
                    name="workRestrictions"
                    detailsName="workRestrictionsDetails"
                    label="Have you ever been advised for medical reasons not to do any particular kind of work?"
                    control={form.control}
                    watch={form.watch}
                    setValue={form.setValue}
                    formState={form.formState}
                  />
                </section>

                {/* Past Medical History */}
                <section className="space-y-6">
                  <h3 className="flex items-center border-b pb-2 text-xl font-bold text-gray-900">
                    Past Medical History
                  </h3>
                  <p className="mb-4 text-sm italic text-gray-500">
                    Please answer yes/no if you have suffered from any of these
                    conditions & give details if necessary.
                  </p>
                  <div className="grid grid-cols-1 gap-x-8 md:grid-cols-2">
                    <div className="space-y-4">
                      <YesNoQuestion
                        name="undueFatigue"
                        detailsName="undueFatigueDetails"
                        label="Undue Fatigue"
                        control={form.control}
                        watch={form.watch}
                        setValue={form.setValue}
                        formState={form.formState}
                      />
                      <YesNoQuestion
                        name="bronchitis"
                        detailsName="bronchitisDetails"
                        label="Bronchitis"
                        control={form.control}
                        watch={form.watch}
                        setValue={form.setValue}
                        formState={form.formState}
                      />
                      <YesNoQuestion
                        name="breathlessness"
                        detailsName="breathlessnessDetails"
                        label="Breathlessness"
                        control={form.control}
                        watch={form.watch}
                        setValue={form.setValue}
                        formState={form.formState}
                      />
                      <YesNoQuestion
                        name="allergies"
                        detailsName="allergiesDetails"
                        label="Allergies"
                        control={form.control}
                        watch={form.watch}
                        setValue={form.setValue}
                        formState={form.formState}
                      />
                      <YesNoQuestion
                        name="pneumonia"
                        detailsName="pneumoniaDetails"
                        label="Pneumonia"
                        control={form.control}
                        watch={form.watch}
                        setValue={form.setValue}
                        formState={form.formState}
                      />
                      <YesNoQuestion
                        name="hayFever"
                        detailsName="hayFeverDetails"
                        label="Hay Fever"
                        control={form.control}
                        watch={form.watch}
                        setValue={form.setValue}
                        formState={form.formState}
                      />
                      <YesNoQuestion
                        name="shortnessOfBreath"
                        detailsName="shortnessOfBreathDetails"
                        label="Shortness of breath / persistent cough / wheeze"
                        control={form.control}
                        watch={form.watch}
                        setValue={form.setValue}
                        formState={form.formState}
                      />
                      <YesNoQuestion
                        name="jaundice"
                        detailsName="jaundiceDetails"
                        label="Jaundice"
                        control={form.control}
                        watch={form.watch}
                        setValue={form.setValue}
                        formState={form.formState}
                      />
                      <YesNoQuestion
                        name="stomachProblem"
                        detailsName="stomachProblemDetails"
                        label="Stomach problem / vomiting / Diarrhoea"
                        control={form.control}
                        watch={form.watch}
                        setValue={form.setValue}
                        formState={form.formState}
                      />
                      <YesNoQuestion
                        name="stomachUlcer"
                        detailsName="stomachUlcerDetails"
                        label="Stomach ulcer"
                        control={form.control}
                        watch={form.watch}
                        setValue={form.setValue}
                        formState={form.formState}
                      />
                      <YesNoQuestion
                        name="hernias"
                        detailsName="herniasDetails"
                        label="Hernias"
                        control={form.control}
                        watch={form.watch}
                        setValue={form.setValue}
                        formState={form.formState}
                      />
                      <YesNoQuestion
                        name="bowelProblem"
                        detailsName="bowelProblemDetails"
                        label="Bowel problem"
                        control={form.control}
                        watch={form.watch}
                        setValue={form.setValue}
                        formState={form.formState}
                      />
                      <YesNoQuestion
                        name="diabetes"
                        detailsName="diabetesDetails"
                        label="Diabetes Mellitus"
                        control={form.control}
                        watch={form.watch}
                        setValue={form.setValue}
                        formState={form.formState}
                      />
                      <YesNoQuestion
                        name="nervousDisorder"
                        detailsName="nervousDisorderDetails"
                        label="Nervous disorder / mental illness / anxiety / depression / phobias / stress"
                        control={form.control}
                        watch={form.watch}
                        setValue={form.setValue}
                        formState={form.formState}
                      />
                      <YesNoQuestion
                        name="dizziness"
                        detailsName="dizzinessDetails"
                        label="Dizziness / fainting attacks"
                        control={form.control}
                        watch={form.watch}
                        setValue={form.setValue}
                        formState={form.formState}
                      />
                      <YesNoQuestion
                        name="earProblems"
                        detailsName="earProblemsDetails"
                        label="Ear problems i.e. chronic ear infection / perforated ear drum"
                        control={form.control}
                        watch={form.watch}
                        setValue={form.setValue}
                        formState={form.formState}
                      />
                      <YesNoQuestion
                        name="hearingDefect"
                        detailsName="hearingDefectDetails"
                        label="Hearing defect"
                        control={form.control}
                        watch={form.watch}
                        setValue={form.setValue}
                        formState={form.formState}
                      />
                      <YesNoQuestion
                        name="epilepsy"
                        detailsName="epilepsyDetails"
                        label="Epilepsy / fits / blackouts"
                        control={form.control}
                        watch={form.watch}
                        setValue={form.setValue}
                        formState={form.formState}
                      />
                      <YesNoQuestion
                        name="eyeProblems"
                        detailsName="eyeProblemsDetails"
                        label="Eye problems / infections / irritations"
                        control={form.control}
                        watch={form.watch}
                        setValue={form.setValue}
                        formState={form.formState}
                      />
                      <YesNoQuestion
                        name="ppeAllergy"
                        detailsName="ppeAllergyDetails"
                        label="Allergic reaction to personal protective equipment eg gloves, masks, latex allergy"
                        control={form.control}
                        watch={form.watch}
                        setValue={form.setValue}
                        formState={form.formState}
                      />
                    </div>
                    <div className="space-y-4">
                      <YesNoQuestion
                        name="rheumaticFever"
                        detailsName="rheumaticFeverDetails"
                        label="Rheumatic fever"
                        control={form.control}
                        watch={form.watch}
                        setValue={form.setValue}
                        formState={form.formState}
                      />
                      <YesNoQuestion
                        name="highBP"
                        detailsName="highBPDetails"
                        label="High blood pressure"
                        control={form.control}
                        watch={form.watch}
                        setValue={form.setValue}
                        formState={form.formState}
                      />
                      <YesNoQuestion
                        name="lowBP"
                        detailsName="lowBPDetails"
                        label="Low blood pressure"
                        control={form.control}
                        watch={form.watch}
                        setValue={form.setValue}
                        formState={form.formState}
                      />
                      <YesNoQuestion
                        name="palpitations"
                        detailsName="palpitationsDetails"
                        label="Palpitations"
                        control={form.control}
                        watch={form.watch}
                        setValue={form.setValue}
                        formState={form.formState}
                      />
                      <YesNoQuestion
                        name="heartAttack"
                        detailsName="heartAttackDetails"
                        label="Heart attack"
                        control={form.control}
                        watch={form.watch}
                        setValue={form.setValue}
                        formState={form.formState}
                      />
                      <YesNoQuestion
                        name="angina"
                        detailsName="anginaDetails"
                        label="Angina"
                        control={form.control}
                        watch={form.watch}
                        setValue={form.setValue}
                        formState={form.formState}
                      />
                      <YesNoQuestion
                        name="asthma"
                        detailsName="asthmaDetails"
                        label="Asthma"
                        control={form.control}
                        watch={form.watch}
                        setValue={form.setValue}
                        formState={form.formState}
                      />
                      <YesNoQuestion
                        name="chronicLungProblems"
                        detailsName="chronicLungProblemsDetails"
                        label="Other long standing chronic lung problems"
                        control={form.control}
                        watch={form.watch}
                        setValue={form.setValue}
                        formState={form.formState}
                      />
                      <YesNoQuestion
                        name="stroke"
                        detailsName="strokeDetails"
                        label="Stroke or TIA"
                        control={form.control}
                        watch={form.watch}
                        setValue={form.setValue}
                        formState={form.formState}
                      />
                      <YesNoQuestion
                        name="heartMurmur"
                        detailsName="heartMurmurDetails"
                        label="Heart murmur"
                        control={form.control}
                        watch={form.watch}
                        setValue={form.setValue}
                        formState={form.formState}
                      />
                      <YesNoQuestion
                        name="backProblems"
                        detailsName="backProblemsDetails"
                        label="Back problems"
                        control={form.control}
                        watch={form.watch}
                        setValue={form.setValue}
                        formState={form.formState}
                      />
                      <YesNoQuestion
                        name="jointProblems"
                        detailsName="jointProblemsDetails"
                        label="Joint problems"
                        control={form.control}
                        watch={form.watch}
                        setValue={form.setValue}
                        formState={form.formState}
                      />
                      <YesNoQuestion
                        name="swollenLegs"
                        detailsName="swollenLegsDetails"
                        label="Swollen legs / leg ulcers / deep vein thrombosis"
                        control={form.control}
                        watch={form.watch}
                        setValue={form.setValue}
                        formState={form.formState}
                      />
                      <YesNoQuestion
                        name="varicoseVeins"
                        detailsName="varicoseVeinsDetails"
                        label="Varicose veins"
                        control={form.control}
                        watch={form.watch}
                        setValue={form.setValue}
                        formState={form.formState}
                      />
                      <YesNoQuestion
                        name="rheumatism"
                        detailsName="rheumatismDetails"
                        label="Rheumatism"
                        control={form.control}
                        watch={form.watch}
                        setValue={form.setValue}
                        formState={form.formState}
                      />
                      <YesNoQuestion
                        name="migraine"
                        detailsName="migraineDetails"
                        label="Migraine"
                        control={form.control}
                        watch={form.watch}
                        setValue={form.setValue}
                        formState={form.formState}
                      />
                      <YesNoQuestion
                        name="drugReaction"
                        detailsName="drugReactionDetails"
                        label="Adverse reaction to drugs"
                        control={form.control}
                        watch={form.watch}
                        setValue={form.setValue}
                        formState={form.formState}
                      />
                      <YesNoQuestion
                        name="visionCorrection"
                        detailsName="visionCorrectionDetails"
                        label="Glasses / contact lenses for sight purposes"
                        control={form.control}
                        watch={form.watch}
                        setValue={form.setValue}
                        formState={form.formState}
                      />
                      <YesNoQuestion
                        name="skinConditions"
                        detailsName="skinConditionsDetails"
                        label="Skin conditions i.e. contact dermatitis/skin irritation/psoriasis/eczema/acne"
                        control={form.control}
                        watch={form.watch}
                        setValue={form.setValue}
                        formState={form.formState}
                      />
                      <YesNoQuestion
                        name="alcoholHealth"
                        detailsName="alcoholHealthDetails"
                        label="Alcohol related health problems"
                        control={form.control}
                        watch={form.watch}
                        setValue={form.setValue}
                        formState={form.formState}
                      />
                    </div>
                  </div>
                  <div className="mt-8 border-t border-dashed pt-4">
                    <YesNoQuestion
                      name="seriousIllnessHistory"
                      detailsName="seriousIllnessHistoryDetails"
                      label="Have you had any serious illness, hospital admission, operation or accident that has caused you to have five or more days off work in the last five years?"
                      placeholder="Please provide details..."
                      control={form.control}
                      watch={form.watch}
                      setValue={form.setValue}
                      formState={form.formState}
                    />
                  </div>
                </section>

                {/* Specific Questions */}
                <section className="space-y-6">
                  <h3 className="flex items-center border-b pb-2 text-xl font-bold text-gray-900">
                    Specific Questions
                  </h3>
                  <YesNoQuestion
                    name="recentIllHealth"
                    detailsName="recentIllHealthDetails"
                    label="Have you had any recent ill health?"
                    control={form.control}
                    watch={form.watch}
                    setValue={form.setValue}
                    formState={form.formState}
                  />
                  <YesNoQuestion
                    name="attendingClinic"
                    detailsName="attendingClinicDetails"
                    label="Are you attending a hospital clinic or doctor at the present time?"
                    control={form.control}
                    watch={form.watch}
                    setValue={form.setValue}
                    formState={form.formState}
                  />
                  <YesNoQuestion
                    name="chickenPox"
                    detailsName="chickenPoxDetails"
                    label="Have you had Varicella (Chicken pox)?"
                    control={form.control}
                    watch={form.watch}
                    setValue={form.setValue}
                    formState={form.formState}
                  />
                  <YesNoQuestion
                    name="communicableDisease"
                    detailsName="communicableDiseaseDetails"
                    label="Have you had any other serious communicable disease?"
                    control={form.control}
                    watch={form.watch}
                    setValue={form.setValue}
                    formState={form.formState}
                  />
                </section>

                {/* Inoculations */}
                <section className="space-y-6">
                  <h3 className="flex items-center border-b pb-2 text-xl font-bold text-gray-900">
                    Inoculations
                  </h3>
                  <p className="mb-4 text-sm italic text-gray-500">
                    Have you ever been inoculated against the following:
                  </p>
<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <YesNoQuestion
                      name="inocDiphtheria"
                      detailsName="inocDiphtheriaDetails"
                      label="Diphtheria"
                      placeholder="Date / Details"
                      control={form.control}
                      watch={form.watch}
                      setValue={form.setValue}
                      formState={form.formState}
                    />
                    <YesNoQuestion
                      name="inocHepB"
                      detailsName="inocHepBDetails"
                      label="Hepatitis B"
                      placeholder="Date / Details"
                      control={form.control}
                      watch={form.watch}
                      setValue={form.setValue}
                      formState={form.formState}
                    />
                    <YesNoQuestion
                      name="inocTB"
                      detailsName="inocTBDetails"
                      label="Tuberculosis (BCG)"
                      placeholder="Date / Details"
                      control={form.control}
                      watch={form.watch}
                      setValue={form.setValue}
                      formState={form.formState}
                    />
                    <YesNoQuestion
                      name="inocRubella"
                      detailsName="inocRubellaDetails"
                      label="Rubella (German Measles)"
                      placeholder="Date / Details"
                      control={form.control}
                      watch={form.watch}
                      setValue={form.setValue}
                      formState={form.formState}
                    />
                    <YesNoQuestion
                      name="inocVaricella"
                      detailsName="inocVaricellaDetails"
                      label="Varicella (Chicken Pox)"
                      placeholder="Date / Details"
                      control={form.control}
                      watch={form.watch}
                      setValue={form.setValue}
                      formState={form.formState}
                    />
                    <YesNoQuestion
                      name="inocPolio"
                      detailsName="inocPolioDetails"
                      label="Polio"
                      placeholder="Date / Details"
                      control={form.control}
                      watch={form.watch}
                      setValue={form.setValue}
                      formState={form.formState}
                    />
                    <YesNoQuestion
                      name="inocTetanus"
                      detailsName="inocTetanusDetails"
                      label="Tetanus"
                      placeholder="Date / Details"
                      control={form.control}
                      watch={form.watch}
                      setValue={form.setValue}
                      formState={form.formState}
                    />
                    <YesNoQuestion
                      name="hivTest"
                      detailsName="hivTestDetails"
                      label="Have you ever undergone a test for HIV?"
                      placeholder="Date / Result"
                      control={form.control}
                      watch={form.watch}
                      setValue={form.setValue}
                      formState={form.formState}
                    />
                    <YesNoQuestion
                      name="inocOther"
                      detailsName="inocOtherDetails"
                      label="Other please specify"
                      placeholder="Name of inoculation and date"
                      control={form.control}
                      watch={form.watch}
                      setValue={form.setValue}
                      formState={form.formState}
                    />
                  </div>
                </section>

                {/* Additional Information */}
                <section className="space-y-6">
                  <h3 className="flex items-center border-b pb-2 text-xl font-bold text-gray-900">
                    Additional Information
                  </h3>
                  <FormField
                    control={form.control}
                    name="daysSickness"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base">
                          Number of days sickness in the past year (i.e. In the
                          last 12 months)
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="e.g. 0, 5 days"
                            className="max-w-md"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="rounded-md bg-blue-50 p-4 text-sm text-blue-800">
                    <strong>Night Working:</strong> Employees who are regularly
                    required to work more than three hours a shift between 11.00
                    p.m. and 6.00 a.m. are entitled to a regular assessment of
                    their suitability to work nights. If you would like the
                    opportunity to have a free health assessment, you must
                    contact management at any time.
                  </div>
                </section>

                {/* Declaration & Consent */}
                <section className="space-y-6 rounded-xl border border-gray-200 bg-gray-50 p-6">
                  <h3 className="flex items-center border-b pb-2 text-xl font-bold text-gray-900">
                    Declaration & Consent
                  </h3>
                  <FormField
                    control={form.control}
                    name="declTrueAccount"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="data-[state=checked]:border-watney data-[state=checked]:bg-watney"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm font-medium leading-relaxed">
                            I declare that the information I have given on this
                            document, is to the best of my knowledge, a true and
                            complete account of my medical history.
                          </FormLabel>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="declDataProcessing"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="data-[state=checked]:border-watney data-[state=checked]:bg-watney"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm font-medium leading-relaxed">
                            I consent that this information may be held and
                            processed by the company under the Data Protection
                            Act 1998.
                          </FormLabel>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                  <div className="py-2 text-sm text-gray-700">
                    Further to the company's risk assessment on infectious
                    diseases it has been identified that it is necessary from a
                    health & safety perspective that all staff are vaccinated
                    against Hepatitis B, Tuberculosis and Rubella for both their
                    own safety and the safety of our patients.
                  </div>
                  <FormField
                    control={form.control}
                    name="declVaccination"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="data-[state=checked]:border-watney data-[state=checked]:bg-watney"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm font-medium leading-relaxed">
                            I understand and accept that it will be a condition
                            of my contract of employment to be fully immunised
                            (if not already) against Hepatitis B, Tuberculosis
                            and Rubella within the first three months of my
                            employment and remain regularly immunised.
                          </FormLabel>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="declTermination"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="data-[state=checked]:border-watney data-[state=checked]:bg-watney"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm font-medium leading-relaxed">
                            I understand and accept that if I do not comply with
                            the above obligations or should any information come
                            to light following my employment which shows that
                            medical information disclosed by myself was
                            misleading or false, the company may terminate my
                            employment.
                          </FormLabel>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                </section>

                <div className="flex justify-end pt-4">
                  <Button
                    type="submit"
                    size="lg"
                    disabled={submitting}
                    className="w-full min-w-[200px] bg-watney text-white hover:bg-watney/90 md:w-auto"
                  >
                    {submitting ? 'Submitting...' : 'Complete'}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
