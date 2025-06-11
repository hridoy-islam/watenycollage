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

  // Track upload context (which field initiated the upload)
  const [uploadState, setUploadState] = useState({
    isOpen: false,
    field: null // e.g., "englishCertificate" or "educationData.0.certificate"
  });

  const { user } = useSelector((state: any) => state.auth);

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
    certificate: z.any().optional()
  });

  const englishQualificationSchema = z.object({
    englishTestType: z.string().min(1, {
      message: 'Test type is required'
    }),
    englishTestScore: z.string().min(1, {
      message: 'Test score is required'
    }),
    englishTestDate: z.date({
      required_error: 'Test date is required'
    }),
    englishCertificate: z
      .any()
      .refine((file) => file instanceof File || typeof file === 'string', {
        message: 'Certificate is required'
      })
  });

  const englishQualificationField =
    defaultValues.studentType === 'international'
      ? englishQualificationSchema // required
      : englishQualificationSchema.optional(); // optional


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
            certificate: undefined
          }
        ],

        englishQualification: {
          englishTestType: '',
          englishTestScore: '',
          englishTestDate: undefined,
          englishCertificate: null
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
    await onSaveAndContinue(data);
  };

  const englishQualificationErrors = useWatch({
    control: form.control,
    name: 'englishQualification'
  });

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
        uploadResponse.data?.fileUrl?.split('/').pop() || 'Uploaded File'
      )
    };

    if (field === 'englishCertificate') {
      form.setValue(
        'englishQualification.englishCertificate',
        uploadedFileData.fileUrl,
        {
          shouldValidate: true,
          shouldDirty: true
        }
      );
    } else if (field.startsWith('educationData.')) {
      form.setValue(field, uploadedFileData.fileUrl, {
        shouldValidate: true,
        shouldDirty: true
      });
    }

    setUploadState({ isOpen: false, field: null });
  };


  async function handleNext() {
    if (defaultValues?.studentType === 'international' && currentPage === 1) {
      const isValid = await form.trigger('englishQualification');
      if (isValid) {
        setCurrentPage(2);
      }
      return;
    }

    form.handleSubmit(onSubmit)();
  }


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
          <FormItem>
            <FormLabel>
              English Test Type <span className="text-red-500">*</span>
            </FormLabel>
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
            <p className="text-xs text-gray-400">Example: IELTS</p>
            <FormMessage />
          </FormItem>
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
          <FormItem className="flex flex-col gap-2">
            <FormLabel>
              Upload Certificate <span className="text-red-500">*</span>
            </FormLabel>
            <Button
              type="button"
              className="bg-watney text-white hover:bg-watney/90"
              onClick={() =>
                setUploadState({ isOpen: true, field: 'englishCertificate' })
              }
            >
              Upload
            </Button>

            {form.watch('englishQualification.englishCertificate') && (
              <p className="mt-1 text-sm">
                {decodeURIComponent(
                  form
                    .watch('englishQualification.englishCertificate')
                    .split('/')
                    .pop() || 'Uploaded File'
                )}
              </p>
            )}

            {form.watch('englishQualification.englishCertificate') && (
              <a
                href={form.watch('englishQualification.englishCertificate')}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 text-xs text-blue-600 underline"
              >
                View File
              </a>
            )}
          </FormItem>
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
                  Name of the Institution
                  <span className="text-red-500">*</span>
                </TableHead>
                <TableHead>
                  Date of Award (MM/DD/YYYY)
                  <span className="text-red-500">*</span>
                </TableHead>
                <TableHead>
                  Certificate
                  <span className="text-red-500">*</span>
                </TableHead>
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
                        <FormItem className="mt-4">
                          <FormControl>
                            <Input
                              {...field}
                              value={field.value || ''}
                              className="!placeholder:text-gray-400 placeholder:text-xs placeholder:text-gray-400"
                              placeholder="Enter the name of the qualification"
                            />
                          </FormControl>
                          <p className="text-xs text-gray-400">
                            Example: Master of Business Administration (MBA)
                          </p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TableCell>
                  <TableCell>
                    <FormField
                      control={form.control}
                      name={`educationData.${index}.grade`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Provide your grade"
                              className="text-sm"
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
                              className="!placeholder:text-gray-400 placeholder:text-xs placeholder:text-gray-400"
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
                  <TableCell>
                    <FormField
                      control={form.control}
                      name={`educationData.${index}.awardDate`}
                      render={({ field }) => {
                        const selectedDate = field.value
                          ? new Date(field.value)
                          : undefined;
                        return (
                          <FormItem>
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
                  <TableCell>
                    <FormItem className="mt-4 flex flex-col">
                      <Button
                        type="button"
                        className="bg-watney text-white hover:bg-watney/90"
                        onClick={() =>
                          setUploadState({
                            isOpen: true,
                            field: `educationData.${index}.certificate`
                          })
                        }
                      >
                        Upload Certificate
                      </Button>
                      <p className=" text-xs text-gray-500">
                        Accepted formats: PDF, JPG, PNG. Max size 5MB.
                      </p>

                      {form.watch(`educationData.${index}.certificate`) && (
                        <p className="mt-1 text-sm">
                          {decodeURIComponent(
                            form
                              .watch(`educationData.${index}.certificate`)
                              .split('/')
                              .pop() || 'Uploaded File'
                          )}
                        </p>
                      )}

                      {form.watch(`educationData.${index}.certificate`) && (
                        <a
                          href={form.watch(
                            `educationData.${index}.certificate`
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 text-xs text-blue-600 underline"
                        >
                          View File
                        </a>
                      )}
                    </FormItem>
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
              disabled={
                (defaultValues?.studentType === 'international' &&
                  currentPage === 1 &&
                  !form.formState.isValid) ||
                (defaultValues?.studentType === 'international' &&
                  currentPage === 2 &&
                  educationData?.length === 0)
              }
              className="bg-watney text-white hover:bg-watney/90"
            >
              {defaultValues?.studentType === 'international' &&
              currentPage === 1
                ? 'Next'
                : 'Next'}
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
