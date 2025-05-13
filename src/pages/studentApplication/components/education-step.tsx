import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { CardContent } from '@/components/ui/card';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
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
import "react-datepicker/dist/react-datepicker.css";
import DatePicker from 'react-datepicker';



const educationEntrySchema = z.object({
  institution: z.string().min(1, { message: 'Institution name is required' }),
  studyType: z.string().min(1, { message: 'Please select study type' }),
  qualification: z.string().min(1, { message: 'Qualification details are required' }),
  awardDate: z.date({ required_error: 'Date of award is required' }).nullable(),
  certificate: z.any().optional(),
  transcript: z.any().optional(),
});

const englishQualificationSchema = z.object({
  englishTestType: z.string().optional(),
  englishTestScore: z.string().optional(),
  englishTestDate: z.date().nullable().optional(),
  englishCertificate: z.any().optional(),
});

// Create a dynamic schema factory that changes based on studentType
const createEducationSchema = (studentType) => {
  return z.object({
    educationData: z.array(educationEntrySchema),
    ...(studentType === 'international' ? {
      englishQualification: englishQualificationSchema.optional()
    } : {})
  });
};

export function EducationStep({
  defaultValues,
  onSaveAndContinue,
  onSave,
  setCurrentStep,
  studentType
}) {
  const educationSchema = createEducationSchema(studentType);
  
  // Transform default values if they come in nested format
  const transformDefaultValues = (values) => {
    if (values?.educationData?.educationData) {
      return {
        educationData: values.educationData.educationData,
        englishQualification: values.educationData.englishQualification
      };
    }
    return values || {
      educationData: [{
        institution: '',
        studyType: '',
        qualification: '',
        awardDate: null,
        certificate: null,
        transcript: null
      }],
      ...(studentType === 'international' ? {
        englishQualification: {
          englishTestType: '',
          englishTestScore: '',
          englishTestDate: null,
          englishCertificate: null
        }
      } : {})
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

  const [isSubmitting, setIsSubmitting] = useState(false);

 
  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      // Format dates before submission
      const formattedData = {
        educationData: data.educationData.map(edu => ({
          ...edu,
          awardDate: edu.awardDate ? new Date(edu.awardDate) : null
        })),
        ...(data.englishQualification ? {
          englishQualification: {
            ...data.englishQualification,
            englishTestDate: data.englishQualification.englishTestDate 
              ? new Date(data.englishQualification.englishTestDate) 
              : null
          }
        } : {})
      };

      await onSaveAndContinue(formattedData);
    } catch (error) {
      console.error('Submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addEducationEntry = () => {
    append({
      institution: '',
      studyType: '',
      qualification: '',
      awardDate: '',
      certificate: null,
      transcript: null
    });
  };

  const handleCertificateUpload = (index, files) => {
    form.setValue(`educationData.${index}.certificate`, files[0] || null);
  };

  const handleTranscriptUpload = (index, files) => {
    form.setValue(`educationData.${index}.transcript`, files[0] || null);
  };

  const handleEnglishCertificateUpload = (files) => {
    if (studentType === 'international') {
      form.setValue('englishQualification.englishCertificate', files[0] || null);
    }
  };

  function handleBack() {
    // Get current form values before navigating back
    const currentValues = form.getValues();
    onSave(currentValues);
    setCurrentStep(5);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <CardContent>
          <h2 className="mb-6 text-2xl font-semibold">
            Academic Qualification
          </h2>
          <Button type="button" variant="outline" onClick={addEducationEntry}>
            Add Education
          </Button>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">
                  Name of the Institution
                </TableHead>
                <TableHead className="w-[150px]">Full/Part-Time</TableHead>
                <TableHead>Qualifications</TableHead>
                <TableHead className="w-[150px]">Date of Award</TableHead>
                {/* <TableHead className="w-[120px]">Upload Certificate</TableHead>
                <TableHead className="w-[120px]">Upload Transcript</TableHead> */}
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fields.map((field, index) => (
                <TableRow key={field.id}>
                  <TableCell>
                    <FormField
                      control={form.control}
                      name={`educationData.${index}.institution`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TableCell>
                  <TableCell>
                    <FormField
                      control={form.control}
                      name={`educationData.${index}.studyType`}
                      render={({ field }) => (
                        <FormItem>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="full-time">
                                Full-time
                              </SelectItem>
                              <SelectItem value="part-time">
                                Part-time
                              </SelectItem>
                              <SelectItem value="distance">Distance</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TableCell>
                  <TableCell>
                    <FormField
                      control={form.control}
                      name={`educationData.${index}.qualification`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TableCell>
                  <TableCell>
                    <FormField
                      control={form.control}
                      name={`educationData.${index}.awardDate`}
                      render={({ field }) => (
                        <FormItem>
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
                  </TableCell>
                  {/* <TableCell>
                    <FileUpload
                      id={`certificate-${index}`}
                      onFilesSelected={(files) =>
                        handleCertificateUpload(index, files)
                      }
                      accept=".pdf,.jpg,.jpeg,.png"
                      buttonVariant="outline"
                    />
                    {form.watch(`educationData.${index}.certificate`)?.name && (
                      <p className="mt-1 text-sm">
                        {form.watch(`educationData.${index}.certificate`).name}
                      </p>
                    )}
                  </TableCell>
                  <TableCell>
                    <FileUpload
                      id={`transcript-${index}`}
                      onFilesSelected={(files) =>
                        handleTranscriptUpload(index, files)
                      }
                      accept=".pdf,.jpg,.jpeg,.png"
                      buttonVariant="outline"
                    />
                    {form.watch(`educationData.${index}.transcript`)?.name && (
                      <p className="mt-1 text-sm">
                        {form.watch(`educationData.${index}.transcript`).name}
                      </p>
                    )}
                  </TableCell> */}
                  <TableCell>
                    
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => remove(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </Button>
                  
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Only show English qualification section for international students */}
          {studentType === 'international' && (
            <div className="mt-8 space-y-4">
              <h3 className="text-xl font-semibold">
                English Language Qualification
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                <FormField
                  control={form.control}
                  name="englishQualification.englishTestType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>English Test Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select test type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ielts">IELTS</SelectItem>
                          <SelectItem value="toefl">TOEFL</SelectItem>
                          <SelectItem value="pte">PTE Academic</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="englishQualification.englishTestScore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Test Score</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter your score" />
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
                          value={field.value ? moment(field.value).format('YYYY-MM-DD') : ''}
                          onChange={(e) => {
                            const newValue = e.target.value ? new Date(e.target.value) : null;
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
            className="bg-watney text-white hover:bg-watney/90"
            onClick={handleBack}
          >
            Back
          </Button>
          <Button
            type="submit"
            className="bg-watney text-white hover:bg-watney/90"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Next' : 'Next'}
          </Button>
        </div>
      </form>
    </Form>
  );
}