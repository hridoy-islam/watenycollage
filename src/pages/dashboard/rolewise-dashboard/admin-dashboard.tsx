
import { useState, useEffect } from 'react';
import axiosInstance from '@/lib/axios';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card';


import {
  Users,
  GraduationCap,
  BookOpen,
  FolderOpen,

} from 'lucide-react';

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
  const [totalStudent, settTotalStudent] = useState(0);
  const [totalApplicant, setTotalApplicant] = useState(10);
  const [totalCourse, setTotalCourse] = useState(0);
  const [totalTerm, setTotalTerm] = useState(0);
  const [totalJob, setTotalJob] = useState(0);

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
      settTotalStudent(studentRes.data.data?.meta?.total );
      setTotalApplicant(careerRes.data.data?.meta?.total );
      setTotalCourse(courseRes.data.data?.meta?.total );
      setTotalTerm(termRes.data.data?.meta?.total);
      setTotalJob(jobRes.data.data?.meta?.total);

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
      
        

        {/* Total Jobs */}
        <Card onClick={()=> navigate('/dashboard/jobs')} className='cursor-pointer'>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalJob}</div>
          </CardContent>
        </Card>
      </div>

     
    </div>
  );
}
