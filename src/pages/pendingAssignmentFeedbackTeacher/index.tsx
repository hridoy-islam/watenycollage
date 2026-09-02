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
  ArrowLeft,
  Search,
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
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface SelectOption {
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

export function TeacherAssignmentFeedbackList() {
  const navigate = useNavigate();
  const { user } = useSelector((state: any) => state.auth);

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Filters loaded from teacher assignments
  const [courses, setCourses] = useState<SelectOption[]>([]);
  const [years, setYears] = useState<SelectOption[]>([]);
  const [terms, setTerms] = useState<SelectOption[]>([]);
  const [groups, setGroups] = useState<SelectOption[]>([]);
  const [units, setUnits] = useState<SelectOption[]>([]);
  const [assignmentOptions, setAssignmentOptions] = useState<SelectOption[]>([]);

  // Assigned filter source data
  const [allAssignedTerms, setAllAssignedTerms] = useState<any[]>([]);
  const [allAssignedGroups, setAllAssignedGroups] = useState<any[]>([]);

  // Selected filters
  const [selectedCourse, setSelectedCourse] = useState<SelectOption | null>(null);
  const [selectedYear, setSelectedYear] = useState<SelectOption | null>(null);
  const [selectedTerm, setSelectedTerm] = useState<SelectOption | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<SelectOption | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<SelectOption | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<SelectOption | null>(null);

  // Load filters from teacher-courses (assigned only)
  useEffect(() => {
    if (!user || user.role !== 'teacher') return;

    const loadFilters = async () => {
      try {
        const res = await axiosInstance.get('/teacher-courses', {
          params: { teacherId: user._id, limit: 'all' }
        });
        const teacherCourses: any[] = res.data?.data?.result || [];
        const uniqueCourses = new Map<string, any>();
        const termIds = new Set<string>();
        const groupIds = new Set<string>();

        teacherCourses.forEach((tc: any) => {
          if (tc.courseId?._id && !uniqueCourses.has(tc.courseId._id)) {
            uniqueCourses.set(tc.courseId._id, tc.courseId);
          }
          if (tc.courseTermId?._id) {
            termIds.add(String(tc.courseTermId._id));
          }
          if (tc.groupId?._id) {
            groupIds.add(String(tc.groupId._id));
          }
        });

        setCourses(
          Array.from(uniqueCourses.values()).map((c: any) => ({
            value: String(c?._id || c),
            label: c?.name || 'Course'
          }))
        );

        // Fetch assigned terms
        if (termIds.size > 0) {
          const termsRes = await axiosInstance.get('/course-term', { params: { limit: 'all' } });
          const assignedTerms = (termsRes.data?.data?.result || []).filter((t: any) => termIds.has(String(t._id)));
          setAllAssignedTerms(assignedTerms);
          setTerms(
            assignedTerms.map((t: any) => ({ value: t._id, label: t.name || 'Term' }))
          );
          const uniqueYears = [...new Set(assignedTerms.map((t: any) => normalizeYear(t.year)))];
          setYears(
            uniqueYears.sort((a, b) => (YEAR_ORDER[a] ?? 99) - (YEAR_ORDER[b] ?? 99)).map((y: string) => ({
              value: y,
              label: y.charAt(0).toUpperCase() + y.slice(1)
            }))
          );
        }

        // Fetch assigned groups
        if (groupIds.size > 0) {
          const groupsRes = await axiosInstance.get('/course-group', { params: { limit: 'all' } });
          const assignedGroups = (groupsRes.data?.data?.result || []).filter((g: any) => groupIds.has(String(g._id)));
          setAllAssignedGroups(assignedGroups);
          setGroups(
            assignedGroups.map((g: any) => ({ value: g._id, label: g.name || 'Group' }))
          );
        }
      } catch (err) {
        console.error('Failed to load filters', err);
        setError('Failed to load filters');
      }
    };

    loadFilters();
  }, [user]);

  // Filter terms/years by selected course (from assigned terms)
  useEffect(() => {
    setSelectedYear(null);
    setSelectedTerm(null);
    setSelectedGroup(null);
    setSelectedUnit(null);
    setSelectedAssignment(null);
    setUnits([]);
    setAssignmentOptions([]);

    if (!selectedCourse?.value) {
      setTerms(allAssignedTerms.map((t: any) => ({ value: t._id, label: t.name || 'Term' })));
      const uniqueYears = [...new Set(allAssignedTerms.map((t: any) => normalizeYear(t.year)))];
      setYears(
        uniqueYears.sort((a, b) => (YEAR_ORDER[a] ?? 99) - (YEAR_ORDER[b] ?? 99)).map((y: string) => ({
          value: y,
          label: y.charAt(0).toUpperCase() + y.slice(1)
        }))
      );
      setGroups(allAssignedGroups.map((g: any) => ({ value: g._id, label: g.name || 'Group' })));
      return;
    }

    const filteredTerms = allAssignedTerms.filter((t: any) => {
      const cid = String(t?.courseId?._id || t?.courseId || t?._id);
      return cid === selectedCourse.value;
    });
    setTerms(filteredTerms.map((t: any) => ({ value: t._id, label: t.name || 'Term' })));
    const yearsFromTerms = [...new Set(filteredTerms.map((t: any) => normalizeYear(t?.year)))];
    setYears(
      yearsFromTerms.sort((a, b) => (YEAR_ORDER[a] ?? 99) - (YEAR_ORDER[b] ?? 99)).map((y: string) => ({
        value: y,
        label: y.charAt(0).toUpperCase() + y.slice(1)
      }))
    );
  }, [selectedCourse, allAssignedTerms, allAssignedGroups]);

  // Filter terms by year
  useEffect(() => {
    setSelectedTerm(null);
    setSelectedGroup(null);
    setSelectedUnit(null);
    setSelectedAssignment(null);
    setUnits([]);
    setAssignmentOptions([]);

    if (!selectedCourse?.value || !selectedYear?.value) {
      if (selectedCourse?.value && !selectedYear?.value) {
        const termsForCourse = allAssignedTerms.filter((t: any) => {
          const cid = String(t?.courseId?._id || t?.courseId || t?._id);
          return cid === selectedCourse.value;
        });
        setTerms(termsForCourse.map((t: any) => ({ value: t._id, label: t.name || 'Term' })));
      }
      return;
    }
    const filteredTerms = allAssignedTerms.filter((t: any) => {
      const cid = String(t?.courseId?._id || t?.courseId || t?._id);
      return cid === selectedCourse.value && normalizeYear(t?.year) === selectedYear.value;
    });
    setTerms(filteredTerms.map((t: any) => ({ value: t._id, label: t.name || 'Term' })));
  }, [selectedCourse, selectedYear, allAssignedTerms]);

  // Groups depend on assigned term
  useEffect(() => {
    setSelectedGroup(null);
    setSelectedUnit(null);
    setSelectedAssignment(null);
    setUnits([]);
    setAssignmentOptions([]);

    if (!selectedTerm?.value) {
      setGroups(allAssignedGroups.map((g: any) => ({ value: g._id, label: g.name || 'Group' })));
      return;
    }
    const filteredGroups = allAssignedGroups.filter((g: any) => {
      return String(g?.termId?._id || g?.termId) === selectedTerm.value;
    });
    setGroups(filteredGroups.map((g: any) => ({ value: g._id, label: g.name || 'Group' })));
  }, [selectedTerm, allAssignedGroups]);

  // Units depend on group (still fetch from /course-unit since it's group-specific)
  useEffect(() => {
    setSelectedUnit(null);
    setSelectedAssignment(null);
    setAssignmentOptions([]);
    if (!selectedGroup?.value) {
      setUnits([]);
      return;
    }
    const fetchUnits = async () => {
      try {
        const res = await axiosInstance.get('/course-unit', {
          params: { groupId: selectedGroup.value, limit: 'all' }
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
  }, [selectedGroup]);

  // Assignments depend on unit
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

  // Search
  const searchAssignments = async () => {
    setHasSearched(true);
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = { limit: 'all', sort: '-updatedAt' };
      if (selectedCourse?.value) params.courseId = selectedCourse.value;
      if (selectedTerm?.value) params.termId = selectedTerm.value;
      if (selectedGroup?.value) params.groupId = selectedGroup.value;
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

  const getAssignmentTitle = (assignment: Assignment): string => {
    return assignment.assignmentSettings?.assignmentTitle || assignment.assignmentTitle || 'Unknown Assignment';
  };

  const getCourseName = (assignment: Assignment) => {
    if (typeof assignment.courseId === 'object' && assignment.courseId?.name) return assignment.courseId.name;
    return assignment.applicationId?.courseId?.name || 'N/A';
  };

  const getTermName = (assignment: Assignment) => {
    if (typeof assignment.termId === 'object' && assignment.termId?.name) return assignment.termId.name;
    return assignment.applicationId?.intakeId?.termName || 'N/A';
  };

  const getGroupName = (assignment: Assignment) => {
    if (typeof assignment.groupId === 'object' && assignment.groupId?.name) return assignment.groupId.name;
    return 'N/A';
  };

  const getStudentName = (assignment: Assignment) => {
    if (assignment.studentId?.name) return assignment.studentId.name;
    if (assignment.studentId?.firstName && assignment.studentId?.lastName)
      return `${assignment.studentId.firstName} ${assignment.studentId.lastName}`;
    return 'Unknown Student';
  };

  const handleViewAssignment = (assignment: Assignment) => {
    const url = `/dashboard/student-applications/${assignment.applicationId?._id}/assignment/${assignment.studentId._id}/unit-assignments/${assignment.unitId?._id}?assignmentId=${assignment._id}`;
    window.open(url, '_blank');
  };

  const clearFilters = () => {
    setSelectedCourse(null);
    setSelectedYear(null);
    setSelectedTerm(null);
    setSelectedGroup(null);
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
              <CardTitle className="text-xl font-bold">Assignment Pending Feedbacks</CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">
                Select a course first, then drill down through term, group, unit and assignment.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="default" size="sm" onClick={() => navigate(-1)} className="bg-watney text-white hover:bg-watney/90">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              {/* <Button variant="default" size="sm" onClick={() => navigate('/dashboard/assignment-report')} className="bg-watney text-white hover:bg-watney/90">
                Assignment Reports
              </Button> */}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wide">Course</label>
              <Select options={courses} value={selectedCourse} onChange={(opt) => setSelectedCourse(opt as SelectOption | null)} isClearable placeholder="Select course" styles={selectStyles} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wide">Year</label>
              <Select options={years} value={selectedYear} onChange={(opt) => setSelectedYear(opt as SelectOption | null)} isClearable isDisabled={!selectedCourse} placeholder={selectedCourse ? 'Select year' : 'Select course first'} styles={selectStyles} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wide">Course Term</label>
              <Select options={terms} value={selectedTerm} onChange={(opt) => setSelectedTerm(opt as SelectOption | null)} isClearable isDisabled={!selectedYear} placeholder={selectedYear ? 'Select term' : 'Select year first'} styles={selectStyles} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wide">Group</label>
              <Select options={groups} value={selectedGroup} onChange={(opt) => setSelectedGroup(opt as SelectOption | null)} isClearable isDisabled={!selectedTerm} placeholder={selectedTerm ? 'Select group' : 'Select term first'} styles={selectStyles} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wide">Course Unit</label>
              <Select options={units} value={selectedUnit} onChange={(opt) => setSelectedUnit(opt as SelectOption | null)} isClearable isDisabled={!selectedGroup} placeholder={selectedGroup ? 'Select unit' : 'Select group first'} styles={selectStyles} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wide">Assignment</label>
              <Select options={assignmentOptions} value={selectedAssignment} onChange={(opt) => setSelectedAssignment(opt as SelectOption | null)} isClearable isDisabled={!selectedUnit} placeholder={selectedUnit ? 'Select assignment' : 'Select unit first'} styles={selectStyles} />
            </div>
            <div className="flex items-end gap-2">
              <Button size="sm" onClick={searchAssignments} disabled={!selectedCourse} className="flex h-9 w-full items-center gap-2 bg-watney text-xs text-white hover:bg-watney/90">
                <Search className="h-4 w-4" /> Search
              </Button>
              <Button size="sm" variant="outline" onClick={clearFilters} className="flex h-9 w-full items-center gap-2 text-xs">
                <RotateCcw className="h-4 w-4" /> Reset
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8"><BlinkingDots size="large" color="bg-watney" /></div>
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
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Course</TableHead>
                    <TableHead className="text-xs">Term</TableHead>
                    <TableHead className="text-xs">Group</TableHead>
                    <TableHead className="text-xs">Unit</TableHead>
                    <TableHead className="text-xs">Student</TableHead>
                    <TableHead className="text-xs">Assignment</TableHead>
                    <TableHead className="text-right text-xs">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignments.map((a) => (
                    <TableRow key={a._id} className="group">
                      <TableCell onClick={() => handleViewAssignment(a)} className="cursor-pointer">
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-muted-foreground" />
                          {getCourseName(a)}
                        </div>
                      </TableCell>
                      <TableCell onClick={() => handleViewAssignment(a)} className="cursor-pointer">{getTermName(a)}</TableCell>
                      <TableCell onClick={() => handleViewAssignment(a)} className="cursor-pointer">
                        <div className="flex items-center gap-2">
                          <Layers className="h-3.5 w-3.5 text-muted-foreground" />
                          {getGroupName(a)}
                        </div>
                      </TableCell>
                      <TableCell onClick={() => handleViewAssignment(a)} className="cursor-pointer">{a.unitId?.title || 'N/A'}</TableCell>
                      <TableCell onClick={() => handleViewAssignment(a)} className="cursor-pointer">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">{getStudentName(a)}</div>
                            <div className="text-xs text-muted-foreground">{a.studentId?.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell onClick={() => handleViewAssignment(a)} className="cursor-pointer font-medium">{getAssignmentTitle(a)}</TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" onClick={() => handleViewAssignment(a)} className="bg-watney text-white hover:bg-watney/90">
                          <Eye className="mr-1 h-3 w-3" /> View
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
