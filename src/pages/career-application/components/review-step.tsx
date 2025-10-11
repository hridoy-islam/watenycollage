// ReviewStep.tsx — Updated with Multi-Step & Progress Bar (3 Steps)

import { useEffect, useState } from 'react';
import moment from 'moment';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';

import type { TCareer } from '@/types/career';
import React from 'react';

const careerSchema = z
  .object({
    declarationCorrectUpload: z.boolean({
      required_error: 'This field is required'
    }),
    declarationContactReferee: z.boolean({
      required_error: 'This field is required'
    }),
    disciplinaryInvestigation: z.boolean({
      required_error: 'This field is required'
    }),
    disciplinaryInvestigationDetails: z.string().optional(),
    abuseInvestigation: z.boolean({
      required_error: 'This field is required'
    }),
    abuseInvestigationDetails: z.string().optional(),
    appliedBefore: z.boolean({
      required_error: 'This field is required'
    }),
    roaDeclaration: z.boolean({
      required_error: 'This field is required'
    }),
    roaDeclarationDetails: z.string().optional(),

    termsAccepted: z.boolean().refine((val) => val === true, {
      message: 'You must accept the terms and conditions.'
    }),
    dataProcessingAccepted: z.boolean().refine((val) => val === true, {
      message: 'You must consent to data processing.'
    }),
    consentMedicalDeclaration: z.boolean({
      required_error: 'This field is required',
    }),
    consentTerminationClause: z.boolean({
      required_error: 'This field is required',
    }),
    consentVaccination: z.boolean({
      required_error: 'This field is required',
    })

  })
  .superRefine((data, ctx) => {
    if (
      data.disciplinaryInvestigation &&
      !data.disciplinaryInvestigationDetails?.trim()
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Please provide details of the disciplinary investigation.',
        path: ['disciplinaryInvestigationDetails']
      });
    }
    if (data.abuseInvestigation && !data.abuseInvestigationDetails?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'Please provide details of the abuse/inappropriate behaviour investigation.',
        path: ['abuseInvestigationDetails']
      });
    }
    if (data.roaDeclaration && !data.roaDeclarationDetails?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'Please provide details of your conviction, caution, or pending prosecution.',
        path: ['roaDeclarationDetails']
      });
    }
  });

type TFormValues = z.infer<typeof careerSchema>;

// ✅ STEP CONFIGURATION — 3 STEPS
const STEPS = [

  {
    id: 1,
    // title: 'Declarations & GDPR Consent',
    fields: [
      'consentMedicalDeclaration',
      'consentTerminationClause',
      'consentVaccination',
      'declarationContactReferee',
      'declarationCorrectUpload',
      'disciplinaryInvestigation',
      'disciplinaryInvestigationDetails',
      'abuseInvestigation',
      'abuseInvestigationDetails',
      'appliedBefore'
    ]
  },
  {
    id: 2,
    // title: 'ROA Declaration',
    fields: ['roaDeclaration', 'roaDeclarationDetails']
  },
  {
    id: 3,
    // title: 'Terms & Submission',
    fields: ['termsAccepted', 'dataProcessingAccepted']
  }
];

