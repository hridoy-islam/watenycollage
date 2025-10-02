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

  // ✅ Updated Schema
  const trainingEntrySchema = z.object({
    trainingName: z.string().optional(),
    awardingBody: z.string().optional(),
    completionDate: z.date().nullable(),
    certificate: z.any().optional()
  }).superRefine((data, ctx) => {
    const hasAnyValue =
      data.trainingName?.trim() ||
      data.awardingBody?.trim() ||
      data.completionDate ||
      data.certificate;

    if (!hasAnyValue) return; // empty row is fine

    if (!data.trainingName?.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['trainingName'], message: 'Required' });
    }
    if (!data.awardingBody?.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['awardingBody'], message: 'Required' });
    }
    if (!data.completionDate) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['completionDate'], message: 'Required' });
    }
    if (!data.certificate) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['certificate'], message: 'Required' });
    }
  });

  const trainingSchema = z.object({
    trainingData: z.array(trainingEntrySchema)
  });

  // ✅ Transform default values for new fields
  const transformDefaultValues = (values) => {
    if (!values) {
      return {
        trainingData: [
          {
            trainingName: '',
            awardingBody: '',
            completionDate: null,
            certificate: undefined
          }
        ]
      };
    }
    return {
      trainingData: (values.trainingData || []).map((entry) => ({
        trainingName: entry.trainingName || '',
        awardingBody: entry.awardingBody || '',
        completionDate: entry.completionDate ? new Date(entry.completionDate) : null,
        certificate: entry.certificate || undefined
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
      trainingName: '',
      awardingBody: '',
      completionDate: null,
      certificate: undefined
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
      setCurrentPage(6);
    }
  }

const renderTrainingHistoryStep = () => (
  <div className="space-y-8">
    <CardHeader>
      <CardTitle className="text-2xl">Professional Training & Qualifications (Starting with most recent)</CardTitle>
      <CardDescription>
        Please provide details of any formal training you have completed. This
        section is optional, but if you fill in any field in a row, all fields
        in that row become mandatory.
      </CardDescription>
    </CardHeader>

    <CardContent className="mt-2 p-0 px-6">
      <div className="-mt-8">
        <Button
          type="button"
          variant="outline"
          onClick={addTrainingEntry}
          className="mb-4 h-12 rounded-full bg-watney text-lg text-white hover:bg-watney/90"
        >
          {fields.length === 0 ? 'Add Training Record' : 'Add More Training'}
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
                    Training Name{' '}
                    <span className="hidden text-red-500 group-[.group-filled]:inline">
                      *
                    </span>
                  </TableHead>
                  <TableHead className="text-lg">
                    Awarding Body{' '}
                    <span className="hidden text-red-500 group-[.group-filled]:inline">
                      *
                    </span>
                  </TableHead>
                  <TableHead className="text-lg">Completion Date</TableHead>
                  <TableHead className="text-lg">Certificate</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fields.map((field, index) => {
                  const isRowFilled =
                    form.getValues(`trainingData.${index}.trainingName`)?.trim() ||
                    form.getValues(`trainingData.${index}.awardingBody`)?.trim() ||
                    form.getValues(`trainingData.${index}.completionDate`) ||
                    form.getValues(`trainingData.${index}.certificate`);

                  return (
                    <TableRow
                      key={field.id}
                      className={isRowFilled ? 'group-filled' : ''}
                    >
                      <TableCell className="align-top">
                        <FormField
                          control={form.control}
                          name={`trainingData.${index}.trainingName`}
                          render={({ field: formField }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  {...formField}
                                  value={formField.value || ''}
                                  placeholder="Training name"
                                  className="h-12 rounded-full text-lg"
                                />
                              </FormControl>
                              <p className="text-md text-gray-400">
                                Example: First Aid Certification
                              </p>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TableCell>
                      <TableCell className="align-top">
                        <FormField
                          control={form.control}
                          name={`trainingData.${index}.awardingBody`}
                          render={({ field: formField }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  {...formField}
                                  value={formField.value || ''}
                                  placeholder="Awarding body"
                                  className="h-12 rounded-full text-lg"
                                />
                              </FormControl>
                              <p className="text-md text-gray-400">
                                Example: Red Cross
                              </p>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TableCell>
                      <TableCell className="align-top">
                        <FormField
                          control={form.control}
                          name={`trainingData.${index}.completionDate`}
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
                                    className="h-12 rounded-full text-lg w-full"
                                  />
                                </FormControl>
                                <p className="text-md text-gray-400">
                                  Example: 06/15/2023
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
                          name={`trainingData.${index}.certificate`}
                          render={({ field: formField }) => (
                            <FormItem className="flex flex-col">
                              <Button
                                type="button"
                                className="h-12 rounded-full bg-watney text-lg text-white hover:bg-watney/90"
                                onClick={() =>
                                  setUploadState({
                                    isOpen: true,
                                    field: formField.name,
                                  })
                                }
                              >
                                Upload Certificate
                              </Button>
                              <p className="mt-1 text-md text-gray-500">
                                PDF, JPG, PNG (≤5MB)
                              </p>
                              {formField.value && (
                                <a
                                  href={formField.value}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="mt-1 text-md text-blue-600 underline"
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
                          className="h-12 rounded-full text-lg text-red-500 hover:bg-red-100 hover:text-red-700"
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
                form.getValues(`trainingData.${index}.trainingName`)?.trim() ||
                form.getValues(`trainingData.${index}.awardingBody`)?.trim() ||
                form.getValues(`trainingData.${index}.completionDate`) ||
                form.getValues(`trainingData.${index}.certificate`);

              return (
                <div
                  key={field.id}
                  className="space-y-4 rounded-lg border border-gray-300 bg-white p-4"
                >
                  {/* Training Name */}
                  <div>
                    <label className="mb-2 block text-lg font-medium text-gray-700">
                      Training Name{' '}
                      {isRowFilled && <span className="text-red-500">*</span>}
                    </label>
                    <FormField
                      control={form.control}
                      name={`trainingData.${index}.trainingName`}
                      render={({ field: formField }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              {...formField}
                              value={formField.value || ''}
                              placeholder="Training name"
                              className="h-12 rounded-full text-lg"
                            />
                          </FormControl>
                          <p className="text-md text-gray-400">
                            Example: First Aid Certification
                          </p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Awarding Body */}
                  <div>
                    <label className="mb-2 block text-lg font-medium text-gray-700">
                      Awarding Body{' '}
                      {isRowFilled && <span className="text-red-500">*</span>}
                    </label>
                    <FormField
                      control={form.control}
                      name={`trainingData.${index}.awardingBody`}
                      render={({ field: formField }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              {...formField}
                              value={formField.value || ''}
                              placeholder="Awarding body"
                              className="h-12 rounded-full text-lg"
                            />
                          </FormControl>
                          <p className="text-md text-gray-400">
                            Example: Red Cross
                          </p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Completion Date */}
                  <div>
                    <label className="mb-2 block text-lg font-medium text-gray-700">
                      Completion Date{' '}
                      {isRowFilled && <span className="text-red-500">*</span>}
                    </label>
                    <FormField
                      control={form.control}
                      name={`trainingData.${index}.completionDate`}
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
                                className="h-12 rounded-full text-lg w-full"
                              />
                            </FormControl>
                            <p className="text-md text-gray-400">
                              Example: 06/15/2023
                            </p>
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />
                  </div>

                  {/* Certificate Upload */}
                  <div>
                    <label className="mb-2 block text-lg font-medium text-gray-700">
                      Certificate{' '}
                      {isRowFilled && <span className="text-red-500">*</span>}
                    </label>
                    <FormField
                      control={form.control}
                      name={`trainingData.${index}.certificate`}
                      render={({ field: formField }) => (
                        <FormItem className="flex flex-col">
                          <Button
                            type="button"
                            className="h-12 rounded-full bg-watney text-lg text-white hover:bg-watney/90"
                            onClick={() =>
                              setUploadState({
                                isOpen: true,
                                field: formField.name,
                              })
                            }
                          >
                            Upload Certificate
                          </Button>
                          <p className="mt-1 text-md text-gray-500">
                            PDF, JPG, PNG (≤5MB)
                          </p>
                          {formField.value && (
                            <a
                              href={formField.value}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-1 text-md text-blue-600 underline"
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
                      onClick={() => remove(index)}
                      className="h-12 w-full rounded-full text-lg text-red-500 hover:bg-red-100 hover:text-red-700"
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
              className="h-12 rounded-full bg-watney px-6 text-lg text-white hover:bg-watney/90"
            >
              Back
            </Button>
            <Button
              type="submit"
              className="h-12 rounded-full bg-watney px-6 text-lg text-white hover:bg-watney/90"
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