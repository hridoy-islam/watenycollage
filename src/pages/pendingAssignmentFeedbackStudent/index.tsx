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
  Search,
  BookOpen,
  ArrowLeft,
  RotateCcw,
  Layers
} from 'lucide-react';
import { BlinkingDots } from '@/components/shared/blinking-dots';
import { useSelector } from 'react-redux';

interface Assignment {
  _id: string;
  courseMaterialAssignmentId: string;
  courseId?: { _id: string; name: string } | string;
  termId?: { _id: string; name: string } | string;
  groupId?: { _id: string; name: string } | string;
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
  assignmentSettings?: {
    _id: string;
    assignmentTitle?: string;
    description?: string;
    status?: 'draft' | 'published' | 'closed';
    startDate?: string;
    finalDeadline?: string;
  } | null;
  
  assignmentTitle?: string;
  
  submissions: Array<{
    _id: string;
    submitBy: { _id: string; name: string; email: string };
    files: string[];
    comment?: string;
    seen: boolean;
    status: 'submitted' | 'resubmitted';
    createdAt: string;
  }>;
  feedbacks: Array<{
    _id: string;
    submitBy: { _id: string; name: string; email: string };
    comment?: string;
    files: string[];
    seen: boolean;
    createdAt: string;
  }>;
  status: string;
  requireResubmit: boolean;
  createdAt: string;
  updatedAt: string;
}

interface SelectOption {
  value: string;
  label: string;
}

const selectStyles = {
  control: (base: any) => ({
    ...base,
    minHeight: 36,
    fontSize: 12,
    color: '#000'
  }),
  menu: (base: any) => ({ ...base, fontSize: 12 }),
  input: (base: any) => ({ ...base, color: '#000' }),
  singleValue: (base: any) => ({ ...base, color: '#000' }),
  option: (base: any) => ({ ...base, color: '#000' }),
  placeholder: (base: any) => ({ ...base, color: '#000', opacity: 0.5 })
};

const YEAR_ORDER: Record<string, number> = {
  'year 1': 1,
  'year 2': 2,
  'year 3': 3,
  'year 4': 4,
  'year 5': 5,
};

const normalizeYear = (year?: string): string =>
  (year || 'year 1').toString().trim().toLowerCase();

