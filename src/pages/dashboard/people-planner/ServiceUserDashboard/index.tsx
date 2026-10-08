import React, { useEffect, useState, useMemo } from 'react';
import moment from 'moment';
import {
  Calendar,
  Clock,
  MapPin,
  FileText,
  BookOpen,
  Bell,
  ArrowRight,
  Sparkles,
  User as UserIcon,
  Loader2,
  Pin,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useSelector } from 'react-redux';
import axiosInstance from '@/lib/axios';
import { cn } from '@/lib/utils';
import { useNavigate, useParams } from 'react-router-dom';
import { BlinkingDots } from '@/components/shared/blinking-dots';

// --- Interfaces ---

interface Training {
  _id: string;
  trainingId: {
    _id: string;
    name: string;
    description?: string;
    validityDays?: number;
  };
  status: string;
  assignedDate: string;
  expireDate: string;
  completedAt?: string;
}

interface Shift {
  _id: string;
  date: string;
  startTime: string;
  endTime: string;
  branch: string;
  area: string;
  serviceUser?: {
    firstName: string;
    lastName: string;
  };
  employee?: {
    firstName: string;
    lastName: string;
  };
  visitType?: string;
}

interface DocRequest {
  _id: string;
  documentType: string;
  status: string;
  createdAt: string;
}

interface Notice {
  _id: string;
  noticeType: string;
  noticeDescription: string;
  noticeDate: string;
  noticeBy?: {
    firstName: string;
    lastName: string;
  };
  status: string;
  noticeSetting: 'all' | 'department' | 'designation' | 'individual';
}

// --- Main Page Component ---

