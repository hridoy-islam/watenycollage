import { useState, useEffect } from 'react';
import axiosInstance from '@/lib/axios';
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
import { useNavigate } from 'react-router-dom';
import moment from 'moment-timezone';
import {
  Users,
  GraduationCap,
  BookOpen,
  FolderOpen,
  MessageSquare,
  Clock
} from 'lucide-react';
import { useSelector } from 'react-redux';

// --- Clock / Break Types ---
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

// --- Optional types for Admin dashboard data ---
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
  // --- Existing admin dashboard state ---
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
  const [totalStudent, setTotalStudent] = useState(0);
  const [totalApplicant, setTotalApplicant] = useState(0);
  const [totalCourse, setTotalCourse] = useState(0);
  const [totalTerm, setTotalTerm] = useState(0);
  const [totalJob, setTotalJob] = useState(0);
  const [pendingFeedbackCount, setPendingFeedbackCount] = useState(0);
  const { user } = useSelector((state: any) => state.auth);

  const navigate = useNavigate();

  // --- Clock system state ---
  const [timeLog, setTimeLog] = useState<TimeLog | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingAction, setPendingAction] = useState<
    'clockIn' | 'clockOut' | 'breakStart' | 'breakEnd' | null
  >(null);
  const [currentTime, setCurrentTime] = useState<string>('');

  // --- Get London time ---
  const getLondonTime = () => moment.tz('Europe/London').toISOString();

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

  const fetchTimeLog = async () => {
    try {
      const response = await axiosInstance.get(`/logs?userId=${user?._id}`);
      const logs = response.data?.data?.result || []; // ✅ Fixed: use .result like TeacherDashboard

      if (logs.length === 0) {
        setTimeLog(null);
        return;
      }

      const latestLog = logs[0];

      if (latestLog.clockIn && latestLog.clockOut) {
        setTimeLog(null);
      } else {
        setTimeLog(latestLog);
      }
    } catch (error) {
      console.error('Error fetching admin time logs:', error);
    }
  };

  const handleClockIn = async () => {
    try {
      await axiosInstance.post('/logs', {
        userId: user?._id,
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
        userId: user?._id,
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
        userId: user?._id,
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
        userId: user?._id,
        action: 'break',
        break: getLondonTime()
      });
      await fetchTimeLog();
    } catch (error) {
      console.error('Error ending break:', error);
    }
  };

  // --- Confirm / Execute Actions ---
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

  const isOnBreak = timeLog?.breaks?.some((b) => b.breakStart && !b.breakEnd);

  // --- Fetch dashboard + time log ---
  const fetchData = async () => {
    if (!user?._id) return; // ✅ Guard against missing user ID

    setLoading(true);
    try {
      const [
        studentRes,
        careerRes,
        courseRes,
        termRes,
        jobRes,
        assignmentsRes
      ] = await Promise.all([
        axiosInstance.get('/application-course', { params: { limit: 'all' } }),
        axiosInstance.get('/application-job', { params: { limit: 'all' } }),
        axiosInstance.get('/courses', { params: { limit: 'all' } }),
        axiosInstance.get('/terms', { params: { limit: 'all' } }),
        axiosInstance.get('/jobs', { params: { limit: 'all' } }),
        axiosInstance.get('/assignment?status=submitted&limit=all')
      ]);

      setTotalStudent(studentRes.data.data?.meta?.total || 0);
      setTotalApplicant(careerRes.data.data?.meta?.total || 0);
      setTotalCourse(courseRes.data.data?.meta?.total || 0);
      setTotalTerm(termRes.data.data?.meta?.total || 0);
      setTotalJob(jobRes.data.data?.meta?.total || 0);
      setPendingFeedbackCount(assignmentsRes.data.data?.meta?.total || 0);

      setStudentApplications(studentRes.data.data?.result || []);
      setCareerApplications(careerRes.data.data?.result || []);
      setCourses(courseRes.data.data?.result || []);
      setTerms(termRes.data.data?.result || []);
      setJobs(jobRes.data.data?.result || []);

      await fetchTimeLog();
    } catch (error) {
      console.error('Error fetching admin dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?._id) {
      fetchData();
    }
  }, [user?._id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Clock className="mr-2 h-4 w-4 animate-spin" />
        <span className="text-sm ">
          Loading dashboard data...
        </span>
      </div>
    );
  }

