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
import { Label } from '@/components/ui/label';
import { HelperTooltip } from '@/helper/HelperTooltip';

export function EducationStep({
  defaultValues,
  onSaveAndContinue,
  setCurrentStep,
  setCurrentSubStep
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
      setCurrentStep(3);
    } else {
      setCurrentPage(1);
    }
  }

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

      <CardContent className="mt-2 p-0 px-6">
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
          <>
            {/* Desktop/Tablet View: Table */}
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <div className="flex items-center gap-1">
                        Qualifications <span className="text-red-500">*</span>
                        <HelperTooltip text={`Enter the name of your degree or qualification.\nExample: BSc in Computer Science`} />
                      </div>
                    </TableHead>

                    <TableHead>
                      <div className="flex items-center gap-1">
                        Grade <span className="text-red-500">*</span>
                        <HelperTooltip text={`Enter your final grade or class.\nExample: 3.91 GPA or First Class`} />
                      </div>
                    </TableHead>

                    <TableHead className="min-w-[300px]">
                      <div className="flex items-center gap-1">
                        Name of the Institution <span className="text-red-500">*</span>
                        <HelperTooltip text={`Enter the full official name of your educational institution.\nExample: University of Manchester`} />
                      </div>
                    </TableHead>

                    <TableHead>
                      <div className="flex items-center gap-1">
                        Date of Award (MM/DD/YYYY) <span className="text-red-500">*</span>
                        <HelperTooltip text={`Enter the exact date your degree or certificate was awarded.\nExample: 01/16/2022`} />
                      </div>
                    </TableHead>

                    <TableHead>
                      <div className="flex items-center gap-1">
                        Certificate <span className="text-red-500">*</span>
                        <HelperTooltip text={`Upload a scanned copy of your official certificate in PDF, JPG, or PNG format.\nMaximum file size: 5MB`} />
                      </div>
                    </TableHead>

                    <TableHead className="w-[80px]">
                      <div>Actions</div>
                    </TableHead>
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
                      <TableCell className="align-top min-w-[300px]">
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
                          render={({ field: formField }) => (
                            <FormItem className="flex flex-col">
                              <Button
                                type="button"
                                className="bg-watney text-white hover:bg-watney/90 text-xs py-1"
                                onClick={() =>
                                  setUploadState({
                                    isOpen: true,
                                    field: formField.name
                                  })
                                }
                              >
                                Upload Certificate
                              </Button>
                              <p className="text-xs text-gray-500 mt-1">
                                PDF, JPG, PNG (≤5MB)
                              </p>
                              {formField.value && (
                                <a
                                  href={formField.value}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="mt-1 text-xs text-blue-600 underline"
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
            </div>

            {/* Mobile View: Stacked Cards */}
            <div className="md:hidden space-y-6">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="rounded-lg border border-gray-300 p-2 bg-white space-y-4"
                >
                  {/* Qualification */}
                  <FormField
                    control={form.control}
                    name={`educationData.${index}.qualification`}
                    render={({ field: formField }) => (
                      <FormItem className="mt-2 flex flex-col">
                        <FormLabel>
                          <div className="flex items-center gap-1">
                            Qualification <span className="text-red-500">*</span>
                            <HelperTooltip text={`Enter the name of your degree or qualification.\nExample: BSc in Computer Science`} />
                          </div>
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...formField}
                            value={formField.value || ''}
                            placeholder="Enter qualification"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Grade */}
                  <FormField
                    control={form.control}
                    name={`educationData.${index}.grade`}
                    render={({ field: formField }) => (
                      <FormItem className="mt-2 flex flex-col">
                        <FormLabel>
                          <div className="flex items-center gap-1">
                            Grade <span className="text-red-500">*</span>
                            <HelperTooltip text={`Enter your final grade or class.\nExample: 3.91 GPA or First Class`} />
                          </div>
                        </FormLabel>
                        <FormControl>
                          <Input {...formField} placeholder="e.g., 3.91" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Institution */}
                  <FormField
                    control={form.control}
                    name={`educationData.${index}.institution`}
                    render={({ field: formField }) => (
                      <FormItem className="mt-2 flex flex-col">
                        <FormLabel>
                          <div className="flex items-center gap-1">
                            Institution <span className="text-red-500">*</span>
                            <HelperTooltip text={`Enter the full official name of your educational institution.\nExample: University of Manchester`} />
                          </div>
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...formField}
                            value={formField.value || ''}
                            placeholder="University name"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Award Date */}
                  <FormField
                    control={form.control}
                    name={`educationData.${index}.awardDate`}
                    render={({ field: formField }) => {
                      const selectedDate = formField.value ? new Date(formField.value) : null;
                      return (
                        <FormItem className="mt-2 flex flex-col">
                          <FormLabel>
                            <div className="flex items-center gap-1">
                              Date of Award <span className="text-red-500">*</span>
                              <HelperTooltip text={`Enter the exact date your degree or certificate was awarded.\nExample: 01/16/2022`} />
                            </div>
                          </FormLabel>
                          <FormControl>
                            <CustomDatePicker
                              selected={selectedDate}
                              onChange={(date) => formField.onChange(date)}
                              className="w-full"
                              placeholder="MM/DD/YYYY"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />

                  {/* Certificate Upload */}
                  <FormField
                    control={form.control}
                    name={`educationData.${index}.certificate`}
                    render={({ field: formField }) => (
                      <FormItem className="mt-2 flex flex-col">
                        <FormLabel>
                          <div className="flex items-center gap-1">
                            Certificate <span className="text-red-500">*</span>
                            <HelperTooltip text={`Upload a scanned copy of your official certificate in PDF, JPG, or PNG format.\nMaximum file size: 5MB`} />
                          </div>
                        </FormLabel>
                        <Button
                          type="button"
                          className="bg-watney text-white hover:bg-watney/90 text-xs py-1 w-fit"
                          onClick={() =>
                            setUploadState({
                              isOpen: true,
                              field: formField.name,
                            })
                          }
                        >
                          Upload Certificate
                        </Button>
                        {formField.value && (
                          <a
                            href={formField.value}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-1 text-xs text-blue-600 underline"
                          >
                            View File
                          </a>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Remove Button */}
                  <div className="pt-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(index)}
                      className="text-red-500 hover:bg-red-50 hover:text-red-700 text-sm w-full"
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
          <div className="flex justify-between p-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              className="bg-watney text-white hover:bg-watney/90"
            >
              Back
            </Button>
            <Button
              type="submit"
              onClick={form.handleSubmit(onSubmit)}
              className="bg-watney text-white hover:bg-watney/90"
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
