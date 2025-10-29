import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import axiosInstance from '@/lib/axios';
import { BlinkingDots } from '@/components/shared/blinking-dots';
import { useNavigate } from 'react-router-dom';
import moment from 'moment-timezone';

interface TeacherDashboardProps {
  user: {
    _id: string;
    name: string;
    role: string;
  };
}

interface TimeLog {
  _id: string;
  clockIn?: string;
  clockOut?: string;
  breaks: Array<{
    breakStart?: string;
    breakEnd?: string;
  }>;
  action: string;
}

export function TeacherDashboard({ user }: TeacherDashboardProps) {
  const [allCourses, setAllCourses] = useState<number>(0);
  const [pendingFeedbacks, setPendingFeedbacks] = useState<number>(0);
  const [studentListCount, setStudentListCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [timeLog, setTimeLog] = useState<TimeLog | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingAction, setPendingAction] = useState<
    'clockIn' | 'clockOut' | 'breakStart' | 'breakEnd' | null
  >(null);
  const [currentTime, setCurrentTime] = useState<string>('');
  const navigate = useNavigate();

  const getLondonTime = () => {
    return moment.tz('Europe/London').toISOString();
  };

  // Helper: Format UTC ISO string to London date/time
  const formatToLondon = (
    isoString: string | undefined,
    format = 'DD/MM/YYYY HH:mm'
  ) => {
    if (!isoString) return '—';
    return moment.utc(isoString).tz('Europe/London').format(format);
  };

  // Helper: Calculate net working minutes (in UTC to avoid DST issues)
  const calculateNetWorkingSeconds = (log: TimeLog): number => {
    if (!log.clockIn) return 0;

    const clockIn = moment.tz(log.clockIn, 'Europe/London');
    const clockOut = log.clockOut
      ? moment.tz(log.clockOut, 'Europe/London')
      : moment.tz('Europe/London'); // use now in London time if no clockOut

    let totalBreakMs = 0;
    for (const brk of log.breaks || []) {
      if (brk.breakStart) {
        const start = moment.tz(brk.breakStart, 'Europe/London');
        // Use breakEnd if exists, otherwise if ongoing, use current London time
        const end = brk.breakEnd
          ? moment.tz(brk.breakEnd, 'Europe/London')
          : moment.tz('Europe/London');
        if (end.isAfter(start)) {
          totalBreakMs += end.diff(start);
        }
      }
    }

    const totalWorkMs = clockOut.diff(clockIn);
    const netWorkMs = Math.max(0, totalWorkMs - totalBreakMs);
    return Math.floor(netWorkMs / 1000);
  };

  const formatDurationWithSeconds = (totalSeconds: number) => {
    if (totalSeconds <= 0) return '0s';

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const parts = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);

    return parts.join(' ');
  };

  // Update current time every second
  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(formatToLondon(getLondonTime(), 'DD/MM/YYYY HH:mm:ss'));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // ✅ Fetch teacher dashboard data
  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch teacher courses
      const coursesResponse = await axiosInstance.get(`/teacher-courses`, {
        params: { teacherId: user._id, limit: 'all' }
      });
      const courses = coursesResponse?.data?.data?.meta?.total || 0;
      setAllCourses(courses);

      // Fetch pending assignment feedbacks
      const feedbackResponse = await axiosInstance.get(
        `/assignment/teacher-feedback/${user._id}?limit=all&fields=applicationId`
      );
      const pending = feedbackResponse?.data?.data?.result?.length || 0;
      setPendingFeedbacks(pending);

      // Fetch all students assigned to teacher
      const studentsResponse = await axiosInstance.get(
        `/application-course/teacher/${user._id}?limit=all`
      );
      const students = studentsResponse?.data?.data?.meta.total || 0;
      setStudentListCount(students);

      await fetchTimeLog();
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTimeLog = async () => {
    try {
      const response = await axiosInstance.get(`/logs?userId=${user._id}`);
      const logs = response.data?.data?.result || [];

      if (logs.length === 0) {
        setTimeLog(null);
        return;
      }

      const latestLog = logs[0];

      if (latestLog.clockIn && latestLog.clockOut) {
        setTimeLog(null);
      } else {
        // Active session (clocked in but not out)
        setTimeLog(latestLog);
      }
    } catch (error) {
      console.error('Error fetching time logs:', error);
    }
  };

  const handleClockIn = async () => {
    try {
      await axiosInstance.post('/logs', {
        userId: user._id,
        action: 'clockIn',
        clockIn: getLondonTime()
      });
      await fetchTimeLog();
    } catch (error) {
      console.error('Error clocking in:', error);
    }
  };

  const handleClockOut = async () => {
    try {
      await axiosInstance.patch('/logs', {
        userId: user._id,
        action: 'clockOut',
        clockOut: getLondonTime()
      });
      await fetchTimeLog();
    } catch (error) {
      console.error('Error clocking out:', error);
    }
  };

  const handleBreakStart = async () => {
    try {
      await axiosInstance.patch('/logs', {
        userId: user._id,
        action: 'break',
        break: getLondonTime()
      });
      await fetchTimeLog();
    } catch (error) {
      console.error('Error starting break:', error);
    }
  };

  const handleBreakEnd = async () => {
    try {
      await axiosInstance.patch('/logs', {
        userId: user._id,
        action: 'break',
        break: getLondonTime()
      });
      await fetchTimeLog();
    } catch (error) {
      console.error('Error ending break:', error);
    }
  };

  // ✅ Confirmation handling
  const confirmAction = (
    action: 'clockIn' | 'clockOut' | 'breakStart' | 'breakEnd'
  ) => {
    setPendingAction(action);
    setShowConfirm(true);
  };

  const executeAction = () => {
    if (!pendingAction) return;

    switch (pendingAction) {
      case 'clockIn':
        handleClockIn();
        break;
      case 'clockOut':
        handleClockOut();
        break;
      case 'breakStart':
        handleBreakStart();
        break;
      case 'breakEnd':
        handleBreakEnd();
        break;
    }

    setShowConfirm(false);
    setPendingAction(null);
  };

  // ✅ Check if currently on break
  const isOnBreak = timeLog?.breaks?.some(
    (breakItem) => breakItem.breakStart && !breakItem.breakEnd
  );

  useEffect(() => {
    if (user._id) fetchData();
  }, [user._id]);

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <BlinkingDots size="large" color="bg-watney" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Time & Action Card (Half-width on md+) */}
      <div className="">
        <Card className="bg-gray-100  shadow-none">
          <CardHeader className='p-0 pb-4'>
            <CardTitle className="text-xl text-gray-700">
              <div className="flex flex-row items-center gap-20">
                <div>
                  <div className="text-lg text-gray-600">Current Time</div>
                  <div className="text-xl font-bold text-gray-800">
                    {currentTime}
                  </div>
                </div>

                {/* Working Time (if clocked in) */}
                {timeLog && (
                  <div>
                    <div className="text-lg text-gray-600 flex flex-row items-center gap-2">Working Time {isOnBreak && (
                      <div className=" text-lg font-medium text-orange-600">
                        On Break
                      </div>
                    )}</div>
                    <div className="text-xl font-bold text-gray-800">
                      {formatDurationWithSeconds(
                        calculateNetWorkingSeconds(timeLog)
                      )}
                    </div>
                    
                  </div>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className=" space-y-4 p-0">
            {/* Action Buttons */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
              {!timeLog ? (
                <Button
                  onClick={() => confirmAction('clockIn')}
                  className=" h-20 bg-watney text-xl text-white hover:bg-watney/90 font-semibold"
                >
                  Clock In
                </Button>
              ) : (
                <>
                  {!isOnBreak ? (
                    <Button
                      onClick={() => confirmAction('breakStart')}
                      className=" h-20 bg-blue-600  text-xl text-white hover:bg-blue-700 font-semibold"
                    >
                      Start Break
                    </Button>
                  ) : (
                    <Button
                      onClick={() => confirmAction('breakEnd')}
                      className=" h-20 bg-orange-600 text-xl text-white hover:bg-orange-700 font-semibold"
                    >
                      End Break
                    </Button>
                  )}
                  {!isOnBreak && (
                    <Button
                      onClick={() => confirmAction('clockOut')}
                      className=" h-20 bg-destructive text-xl text-white hover:bg-destructive/90 font-semibold"
                    >
                      Clock Out
                    </Button>
                  )}
                </>
              )}
            </div>
         
          </CardContent>
        </Card>

        {/* Placeholder to maintain half-width layout */}
        <div></div>
      </div>

      {/* Dashboard Summary Cards (unchanged) */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
        {/* Courses */}
        <Card
          onClick={() => navigate(`teachers/courses/${user._id}`)}
          className="cursor-pointer transition-colors hover:bg-gray-50"
        >
          <CardHeader>
            <CardTitle>All Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{allCourses}</div>
          </CardContent>
        </Card>

        {/* Feedbacks */}
        <Card
          onClick={() => navigate(`teacher-assignments-feedback`)}
          className="cursor-pointer transition-colors hover:bg-gray-50"
        >
          <CardHeader>
            <CardTitle>Pending Feedbacks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{pendingFeedbacks}</div>
          </CardContent>
        </Card>

        {/* Students */}
        <Card
          onClick={() => navigate(`teacher/student-applications`)}
          className="cursor-pointer transition-colors hover:bg-gray-50"
        >
          <CardHeader>
            <CardTitle>Student List</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{studentListCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Action</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingAction === 'clockIn' &&
                'Are you sure you want to clock in?'}
              {pendingAction === 'clockOut' &&
                'Are you sure you want to clock out?'}
              {pendingAction === 'breakStart' &&
                'Are you sure you want to start your break?'}
              {pendingAction === 'breakEnd' &&
                'Are you sure you want to end your break?'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={executeAction}
              className="bg-watney text-white hover:bg-watney/90"
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
