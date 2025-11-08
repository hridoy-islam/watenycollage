import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import axiosInstance from '@/lib/axios';
import Select, { SingleValue } from 'react-select';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { BlinkingDots } from '@/components/shared/blinking-dots';
import { useSelector } from 'react-redux';

// Types
type Course = { _id: string; name: string; courseCode: string };
type Term = { _id: string; termName: string };
type Unit = { _id: string; unitName: string; title?: string };
type Assignment = {
  _id: string;
  title: string;
  type: string;
  deadline?: string;
};
type Student = {
  _id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  studentId?: string;
};

type Feedback = {
  submitBy?: {
    firstName?: string;
    lastName?: string;
    name?: string;
  };
};

type ReportItem = {
  student?: Student;
  studentId?: Student;
  feedbacks?: Feedback[];
  courseId?: Course;
  intakeId?: any;
  termName?: string;
  unitName?: string;
  applicationId?: string;
  createdAt?: string;
  updatedAt?: string;
  status?: string;
  refId?: string;
  seen?: boolean;
  __v?: number;
};

// React Select Option Type
type SelectOption = { value: string; label: string };

type ReportData = ReportItem[];

export default function AssignmentReportsPage() {
  const [reportType, setReportType] = useState<SelectOption | null>(null);
  const [courses, setCourses] = useState<SelectOption[]>([]);
  const [terms, setTerms] = useState<SelectOption[]>([]);
  const [units, setUnits] = useState<SelectOption[]>([]);
  const [assignments, setAssignments] = useState<SelectOption[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<SelectOption | null>(
    null
  );
  const [selectedTerm, setSelectedTerm] = useState<SelectOption | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<SelectOption | null>(null);
  const [selectedAssignment, setSelectedAssignment] =
    useState<SelectOption | null>(null);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [meta, setMeta] = useState<any>(null);
  const [activeReportType, setActiveReportType] = useState<SelectOption | null>(
    null
  );
  const [reportContext, setReportContext] = useState<{
    course: SelectOption | null;
    term: SelectOption | null;
    unit: SelectOption | null;
    assignment: SelectOption | null;
  } | null>(null);

  const user = useSelector((state: any) => state.auth.user); // Get user from Redux state

  // Report type options
  const reportTypeOptions = [
    { value: '1', label: 'Students Who Submitted Assignments' },
    { value: '2', label: 'Students With Teacher Feedback' },
    { value: '3', label: 'Students Who Did Not Submit' },
    { value: '4', label: 'Students Without Feedback' }
  ];

  // Fetch courses and terms on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user?.role === 'admin') {
          // Admin: Fetch all courses
          const [coursesRes, termsRes] = await Promise.all([
            axiosInstance.get('/courses', {
              params: { status: 1, limit: 'all' }
            }),
            axiosInstance.get('/terms', { params: { limit: 'all' } })
          ]);

          setCourses(
            coursesRes.data.data.result.map((c: Course) => ({
              value: c._id,
              label: `${c.name}`
            }))
          );

          setTerms(
            termsRes.data.data.result.map((t: Term) => ({
              value: t._id,
              label: t.termName
            }))
          );
        } else if (user?.role === 'teacher') {
          // Teacher: Fetch only assigned courses
          const [teacherCoursesRes, termsRes] = await Promise.all([
            axiosInstance.get('/teacher-courses', {
              params: { teacherId: user._id, limit: 'all' }
            }),
          
          ]);

          setCourses(
            teacherCoursesRes.data.data.result.map((c: Course) => ({
              value: c.courseId?._id,
              label: `${c.courseId?.name}`
            }))
          );

          setTerms(
            teacherCoursesRes.data.data.result.map((t: Term) => ({
              value: t.termId?._id,
              label: t.termId?.termName
            }))
          );
        }
      } catch (err) {
        setError('Failed to load courses/terms');
        console.error(err);
      }
    };
    fetchData();
  }, [user]); // Add user as dependency

  // Fetch units when course/term changes
  useEffect(() => {
    if (!selectedCourse?.value || !selectedTerm?.value) {
      setUnits([]);
      setSelectedUnit(null);
      setAssignments([]);
      setSelectedAssignment(null);
      return;
    }

    const fetchUnits = async () => {
      try {
        const res = await axiosInstance.get('/course-unit', {
          params: {
            courseId: selectedCourse.value,
            limit: 'all'
          }
        });

        // Sort the units by serial number before mapping
        const sortedUnits = sortBySerialNumber(res.data.data.result);

        setUnits(
          sortedUnits.map((u: Unit) => ({
            value: u._id,
            label: u.title || u.unitName
          }))
        );
      } catch (err) {
        setError('Failed to load units');
        console.error(err);
      }
    };

    fetchUnits();
  }, [selectedCourse, selectedTerm]);

  // Fetch assignments when unit changes
  useEffect(() => {
    if (!selectedUnit?.value) {
      setAssignments([]);
      setSelectedAssignment(null);
      return;
    }

    const fetchAssignments = async () => {
      try {
        const res = await axiosInstance.get(
          `/unit-material?unitId=${selectedUnit.value}&limit=all`
        );

        // Extract assignments from the response
        const unitMaterials = res.data.data.result;
        const allAssignments: Assignment[] = [];

        unitMaterials.forEach((material: any) => {
          if (material.assignments && material.assignments.length > 0) {
            material.assignments.forEach((assignment: Assignment) => {
              if (assignment.type === 'assignment') {
                allAssignments.push({
                  _id: assignment._id,
                  title: assignment.title,
                  type: assignment.type
                });
              }
            });
          }
        });

        setAssignments(
          allAssignments.map((a: Assignment) => ({
            value: a._id,
            label: a.deadline
              ? `${a.title} (Deadline: ${new Date(a.deadline).toLocaleDateString()})`
              : a.title
          }))
        );
      } catch (err) {
        setError('Failed to load assignments');
        console.error(err);
      }
    };

    fetchAssignments();
  }, [selectedUnit]);

  const handleGenerateReport = async () => {
    if (
      !reportType ||
      !selectedCourse ||
      !selectedTerm ||
      !selectedUnit ||
      !selectedAssignment
    ) {
      toast({
        title: 'Please select all fields',
        className: 'bg-destructive text-white'
      });
      return;
    }

    setLoading(true);
    setError(null);
    setReportData(null); // Clear previous report data before fetching

    try {
      let endpoint = '';
      const courseId = selectedCourse.value;
      const termId = selectedTerm.value;
      const unitId = selectedUnit.value;
      const assignmentId = selectedAssignment.value;

      switch (reportType.value) {
        case '1':
          endpoint = `/assignment/submitted/${courseId}/${termId}/${unitId}/${assignmentId}?limit=all`;
          break;
        case '2':
          endpoint = `/assignment/with-feedback/${courseId}/${termId}/${unitId}/${assignmentId}?limit=all`;
          break;
        case '3':
          endpoint = `/assignment/not-submitted/${courseId}/${termId}/${unitId}/${assignmentId}?limit=all`;
          break;
        case '4':
          endpoint = `/assignment/no-feedback/${courseId}/${termId}/${unitId}/${assignmentId}?limit=all`;
          break;
        default:
          throw new Error('Invalid report type');
      }

      const res = await axiosInstance.get(endpoint);
      setReportData(res.data.data.result);
      setMeta(res.data.data.meta || null);
      setActiveReportType(reportType);
      setReportContext({
        course: selectedCourse,
        term: selectedTerm,
        unit: selectedUnit,
        assignment: selectedAssignment
      });
    } catch (err) {
      toast({
        title: 'Failed to generate report',
        className: 'bg-destructive text-white'
      });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Custom styles for React Select
  const selectStyles = {
    control: (base: any) => ({
      ...base,
      minHeight: '40px',
      fontSize: '0.875rem'
    }),
    menuPortal: (base: any) => ({ ...base, zIndex: 9999 })
  };

  const sortBySerialNumber = (resources) => {
    return resources.sort((a, b) => {
      const getSerialNumber = (text: string) => {
        // Extract first number found in the text (e.g., LO1 → 1, PART12 → 12)
        const match = text?.match(/(\d+)/);
        return match ? parseInt(match[1], 10) : null;
      };

      const aSerial = getSerialNumber(a.learningOutcomes || a.title || '');
      const bSerial = getSerialNumber(b.learningOutcomes || b.title || '');

      if (aSerial !== null && bSerial !== null) return aSerial - bSerial;

      if (aSerial !== null) return -1;

      if (bSerial !== null) return 1;

      return 0;
    });
  };

  const renderMetaInfo = () => {
    if (!meta) return null;

    const rows: { label: string; value: number }[] = [];

    switch (activeReportType?.value) {
      case '1': // Submitted
        rows.push(
          { label: 'Total Students', value: meta.totalStudents },
          { label: 'Total Submissions', value: meta.totalSubmitted || 0 }
        );
        break;

      case '2': // With Feedback
        rows.push(
          { label: 'Total Students', value: meta.totalStudents },
          {
            label: 'Total Submissions',
            value: meta.totalAssignmentSubmission || 0
          },
          { label: 'Total Feedback Given', value: meta.totalFeedback || 0 },
          { label: 'Total Without Feedback', value: meta.totalNoFeedback || 0 }
        );
        break;

      case '3': // Not Submitted
        rows.push(
          { label: 'Total Students', value: meta.totalStudents },
          { label: 'Not Submitted', value: meta.totalNotSubmitted || 0 }
        );
        break;

      case '4': // No Feedback
        rows.push(
          { label: 'Total Students', value: meta.totalStudents },
          {
            label: 'Total Submissions',
            value: meta.totalAssignmentSubmission || 0
          },
          { label: 'Total Feedback Given', value: meta.totalFeedback || 0 },
          { label: 'Total Without Feedback', value: meta.totalNoFeedback || 0 }
        );
        break;
    }

    return (
      <div className=" flex flex-row items-center gap-4">
        {rows.map((item, index) => (
          <div
            key={index}
            className=" flex flex-row items-center gap-4 text-center text-lg"
          >
            <p className="font-medium ">{item.label}</p>
            <p className="text-2xl font-bold text-destructive">{item.value}</p>
          </div>
        ))}
      </div>
    );
  };

  const renderFilters = () => (
    <Card className="mb-6">
      <CardContent className="space-y-4 pt-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
          {/* Report Type */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Report Type</label>
            <Select
              options={reportTypeOptions}
              value={reportType}
              onChange={(option: SingleValue<SelectOption>) => {
                setReportType(option);
                // ❌ Don't clear report data when switching type
              }}
              placeholder="Select report type"
              styles={selectStyles}
              menuPortalTarget={document.body}
            />
          </div>

          {/* Course */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Course</label>
            <Select
              options={courses}
              value={selectedCourse}
              onChange={(option: SingleValue<SelectOption>) => {
                setSelectedCourse(option);

                // ✅ Reset dependent dropdowns only (don't touch table)
                setSelectedUnit(null);
                setUnits([]);
                setSelectedAssignment(null);
              }}
              placeholder={
                courses.length === 0 
                  ? user?.role === 'teacher' 
                    ? 'No assigned courses found' 
                    : 'No courses available'
                  : 'Select course'
              }
              styles={selectStyles}
              menuPortalTarget={document.body}
              isDisabled={!reportType || courses.length === 0}
            />
            {user?.role === 'teacher' && courses.length === 0 && (
              <p className="text-xs text-muted-foreground">
                You don't have any assigned courses. Please contact administrator.
              </p>
            )}
          </div>

          {/* Term */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Term</label>
            <Select
              options={terms}
              value={selectedTerm}
              onChange={(option: SingleValue<SelectOption>) => {
                setSelectedTerm(option);

                // ✅ Only reset dependent dropdowns
                setSelectedUnit(null);
                setUnits([]);
                setSelectedAssignment(null);
                setAssignments([]);
              }}
              placeholder="Select term"
              styles={selectStyles}
              menuPortalTarget={document.body}
              isDisabled={!reportType}
            />
          </div>

          {/* Unit */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Unit</label>
            <Select
              options={units}
              value={selectedUnit}
              onChange={(option: SingleValue<SelectOption>) => {
                setSelectedUnit(option);

                // ✅ Reset only dependent dropdowns (don't clear report data)
                setSelectedAssignment(null);
                setAssignments([]);
              }}
              placeholder={
                !selectedCourse || !selectedTerm
                  ? 'Select course & term first'
                  : 'Select unit'
              }
              isDisabled={!units.length}
              styles={selectStyles}
              menuPortalTarget={document.body}
            />
          </div>

          {/* Assignment */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Assignment</label>
            <Select
              options={assignments}
              value={selectedAssignment}
              onChange={(option: SingleValue<SelectOption>) => {
                setSelectedAssignment(option);
                // ✅ Do not clear report data
              }}
              placeholder={
                !selectedUnit
                  ? 'Select unit first'
                  : assignments.length === 0
                    ? 'No assignments found'
                    : 'Select assignment'
              }
              isDisabled={!assignments.length}
              styles={selectStyles}
              menuPortalTarget={document.body}
            />
          </div>
        </div>

        {/* Generate Report Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleGenerateReport}
            disabled={
              !reportType ||
              loading ||
              !selectedCourse ||
              !selectedTerm ||
              !selectedUnit ||
              !selectedAssignment
            }
            className="h-10 bg-watney text-white hover:bg-watney/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Generating...' : 'Generate Report'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderReportTable = () => {
    if (loading) {
      return (
        <div className="flex justify-center py-10">
          <BlinkingDots size="large" color="bg-watney" />
        </div>
      );
    }

    if (!reportData) return null;

    const handleViewAssignment = (item: ReportItem) => {
      const studentId = item?.student?._id || item?.studentId?._id;
      const unitId = item?.unit?._id || item?.unitId?._id;
      const applicationId = item?.applicationId?._id;

      const url = `/dashboard/student-applications/${applicationId}/assignment/${studentId}/unit-assignments/${unitId}`;

      // Open in a new browser tab
      window.open(url, '_blank');
    };

    const handleViewStudentAllAssignment = (item: ReportItem) => {
      const studentId = item?.student?._id || item?.studentId?._id;
      const applicationId = item?.applicationId?._id;

      const url = `/dashboard/student-applications/${applicationId}/assignment/${studentId}`;

      // Open in a new browser tab
      window.open(url, '_blank');
    };

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex flex-row items-center justify-between">
            <div>
              {activeReportType?.value === '1' &&
                'Students Who Submitted Assignments'}
              {activeReportType?.value === '2' &&
                'Students With Teacher Feedback'}
              {activeReportType?.value === '3' && 'Students Who Did Not Submit'}
              {activeReportType?.value === '4' && 'Students Without Feedback'}
            </div>
            {renderMetaInfo()}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {reportData.length === 0 ? (
            <p className="py-4 text-center text-muted-foreground">
              No students found for this report
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Term</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Assignment</TableHead>
                  {(activeReportType?.value === '1' ||
                    activeReportType?.value === '3') && (
                    <TableHead className="text-right">
                      Assignment Submitted
                    </TableHead>
                  )}
                  {activeReportType?.value === '2' && (
                    <TableHead className="text-right">Teacher Name</TableHead>
                  )}
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportData.map((item, index) => {
                  // Choose the student object
                  const student = item?.student || item.studentId;

                  // Determine status
                  const status =
                    activeReportType?.value === '1'
                      ? 'Yes'
                      : activeReportType?.value === '3'
                        ? 'No'
                        : '';

                  // Get latest teacher feedback name (if any)
                  let teacherName = 'N/A';
                  if (
                    activeReportType?.value === '2' &&
                    item.feedbacks?.length > 0
                  ) {
                    const latestFeedback =
                      item.feedbacks[item.feedbacks.length - 1];
                    teacherName = latestFeedback.submitBy?.firstName
                      ? `${latestFeedback.submitBy.firstName} ${latestFeedback.submitBy.lastName || ''}`.trim()
                      : latestFeedback.submitBy?.name || 'N/A';
                  }

                  // Get course, term, and unit names
                  const courseName =
                    item.applicationId?.courseId?.name || 'N/A';
                  const termName =
                    item.applicationId?.intakeId?.termName || 'N/A';
                  const unitName =
                    item.unit?.title || item.unitId?.title || 'N/A';

                  // Get assignment name
                  const assignmentName = reportContext?.assignment
                    ? reportContext.assignment.label
                    : 'N/A';
                  return (
                    <TableRow key={item._id || student?._id || index}>
                      <TableCell className='hover:cursor-pointer' onClick={()=>handleViewStudentAllAssignment(item)}>
                        <h1 className="font-semibold">
                          {student?.name ||
                            `${student?.firstName || ''} ${student?.lastName || ''}`.trim() ||
                            'Unknown Student'}
                        </h1>
                        <h2 className="text-xs font-normal">
                          {student?.email}
                        </h2>
                      </TableCell>

                      <TableCell className='hover:cursor-pointer' onClick={()=>handleViewStudentAllAssignment(item)}>{courseName}</TableCell>
                      <TableCell className='hover:cursor-pointer' onClick={()=>handleViewStudentAllAssignment(item)}>{termName}</TableCell>
                      <TableCell className='hover:cursor-pointer' onClick={()=>handleViewStudentAllAssignment(item)}>{unitName}</TableCell>
                      <TableCell>{assignmentName}</TableCell>

                      {(activeReportType?.value === '1' ||
                        activeReportType?.value === '3') && (
                        <TableCell className="text-center">{status}</TableCell>
                      )}
                      {activeReportType?.value === '2' && (
                        <TableCell className="text-right">
                          {teacherName}
                        </TableCell>
                      )}

                      <TableCell className="text-right">
                        <Button
                          className="bg-watney text-white hover:bg-watney"
                          onClick={() => handleViewAssignment(item)}
                        >
                          View Assignment
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Assignment Reports</h1>
        <Button
          variant="default"
          size="sm"
          onClick={() => navigate(-1)}
          className="bg-watney text-white hover:bg-watney/90"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
      </div>

      {renderFilters()}

      {activeReportType && reportData && renderReportTable()}
    </div>
  );
}