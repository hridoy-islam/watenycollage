'use client';
import { useState, useEffect } from 'react';
import axiosInstance from '@/lib/axios';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  Users,
  Briefcase,
  GraduationCap,
  Calendar,
  BookOpen,
  FolderOpen,
  Eye
} from 'lucide-react';
import moment from 'moment';
import { DataTablePagination } from '@/components/shared/data-table-pagination';
import { useNavigate } from 'react-router-dom';

// Define types with optional chaining support
interface StudentApplication {
  _id: string;
  studentId?: { name?: string; email?: string };
  courseId?: { title?: string };
  status?: string;
}

interface CareerApplication {
  _id: string;
  applicantId?: { name?: string; email?: string };
  jobId?: { jobTitle?: string; company?: string };
  status?: string;
}

interface Course {
  _id: string;
  name?: string;
}

interface Term {
  _id: string;
  name?: string;
  termName?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
}

interface Job {
  _id: string;
  jobTitle?: string;
  company?: string;
  location?: string;
  type?: string;
  applicationDeadline?: string;
}

export function AdminDashboard() {
  const [studentApplications, setStudentApplications] = useState<
    StudentApplication[]
  >([]);
  const [careerApplications, setCareerApplications] = useState<
    CareerApplication[]
  >([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [studentTotalPages, setStudentTotalPages] = useState(1);
  const [careerTotalPages, setCareerTotalPages] = useState(1);
  const [courseTotalPages, setCourseTotalPages] = useState(1);
  const [termTotalPages, setTermTotalPages] = useState(1);
  const [jobTotalPages, setJobTotalPages] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [totalStudent, settTotalStudent] = useState(10);
  const [totalApplicant, setTotalApplicant] = useState(10);
  const [totalCourse, setTotalCourse] = useState(10);
  const [totalTerm, setTotalTerm] = useState(10);
  const [totalJob, setTotalJob] = useState(10);

  const fetchData = async (page = 1, entriesPerPage = 10) => {
    try {
      const [studentRes, careerRes, courseRes, termRes, jobRes] =
        await Promise.all([
          axiosInstance.get('/application-course', {
            params: { page, limit: entriesPerPage }
          }),
          axiosInstance.get('/application-job', {
            params: { page, limit: entriesPerPage }
          }),
          axiosInstance.get('/courses', {
            params: { page, limit: entriesPerPage }
          }),
          axiosInstance.get('/terms', {
            params: { page, limit: entriesPerPage }
          }),
          axiosInstance.get('/jobs', {
            params: { page, limit: entriesPerPage }
          })
        ]);

      // Set individual total pages
      setStudentTotalPages(studentRes.data.data?.meta?.totalPage || 1);
      setCareerTotalPages(careerRes.data.data?.meta?.totalPage || 1);
      setCourseTotalPages(courseRes.data.data?.meta?.totalPage || 1);
      setTermTotalPages(termRes.data.data?.meta?.totalPage || 1);
      setJobTotalPages(jobRes.data.data?.meta?.totalPage || 1);
      settTotalStudent(studentRes.data.data?.meta?.total || 1);
      setTotalApplicant(careerRes.data.data?.meta?.total || 1);
      setTotalCourse(courseRes.data.data?.meta?.total || 1);
      setTotalTerm(termRes.data.data?.meta?.total || 1);
      setTotalJob(jobRes.data.data?.meta?.total || 1);

      // Set data
      setStudentApplications(studentRes.data.data?.result || []);
      setCareerApplications(careerRes.data.data?.result || []);
      setCourses(courseRes.data.data?.result || []);
      setTerms(termRes.data.data?.result || []);
      setJobs(jobRes.data.data?.result || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(currentPage, entriesPerPage);
  }, [currentPage, entriesPerPage]);

  const navigate = useNavigate();

  return (
    <div className="flex-1 space-y-4  ">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
        {/* Student Applications */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Student Applications
            </CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudent}</div>
          </CardContent>
        </Card>

        {/* Career Applications */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Career Applications
            </CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalApplicant}</div>
          </CardContent>
        </Card>

        {/* Total Courses */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCourse}</div>
          </CardContent>
        </Card>

        {/* Total Intakes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Intakes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTerm}</div>
          </CardContent>
        </Card>

        {/* Total Jobs */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalJob}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}

      <Tabs defaultValue="student-applications" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="student-applications">Students</TabsTrigger>
          <TabsTrigger value="career-applications">Careers</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="terms">Terms</TabsTrigger>
          <TabsTrigger value="jobs">Jobs</TabsTrigger>
        </TabsList>

        {/* Student Applications Tab */}
        <TabsContent value="student-applications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Student Applications</CardTitle>
              <CardDescription>
                Review and manage course applications
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p>Loading...</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead className='text-right'>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {studentApplications.map((app) => (
                      <TableRow key={app._id}>
                        <TableCell className="font-medium">
                          {app.studentId?.title} {app.studentId?.firstName}{' '}
                          {app.studentId?.initial} {app.studentId?.lastName}
                        </TableCell>
                        <TableCell>{app.studentId?.email ?? 'N/A'}</TableCell>
                        <TableCell>{app.courseId?.name ?? 'N/A'}</TableCell>
                        <TableCell className="flex text-right flex-row item-center justify-end gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            className='bg-watney hover:bg-watney/90 '
                            onClick={() => navigate(`/dashboard/student-application/${app.studentId?._id}`)}
                          >
                            <Eye className="h-4 w-4 text-white" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
              <DataTablePagination
                pageSize={entriesPerPage}
                setPageSize={setEntriesPerPage}
                currentPage={currentPage}
                totalPages={studentTotalPages}
                onPageChange={setCurrentPage}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Career Applications Tab */}
        <TabsContent value="career-applications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Career Applications</CardTitle>
              <CardDescription>
                Review and manage job applications
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p>Loading...</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Applicant Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Job Title</TableHead>
                      <TableHead>Application Deadline</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {careerApplications.map((app) => (
                      <TableRow key={app._id}>
                        <TableCell className="font-medium">
                          {app.applicantId?.title} {app.applicantId?.firstName}{' '}
                          {app.applicantId?.initial} {app.applicantId?.lastName}
                        </TableCell>
                        <TableCell>{app.applicantId?.email ?? 'N/A'}</TableCell>
                        <TableCell>{app.jobId?.jobTitle ?? 'N/A'}</TableCell>
                        <TableCell>
                          {app.jobId?.applicationDeadline
                            ? moment(app.jobId.applicationDeadline).format(
                                'MM-DD-YYYY'
                              )
                            : 'N/A'}
                        </TableCell>

                        <TableCell className="flex text-right flex-row item-center justify-end gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            className='bg-watney hover:bg-watney/90 '
                            onClick={() => navigate(`/dashboard/career-application/${app.applicantId?._id}`)}
                          >
                            <Eye className="h-4 w-4 text-white" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
              <DataTablePagination
                pageSize={entriesPerPage}
                setPageSize={setEntriesPerPage}
                currentPage={currentPage}
                totalPages={careerTotalPages}
                onPageChange={setCurrentPage}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Courses Tab */}
        <TabsContent value="courses" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Courses</CardTitle>
                <CardDescription>List of available courses</CardDescription>
              </div>
              <div>
                <Button
                  className="bg-watney text-white hover:bg-watney/90"
                  onClick={() => navigate('/dashboard/courses')}
                >
                  Go To Course Page
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p>Loading...</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Course Name</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {courses.map((course) => (
                      <TableRow key={course._id}>
                        <TableCell className="font-medium">
                          {course.name ?? 'Unnamed Course'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
              <DataTablePagination
                pageSize={entriesPerPage}
                setPageSize={setEntriesPerPage}
                currentPage={currentPage}
                totalPages={courseTotalPages}
                onPageChange={setCurrentPage}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Terms Tab */}
        <TabsContent value="terms" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Academic Terms</CardTitle>
                <CardDescription>List of academic terms</CardDescription>
              </div>
              <div>
                <Button
                  className="bg-watney text-white hover:bg-watney/90"
                  onClick={() => navigate('/dashboard/terms')}
                >
                  Go To Term Page
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p>Loading...</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {terms.map((term) => (
                      <TableRow key={term._id}>
                        <TableCell className="font-medium">
                          {term.name ?? term.termName ?? 'Unnamed Term'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
              <DataTablePagination
                pageSize={entriesPerPage}
                setPageSize={setEntriesPerPage}
                currentPage={currentPage}
                totalPages={termTotalPages}
                onPageChange={setCurrentPage}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Jobs Tab */}
        <TabsContent value="jobs" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Job Listings</CardTitle>
                <CardDescription>
                  List of available job postings
                </CardDescription>
              </div>
              <div>
                <Button
                  className="bg-watney text-white hover:bg-watney/90"
                  onClick={() => navigate('/dashboard/jobs')}
                >
                  Go To Job Page
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p>Loading...</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Application Deadline</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {jobs.map((job) => (
                      <TableRow key={job._id}>
                        <TableCell className="font-medium">
                          {job.jobTitle ?? 'Untitled Job'}
                        </TableCell>

                        <TableCell>
                          {job.applicationDeadline
                            ? moment(job.applicationDeadline).format(
                                'MM-DD-YYYY'
                              )
                            : 'N/A'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
              <DataTablePagination
                pageSize={entriesPerPage}
                setPageSize={setEntriesPerPage}
                currentPage={currentPage}
                totalPages={jobTotalPages}
                onPageChange={setCurrentPage}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
