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
import 'react-datepicker/dist/react-datepicker.css';
import { CustomDatePicker } from '@/components/shared/CustomDatePicker';
import Select from 'react-select';
import { useSelector } from 'react-redux';
import { ImageUploader } from './document-uploader';
import { HelperTooltip } from '@/helper/HelperTooltip';
import { Label } from '@/components/ui/label';

export function EducationStep({
  defaultValues,
  onSaveAndContinue,
  setCurrentStep,
  saveAndLogout
}) {
  const [currentPage, setCurrentPage] = useState(1);
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

  const createEducationSchema = () =>
    z.object({
      educationData: z
        .array(educationEntrySchema)
        .refine(
          (data) =>
            data.length === 0 ||
            data.every(
              (entry) =>
                entry.institution && entry.qualification && entry.awardDate
            ),
          {
            message:
              'All education fields must be filled if any entry is provided'
          }
        )
    });

  const educationSchema = createEducationSchema();

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
        ]
      };
    }
    return {
      educationData: (values.educationData || []).map((entry) => ({
        institution: entry.institution || '',
        grade: entry.grade || '',
        qualification: entry.qualification || '',
        awardDate: entry.awardDate ? new Date(entry.awardDate) : undefined,
        certificate: entry.certificate || undefined
      }))
    };
  };

  const form = useForm({
    resolver: zodResolver(educationSchema),
    defaultValues: transformDefaultValues(defaultValues),
    mode: 'onChange'
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

    if (field.startsWith('educationData.')) {
      form.setValue(field, uploadedFileData.fileUrl, {
        shouldValidate: true,
        shouldDirty: true
      });
    }

    setUploadState({ isOpen: false, field: null });
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
      setCurrentStep(5);
    } else {
      setCurrentPage(5);
    }
  }

  const renderAcademicQualificationsStep = () => (
    <div className="space-y-8">
      <CardHeader>
        <CardTitle className="text-2xl">Academic Qualification</CardTitle>
        <CardDescription className="text-lg">
          Please provide your highest level of academic qualification. This
          information is mandatory and will help us assess your educational
          background. You may add more than one qualification if applicable.
        </CardDescription>
      </CardHeader>

      <CardContent className="mt-2 p-0 px-6">
        <div className="-mt-8">
          <Button
            type="button"
            variant="outline"
            onClick={addEducationEntry}
            className="mb-4 bg-watney text-white hover:bg-watney/90 "
          >
            {fields.length === 0
              ? 'Add Qualification'
              : 'Add More Qualification'}
          </Button>
        </div>

        {fields.length > 0 && (
          <>
            {/* Desktop/Tablet View: Table */}
            <div className="hidden overflow-x-auto md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-lg">
                      <div className="flex flex-row items-center justify-between">
                        <div>
                          Qualifications <span className="text-red-500">*</span>
                        </div>
                        <HelperTooltip text="Enter the name of the qualification you have earned. Example: Bachelor of Science in Computer Science" />
                      </div>
                    </TableHead>
                    <TableHead className="text-lg">
                      <div className="flex flex-row items-center justify-between">
                        <div>
                          Grade <span className="text-red-500">*</span>
                        </div>
                        <HelperTooltip text="Enter your grade or GPA for this qualification. e.g., 3.91" />
                      </div>
                    </TableHead>
                    <TableHead className="min-w-[300px] text-lg">
                      <div className="flex flex-row items-center justify-between">
                        <div>
                          Name of the Institution{' '}
                          <span className="text-red-500">*</span>
                        </div>
                        <HelperTooltip text="Provide the full name of the institution where you earned this qualification. e.g., University of Manchester" />
                      </div>
                    </TableHead>
                    <TableHead className="text-lg">
                      <div className="flex flex-row items-center justify-between">
                        <div>
                          Date of Award (MM/DD/YYYY){' '}
                          <span className="text-red-500">*</span>
                        </div>
                        <HelperTooltip text="Select the date you were awarded this qualification. Format: MM/DD/YYYY. e.g., 01/16/2022" />
                      </div>
                    </TableHead>
                    <TableHead className="text-lg">
                      <div className="flex flex-row items-center justify-between">
                        <div>
                          Certificate <span className="text-red-500">*</span>
                        </div>
                        <HelperTooltip text="Upload your certificate for this qualification. Allowed formats: PDF, JPG, PNG (max size 5MB)." />
                      </div>
                    </TableHead>
                    <TableHead className="w-[80px] text-lg">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.map((field, index) => (
                    <TableRow key={field.id}>
                      <TableCell className="align-top">
                        <FormField
                          control={form.control}
                          name={`educationData.${index}.qualification`}
                          render={({ field: formField }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  {...formField}
                                  value={formField.value || ''}
                                  placeholder="Enter qualification"
                                  className=""
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
                          render={({ field: formField }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  {...formField}
                                  placeholder="Grade (e.g., 3.91)"
                                  className=""
                                />
                              </FormControl>

                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TableCell>
                      <TableCell className="min-w-[300px] align-top">
                        <FormField
                          control={form.control}
                          name={`educationData.${index}.institution`}
                          render={({ field: formField }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  {...formField}
                                  value={formField.value || ''}
                                  placeholder="Institution name"
                                  className=""
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
                          name={`educationData.${index}.awardDate`}
                          render={({ field: formField }) => {
                            const selectedDate = formField.value
                              ? new Date(formField.value)
                              : null;
                            return (
                              <FormItem>
                                <FormControl>
                                  <CustomDatePicker
                                    selected={selectedDate}
                                    onChange={(date) =>
                                      formField.onChange(date)
                                    }
                                    className=" w-full"
                                  />
                                </FormControl>

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
                          render={({ field: formField }) => (
                            <FormItem className="flex flex-col">
                              <Button
                                type="button"
                                className="bg-watney py-2 text-lg text-white hover:bg-watney/90 "
                                onClick={() =>
                                  setUploadState({
                                    isOpen: true,
                                    field: formField.name
                                  })
                                }
                              >
                                Upload Certificate
                              </Button>
                              {/* <p className="text-md mt-1 text-gray-500">
                                PDF, JPG, PNG (≤5MB)
                              </p> */}
                              {formField.value && (
                                <a
                                  href={formField.value}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-md mt-1 text-blue-600 underline"
                                >
                                  View File
                                </a>
                              )}
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => remove(index)}
                          className=" w-full  text-red-500 hover:bg-red-100 hover:text-red-700"
                        >
                          Remove
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile View: Stacked Cards */}
            <div className="space-y-6 md:hidden">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="space-y-4 rounded-lg border border-gray-300 bg-white p-4"
                >
                  {/* Qualification */}
                  <div>
                    <Label className="mb-2 block text-lg font-medium text-gray-700">
                      <div className="flex flex-row items-center justify-between">
                        <div>
                          Qualification <span className="text-red-500">*</span>
                        </div>
                        <HelperTooltip text="Enter the name of the qualification you have earned. Example: Bachelor of Science in Computer Science" />
                      </div>
                    </Label>
                    <FormField
                      control={form.control}
                      name={`educationData.${index}.qualification`}
                      render={({ field: formField }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              {...formField}
                              value={formField.value || ''}
                              placeholder="Enter qualification"
                              className=""
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Grade */}
                  <div>
                    <Label className="mb-2 block text-lg font-medium text-gray-700">
                      <div className="flex flex-row items-center justify-between">
                        <div>
                          Grade <span className="text-red-500">*</span>
                        </div>
                        <HelperTooltip text="Enter your grade or GPA for this qualification. e.g., 3.91" />
                      </div>
                    </Label>
                    <FormField
                      control={form.control}
                      name={`educationData.${index}.grade`}
                      render={({ field: formField }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              {...formField}
                              placeholder="e.g., 3.91"
                              className=""
                            />
                          </FormControl>
                          {/* <p className="text-md text-gray-400">Example: 3.91</p> */}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Institution */}
                  <div>
                    <Label className="mb-2 block text-lg font-medium text-gray-700">
                      <div className="flex flex-row items-center justify-between">
                        <div>
                          Institution <span className="text-red-500">*</span>
                        </div>
                        <HelperTooltip text="Provide the full name of the institution where you earned this qualification. e.g., University of Manchester" />
                      </div>
                    </Label>
                    <FormField
                      control={form.control}
                      name={`educationData.${index}.institution`}
                      render={({ field: formField }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              {...formField}
                              value={formField.value || ''}
                              placeholder="University name"
                              className=""
                            />
                          </FormControl>
                          {/* <p className="text-md text-gray-400">
                            Example: University of Manchester
                          </p> */}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Award Date */}
                  <div>
                    <Label className="mb-2 block text-lg font-medium text-gray-700">
                      <div className="flex flex-row items-center justify-between">
                        <div>
                          Date of Award <span className="text-red-500">*</span>
                        </div>
                        <HelperTooltip text="Select the date you were awarded this qualification. Format: MM/DD/YYYY. e.g., 01/16/2022" />
                      </div>
                    </Label>
                    <FormField
                      control={form.control}
                      name={`educationData.${index}.awardDate`}
                      render={({ field: formField }) => {
                        const selectedDate = formField.value
                          ? new Date(formField.value)
                          : null;
                        return (
                          <FormItem>
                            <FormControl>
                              <CustomDatePicker
                                selected={selectedDate}
                                onChange={(date) => formField.onChange(date)}
                                className="h-12  w-full text-lg"
                              />
                            </FormControl>
                            {/* <p className="text-md text-gray-400">
                              Example: 01/16/2022
                            </p> */}
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />
                  </div>

                  {/* Certificate Upload */}
                  <div>
                    <Label className="mb-2 block text-lg font-medium text-gray-700">
                      <div className="flex flex-row items-center justify-between">
                        <div>
                          Certificate <span className="text-red-500">*</span>
                        </div>
                        <HelperTooltip text="Upload your certificate for this qualification. Allowed formats: PDF, JPG, PNG (max size 5MB)." />
                      </div>
                    </Label>
                    <FormField
                      control={form.control}
                      name={`educationData.${index}.certificate`}
                      render={({ field: formField }) => (
                        <FormItem className="flex flex-col">
                          <Button
                            type="button"
                            className="bg-watney py-2 text-lg text-white hover:bg-watney/90 "
                            onClick={() =>
                              setUploadState({
                                isOpen: true,
                                field: formField.name
                              })
                            }
                          >
                            Upload Certificate
                          </Button>
                          {/* <p className="text-md text-gray-500 mt-1">
                            PDF, JPG, PNG (≤5MB)
                          </p> */}
                          {formField.value && (
                            <a
                              href={formField.value}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-md mt-1 text-blue-600 underline"
                            >
                              View File
                            </a>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Remove Button */}
                  <div className="pt-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(index)}
                      className="w-full text-lg text-red-500 hover:bg-red-100 hover:text-red-700"
                    >
                      Remove Qualification
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </div>
  );

  return (
    <Card className="border-none shadow-none">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {renderAcademicQualificationsStep()}
         <div className="flex flex-col sm:flex-row sm:justify-between gap-3 p-6">
  <Button
    type="button"
    variant="outline"
    onClick={handleBack}
    className="bg-watney text-lg text-white hover:bg-watney/90 w-full sm:w-auto"
  >
    Back
  </Button>

  <Button
    onClick={() => saveAndLogout()}
    className="bg-watney text-white hover:bg-watney/90 w-full sm:w-auto"
  >
    Save And Exit
  </Button>

  <Button
    type="submit"
    className="bg-watney text-lg text-white hover:bg-watney/90 w-full sm:w-auto"
  >
    Save And Next
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