export function ReviewStep({
  defaultValues,
  formData,
  onSubmit,
  setCurrentStep,
  subStep,
  subStepInfo,
  onSubStepChange,
  saveAndLogout,
  loading
}) {
  const [currentStep, setCurrentStepState] = useState(1);
  const totalSteps = STEPS.length;

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const form = useForm<TFormValues>({
    resolver: zodResolver(careerSchema),
    defaultValues: {
      ...defaultValues,

      consentMedicalDeclaration: undefined,
      consentTerminationClause: undefined,
      consentVaccination: undefined,
      declarationCorrectUpload: undefined,
      declarationContactReferee: undefined,
      disciplinaryInvestigation: undefined,
      disciplinaryInvestigationDetails: '',
      abuseInvestigation: undefined,
      abuseInvestigationDetails: '',
      roaDeclaration: undefined,
      roaDeclarationDetails: '',
      appliedBefore: undefined,
      termsAccepted: false,
      dataProcessingAccepted: false
    }
  });

  // Watch for conditional fields
  const watchDisciplinary = form.watch('disciplinaryInvestigation');
  const watchAbuse = form.watch('abuseInvestigation');
  const watchROA = form.watch('roaDeclaration');
  const termsAccepted = form.watch('termsAccepted');
  const dataProcessingAccepted = form.watch('dataProcessingAccepted');
  // Handle Back
  const handleBack = () => {
    if (currentStep === 1) {
      // If at the first review step → go back to previous main step
      if (setCurrentStep) {
        setCurrentStep(13);
      }
    } else {
      // Otherwise go back one review step
      setCurrentStepState(currentStep - 1);
      if (onSubStepChange) {
        onSubStepChange(currentStep - 1);
      }
    }
  };

  // Handle Next (validate + save + go forward)
  const handleNext = async () => {
    const currentStepFields = STEPS[currentStep - 1].fields;
    const isValid = await form.trigger(currentStepFields as any);

    if (isValid) {
      // ✅ Collect current step’s data
      const stepData = currentStepFields.reduce((acc, field) => {
        acc[field] = form.getValues(field as keyof TFormValues);
        return acc;
      }, {} as Partial<TFormValues>);

      // Optional save callback

      if (currentStep < totalSteps) {
        // Go to next review step
        setCurrentStepState(currentStep + 1);
        if (onSubStepChange) {
          onSubStepChange(currentStep + 1);
        }
      } else {
        // Last step → trigger final submit
        form.handleSubmit(onSubmit)();
      }
    }
  };


  // Format helpers (unchanged)
  const formatDate = (date: Date | string | undefined) => {
    if (!date) return 'Not provided';
    return moment(date).format('DD/MM/YYYY');
  };

  const formatValue = (value: any): string => {
    if (value === null || value === undefined || value === '') {
      return 'Not provided';
    }
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    if (
      value instanceof Date ||
      moment(value, moment.ISO_8601, true).isValid()
    ) {
      return moment(value).format('MM-DD-YYYY');
    }
    if (Array.isArray(value)) {
      if (value.length === 0) return 'None';
      if (value[0] instanceof File) return `${value.length} file(s) uploaded`;
      return value.join(', ');
    }
    if (value instanceof File) {
      return 'File uploaded';
    }
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2);
    }
    const str = String(value);
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const formatFieldName = (name: string) => {
    if (name === 'canWorkInUK') return 'Can Work In UK';
    return name
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  // Render Section (unchanged)
  const renderSection = (title: string, data: any, showTitle = true) => {
    if (!data) return null;

    const rows = Object.entries(data).map(([key, value]) => {
      if (
        Array.isArray(value) &&
        value.length > 0 &&
        typeof value[0] === 'string' &&
        value[0].startsWith('http')
      ) {
        return [
          formatFieldName(key),
          <div key={key} className="flex flex-col gap-1">
            {value.map((url, index) => (
              <a
                key={index}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                View Document
              </a>
            ))}
          </div>
        ];
      }

      if (typeof value === 'string' && value.startsWith('http')) {
        return [
          formatFieldName(key),
          <a
            key={key}
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            View Document
          </a>
        ];
      }

      return [formatFieldName(key), formatValue(value)];
    });

    return (
      <div className="">
        {showTitle && (
          <h3 className="mb-2 text-sm font-semibold md:text-lg">{title}</h3>
        )}
        <div className="rounded-md border border-gray-300 p-1 md:p-4">
          <table className="min-w-full divide-y divide-gray-200">
            <tbody className="divide-y divide-gray-200">
              {rows.map(([label, value], index) => (
                <tr key={index}>
                  <td className="break-words px-2 py-4 text-sm font-medium text-gray-900 md:px-6">
                    {label}
                  </td>
                  <td className="break-words px-2 py-4 text-sm text-gray-500 md:px-6">
                    {value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Render Address (unchanged)
  const renderAddress = (address: any) => {
    if (!address) return 'Not provided';
    return `${address.line1}${address.line2 ? `, ${address.line2}` : ''}, ${address.city}, ${address.postCode}, ${address.country}`;
  };


  const isEmpty = (value) => {
    if (value === null || value === undefined) return true;
    if (typeof value === 'string' && value.trim() === '') return true;
    if (Array.isArray(value) && value.length === 0) return true;
    if (typeof value === 'object' && Object.keys(value).length === 0) return true;
    return false;
  };

  const filterEmptyFields = (obj) => {
    if (!obj || typeof obj !== 'object') return {};
    return Object.fromEntries(
      Object.entries(obj).filter(([_, v]) => !isEmpty(v))
    );
  };

  // Preview Sections (unchanged)
  const sections = (
    <div className="space-y-6">
      {/* Personal Details */}
      {renderSection(
        'Personal Details',
        {
          title: defaultValues.title,
          firstName: defaultValues.firstName,
          initial: defaultValues.initial,
          lastName: defaultValues.lastName,
          otherName: defaultValues.otherName,
          dateOfBirth: defaultValues.dateOfBirth,
          nationality: defaultValues.nationality,
          countryOfResidence: defaultValues.countryOfResidence,
          countryOfBirth: defaultValues.countryOfBirth,
          shareCode: defaultValues.shareCode,
          nationalInsuranceNumber: defaultValues.nationalInsuranceNumber,
          postalAddressLine1: defaultValues.postalAddressLine1,
          postalAddressLine2: defaultValues.postalAddressLine2,
          postalCity: defaultValues.postalCity,
          postalPostCode: defaultValues.postalPostCode,
          postalCountry: defaultValues.postalCountry,
        }
      )}

      {/* Emergency Contact */}
      {renderSection(
        'Emergency Contact Information',
        {
          emergencyFullName: defaultValues.emergencyFullName,
          emergencyContactNumber: defaultValues.emergencyContactNumber,
          emergencyEmail: defaultValues.emergencyEmail,
          emergencyRelationship: defaultValues.emergencyRelationship,
          emergencyAddress: defaultValues.emergencyAddress,
        }
      )}

      {/* Application Details */}
      {renderSection(
        'Application Details',
        {
          availableFromDate: defaultValues.availableFromDate,
          source: defaultValues.source,
          referralEmployee:
            defaultValues.source === 'referral'
              ? defaultValues.referralEmployee
              : undefined,
          isStudent: defaultValues.isStudent,
          isUnderStatePensionAge: defaultValues.isUnderStatePensionAge,
          isOver18: defaultValues.isOver18,
          isSubjectToImmigrationControl: defaultValues.isSubjectToImmigrationControl,
          canWorkInUK: defaultValues.canWorkInUK,
          competentInOtherLanguage: defaultValues.competentInOtherLanguage,
          otherLanguages: defaultValues.otherLanguages?.length
            ? defaultValues.otherLanguages
            : undefined,
          drivingLicense: defaultValues.drivingLicense,
          licenseNumber: defaultValues.licenseNumber,
          carOwner: defaultValues.carOwner,
          travelAreas: defaultValues.travelAreas,
          solelyForEverycare: defaultValues.solelyForEverycare,
          otherEmployers: defaultValues.otherEmployers,
          professionalBody: defaultValues.professionalBody,
          professionalBodyDetails: defaultValues.professionalBodyDetails,
        }
      )}

      {/* Availability */}
      {Object.values(defaultValues.availability || {}).some(Boolean) &&
        renderSection('Availability', {
          monday: defaultValues.availability?.monday,
          tuesday: defaultValues.availability?.tuesday,
          wednesday: defaultValues.availability?.wednesday,
          thursday: defaultValues.availability?.thursday,
          friday: defaultValues.availability?.friday,
          saturday: defaultValues.availability?.saturday,
          sunday: defaultValues.availability?.sunday,
        })}

      {/* Education */}
      {Array.isArray(defaultValues.educationData) &&
        defaultValues.educationData.length > 0 &&
        defaultValues.educationData.map((education, index) => {
          const filtered = filterEmptyFields(education);
          return Object.keys(filtered).length > 0 ? (
            <React.Fragment key={index}>
              {renderSection(`Education ${index + 1}`, filtered)}
            </React.Fragment>
          ) : null;
        })}

      {/* Current Employment */}
      {defaultValues.currentEmployment &&
        Object.keys(filterEmptyFields(defaultValues.currentEmployment)).length >
        0 &&
        renderSection('Current Employment', defaultValues.currentEmployment)}

      {/* Previous Employments */}
      {/* Previous Employment — only shown if there are entries */}
      {Array.isArray(defaultValues.previousEmployments) &&
        defaultValues.previousEmployments.length > 0 && (
          <div>
            <h3 className="mb-2 text-lg font-medium text-black">
              Previous Employment
            </h3>
            {defaultValues.previousEmployments.map((employment, index) => {
              const filtered = filterEmptyFields(employment);
              return Object.keys(filtered).length > 0 ? (
                <div
                  key={index}
                  className="mb-4 rounded-md border border-gray-300 bg-gray-50 p-4"
                >
                  {renderSection('', filtered, false)}
                </div>
              ) : null;
            })}
          </div>
        )}


      {/* References */}
      {defaultValues.professionalReferee1 &&
        Object.keys(filterEmptyFields(defaultValues.professionalReferee1))
          .length > 0 &&
        renderSection('Professional Reference 1', defaultValues.professionalReferee1)}

      {defaultValues.professionalReferee2 &&
        Object.keys(filterEmptyFields(defaultValues.professionalReferee2))
          .length > 0 &&
        renderSection('Professional Reference 2', defaultValues.professionalReferee2)}

      {defaultValues.personalReferee &&
        Object.keys(filterEmptyFields(defaultValues.personalReferee)).length >
        0 &&
        renderSection('Personal Reference', defaultValues.personalReferee)}

      {/* Disability */}
      {renderSection(
        'Disability Information',
        filterEmptyFields({
          hasDisability: defaultValues.hasDisability,
          disabilityDetails: defaultValues.disabilityDetails,
          needsReasonableAdjustment: defaultValues.needsReasonableAdjustment,
          reasonableAdjustmentDetails:
            defaultValues.reasonableAdjustmentDetails,
        })
      )}

      {/* Documents */}
      {renderSection(
        'Documents',
        {
          cvResume: defaultValues.cvResume,
          proofOfAddress1: defaultValues.proofOfAddress1,
          proofOfAddress2: defaultValues.proofOfAddress2,
          idDocuments: defaultValues.idDocuments,
          utilityBills: defaultValues.utilityBills,
          bankStatement: defaultValues.bankStatement,
          proofOfNI: defaultValues.proofOfNI,
          immigrationDocument: defaultValues.immigrationDocument,
          // proofOfAddress: defaultValues.proofOfAddress,
          // passport: defaultValues.passport,
          // workExperience: defaultValues.workExperience,
          // personalStatement: defaultValues.personalStatement,
        }
      )}

      {/* Health & Medical */}
      {renderSection(
        'Health & Medical Information',
        filterEmptyFields({
          sex: defaultValues.sex,
          advisedMedicalWorkRestriction: defaultValues.advisedMedicalWorkRestriction,
          advisedMedicalWorkRestrictionComment: defaultValues.advisedMedicalWorkRestrictionComment,
          undueFatigue: defaultValues.undueFatigue,
          undueFatigueDetails: defaultValues.undueFatigueDetails,
          bronchitis: defaultValues.bronchitis,
          bronchitisDetails: defaultValues.bronchitisDetails,
          breathlessness: defaultValues.breathlessness,
          breathlessnessDetails: defaultValues.breathlessnessDetails,
          allergies: defaultValues.allergies,
          allergiesDetails: defaultValues.allergiesDetails,
          pneumonia: defaultValues.pneumonia,
          pneumoniaDetails: defaultValues.pneumoniaDetails,
          hayFever: defaultValues.hayFever,
          hayFeverDetails: defaultValues.hayFeverDetails,
          shortnessOfBreath: defaultValues.shortnessOfBreath,
          shortnessOfBreathDetails: defaultValues.shortnessOfBreathDetails,
          jundice: defaultValues.jundice,
          jundiceDetails: defaultValues.jundiceDetails,
          stomachProblems: defaultValues.stomachProblems,
          stomachProblemsDetails: defaultValues.stomachProblemsDetails,
          stomachUlcer: defaultValues.stomachUlcer,
          stomachUlcerDetails: defaultValues.stomachUlcerDetails,
          hernias: defaultValues.hernias,
          herniasDetails: defaultValues.herniasDetails,
          bowelProblem: defaultValues.bowelProblem,
          bowelProblemDetails: defaultValues.bowelProblemDetails,
          diabetesMellitus: defaultValues.diabetesMellitus,
          diabetesMellitusDetails: defaultValues.diabetesMellitusDetails,
          nervousDisorder: defaultValues.nervousDisorder,
          nervousDisorderDetails: defaultValues.nervousDisorderDetails,
          dizziness: defaultValues.dizziness,
          dizzinessDetails: defaultValues.dizzinessDetails,
          earProblems: defaultValues.earProblems,
          earProblemsDetails: defaultValues.earProblemsDetails,
          hearingDefect: defaultValues.hearingDefect,
          hearingDefectDetails: defaultValues.hearingDefectDetails,
          epilepsy: defaultValues.epilepsy,
          epilepsyDetails: defaultValues.epilepsyDetails,
          eyeProblems: defaultValues.eyeProblems,
          eyeProblemsDetails: defaultValues.eyeProblemsDetails,
          ppeAllergy: defaultValues.ppeAllergy,
          ppeAllergyDetails: defaultValues.ppeAllergyDetails,
          rheumaticFever: defaultValues.rheumaticFever,
          rheumaticFeverDetails: defaultValues.rheumaticFeverDetails,
          highBloodPressure: defaultValues.highBloodPressure,
          highBloodPressureDetails: defaultValues.highBloodPressureDetails,
          lowBloodPressure: defaultValues.lowBloodPressure,
          lowBloodPressureDetails: defaultValues.lowBloodPressureDetails,
          palpitations: defaultValues.palpitations,
          palpitationsDetails: defaultValues.palpitationsDetails,
          heartAttack: defaultValues.heartAttack,
          heartAttackDetails: defaultValues.heartAttackDetails,
          angina: defaultValues.angina,
          anginaDetails: defaultValues.anginaDetails,
          asthma: defaultValues.asthma,
          asthmaDetails: defaultValues.asthmaDetails,
          chronicLungProblems: defaultValues.chronicLungProblems,
          chronicLungProblemsDetails: defaultValues.chronicLungProblemsDetails,
          stroke: defaultValues.stroke,
          strokeDetails: defaultValues.strokeDetails,
          heartMurmur: defaultValues.heartMurmur,
          heartMurmurDetails: defaultValues.heartMurmurDetails,
          backProblems: defaultValues.backProblems,
          backProblemsDetails: defaultValues.backProblemsDetails,
          jointProblems: defaultValues.jointProblems,
          jointProblemsDetails: defaultValues.jointProblemsDetails,
          swollenLegs: defaultValues.swollenLegs,
          swollenLegsDetails: defaultValues.swollenLegsDetails,
          varicoseVeins: defaultValues.varicoseVeins,
          varicoseVeinsDetails: defaultValues.varicoseVeinsDetails,
          rheumatism: defaultValues.rheumatism,
          rheumatismDetails: defaultValues.rheumatismDetails,
          migraine: defaultValues.migraine,
          migraineDetails: defaultValues.migraineDetails,
          drugReaction: defaultValues.drugReaction,
          drugReactionDetails: defaultValues.drugReactionDetails,
          visionCorrection: defaultValues.visionCorrection,
          visionCorrectionDetails: defaultValues.visionCorrectionDetails,
          skinConditions: defaultValues.skinConditions,
          skinConditionsDetails: defaultValues.skinConditionsDetails,
          alcoholHealthProblems: defaultValues.alcoholHealthProblems,
          alcoholHealthProblemsDetails: defaultValues.alcoholHealthProblemsDetails,
          seriousIllnessDetails: defaultValues.seriousIllnessDetails,
          recentIllHealth: defaultValues.recentIllHealth,
          recentIllHealthComment: defaultValues.recentIllHealthComment,
          attendingClinic: defaultValues.attendingClinic,
          attendingClinicComment: defaultValues.attendingClinicComment,
          hadChickenPox: defaultValues.hadChickenPox,
          hadChickenPoxComment: defaultValues.hadChickenPoxComment,
          otherCommunicableDisease: defaultValues.otherCommunicableDisease,
          otherCommunicableDiseaseComment: defaultValues.otherCommunicableDiseaseComment,
        })
      )}
      {/* Vaccinations & Inoculations */}
      {renderSection(
        'Vaccinations & Inoculations',
        {
          inocDiphtheria: defaultValues.inocDiphtheria,
          inocDiphtheriaComment: defaultValues.inocDiphtheriaComment,
          inocHepatitisB: defaultValues.inocHepatitisB,
          inocHepatitisBComment: defaultValues.inocHepatitisBComment,
          inocTuberculosis: defaultValues.inocTuberculosis,
          inocTuberculosisComment: defaultValues.inocTuberculosisComment,
          inocRubella: defaultValues.inocRubella,
          inocRubellaComment: defaultValues.inocRubellaComment,
          inocVaricella: defaultValues.inocVaricella,
          inocVaricellaComment: defaultValues.inocVaricellaComment,
          inocPolio: defaultValues.inocPolio,
          inocPolioComment: defaultValues.inocPolioComment,
          inocTetanus: defaultValues.inocTetanus,
          inocTetanusComment: defaultValues.inocTetanusComment,
          testedHIV: defaultValues.testedHIV,
          testedHIVComment: defaultValues.testedHIVComment,
          inocOther: defaultValues.inocOther,
          inocOtherComment: defaultValues.inocOtherComment,
          daysSickLastYear: defaultValues.daysSickLastYear,
        }
      )}
      {renderSection(
        'Payment Details',
        {
          houseNumberOrName: defaultValues.houseNumberOrName,
          postCode: defaultValues.postCode,
          jobRole: defaultValues.jobRole,
          otherJobRole: defaultValues.otherJobRole,
          accountNumber: defaultValues.accountNumber,
          sortCode: defaultValues.sortCode,
          bankName: defaultValues.bankName,
          branchName: defaultValues.branchName,
          buildingSocietyRollNo: defaultValues.buildingSocietyRollNo,
        }
      )}

      {/* Declarations */}
      {/* {renderSection(
        'Consent & Declarations',
        filterEmptyFields({

          authorizeReferees: defaultValues.authorizeReferees,
          declarationCorrectUpload: defaultValues.declarationCorrectUpload,
          declarationContactReferee: defaultValues.declarationContactReferee,
          disciplinaryInvestigation: defaultValues.disciplinaryInvestigation,
          disciplinaryInvestigationDetails:
            defaultValues.disciplinaryInvestigationDetails,
          abuseInvestigation: defaultValues.abuseInvestigation,
          abuseInvestigationDetails: defaultValues.abuseInvestigationDetails,
          roaDeclaration: defaultValues.roaDeclaration,
          roaDeclarationDetails: defaultValues.roaDeclarationDetails,
          appliedBefore: defaultValues.appliedBefore,
          termsAccepted: defaultValues.termsAccepted,
          dataProcessingAccepted: defaultValues.dataProcessingAccepted,
          consentMedicalDeclaration: defaultValues.consentMedicalDeclaration,
          consentVaccination: defaultValues.consentVaccination,
          consentTerminationClause: defaultValues.consentTerminationClause,
        })
      )} */}
    </div>
  );


  // Reusable Yes/No Checkbox Component with proper HTML labels


  const YesNoCheckbox = ({ control, name, label, required = false }) => (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <div className="flex gap-4">
            <FormControl>
              <label className="flex items-center cursor-pointer">
                <Checkbox
                  checked={field.value === true}

                  onCheckedChange={(checked) => {
                    if (checked) {
                      field.onChange(true);
                    } else {
                      // Don't allow unchecking by clicking the same checkbox
                      // Only allow changing by clicking the other option
                      field.onChange(field.value);
                    }
                  }}
                />
                <FormLabel className="ml-2 text-lg cursor-pointer">Yes</FormLabel>
              </label>
            </FormControl>
            <FormControl>
              <label className="flex items-center cursor-pointer">
                <Checkbox
                  checked={field.value === false}


                  onCheckedChange={(checked) => {
                    if (checked) {
                      field.onChange(false);
                    } else {
                      field.onChange(field.value);
                    }
                  }}
                />
                <FormLabel className="ml-2 text-lg cursor-pointer">No</FormLabel>
              </label>
            </FormControl>
          </div>
          <FormMessage className="text-md" />
        </FormItem>
      )}
    />
  );

  const renderCurrentStep = () => {
    switch (currentStep) {

      // case 1:
      //   return (
      //     <div className="overflow-x-auto">

      //     </div>

      //   );
      case 1:
        return (
          <div className="overflow-x-auto">
            <h1 className="text-xl font-semibold sm:text-2xl pt-4">
              Consent And Declaration
            </h1>

            <table className="w-full border-collapse text-lg">
              <tbody>
                {/* Night Working Notice */}
                <tr>
                  <td colSpan={3} className="px-2 py-4">
                    <div className="rounded-md bg-blue-50 p-4 text-blue-800 text-lg">
                      <strong>Night Working:</strong> Employees who are regularly
                      required to work more than three hours a shift between 11.00 p.m.
                      and 6.00 a.m. are entitled to a regular assessment of their
                      suitability to work nights. If you would like the opportunity to
                      have a free health assessment, you must contact management at any
                      time.
                    </div>
                  </td>
                </tr>

                {/* Consent Medical Declaration */}
                <tr className="border-b border-gray-300">
                  <td className="px-2 py-4 align-top">
                    <span className="text-lg font-medium">
                      I declare that the information I have given on this
                      document is, to the best of my knowledge, a true and
                      complete account of my medical history.
                      <span className="text-red-500">*</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 align-top text-right w-1/3">
                    <FormField
                      control={form.control}
                      name="consentMedicalDeclaration"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex justify-end gap-4">
                            <FormControl>
                              <label className="flex items-center cursor-pointer">
                                <Checkbox
                                  checked={field.value === true}

                                  onCheckedChange={() => field.onChange(true)}
                                />
                                <FormLabel className="ml-2 text-lg cursor-pointer">Yes</FormLabel>
                              </label>
                            </FormControl>
                            <FormControl>
                              <label className="flex items-center cursor-pointer">
                                <Checkbox
                                  checked={field.value === false}

                                  onCheckedChange={() => field.onChange(false)}
                                />
                                <FormLabel className="ml-2 text-lg cursor-pointer">No</FormLabel>
                              </label>
                            </FormControl>
                          </div>
                          <FormMessage className="text-md" />
                        </FormItem>
                      )}
                    />
                  </td>
                </tr>

                {/* Consent Vaccination */}
                <tr className="border-b border-gray-300">
                  <td className="px-2 py-4 align-top w-2/3">
                    <span className="text-lg font-medium">
                      I understand and accept that it will be a condition of my
                      contract of employment to be fully immunised (if not
                      already) against Hepatitis B, Tuberculosis and Rubella
                      within the first three months of my employment and remain
                      regularly immunised.
                      <span className="text-red-500">*</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right w-1/3">
                    <FormField
                      control={form.control}
                      name="consentVaccination"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex justify-end gap-4">
                            <FormControl>
                              <label className="flex items-center cursor-pointer">
                                <Checkbox
                                  checked={field.value === true}

                                  onCheckedChange={() => field.onChange(true)}
                                />
                                <FormLabel className="ml-2 text-lg cursor-pointer">Yes</FormLabel>
                              </label>
                            </FormControl>
                            <FormControl>
                              <label className="flex items-center cursor-pointer">
                                <Checkbox
                                  checked={field.value === false}

                                  onCheckedChange={() => field.onChange(false)}
                                />
                                <FormLabel className="ml-2 text-lg cursor-pointer">No</FormLabel>
                              </label>
                            </FormControl>
                          </div>
                          <FormMessage className="text-md" />
                        </FormItem>
                      )}
                    />
                  </td>
                </tr>

                {/* Consent Termination Clause */}
                <tr className="border-b border-gray-300">
                  <td className="px-2 py-4 align-top w-2/3">
                    <span className="text-lg font-medium">
                      I understand and accept that if I do not comply with the
                      above obligations or should any information come to light
                      following my employment with Everycare Romford which shows
                      that medical information disclosed by myself was
                      misleading or false, Everycare Romford may terminate my
                      employment.
                      <span className="text-red-500">*</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right w-1/3">
                    <FormField
                      control={form.control}
                      name="consentTerminationClause"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex justify-end gap-4">
                            <FormControl>
                              <label className="flex items-center cursor-pointer">
                                <Checkbox
                                  checked={field.value === true}

                                  onCheckedChange={() => field.onChange(true)}
                                />
                                <FormLabel className="ml-2 text-lg cursor-pointer">Yes</FormLabel>
                              </label>
                            </FormControl>
                            <FormControl>
                              <label className="flex items-center cursor-pointer">
                                <Checkbox
                                  checked={field.value === false}

                                  onCheckedChange={() => field.onChange(false)}
                                />
                                <FormLabel className="ml-2 text-lg cursor-pointer">No</FormLabel>
                              </label>
                            </FormControl>
                          </div>
                          <FormMessage className="text-md" />
                        </FormItem>
                      )}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
            <table className="w-full border-collapse text-lg">
              <tbody>
                {/* GDPR Declaration */}
                <tr className="border-b border-gray-300">
                  <td className="px-2 py-4 align-top">
                    <span className="text-xl font-semibold sm:text-2xl">
                      GDPR Declaration
                    </span>
                    <br />
                    <br />
                    <span className="text-lg font-medium">
                      I,{' '}
                      <span className="font-medium">
                        {defaultValues?.title} {defaultValues?.firstName}{' '}
                        {defaultValues?.initial} {defaultValues?.lastName}
                      </span>
                      , hereby authorize Everycare Romford to contact the
                      mentioned referees to avail my reference as a part of the
                      recruitment process.
                      <span className="text-red-500">*</span>
                    </span>
                  </td>
                  <td className="px-2 py-4 align-middle">
                    <FormField
                      control={form.control}
                      name="declarationContactReferee"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex gap-4">
                            <FormControl>
                              <label className="flex items-center cursor-pointer">
                                <Checkbox
                                  checked={field.value === true}


                                  onCheckedChange={() => field.onChange(true)}
                                />
                                <FormLabel className="ml-2 text-lg cursor-pointer">Yes</FormLabel>
                              </label>
                            </FormControl>
                            <FormControl>
                              <label className="flex items-center cursor-pointer">
                                <Checkbox
                                  checked={field.value === false}


                                  onCheckedChange={() => field.onChange(false)}
                                />
                                <FormLabel className="ml-2 text-lg cursor-pointer">No</FormLabel>
                              </label>
                            </FormControl>
                          </div>
                          <FormMessage className="text-md" />
                        </FormItem>
                      )}
                    />
                  </td>
                  <td className="px-2 py-4 align-top"></td>
                </tr>

                <tr>
                  <td colSpan={3} className="py-2"></td>
                </tr>

                {/* Correct Upload Declaration */}
                <tr className="border-b border-gray-300">
                  <td className="px-2 py-4 align-top">
                    <span className="text-lg font-medium">
                      Do you declare that all uploaded documents and information
                      are correct and authentic?{' '}
                      <span className="text-red-500">*</span>
                    </span>
                  </td>
                  <td className="px-2 py-4 align-top">
                    <FormField
                      control={form.control}
                      name="declarationCorrectUpload"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex gap-4">
                            <FormControl>
                              <label className="flex items-center cursor-pointer">
                                <Checkbox
                                  checked={field.value === true}


                                  onCheckedChange={() => field.onChange(true)}
                                />
                                <FormLabel className="ml-2 text-lg cursor-pointer">Yes</FormLabel>
                              </label>
                            </FormControl>
                            <FormControl>
                              <label className="flex items-center cursor-pointer">
                                <Checkbox
                                  checked={field.value === false}


                                  onCheckedChange={() => field.onChange(false)}
                                />
                                <FormLabel className="ml-2 text-lg cursor-pointer">No</FormLabel>
                              </label>
                            </FormControl>
                          </div>
                          <FormMessage className="text-md" />
                        </FormItem>
                      )}
                    />
                  </td>
                  <td className="px-2 py-4 align-top"></td>
                </tr>

                {/* Disciplinary Investigation */}
                <tr className="border-b border-gray-300">
                  <td className="px-2 py-4 align-top">
                    <span className="text-lg font-medium">
                      Have you ever been subject to a disciplinary investigation
                      by an employer, or been required to attend such a process
                      (whether or not this resulted in dismissal)?{' '}
                      <span className="text-red-500">*</span>
                    </span>
                  </td>
                  <td className="px-2 py-4 align-top">
                    <FormField
                      control={form.control}
                      name="disciplinaryInvestigation"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex gap-4">
                            <FormControl>
                              <label className="flex items-center cursor-pointer">
                                <Checkbox
                                  checked={field.value === true}


                                  onCheckedChange={() => field.onChange(true)}
                                />
                                <FormLabel className="ml-2 text-lg cursor-pointer">Yes</FormLabel>
                              </label>
                            </FormControl>
                            <FormControl>
                              <label className="flex items-center cursor-pointer">
                                <Checkbox
                                  checked={field.value === false}


                                  onCheckedChange={() => field.onChange(false)}
                                />
                                <FormLabel className="ml-2 text-lg cursor-pointer">No</FormLabel>
                              </label>
                            </FormControl>
                          </div>
                          <FormMessage className="text-md" />
                        </FormItem>
                      )}
                    />
                  </td>
                  <td className="px-2 py-4 align-top"></td>
                </tr>

                {watchDisciplinary && (
                  <tr className="border-b border-gray-300">
                    <td colSpan={3} className="px-2 py-4">
                      <FormField
                        control={form.control}
                        name="disciplinaryInvestigationDetails"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className='text-watney'>
                              Please provide details and outcome{' '}
                              <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Enter details here..."
                                className="min-h-[100px] p-4 text-lg mt-2 w-full"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage className="text-md" />
                          </FormItem>
                        )}
                      />
                    </td>
                  </tr>
                )}

                {/* Abuse/Inappropriate Behaviour Investigation */}
                <tr className="border-b border-gray-300">
                  <td className="px-2 py-4 align-top">
                    <span className="text-lg font-medium">
                      Have you ever been investigated or been involved (in any
                      way) in an investigation/enquiry regarding abuse or any
                      other inappropriate behaviour?{' '}
                      <span className="text-red-500">*</span>
                    </span>
                  </td>
                  <td className="px-2 py-4 align-top">
                    <FormField
                      control={form.control}
                      name="abuseInvestigation"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex gap-4">
                            <FormControl>
                              <label className="flex items-center cursor-pointer">
                                <Checkbox
                                  checked={field.value === true}


                                  onCheckedChange={() => field.onChange(true)}
                                />
                                <FormLabel className="ml-2 text-lg cursor-pointer">Yes</FormLabel>
                              </label>
                            </FormControl>
                            <FormControl>
                              <label className="flex items-center cursor-pointer">
                                <Checkbox
                                  checked={field.value === false}


                                  onCheckedChange={() => field.onChange(false)}
                                />
                                <FormLabel className="ml-2 text-lg cursor-pointer">No</FormLabel>
                              </label>
                            </FormControl>
                          </div>
                          <FormMessage className="text-md" />
                        </FormItem>
                      )}
                    />
                  </td>
                  <td className="px-2 py-4 align-top"></td>
                </tr>

                {watchAbuse && (
                  <tr className="border-b border-gray-300">
                    <td colSpan={3} className="px-2 py-4">
                      <FormField
                        control={form.control}
                        name="abuseInvestigationDetails"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className='text-watney'>
                              Please provide details and outcome{' '}
                              <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Enter details here..."
                                className="min-h-[100px]  p-4 text-lg mt-2 w-full"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage className="text-md" />
                          </FormItem>
                        )}
                      />
                    </td>
                  </tr>
                )}

                {/* Applied Before */}
                <tr className="border-b border-gray-300">
                  <td className="px-2 py-4 align-top">
                    <span className="text-lg font-medium">
                      Have you previously applied for a role with this
                      organisation? <span className="text-red-500">*</span>
                    </span>
                  </td>
                  <td className="px-2 py-4 align-top">
                    <FormField
                      control={form.control}
                      name="appliedBefore"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex gap-4">
                            <FormControl>
                              <label className="flex items-center cursor-pointer">
                                <Checkbox
                                  checked={field.value === true}


                                  onCheckedChange={() => field.onChange(true)}
                                />
                                <FormLabel className="ml-2 text-lg cursor-pointer">Yes</FormLabel>
                              </label>
                            </FormControl>
                            <FormControl>
                              <label className="flex items-center cursor-pointer">
                                <Checkbox
                                  checked={field.value === false}


                                  onCheckedChange={() => field.onChange(false)}
                                />
                                <FormLabel className="ml-2 text-lg cursor-pointer">No</FormLabel>
                              </label>
                            </FormControl>
                          </div>
                          <FormMessage className="text-md" />
                        </FormItem>
                      )}
                    />
                  </td>
                  <td className="px-2 py-4 align-top"></td>
                </tr>
              </tbody>
            </table>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <div className="border-b border-gray-300 pb-4 pt-4">
              <h2 className="text-xl font-semibold text-gray-800 sm:text-2xl">
                REHABILITATION OF OFFENDERS ACT 1974
              </h2>
              <p className="mt-2 text-md text-gray-600">
                By virtue of the Rehabilitation of Offenders Act 1974 (Exception
                Order 75), the provisions of Section 4.2 do not apply to health
                service roles. Your answer must include any "spent" convictions.
              </p>
              <p className="mt-2 text-md italic text-gray-700">
                (Note: A conviction may not prevent your application from being
                processed, but we will require further details at interview.
                Failure to disclose may be considered gross misconduct.)
              </p>
            </div>
            <div className="w-full">
              <FormField
                control={form.control}
                name="roaDeclaration"
                render={({ field }) => (
                  <FormItem className="w-full">
                    {/* ✅ Label + Controls in one row */}
                    <div className="flex items-center justify-between gap-6">
                      <FormLabel className="whitespace-normal text-lg font-medium">
                        Have you ever received a caution, been convicted of a
                        criminal offence (including spent convictions), or have
                        any outstanding pending prosecutions?{' '}
                        <span className="text-red-500">*</span>
                      </FormLabel>

                      <FormControl>
                        <div className="flex items-center gap-6">
                          <label className="flex cursor-pointer items-center gap-2 text-lg">
                            <Checkbox
                              checked={field.value === true}


                              onCheckedChange={() => field.onChange(true)}
                            />
                            <span>Yes</span>
                          </label>

                          <label className="flex cursor-pointer items-center gap-2 text-lg">
                            <Checkbox
                              checked={field.value === false}


                              onCheckedChange={() => field.onChange(false)}
                            />
                            <span>No</span>
                          </label>
                        </div>
                      </FormControl>
                    </div>

                    <FormMessage className="text-md" />
                  </FormItem>
                )}
              />
            </div>

            {watchROA && (
              <FormField
                control={form.control}
                name="roaDeclarationDetails"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-watney'>
                      Please specify the type, number and dates of all offences{' '}
                      <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter details here..."
                        className="min-h-[100px]  p-4 text-lg mt-2 w-full"
                        rows={5}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-md" />
                  </FormItem>
                )}
              />
            )}
          </div>
        );

      case 3:
        return (
          <>
            {/* Terms Section */}
            <div className="mt-8 pt-4">
              <h1 className="mb-2 text-xl font-semibold sm:text-2xl">
                Terms and Conditions Agreement
              </h1>
              <div className="max-h-40 overflow-y-auto rounded-md border border-gray-300 bg-gray-50 p-3 text-md">
                <p className="mb-2">
                  I confirm that the information provided is true, complete, and
                  accurate. False information may lead to termination.
                </p>
                <p>
                  I acknowledge that my data may be used for compliance and
                  recruitment purposes in line with UK GDPR.
                </p>
              </div>
            </div>
            <p className="mt-6 text-lg font-medium text-gray-800">
              Please tick the boxes to confirm:
            </p>

            <div className="mt-4 space-y-4">
              {/* Terms */}
              <FormField
                control={form.control}
                name="termsAccepted"
                render={({ field }) => (
                  <FormItem className="flex items-start space-x-3 rounded-lg border border-gray-300 p-3 hover:shadow-md sm:p-4">
                    <FormControl className="mt-2">
                      <Checkbox
                        id="terms"
                        checked={field.value}


                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel
                      htmlFor="terms"
                      className="text-lg"
                    >
                      I accept the terms and conditions of this application
                      process.
                    </FormLabel>
                    <FormMessage className="text-md" />
                  </FormItem>
                )}
              />

              {/* Data Processing */}
              <FormField
                control={form.control}
                name="dataProcessingAccepted"
                render={({ field }) => (
                  <FormItem className="flex items-start space-x-3 rounded-lg border border-gray-300 p-3 hover:shadow-md sm:p-4">
                    <FormControl className="mt-2">
                      <Checkbox
                        id="data-processing"


                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel
                      htmlFor="data-processing"
                      className="text-lg"
                    >
                      I consent to the processing of my personal data in line
                      with UK GDPR and the Data Protection Act 2018.
                    </FormLabel>
                    <FormMessage className="text-md" />
                  </FormItem>
                )}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col justify-between gap-4 pt-6 sm:flex-row">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full  text-lg sm:w-auto"
                  >
                    Preview Application
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-h-[80vh] w-full overflow-y-auto sm:min-w-[600px] lg:min-w-[800px]">
                  <DialogHeader>
                    <DialogTitle className="text-lg font-medium">Application Preview</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-6">{sections}</div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                      className=" text-lg bg-watney text-white hover:bg-watney/90"
                    >
                      Close
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </>
        );

      default:
        return null;
    }
  };
  // ✅ RENDER PROGRESS BAR
  const renderProgressBar = () => (
    <div className="py-4">
      <div className="mb-2 flex justify-between">
        <span className="text-sm font-medium text-gray-700">
          Step {currentStep} of {totalSteps}
        </span>
        <span className="text-sm text-gray-500">
          {Math.round((currentStep / totalSteps) * 100)}% Complete
        </span>
      </div>
      <div className="h-2.5 w-full rounded-full bg-gray-200">
        <div
          className="h-2.5 rounded-full bg-watney transition-all duration-300"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        ></div>
      </div>
    </div>
  );

  return (
    <Form {...form}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        className="space-y-4"
      >
        <Card className="border-none shadow-none">
          <CardContent>
            {/* {renderProgressBar()} */}

            <div className="mb-6">
              <h3 className="mb-4 text-lg font-semibold">
                {STEPS[currentStep - 1].title}
              </h3>
              {renderCurrentStep()}
            </div>

            {/* NAVIGATION BUTTONS */}
            <div className="mt-8 flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                className=" bg-watney  text-lg text-white hover:bg-watney/90"
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
                  type="button"
                  onClick={handleNext}
                  disabled={!termsAccepted || !dataProcessingAccepted || loading}
                  className=" bg-watney  text-lg text-white hover:bg-watney/90"
                >{loading ? "Submitting..." : "Submit Application"}
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleNext}

                  className=" bg-watney  text-lg text-white hover:bg-watney/90"
                >
                  Save And Next
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </form>
    </Form>
  );
}
