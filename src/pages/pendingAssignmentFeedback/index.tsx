import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '@/lib/axios';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Select from 'react-select';
import {
  FileText,
  ArrowLeft,
  BookOpen,
  User,
  Eye,
  Search,
  X
} from 'lucide-react';
import { BlinkingDots } from '@/components/shared/blinking-dots';
import { useSelector } from 'react-redux';

interface Assignment {
  _id: string;
  courseMaterialAssignmentId: string;
  studentId: {
    _id: string;
    name: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
  applicationId: {
    _id: string;
    courseId: {
      _id: string;
      name: string;
    };
  };
  unitId: {
    _id: string;
    title: string;
  };
  unitMaterialId: {
    _id: string;
    assignments: Array<{
      _id: string;
      title: string;
      content?: string;
      deadline?: string;
      type: string;
    }>;
  };
  submissions: any[];
  feedbacks: any[];
  status: string;
  requireResubmit: boolean;
  createdAt: string;
  updatedAt: string;
}

interface SelectOption {
  value: string;
  label: string;
}

export function AssignmentFeedbackList() {
  const { user } = useSelector((state: any) => state.auth);
  const navigate = useNavigate();

  const [courses, setCourses] = useState<SelectOption[]>([]);
  const [terms, setTerms] = useState<SelectOption[]>([]);
  const [units, setUnits] = useState<SelectOption[]>([]);
  const [assignments, setAssignments] = useState<SelectOption[]>([]);

  const [selectedCourse, setSelectedCourse] = useState<SelectOption | null>(null);
  const [selectedTerm, setSelectedTerm] = useState<SelectOption | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<SelectOption | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<SelectOption | null>(null);

  const [assignmentList, setAssignmentList] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [counter,setCounter] = useState(0)
  const count = () => setCounter(prev => prev + 1);


  // 🔹 Sort units by serial number
  const sortBySerialNumber = (resources: any[]) => {
    return resources.sort((a, b) => {
      const getSerialNumber = (text: string) => {
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

  // Load courses and terms
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user?.role === 'admin') {
          const [coursesRes, termsRes] = await Promise.all([
            axiosInstance.get('/courses', { params: { status: 1, limit: 'all' } }),
            axiosInstance.get('/terms', { params: { limit: 'all' } })
          ]);

          setCourses(coursesRes.data.data.result.map((c: any) => ({
            value: c._id,
            label: c?.name
          })));

          setTerms(termsRes.data.data.result.map((t: any) => ({
            value: t._id,
            label: t?.termName
          })));
        } else if (user?.role === 'teacher') {
          const res = await axiosInstance.get('/teacher-courses', {
            params: { teacherId: user._id, limit: 'all' }
          });

          const teacherCourses = res.data.data.result;
          const uniqueCoursesMap = new Map();
          const uniqueTermsMap = new Map();

          teacherCourses.forEach((tc: any) => {
            if (tc.courseId?._id && !uniqueCoursesMap.has(tc.courseId._id)) {
              uniqueCoursesMap.set(tc.courseId._id, {
                value: tc.courseId._id,
                label: tc.courseId?.name
              });
            }
            if (tc.termId?._id && !uniqueTermsMap.has(tc.termId._id)) {
              uniqueTermsMap.set(tc.termId._id, {
                value: tc.termId._id,
                label: tc.termId?.termName
              });
            }
          });

          setCourses(Array.from(uniqueCoursesMap.values()));
          setTerms(Array.from(uniqueTermsMap.values()));
        }
      } catch (err) {
        console.error('Failed to load courses/terms', err);
        setError('Failed to load courses/terms');
      }
    };

    if (user) fetchData();
  }, [user]);

