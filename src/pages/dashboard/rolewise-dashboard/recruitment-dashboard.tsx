import { useEffect, useState } from 'react';
import axiosInstance from '@/lib/axios';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  FolderOpen,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ApplicantDashboard } from './applicant-dashboard';

interface CareerApplication {
  _id: string;
  applicantId?: { name?: string; email?: string };
  jobId?: { jobTitle?: string; company?: string };
  status?: string;
}

export function RecruitmentDashboard() {
  const { user } = useSelector((state: any) => state.auth);
  const [careerApplications, setCareerApplications] = useState<CareerApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [totalJob, setTotalJob] = useState(0);

  const fetchData = async (page = 1, entriesPerPage = 10) => {
    try {
      const [careerRes, jobRes] = await Promise.all([
        axiosInstance.get('/application-job', {
          params: { page, limit: entriesPerPage }
        }),
        axiosInstance.get('/jobs', {
          params: { page, limit: entriesPerPage }
        })
      ]);
      setTotalJob(jobRes.data.data?.meta?.total);
      setCareerApplications(careerRes.data.data?.result || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchData(currentPage, entriesPerPage);
    } else {
      setLoading(false);
    }
  }, [currentPage, entriesPerPage, user]);

  const navigate = useNavigate();

  if (user?.role === 'applicant') {
    return <ApplicantDashboard user={user} />;
  }

  return (
    <div className="flex-1 space-y-4  ">
     
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
        <Card onClick={() => navigate('/dashboard/recruitment/jobs')} className="cursor-pointer">
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
