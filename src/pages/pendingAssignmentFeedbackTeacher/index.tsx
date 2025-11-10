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
  Eye,
  User,
  BookOpen,
  ArrowLeft
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
    courseId: { _id: string; name: string };
    intakeId?: { _id: string; termName: string };
  };
  unitId: { _id: string; title: string };
  unitMaterialId: {
    _id: string;
    assignments: Array<{ _id: string; title: string; type: string }>;
  };
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface SelectOption {
  value: string;
  label: string;
}

export function TeacherAssignmentFeedbackList() {
  const navigate = useNavigate();
  const { user } = useSelector((state: any) => state.auth);

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dropdown option states (FULL lists, not filtered by results)
  const [courses, setCourses] = useState<SelectOption[]>([]);
  const [terms, setTerms] = useState<SelectOption[]>([]);
  const [units, setUnits] = useState<SelectOption[]>([]);
  const [assignmentOptions, setAssignmentOptions] = useState<SelectOption[]>([]);

  // Selected filters
  const [selectedCourse, setSelectedCourse] = useState<SelectOption | null>(null);
  const [selectedTerm, setSelectedTerm] = useState<SelectOption | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<SelectOption | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<SelectOption | null>(null);
  const [counter,setCounter] = useState(0)
  const count = () => setCounter(prev => prev + 1);


  const [hasSearched, setHasSearched] = useState(false);

  // 🔹 Sort units by serial number (optional but kept for consistency)
  const sortBySerialNumber = (resources: any[]) => {
    return resources.sort((a, b) => {
      const getSerialNumber = (text: string) => {
        const match = text?.match(/(\d+)/);
        return match ? parseInt(match[1], 10) : null;
      };
      const aSerial = getSerialNumber(a.title || a.unitName || '');
      const bSerial = getSerialNumber(b.title || b.unitName || '');
      if (aSerial !== null && bSerial !== null) return aSerial - bSerial;
      if (aSerial !== null) return -1;
      if (bSerial !== null) return 1;
      return 0;
    });
  };

  // 🔹 1. Load teacher's courses & terms on mount
  useEffect(() => {
    if (!user || user.role !== 'teacher') return;

    const fetchTeacherCoursesAndTerms = async () => {
      try {
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
      } catch (err) {
        console.error('Failed to load courses/terms', err);
        setError('Failed to load courses/terms');
      }
    };

    fetchTeacherCoursesAndTerms();
  }, [user]);

// 🔹 2. Load units ONLY when both course AND term are selected
useEffect(() => {
  // Reset if either is missing
  if (!selectedCourse?.value || !selectedTerm?.value) {
    setUnits([]);
    setSelectedUnit(null);
    setAssignmentOptions([]);
    setSelectedAssignment(null);
    return;
  }

  const fetchUnits = async () => {
    try {
      // Pass both courseId and termId (if your backend supports termId)
      const res = await axiosInstance.get('/course-unit', {
        params: {
          courseId: selectedCourse.value,
          limit: 'all'
        }
      });

      const sortedUnits = sortBySerialNumber(res.data.data.result);
      const unitOptions = sortedUnits.map((u: any) => ({
        value: u._id,
        label: u.title || u.unitName
      }));

      setUnits(unitOptions);
      setSelectedUnit(null);
      setAssignmentOptions([]);
      setSelectedAssignment(null);
    } catch (err) {
      console.error('Failed to load units', err);
      setError('Failed to load units');
      setUnits([]);
    }
  };

  fetchUnits();
}, [selectedCourse, selectedTerm]); // ✅ Depend on both
  // 🔹 3. Load assignments when unit selected
  useEffect(() => {
    if (!selectedUnit?.value) {
      setAssignmentOptions([]);
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

        const assignmentOpts = allAssignments.map(a => ({
          value: a._id,
          label: a.title
        }));

        setAssignmentOptions(assignmentOpts);
        setSelectedAssignment(null);
      } catch (err) {
        console.error('Failed to load assignments', err);
        setError('Failed to load assignments');
      }
    };

    fetchAssignments();
  }, [selectedUnit]);

  // 🔹 4. Fetch assignment submissions based on filters
  const searchAssignments = async () => {
    setHasSearched(true);
    setLoading(true);
    setError(null);

    try {
      const params: Record<string, string> = {
        limit: 'all',
        sort: '-updatedAt'
      };

      if (selectedCourse?.value) params.courseId = selectedCourse.value;
      if (selectedTerm?.value) params.termId = selectedTerm.value;
      if (selectedUnit?.value) params.unitId = selectedUnit.value;
      if (selectedAssignment?.value) params.assignmentId = selectedAssignment.value;

      const response = await axiosInstance.get(`/assignment/teacher-feedback/${user._id}`, { params });
      setAssignments(response.data.data?.result || []);
    } catch (err) {
      console.error('Error fetching assignments:', err);
      setError('Failed to load assignment submissions');
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(()=>{
    searchAssignments()
  },[counter])

  const getAssignmentTitle = (assignment: Assignment) => {
    const material = assignment.unitMaterialId?.assignments?.find(
      (a) => a._id === assignment.courseMaterialAssignmentId
    );
    return material?.title || 'Unknown Assignment';
  };

  const getStudentName = (assignment: Assignment) => {
    if (assignment.studentId?.name) return assignment.studentId.name;
    if (assignment.studentId?.firstName && assignment.studentId?.lastName)
      return `${assignment.studentId.firstName} ${assignment.studentId.lastName}`;
    return 'Unknown Student';
  };

  const handleViewAssignment = (assignment: Assignment) => {
    const url = `/dashboard/student-applications/${assignment.applicationId?._id}/assignment/${assignment.studentId._id}/unit-assignments/${assignment.unitId?._id}?assignmentId=${assignment._id}`;
    window.open(url, "_blank");
  };

  const clearFilters = () => {
    setSelectedCourse(null);
    setSelectedTerm(null);
    setSelectedUnit(null);
    setSelectedAssignment(null);
    setHasSearched(false);
    setError(null);
    setAssignments([]);
    count();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Assignment Pending Feedbacks</CardTitle>
            <Button
              variant="default"
              size="sm"
              onClick={() => navigate(-1)}
              className="bg-watney text-white hover:bg-watney/90"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 mb-4 items-end">
            {/* Course */}
            <div className="flex-1 min-w-[150px]">
              <label className="text-sm font-medium">Course</label>
              <Select
                options={courses}
                value={selectedCourse}
                onChange={(opt) => {
                  setSelectedCourse(opt);
                  setSelectedTerm(null); // Reset dependent filters
                }}
                isClearable
                placeholder="Select course"
              />
            </div>

            {/* Term */}
            <div className="flex-1 min-w-[100px]">
              <label className="text-sm font-medium">Term</label>
              <Select
                options={terms}
                value={selectedTerm}
                onChange={setSelectedTerm}
                isClearable
                isDisabled={!courses.length}
                placeholder="Select term"
              />
            </div>

            {/* Unit */}
            <div className="flex-1 min-w-[150px]">
              <label className="text-sm font-medium">Unit</label>
              <Select
                options={units}
                value={selectedUnit}
                onChange={setSelectedUnit}
                isClearable
                isDisabled={!units.length}
                placeholder={!selectedCourse ? 'Select course first' : 'Select unit'}
              />
            </div>

            {/* Assignment */}
            <div className="flex-1 min-w-[150px]">
              <label className="text-sm font-medium">Assignment</label>
              <Select
                options={assignmentOptions}
                value={selectedAssignment}
                onChange={setSelectedAssignment}
                isClearable
                isDisabled={!assignmentOptions.length}
                placeholder={!selectedUnit ? 'Select unit first' : 'Select assignment'}
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={searchAssignments}
                disabled={!selectedAssignment}
                className="bg-watney text-white hover:bg-watney/90 min-w-[150px]"
              >
                Search
              </Button>
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          </div>

          {/* Results */}
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
              
            </div>
          ) : assignments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="text-lg font-semibold">No pending feedbacks found</h3>
             
            </div>
          ) : (
            <Table>
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
                {assignments.map((a) => (
                  <TableRow key={a._id} className="group">
                    <TableCell
                      onClick={() => handleViewAssignment(a)}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        {a.applicationId?.courseId?.name || 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell onClick={() => handleViewAssignment(a)} className="cursor-pointer">
                      {a.applicationId?.intakeId?.termName || 'N/A'}
                    </TableCell>
                    <TableCell onClick={() => handleViewAssignment(a)} className="cursor-pointer">
                      {a.unitId?.title || 'N/A'}
                    </TableCell>
                    <TableCell onClick={() => handleViewAssignment(a)} className="cursor-pointer">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{getStudentName(a)}</div>
                          <div className="text-xs text-muted-foreground">{a.studentId?.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell onClick={() => handleViewAssignment(a)} className="cursor-pointer font-medium">
                      {getAssignmentTitle(a)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        onClick={() => handleViewAssignment(a)}
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