const sortBySerialNumber = (resources: any[]) => {
  return [...resources].sort((a, b) => {
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

export function StudentAssignmentFeedbackList() {
  const navigate = useNavigate();
  const user = useSelector((state: any) => state.auth.user);

   const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Dropdown options (FULL lists, not filtered by results)
  const [courses, setCourses] = useState<SelectOption[]>([]);
  const [years, setYears] = useState<SelectOption[]>([]);
  const [terms, setTerms] = useState<SelectOption[]>([]);
  const [units, setUnits] = useState<SelectOption[]>([]);
  const [assignmentOptions, setAssignmentOptions] = useState<SelectOption[]>([]);

  // Auto-resolved group (set by effect below)
  const [groupAssignments] = useState<any[]>([]);

  // Selected filters
  const [selectedCourse, setSelectedCourse] = useState<SelectOption | null>(null);
  const [selectedYear, setSelectedYear] = useState<SelectOption | null>(null);
  const [selectedTerm, setSelectedTerm] = useState<SelectOption | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<SelectOption | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<SelectOption | null>(null);

  // 🔹 1. Load student's courses on mount
  useEffect(() => {
    if (!user?._id) return;

    const fetchStudentCourses = async () => {
      try {
        const res = await axiosInstance.get('/application-course', {
          params: { studentId: user._id, status: 'approved', limit: 'all' }
        });
        const apps = res.data?.data?.result || [];
        const uniqueCoursesMap = new Map<string, SelectOption>();
        apps.forEach((app: any) => {
          if (app.courseId?._id && !uniqueCoursesMap.has(app.courseId._id)) {
            uniqueCoursesMap.set(app.courseId._id, {
              value: app.courseId._id,
              label: app.courseId?.name || 'Course'
            });
          }
        });
        setCourses(Array.from(uniqueCoursesMap.values()));
      } catch (err) {
        console.error('Failed to load courses', err);
        setError('Failed to load courses');
      }
    };

    fetchStudentCourses();
  }, [user]);

  // Auto-resolve the student's assigned group for selected course + term using groupAssignedStudent
  const [autoGroupId, setAutoGroupId] = useState<string | null>(null);

  useEffect(() => {
    setAutoGroupId(null);
    if (!user?._id || !selectedCourse?.value || !selectedTerm?.value) {
      return;
    }
    const fetchAssignedGroup = async () => {
      try {
        const res = await axiosInstance.get('/student-assign-group', {
          params: {
            studentId: user._id,
            courseId: selectedCourse.value,
            courseTermId: selectedTerm.value,
            limit: 'all'
          }
        });
        const result = res.data?.data?.result || [];
        if (result.length > 0) {
          const g = result[0];
          setAutoGroupId(String(g.groupId?._id || g.groupId));
        } else {
          setAutoGroupId(null);
        }
      } catch (err) {
        console.error('Failed to fetch assigned group', err);
        setAutoGroupId(null);
      }
    };
    fetchAssignedGroup();
  }, [user, selectedCourse, selectedTerm]);

  // 🔹 2. Terms and Years depend on Course
  useEffect(() => {
    setSelectedYear(null);
    setSelectedTerm(null);
    setSelectedUnit(null);
    setSelectedAssignment(null);
    setUnits([]);
    setAssignmentOptions([]);
    setTerms([]);
    setYears([]);
    if (!selectedCourse?.value) {
      return;
    }
    const fetchTermsAndYears = async () => {
      try {
        const res = await axiosInstance.get('/course-term', {
          params: { courseId: selectedCourse.value, limit: 'all' }
        });
        const allTerms = res.data?.data?.result || [];
        const uniqueYears = [...new Set(allTerms.map((t: any) => normalizeYear(t.year)))];
        const yearOpts = uniqueYears
          .sort((a, b) => (YEAR_ORDER[a] ?? 99) - (YEAR_ORDER[b] ?? 99))
          .map((y) => ({ value: y, label: y.charAt(0).toUpperCase() + y.slice(1) }));
        setYears(yearOpts);
      } catch (err) {
        console.error('Failed to load terms', err);
        setYears([]);
      }
    };
    fetchTermsAndYears();
  }, [selectedCourse]);

  // 🔹 2b. Fetch terms only after selecting year
  useEffect(() => {
    setSelectedTerm(null);
    setSelectedUnit(null);
    setSelectedAssignment(null);
    setUnits([]);
    setAssignmentOptions([]);
    if (!selectedCourse?.value || !selectedYear?.value) {
      setTerms([]);
      return;
    }
    const fetchTerms = async () => {
      try {
        const res = await axiosInstance.get('/course-term', {
          params: {
            courseId: selectedCourse.value,
            year: selectedYear.value,
            limit: 'all'
          }
        });
        const opts = (res.data?.data?.result || []).map((t: any) => ({
          value: t._id,
          label: t.name || 'Term'
        }));
        setTerms(opts);
      } catch (err) {
        console.error('Failed to load terms', err);
        setTerms([]);
      }
    };
    fetchTerms();
  }, [selectedCourse, selectedYear]);

  // 🔹 4. Units depend on the student's auto-resolved group
  useEffect(() => {
    setSelectedUnit(null);
    setSelectedAssignment(null);
    setAssignmentOptions([]);
    if (!autoGroupId) {
      setUnits([]);
      return;
    }
    const fetchUnits = async () => {
      try {
        const res = await axiosInstance.get('/course-unit', {
          params: { groupId: autoGroupId, limit: 'all' }
        });
        const sortedUnits = sortBySerialNumber(res.data?.data?.result || []);
        const opts = sortedUnits.map((u: any) => ({
          value: u._id,
          label: u.title || u.unitName || 'Unit'
        }));
        setUnits(opts);
      } catch (err) {
        console.error('Failed to load units', err);
        setUnits([]);
      }
    };
    fetchUnits();
  }, [autoGroupId]);

  // 🔹 5. Assignments depend on Unit (from assignment-settings)
  useEffect(() => {
    setSelectedAssignment(null);
    if (!selectedUnit?.value) {
      setAssignmentOptions([]);
      return;
    }
    const fetchAssignments = async () => {
      try {
        const res = await axiosInstance.get('/assignment-settings', {
          params: { unitId: selectedUnit.value, limit: 'all' }
        });
        const opts = (res.data?.data?.result || []).map((s: any) => ({
          value: s._id,
          label: s.assignmentTitle || 'Assignment'
        }));
        setAssignmentOptions(opts);
      } catch (err) {
        console.error('Failed to load assignments', err);
        setAssignmentOptions([]);
      }
    };
    fetchAssignments();
  }, [selectedUnit]);

  // 🔹 6b. Initially show all assignment feedbacks for this student
  useEffect(() => {
    if (!user?._id) return;
    const loadAll = async () => {
      setHasSearched(true);
      setLoading(true);
      setError(null);
      try {
        const params: Record<string, string> = {
          limit: 'all',
          sort: '-updatedAt'
        };
        const response = await axiosInstance.get(
          `/assignment/student-feedback/${user._id}`,
          { params }
        );
        setAssignments(response.data.data?.result || []);
      } catch (err) {
        console.error('Error fetching initial assignments:', err);
        setError('Failed to load assignment feedbacks');
        setAssignments([]);
      } finally {
        setLoading(false);
      }
    };
    loadAll();
  }, [user]);

  // 🔹 6. Fetch assignment feedbacks based on filters
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
      if (autoGroupId) params.groupId = autoGroupId;
      if (selectedUnit?.value) params.unitId = selectedUnit.value;
      if (selectedAssignment?.value) params.assignmentId = selectedAssignment.value;

      const response = await axiosInstance.get(
        `/assignment/student-feedback/${user._id}`,
        { params }
      );
      const data = response.data.data?.result || [];
      setAssignments(data);
    } catch (err) {
      console.error('Error fetching assignments:', err);
      setError('Failed to load assignment feedbacks');
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  // Get assignment title from assignmentSettings
  const getAssignmentTitle = (assignment: Assignment): string => {
    return (
      assignment.assignmentSettings?.assignmentTitle ||
      assignment.assignmentTitle ||
      'Unknown Assignment'
    );
  };

  const getCourseName = (assignment: Assignment) => {
    if (typeof assignment.courseId === 'object' && assignment.courseId?.name)
      return assignment.courseId.name;
    return assignment.applicationId?.courseId?.name || 'N/A';
  };

  const getTermName = (assignment: Assignment) => {
    if (typeof assignment.termId === 'object' && assignment.termId?.name)
      return assignment.termId.name;
    return assignment.applicationId?.intakeId?.termName || 'N/A';
  };

  const getGroupName = (assignment: Assignment) => {
    if (typeof assignment.groupId === 'object' && assignment.groupId?.name)
      return assignment.groupId.name;
    return 'N/A';
  };

  const handleViewAssignment = (assignment: Assignment) => {
    const url = `/dashboard/student-applications/${assignment.applicationId?._id}/assignment/${assignment.studentId._id}/unit-assignments/${assignment.unitId?._id}?assignmentId=${assignment._id}`;
    window.open(url, "_blank");
  };

  const clearFilters = () => {
    setSelectedCourse(null);
    setSelectedYear(null);
    setSelectedTerm(null);
    setSelectedUnit(null);
    setSelectedAssignment(null);
    setHasSearched(false);
    setError(null);
    setAssignments([]);
  };

  return (
    <div className="text-xs space-y-4">
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold">
                Assignment Feedbacks
              </CardTitle>
              <p className="mt-1 text-xs ">
                 Select a course first, then drill down through term, unit and
                 assignment to find your feedback. Your group is assigned
                 automatically.
              </p>
            </div>
            <div>
              <Button
                variant="default"
                size="sm"
                onClick={() => navigate(-1)}
                className="bg-watney text-white hover:bg-watney/90"
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* ── Filters ── */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wide">
                Course
              </label>
              <Select
                options={courses}
                value={selectedCourse}
                onChange={(opt) => setSelectedCourse(opt as SelectOption | null)}
                isClearable
                placeholder="Select course"
                styles={selectStyles}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wide">
                Year
              </label>
              <Select
                options={years}
                value={selectedYear}
                onChange={(opt) => setSelectedYear(opt as SelectOption | null)}
                isClearable
                isDisabled={!selectedCourse}
                placeholder={selectedCourse ? 'Select year' : 'Select course first'}
                styles={selectStyles}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wide">
                Course Term
              </label>
              <Select
                options={terms}
                value={selectedTerm}
                onChange={(opt) => setSelectedTerm(opt as SelectOption | null)}
                isClearable
                isDisabled={!selectedYear}
                placeholder={selectedYear ? 'Select term' : 'Select year first'}
                styles={selectStyles}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wide">
                Course Unit
              </label>
              <Select
                options={units}
                value={selectedUnit}
                onChange={(opt) => setSelectedUnit(opt as SelectOption | null)}
                isClearable
                isDisabled={!autoGroupId}
                placeholder={autoGroupId ? 'Select unit' : 'Group not assigned'}
                styles={selectStyles}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wide">
                Assignment
              </label>
              <Select
                options={assignmentOptions}
                value={selectedAssignment}
                onChange={(opt) => setSelectedAssignment(opt as SelectOption | null)}
                isClearable
                isDisabled={!selectedUnit}
                placeholder={selectedUnit ? 'Select assignment' : 'Select unit first'}
                styles={selectStyles}
              />
            </div>

            <div className="flex items-end gap-2">
              <Button
                size="sm"
                onClick={searchAssignments}
                disabled={!selectedCourse}
                className="flex h-9 w-full items-center gap-2 bg-watney text-xs text-white hover:bg-watney/90"
              >
                <Search className="h-4 w-4" />
                Search
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={clearFilters}
                className="flex h-9 w-full items-center gap-2 text-xs"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
            </div>
          </div>

          {/* ── Results ── */}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <BlinkingDots size="large" color="bg-watney" />
            </div>
          ) : error ? (
            <div className="text-center py-4 text-red-500">{error}</div>
          ) : !hasSearched ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <FileText className="mb-4 h-12 w-12 " />
              <h3 className="text-lg font-semibold">Set filters and click "Search"</h3>
            </div>
          ) : assignments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <FileText className="mb-4 h-12 w-12 " />
              <h3 className="text-lg font-semibold">
                You've seen everything — nothing pending now
              </h3>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Course</TableHead>
                    <TableHead className="text-xs">Term</TableHead>
                    <TableHead className="text-xs">Group</TableHead>
                    <TableHead className="text-xs">Unit</TableHead>
                    <TableHead className="text-xs">Assignment</TableHead>
                    <TableHead className="text-right text-xs">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignments.map((assignment) => {
                    const unseenFeedbackCount =
                      assignment.feedbacks?.filter((f) => !f.seen).length || 0;
                    const assignmentTitle = getAssignmentTitle(assignment);

                    return (
                      <TableRow key={assignment._id} className="group">
                        <TableCell
                          className="cursor-pointer"
                          onClick={() => handleViewAssignment(assignment)}
                        >
                          <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4 " />
                            {getCourseName(assignment)}
                          </div>
                        </TableCell>
                        <TableCell
                          className="cursor-pointer"
                          onClick={() => handleViewAssignment(assignment)}
                        >
                          {getTermName(assignment)}
                        </TableCell>
                        <TableCell
                          className="cursor-pointer"
                          onClick={() => handleViewAssignment(assignment)}
                        >
                          <div className="flex items-center gap-2">
                            <Layers className="h-3.5 w-3.5 " />
                            {getGroupName(assignment)}
                          </div>
                        </TableCell>
                        <TableCell
                          className="cursor-pointer"
                          onClick={() => handleViewAssignment(assignment)}
                        >
                          {assignment.unitId?.title || 'N/A'}
                        </TableCell>
                        <TableCell
                          className="cursor-pointer font-medium"
                          onClick={() => handleViewAssignment(assignment)}
                        >
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 " />
                            {assignmentTitle}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {unseenFeedbackCount > 0 && (
                              <span className="rounded-full bg-watney px-2 py-0.5 text-[10px] font-bold text-white">
                                {unseenFeedbackCount}
                              </span>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewAssignment(assignment)}
                              className="flex items-center gap-1 bg-watney text-xs text-white hover:bg-watney/90"
                            >
                              View
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}