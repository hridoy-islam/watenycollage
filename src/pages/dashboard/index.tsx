import { StatCard } from '@/components/shared/stat-card';
import {
  BaggageClaim,
  Book,
  Briefcase,
  Calendar,
  Plus,
  RefreshCw
} from 'lucide-react';
import { useEffect, useState } from 'react';
import axiosInstance from '@/lib/axios';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Guideline from '@/components/shared/Guideline';

export default function DashboardPage() {
  const { user } = useSelector((state: any) => state.auth);

  const [applicationCount, setApplicationCount] = useState(0);
  const [newApplicationCount, setNewApplicationCount] = useState(0);
  const navigate = useNavigate();
  const [showGuidelines, setShowGuidelines] = useState(false);

  const handleRoute = () => {
  if (user.role === 'student') {
    navigate('/dashboard/course-application');
  } else if(user.role === 'applicant'){
    navigate('/dashboard/job-application');
  }
};
  useEffect(() => {
    if (user && user.isCompleted === false) {
      if (user.role === 'student') {
        navigate('/dashboard/student-form');
      } else if (user.role === 'applicant') {
        navigate('/dashboard/career-application');
      }
    }
  }, [user, navigate]);

  const fetchData = async () => {
    if (!user) return;

    try {
      if (user.role === 'admin') {
        const res1 = await axiosInstance.get('/applications');
        const res2 = await axiosInstance.get('/applications?seen=false');

        setApplicationCount(res1.data.data.meta.total || 0);
        setNewApplicationCount(res2.data.data.meta.total || 0);
      } else if (user.role === 'student') {
        // Student sees only their applications
        const res = await axiosInstance.get(
          `/application-course?studentId=${user._id}`
        );
        setApplicationCount(res.data.data.meta.total || 0);
      }else if (user.role === 'applicant') {
        // Student sees only their applications
        const res = await axiosInstance.get(
          `/application-job?applicantId=${user._id}`
        );
        setApplicationCount(res.data.data.meta.total || 0);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  useEffect(() => {
    if (!user) return;

    fetchData();

    const hasVisited = localStorage.getItem(`hasVisitedBefore`);
    if (hasVisited === 'false') {
      setShowGuidelines(true);
      localStorage.setItem(`hasVisitedBefore`, 'true');
    }
  }, [user]);

  const stats =
    user?.role === 'admin'
      ? [
          {
            title: 'Total Applications',
            value: applicationCount.toString(),
            href: 'applications'
          },
          {
            title: 'New Applications',
            value: newApplicationCount.toString(),
            href: 'new-applications'
          }
        ]
      : [
          {
            title: 'Applications',
            value: applicationCount.toString(),
            href: 'applications'
          }
        ];

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      {showGuidelines && (
        <Guideline
          open={showGuidelines}
          onClose={() => setShowGuidelines(false)}
        />
      )}

      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-2xl font-bold">Applications</h2>
        {/* Reload Button (optional) */}
        {/* <div className="flex items-center space-x-2">
          <Button
            className="bg-supperagent text-white hover:bg-supperagent/90"
            size="sm"
            onClick={fetchData}
            disabled={isLoading}
          >
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            Reload Data
          </Button>
        </div> */}
      </div>

      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div className="h-full w-full">
              <StatCard
                key={stat.title}
                href={stat.href}
                title={stat.title}
                value={stat.value}
              />
            </div>
          ))}

          {/* New Application */}
          <div
            className="group flex h-full w-full cursor-pointer flex-col items-center justify-center rounded-lg bg-white p-4 text-center shadow-sm hover:bg-watney hover:text-white"
            onClick={handleRoute}
          >
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 transition-colors group-hover:bg-white group-hover:text-watney">
              <Plus className="h-8 w-8" />
            </div>
            <h3 className="text-sm font-medium text-gray-600 transition-colors group-hover:text-white">
              New Application
            </h3>
          </div>

          {/* Courses */}
          <div
            className="group flex h-full w-full cursor-pointer flex-col items-center justify-center rounded-lg bg-white p-4 text-center shadow-sm hover:bg-watney  hover:text-white"
            onClick={() => navigate('/dashboard/courses')}
          >
            <div className="mb-2 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-blue-100 text-blue-600 transition-colors group-hover:bg-white group-hover:text-watney">
              <Book className="h-8 w-8" />
            </div>
            <h3 className="text-sm font-medium text-gray-600 transition-colors group-hover:text-white">
              Courses
            </h3>
          </div>

          {/* Terms */}
          <div
            className="group flex h-full w-full cursor-pointer flex-col items-center justify-center rounded-lg bg-white p-4 text-center shadow-sm hover:bg-watney hover:text-white"
            onClick={() => navigate('/dashboard/terms')}
          >
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 transition-colors group-hover:bg-white group-hover:text-watney ">
              <Calendar className="h-8 w-8" />
            </div>
            <h3 className="text-sm font-medium text-gray-600 transition-colors group-hover:text-white">
              Terms
            </h3>
          </div>

          {/* Jobs */}
          <div
            className="group flex h-full w-full cursor-pointer flex-col items-center justify-center rounded-lg bg-white p-4 text-center shadow-sm hover:bg-watney hover:text-white"
            onClick={() => navigate('/dashboard/jobs')}
          >
            <div className="mb-2 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-blue-100 text-blue-600 transition-colors group-hover:bg-white group-hover:text-watney">
              <Briefcase className="h-8 w-8" />
            </div>
            <h3 className="text-sm font-medium text-gray-600 transition-colors group-hover:text-white">
              Jobs
            </h3>
          </div>
        </div>
      </div>
    </div>
  );
}
