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
import { BlinkingDots } from '@/components/shared/blinking-dots';
import { useToast } from '@/components/ui/use-toast';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import moment from 'moment';

// Types
interface Job {
  _id: string;
  jobTitle: string;
  applicationDeadline: string | Date;
}

type JobApplicationFormValues = {
  jobId: string;
};

export default function JobApplicationPage() {
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const { user } = useSelector((state: any) => state.auth);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { id } = useParams();

  const form = useForm<JobApplicationFormValues>({
    defaultValues: {
      jobId: ''
    }
  });

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const storedAppId = localStorage.getItem('applicationId');
        const jobIdToFetch = id || storedAppId;

        if (!jobIdToFetch) {
          toast({ title: 'No job ID provided.' });
          return;
        }

        const res = await axiosInstance.get(`/jobs/${jobIdToFetch}`);
        const fetchedJob: Job = res.data?.data;
        if (fetchedJob) {
          setJob(fetchedJob);
          form.setValue('jobId', fetchedJob._id);
        }
      } catch (error) {
        console.error('Error fetching job:', error);
        toast({ title: 'Failed to load job information.' });
        // Redirect to jobs list or home
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [form, id, toast, navigate]);

  const onSubmit = async (data: JobApplicationFormValues) => {
    if (!user || !user._id) {
      toast({ title: 'Please log in to apply.' });
      return;
    }

    setSubmitting(true);
    try {
      await axiosInstance.post('/application-job', {
        applicantId: user._id,
        jobId: data.jobId
      });
      navigate('/dashboard')
      toast({ title: ' Application submitted successfully!' });
      localStorage.removeItem('applicationId');
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        'Failed to submit application. Please try again.';
      toast({ title: message });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <BlinkingDots />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="py-10 text-center">
        <h2 className="text-xl font-semibold text-gray-700">Job not found</h2>
        <Button
          variant="link"
          onClick={() => navigate('/jobs')}
          className="mt-4"
        >
          Back to Jobs
        </Button>
      </div>
    );
  }

  return (
    <div className=" mx-auto p-6 ">
      <h1 className="mb-2 text-3xl font-bold">{job.jobTitle}</h1>

      <p className="mb-6 text-gray-500">
        Application Deadline:{' '}
        <span className="font-medium text-gray-900">
          {moment(job?.applicationDeadline).format('MMMM Do, YYYY')}
        </span>
      </p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Hidden field for jobId */}
          <FormField
            control={form.control}
            name="jobId"
            render={({ field }) => <input type="hidden" {...field} />}
          />

          <Button
            type="submit"
            disabled={submitting}
            className={`w-[200px] ${'bg-watney hover:bg-watney/90'} text-white`}
          >
            {submitting ? 'Submitting...' : 'Apply Now'}
          </Button>
        </form>
      </Form>
    </div>
  );
}
