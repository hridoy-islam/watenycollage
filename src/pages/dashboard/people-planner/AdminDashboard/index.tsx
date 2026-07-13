import { useState, useMemo, useEffect } from 'react';
import { Calendar, Users, Activity, Briefcase } from 'lucide-react';
import moment from 'moment';
import axiosInstance from '@/lib/axios';

// UI Components
import { Card, CardContent } from '@/components/ui/card';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

export default function PeoplePlannerAdminDashboardPage() {
  const [todaysSchedules, setTodaysSchedules] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const { user } = useSelector((state: any) => state.auth);
  const navigate = useNavigate();

  const currentDate = moment();
  const todayFormatted = currentDate.format('dddd, MMMM Do, YYYY');
  const todayDateString = currentDate.format('YYYY-MM-DD');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersRes = await axiosInstance.get(`/users`, {
          params: { limit: 'all', fields: 'firstName lastName role image' }
        });

        const schedulesRes = await axiosInstance.get(`/schedules`, {
          params: {
            date: todayDateString,
            limit: 'all',
            isDuplicate: false,
            completeSchedule: false
          }
        });

        setUsers(usersRes?.data?.data?.result || usersRes?.data?.data || []);
        setTodaysSchedules(
          schedulesRes?.data?.data?.result || schedulesRes?.data?.data || []
        );
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      }
    };
    fetchData();
  }, [todayDateString]);

  const filteredSchedules = useMemo(() => {
    return todaysSchedules.filter((schedule) => {
      const dateToCheck =
        schedule.startDate || schedule.plannedDate || schedule.date;
      const scheduleDate = moment(dateToCheck);
      return scheduleDate.isSame(todayDateString, 'day');
    });
  }, [todaysSchedules, todayDateString]);

  const totalServicesCount = filteredSchedules.length;

  const activeCarersCount = useMemo(() => {
    return users.filter((u) => u.role === 'employee').length;
  }, [users]);

  const totalServiceUsersCount = useMemo(() => {
    return users.filter((u) => u.role === 'serviceUser').length;
  }, [users]);

  return (
    <div className="rounded-lg bg-white p-5 min-h-screen">
      <div className="mx-auto space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Welcome Back! {user?.firstName || user?.name || 'Admin'}
            </h1>
            <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
              <Calendar className="h-4 w-4 text-slate-400" />
              {todayFormatted}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <StatsCard
            title="Today's Services"
            value={totalServicesCount}
            subtitle="Scheduled visits today"
            icon={Activity}
            color="indigo"
            to="#"
          />

          <StatsCard
            title="Active Carers"
            value={activeCarersCount}
            subtitle="Currently in the field"
            icon={Briefcase}
            color="emerald"
            to="#"
          />

          <StatsCard
            title="Total Service Users"
            value={totalServiceUsersCount}
            subtitle="Registered active clients"
            icon={Users}
            color="violet"
            to="#"
          />
        </div>
      </div>
    </div>
  );
}

function StatsCard({ title, value, subtitle, icon: Icon, color, to }: any) {
  const navigate = useNavigate();

  const colors: Record<string, string> = {
    indigo: 'bg-indigo-50 text-indigo-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    violet: 'bg-violet-50 text-violet-600'
  };

  return (
    <Card
      onClick={() => to && navigate(to)}
      className="cursor-pointer border border-gray-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <h3 className="mt-2 text-3xl font-bold tabular-nums tracking-tight">
              {value}
            </h3>
            <p className="mt-1 text-xs text-slate-400">{subtitle}</p>
          </div>
          <div className={`rounded-xl p-2.5 ${colors[color] || colors.indigo}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}