/* eslint-disable no-unused-vars */
import { RadioGroupItem } from '@/components/ui/radio-group';
import { RadioGroup } from '@/components/ui/radio-group';
import type React from 'react';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '@/lib/axios';
import 'react-datepicker/dist/react-datepicker.css';
import { PDFDownloadLink } from '@react-pdf/renderer';

// Import Table Components
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import DatePicker from 'react-datepicker';
import { Download, MoveLeft, Pencil } from 'lucide-react';
import { BlinkingDots } from '@/components/shared/blinking-dots';

// ZOD IMPORTS
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/components/ui/use-toast';
import InterviewPDF from './components/interview-pdf';

interface User {
  title: string;
  firstName: string;
  initial: string;
  lastName: string;
}

interface Job {
  jobTitle: string;
}

interface AssessmentCriteria {
  id: string;
  name: string;
  description: string;
  managementReq: string;
  seniorSupportReq: string;
  supportWorkerReq: string;
}

const assessmentCriteria: AssessmentCriteria[] = [
  {
    id: 'values',
    name: '1. Values',
    description:
      'People that are honest, respectful and will work by our points of culture above.',
    managementReq: 'High',
    seniorSupportReq: 'High',
    supportWorkerReq: 'High'
  },
  {
    id: 'workEthic',
    name: '2. Work Ethic',
    description:
      'Team members who work hard and are proactive and do not just do things when told to.',
    managementReq: 'High',
    seniorSupportReq: 'High',
    supportWorkerReq: 'High'
  },
  {
    id: 'qualifications',
    name: '3. Qualifications',
    description:
      'Having the necessary qualifications to carry out their duties accordingly.',
    managementReq: 'RQF/QCF/NVQ4/RG N',
    seniorSupportReq: 'RQF/NVQ / QCF 3 Or equivalent',
    supportWorkerReq: 'Willing to Do RQF/NVQ / QCF 2'
  },
  {
    id: 'problemSolving',
    name: '4. Problem Solving',
    description:
      'Being diplomatic with service users, their family, team members and other care professionals, finding suitable resolutions in line with CQC and our policies and procedures.',
    managementReq: 'High (Dig deep with scenarios)',
    seniorSupportReq: 'Intermediate (Push further in scenarios)',
    supportWorkerReq: 'Basic'
  },
  {
    id: 'cqcKnowledge',
    name: '5. CQC Knowledge',
    description:
      'Having the required knowledge for the role so that decisions made are influenced by understanding CQC regulations.',
    managementReq: 'High (Dig deep with questions)',
    seniorSupportReq: 'Intermediate (Dig deeper with questions)',
    supportWorkerReq: 'Basic'
  },
  {
    id: 'experience',
    name: '6. Experience',
    description:
      'Having the necessary experience to carry out their duties accordingly',
    managementReq: '2 years team leading',
    seniorSupportReq: '2 years',
    supportWorkerReq: 'Less than 2 years'
  },
  {
    id: 'reportWriting',
    name: '7. Report Writing/I.C.T Skills',
    description:
      'Having the necessary skills to carry out their duties accordingly',
    managementReq: 'High',
    seniorSupportReq: 'Intermediate',
    supportWorkerReq: 'Basic'
  }
];

const interviewSchema = z.object({
  interviewDate: z.date({ message: 'Interview date is required' }),
  interviewerName: z.string().min(1, 'Interviewer name is required'),
  decision: z.enum(['reject', 'appointed', 'second-choice'], {
    message: 'Decision is required'
  }),
  decisionReason: z.string().min(0, 'Reason for decision is required'),
  candidateAdvised: z.enum(['yes', 'no'], {
    message: 'Candidate advised status is required'
  }),
  // Replace the existing assessments validation in your interviewSchema with this:

  assessments: z
    .record(
      z.string(),
      z.object({
        score: z
          .union([z.string(), z.number()])
          .transform((val) => {
            if (typeof val === 'string') {
              const trimmed = val.trim();
              if (trimmed === '') return undefined;
              const parsed = parseFloat(trimmed);
              return isNaN(parsed) ? undefined : parsed;
            }
            return val;
          })
          .refine((val) => typeof val === 'number' && !isNaN(val), {
            message: 'Score is required'
          })
          .refine((val) => val >= 0 && val <= 10, {
            message: 'Score must be between 0 and 10'
          }),
        comment: z.string().optional()
      })
    )
    .refine(
      (val) =>
        assessmentCriteria.every((criteria) => {
          const score = val[criteria.id]?.score;
          return typeof score === 'number' && !isNaN(score);
        }),
      {
        message: 'All assessment criteria must be completed (score required)'
      }
    )
});

