import { useState } from 'react';
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
import { FileUpload } from './file-upload';
import moment from 'moment';

// Define a schema for a single education entry
const educationEntrySchema = z.object({
  institution: z.string().min(1, { message: 'Institution name is required' }),
  studyType: z.string().min(1, { message: 'Please select study type' }),
  qualification: z
    .string()
    .min(1, { message: 'Qualification details are required' }),
  awardDate: z
    .date({
      required_error: 'Date of award is required'
    })
    .nullable(),
  certificate: z.any().optional(),
  transcript: z.any().optional()
});

// Define the schema for the entire form
const educationSchema = z.object({
  educationData: z
    .array(educationEntrySchema)
    .min(1, 'At least one education entry is required')
});

type EducationEntry = z.infer<typeof educationEntrySchema>;
type EducationData = z.infer<typeof educationSchema>;

export function EducationStep({
  defaultValues,
  onSaveAndContinue,
  onSave,
  setCurrentStep
}) {
  const [educationData, seteducationData] = useState<EducationEntry[]>(
    defaultValues|| [
      {
        institution: '',
        studyType: '',
        qualification: '',
        awardDate: null, // Nullable date
        certificate: '',
        transcript: ''
      }
    ]
  );

  const [certificates, setCertificates] = useState<Record<number, File[]>>({});
  const [transcripts, setTranscripts] = useState<Record<number, File[]>>({});

  const form = useForm<EducationData>({
    resolver: zodResolver(educationSchema),
    defaultValues: {
      educationData: educationData
    }
  });

  // function onSubmit(data: EducationData) {
  //   // Add the file uploads to the data
  //   const entriesWithFiles = data.educationData.map((entry, index) => ({
  //     ...entry,
  //     certificate: certificates[index] ? certificates[index][0] : null,
  //     transcript: transcripts[index] ? transcripts[index][0] : null
  //   }));

  //   onSaveAndContinue({
  //     ...data,
  //     educationData: entriesWithFiles
  //   });
  // }

  function onSubmit(data: EducationData) {
    const educationData = data.educationData.map((entry, index) => ({
      ...entry,
      certificate: certificates[index] ? certificates[index][0] : null,
      transcript: transcripts[index] ? transcripts[index][0] : null
    }));

    onSaveAndContinue(educationData);
  }

  // function handleSave() {
  //   const formData = form.getValues();

  //   // Add the file uploads to the data
  //   const entriesWithFiles = formData.educationData.map((entry, index) => ({
  //     ...entry,
  //     certificate: certificates[index] ? certificates[index][0] : null,
  //     transcript: transcripts[index] ? transcripts[index][0] : null
  //   }));

  //   onSave({
  //     ...formData,
  //     educationData: entriesWithFiles
  //   });
  // }

  function handleBack() {
    setCurrentStep(5);
  }

  const addEducationEntry = () => {
    seteducationData([
      ...educationData,
      {
        institution: '',
        studyType: '',
        qualification: '',
        awardDate: null,
        certificate: '',
        transcript: ''
      }
    ]);

    form.setValue('educationData', [
      ...form.getValues().educationData,
      {
        institution: '',
        studyType: '',
        qualification: '',
        awardDate: null,
        certificate: '',
        transcript: ''
      }
    ]);
  };

  const removeEducationEntry = (index: number) => {
    const updatedEntries = [...educationData];
    updatedEntries.splice(index, 1);
    seteducationData(updatedEntries);

    const formEntries = [...form.getValues().educationData];
    formEntries.splice(index, 1);
    form.setValue('educationData', formEntries);
  };

  const handleCertificateUpload = (index: number, files: File[]) => {
    setCertificates({
      ...certificates,
      [index]: files
    });
  };

  const handleTranscriptUpload = (index: number, files: File[]) => {
    setTranscripts({
      ...transcripts,
      [index]: files
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div>
          <CardContent>
            <h2 className="mb-6 text-2xl font-semibold">Education</h2>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">
                    Name of the Institution
                  </TableHead>
                  <TableHead className="w-[150px]">Full/Part-Time</TableHead>
                  <TableHead>
                    Qualifications (Please state subject & class for degrees
                    etc.)
                  </TableHead>
                  <TableHead className="w-[150px]">Date of Award</TableHead>
                  <TableHead className="w-[120px]">
                    Upload Certificate
                  </TableHead>
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
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
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
                                <SelectItem value="distance">
                                  Distance
                                </SelectItem>
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
                                value={
                                  field.value ? moment(field.value).format('YYYY-MM-DD') : ''
                                }
                                onChange={(e) => {
                                  const selectedDate = e.target.value
                                    ? new Date(e.target.value)
                                    : null;
                                  field.onChange(selectedDate);
                                }}
                                onBlur={field.onBlur}
                                ref={field.ref}
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
                        onFilesSelected={(files) =>
                          handleCertificateUpload(index, files)
                        }
                        accept=".pdf,.jpg,.jpeg,.png"
                        // buttonLabel={<Upload className="h-4 w-4" />}
                        buttonVariant="outline"
                      />
                    </TableCell>
                    <TableCell>
                      <FileUpload
                        id={`transcript-${index}`}
                        onFilesSelected={(files) =>
                          handleTranscriptUpload(index, files)
                        }
                        accept=".pdf,.jpg,.jpeg,.png"
                        // buttonLabel={<Upload className="h-4 w-4" />}
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

            <Button
              type="button"
              variant="outline"
              onClick={addEducationEntry}
              className="mt-4"
            >
              Add Another Education
            </Button>
          </CardContent>
        </div>

        <div className="flex justify-between px-6">
          <Button type="button" variant="outline" onClick={handleBack}>
            Back
          </Button>
          <Button type="submit">Next</Button>
        </div>
      </form>
    </Form>
  );
}