return (
    <Card className="flex-1 bg-white rounded-md shadow-sm p-2 h-auto min-h-[97.5vh] space-y-8 border-none">
      

      {/* Bottom Section: Stats Cards Grid */}
      <div>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          <Card
            onClick={() => navigate('/dashboard/student-applications')}
            className="cursor-pointer hover:border-watney/50 transition-colors group"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium ">Student Applications</CardTitle>
              <GraduationCap className="h-4 w-4  group-hover:text-watney transition-colors" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStudent}</div>
            </CardContent>
          </Card>

          <Card
            onClick={() => navigate('/dashboard/courses')}
            className="cursor-pointer hover:border-watney/50 transition-colors group"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium ">Total Courses</CardTitle>
              <BookOpen className="h-4 w-4  group-hover:text-watney transition-colors" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCourse}</div>
            </CardContent>
          </Card>

          <Card
            onClick={() => navigate('/dashboard/terms')}
            className="cursor-pointer hover:border-watney/50 transition-colors group"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium ">Total Intakes</CardTitle>
              <Users className="h-4 w-4  group-hover:text-watney transition-colors" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalTerm}</div>
            </CardContent>
          </Card>

          <Card
            onClick={() => navigate('/dashboard/jobs')}
            className="cursor-pointer hover:border-watney/50 transition-colors group"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium ">Total Jobs</CardTitle>
              <FolderOpen className="h-4 w-4  group-hover:text-watney transition-colors" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalJob}</div>
            </CardContent>
          </Card>

          <Card
            onClick={() => navigate('/dashboard/assignments-feedback')}
            className="cursor-pointer hover:border-watney/50 transition-colors group"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium ">Assignment Feedbacks</CardTitle>
              <MessageSquare className="h-4 w-4  group-hover:text-watney transition-colors" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingFeedbackCount}</div>
            </CardContent>
          </Card>
        </div>
      </div>

        <div className="">
        <Card className=" shadow-none">
          <CardHeader className="p-0 pb-4">
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
                    <div className="flex flex-row items-center gap-2 text-lg text-gray-600">
                      Working Time
                      {isOnBreak && (
                        <div className="text-lg font-medium text-orange-600">
                          On Break
                        </div>
                      )}
                    </div>
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
          <CardContent className="space-y-4 p-0">
            {/* Action Buttons */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-5">
              {!timeLog ? (
                <Button
                  onClick={() => confirmAction('clockIn')}
                  className="h-20 bg-watney text-xl font-semibold text-white hover:bg-watney/90"
                >
                  Clock In
                </Button>
              ) : (
                <>
                  {!isOnBreak ? (
                    <Button
                      onClick={() => confirmAction('breakStart')}
                      className="h-20 bg-blue-600 text-xl font-semibold text-white hover:bg-blue-700"
                    >
                      Start Break
                    </Button>
                  ) : (
                    <Button
                      onClick={() => confirmAction('breakEnd')}
                      className="h-20 bg-orange-600 text-xl font-semibold text-white hover:bg-orange-700"
                    >
                      End Break
                    </Button>
                  )}
                  {!isOnBreak && (
                    <Button
                      onClick={() => confirmAction('clockOut')}
                      className="h-20 bg-destructive text-xl font-semibold text-white hover:bg-destructive/90"
                    >
                      Clock Out
                    </Button>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* --- Confirmation Dialog (Logic Unchanged) --- */}
      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Action</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingAction === 'clockIn' && 'Are you sure you want to clock in?'}
              {pendingAction === 'clockOut' && 'Are you sure you want to clock out?'}
              {pendingAction === 'breakStart' && 'Are you sure you want to start your break?'}
              {pendingAction === 'breakEnd' && 'Are you sure you want to end your break?'}
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
    </Card>
  );
}
