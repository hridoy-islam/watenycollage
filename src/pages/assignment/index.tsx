import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '@/lib/axios';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  FileText,
  MoveLeft,
  Eye,
  AlertCircle,
  CheckCircle,
  MessageSquare,
  Download,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';
import { useSelector } from 'react-redux';
import { BlinkingDots } from '@/components/shared/blinking-dots';
import { Badge } from '@/components/ui/badge';

// Interfaces
interface Assignment {
  _id: string;
  applicationId: string;
  unitId: string;
  studentId: string;
  assignmentName: string;
  submissions: Submission[];
  feedbacks: Feedback[];
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface Submission {
  _id: string;
  submitBy: string;
  files: string[];
  comment?: string;
  seen: boolean;
  status: string;
  createdAt: string;
}

interface Feedback {
  _id: string;
  submitBy: string;
  comment?: string;
  files: string[];
  seen: boolean;
  requireResubmit: boolean;
  createdAt: string;
}

interface CourseUnit {
  _id: string;
  title: string;
  unitReference: string;
  level: string;
  gls: string;
  credit: string;
}

interface ApplicationCourse {
  _id: string;
  courseId: {
    _id: string;
    name: string;
  };
  studentId: string;
  status: string;
  seen: boolean;
  refId: string;
  createdAt: string;
}

function AssignmentPage() {
  const { id: applicationId, studentId } = useParams();
  const { toast } = useToast();
  const navigate = useNavigate();

  // State
  const [applicant, setApplicant] = useState<ApplicationCourse | null>(null);
  const [courseUnits, setCourseUnits] = useState<CourseUnit[]>([]);
  const [assignmentsByUnit, setAssignmentsByUnit] = useState<
    Record<string, Assignment[]>
  >({});
  const [loading, setLoading] = useState(true);
  const [studentName, setStudentName] = useState<string>('');

  // Fetch applicant and course units
  const fetchApplicantAndUnits = async () => {
    try {
      setLoading(true);
      const appRes = await axiosInstance.get(
        `/application-course/${applicationId}`
      );
      const appData = appRes.data.data;
      setApplicant(appData);

      const res = await axiosInstance.get(`/users/${studentId}`);
      setStudentName(res.data.data.name || 'Unknown');

      // Fetch course units
      const unitsRes = await axiosInstance.get(`/course-unit`, {
        params: { courseId: appData.courseId._id, limit: 'all' }
      });
      const units = unitsRes.data.data.result || [];
      setCourseUnits(units);

      // Fetch assignments for each unit
      const assignmentsMap: Record<string, Assignment[]> = {};
      for (const unit of units) {
        const assignRes = await axiosInstance.get(`/assignment`, {
          params: { applicationId, unitId: unit._id, limit: 'all' }
        });
        assignmentsMap[unit._id] = assignRes.data.data.result || [];
      }
      setAssignmentsByUnit(assignmentsMap);
    } catch (err) {
      console.error('Error fetching data:', err);
      toast({
        title: 'Error',
        description: 'Failed to load assignments or course units.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Get latest submission date
  const getLatestSubmissionDate = (assignment: Assignment): string => {
    if (!assignment.submissions || assignment.submissions.length === 0) {
      return 'Not submitted';
    }

    const latestSubmission = assignment.submissions.reduce((latest, current) =>
      new Date(current.createdAt) > new Date(latest.createdAt)
        ? current
        : latest
    );

    return format(new Date(latestSubmission.createdAt), 'dd MMM yyyy, HH:mm');
  };

  useEffect(() => {
    if (applicationId) {
      fetchApplicantAndUnits();
    }
  }, [applicationId]);

  const sortedUnits = [...courseUnits].sort((a, b) => {
    const getUnitNumber = (title: string) => {
      const match = title.match(/Unit (\d+)/i);
      return match ? parseInt(match[1], 10) : Infinity; // Non-unit titles go to the end
    };
    return getUnitNumber(a.title) - getUnitNumber(b.title);
  });

  return (
    <div className="">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">
            {studentName}'s Assignment Submissions
          </h1>
          {applicant && (
            <p className="text-md font-medium">
              Course: {applicant?.courseId?.name}
            </p>
          )}
        </div>
        <Button
          variant="default"
          className="bg-watney text-white hover:bg-watney/90"
          size="sm"
          onClick={() => navigate(-1)}
        >
          <MoveLeft className="mr-2 h-4 w-4" /> Back
        </Button>
      </div>

      <div className="rounded-lg bg-white p-6 shadow-md">
        {loading ? (
          <div className="flex justify-center py-10">
            <BlinkingDots size="large" color="bg-watney" />
          </div>
        ) : courseUnits.length === 0 ? (
          <div className="py-10 text-center italic text-muted-foreground">
            No course units found.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Unit</TableHead>
                {/* <TableHead className=''>Detail</TableHead> */}

                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedUnits.map((unit) => {
                const unitAssignments = assignmentsByUnit[unit._id] || [];
                const submittedCount = unitAssignments.length;

                const latestAssignment =
                  unitAssignments.length > 0
                    ? unitAssignments.reduce((latest, current) =>
                        new Date(current.updatedAt) > new Date(latest.updatedAt)
                          ? current
                          : latest
                      )
                    : null;

                return (
                  <TableRow key={unit._id}>
                    <TableCell
                      className="cursor-pointer font-medium"
                      onClick={() => {
                        navigate(`unit-assignments/${unit._id}`, {});
                      }}
                    >
                      <div className="flex w-full items-center">
                        <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
                        {unit.title}
                      </div>
                    </TableCell>

                    {/* <TableCell className="font-medium">
                     
                      <div className=" ">
                        Ref: {unit.unitReference} | Level: {unit.level}
                      </div>
                    </TableCell> */}

                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {unitAssignments.length > 0 ? (
                          <>
                            <Button
                              size="sm"
                              variant="default"
                              className="bg-watney text-white hover:bg-watney/90"
                              onClick={() => {
                                navigate(`unit-assignments/${unit._id}`, {});
                              }}
                            >
                              <Eye className="mr-1 h-4 w-4" />
                              View
                            </Button>
                          </>
                        ) : (
                          <span className="text-sm italic text-muted-foreground">
                            No assignments
                          </span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}

export default AssignmentPage;
