import { useState, useEffect } from 'react';
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
  BookOpen,
  Layers,
  User,
  ArrowLeft,
  Search,
  RotateCcw,
  FileText
} from 'lucide-react';
import { BlinkingDots } from '@/components/shared/blinking-dots';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

interface StudentRow {
  _id: string;
  courseId: { _id: string; name: string; courseCode?: string } | string;
  courseTermId: { _id: string; name: string; year?: string; order?: number } | string;
  groupId: { _id: string; name: string } | string;
  studentId: {
    _id: string;
    name: string;
    email: string;
    firstName?: string;
    lastName?: string;
    title?: string;
  };
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

const selectStyles = {
  control: (base: any) => ({ ...base, minHeight: 36, fontSize: 12, color: '#000' }),
  menu: (base: any) => ({ ...base, fontSize: 12 }),
  input: (base: any) => ({ ...base, color: '#000' }),
  singleValue: (base: any) => ({ ...base, color: '#000' }),
  option: (base: any) => ({ ...base, color: '#000' }),
  placeholder: (base: any) => ({ ...base, color: '#000', opacity: 0.5 }),
};

export default function TeacherStudentListPage() {
  const navigate = useNavigate();
  const user = useSelector((state: any) => state.auth.user);

  const [students, setStudents] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(false);

  const [courses, setCourses] = useState<FilterOption[]>([]);
  const [years, setYears] = useState<FilterOption[]>([]);
  const [terms, setTerms] = useState<FilterOption[]>([]);
  const [groups, setGroups] = useState<FilterOption[]>([]);
  const [allAssignedTerms, setAllAssignedTerms] = useState<any[]>([]);
  const [allAssignedGroups, setAllAssignedGroups] = useState<any[]>([]);

  const [selectedCourse, setSelectedCourse] = useState<FilterOption | null>(null);
  const [selectedYear, setSelectedYear] = useState<FilterOption | null>(null);
  const [selectedTerm, setSelectedTerm] = useState<FilterOption | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<FilterOption | null>(null);

  // Load filters from teacher-courses and initial student list
  useEffect(() => {
    if (!user?._id || user?.role !== 'teacher') return;

    const loadFiltersFromTeacherCourses = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get(`/teacher-courses?teacherId=${user._id}`);
        const data: any[] = res.data?.data?.result || [];
        const courseIds = new Set();
        const termIds = new Set();
        const groupIds = new Set();
        const termYearMap: Record<string, string> = {};

        data.forEach((tc) => {
          if (tc.courseId?._id) {
            courseIds.add(String(tc.courseId._id));
            setCourses((prev) => {
              if (prev.find((c) => c.value === String(tc.courseId._id))) return prev;
              return [...prev, { value: String(tc.courseId._id), label: tc.courseId.name || 'Course' }];
            });
          }
          if (tc.courseTermId?._id) {
            termIds.add(String(tc.courseTermId._id));
            termYearMap[String(tc.courseTermId._id)] = tc.courseTermId.year || '';
          }
          if (tc.groupId?._id) {
            groupIds.add(String(tc.groupId._id));
          }
        });

        // Fetch term details from assigned terms
        if (termIds.size > 0) {
          const termsRes = await axiosInstance.get('/course-term', { params: { limit: 'all' } });
          const allTerms = termsRes.data?.data?.result || [];
          const assignedTerms: any[] = allTerms.filter((t: any) => termIds.has(String(t._id)));
          setAllAssignedTerms(assignedTerms);
          setTerms(assignedTerms.map((t: any) => ({ value: t._id, label: t.name || 'Term' })));
          const years = [...new Set(assignedTerms.map((t: any) => normalizeYear(t.year)))];
          setYears(years.sort((a, b) => (YEAR_ORDER[a] ?? 99) - (YEAR_ORDER[b] ?? 99)).map((y) => ({ value: y, label: y.charAt(0).toUpperCase() + y.slice(1) })));
        }

        // Fetch group details from assigned groups
        if (groupIds.size > 0) {
          const groupsRes = await axiosInstance.get('/course-group', { params: { limit: 'all' } });
          const allGroups = groupsRes.data?.data?.result || [];
          const assignedGroups: any[] = allGroups.filter((g: any) => groupIds.has(String(g._id)));
          setAllAssignedGroups(assignedGroups);
          setGroups(assignedGroups.map((g: any) => ({ value: g._id, label: g.name || 'Group' })));
        }

        // Load students
        const studentsRes = await axiosInstance.get(`/teacher-courses/teacher-assigned-students/${user._id}`, { params: { limit: 'all' } });
        setStudents(studentsRes.data?.data?.result || []);
      } catch (err) {
        console.error('Failed to load teacher data', err);
      } finally {
        setLoading(false);
      }
    };

    loadFiltersFromTeacherCourses();
  }, [user]);

  // Filter terms/years by selected course (from assigned data only)
  useEffect(() => {
    setSelectedYear(null);
    setSelectedTerm(null);
    setSelectedGroup(null);
    if (!selectedCourse?.value) {
      setTerms(allAssignedTerms.map((t: any) => ({ value: String(t?._id || t), label: t?.name || 'Term' })));
      setYears(
        [...new Set(allAssignedTerms.map((t: any) => normalizeYear(t?.year)))].sort((a, b) => (YEAR_ORDER[a] ?? 99) - (YEAR_ORDER[b] ?? 99)).map((y) => ({ value: y, label: y.charAt(0).toUpperCase() + y.slice(1) }))
      );
      return;
    }
    const filteredTerms = allAssignedTerms.filter((t: any) => {
      const cid = String(t?.courseId?._id || t?.courseId || t?._id);
      return cid === selectedCourse.value;
    });
    setTerms(filteredTerms.map((t: any) => ({ value: String(t?._id || t), label: t?.name || 'Term' })));
    const yearsFromTerms = [...new Set(filteredTerms.map((t: any) => normalizeYear(t?.year)))];
    setYears(
      yearsFromTerms.sort((a, b) => (YEAR_ORDER[a] ?? 99) - (YEAR_ORDER[b] ?? 99)).map((y) => ({ value: y, label: y.charAt(0).toUpperCase() + y.slice(1) }))
    );
  }, [selectedCourse, allAssignedTerms]);

  // Filter terms by selected year (from assigned terms only)
  useEffect(() => {
    setSelectedTerm(null);
    setSelectedGroup(null);
    if (!selectedCourse?.value || !selectedYear?.value) {
      if (selectedCourse?.value && !selectedYear?.value) {
        const termsForCourse = allAssignedTerms.filter((t: any) => {
          const cid = String(t?.courseId?._id || t?.courseId || t?._id);
          return cid === selectedCourse.value;
        });
        setTerms(termsForCourse.map((t: any) => ({ value: String(t?._id || t), label: t?.name || 'Term' })));
      }
      return;
    }
    const filteredTerms = allAssignedTerms.filter((t: any) => {
      const cid = String(t?.courseId?._id || t?.courseId || t?._id);
      const yearMatch = normalizeYear(t?.year) === selectedYear.value;
      return cid === selectedCourse.value && yearMatch;
    });
    setTerms(filteredTerms.map((t: any) => ({ value: String(t?._id || t), label: t?.name || 'Term' })));
  }, [selectedCourse, selectedYear, allAssignedTerms]);

  // Groups depend on assigned term
  useEffect(() => {
    setSelectedGroup(null);
    if (!selectedTerm?.value) {
      setGroups(allAssignedGroups.map((g: any) => ({ value: String(g?._id || g), label: g?.name || 'Group' })));
      return;
    }
    const filteredGroups = allAssignedGroups.filter((g: any) => {
      return String(g?.termId?._id || g?.termId) === selectedTerm.value;
    });
    setGroups(filteredGroups.map((g: any) => ({ value: String(g?._id || g), label: g?.name || 'Group' })));
  }, [selectedTerm, allAssignedGroups]);

  const fetchStudents = async () => {
    if (!user?._id) return;
    setLoading(true);
    try {
      const params: Record<string, string> = { limit: 'all' };
      if (selectedCourse?.value) params.courseId = selectedCourse.value;
      if (selectedYear?.value) params.year = selectedYear.value;
      if (selectedTerm?.value) params.courseTermId = selectedTerm.value;
      if (selectedGroup?.value) params.groupId = selectedGroup.value;

      const res = await axiosInstance.get(`/teacher-courses/teacher-assigned-students/${user._id}`, { params });
      setStudents(res.data?.data?.result || []);
    } catch (err) {
      console.error('Failed to fetch students', err);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSelectedCourse(null);
    setSelectedYear(null);
    setSelectedTerm(null);
    setSelectedGroup(null);
  };

  const getCourseName = (s: StudentRow) => {
    return typeof s.courseId === 'object' && s.courseId?.name ? s.courseId.name : 'N/A';
  };

  const getTermName = (s: StudentRow) => {
    return typeof s.courseTermId === 'object' && s.courseTermId?.name ? s.courseTermId.name : 'N/A';
  };

const getYearName = (s: StudentRow) => {
  const year =
    typeof s.courseTermId === 'object' && s.courseTermId?.year
      ? s.courseTermId.year
      : 'N/A';

  return year.charAt(0).toUpperCase() + year.slice(1);
};
  const getGroupName = (s: StudentRow) => {
    return typeof s.groupId === 'object' && s.groupId?.name ? s.groupId.name : 'N/A';
  };

  const getStudentName = (s: StudentRow) => {
    if (!s.studentId) return 'Unknown';
    if (typeof s.studentId === 'object') {
      if (s.studentId.name) return s.studentId.name;
      if (s.studentId.firstName && s.studentId.lastName) return `${s.studentId.firstName} ${s.studentId.lastName}`;
    }
    return 'Unknown';
  };

  const getStudentEmail = (s: StudentRow) => {
    return typeof s.studentId === 'object' && s.studentId?.email ? s.studentId.email : 'N/A';
  };

  return (
    <div className="text-xs space-y-4">
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold">Assigned Students</CardTitle>
              <p className="mt-1 text-xs ">
                Dynamic list of students based on your assigned courses, terms and groups.
              </p>
            </div>
            <Button size="sm" onClick={() => navigate(-1)} className="bg-watney text-white hover:bg-watney/90">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters grid like pendingAssignmentFeedbackTeacher */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wide">Course</label>
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
              <label className="text-[11px] font-bold uppercase tracking-wide">Year</label>
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
              <label className="text-[11px] font-bold uppercase tracking-wide">Course Term</label>
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
              <label className="text-[11px] font-bold uppercase tracking-wide">Group</label>
              <Select
                options={groups}
                value={selectedGroup}
                onChange={(opt) => setSelectedGroup(opt as FilterOption | null)}
                isClearable
                isDisabled={!selectedTerm}
                placeholder={selectedTerm ? 'Select group' : 'Select term first'}
                styles={selectStyles}
              />
            </div>

            <div className="flex items-end gap-2 xl:col-span-2">
              <Button
                size="sm"
                onClick={fetchStudents}
                disabled={!user?._id}
                className="flex h-9 w-full items-center gap-2 bg-watney text-xs text-white hover:bg-watney/90"
              >
                <Search className="h-4 w-4" /> Search
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => { clearFilters(); fetchStudents(); }}
                className="flex h-9 w-full items-center gap-2 text-xs"
              >
                <RotateCcw className="h-4 w-4" /> Reset
              </Button>
            </div>
          </div>

          {/* Results */}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <BlinkingDots size="large" color="bg-watney" />
            </div>
          ) : students.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <FileText className="mb-4 h-12 w-12 " />
              <h3 className="text-lg font-semibold">No assigned students found</h3>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Student</TableHead>
                    <TableHead className="text-xs">Course</TableHead>
                    <TableHead className="text-xs">Year</TableHead>
                    <TableHead className="text-xs">Term</TableHead>
                    <TableHead className="text-xs">Group</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((s) => (
                    <TableRow key={s._id} className="group">
                      <TableCell className="text-black">
  <div className="flex items-center gap-3">
    

    <div className="flex flex-col">
      <span className=" font-medium">
        {getStudentName(s)}
      </span>
      <span className=" text-sm text-gray-800">
        {getStudentEmail(s)}
      </span>
    </div>
  </div>
</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-black" />
                          <span className="text-black font-medium">{getCourseName(s)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-black">{getYearName(s)}</TableCell>
                      <TableCell className="text-black">{getTermName(s)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-black">
                          <Layers className="h-3.5 w-3.5 text-black" />
                          {getGroupName(s)}
                        </div>
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
