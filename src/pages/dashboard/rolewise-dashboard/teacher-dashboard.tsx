import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import axiosInstance from '@/lib/axios';
import { BlinkingDots } from '@/components/shared/blinking-dots';
import { useNavigate } from 'react-router-dom';

interface TeacherDashboardProps {
  user: {
    _id: string;
    name: string;
    role: string;
  };
}

export function TeacherDashboard({ user }: TeacherDashboardProps) {
  const [allCourses, setAllCourses] = useState<number>(0);
  const [pendingFeedbacks, setPendingFeedbacks] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch teacher courses
      const coursesResponse = await axiosInstance.get(`/teacher-courses`, {
        params: { teacherId: user._id, limit: 'all' }
      });
      const courses = coursesResponse?.data?.data.meta.total || 0;
      setAllCourses(courses);

      // Fetch pending assignment feedbacks
      const feedbackResponse = await axiosInstance.get(
        `/assignment/teacher-feedback/${user._id}?limit=all&fields=applicationId`
      );
      const pending = feedbackResponse?.data?.data?.result?.length || 0;
      setPendingFeedbacks(pending);

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user._id]);

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <BlinkingDots size="large" color="bg-watney" />
      </div>
    );
  }

  return (
    <div className="grid flex-1 grid-cols-5 gap-4">
      {/* Total Courses Card */}
      <Card onClick={() => navigate(`teachers/${user._id}`)} className='cursor-pointer'>
        <CardHeader>
          <CardTitle>Total Courses</CardTitle>
          <CardDescription>Number of courses assigned</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{allCourses}</div>
        </CardContent>
      </Card>

      {/* Pending Assignment Feedbacks Card */}
      <Card onClick={() => navigate(`teacher-assignments-feedback`)} className='cursor-pointer'>
        <CardHeader>
          <CardTitle>Pending Feedbacks</CardTitle>
          <CardDescription>Assignments waiting for your feedback</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{pendingFeedbacks}</div>
        </CardContent>
      </Card>
    </div>
  );
}
