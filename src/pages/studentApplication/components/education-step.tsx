import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import moment from 'moment';
import { FileUpload } from './file-upload';

// Updated education entry schema with English qualification fields
const educationEntrySchema = z.object({
  institution: z.string().min(1, { message: 'Institution name is required' }),
  studyType: z.string().min(1, { message: 'Please select study type' }),
  qualification: z.string().min(1, { message: 'Qualification details are required' }),
  awardDate: z.date({ required_error: 'Date of award is required' }).nullable(),
  certificate: z.any().optional(),
  transcript: z.any().optional()
});

// English qualification schema
const englishQualificationSchema = z.object({
  englishTestType: z.string().optional(),
  englishTestScore: z.string().optional(),
  englishTestDate: z.date().nullable().optional(),
  englishCertificate: z.any().optional()
});

// Complete education schema combining both
const educationSchema = z.object({
  educationData: z.array(educationEntrySchema),
  englishQualification: englishQualificationSchema.optional(),
  studentType: z.string()
});

type EducationEntry = z.infer<typeof educationEntrySchema>;
type EnglishQualification = z.infer<typeof englishQualificationSchema>;

export function EducationStep({
  defaultValues,
  onSaveAndContinue,
  onSave,
  setCurrentStep,
  studentType
}) {
  const [educationData, setEducationData] = useState<EducationEntry[]>(
    defaultValues?.educationData || []
  );
  const [certificates, setCertificates] = useState<Record<number, File[]>>({});
  const [transcripts, setTranscripts] = useState<Record<number, File[]>>({});
  const [englishCertificate, setEnglishCertificate] = useState<File[]>([]);

  const form = useForm({
    resolver: zodResolver(educationSchema),
    defaultValues: {
      educationData: educationData,
      englishQualification: defaultValues?.englishQualification || {
        englishTestType: '',
        englishTestScore: '',
        englishTestDate: null,
        englishCertificate: null
      },
     
    }
  });

  function onSubmit(data) {
    const submittedData = {
      ...data,
      educationData: data.educationData.map((entry, index) => ({
        ...entry,
        certificate: certificates[index] ? certificates[index][0] : null,
        transcript: transcripts[index] ? transcripts[index][0] : null
      })),
      englishQualification: data.studentType === 'international' ? {
        ...data.englishQualification,
        englishCertificate: englishCertificate[0] || null
      } : undefined
    };

    onSaveAndContinue(submittedData);
  }

  function handleBack() {
    setCurrentStep(5);
  }

  const addEducationEntry = () => {
    const newEntry = {
      institution: '',
      studyType: '',
      qualification: '',
      awardDate: null,
      certificate: '',
      transcript: ''
    };
    
    setEducationData([...educationData, newEntry]);
    form.setValue('educationData', [...form.getValues().educationData, newEntry]);
  };

  const removeEducationEntry = (index: number) => {
    const updatedEntries = [...educationData];
    updatedEntries.splice(index, 1);
    setEducationData(updatedEntries);

    const formEntries = [...form.getValues().educationData];
    formEntries.splice(index, 1);
    form.setValue('educationData', formEntries);
  };

  const handleCertificateUpload = (index: number, files: File[]) => {
    setCertificates({ ...certificates, [index]: files });
  };

  const handleTranscriptUpload = (index: number, files: File[]) => {
    setTranscripts({ ...transcripts, [index]: files });
  };

  const handleEnglishCertificateUpload = (files: File[]) => {
    setEnglishCertificate(files);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div>
          <CardContent>
            <h2 className="mb-6 text-2xl font-semibold">Academic Qualification</h2>
            <Button type="button" variant="outline" onClick={addEducationEntry}>
              Add Education
            </Button>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Name of the Institution</TableHead>
                  <TableHead className="w-[150px]">Full/Part-Time</TableHead>
                  <TableHead>Qualifications (Please state subject & class for degrees etc.)</TableHead>
                  <TableHead className="w-[150px]">Date of Award</TableHead>
                  <TableHead className="w-[120px]">Upload Certificate</TableHead>
                  <TableHead className="w-[120px]">Upload Transcript</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {educationData.map((entry, index) => (
                  <TableRow key={index}>
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
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="full-time">Full-time</SelectItem>
                                <SelectItem value="part-time">Part-time</SelectItem>
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
                          <FormItem className="flex flex-col">
                            <FormControl>
                              <Input
                                type="date"
                                value={field.value ? moment(field.value).format('YYYY-MM-DD') : ''}
                                onChange={(e) => {
                                  field.onChange(e.target.value ? new Date(e.target.value) : null);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TableCell>
                    <TableCell>
                      <FileUpload
                        id={`certificate-${index}`}
                        onFilesSelected={(files) => handleCertificateUpload(index, files)}
                        accept=".pdf,.jpg,.jpeg,.png"
                        buttonVariant="outline"
                      />
                    </TableCell>
                    <TableCell>
                      <FileUpload
                        id={`transcript-${index}`}
                        onFilesSelected={(files) => handleTranscriptUpload(index, files)}
                        accept=".pdf,.jpg,.jpeg,.png"
                        buttonVariant="outline"
                      />
                    </TableCell>
                    <TableCell>
                      {educationData.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeEducationEntry(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Remove
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* English Qualification Section for International Students */}
            {studentType === 'international' && (
              <div className="mt-8 space-y-4">
                <h3 className="text-xl font-semibold">English Language Qualification</h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <FormField
                    control={form.control}
                    name="englishQualification.englishTestType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>English Test Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
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
                              field.onChange(e.target.value ? new Date(e.target.value) : null);
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
                  </FormItem>
                </div>
              </div>
            )}
          </CardContent>
        </div>

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
          >
            Next
          </Button>
        </div>
      </form>
    </Form>
  );
}