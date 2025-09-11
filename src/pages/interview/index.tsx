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

export default function InterviewAssessmentPage() {
  const params = useParams();
  const { id, userId } = params;
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [assessmentScores, setAssessmentScores] = useState<
    Record<string, string>
  >({});
  const [comments, setComments] = useState<Record<string, string>>({});
  const [decision, setDecision] = useState<string>('');
  const [decisionReason, setDecisionReason] = useState<string>('');
  const [candidateAdvised, setCandidateAdvised] = useState<string>('');
  const [interviewerName, setInterviewerName] = useState<string>('');
  const [interviewerSign, setInterviewerSign] = useState<string>('');
  const [interviewDate, setInterviewDate] = useState<Date>(new Date());
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user data
        const userResponse = await axiosInstance.get(`/users/${userId}`);
        setUser(userResponse.data.data);

        // Fetch job data
        const jobResponse = await axiosInstance.get(`/application-job/${id}`);
        setJob(jobResponse.data.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, userId]);

  const handleScoreChange = (criteriaId: string, score: string) => {
    setAssessmentScores((prev) => ({
      ...prev,
      [criteriaId]: score
    }));
  };

  const handleCommentChange = (criteriaId: string, comment: string) => {
    setComments((prev) => ({
      ...prev,
      [criteriaId]: comment
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log({
      assessmentScores,
      comments,
      decision,
      decisionReason,
      candidateAdvised,
      interviewerName,
      interviewerSign
    });
  };

  const handleDownloadPDF = () => {
    // TODO: Implement PDF generation
    alert('Download PDF clicked');
  };

  const [isEditing, setIsEditing] = useState(false);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // Save logic here
    console.log({
      assessmentScores,
      comments,
      decision,
      decisionReason,
      candidateAdvised,
      interviewerName,
      interviewerSign
    });
    setIsEditing(false); // Hide Save button and go back to read-only
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <BlinkingDots size="large" color="bg-watney" />
      </div>
    );
  }

  const candidateName = user
    ? `${user.title} ${user.firstName} ${user.initial} ${user.lastName}`
    : 'N/A';
  const jobTitle = job?.jobId?.jobTitle || 'N/A';

  return (
    <div className="">
      <Card>
        <CardHeader>
          <div className="flex flex-row items-center justify-between">
            <div className="flex flex-row items-center gap-4">
              <Button
                className="bg-watney text-white hover:bg-watney/90"
                size="sm"
                onClick={() => navigate(-1)}
              >
                <MoveLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <CardTitle className="text-2xl font-bold">
                Interview Assessment Form
              </CardTitle>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </Button>
              {!isEditing ? (
                <Button
                  variant="default"
                  className="bg-watney text-white hover:bg-watney/90"
                  size="sm"
                  onClick={handleEdit}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              ) : (
                <Button
                  type="submit"
                  size="sm"
                  className="bg-watney text-white hover:bg-watney/90"
                  onClick={handleSave}
                >
                  Save
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-4 rounded-lg md:grid-cols-3">
              {/* Candidate Name */}
              <div>
                <Label htmlFor="candidate-name" className="font-semibold">
                  Name of candidate:
                </Label>
                <p id="candidate-name" className="font-medium">
                  {candidateName}
                </p>
              </div>
              <div>
                <Label htmlFor="job-title" className="font-semibold">
                  Post:
                </Label>
                <p id="job-title" className="font-medium">
                  {jobTitle}
                </p>
              </div>
              {/* Interview Date (Date Only) */}
              <div>
                <Label htmlFor="interview-date" className="font-semibold">
                  Date and time:
                </Label>
                <div className="mt-1">
                  <DatePicker
                    id="interview-date"
                    selected={interviewDate}
                    onChange={(date: Date | null) => {
                      if (date) {
                        setInterviewDate(date);
                      }
                    }}
                    dateFormat="MMMM d, yyyy"
                    className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholderText="Select interview date"
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select"
                    wrapperClassName="w-full"
                  />
                </div>
              </div>

              {/* Post / Job Title */}
            </div>

            {/* Assessment Table */}
            <div className="overflow-x-auto rounded-md border border-gray-300">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[30%]">
                      Person specification requirements
                    </TableHead>
                    <TableHead className="w-[8%] text-center">
                      Management
                    </TableHead>
                    <TableHead className="w-[8%] text-center">
                      Senior Support
                    </TableHead>
                    <TableHead className="w-[8%] text-center">
                      Support Worker
                    </TableHead>
                    <TableHead className="w-[11%] text-center">
                      Panel Assessment out of 10
                    </TableHead>
                    <TableHead className="w-[35%]">
                      Comments Justifying Assessment
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assessmentCriteria.map((criteria) => (
                    <TableRow key={criteria.id}>
                      <TableCell>
                        <div className="text-sm font-semibold">
                          {criteria.name}
                        </div>
                        <div className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                          {criteria.description}
                        </div>
                      </TableCell>
                      <TableCell className="text-center text-xs">
                        {criteria.managementReq}
                      </TableCell>
                      <TableCell className="text-center text-xs">
                        {criteria.seniorSupportReq}
                      </TableCell>
                      <TableCell className="text-center text-xs">
                        {criteria.supportWorkerReq}
                      </TableCell>
                      <TableCell className="text-center">
                        <Input
                          type="number"
                          min="0"
                          max="10"
                          placeholder="0-10"
                          className="h-8 w-full  text-center"
                          value={assessmentScores[criteria.id] || ''}
                          onChange={(e) =>
                            handleScoreChange(criteria.id, e.target.value)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Textarea
                          placeholder="Enter assessment comments..."
                          value={comments[criteria.id] || ''}
                          onChange={(e) =>
                            handleCommentChange(criteria.id, e.target.value)
                          }
                          className="min-h-[60px] border-gray-300 text-xs"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Decision Section */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Left Column */}
              <div className="space-y-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                {/* Decision */}
                <div>
                  <Label className="font-semibold text-gray-700">
                    Decision
                  </Label>
                  <RadioGroup
                    value={decision}
                    onValueChange={setDecision}
                    className="mt-3 space-y-3"
                  >
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem
                        value="reject"
                        id="reject"
                        className="border-gray-400"
                      />
                      <Label
                        htmlFor="reject"
                        className="font-medium text-gray-600"
                      >
                        Reject
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem
                        value="appointed"
                        id="appointed"
                        className="border-gray-400"
                      />
                      <Label
                        htmlFor="appointed"
                        className="font-medium text-gray-600"
                      >
                        Appointed
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem
                        value="second-choice"
                        id="second-choice"
                        className="border-gray-400"
                      />
                      <Label
                        htmlFor="second-choice"
                        className="font-medium text-gray-600"
                      >
                        Held as Second Choice
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Reason */}
                <div>
                  <Label
                    htmlFor="reason"
                    className="font-semibold text-gray-700"
                  >
                    Reason
                  </Label>
                  <Textarea
                    id="reason"
                    value={decisionReason}
                    onChange={(e) => setDecisionReason(e.target.value)}
                    placeholder="Provide the reason for your decision..."
                    className="mt-2 rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    rows={3}
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                <Label className="font-semibold text-gray-700">
                  Candidate Advised of Decision Verbally
                </Label>
                <RadioGroup
                  value={candidateAdvised}
                  onValueChange={setCandidateAdvised}
                  className="mt-3 space-y-3"
                >
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="yes" id="advised-yes" />
                    <Label
                      htmlFor="advised-yes"
                      className="font-medium text-gray-600"
                    >
                      Yes
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="no" id="advised-no" />
                    <Label
                      htmlFor="advised-no"
                      className="font-medium text-gray-600"
                    >
                      No
                    </Label>
                  </div>
                </RadioGroup>

                {/* Interviewer Name */}
                <div>
                  <Label
                    htmlFor="interviewer-name"
                    className="font-semibold text-gray-700"
                  >
                    Interviewer Name
                  </Label>
                  <Input
                    id="interviewer-name"
                    value={interviewerName}
                    onChange={(e) => setInterviewerName(e.target.value)}
                    placeholder="Enter your name"
                    className="mt-2 rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
