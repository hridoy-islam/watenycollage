import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import moment from 'moment';
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
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Select from 'react-select';
import { FileText, Search, BookOpen, Eye, ArrowLeft, RotateCcw, Calendar } from 'lucide-react';
import { BlinkingDots } from '@/components/shared/blinking-dots';

interface StudentAssignmentItem {
  applicationId: string;
  courseId: string;
  courseName: string;
  courseCode: string;
  intakeName?: string;
  unitId: string;
  unitTitle: string;
  unitReference?: string;
  assignmentId: string;
  assignmentName: string;
  assignmentStatus: string;
  deadline?: string;
  groupId?: string;
  groupName?: string | null;
  termName?: string;
  termId?: string;
  courseTermName?: string;
  year?: string;
}

interface FilterOption {
  value: string;
  label: string;
}

const YEAR_ORDER: Record<string, number> = {
  'year 1': 1,
  'year 2': 2,
  'year 3': 3,
  'year 4': 4,
  'year 5': 5,
};

const normalizeYear = (year?: string): string =>
  (year || 'year 1').toString().trim().toLowerCase();

const formatStatus = (status?: string): string => {
  if (!status) return 'N/A';
  return status
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

const capitalizeWords = (text?: string): string => {
  if (!text) return '-';
  return text
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

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

const selectStyles = {
  control: (base: any) => ({ ...base, minHeight: 36, fontSize: 12, color: '#000' }),
  menu: (base: any) => ({ ...base, fontSize: 12 }),
  input: (base: any) => ({ ...base, color: '#000' }),
  singleValue: (base: any) => ({ ...base, color: '#000' }),
  option: (base: any) => ({ ...base, color: '#000' }),
  placeholder: (base: any) => ({ ...base, color: '#000', opacity: 0.5 }),
};

export function StudentAssignmentsPage() {
  const navigate = useNavigate();
  const { user } = useSelector((state: any) => state.auth);

  const [assignments, setAssignments] = useState<StudentAssignmentItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Dropdown options
  const [courses, setCourses] = useState<FilterOption[]>([]);
  const [years, setYears] = useState<FilterOption[]>([]);
  const [terms, setTerms] = useState<FilterOption[]>([]);
  const [units, setUnits] = useState<FilterOption[]>([]);
  const [assignmentOptions, setAssignmentOptions] = useState<FilterOption[]>([]);

  // Selected filters
  const [selectedCourse, setSelectedCourse] = useState<FilterOption | null>(null);
  const [selectedYear, setSelectedYear] = useState<FilterOption | null>(null);
  const [selectedTerm, setSelectedTerm] = useState<FilterOption | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<FilterOption | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<FilterOption | null>(null);

  // Auto-resolved group
  const [autoGroupId, setAutoGroupId] = useState<string | null>(null);

  // 1. Load student's approved courses on mount
  useEffect(() => {
    if (!user?._id) return;

    const fetchStudentCourses = async () => {
      try {
        const res = await axiosInstance.get('/application-course', {
          params: { studentId: user._id, status: 'approved', limit: 'all' }
        });
        const apps = res.data?.data?.result || [];
        const uniqueCoursesMap = new Map<string, FilterOption>();
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
      }
    };

    fetchStudentCourses();
  }, [user]);

  // 2. Years depend on Course selection
  useEffect(() => {
    setSelectedYear(null);
    setSelectedTerm(null);
    setSelectedUnit(null);
    setSelectedAssignment(null);
    setUnits([]);
    setAssignmentOptions([]);
    setTerms([]);
    setYears([]);
    if (!selectedCourse?.value) return;

    const fetchYears = async () => {
      try {
        const res = await axiosInstance.get('/course-term', {
          params: { courseId: selectedCourse.value, limit: 'all' }
        });
        const allTerms = res.data?.data?.result || [];
        const uniqueYears = [...new Set(allTerms.map((t: any) => normalizeYear(t.year)))];
        const yearOpts = uniqueYears
          .sort((a, b) => (YEAR_ORDER[a] ?? 99) - (YEAR_ORDER[b] ?? 99))
          .map((y) => ({ value: y, label: capitalizeWords(y) }));
        setYears(yearOpts);
      } catch (err) {
        console.error('Failed to load terms', err);
        setYears([]);
      }
    };
    fetchYears();
  }, [selectedCourse]);

  // 3. Terms depend on Year selection
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

  // 4. Auto-resolve assigned group for Course + Term selection
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

  // 5. Units depend on auto-resolved group
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

  // 6. Assignments depend on selected Unit
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

  // Fetch student assignments using service endpoint
  const fetchAssignmentsData = async (filterParams: Record<string, string> = {}) => {
    if (!user?._id) return;
    setLoading(true);
    try {
      const params: Record<string, string> = { limit: 'all', ...filterParams };
      const res = await axiosInstance.get(`/assignment/student-assignments/${user._id}`, { params });
      const data = res.data?.data?.result || [];
      setAssignments(
        data.map((item: any) => ({
          applicationId: item.applicationId || '',
          courseId: item.courseId || '',
          courseName: item.courseName || 'Unknown',
          courseCode: item.courseCode || '',
          intakeName: item.intakeName || '',
          unitId: item.unitId || '',
          unitTitle: item.unitTitle || 'Unknown',
          unitReference: item.unitReference || '',
          assignmentName: item.assignmentName || 'Unknown',
          assignmentId: item.assignmentId || item.assignmentSettingId || '',
          assignmentStatus: item.assignmentStatus || item.status || 'not_submitted',
          deadline: item.deadline || undefined,
          groupId: item.groupId || '',
          groupName: item.groupName || null,
          termName: item.intakeName || item.termName || '',
          termId: item.intakeId || item.termId || '',
          courseTermName: item.courseTermName || '',
          year: item.year || '',
        }))
      );
    } catch (err) {
      console.error('Failed to fetch assignments', err);
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  // Load all assignments initially on mount
  useEffect(() => {
    if (user?._id) {
      fetchAssignmentsData();
    }
  }, [user?._id]);

  // Handle click on Search button
  const handleSearch = () => {
    const params: Record<string, string> = {};
    if (selectedCourse?.value) params.courseId = selectedCourse.value;
    if (selectedTerm?.value) params.courseTermId = selectedTerm.value;
    if (autoGroupId) params.groupId = autoGroupId;
    if (selectedUnit?.value) params.unitId = selectedUnit.value;
    if (selectedAssignment?.value) params.assignmentId = selectedAssignment.value;

    fetchAssignmentsData(params);
  };

  // Reset all filters
  const handleReset = () => {
    setSelectedCourse(null);
    setSelectedYear(null);
    setSelectedTerm(null);
    setSelectedUnit(null);
    setSelectedAssignment(null);
    setAutoGroupId(null);
    fetchAssignmentsData();
  };

  const handleViewAssignment = (assignment: StudentAssignmentItem) => {
    navigate(
      `/dashboard/student-applications/${assignment.applicationId}/assignment/${user._id}/unit-assignments/${assignment.unitId}`,
      {
        state: {
          assignmentId: assignment.assignmentId,
          assignmentName: assignment.assignmentName,
        }
      }
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>My Assignments</CardTitle>
              <CardDescription>
                Select a course first, then drill down through term, unit and assignment.
              </CardDescription>
            </div>
            <Button size="sm" onClick={() => navigate(-1)} className="bg-watney text-white hover:bg-watney/90">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Dynamic cascading dropdown filters */}
          <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wide text-black">Course</label>
              <Select
                options={courses}
                value={selectedCourse}
                onChange={(opt) => setSelectedCourse(opt as FilterOption | null)}
                isClearable
                placeholder="Select course"
                styles={selectStyles}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wide text-black">Year</label>
              <Select
                options={years}
                value={selectedYear}
                onChange={(opt) => setSelectedYear(opt as FilterOption | null)}
                isClearable
                isDisabled={!selectedCourse}
                placeholder={selectedCourse ? 'Select year' : 'Select course first'}
                styles={selectStyles}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wide text-black">Course Term</label>
              <Select
                options={terms}
                value={selectedTerm}
                onChange={(opt) => setSelectedTerm(opt as FilterOption | null)}
                isClearable
                isDisabled={!selectedYear}
                placeholder={selectedYear ? 'Select term' : 'Select year first'}
                styles={selectStyles}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wide text-black">Course Unit</label>
              <Select
                options={units}
                value={selectedUnit}
                onChange={(opt) => setSelectedUnit(opt as FilterOption | null)}
                isClearable
                isDisabled={!autoGroupId}
                placeholder={autoGroupId ? 'Select unit' : 'Select Term First'}
                styles={selectStyles}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wide text-black">Assignment</label>
              <Select
                options={assignmentOptions}
                value={selectedAssignment}
                onChange={(opt) => setSelectedAssignment(opt as FilterOption | null)}
                isClearable
                isDisabled={!selectedUnit}
                placeholder={selectedUnit ? 'Select assignment' : 'Select unit first'}
                styles={selectStyles}
              />
            </div>

            <div className="flex items-end gap-2">
              <Button
                size="sm"
                onClick={handleSearch}
                disabled={!selectedCourse}
                className="flex h-9 w-full items-center gap-2 bg-watney text-xs text-white hover:bg-watney/90"
              >
                <Search className="h-4 w-4" /> Search
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleReset}
                className="flex h-9 w-full items-center gap-2 text-xs"
              >
                <RotateCcw className="h-4 w-4" /> Reset
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <BlinkingDots size="large" color="bg-watney" />
            </div>
          ) : assignments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <FileText className="mb-4 h-12 w-12 text-black" />
              <h3 className="text-lg font-semibold text-black">No assignments found</h3>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs text-black">Course</TableHead>
                    <TableHead className="text-xs text-black">Year</TableHead>
                    <TableHead className="text-xs text-black">Course Term</TableHead>
                    <TableHead className="text-xs text-black">Course Group</TableHead>
                    <TableHead className="text-xs text-black">Unit</TableHead>
                    <TableHead className="text-xs text-black">Assignment</TableHead>
                    <TableHead className="text-xs text-black">Deadline</TableHead>
                    <TableHead className="text-xs text-black">Status</TableHead>
                    <TableHead className="text-right text-xs text-black">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignments.map((assignment, index) => (
                    <TableRow key={`${assignment.unitId}-${assignment.assignmentId}-${index}`}>
                      <TableCell className="cursor-pointer text-xs text-black font-medium" onClick={() => handleViewAssignment(assignment)}>
                        <div className="flex items-start gap-2">
                          <BookOpen className="h-4 w-4 text-black shrink-0 mt-0.5" />
                          <div>
                            <div>{assignment.courseName}</div>
                            {(assignment.intakeName || assignment.termName) && (
                              <div className="text-[11px] font-normal ">
                                {assignment.intakeName || assignment.termName}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="cursor-pointer text-xs text-black" onClick={() => handleViewAssignment(assignment)}>
                        {capitalizeWords(assignment.year)}
                      </TableCell>
                      <TableCell className="cursor-pointer text-xs text-black" onClick={() => handleViewAssignment(assignment)}>
                        {assignment.courseTermName || 'N/A'}
                      </TableCell>
                      <TableCell className="cursor-pointer text-xs text-black" onClick={() => handleViewAssignment(assignment)}>
                        {assignment.groupName || 'N/A'}
                      </TableCell>
                      <TableCell className="cursor-pointer text-xs text-black" onClick={() => handleViewAssignment(assignment)}>
                        {assignment.unitTitle}
                      </TableCell>
                      <TableCell className="cursor-pointer text-xs text-black font-medium" onClick={() => handleViewAssignment(assignment)}>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-black shrink-0" />
                          {assignment.assignmentName}
                        </div>
                      </TableCell>
                      <TableCell className="cursor-pointer text-xs text-black" onClick={() => handleViewAssignment(assignment)}>
                        {assignment.deadline ? (
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-black shrink-0" />
                            {moment(assignment.deadline).format('DD MMM YYYY')}
                          </div>
                        ) : (
                          'N/A'
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-black font-bold">
                        <span
                          className={
                            assignment.assignmentStatus?.toLowerCase() === "completed"
                              ? "text-green-700"
                              : ""
                          }
                        >
                          {formatStatus(assignment.assignmentStatus)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right flex justify-end">
                        <Button size="sm" onClick={() => handleViewAssignment(assignment)} className="bg-watney text-white hover:bg-watney/90 flex items-center gap-1 text-xs">
                          <Eye className="h-3 w-3" /> View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}