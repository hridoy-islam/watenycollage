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
import type { TCareer } from '@/types/career';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import React from 'react';
import { HelperTooltip } from '@/helper/HelperTooltip';

const careerSchema = z
  .object({
    declarationCorrectUpload: z.boolean({
      required_error: 'This field is required'
    }),
    declarationContactReferee: z.boolean({
      required_error: 'This field is required'
    }),
    criminalConviction: z.boolean({
      required_error: 'This field is required'
    }),
    criminalConvictionDetails: z.string().optional(),
    appliedBefore: z.boolean({
      required_error: 'This field is required'
    }),
    termsAccepted: z.boolean().refine((val) => val === true, {
      message: 'You must accept the terms and conditions.'
    }),
    dataProcessingAccepted: z.boolean().refine((val) => val === true, {
      message: 'You must consent to data processing.'
    })
  })
  .superRefine((data, ctx) => {
    if (data.criminalConviction && !data.criminalConvictionDetails?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Please provide details of your conviction.',
        path: ['criminalConvictionDetails']
      });
    }
  });

type TFormValues = z.infer<typeof careerSchema>;

export function ReviewStep({
  defaultValues,
  formData,
  onSubmit,
  setCurrentStep
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const form = useForm<TFormValues>({
    resolver: zodResolver(careerSchema),
    defaultValues: {
      ...defaultValues,
      declarationCorrectUpload: undefined,

      declarationContactReferee: undefined,

      criminalConviction: undefined,

      criminalConvictionDetails: '',

      appliedBefore: undefined,
      termsAccepted: false,
      dataProcessingAccepted: false
    }
  });

  // useEffect(() => {
  //   if (defaultValues) {
  //     form.reset(defaultValues);
  //   }
  // }, [defaultValues, form]);

  const termsAccepted = form.watch('termsAccepted');
  const dataProcessingAccepted = form.watch('dataProcessingAccepted');

  function handleBack() {
    setCurrentStep(9);
  }

  const { watch } = form;
  const watchConviction = watch('criminalConviction');

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
    // Convert to string and capitalize first letter
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
  const renderSection = (title: string, data: any, showTitle = true) => {
    if (!data) return null;

    const rows = Object.entries(data).map(([key, value]) => {
      // Handle array of URLs
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

      // Handle single URL string
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

      // Standard value formatting
      return [formatFieldName(key), formatValue(value)];
    });

    return (
      <div className="mb-6">
        {showTitle && <h3 className="mb-2 text-sm md:text-lg font-semibold">{title}</h3>}
        <div className="rounded-md border border-gray-200 p-1 md:p-4">
          <table className="min-w-full divide-y divide-gray-200">
            <tbody className="divide-y divide-gray-200">
              {rows.map(([label, value], index) => (
                <tr key={index}>
                  <td className="break-words px-2 md:px-6 py-4 text-sm font-medium text-gray-900">
                    {label}
                  </td>
                  <td className="break-words px-2 md:px-6 py-4 text-sm text-gray-500">
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
  const renderAddress = (address: any) => {
    if (!address) return 'Not provided';
    return `${address.line1}${address.line2 ? `, ${address.line2}` : ''}, ${address.city}, ${address.postCode}, ${address.country}`;
  };

  const sections = (
    <div className="space-y-6">
      {renderSection('Personal Details', {
        title: defaultValues.title,
        firstName: defaultValues.firstName,
        initial: defaultValues.initial,
        lastName: defaultValues.lastName,
        dateOfBirth: defaultValues.dateOfBirth,
        gender: defaultValues.gender,
        maritalStatus: defaultValues.maritalStatus,
        nationality: defaultValues.nationality,
        shareCode: defaultValues.shareCode,
        nationalInsuranceNumber: defaultValues.nationalInsuranceNumber,
        postalAddressLine1: defaultValues.postalAddressLine1,
        postalAddressLine2: defaultValues.postalAddressLine2,
        postalCity: defaultValues.postalCity,
        postalPostCode: defaultValues.postalPostCode,
        postalCountry: defaultValues.postalCountry
      })}

      {renderSection('Emergency Contact Information', {
        emergencyFullName: defaultValues.emergencyFullName,
        emergencyContactNumber: defaultValues.emergencyContactNumber,
        emergencyEmail: defaultValues.emergencyEmail,
        emergencyRelationship: defaultValues.emergencyRelationship,
        emergencyAddress: defaultValues.emergencyAddress
      })}

      {renderSection(
        'Application Details',
        Object.fromEntries(
          Object.entries({
            availableFromDate: defaultValues.availableFromDate,
            source: defaultValues.source,
            isStudent: defaultValues.isStudent,
            referralEmployee:
              defaultValues.source === 'referral'
                ? defaultValues.referralEmployee
                : undefined,
            isUnderStatePensionAge: defaultValues.isUnderStatePensionAge,
            isOver18: defaultValues.isOver18,
            isSubjectToImmigrationControl:
              defaultValues.isSubjectToImmigrationControl,
            canWorkInUK: defaultValues.canWorkInUK

          }).filter(([_, value]) => value !== undefined)
        )
      )}

      {/* 🔥 New Section: Availability */}
      {renderSection('Availability', {
        monday: defaultValues.availability.monday,
        tuesday: defaultValues.availability.tuesday,
        wednesday: defaultValues.availability.wednesday,
        thursday: defaultValues.availability.thursday,
        friday: defaultValues.availability.friday,
        saturday: defaultValues.availability.saturday,
        sunday: defaultValues.availability.sunday
      })}

      {Array.isArray(defaultValues.educationData) &&
        defaultValues.educationData.map((education, index) => (
          <React.Fragment key={index}>
            {renderSection(`Education ${index + 1}`, {
              institution: education.institution,
              qualification: education.qualification,
              grade: education.grade,
              awardDate: education.awardDate,
              certificate: education.certificate
            })}
          </React.Fragment>
        ))}

      {renderSection('Current Employment', defaultValues.currentEmployment)}
      {defaultValues.previousEmployments &&
        defaultValues.previousEmployments.length > 0 && (
          <div>
            <h3 className="mb-2 text-lg font-medium text-black">
              Previous Employment
            </h3>

            {defaultValues.previousEmployments.map((employment, index) => (
              <div
                key={index}
                className="mb-4 rounded-md border border-gray-200 bg-gray-50 p-4"
              >
                {renderSection('', employment, false)}
              </div>
            ))}
          </div>
        )}
      {renderSection('Employment Gaps', {
        hasEmploymentGaps: defaultValues.hasEmploymentGaps,
        employmentGapsExplanation: defaultValues.employmentGapsExplanation
      })}

      {renderSection('Reference 1', defaultValues.referee1)}
      {renderSection('Reference 2', defaultValues.referee2)}
      {renderSection('Disability Information', {
        hasDisability: defaultValues.hasDisability,
        disabilityDetails: defaultValues.disabilityDetails,
        needsReasonableAdjustment: defaultValues.needsReasonableAdjustment,
        reasonableAdjustmentDetails: defaultValues.reasonableAdjustmentDetails
      })}

      {renderSection('Documents', {
        cvResume: defaultValues.cvResume,
        proofOfAddress: defaultValues.proofOfAddress,
        passport: defaultValues.passport,
        immigrationDocument: defaultValues.immigrationDocument,
        workExperience: defaultValues.workExperience,
        personalStatement: defaultValues.personalStatement
      })}
    </div>
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card className="-mt-10 border-none shadow-none">
          <CardHeader />
          <CardContent className="space-y-6">
            {/* Section Title */}
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold">
                Consent & Permissions
              </h1>
              <p className="text-gray-400 text-sm sm:text-base">
                Please confirm the following by selecting the appropriate
                responses:
              </p>
            </div>

            {/* Declaration Fields */}
            <FormField
              control={form.control}
              name="declarationCorrectUpload"
              render={({ field }) => (
                <FormItem className="mt-2 flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                  <FormLabel className="text-sm sm:text-base min-w-[300px]">
                    <div className="flex items-center gap-1">
                      Do you declare that all uploaded documents and information are correct and authentic?
                      <span className="text-red-500">*</span>
                      <HelperTooltip text="Please confirm that all information and documents you've provided are true and accurate." />
                    </div>
                  </FormLabel>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex items-center">
                      <Checkbox
                        checked={field.value === true}
                        onCheckedChange={() => field.onChange(true)}
                        id="declaration-correct-yes"
                      />
                      <FormLabel htmlFor="declaration-correct-yes" className="ml-2 font-normal">
                        Yes
                      </FormLabel>
                    </div>
                    <div className="flex items-center">
                      <Checkbox
                        checked={field.value === false}
                        onCheckedChange={() => field.onChange(false)}
                        id="declaration-correct-no"
                      />
                      <FormLabel htmlFor="declaration-correct-no" className="ml-2 font-normal">
                        No
                      </FormLabel>
                    </div>
                  </div>
                  <FormMessage className="sm:col-start-2 sm:mt-0 mt-1" />
                </FormItem>
              )}
            />

            {/* Referees Permission */}
            <FormField
              control={form.control}
              name="declarationContactReferee"
              render={({ field }) => (
                <FormItem className="mt-2 flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                  <FormLabel className="text-sm sm:text-base min-w-[300px]">
                    <div className="flex items-center gap-1">
                      Do you give permission for us to contact your referees on your behalf?
                      <span className="text-red-500">*</span>
                      <HelperTooltip text="We may contact your referees to verify your experience and suitability for the role." />
                    </div>
                  </FormLabel>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex items-center">
                      <Checkbox
                        checked={field.value === true}
                        onCheckedChange={() => field.onChange(true)}
                        id="referee-permission-yes"
                      />
                      <FormLabel htmlFor="referee-permission-yes" className="ml-2 font-normal">
                        Yes
                      </FormLabel>
                    </div>
                    <div className="flex items-center">
                      <Checkbox
                        checked={field.value === false}
                        onCheckedChange={() => field.onChange(false)}
                        id="referee-permission-no"
                      />
                      <FormLabel htmlFor="referee-permission-no" className="ml-2 font-normal">
                        No
                      </FormLabel>
                    </div>
                  </div>
                  <FormMessage className="sm:col-start-2 sm:mt-0 mt-1" />
                </FormItem>
              )}
            />

            {/* Criminal Conviction */}
            <FormField
              control={form.control}
              name="criminalConviction"
              render={({ field }) => (
                <FormItem className="mt-2 flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                  <FormLabel className="text-sm sm:text-base min-w-[300px]">
                    <div className="flex items-center gap-1">
                      Do you have any unspent criminal convictions?
                      <span className="text-red-500">*</span>
                      <HelperTooltip text="If yes, you may be asked to provide further information later." />
                    </div>
                  </FormLabel>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex items-center">
                      <Checkbox
                        checked={field.value === true}
                        onCheckedChange={() => field.onChange(true)}
                        id="conviction-yes"
                      />
                      <FormLabel htmlFor="conviction-yes" className="ml-2 font-normal">
                        Yes
                      </FormLabel>
                    </div>
                    <div className="flex items-center">
                      <Checkbox
                        checked={field.value === false}
                        onCheckedChange={() => field.onChange(false)}
                        id="conviction-no"
                      />
                      <FormLabel htmlFor="conviction-no" className="ml-2 font-normal">
                        No
                      </FormLabel>
                    </div>
                  </div>
                  <FormMessage className="sm:col-start-2 sm:mt-0 mt-1" />
                </FormItem>
              )}
            />

            {/* Conviction Details if Yes */}
            {watchConviction && (
              <FormField
                control={form.control}
                name="criminalConvictionDetails"
                render={({ field }) => (
                  <FormItem className="mt-2 flex flex-col">
                    <FormLabel>
                      <div className="flex items-center gap-1">
                        Please provide details of the conviction
                        <span className="text-red-500">*</span>
                        <HelperTooltip text="Describe the nature, date, and outcome of the conviction." />
                      </div>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter details here..."
                        className="border-gray-200 min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Applied Before */}
            <FormField
              control={form.control}
              name="appliedBefore"
              render={({ field }) => (
                <FormItem className="mt-2 flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                  <FormLabel className="text-sm sm:text-base min-w-[300px]">
                    <div className="flex items-center gap-1">
                      Have you previously applied for a role with this organisation?
                      <span className="text-red-500">*</span>
                      <HelperTooltip text="This helps us locate your previous application records, if any." />
                    </div>
                  </FormLabel>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex items-center">
                      <Checkbox
                        checked={field.value === true}
                        onCheckedChange={() => field.onChange(true)}
                        id="applied-before-yes"
                      />
                      <FormLabel htmlFor="applied-before-yes" className="ml-2 font-normal">
                        Yes
                      </FormLabel>
                    </div>
                    <div className="flex items-center">
                      <Checkbox
                        checked={field.value === false}
                        onCheckedChange={() => field.onChange(false)}
                        id="applied-before-no"
                      />
                      <FormLabel htmlFor="applied-before-no" className="ml-2 font-normal">
                        No
                      </FormLabel>
                    </div>
                  </div>
                  <FormMessage className="sm:col-start-2 sm:mt-0 mt-1" />
                </FormItem>
              )}
            />

            {/* Terms Section */}
            <div>
              <h1 className="mb-2 text-xl sm:text-2xl font-semibold">
                Terms and Conditions Agreement
              </h1>
              <div className="max-h-40 overflow-y-auto rounded-md text-xs sm:text-sm">
                <p className="mb-2">
                  I confirm that the information provided is true, complete,
                  and accurate. False information may lead to termination.
                </p>
                <p>
                  I acknowledge that my data may be used for compliance and
                  recruitment purposes in line with UK GDPR.
                </p>
              </div>
            </div>

            <p className="font-medium text-gray-800 text-sm sm:text-base">
              Please tick the boxes to confirm:
            </p>
            <div className="space-y-4">
              {/* Terms */}
              <FormField
                control={form.control}
                name="termsAccepted"
                render={({ field }) => (
                  <FormItem className="flex items-start space-x-3 rounded-lg border border-gray-300 p-3 sm:p-4 hover:shadow-md">
                    <FormControl>
                      <Checkbox
                        id="terms"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className='mt-2'
                      />
                    </FormControl>
                    <div className="flex flex-col gap-1">
                      <FormLabel htmlFor="terms" className="text-sm text-gray-700">
                        I accept the terms and conditions of this application process.
                      </FormLabel>
                      <FormMessage className="text-xs" />
                    </div>
                  </FormItem>
                )}
              />

              {/* Data Processing */}
              <FormField
                control={form.control}
                name="dataProcessingAccepted"
                render={({ field }) => (
                  <FormItem className="flex items-start space-x-3 rounded-lg border border-gray-300 p-3 sm:p-4 hover:shadow-md">
                    <FormControl>
                      <Checkbox
                        id="data-processing"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className='mt-2'

                      />
                    </FormControl>
                    <div className="flex flex-col gap-1">
                      <FormLabel htmlFor="data-processing" className="text-sm text-gray-700">
                        I consent to the processing of my personal data in line with UK GDPR and the Data Protection Act 2018.
                      </FormLabel>
                      <FormMessage className="text-xs" />
                    </div>
                  </FormItem>
                )}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                className="bg-watney text-white hover:bg-watney/90 w-full sm:w-auto"
              >
                Back
              </Button>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full sm:w-auto"
                    >
                      Preview Application
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-h-[80vh] w-full sm:min-w-[600px] lg:min-w-[800px] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Application Preview</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6">{sections}</div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setIsDialogOpen(false)}
                        className="bg-watney text-white hover:bg-watney/90"
                      >
                        Close
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <Button
                  type="submit"
                  disabled={!termsAccepted || !dataProcessingAccepted}
                  className="bg-watney text-white hover:bg-watney/90 w-full sm:w-auto"
                >
                  Submit
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </Form>

  );
}