const ServiceUserDashboardPage = () => {
  const user = useSelector((state: any) => state.auth.user);
  const navigate = useNavigate();

  // State
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [scheduleData, setScheduleData] = useState<Shift[]>([]);
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [requests, setRequests] = useState<DocRequest[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalShifts, setTotalShifts] = useState(0);
  const [totalRequests, setTotalRequests] = useState(0);
  const { id, suid } = useParams();
  const [userData, setUserData] = useState(null);
  useEffect(() => {
    if (!suid) return;

    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [ schedulesRes, userRes] = await Promise.all([
          
          axiosInstance.get(`/schedules`, {
            params: {
              serviceUser: suid,
              today: true
            }
          }),
 
        
          axiosInstance.get(`/users/${suid}`)
        ]);

        setScheduleData(schedulesRes.data?.data?.result || []);
        setUserData(userRes.data.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [suid]);

  console.log(userData)

  const getShiftTime = (start: string, end: string) => `${start} - ${end}`;

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <BlinkingDots size="large" color="bg-theme" />
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-8 duration-500 animate-in fade-in ">
      {/* --- Header Section --- */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight text-slate-900">
            Welcome back, {userData?.firstName} {""}
            {userData?.lastName} 👋
          </h1>
          <p className="mt-1 flex items-center gap-2 text-slate-500">
            <Calendar className="h-4 w-4 text-theme" />
            {moment().format('dddd, Do MMMM YYYY')}
          </p>
        </div>
      </div>

      {/* --- Key Metrics --- */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            title: "Today's Tasks",
            value: scheduleData.length,
            icon: CheckCircle2,
            color: 'text-theme',
            bg: 'bg-theme/10',
            link: 'schedule'
          },
         
        ].map((stat, idx) => (
          <Card
            key={idx}
            onClick={() => navigate(stat.link)}
            className="group cursor-pointer border-none bg-white shadow-sm transition-all duration-200 hover:shadow-md"
          >
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="mb-1 text-sm font-medium text-slate-500">
                  {stat.title}
                </p>
                <div className="flex items-baseline gap-1">
                  <h3 className="text-3xl font-bold tracking-tight text-slate-900">
                    {stat.value}
                  </h3>
                </div>
              </div>
              <div className={cn('rounded-2xl p-4 transition-colors', stat.bg)}>
                <stat.icon className={cn('h-6 w-6', stat.color)} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* --- Main Dashboard Grid --- */}
      <div className="grid grid-cols-1 gap-6 ">
        {/* === Left Column (Feed) - Spans 8 cols === */}
        <div className="space-y-6 ">
          {/* Today's Tasks Section (theme Theme) */}
          <Card className="overflow-hidden border-theme/20 bg-white shadow-sm ">
            <CardHeader className="border-b border-theme/10 pb-4 ">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-1 rounded-full bg-theme" />
                  <div>
                    <CardTitle className="text-lg font-bold text-slate-900">
                      Today's Focus
                    </CardTitle>
                    <CardDescription className="text-slate-500">
                      Scheduled activities for {moment().format('MMMM Do')}
                    </CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {scheduleData.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center text-slate-500">
                  <div className="mb-3 rounded-full bg-theme/10 p-3">
                    <CheckCircle2 className="h-6 w-6 text-theme" />
                  </div>

                  <p className="text-sm text-slate-500">No tasks scheduled.</p>
                </div>
              ) : (
                <div className="divide-y divide-theme/10">
                  {scheduleData.map((task, i) => (
                    <div
                      key={i}
                      className="group flex cursor-pointer flex-col gap-4 p-5 transition-colors hover:bg-slate-50/50 md:flex-row md:items-center"
                      onClick={() => navigate('schedule')}
                    >
                      {/* Time Block */}
                      <div className="flex h-16 w-full flex-shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200/60 bg-slate-100/50 transition-colors group-hover:border-theme/30 sm:h-20 sm:w-20 sm:flex-col sm:gap-0">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          {moment(task.date).format('MMM')}
                        </span>
                        <span className="text-2xl font-bold leading-none text-slate-900 transition-colors group-hover:text-theme">
                          {moment(task.date).format('D')}
                        </span>
                        <span className="text-[10px] font-medium uppercase text-slate-400">
                          {moment(task.date).format('ddd')}
                        </span>
                      </div>

                      {/* Shift Details */}
                      <div className="flex flex-1 flex-col justify-center space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            {/* Displaying EMPLOYEE instead of Service User */}
                            <h4 className="text-base font-semibold text-slate-900 transition-colors group-hover:text-theme">
                              {task.employee
                                ? `${task.employee.firstName} ${task.employee.lastName}`
                                : 'Unallocated Staff'}
                            </h4>
                            <p className="text-sm text-slate-500">
                              {task.branch} • {task.area}
                            </p>
                          </div>
                          <Badge
                            variant="outline"
                            className="border-gray-300 bg-white font-normal text-slate-600 shadow-sm group-hover:border-theme/30"
                          >
                            {task.visitType || 'Regular Visit'}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-slate-500">
                          <div className="flex items-center gap-1.5 rounded-md border border-slate-100 bg-slate-50 px-2 py-1 transition-colors group-hover:border-theme/20 group-hover:bg-theme/5">
                            <Clock className="h-3.5 w-3.5 text-theme" />
                            <span className="font-medium text-slate-700">
                              {getShiftTime(task.startTime, task.endTime)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Shifts Timeline */}
          {/* <Card className="overflow-hidden border-slate-200/60 bg-white shadow-sm">
            <CardHeader className="border-b border-slate-100 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-1 rounded-full bg-theme" />
                  <div>
                    <CardTitle className="text-lg font-bold text-slate-900">
                      Upcoming Schedule
                    </CardTitle>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('upcoming-schedule')}
                  className="text-theme hover:bg-theme/10 hover:text-theme"
                >
                  View All <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {shifts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center text-slate-500">
                  <div className="mb-3 rounded-full bg-slate-50 p-4">
                    <Sparkles className="h-6 w-6 text-slate-400" />
                  </div>
                  <p className="font-medium">No upcoming Schedules</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-50">
                  {shifts.map((shift, i) => (
                    <div
                      key={i}
                      onClick={() => navigate('upcoming-schedule')}
                      className="group flex cursor-pointer flex-col gap-5 p-5 transition-colors hover:bg-slate-50/50 sm:flex-row"
                    >
                      <div className="flex h-16 w-full flex-shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200/60 bg-slate-100/50 transition-colors group-hover:border-theme/30 sm:h-20 sm:w-20 sm:flex-col sm:gap-0">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          {moment(shift.date).format('MMM')}
                        </span>
                        <span className="text-2xl font-bold leading-none text-slate-900 transition-colors group-hover:text-theme">
                          {moment(shift.date).format('D')}
                        </span>
                        <span className="text-[10px] font-medium uppercase text-slate-400">
                          {moment(shift.date).format('ddd')}
                        </span>
                      </div>

                      <div className="flex flex-1 flex-col justify-center space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="text-base font-semibold text-slate-900 transition-colors group-hover:text-theme">
                              {shift.employee
                                ? `${shift.employee.firstName} ${shift.employee.lastName}`
                                : 'Unallocated Staff'}
                            </h4>
                            <p className="text-sm text-slate-500">
                              {shift.branch} • {shift.area}
                            </p>
                          </div>
                          <Badge
                            variant="outline"
                            className="border-gray-300 bg-white font-normal  text-slate-600 shadow-sm group-hover:border-theme/30"
                          >
                            {shift.visitType || 'Regular Visit'}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-slate-500">
                          <div className="flex items-center gap-1.5 rounded-md border border-slate-100 bg-slate-50 px-2 py-1 transition-colors group-hover:border-theme/20 group-hover:bg-theme/5">
                            <Clock className="h-3.5 w-3.5 text-theme" />
                            <span className="font-medium text-slate-700">
                              {getShiftTime(shift.startTime, shift.endTime)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card> */}
        </div>
      </div>
    </div>
  );
};

export default ServiceUserDashboardPage;
