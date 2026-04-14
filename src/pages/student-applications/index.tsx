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
import { Button } from '@/components/ui/button';
import {
  Eye,
  FileIcon,
  FileX2,
  Mail,
  MoveLeft,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Search,
  Download
} from 'lucide-react';
import { DataTablePagination } from '@/components/shared/data-table-pagination';
import { useNavigate } from 'react-router-dom';
import { BlinkingDots } from '@/components/shared/blinking-dots';
import Select from 'react-select';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import clsx from 'clsx';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';

interface StudentApplication {
  _id: string;
  studentId?: {
    _id?: string;
    name?: string;
    email?: string;
    title?: string;
    firstName?: string;
    initial?: string;
    lastName?: string;
    studentType?: string;
  };
  refId?: string;
  courseId?: {
    _id?: string;
    name?: string;
  };
  status?: 'applied' | 'approved' | 'cancelled';
}

interface CourseOption {
  value: string;
  label: string;
}

export default function StudentApplicationsPage() {
  const [applications, setApplications] = useState<StudentApplication[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<
    StudentApplication[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(100);
  const [searchTerm, setSearchTerm] = useState('');
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [terms, setTerms] = useState<CourseOption[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<CourseOption | null>(
    null
  );
  const [selectedTerm, setSelectedTerm] = useState<CourseOption | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

 const handleExport = async () => {
    try {
      setIsExporting(true);

      const params: Record<string, string> = {};
      if (selectedCourse?.value) params.courseId = selectedCourse.value;
      if (selectedTerm?.value) params.intakeId = selectedTerm.value;
      if (searchTerm) params.searchTerm = searchTerm;

      const res = await axiosInstance.get('/application-course/export', { params });
      const allData: any[] = res.data?.data?.result || [];

      // Exclude rejected (cancelled) — only applied & enrolled (approved)
      const filtered = allData.filter(
        (app: any) => app.status === 'applied' || app.status === 'approved'
      );

      if (filtered.length === 0) {
        toast({ title: 'No data to export.', className: 'bg-destructive text-white border-none' });
        return;
      }

      const escapeCell = (value: any): string => {
        if (value === null || value === undefined) return '';
        const str = String(value);
        return str.includes(',') || str.includes('"') || str.includes('\n')
          ? `"${str.replace(/"/g, '""')}"` : str;
      };

      const headers = [
        'Ref ID', 'Title', 'First Name', 'Initial', 'Last Name', 'Email', 'Phone',
        'Date of Birth', 'Gender', 'Nationality', 'Country of Birth', 'Country of Residence',
        'Ethnicity', 'Marital Status', 'Disability', 'Disability Details', 'NI Number',
        'Student Type',
        'Residential Address Line 1', 'Residential Address Line 2', 'Residential City',
        'Residential Country', 'Residential Post Code',
        'Postal Address Line 1', 'Postal Address Line 2', 'Postal City',
        'Postal Country', 'Postal Post Code',
        'Course Name', 'Course Code', 'Term', 'Application Status',
        'Institution 1', 'Qualification 1', 'Award Date 1', 'Grade 1',
        'Institution 2', 'Qualification 2', 'Award Date 2', 'Grade 2',
        'Institution 3', 'Qualification 3', 'Award Date 3', 'Grade 3',
        'Employer', 'Job Title', 'Employment Start Date', 'Employment Type',
        'Emergency Full Name', 'Emergency Relationship', 'Emergency Contact Number',
        'Emergency Email', 'Emergency Address',
        'Referee 1 Name', 'Referee 1 Address', 'Referee 1 Post Code', 'Referee 1 Email', 'Referee 1 Phone',
        'Referee 2 Name', 'Referee 2 Address', 'Referee 2 Post Code', 'Referee 2 Email', 'Referee 2 Phone'
      ];

      const rows = filtered.map((app: any) => {
        const s = app.studentId || {};
        const educationArr = s.educationData || [];
        const emp = s.currentEmployment || {};
        const course = app.courseId || {};
        const intake = app.intakeId || {};
        const ref1 = s.referee1 || {};
        const ref2 = s.referee2 || {};

        const studentTypeLabel =
          s.studentType === 'eu' ? 'Home'
          : s.studentType ? s.studentType.charAt(0).toUpperCase() + s.studentType.slice(1)
          : '';

        const statusLabel =
          app.status === 'approved' ? 'Enrolled' : app.status === 'applied' ? 'Applied' : '';

        // Extract up to 3 education records
        const edu1 = educationArr[0] || {};
        const edu2 = educationArr[1] || {};
        const edu3 = educationArr[2] || {};

        const formatDate = (dateString: string) => 
          dateString ? new Date(dateString).toLocaleDateString('en-GB') : '';

        return [
          app.refId, s.title, s.firstName, s.initial, s.lastName, s.email, s.phone,
          formatDate(s.dateOfBirth),
          s.gender, s.nationality, s.countryOfBirth, s.countryOfResidence,
          s.ethnicity, s.maritalStatus, s.disability, s.disabilityDetails, s.niNumber,
          studentTypeLabel,
          s.residentialAddressLine1, s.residentialAddressLine2, s.residentialCity,
          s.residentialCountry, s.residentialPostCode,
          s.postalAddressLine1, s.postalAddressLine2, s.postalCity,
          s.postalCountry, s.postalPostCode,
          course.name, course.courseCode, intake.termName, statusLabel,
          // Education 1
          edu1.institution, edu1.qualification, formatDate(edu1.awardDate), edu1.grade,
          // Education 2
          edu2.institution, edu2.qualification, formatDate(edu2.awardDate), edu2.grade,
          // Education 3
          edu3.institution, edu3.qualification, formatDate(edu3.awardDate), edu3.grade,
          // Employment & Emergency
          emp.employer, emp.jobTitle, formatDate(emp.startDate), emp.employmentType,
          s.emergencyFullName, s.emergencyRelationship, s.emergencyContactNumber,
          s.emergencyEmail, s.emergencyAddress,
          // Referees
          ref1.name, ref1.address, ref1.postCode, ref1.email, ref1.phone,
          ref2.name, ref2.address, ref2.postCode, ref2.email, ref2.phone
        ].map(escapeCell);
      });

      const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `student-applications-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Export error:', error);
      toast({ title: 'Failed to export data.', className: 'bg-destructive text-white border-none' });
    } finally {
      setIsExporting(false);
    }
  };
  
  const fetchData = async (
    page = 1,
    limit = 10,
    courseId?: string,
    intakeId?: string,
    searchTerm = ''
  ) => {
    try {
      setLoading(true);
      const params: {
        page: number;
        limit: number;
        courseId?: string;
        intakeId?: string;
        searchTerm?: string;
      } = {
        page,
        limit
      };

      if (courseId) {
        params.courseId = courseId;
      }
      if (intakeId) {
        params.intakeId = intakeId;
      }
      if (searchTerm) {
        params.searchTerm = searchTerm;
      }

      const res = await axiosInstance.get('/application-course', {
        params
      });
      const data = res.data.data.result || [];
      setApplications(data);
      setFilteredApplications(data);
      setTotalPages(res.data.data.meta.totalPage || 1);
    } catch (error) {
      console.error('Error fetching student applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await axiosInstance.get('/courses?status=1&limit=all');
      const data = res.data.data.result || [];
      const courseOptions = data.map((course: any) => ({
        value: course._id,
        label: course.name
      }));
      setCourses(courseOptions);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchTerms = async () => {
    try {
      const res = await axiosInstance.get('/terms?&limit=all');
      const data = res.data.data.result || [];
      const termOptions = data.map((term: any) => ({
        value: term._id,
        label: term.termName
      }));
      setTerms(termOptions);
    } catch (error) {
      console.error('Error fetching Terms:', error);
    }
  };

  // Initial data fetch without filters
  useEffect(() => {
    fetchData(currentPage, entriesPerPage);
    fetchCourses();
    fetchTerms();
  }, [currentPage, entriesPerPage]);

  const navigate = useNavigate();

  const handleCourseChange = (selectedOption: CourseOption | null) => {
    setSelectedCourse(selectedOption);
  };

  const handleTermChange = (selectedOption: CourseOption | null) => {
    setSelectedTerm(selectedOption);
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchData(
      1,
      entriesPerPage,
      selectedCourse?.value,
      selectedTerm?.value,
      searchTerm
    );
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const updateApplicationStatus = async (
    applicationId: string,
    status: 'approved' | 'cancelled'
  ) => {
    // 1. Optimistically update UI immediately
    setApplications((prev) =>
      prev.map((app) => (app._id === applicationId ? { ...app, status } : app))
    );
    setFilteredApplications((prev) =>
      prev.map((app) => (app._id === applicationId ? { ...app, status } : app))
    );

    setUpdatingStatus(applicationId);

    try {
      // 2. Fire API call in background
      await axiosInstance.patch(`/application-course/${applicationId}`, {
        status
      });

      toast({
        title:
          status === 'approved'
            ? 'Application approved successfully!'
            : 'Application rejected successfully!',
        className: 'bg-watney text-white border-none'
      });
    } catch (error) {
      // 3. Rollback if request fails
      setApplications((prev) =>
        prev.map((app) =>
          app._id === applicationId ? { ...app, status: 'applied' } : app
        )
      );
      setFilteredApplications((prev) =>
        prev.map((app) =>
          app._id === applicationId ? { ...app, status: 'applied' } : app
        )
      );
      toast({
        title: 'Failed to update application status.',
        className: 'bg-destructive text-white border-none'
      });
    } finally {
      setUpdatingStatus(null);
    }
  };

  return (
    <div className="space-y-4 ">
      {/* Header with Search & Back Button */}
      <div className="flex flex-row items-center justify-between">
        <div className="flex flex-row flex-nowrap items-center gap-4">
          <h2 className="whitespace-nowrap text-xl font-bold">
            Student Applications
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Button
            className="bg-watney text-white hover:bg-watney/90"
            onClick={() => navigate('/dashboard')}
          >
            <MoveLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
         
        </div>
      </div>
      
      {/* Filters Section */}
      <div className="flex flex-row items-center gap-4">
        {/* Search by Student Name/Email */}
        <div className="flex items-center space-x-4">
          <Input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Search by student name, email"
            className="h-9 min-w-[400px] bg-white rounded-sm"
          />
        </div>
        
        {/* Course Filter */}
        <div className="w-[250px]">
          <Select
            options={courses}
            value={selectedCourse}
            onChange={handleCourseChange}
            placeholder="Filter by course"
            isClearable
            className="text-sm"
            styles={{
              control: (base) => ({
                ...base,
                height: '36px',
                minHeight: '36px'
              }),
              valueContainer: (base) => ({
                ...base,
                height: '36px',
                padding: '0 8px'
              }),
              input: (base) => ({
                ...base,
                margin: '0px',
                paddingBottom: '0px',
                paddingTop: '0px'
              }),
              indicatorsContainer: (base) => ({
                ...base,
                height: '36px'
              })
            }}
          />
        </div>
        
        {/* Term Filter */}
        <div className="w-[250px]">
          <Select
            options={terms}
            value={selectedTerm}
            onChange={handleTermChange}
            placeholder="Filter by term"
            isClearable
            className="text-sm"
            styles={{
              control: (base) => ({
                ...base,
                height: '36px',
                minHeight: '36px'
              }),
              valueContainer: (base) => ({
                ...base,
                height: '36px',
                padding: '0 8px'
              }),
              input: (base) => ({
                ...base,
                margin: '0px',
                paddingBottom: '0px',
                paddingTop: '0px'
              }),
              indicatorsContainer: (base) => ({
                ...base,
                height: '36px'
              })
            }}
          />
        </div>
        
        <Button
          onClick={handleSearch}
          size="sm"
          className="min-w-[100px] border-none bg-watney text-white hover:bg-watney/90 h-9"
        >
          <Search className="mr-2 h-4 w-4" />
          Search
        </Button>
         <Button
            onClick={handleExport}
            disabled={isExporting}
            variant="outline"
          >
            <Download className="mr-2 h-4 w-4" />
            {isExporting ? 'Exporting...' : 'Export CSV'}
          </Button>
      </div>
      
      {/* Unified Table Container */}
      <div className="rounded-md bg-white p-4 shadow-sm">
        {loading ? (
          <div className="flex justify-center py-6">
            <BlinkingDots size="large" color="bg-watney" />
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="flex justify-center py-6 text-gray-500">
            {searchTerm || selectedCourse || selectedTerm
              ? 'No matching results found.'
              : 'No student applications found.'}
          </div>
        ) : (
          <>
            <Table className='text-xs'>
              <TableHeader>
                <TableRow>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Student Type</TableHead>
                  {/* <TableHead>Email</TableHead> */}
                  <TableHead>Course</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-32 text-center">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplications.map((app) => (
                  <TableRow key={app._id}>
                    <TableCell
                      className="cursor-pointer font-medium"
                      onClick={() =>
                        navigate(
                          `/dashboard/student-application/${app.studentId?._id}`
                        )
                      }
                    >
                      {app?.refId || '-'}
                    </TableCell>
                    <TableCell
                      className="cursor-pointer font-medium"
                      onClick={() =>
                        navigate(
                          `/dashboard/student-application/${app.studentId?._id}`
                        )
                      }
                    >
                      <div>

                      {app.studentId?.title} {app.studentId?.firstName}{' '}
                      {app.studentId?.initial} {app.studentId?.lastName}
                      </div>
                      <span className='text-[10px] text-gray-600'>

                       {app.studentId?.email ?? 'N/A'}
                      </span>
                    </TableCell>
                    <TableCell
                      className="cursor-pointer"
                      onClick={() =>
                        navigate(
                          `/dashboard/student-application/${app.studentId?._id}`
                        )
                      }
                    >
                      <Badge className="bg-watney text-white hover:bg-watney">
                        {app.studentId?.studentType === 'eu'
                          ? 'Home'
                          : app.studentId?.studentType
                              ?.charAt(0)
                              .toUpperCase() +
                            app.studentId?.studentType?.slice(1)}
                      </Badge>
                    </TableCell>
                    {/* <TableCell
                      className="cursor-pointer"
                      onClick={() =>
                        navigate(
                          `/dashboard/student-application/${app.studentId?._id}`
                        )
                      }
                    >
                      {app.studentId?.email ?? 'N/A'}
                    </TableCell> */}
                    <TableCell
                      className="cursor-pointer"
                      onClick={() =>
                        navigate(
                          `/dashboard/student-application/${app.studentId?._id}`
                        )
                      }
                    >
                      {app.courseId?.name ?? 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={clsx(
                          'capitalize',
                          app?.status === 'applied' && 'bg-blue-500 text-white',
                          app?.status === 'approved' &&
                            'bg-green-500 text-white',
                          app?.status === 'cancelled' && 'bg-red-500 text-white'
                        )}
                      >
                        {app?.status === 'approved'
                          ? 'Enrolled'
                          : app?.status === 'cancelled'
                            ? 'Rejected'
                            : app?.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            disabled={updatingStatus === app._id}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent
                          align="end"
                          className="border-gray-300 bg-white text-black"
                        >
                          {/* Assignment */}
                          <DropdownMenuItem
                            onClick={() =>
                              navigate(
                                `/dashboard/student-applications/${app?._id}/assignment/${app.studentId?._id}`
                              )
                            }
                          >
                            <FileIcon className="mr-2 h-4 w-4" />
                            Assignment
                          </DropdownMenuItem>

                          {/* Mail */}
                          <DropdownMenuItem
                            onClick={() =>
                              navigate(
                                `/dashboard/student-application/${app.studentId?._id}/${app?._id}/mails`
                              )
                            }
                          >
                            <Mail className="mr-2 h-4 w-4" />
                            Mail
                          </DropdownMenuItem>

                          {/* Applicant Details */}
                          <DropdownMenuItem
                            onClick={() =>
                              navigate(
                                `/dashboard/student-application/${app.studentId?._id}`
                              )
                            }
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            Applicant Details
                          </DropdownMenuItem>

                          {/* Status-based actions */}
                          {app.status === 'applied' && (
                            <>
                              <DropdownMenuItem
                                onClick={() =>
                                  updateApplicationStatus(app._id, 'approved')
                                }
                                disabled={updatingStatus === app._id}
                              >
                                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                                Approve Application
                              </DropdownMenuItem>

                              <DropdownMenuItem
                                onClick={() =>
                                  updateApplicationStatus(app._id, 'cancelled')
                                }
                                disabled={updatingStatus === app._id}
                              >
                                <XCircle className="mr-2 h-4 w-4 text-red-500" />
                                Reject Application
                              </DropdownMenuItem>
                            </>
                          )}

                          {app.status === 'approved' && (
                            <DropdownMenuItem
                              onClick={() =>
                                updateApplicationStatus(app._id, 'cancelled')
                              }
                              disabled={updatingStatus === app._id}
                            >
                              <XCircle className="mr-2 h-4 w-4 text-red-500" />
                              Reject Application
                            </DropdownMenuItem>
                          )}

                          {app.status === 'cancelled' && (
                            <DropdownMenuItem
                              onClick={() =>
                                updateApplicationStatus(app._id, 'approved')
                              }
                              disabled={updatingStatus === app._id}
                            >
                              <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                              Approve Application
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            <DataTablePagination
              pageSize={entriesPerPage}
              setPageSize={setEntriesPerPage}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>
    </div>
  );
}