type InterviewFormType = z.infer<typeof interviewSchema>;

export default function InterviewAssessmentPage() {
  const params = useParams();
  const { id, userId } = params; // jobId and candidateId
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [interviewId, setInterviewId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  // Initialize react-hook-form with Zod resolver
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors }
  } = useForm<InterviewFormType>({
    resolver: zodResolver(interviewSchema),
    defaultValues: {
      interviewDate: new Date(),
      interviewerName: '',
      decision: undefined,
      decisionReason: '',
      candidateAdvised: undefined,
      assessments: assessmentCriteria.reduce(
        (acc, c) => ({
          ...acc,
          [c.id]: { score: undefined, comment: '' } // ✅ undefined score
        }),
        {}
      )
    }
  });

  // Fetch user, job, and existing interview
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user
        const userResponse = await axiosInstance.get(`/users/${userId}`);
        setUser(userResponse.data.data);

        // Fetch job
        const jobResponse = await axiosInstance.get(`/application-job/${id}`);
        setJob(jobResponse.data.data);

        // Fetch existing interview by candidateId & jobId
        const interviewResponse = await axiosInstance.get(
          `/interview?candidateId=${userId}&jobId=${id}`
        );
        const interviews = interviewResponse.data?.data?.result;

        if (interviews && interviews.length > 0) {
          const interview = interviews[0];
          setInterviewId(interview._id);

          // Populate form fields
          setValue('interviewDate', new Date(interview.interviewDate));
          setValue('interviewerName', interview.interviewerName || '');
          setValue('decision', interview.decision || '');
          setValue('decisionReason', interview.decisionReason || '');
          setValue('candidateAdvised', interview.candidateAdvised || '');

          // Populate assessments
          const assessments: Record<
            string,
            { score: number; comment: string }
          > = {};
          Object.entries(interview.assessments || {}).forEach(
            ([key, entry]) => {
              assessments[key] = {
                score: entry.score ?? 0,
                comment: entry.comment || ''
              };
            }
          );
          setValue('assessments', assessments);

          // If interview exists, start in READ-ONLY mode
          setIsEditing(false);
        } else {
          // New interview → auto-enable editing
          setIsEditing(true);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load interview data.',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, userId, setValue, toast]);

  const handleCommentChange = (criteriaId: string, comment: string) => {
    setValue(`assessments.${criteriaId}.comment`, comment, {
      shouldValidate: true
    });
  };

  const onSubmit = async (data: InterviewFormType) => {
    const payload = {
      candidateId: userId,
      jobId: id,
      interviewDate: data.interviewDate.toISOString(),
      interviewerName: data.interviewerName.trim() || 'Unknown',
      assessments: data.assessments,
      decision: data.decision,
      decisionReason: data.decisionReason.trim(),
      candidateAdvised: data.candidateAdvised
    };

    try {
      let response;
      if (interviewId) {
        response = await axiosInstance.patch(
          `/interview/${interviewId}`,
          payload
        );
        toast({
          title: 'Success',
          description: 'Interview updated successfully!'
        });
      } else {
        response = await axiosInstance.post('/interview', payload);
        setInterviewId(response.data.data._id);
        toast({
          title: 'Success',
          description: 'Interview saved successfully!'
        });
      }

      // ✅ After save/update → disable all fields
      setIsEditing(false);
      navigate(-1);
    } catch (error: any) {
      console.error('Error saving interview:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || error.message,
        variant: 'destructive'
      });
    }
  };

  const handleDownloadPDF = () => {
    alert('Download PDF clicked');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <BlinkingDots size="large" color="bg-watney" />
      </div>
    );
  }

  const candidateName = user
    ? `${user.title} ${user.firstName} ${user.initial} ${user.lastName}`
    : 'N/A';
  const jobTitle = job?.jobId.jobTitle || 'N/A'; // ✅ Fixed typo: was job.jobId.jobTitle

  return (
    <div className="min-h-screen bg-gray-50">
      <Card className=" shadow-lg">
        <CardHeader className="space-y-4">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex flex-row items-center gap-3">
              <Button
                className="bg-watney text-white hover:bg-watney/90"
                size="sm"
                onClick={() => navigate(-1)}
              >
                <MoveLeft className="mr-1 h-4 w-4" />
                Back
              </Button>
              <CardTitle className="text-xl font-bold sm:text-2xl">
                Interview Assessment Form
              </CardTitle>
            </div>

            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              {/* <Button
                variant="outline"
                size="sm"
                className="w-full sm:w-auto"
                onClick={handleDownloadPDF}
              >
                <Download className="mr-1 h-4 w-4" />
                Download PDF
              </Button> */}

              <PDFDownloadLink
                document={
                  <InterviewPDF
                    candidateName={candidateName}
                    jobTitle={jobTitle}
                    interviewDate={watch('interviewDate') || new Date()}
                    interviewerName={watch('interviewerName') || ''}
                    assessments={watch('assessments') || {}}
                    decision={watch('decision') || ''}
                    decisionReason={watch('decisionReason') || ''}
                    candidateAdvised={watch('candidateAdvised') || ''}
                  />
                }
                fileName={`interview-assessment-${candidateName.replace(/\s+/g, '-')}.pdf`}
              >
                {({ blob, url, loading, error }) => {
                  if (error) {
                    console.error('PDF Generation Error:', error);
                    return (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full bg-red-500 text-white sm:w-auto"
                        disabled
                      >
                        <Download className="mr-1 h-4 w-4" />
                        Error Generating PDF
                      </Button>
                    );
                  }

                  if (loading) {
                    return (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full sm:w-auto"
                        disabled
                      >
                        <Download className="mr-1 h-4 w-4" />
                        Generating...
                      </Button>
                    );
                  }

                  return (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full bg-black text-white hover:bg-gray-800 sm:w-auto"
                    >
                      <Download className="mr-1 h-4 w-4" />
                      Download PDF
                    </Button>
                  );
                }}
              </PDFDownloadLink>
              {/* Edit Button: Only shown if interview exists AND not editing */}
              {interviewId && !isEditing && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="w-full bg-watney text-white hover:bg-watney/90 sm:w-auto"
                  onClick={() => setIsEditing(true)}
                >
                  <Pencil className="mr-1 h-4 w-4" />
                  Edit
                </Button>
              )}

              {/* Save Button: Only shown if NO interview exists (i.e., new) AND we are editing (which we always are for new) */}
              {!interviewId && (
                <Button
                  type="submit"
                  size="sm"
                  className="w-full bg-watney text-white hover:bg-watney/90 sm:w-auto"
                  onClick={handleSubmit(onSubmit)}
                >
                  Save
                </Button>
              )}

              {/* Update Button: Only shown if interview EXISTS and we ARE editing */}
              {interviewId && isEditing && (
                <Button
                  type="submit"
                  size="sm"
                  className="w-full bg-watney text-white hover:bg-watney/90 sm:w-auto"
                  onClick={handleSubmit(onSubmit)}
                >
                  Update
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Candidate & Job Info */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {/* Candidate Name */}
              <div className="space-y-1">
                <Label
                  htmlFor="candidate-name"
                  className="text-sm font-semibold"
                >
                  Name of candidate:
                </Label>
                <p id="candidate-name" className="text-base font-medium">
                  {candidateName}
                </p>
              </div>

              {/* Job Title */}
              <div className="space-y-1">
                <Label htmlFor="job-title" className="text-sm font-semibold">
                  Post:
                </Label>
                <p id="job-title" className="text-base font-medium">
                  {jobTitle}
                </p>
              </div>

              {/* Interview Date */}
              <div className="space-y-1">
                <Label
                  htmlFor="interview-date"
                  className="text-sm font-semibold"
                >
                  Date and time:
                </Label>
                <div className="mt-1">
                  <DatePicker
                    id="interview-date"
                    selected={watch('interviewDate')}
                    onChange={(date: Date | null) => {
                      if (date)
                        setValue('interviewDate', date, {
                          shouldValidate: true
                        });
                    }}
                    dateFormat="dd-MM-yyyy"
                    className={`w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      !isEditing ? 'cursor-not-allowed bg-gray-100' : ''
                    }`}
                    placeholderText="Select interview date"
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select"
                    wrapperClassName="w-full"
                    disabled={!isEditing} // ✅ Disable if not editing
                  />
                </div>
                {errors.interviewDate && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.interviewDate.message}
                  </p>
                )}
              </div>
            </div>

            {/* Assessment Table - Scrollable on Mobile */}
            <div className="overflow-x-auto rounded-lg border border-gray-300">
              <Table className="min-w-full">
                <TableHeader>
                  {/* Row 1: Score Guide */}
                  <TableRow className="bg-gray-50 text-xs">
                    <TableHead className="w-1/4 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider md:w-1/5"></TableHead>
                    <TableHead className="w-1/8 px-3 py-2 text-center text-xs font-semibold uppercase tracking-wider">
                      High
                      <br />
                      8-9
                    </TableHead>
                    <TableHead className="w-1/8 px-3 py-1 text-center font-medium">
                      Intermediate
                      <br />
                      4-7
                    </TableHead>
                    <TableHead className="w-1/8 px-3 py-1 text-center font-medium">
                      Poor
                      <br />
                      0-3
                    </TableHead>
                    <TableHead className="w-1/6 px-3 py-1 text-center font-medium"></TableHead>
                    <TableHead className="w-1/3 px-3 py-1 text-left font-medium md:w-1/2"></TableHead>
                  </TableRow>

                  {/* Original Header Row */}
                  <TableRow className="bg-gray-100">
                    <TableHead className="w-1/4 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider md:w-1/5">
                      Person specification requirements
                    </TableHead>
                    <TableHead className="w-1/8 px-3 py-2 text-center text-xs font-semibold uppercase tracking-wider">
                      Management Requirement
                    </TableHead>
                    <TableHead className="w-1/8 px-3 py-2 text-center text-xs font-semibold uppercase tracking-wider">
                      Senior Support Requirement
                    </TableHead>
                    <TableHead className="w-1/8 px-3 py-2 text-center text-xs font-semibold uppercase tracking-wider">
                      Support Worker Requirement
                    </TableHead>
                    <TableHead className="w-1/6 px-3 py-2 text-center text-xs font-semibold uppercase tracking-wider">
                      Panel Assessment
                      <br className="hidden md:block" />
                      out of 10
                    </TableHead>
                    <TableHead className="w-1/3 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider md:w-1/2">
                      Comments Justifying Assessment
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assessmentCriteria.map((criteria) => (
                    <TableRow
                      key={criteria.id}
                      className="border-b border-gray-100"
                    >
                      <TableCell className="px-3 py-3">
                        <div className="text-sm font-semibold">
                          {criteria.name}
                        </div>
                        <div className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                          {criteria.description}
                        </div>
                      </TableCell>
                      <TableCell className="px-3 py-3 text-center text-xs">
                        {criteria.managementReq}
                      </TableCell>
                      <TableCell className="px-3 py-3 text-center text-xs">
                        {criteria.seniorSupportReq}
                      </TableCell>
                      <TableCell className="px-3 py-3 text-center text-xs">
                        {criteria.supportWorkerReq}
                      </TableCell>
                      <TableCell className="px-3 py-3 text-center">
                        <Input
                          type="text"
                          inputMode="decimal"
                          step="0.1"
                          min="0"
                          max="10"
                          placeholder="0-10"
                          className={`h-8 w-full px-2 text-center text-xs ${
                            !isEditing ? 'cursor-not-allowed bg-gray-100' : ''
                          }`}
                          disabled={!isEditing}
                          {...register(`assessments.${criteria.id}.score`)}
                        />
                        {errors.assessments?.[criteria.id]?.score?.message && (
                          <p className="mt-1 text-xs text-red-500">
                            {errors.assessments[criteria.id].score.message}
                          </p>
                        )}
                      </TableCell>
                      <TableCell className="px-3 py-3">
                        <Textarea
                          placeholder="Enter assessment comments... (optional)"
                          value={
                            watch(`assessments.${criteria.id}.comment`) || ''
                          }
                          onChange={(e) =>
                            handleCommentChange(criteria.id, e.target.value)
                          }
                          className={`min-h-[60px] border-gray-300 p-2 text-xs ${
                            !isEditing ? 'cursor-not-allowed bg-gray-100' : ''
                          }`}
                          rows={3}
                          disabled={!isEditing} // ✅ Disable if not editing
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {errors.assessments &&
                !Object.keys(errors.assessments).length && (
                  <p className="mt-4 text-xs text-red-500">
                    {errors.assessments.message}
                  </p>
                )}
            </div>

            {/* Decision Section - Stack on Mobile */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Left Column: Decision & Reason */}
              <div className="space-y-6 rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                <div>
                  <Label className="mb-2 block text-sm font-semibold text-gray-700">
                    Decision
                  </Label>
                  <RadioGroup
                    value={watch('decision')}
                    onValueChange={(value) =>
                      setValue('decision', value as any, {
                        shouldValidate: true
                      })
                    }
                    className="space-y-2"
                    disabled={!isEditing} // ✅ Disable if not editing
                  >
                    {['reject', 'appointed', 'second-choice'].map((option) => (
                      <div
                        key={option}
                        className="flex cursor-pointer items-center space-x-3"
                      >
                        <RadioGroupItem
                          value={option}
                          id={option}
                          className="h-4 w-4 border-gray-400"
                          disabled={!isEditing}
                        />
                        <Label
                          htmlFor={option}
                          className={`text-sm font-medium text-gray-600 ${
                            !isEditing ? 'text-gray-400' : ''
                          }`}
                        >
                          {option === 'reject'
                            ? 'Reject'
                            : option === 'appointed'
                              ? 'Appointed'
                              : 'Held as Second Choice'}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                  {errors.decision && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.decision.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label
                    htmlFor="reason"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Reason
                  </Label>
                  <Textarea
                    id="reason"
                    value={watch('decisionReason') || ''}
                    onChange={(e) =>
                      setValue('decisionReason', e.target.value, {
                        shouldValidate: true
                      })
                    }
                    placeholder="Provide the reason for your decision..."
                    className={`mt-2 rounded-md border-gray-300 p-3 text-sm focus:border-blue-500 focus:ring-blue-500 ${
                      !isEditing ? 'cursor-not-allowed bg-gray-100' : ''
                    }`}
                    rows={4}
                    disabled={!isEditing}
                  />
                  {errors.decisionReason && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.decisionReason.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Right Column: Advised, Name */}
              <div className="space-y-6 rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                <div>
                  <Label className="mb-2 block text-sm font-semibold text-gray-700">
                    Candidate Advised of Decision Verbally
                  </Label>
                  <RadioGroup
                    value={watch('candidateAdvised')}
                    onValueChange={(value) =>
                      setValue('candidateAdvised', value as any, {
                        shouldValidate: true
                      })
                    }
                    className="space-y-2"
                    disabled={!isEditing}
                  >
                    {['yes', 'no'].map((option) => (
                      <div
                        key={option}
                        className="flex cursor-pointer items-center space-x-3"
                      >
                        <RadioGroupItem
                          value={option}
                          id={`advised-${option}`}
                          className="h-4 w-4 border-gray-400"
                          disabled={!isEditing}
                        />
                        <Label
                          htmlFor={`advised-${option}`}
                          className={`text-sm font-medium text-gray-600 ${
                            !isEditing ? 'text-gray-400' : ''
                          }`}
                        >
                          {option === 'yes' ? 'Yes' : 'No'}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                  {errors.candidateAdvised && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.candidateAdvised.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label
                    htmlFor="interviewer-name"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Interviewer Name
                  </Label>
                  <Input
                    id="interviewer-name"
                    value={watch('interviewerName') || ''}
                    onChange={(e) =>
                      setValue('interviewerName', e.target.value, {
                        shouldValidate: true
                      })
                    }
                    placeholder="Enter your name"
                    className={`mt-2 rounded-md border-gray-300 p-3 text-sm focus:border-blue-500 focus:ring-blue-500 ${
                      !isEditing ? 'cursor-not-allowed bg-gray-100' : ''
                    }`}
                    disabled={!isEditing}
                  />
                  {errors.interviewerName && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.interviewerName.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Global Error (if any) */}
            {errors._general && (
              <div className="rounded-md border border-red-200 bg-red-50 p-4">
                <p className="text-sm text-red-600">
                  {errors._general.message}
                </p>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
