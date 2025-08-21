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
import { MoveLeft } from 'lucide-react';

// Types
interface Job {
  _id: string;
  jobTitle: string;
  applicationDeadline: string | Date;
  jobDetail?: string;
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
        navigate('/dashboard');
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
      toast({ title: 'Application submitted successfully!' });
      navigate('/dashboard');
      localStorage.removeItem('applicationId');
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        'Failed to submit application. Please try again.';
      toast({ title: message ,className:"bg-destructive text-white border-none"});
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <BlinkingDots size="large" color="bg-watney" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className=" flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-semibold text-gray-700">Job not found</h2>
        <p className="mt-2 text-gray-500">
          We couldn't find the requested job.
        </p>

        {user.role === 'admin' ? (
          <Button
            variant="outline"
            onClick={() => navigate('/dashboard/jobs')}
            className="y mt-4 bg-watney text-white hover:bg-watney/90"
          >
            <MoveLeft />
            Back
          </Button>
        ) : (
          <Button
            variant="outline"
            onClick={() => navigate('/dashboard')}
            className="y mt-4 bg-watney text-white hover:bg-watney/90"
          >
            <MoveLeft />
            Back to Dashboard
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto w-full  ">
  {/* Job Info Card */}
  <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6 sm:p-8 shadow-xl">
    <div className="flex flex-col md:flex-row md:items-start md:justify-between md:gap-4">
      <div className="flex-1">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{job.jobTitle}</h1>

        {/* Application Deadline */}
        <div className="mt-2 inline-flex items-center rounded-full bg-watney/10 px-3 py-1 text-xs sm:text-sm text-watney">
          <span>
            Deadline: {moment(job.applicationDeadline).format('MMM Do, YYYY')}
          </span>
        </div>
      </div>

      {/* Back Button */}
      <div className="mt-4 md:mt-0 flex-shrink-0">
        {user.role === 'admin' ? (
          <Button
            variant="outline"
            onClick={() => navigate('/dashboard/jobs')}
            className="flex items-center gap-2 bg-watney text-white hover:bg-watney/90 px-4 py-2 text-sm sm:text-base"
          >
            <MoveLeft />
            Back
          </Button>
        ) : (
          <Button
            variant="outline"
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 bg-watney text-white hover:bg-watney/90 px-4 py-2 text-sm sm:text-base"
          >
            <MoveLeft />
            Back to Dashboard
          </Button>
        )}
      </div>
    </div>

    {/* Job Description */}
    <div
      className="prose mt-6 max-w-full text-gray-600"
      dangerouslySetInnerHTML={{
        __html: job.jobDetail || '<p>No description available for this position.</p>'
      }}
    ></div>

    {/* Application Form for Non-Admins */}
    {user.role !== 'admin' && (
      <div className="mt-10 rounded-lg border border-gray-100 bg-gray-50 p-4 sm:p-6 shadow-sm">
        <div className="mb-6 flex flex-col items-start gap-2 border-b pb-4">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Apply Now</h2>
          <p className="text-xs sm:text-sm text-gray-500">
            Submit your application below to apply for this position.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
            <FormField
              control={form.control}
              name="jobId"
              render={({ field }) => <input type="hidden" {...field} />}
            />

            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
              <p className="text-center sm:text-left text-gray-600 mb-2 sm:mb-0">
                Ready to apply? Click the button below to submit your application.
              </p>

              <Button
                type="submit"
                disabled={submitting}
                className="flex items-center justify-center gap-2 bg-watney px-6 py-2 text-white transition-colors duration-200 hover:bg-watney/90"
              >
                {submitting ? <BlinkingDots size="small" color="bg-white" /> : 'Apply Now'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    )}
  </div>
</div>

  );
}
