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

// Types
type Course = { _id: string; name: string; courseCode: string };
type Term = { _id: string; termName: string };
type Unit = { _id: string; unitName: string; title?: string };
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
  const [selectedCourse, setSelectedCourse] = useState<SelectOption | null>(
    null
  );
  const [selectedTerm, setSelectedTerm] = useState<SelectOption | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<SelectOption | null>(null);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
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
        const [coursesRes, termsRes] = await Promise.all([
          axiosInstance.get('/courses', {
            params: { status: 1, limit: 'all' }
          }),
          axiosInstance.get('/terms', { params: { status: 1, limit: 'all' } })
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
      } catch (err) {
        setError('Failed to load courses/terms');
        console.error(err);
      }
    };
    fetchData();
  }, []);

  // Fetch units when course/term changes
  useEffect(() => {
    if (!selectedCourse?.value || !selectedTerm?.value) {
      setUnits([]);
      setSelectedUnit(null);
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
        setUnits(
          res.data.data.result.map((u: Unit) => ({
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

  useEffect(() => {
    if (reportType !== null) {
      setSelectedCourse(null);
      setSelectedTerm(null);
      setSelectedUnit(null);
      setUnits([]);
      setReportData(null);
      setError(null);
    }
  }, [reportType]);

  const handleGenerateReport = async () => {
    if (!reportType || !selectedCourse || !selectedTerm || !selectedUnit) {
      setError('Please select all fields');
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

      switch (reportType.value) {
        case '1':
          endpoint = `/assignment/submitted/${courseId}/${termId}/${unitId}?limit=all`;
          break;
        case '2':
          endpoint = `/assignment/with-feedback/${courseId}/${termId}/${unitId}?limit=all`;
          break;
        case '3':
          endpoint = `/assignment/not-submitted/${courseId}/${termId}/${unitId}?limit=all`;
          break;
        case '4':
          endpoint = `/assignment/no-feedback/${courseId}/${termId}/${unitId}?limit=all`;
          break;
        default:
          throw new Error('Invalid report type');
      }

      const res = await axiosInstance.get(endpoint);
      setReportData(res.data.data.result);
    } catch (err) {
      setError('Failed to generate report');
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

  const renderFilters = () => (
    <Card className="mb-6">
      <CardContent className="space-y-4 pt-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
          <div className="space-y-2">
            <label className="text-sm font-medium">Report Type</label>
            <Select
              options={reportTypeOptions}
              value={reportType}
              onChange={(option: SingleValue<SelectOption>) =>
                setReportType(option)
              }
              placeholder="Select report type"
              styles={selectStyles}
              menuPortalTarget={document.body}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Course</label>
            <Select
              options={courses}
              value={selectedCourse}
              onChange={(option: SingleValue<SelectOption>) =>
                setSelectedCourse(option)
              }
              placeholder="Select course"
              styles={selectStyles}
              menuPortalTarget={document.body}
              isDisabled={!reportType}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Term</label>
            <Select
              options={terms}
              value={selectedTerm}
              onChange={(option: SingleValue<SelectOption>) =>
                setSelectedTerm(option)
              }
              placeholder="Select term"
              styles={selectStyles}
              menuPortalTarget={document.body}
              isDisabled={!reportType}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Unit</label>
            <Select
              options={units}
              value={selectedUnit}
              onChange={(option: SingleValue<SelectOption>) =>
                setSelectedUnit(option)
              }
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

          <div className="space-y-2">
            <Button
              onClick={handleGenerateReport}
              disabled={
                !reportType ||
                loading ||
                !selectedCourse ||
                !selectedTerm ||
                !selectedUnit
              }
              className="mt-8 h-10 w-full bg-watney text-white hover:bg-watney/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Generating...' : 'Generate Report'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderReportTable = () => {
    if (loading) {
      return (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      );
    }

    if (!reportData) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle>
            {reportType?.value === '1' && 'Students Who Submitted Assignments'}
            {reportType?.value === '2' && 'Students With Teacher Feedback'}
            {reportType?.value === '3' && 'Students Who Did Not Submit'}
            {reportType?.value === '4' && 'Students Without Feedback'}
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
                  {(reportType?.value === '1' || reportType?.value === '3') && (
                    <TableHead className="text-right">
                      Assignment Submitted
                    </TableHead>
                  )}
                  {reportType?.value === '2' && (
                    <TableHead className="text-right">Teacher Name</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportData.map((item, index) => {
                  // Choose the student object
                  const student = item?.student || item.studentId;

                  // Determine status
                  const status =
                    reportType?.value === '1'
                      ? 'Yes'
                      : reportType?.value === '3'
                        ? 'No'
                        : '';

                  // Get latest teacher feedback name (if any)
                  let teacherName = 'N/A';
                  if (reportType?.value === '2' && item.feedbacks?.length > 0) {
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

                  return (
                    <TableRow key={item._id || student?._id || index}>
                      <TableCell>
                        {student?.name ||
                          `${student?.firstName || ''} ${student?.lastName || ''}`.trim() ||
                          'Unknown Student'}
                      </TableCell>

                      <TableCell>{courseName}</TableCell>
                      <TableCell>{termName}</TableCell>
                      <TableCell>{unitName}</TableCell>

                      {(reportType?.value === '1' ||
                        reportType?.value === '3') && (
                        <TableCell className="text-right">{status}</TableCell>
                      )}
                      {reportType?.value === '2' && (
                        <TableCell className="text-right">
                          {teacherName}
                        </TableCell>
                      )}
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
    <div className="space-y-6">
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

      {reportType && <>{renderReportTable()}</>}
    </div>
  );
}
