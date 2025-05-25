import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import axiosInstance from '@/lib/axios';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useSelector } from 'react-redux';
import { BlinkingDots } from '@/components/shared/blinking-dots';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

// Define types
interface Job {
  _id: string;
  jobTitle: string;
  applicationDeadline: string | Date;
}

type JobApplicationFormValues = {
  jobId: string;
};

export default function JobApplicationPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState('');
  const { user } = useSelector((state: any) => state.auth);
  const { toast } = useToast();
  const navigate = useNavigate()
  const [isDisabled, setIsDisabled] = useState(false);

  const form = useForm<JobApplicationFormValues>({
    defaultValues: {
      jobId: ''
    }
  });

useEffect(() => {
  const fetchJobs = async () => {
    try {
      const res = await axiosInstance.get('/jobs');
      const jobList = res.data?.data.result || [];
      setJobs(jobList);

      const storedAppId = localStorage.getItem('applicationId');
      if (storedAppId) {
        setIsDisabled(true);
        const matchedJob = jobList.find((job) => job._id === storedAppId);
        if (matchedJob) {
          setSelectedJobId(matchedJob._id);
          form.setValue('jobId', matchedJob._id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
      toast({ title: 'Failed to load job listings.' });
    } finally {
      setLoading(false);
    }
  };

  fetchJobs();
}, [form]);


  // Handle form submission
  const onSubmit = async (data: JobApplicationFormValues) => {


    setSubmitting(true);
    try {
      await axiosInstance.post('/application-job', {
        jobId: data.jobId,
        applicantId: user?._id
      });
       navigate('/dashboard');
      toast({ title: 'Successfully applied!' });
      form.reset();
      setSelectedJobId('');
    } catch (err: any) {
      toast({title: err.response?.data?.message || 'Application failed.' }) 
     
    } finally {
      setSubmitting(false);
    }
  };

  const selectedJob = jobs.find((job) => job._id === selectedJobId);

  if (loading) {
    return (
      <div className="flex justify-center py-6">
        <BlinkingDots size="large" color="bg-watney" />
      </div>
    );
  }

  return (
    <div className="mx-auto mt-10 max-w-md rounded-lg bg-white p-6 shadow">
      <h2 className="mb-4 text-2xl font-semibold">Apply for a Job</h2>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Job Select Field */}
          <FormField
            control={form.control}
            name="jobId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Select a Job to Apply For</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      setSelectedJobId(value);
                    }}
                    value={field.value}
                     disabled={isDisabled}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a job">
                        {selectedJob ? (
                          <div className="flex w-full justify-between text-sm">
                            <span className="font-medium">
                              {selectedJob.jobTitle}
                            </span>
                          </div>
                        ) : (
                          'Choose a job'
                        )}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {jobs.map((job) => (
                        <SelectItem key={job._id} value={job._id}>
                          <div className="flex flex-col">
                            <span>{job.jobTitle}</span>
                            <small>
                              Deadline:{' '}
                              {new Date(
                                job.applicationDeadline
                              ).toLocaleDateString()}
                            </small>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={submitting}
            className="w-full bg-watney text-white hover:bg-watney/90"
          >
            {submitting ? 'Submitting...' : 'Apply'}
          </Button>
        </form>
      </Form>
    </div>
  );
}
