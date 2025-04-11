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
import { CalendarIcon, Upload } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { FileUpload } from './file-upload';

// Define a schema for a single education entry
const educationEntrySchema = z.object({
  institution: z.string().min(1, { message: 'Institution name is required' }),
  studyType: z.string().min(1, { message: 'Please select study type' }),
  qualification: z
    .string()
    .min(1, { message: 'Qualification details are required' }),
  awardDate: z.date({
    required_error: 'Date of award is required'
  }),
  certificate: z.any().optional(),
  transcript: z.any().optional()
});

// Define the schema for the entire form
const educationSchema = z.object({
  educationEntries: z
    .array(educationEntrySchema)
    .min(1, 'At least one education entry is required')
});

type EducationEntry = z.infer<typeof educationEntrySchema>;
type EducationData = z.infer<typeof educationSchema>;

interface EducationStepProps {
  defaultValues?: Partial<EducationData>;
  onSaveAndContinue: (data: EducationData) => void;
  onSave: (data: EducationData) => void;
}

export function EducationStep({
  defaultValues,
  onSaveAndContinue,
  onSave
}: EducationStepProps) {
  const [educationEntries, setEducationEntries] = useState<EducationEntry[]>(
    defaultValues?.educationEntries || [
      {
        institution: '',
        studyType: '',
        qualification: '',
        awardDate: new Date(),
        certificate: null,
        transcript: null
      }
    ]
  );

  const [certificates, setCertificates] = useState<Record<number, File[]>>({});
  const [transcripts, setTranscripts] = useState<Record<number, File[]>>({});

  const form = useForm<EducationData>({
    resolver: zodResolver(educationSchema),
    defaultValues: {
      educationEntries: educationEntries
    }
  });

  function onSubmit(data: EducationData) {
    // Add the file uploads to the data
    const entriesWithFiles = data.educationEntries.map((entry, index) => ({
      ...entry,
      certificate: certificates[index] ? certificates[index][0] : null,
      transcript: transcripts[index] ? transcripts[index][0] : null
    }));

    onSaveAndContinue({
      ...data,
      educationEntries: entriesWithFiles
    });
  }

  function handleSave() {
    const formData = form.getValues();

    // Add the file uploads to the data
    const entriesWithFiles = formData.educationEntries.map((entry, index) => ({
      ...entry,
      certificate: certificates[index] ? certificates[index][0] : null,
      transcript: transcripts[index] ? transcripts[index][0] : null
    }));

    onSave({
      ...formData,
      educationEntries: entriesWithFiles
    });
  }

  const addEducationEntry = () => {
    setEducationEntries([
      ...educationEntries,
      {
        institution: '',
        studyType: '',
        qualification: '',
        awardDate: new Date(),
        certificate: null,
        transcript: null
      }
    ]);

    form.setValue('educationEntries', [
      ...form.getValues().educationEntries,
      {
        institution: '',
        studyType: '',
        qualification: '',
        awardDate: new Date(),
        certificate: null,
        transcript: null
      }
    ]);
  };

  const removeEducationEntry = (index: number) => {
    const updatedEntries = [...educationEntries];
    updatedEntries.splice(index, 1);
    setEducationEntries(updatedEntries);

    const formEntries = [...form.getValues().educationEntries];
    formEntries.splice(index, 1);
    form.setValue('educationEntries', formEntries);
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
        <Card>
          <CardContent className="pt-6">
            <h2 className="mb-6 text-2xl font-semibold">Previous Education</h2>

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
                {educationEntries.map((entry, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <FormField
                        control={form.control}
                        name={`educationEntries.${index}.institution`}
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
                        name={`educationEntries.${index}.studyType`}
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
                        name={`educationEntries.${index}.qualification`}
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
                        name={`educationEntries.${index}.awardDate`}
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={'outline'}
                                    className={cn(
                                      'w-full pl-3 text-left font-normal',
                                      !field.value && 'text-muted-foreground'
                                    )}
                                  >
                                    {field.value
                                      ? format(field.value, 'MM/dd/yyyy')
                                      : 'mm/dd/yyyy'}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent
                                className="w-auto p-0"
                                align="start"
                              >
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  disabled={(date) => date > new Date()}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
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
                        buttonLabel={<Upload className="h-4 w-4" />}
                        buttonVariant="primary"
                      />
                    </TableCell>
                    <TableCell>
                      <FileUpload
                        id={`transcript-${index}`}
                        onFilesSelected={(files) =>
                          handleTranscriptUpload(index, files)
                        }
                        accept=".pdf,.jpg,.jpeg,.png"
                        buttonLabel={<Upload className="h-4 w-4" />}
                        buttonVariant="primary"
                      />
                    </TableCell>
                    <TableCell>
                      {educationEntries.length > 1 && (
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
        </Card>

        <div className="mt-6 flex justify-between">
          <Button type="button" variant="outline" onClick={handleSave}>
            Save
          </Button>
          <Button type="submit">Save & Continue</Button>
        </div>
      </form>
    </Form>
  );
}