  // Load units when course or term changes
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
          params: { courseId: selectedCourse.value, limit: 'all' }
        });

        const sortedUnits = sortBySerialNumber(res.data.data.result);

        const unitOptions = sortedUnits.map((u: any) => ({
          value: u._id,
          label: u?.title || u.unitName
        }));

        setUnits(unitOptions);
        setSelectedUnit(null);
        setAssignments([]);
        setSelectedAssignment(null);
      } catch (err) {
        console.error('Failed to load units', err);
        setError('Failed to load units');
      }
    };

    fetchUnits();
  }, [selectedCourse, selectedTerm]);

  // Load assignments when unit changes
  useEffect(() => {
    if (!selectedUnit?.value) {
      setAssignments([]);
      setSelectedAssignment(null);
      return;
    }

    const fetchAssignments = async () => {
      try {
        const res = await axiosInstance.get('/unit-material', {
          params: { unitId: selectedUnit.value, limit: 'all' }
        });

        const allAssignments: { _id: string; title: string }[] = [];
        res.data.data.result.forEach((material: any) => {
          if (material.assignments?.length) {
            material.assignments
              .filter((a: any) => a.type === 'assignment')
              .forEach((a: any) => allAssignments.push(a));
          }
        });

        const assignmentOptions = allAssignments.map(a => ({
          value: a._id,
          label: a.title
        }));

        setAssignments(assignmentOptions);
        setSelectedAssignment(null);
      } catch (err) {
        console.error('Failed to load assignments', err);
        setError('Failed to load assignments');
      }
    };

    fetchAssignments();
  }, [selectedUnit]);

  // Fetch assignment submissions
  const fetchAssignmentsData = async () => {
    setHasSearched(true);
    setLoading(true);
    setError(null);

    try {
      const params: Record<string, string> = {
        limit: 'all',
        sort: '-updatedAt',
        status: 'submitted',
      };

      if (selectedCourse?.value) params.courseId = selectedCourse.value;
      if (selectedUnit?.value) params.unitId = selectedUnit.value;
      if (selectedTerm?.value) params.termId = selectedTerm.value;
      if (selectedAssignment?.value) params.assignmentId = selectedAssignment.value;

      const response = await axiosInstance.get('/assignment', { params });
      setAssignmentList(response.data.data?.result || []);
    } catch (err) {
      console.error('Error fetching assignments:', err);
      setError('Failed to load assignment submissions');
      setAssignmentList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignmentsData();
  }, [counter]);

  const getAssignmentTitle = (assignment: Assignment) => {
    const materialAssignment = assignment.unitMaterialId?.assignments?.find(
      (a: any) => a._id === assignment.courseMaterialAssignmentId
    );
    return materialAssignment?.title || 'Unknown Assignment';
  };

  const getStudentName = (assignment: Assignment) => {
    return assignment.studentId?.name ||
      (assignment.studentId?.firstName && assignment.studentId?.lastName
        ? `${assignment.studentId?.firstName} ${assignment.studentId?.lastName}`
        : 'Unknown Student');
  };

  const handleViewAssignment = (assignment: Assignment) => {
    const url = `/dashboard/student-applications/${assignment.applicationId?._id}/assignment/${assignment.studentId._id}/unit-assignments/${assignment.unitId?._id}?assignmentId=${assignment._id}`;
    window.open(url, '_blank');
  };

  const clearFilters = () => {
  setSelectedCourse(null);
  setSelectedTerm(null);
  setSelectedUnit(null);
  setSelectedAssignment(null);
count();
  setHasSearched(false); 
  setError(null); 
};


  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Assignment Feedbacks</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="default"
                size="sm"
                onClick={() => navigate(-1)}
                className="bg-watney text-white hover:bg-watney/90"
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => navigate("/dashboard/assignment-report")}
                className="bg-watney text-white hover:bg-watney/90"
              >
                Assignment Reports
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* 🔹 Flex layout for filters */}
          <div className="flex flex-wrap gap-4 mb-4 items-end">
            <div className="flex-1 min-w-[150px]">
              <label className="text-sm font-medium">Course</label>
              <Select
                options={courses}
                value={selectedCourse}
                onChange={(option: any) => setSelectedCourse(option)}
                placeholder="Select course"
                isClearable
              />
            </div>

            <div className="flex-1 min-w-[150px]">
              <label className="text-sm font-medium">Term</label>
              <Select
                options={terms}
                value={selectedTerm}
                onChange={(option: any) => setSelectedTerm(option)}
                placeholder="Select term"
                isClearable
                isDisabled={!courses.length}
              />
            </div>

            <div className="flex-1 min-w-[150px]">
              <label className="text-sm font-medium">Unit</label>
              <Select
                options={units}
                value={selectedUnit}
                onChange={(option: any) => setSelectedUnit(option)}
                placeholder={!selectedCourse || !selectedTerm ? 'Select course & term' : 'Select unit'}
                isClearable
                isDisabled={!units.length}
              />
            </div>

            <div className="flex-1 min-w-[150px]">
              <label className="text-sm font-medium">Assignment</label>
              <Select
                options={assignments}
                value={selectedAssignment}
                onChange={(option: any) => setSelectedAssignment(option)}
                placeholder={!selectedUnit ? 'Select unit first' : assignments.length === 0 ? 'No assignments' : 'Select assignment'}
                isClearable
                isDisabled={!assignments.length}
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={fetchAssignmentsData}
                disabled={!selectedAssignment}
                className="bg-watney text-white hover:bg-watney/90"
              >
                <Search className="mr-2 h-4 w-4" /> Search
              </Button>
              <Button
                onClick={clearFilters}
                variant="outline"
                className="flex items-center gap-1"
              >
                <X className="h-4 w-4" /> Clear Filters
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <BlinkingDots size="large" color="bg-watney" />
            </div>
          ) : error ? (
            <div className="text-center py-4 text-red-500">{error}</div>
          ) : !hasSearched ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="text-lg font-semibold">Set filters and click "Search"</h3>
              <p className="text-sm text-muted-foreground">
                Select course, term, unit, and assignment to view submissions.
              </p>
            </div>
          ) : assignmentList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="text-lg font-semibold">No submissions found</h3>
              
            </div>
          ) : (
            <Table className='text-xs'>
              <TableHeader>
                <TableRow>
                  <TableHead>Course</TableHead>
                                    <TableHead>Term</TableHead>

                  <TableHead>Unit</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Assignment</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignmentList.map((assignment) => (
                  <TableRow key={assignment._id} className="group">
                    <TableCell className="cursor-pointer" onClick={() => handleViewAssignment(assignment)}>
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        {assignment.applicationId?.courseId?.name || 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell className="cursor-pointer" onClick={() => handleViewAssignment(assignment)}>
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        {assignment.applicationId?.intakeId?.termName || 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell className="cursor-pointer" onClick={() => handleViewAssignment(assignment)}>
                      {assignment.unitId?.title || 'N/A'}
                    </TableCell>
                    <TableCell className="cursor-pointer" onClick={() => handleViewAssignment(assignment)}>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{getStudentName(assignment)}</div>
                          <div className="text-xs text-muted-foreground">{assignment.studentId?.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="cursor-pointer font-medium" onClick={() => handleViewAssignment(assignment)}>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        {getAssignmentTitle(assignment)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewAssignment(assignment)}
                        className="bg-watney text-white hover:bg-watney/90"
                      >
                        <Eye className="mr-1 h-3 w-3" /> View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
