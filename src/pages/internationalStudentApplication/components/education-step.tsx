import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
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
import { CustomDatePicker } from '@/components/shared/CustomDatePicker';
import Select from 'react-select';
import { ImageUploader } from './document-uploader';
import { useSelector } from 'react-redux';

export function EducationStep({
  defaultValues,
  onSaveAndContinue,
  setCurrentStep,
  setCurrentSubStep
}) {
  const [currentPage, setCurrentPage] = useState(() => {
    if (defaultValues?.studentType === 'international') {
      return setCurrentSubStep === 2 ? 2 : 1;
    }
    return 2;
  });

  const [uploadState, setUploadState] = useState({
    isOpen: false,
    field: null
  });

  const { user } = useSelector((state) => state.auth);

  const educationEntrySchema = z.object({
    institution: z.string().min(1, { message: 'Institution name is required' }),
    grade: z.preprocess(
      (val) => {
        if (val === '' || val === null || val === undefined) return undefined;
        const coercedValue = Number(val);
        return isNaN(coercedValue) ? val : coercedValue;
      },
      z.union([
        z.string(),
        z
          .number()
          .min(1, { message: 'Grade must be at least 1' })
          .max(100, { message: 'Grade cannot exceed 100' })
      ])
    ),
    qualification: z
      .string()
      .min(1, { message: 'Qualification details are required' }),
    awardDate: z.date({ required_error: 'Date of award is required' }),
    certificate: z.any()
      .refine(
        (file) =>
          file instanceof File ||
          (typeof file === 'object' && file !== null && 'fileUrl' in file) ||
          typeof file === 'string',
        { message: 'Certificate is required' }
      )
  });

  const englishQualificationSchema = z.object({
    englishTestType: z.string().min(1, { message: 'Test type is required' }),
    englishTestScore: z.string().min(1, { message: 'Test score is required' }),
    englishTestDate: z.date({ required_error: 'Test date is required' }),
    englishCertificate: z
      .any()
      .refine(
        (file) =>
          file instanceof File ||
          (typeof file === 'object' && file !== null && 'fileUrl' in file) ||
          typeof file === 'string',
        { message: 'Certificate is required' }
      )
  });

  const englishQualificationField =
    defaultValues.studentType === 'international'
      ? englishQualificationSchema
      : englishQualificationSchema.optional();

  const createEducationSchema = (studentType) =>
    z.object({
      educationData: z
        .array(educationEntrySchema)
        .min(1, { message: 'At least one education entry is required' }),
      englishQualification: englishQualificationField
    });

  const educationSchema = createEducationSchema(defaultValues?.studentType);

  const transformDefaultValues = (values) => {
    if (!values) {
      return {
        educationData: [
          {
            institution: '',
            grade: '',
            qualification: '',
            awardDate: undefined,
            certificate: ''
          }
        ],
        englishQualification: {
          englishTestType: '',
          englishTestScore: '',
          englishTestDate: undefined,
          englishCertificate: ''
        }
      };
    }

    return {
      educationData: (values.educationData || []).map((entry) => ({
        institution: entry.institution || '',
        grade: entry.grade || '',
        qualification: entry.qualification || '',
        awardDate: entry.awardDate ? new Date(entry.awardDate) : undefined,
        certificate: entry.certificate || undefined
      })),
      englishQualification: {
        englishTestType: values.englishQualification?.englishTestType || '',
        englishTestScore: values.englishQualification?.englishTestScore || '',
        englishTestDate: values.englishQualification?.englishTestDate
          ? new Date(values.englishQualification?.englishTestDate)
          : undefined,
        englishCertificate:
          values.englishQualification?.englishCertificate || null
      }
    };
  };

  const form = useForm({
    resolver: zodResolver(educationSchema),
    defaultValues: transformDefaultValues(defaultValues)
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'educationData'
  });

  useEffect(() => {
    if (defaultValues) {
      form.reset(transformDefaultValues(defaultValues));
    }
  }, [defaultValues, form]);

  const onSubmit = async (data) => {
    // Transform englishCertificate from object to just the fileUrl string
    const transformedData = {
      ...data,
      englishQualification: data.englishQualification
        ? {
            ...data.englishQualification,
            englishCertificate: data.englishQualification.englishCertificate
              ?.fileUrl
              ? data.englishQualification.englishCertificate.fileUrl
              : data.englishQualification.englishCertificate
          }
        : undefined
    };

    await onSaveAndContinue(transformedData);
  };

  const addEducationEntry = () => {
    append({
      institution: '',
      grade: '',
      qualification: '',
      awardDate: undefined,
      certificate: null
    });
  };

  const handleUploadComplete = (uploadResponse) => {
    const { field } = uploadState;

    if (!field || !uploadResponse?.success || !uploadResponse.data?.fileUrl) {
      setUploadState({ isOpen: false, field: null });
      return;
    }

    const uploadedFileData = {
      fileUrl: uploadResponse.data.fileUrl,
      name: decodeURIComponent(
        uploadResponse.data.fileUrl.split('/').pop() || 'Uploaded File'
      )
    };

    if (field === 'englishCertificate') {
      form.setValue(
        'englishQualification.englishCertificate',
        uploadedFileData,
        {
          shouldValidate: true,
          shouldDirty: true
        }
      );
      form.trigger('englishQualification');
    } else if (field.startsWith('educationData.')) {
      form.setValue(field, uploadedFileData.fileUrl, {
        shouldValidate: true,
        shouldDirty: true
      });
    }

    setUploadState({ isOpen: false, field: null });
  };
  const handleNext = async () => {
    if (defaultValues?.studentType === 'international' && currentPage === 1) {
      // Validate only the englishQualification part for international students on page 1
      const isValid = await form.trigger('englishQualification');
      if (isValid) {
        setCurrentPage(2);
      }
      return;
    }

    // For other cases, validate the entire form and submit
    const isValid = await form.trigger();
    if (isValid) {
      form.handleSubmit(onSubmit)();
    }
  };

  const educationData = useWatch({
    control: form.control,
    name: 'educationData'
  });

  const englishTestTypeOptions = [
    { value: 'ielts', label: 'IELTS' },
    { value: 'toefl', label: 'TOEFL' },
    { value: 'pte', label: 'PTE Academic' },
    { value: 'other', label: 'Other' }
  ];

  function handleBack() {
    if (currentPage === 1) {
      setCurrentStep(3);
    } else {
      setCurrentPage(1);
    }
  }

  const renderEnglishQualificationStep = () => (
    <div className="space-y-8">
      <CardHeader>
        <CardTitle className="text-2xl">
          English Language Qualification
        </CardTitle>
        <CardDescription>
          Please provide your English language test results if you are an
          international student.
        </CardDescription>
      </CardHeader>
      <CardContent className="scroll mt-2 p-0 px-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <FormField
            control={form.control}
            name="englishQualification.englishTestType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  English Test Type <span className="text-red-500">*</span>
                </FormLabel>
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
                <p className="text-xs text-gray-400">Example: IELTS</p>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="englishQualification.englishTestScore"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Test Score <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value || ''}
                    placeholder="Enter your score"
                  />
                </FormControl>
                <p className="text-xs text-gray-400">
                  Example: 7.5 (IELTS), 90 (TOEFL), 65 (PTE)
                </p>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="englishQualification.englishTestDate"
            render={({ field }) => {
              const selectedDate = field.value ? new Date(field.value) : null;
              return (
                <FormItem>
                  <FormLabel>
                    Test Date <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <CustomDatePicker
                      selected={selectedDate}
                      onChange={(date) => field.onChange(date)}
                 
                    />
                  </FormControl>
                  <p className="text-xs text-gray-400">Example: 01/16/2022</p>
                  <FormMessage />
                </FormItem>
              );
            }}
          />

          <FormField
            control={form.control}
            name="englishQualification.englishCertificate"
            render={({ field }) => (
              <FormItem className="flex flex-col gap-2">
                <FormLabel>
                  Upload Certificate <span className="text-red-500">*</span>
                </FormLabel>
                <Button
                  type="button"
                  className="bg-watney text-white hover:bg-watney/90"
                  onClick={() =>
                    setUploadState({
                      isOpen: true,
                      field: 'englishCertificate'
                    })
                  }
                >
                  Upload
                </Button>

                {/* Show uploaded file name */}
                {field.value && (
                  <div className="mt-1">
                    {/* Display the name property if available, otherwise extract from URL */}
                    {/* <p className="text-sm">
                      {field.value.name ||
                        (typeof field.value === 'string'
                          ? field.value.split('/').pop()
                          : field.value.fileUrl?.split('/').pop())}
                    </p> */}
                    <a
                      href={
                        typeof field.value === 'string'
                          ? field.value
                          : field.value.fileUrl
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 underline"
                    >
                      View File
                    </a>
                  </div>
                )}

                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </div>
  );

  const renderAcademicQualificationsStep = () => (
    <div className="space-y-8">
      <CardHeader>
        <CardTitle className="text-2xl">Academic Qualification</CardTitle>
        <CardDescription>
          Please provide your highest level of academic qualification. This
          information is mandatory and will help us assess your educational
          background. You may add more than one qualification if applicable.
        </CardDescription>
      </CardHeader>
      <CardContent className="scroll mt-2 p-0 px-6">
        <div className="-mt-8">
          {fields.length === 0 ? (
            <Button
              type="button"
              variant="outline"
              onClick={addEducationEntry}
              className="mb-4 bg-watney text-white hover:bg-watney/90"
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
                <TableHead>
                  Qualifications <span className="text-red-500">*</span>
                </TableHead>
                <TableHead>
                  Grade <span className="text-red-500">*</span>
                </TableHead>
                <TableHead className="min-w-[300px]">
                  Name of the Institution{' '}
                  <span className="text-red-500">*</span>
                </TableHead>
                <TableHead>
                  Date of Award (MM/DD/YYYY){' '}
                  <span className="text-red-500">*</span>
                </TableHead>
                <TableHead>
                  Certificate <span className="text-red-500">*</span>
                </TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fields.map((field, index) => (
                <TableRow key={field.id}>
                  <TableCell className="align-top">
                    <FormField
                      control={form.control}
                      name={`educationData.${index}.qualification`}
                      render={({ field }) => (
                        <FormItem className="">
                          <FormControl>
                            <Input
                              {...field}
                              value={field.value || ''}
                              placeholder="Enter the name of the qualification"
                            />
                          </FormControl>
                       
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TableCell>
                  <TableCell className="align-top">
                    <FormField
                      control={form.control}
                      name={`educationData.${index}.grade`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Provide your grade"
                            />
                          </FormControl>
                          <p className="mt-1 text-xs text-gray-400">
                            Example: 3.91
                          </p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TableCell>
                  <TableCell className="align-top">
                    <FormField
                      control={form.control}
                      name={`educationData.${index}.institution`}
                      
                      render={({ field }) => (
                        <FormItem >
                          <FormControl>
                            <Input
                              {...field}
                              value={field.value || ''}
                              placeholder="Provide the full name of the university, college"
                            />
                          </FormControl>
                          <p className="text-xs text-gray-400">
                            Example: University of Manchester
                          </p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TableCell>
                  <TableCell className="align-top">
                    <FormField
                      control={form.control}
                      name={`educationData.${index}.awardDate`}
                      render={({ field }) => {
                        const selectedDate = field.value
                          ? new Date(field.value)
                          : null;
                        return (
                          <FormItem className="align-top">
                            <FormControl>
                              <CustomDatePicker
                                selected={selectedDate}
                                onChange={(date) => field.onChange(date)}
                              />
                            </FormControl>
                            <p className="text-xs text-gray-400">
                              Example: 01/16/2022
                            </p>
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />
                  </TableCell>
                  <TableCell className="align-top">
                    <FormField
                      control={form.control}
                      name={`educationData.${index}.certificate`}
                      render={({ field }) => (
                        <FormItem className=" flex flex-col">
                          <Button
                            type="button"
                            className="bg-watney text-white hover:bg-watney/90"
                            onClick={() =>
                              setUploadState({
                                isOpen: true,
                                field: field.name
                              })
                            }
                          >
                            Upload Certificate
                          </Button>
                          <p className="text-xs text-gray-500">
                            Accepted formats: PDF, JPG, PNG. Max size 5MB.
                          </p>

                          {field.value && (
                            <>
                              {/* <p className="mt-1 text-sm">
            {decodeURIComponent(field.value.split('/').pop() || 'Uploaded File')}
          </p> */}
                              <a
                                href={field.value}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-1 text-xs text-blue-600 underline"
                              >
                                View File
                              </a>
                            </>
                          )}

                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TableCell>
                  <TableCell >
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
      </CardContent>
    </div>
  );

  return (
    <Card className="border-none shadow-none">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {defaultValues?.studentType === 'international' && currentPage === 1
            ? renderEnglishQualificationStep()
            : renderAcademicQualificationsStep()}
          <div className="flex justify-between px-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              className="bg-watney text-white hover:bg-watney/90"
            >
              Back
            </Button>
            <Button
              type="button"
              onClick={handleNext}
              className="bg-watney text-white hover:bg-watney/90"
              disabled={
    form.formState.isSubmitting ||
    (currentPage !== 1 && educationData?.length === 0)
  }
            >
              Next
            </Button>
          </div>
        </form>
      </Form>
      <ImageUploader
        open={uploadState.isOpen}
        onOpenChange={(isOpen) =>
          setUploadState({ isOpen, field: uploadState.field })
        }
        onUploadComplete={handleUploadComplete}
        entityId={user?._id}
      />
    </Card>
  );
}
