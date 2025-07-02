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
        {showTitle && <h3 className="mb-2 text-lg font-semibold">{title}</h3>}
        <div className="rounded-md border border-gray-200 p-4">
          <table className="min-w-full divide-y divide-gray-200">
            <tbody className="divide-y divide-gray-200">
              {rows.map(([label, value], index) => (
                <tr key={index}>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                    {label}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
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
            <div>
              <h1 className="text-2xl font-semibold">Consent & Permissions</h1>
              <p className="text-gray-400 ">
                Please confirm the following by selecting the appropriate
                responses:
              </p>
              {/* Declaration Fields */}
            </div>
            <FormField
              control={form.control}
              name="declarationCorrectUpload"
              render={({ field }) => (
                <FormItem className="flex items-center gap-4">
                  <FormLabel className="mr-2">
                    Do you declare that all uploaded documents and information
                    are correct and authentic?{' '}
                    <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="flex items-center">
                      <Checkbox
                        checked={field.value === true}
                        onCheckedChange={() => field.onChange(true)}
                      />
                      <FormLabel className="ml-2">Yes</FormLabel>
                    </div>
                  </FormControl>
                  <FormControl>
                    <div className="flex items-center">
                      <Checkbox
                        checked={field.value === false}
                        onCheckedChange={() => field.onChange(false)}
                      />
                      <FormLabel className="ml-2">No</FormLabel>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="declarationContactReferee"
              render={({ field }) => (
                <FormItem className="flex items-center gap-4">
                  <FormLabel className="mr-2">
                    Do you give permission for us to contact your referees on
                    your behalf? <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="flex items-center">
                      <Checkbox
                        checked={field.value === true}
                        onCheckedChange={() => field.onChange(true)}
                      />
                      <FormLabel className="ml-2">Yes</FormLabel>
                    </div>
                  </FormControl>
                  <FormControl>
                    <div className="flex items-center">
                      <Checkbox
                        checked={field.value === false}
                        onCheckedChange={() => field.onChange(false)}
                      />
                      <FormLabel className="ml-2">No</FormLabel>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="criminalConviction"
              render={({ field }) => (
                <FormItem className="py-2">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                    <FormLabel className="mr-2">
                      Do you have any unspent criminal convictions? (as defined
                      under the Rehabilitation of Offenders Act 1974){' '}
                      <span className="text-red-500">*</span>
                    </FormLabel>

                    <FormControl>
                      <div className="flex items-center">
                        <Checkbox
                          checked={field.value === true}
                          onCheckedChange={() => field.onChange(true)}
                        />
                        <FormLabel className="ml-2">Yes</FormLabel>
                      </div>
                    </FormControl>

                    <FormControl>
                      <div className="flex items-center">
                        <Checkbox
                          checked={field.value === false}
                          onCheckedChange={() => field.onChange(false)}
                        />
                        <FormLabel className="ml-2">No</FormLabel>
                      </div>
                    </FormControl>
                  </div>

                  <p className="mt-2 text-xs text-gray-400">
                    If yes, you may be asked to provide further information
                    later in the process.
                  </p>

                  <FormMessage />
                </FormItem>
              )}
            />

            {watchConviction && (
              <FormField
                control={form.control}
                name="criminalConvictionDetails"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>
                      Please provide details of the conviction{' '}
                      <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter details here..."
                        className="border-gray-200"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="appliedBefore"
              render={({ field }) => (
                <FormItem className="flex items-center gap-4">
                  <FormLabel className="mr-2">
                    Have you previously applied for a role with this
                    organisation? <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="flex items-center">
                      <Checkbox
                        checked={field.value === true}
                        onCheckedChange={() => field.onChange(true)}
                      />
                      <FormLabel className="ml-2">Yes</FormLabel>
                    </div>
                  </FormControl>
                  <FormControl>
                    <div className="flex items-center">
                      <Checkbox
                        checked={field.value === false}
                        onCheckedChange={() => field.onChange(false)}
                      />
                      <FormLabel className="ml-2">No</FormLabel>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <h1 className="mb-2 text-2xl font-semibold">
                {' '}
                Terms and Conditions Agreement
              </h1>
              <div className="space-y-4">
                {/* <h3 className="text-2xl font-semibold">Applicant Declaration</h3> */}
                <div className="max-h-40 overflow-y-auto rounded-md  text-sm">
                  <p className="mb-2">
                    I confirm that the information provided throughout this
                    application is true, complete, and accurate to the best of
                    my knowledge. I understand that withholding material
                    information or providing false or misleading statements may
                    lead to the withdrawal of any job offer or termination of
                    employment, without liability to the organisation.
                  </p>
                  <p className="">
                    I acknowledge that the information and documents submitted
                    may be used for recruitment, employment checks, and
                    compliance purposes, and may be shared with relevant
                    internal departments in line with the company's privacy
                    policy and UK GDPR requirements.
                  </p>
                </div>
              </div>
            </div>
            <p className="font-medium text-gray-800">
              Please tick the boxes to confirm:
            </p>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="termsAccepted"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-3 rounded-lg border border-gray-300 p-4 transition-all duration-200 ease-in-out hover:shadow-md">
                    <FormControl>
                      <Checkbox
                        id="terms"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel
                      htmlFor="terms"
                      className="text-sm font-medium text-gray-700"
                    >
                      I accept the terms and conditions of this application
                      process.
                    </FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dataProcessingAccepted"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-3 rounded-lg border border-gray-300 p-4 transition-all duration-200 ease-in-out hover:shadow-md">
                    <FormControl>
                      <Checkbox
                        id="data-processing"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel
                      htmlFor="data-processing"
                      className="text-sm font-medium text-gray-700"
                    >
                      I consent to the processing of my personal data in
                      accordance with the UK General Data Protection Regulation
                      (UK GDPR) and the Data Protection Act 2018.
                    </FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                className="bg-watney text-white hover:bg-watney/90"
              >
                Back
              </Button>
              <div className="flex space-x-2">
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button type="button" variant="outline">
                      Preview Application
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-h-[80vh] min-w-[800px] overflow-y-auto">
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
                  className="bg-watney text-white hover:bg-watney/90"
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
