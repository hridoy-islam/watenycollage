import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray, useWatch, Controller } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
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

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import moment from 'moment';
import { FileUpload } from './file-upload';
import 'react-datepicker/dist/react-datepicker.css';
import { CustomDatePicker } from '@/components/shared/CustomDatePicker';
import 'react-datepicker/dist/react-datepicker.css';
import Select from 'react-select';

const educationEntrySchema = z.object({
  institution: z.string().min(1, { message: 'Institution name is required' }),
  studyType: z.string().min(1, { message: 'Please select study type' }),
  qualification: z
    .string()
    .min(1, { message: 'Qualification details are required' }),
  awardDate: z.date({ required_error: 'Date of award is required' }).nullable(),
  certificate: z.any().optional(),
  transcript: z.any().optional()
});

const englishQualificationSchema = z.object({
  englishTestType: z.string().optional(),
  englishTestScore: z.string().optional(),
  englishTestDate: z.date().nullable().optional(),
  englishCertificate: z.any().optional()
});

const createEducationSchema = (studentType) =>
  z.object({
    educationData: z
      .array(educationEntrySchema)
      .min(1, { message: 'At least one education entry is required' }),
    ...(studentType === 'international' && {
      englishQualification: englishQualificationSchema.optional()
    })
  });

export function EducationStep({
  defaultValues,
  value,
  studentType,
  onBack,
  onNext
}) {
  const educationSchema = createEducationSchema(studentType);

  // Transform default values to ensure proper format
  const transformDefaultValues = (values) => {
    if (!values) {
      return {
        educationData: [
          {
            institution: '',
            studyType: '',
            qualification: '',
            awardDate: null,
            certificate: null,
            transcript: null
          }
        ],
        ...(studentType === 'international'
          ? {
              englishQualification: {
                englishTestType: '',
                englishTestScore: '',
                englishTestDate: null,
                englishCertificate: null
              }
            }
          : {})
      };
    }

    // Handle nested structure if present
    if (values?.educationData) {
      values = {
        educationData: values.educationData.educationData,
        englishQualification: values.educationData.englishQualification
      };
    }

    return {
      educationData: (values.educationData || []).map((entry) => ({
        institution: entry.institution || '',
        studyType: entry.studyType || '',
        qualification: entry.qualification || '',
        awardDate: entry.awardDate ? new Date(entry.awardDate) : null,
        certificate: entry.certificate || null,
        transcript: entry.transcript || null
      })),
      ...(studentType === 'international' && {
        englishQualification: {
          englishTestType: values.englishQualification?.englishTestType || '',
          englishTestScore: values.englishQualification?.englishTestScore || '',
          englishTestDate: values.englishQualification?.englishTestDate
            ? new Date(values.englishQualification.englishTestDate)
            : null,
          englishCertificate:
            values.englishQualification?.englishCertificate || null
        }
      })
    };
  };

  const form = useForm({
    resolver: zodResolver(educationSchema),
    defaultValues: {
      educationData: (value?.educationData || []).map((entry) => ({
        institution: entry.institution || '',
        studyType: entry.studyType || '',
        qualification: entry.qualification || '',
        awardDate: entry.awardDate ? new Date(entry.awardDate) : null,
        certificate: entry.certificate || null,
        transcript: entry.transcript || null
      })),
      ...(studentType === 'international' && {
        englishQualification: {
          englishTestType: value?.englishQualification?.englishTestType || '',
          englishTestScore: value?.englishQualification?.englishTestScore || '',
          englishTestDate: value?.englishQualification?.englishTestDate
            ? new Date(value.englishQualification.englishTestDate)
            : null,
          englishCertificate:
            value?.englishQualification?.englishCertificate || null
        }
      })
    }
  });
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'educationData'
  });

  // Reset form when defaultValues change
  useEffect(() => {
    if (defaultValues) {
      form.reset(transformDefaultValues(defaultValues));
    }
  }, [defaultValues, form]);

  const onSubmit = async (data) => {
    try {
      // Format dates before submission
      const formattedData = {
        educationData: data.educationData.map((edu) => ({
          ...edu,
          awardDate: edu.awardDate ? new Date(edu.awardDate) : null
        })),
        ...(data.englishQualification
          ? {
              englishQualification: {
                ...data.englishQualification,
                englishTestDate: data.englishQualification.englishTestDate
                  ? new Date(data.englishQualification.englishTestDate)
                  : null
              }
            }
          : {})
      };

      // Update form with the new data
      form.reset(formattedData);

      // Call the next handler
      onNext(formattedData);
    } catch (error) {
      console.error('Submission error:', error);
    }
  };

  const addEducationEntry = () => {
    append({
      institution: '',
      studyType: '',
      qualification: '',
      awardDate: null,
      certificate: null,
      transcript: null
    });
  };

  const handleEnglishCertificateUpload = (files) => {
    if (studentType === 'international') {
      form.setValue(
        'englishQualification.englishCertificate',
        files[0] || null,
        {
          shouldValidate: true,
          shouldDirty: true
        }
      );
    }
  };

  const educationData = useWatch({
    control: form.control,
    name: 'educationData'
  });

  const studyTypeOptions = [
    { value: 'full-time', label: 'Full-time' },
    { value: 'part-time', label: 'Part-time' },
    { value: 'distance', label: 'Distance' }
  ];

  const englishTestTypeOptions = [
    { value: 'ielts', label: 'IELTS' },
    { value: 'toefl', label: 'TOEFL' },
    { value: 'pte', label: 'PTE Academic' },
    { value: 'other', label: 'Other' }
  ];

  return (
    <Card className="border-none py-5 shadow-none ">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <CardHeader>
            <CardTitle>Academic Qualification</CardTitle>
            <CardDescription>
              Please provide your highest level of academic qualification. This
              information is mandatory and will help us assess your educational
              background. You may add more than one qualification if applicable.
            </CardDescription>
          </CardHeader>
          <CardContent className="scroll mt-2 p-0 px-6">
            <div className=" -mt-8">
              {fields.length === 0 ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={addEducationEntry}
                  className="mb-4  bg-watney text-white hover:bg-watney/90"
                >
                  Add Qualification
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={addEducationEntry}
                  className="mb-4 bg-watney text-white hover:bg-watney/90"
                >
                  Add More Qualification
                </Button>
              )}
            </div>

            {fields.length > 0 && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Qualifications*</TableHead>
                    <TableHead>Full/Part-Time*</TableHead>
                    <TableHead className="min-w-[300px]">
                      Name of the Institution*
                    </TableHead>
                    <TableHead>Date of Award</TableHead>
                    <TableHead className="w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.map((field, index) => (
                    <TableRow key={field.id}>
                      <TableCell>
                        <FormField
                          control={form.control}
                          name={`educationData.${index}.qualification`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  {...field}
                                  value={field.value || ''}
                                  className="!placeholder:text-gray-400   placeholder:text-xs  placeholder:text-gray-400"
                                  placeholder="Enter the name of the qualification"
                                />
                              </FormControl>
                              <p className="text-xs  text-gray-400">
                                Example: Master of Business Administration (MBA)
                              </p>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TableCell>
                      <TableCell>
                        <FormItem className="z-[1000]">
                          <Controller
                            control={form.control}
                            name={`educationData.${index}.studyType`}
                            render={({ field }) => (
                              <Select
                                options={studyTypeOptions}
                                placeholder="Specify if it was full-time or part-time study."
                                isClearable
                                value={
                                  studyTypeOptions.find(
                                    (option) => option.value === field.value
                                  ) || null
                                }
                                onChange={(option) =>
                                  field.onChange(option ? option.value : '')
                                }
                                className="z-[1000] text-sm"
                                styles={{
                                  menuPortal: (base) => ({
                                    ...base,
                                    zIndex: 9999
                                  }),
                                  control: (base) => ({
                                    ...base,
                                    minHeight: 30,
                                    fontSize: '14px'
                                  })
                                }}
                                menuPortalTarget={document.body}
                              />
                            )}
                          />

                          <p className="text-xs text-gray-400">
                            Options: Full-Time / Part-Time / Distance
                          </p>

                          <FormMessage />
                        </FormItem>
                      </TableCell>
                      <TableCell>
                        <FormField
                          control={form.control}
                          name={`educationData.${index}.institution`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  {...field}
                                  value={field.value || ''}
                                  className="!placeholder:text-gray-400   placeholder:text-xs  placeholder:text-gray-400"
                                  placeholder="Provide the full name of the university, college"
                                />
                              </FormControl>
                              <p className="text-xs  text-gray-400">
                                Example: University of Manchester
                              </p>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TableCell>
                      <TableCell>
                        <FormField
                          control={form.control}
                          name={`educationData.${index}.awardDate`}
                          render={({ field }) => {
                            const selectedDate = field.value
                              ? new Date(field.value)
                              : null;

                            return (
                              <FormItem>
                                <FormControl>
                                  <CustomDatePicker
                                    selected={selectedDate}
                                    onChange={(date) => field.onChange(date)}
                                  />
                                </FormControl>
                                <p className="text-xs  text-gray-400">
                                  Example: 01/16/2022{' '}
                                </p>
                                <FormMessage />
                              </FormItem>
                            );
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => remove(index)}
                          className="text-red-500 hover:bg-red-500 hover:text-white"
                        >
                          Remove
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {studentType === 'international' && (
              <div className="mt-8 space-y-4">
                <h3 className="text-xl font-semibold">
                  English Language Qualification
                </h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <FormItem>
                    <FormLabel>English Test Type</FormLabel>

                    <Controller
                      control={form.control}
                      name="englishQualification.englishTestType"
                      render={({ field }) => (
                        <Select
                          options={englishTestTypeOptions}
                          placeholder="Select test type"
                          isClearable
                          value={
                            englishTestTypeOptions.find(
                              (option) => option.value === field.value
                            ) || null
                          }
                          onChange={(option) =>
                            field.onChange(option ? option.value : '')
                          }
                          className="text-sm"
                          styles={{
                            menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                            control: (base) => ({
                              ...base,
                              minHeight: 30,
                              fontSize: '14px'
                            })
                          }}
                          menuPortalTarget={document.body}
                        />
                      )}
                    />

                    <FormMessage />
                  </FormItem>
                  <FormField
                    control={form.control}
                    name="englishQualification.englishTestScore"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Test Score</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            value={field.value || ''}
                            placeholder="Enter your score"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="englishQualification.englishTestDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Test Date</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            value={
                              field.value
                                ? moment(field.value).format('YYYY-MM-DD')
                                : ''
                            }
                            onChange={(e) => {
                              const newValue = e.target.value
                                ? new Date(e.target.value)
                                : null;
                              field.onChange(newValue);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormItem>
                    <FormLabel>Upload Certificate</FormLabel>
                    <FileUpload
                      id="english-certificate"
                      onFilesSelected={handleEnglishCertificateUpload}
                      accept=".pdf,.jpg,.jpeg,.png"
                      buttonVariant="outline"
                      defaultFiles={
                        form.watch('englishQualification.englishCertificate')
                          ? [
                              form.watch(
                                'englishQualification.englishCertificate'
                              )
                            ]
                          : []
                      }
                    />
                    {form.watch('englishQualification.englishCertificate')
                      ?.name && (
                      <p className="mt-1 text-sm">
                        {
                          form.watch('englishQualification.englishCertificate')
                            .name
                        }
                      </p>
                    )}
                  </FormItem>
                </div>
              </div>
            )}
          </CardContent>

          <div className="flex justify-between px-6">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              className="bg-watney text-white hover:bg-watney/90"
            >
              Back
            </Button>
            <Button
              type="submit"
              disabled={educationData?.length === 0}
              className="bg-watney text-white hover:bg-watney/90"
            >
              Next
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  );
}
