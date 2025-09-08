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
import 'react-datepicker/dist/react-datepicker.css';
import { CustomDatePicker } from '@/components/shared/CustomDatePicker';
import Select from 'react-select';
import { useSelector } from 'react-redux';
import { ImageUploader } from './document-uploader';

export function TrainingStep({
  defaultValues,
  onSaveAndContinue,
  setCurrentStep
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [uploadState, setUploadState] = useState({
    isOpen: false,
    field: null
  });
  const { user } = useSelector((state: any) => state.auth);

const trainingEntrySchema = z.object({
  name: z.string().optional(),
  address: z.string().optional(),
  from: z.date().nullable(),
  to: z.date().nullable(),
  qualification: z.any().optional()
}).superRefine((data, ctx) => {
  const hasAnyValue =
    data.name?.trim() ||
    data.address?.trim() ||
    data.from ||
    data.to ||
    data.qualification;

  if (!hasAnyValue) return; // empty row is fine

  if (!data.name?.trim()) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['name'], message: 'Required' });
  }
  if (!data.address?.trim()) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['address'], message: 'Required' });
  }
  if (!data.from) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['from'], message: 'Required' });
  }
  if (!data.to) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['to'], message: 'Required' });
  }
  if (!data.qualification) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['qualification'], message: 'Required' });
  }
});

  const trainingSchema = z.object({
    trainingData: z.array(trainingEntrySchema)
  });

  // Transform default values to ensure dates are Date objects
  const transformDefaultValues = (values) => {
    if (!values) {
      return {
        trainingData: [
          {
            name: '',
            address: '',
            from: null,
            to: null,
            qualification: undefined
          }
        ]
      };
    }
    return {
      trainingData: (values.trainingData || []).map((entry) => ({
        name: entry.name || '',
        address: entry.address || '',
        from: entry.from ? new Date(entry.from) : null,
        to: entry.to ? new Date(entry.to) : null,
        qualification: entry.qualification || undefined
      }))
    };
  };

  const form = useForm({
    resolver: zodResolver(trainingSchema),
    defaultValues: transformDefaultValues(defaultValues),
    mode: 'onSubmit'
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'trainingData'
  });

  useEffect(() => {
    if (defaultValues) {
      form.reset(transformDefaultValues(defaultValues));
    }
  }, [defaultValues, form]);

  const onSubmit = async (data) => {
    await onSaveAndContinue(data);
  };

  const addTrainingEntry = () => {
    append({
      name: '',
      address: '',
      from: null,
      to: null,
      qualification: undefined
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

    if (field.startsWith('trainingData.')) {
      form.setValue(field, uploadedFileData.fileUrl, {
        shouldValidate: true,
        shouldDirty: true
      });
    }

    setUploadState({ isOpen: false, field: null });
  };

  const trainingData = useWatch({
    control: form.control,
    name: 'trainingData'
  });

  function handleBack() {
    if (currentPage === 1) {
      setCurrentStep(4);
    } else {
      setCurrentPage(1);
    }
  }

  const renderTrainingHistoryStep = () => (
    <div className="space-y-8">
      <CardHeader>
        <CardTitle className="text-2xl"> Professional Training & Qualifications (Starting with most recent)</CardTitle>
        <CardDescription>
          Please provide details of any formal training you have completed. This
          section is optional, but if you fill in any field in a row, all fields
          in that row become mandatory.
        </CardDescription>
      </CardHeader>

      <CardContent className="mt-2 p-0 px-6">
        <div className="-mt-8">
          {fields.length === 0 ? (
            <Button
              type="button"
              variant="outline"
              onClick={addTrainingEntry}
              className="mb-4 bg-watney text-white hover:bg-watney/90"
            >
              Add Training Record
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={addTrainingEntry}
              className="mb-4 bg-watney text-white hover:bg-watney/90"
            >
              Add More Training
            </Button>
          )}
        </div>

        {fields.length > 0 && (
          <>
            {/* Desktop/Tablet View: Table */}
            <div className="hidden overflow-x-auto md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      Name of Training Body{' '}
                      <span className="hidden text-red-500 group-[.filled]:inline">
                        *
                      </span>
                    </TableHead>
                    <TableHead>
                      Address{' '}
                      <span className="hidden text-red-500 group-[.filled]:inline">
                        *
                      </span>
                    </TableHead>
                    <TableHead>From Date</TableHead>
                    <TableHead>To Date</TableHead>
                    <TableHead>Certificate</TableHead>
                    <TableHead className="w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.map((field, index) => {
                    const isRowFilled =
                      form.getValues(`trainingData.${index}.name`)?.trim() ||
                      form.getValues(`trainingData.${index}.address`)?.trim() ||
                      form.getValues(`trainingData.${index}.from`) ||
                      form.getValues(`trainingData.${index}.to`) ||
                      form.getValues(`trainingData.${index}.qualification`);

                    return (
                      <TableRow
                        key={field.id}
                        className={isRowFilled ? 'group-filled' : ''}
                      >
                        <TableCell className="align-top">
                          <FormField
                            control={form.control}
                            name={`trainingData.${index}.name`}
                            render={({ field: formField }) => (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    {...formField}
                                    value={formField.value || ''}
                                    placeholder="Training body name"
                                  />
                                </FormControl>
                                <p className="text-xs text-gray-400">
                                  Example: Red Cross Training Center
                                </p>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </TableCell>
                        <TableCell className="align-top">
                          <FormField
                            control={form.control}
                            name={`trainingData.${index}.address`}
                            render={({ field: formField }) => (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    {...formField}
                                    value={formField.value || ''}
                                    placeholder="Full address"
                                  />
                                </FormControl>
                                <p className="text-xs text-gray-400">
                                  Example: 123 Main St, London, SW1A 1AA
                                </p>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </TableCell>
                        <TableCell className="align-top">
                          <FormField
                            control={form.control}
                            name={`trainingData.${index}.from`}
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
                                      placeholderText="MM/DD/YYYY"
                                    />
                                  </FormControl>
                                  <p className="text-xs text-gray-400">
                                    Example: 03/15/2023
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
                            name={`trainingData.${index}.to`}
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
                                      placeholderText="MM/DD/YYYY"
                                    />
                                  </FormControl>
                                  <p className="text-xs text-gray-400">
                                    Example: 06/20/2023
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
                            name={`trainingData.${index}.qualification`}
                            render={({ field: formField }) => (
                              <FormItem className="flex flex-col">
                                <Button
                                  type="button"
                                  className="bg-watney py-1 text-xs text-white hover:bg-watney/90"
                                  onClick={() =>
                                    setUploadState({
                                      isOpen: true,
                                      field: formField.name
                                    })
                                  }
                                >
                                  Upload Certificate
                                </Button>
                                <p className="mt-1 text-xs text-gray-500">
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
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Mobile View: Stacked Cards */}
            <div className="space-y-6 md:hidden">
              {fields.map((field, index) => {
                const isRowFilled =
                  form.getValues(`trainingData.${index}.name`)?.trim() ||
                  form.getValues(`trainingData.${index}.address`)?.trim() ||
                  form.getValues(`trainingData.${index}.from`) ||
                  form.getValues(`trainingData.${index}.to`) ||
                  form.getValues(`trainingData.${index}.qualification`);

                return (
                  <div
                    key={field.id}
                    className="space-y-4 rounded-lg border border-gray-300 bg-white p-2"
                  >
                    {/* Name */}
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        Name of Training Body{' '}
                        {isRowFilled && <span className="text-red-500">*</span>}
                      </label>
                      <FormField
                        control={form.control}
                        name={`trainingData.${index}.name`}
                        render={({ field: formField }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                {...formField}
                                value={formField.value || ''}
                                placeholder="Training body name"
                              />
                            </FormControl>
                            <p className="text-xs text-gray-400">
                              Example: Red Cross Training Center
                            </p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Address */}
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        Address{' '}
                        {isRowFilled && <span className="text-red-500">*</span>}
                      </label>
                      <FormField
                        control={form.control}
                        name={`trainingData.${index}.address`}
                        render={({ field: formField }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                {...formField}
                                value={formField.value || ''}
                                placeholder="Full address"
                              />
                            </FormControl>
                            <p className="text-xs text-gray-400">
                              Example: 123 Main St, London, SW1A 1AA
                            </p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* From Date */}
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        From Date{' '}
                        {isRowFilled && <span className="text-red-500">*</span>}
                      </label>
                      <FormField
                        control={form.control}
                        name={`trainingData.${index}.from`}
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
                                  placeholderText="MM/DD/YYYY"
                                  className="w-full"
                                />
                              </FormControl>
                              <p className="text-xs text-gray-400">
                                Example: 03/15/2023
                              </p>
                              <FormMessage />
                            </FormItem>
                          );
                        }}
                      />
                    </div>

                    {/* To Date */}
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        To Date{' '}
                        {isRowFilled && <span className="text-red-500">*</span>}
                      </label>
                      <FormField
                        control={form.control}
                        name={`trainingData.${index}.to`}
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
                                  placeholderText="MM/DD/YYYY"
                                  className="w-full"
                                />
                              </FormControl>
                              <p className="text-xs text-gray-400">
                                Example: 06/20/2023
                              </p>
                              <FormMessage />
                            </FormItem>
                          );
                        }}
                      />
                    </div>

                    {/* Certificate Upload */}
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        Certificate{' '}
                        {isRowFilled && <span className="text-red-500">*</span>}
                      </label>
                      <FormField
                        control={form.control}
                        name={`trainingData.${index}.qualification`}
                        render={({ field: formField }) => (
                          <FormItem className="flex flex-col">
                            <Button
                              type="button"
                              className="bg-watney py-1 text-xs text-white hover:bg-watney/90"
                              onClick={() =>
                                setUploadState({
                                  isOpen: true,
                                  field: formField.name
                                })
                              }
                            >
                              Upload Certificate
                            </Button>
                            <p className="mt-1 text-xs text-gray-500">
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
                    </div>

                    {/* Remove Button */}
                    <div className="pt-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => remove(index)}
                        className="w-full text-sm text-red-500 hover:bg-red-50 hover:text-red-700"
                      >
                        Remove Training
                      </Button>
                    </div>
                  </div>
                );
              })}
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
          {renderTrainingHistoryStep()}
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
