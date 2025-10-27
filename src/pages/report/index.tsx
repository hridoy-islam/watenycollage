import { useState, useEffect } from 'react';
import Select from 'react-select';
import moment from 'moment';
import axiosInstance from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Search } from 'lucide-react';
import { Label } from '@/components/ui/label';

interface User {
  _id: string;
  name: string;
  email: string;
}

interface Log {
  _id: string;
  userId: string;
  action: 'login' | 'logout';
  loginAt: string;
  logoutAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface DailyReport {
  date: string;
  duration: number;
  sessions: number;
  sessionDetails: SessionDetail[];
}

interface SessionDetail {
  loginAt: string;
  logoutAt?: string;
  duration: number;
}

interface UserReport {
  userId: string;
  userName: string;
  dailyReports: DailyReport[];
  totalDuration: number;
}

// BlinkingDots component for loading indicator
const BlinkingDots = ({
  size = 'medium',
  color = 'bg-watney'
}: {
  size?: 'small' | 'medium' | 'large';
  color?: string;
}) => {
  const sizeClasses = {
    small: 'w-2 h-2',
    medium: 'w-3 h-3',
    large: 'w-4 h-4'
  };

  return (
    <div className="flex space-x-2">
      <div
        className={`${sizeClasses[size]} ${color} animate-blink rounded-full`}
        style={{ animationDelay: '0ms' }}
      />
      <div
        className={`${sizeClasses[size]} ${color} animate-blink rounded-full`}
        style={{ animationDelay: '200ms' }}
      />
      <div
        className={`${sizeClasses[size]} ${color} animate-blink rounded-full`}
        style={{ animationDelay: '400ms' }}
      />
    </div>
  );
};

const ReportPage = () => {
  const { toast } = useToast();
  const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [startDate, setStartDate] = useState<Date>(
    moment().startOf('month').toDate()
  );
  const [endDate, setEndDate] = useState<Date>(
    moment().endOf('month').toDate()
  );
  const [reports, setReports] = useState<UserReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  const [allLogs, setAllLogs] = useState<Log[]>([]);
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    fetchUsers();
    fetchAllLogs();
  }, []);

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const response = await axiosInstance.get('/users?role=teacher&limit=all');
      setUsers(response.data.data?.result || response.data || []);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch users',
        variant: 'destructive'
      });
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchAllLogs = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/logs?limit=all');
      const logs: Log[] = response.data.data?.result || response.data || [];
      setAllLogs(logs);
      generateReportsFromLogs(logs, []);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch logs',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  };

  const calculateDuration = (logs: Log[]): DailyReport[] => {
    const dailyMap = new Map<
      string,
      {
        duration: number;
        sessions: number;
        sessionDetails: SessionDetail[];
      }
    >();

    logs.forEach((log) => {
      if (!log.loginAt || !log.logoutAt) return;

      const date = moment(log.loginAt).format('YYYY-MM-DD');
      const loginTime = moment(log.loginAt);
      const logoutTime = moment(log.logoutAt);
      const duration = logoutTime.diff(loginTime, 'minutes');

      const sessionDetail: SessionDetail = {
        loginAt: log.loginAt,
        logoutAt: log.logoutAt,
        duration: duration
      };

      if (!dailyMap.has(date)) {
        dailyMap.set(date, {
          duration: 0,
          sessions: 0,
          sessionDetails: []
        });
      }
      const entry = dailyMap.get(date)!;
      entry.duration += duration;
      entry.sessions += 1;
      entry.sessionDetails.push(sessionDetail);
    });

    return Array.from(dailyMap.entries())
      .map(([date, { duration, sessions, sessionDetails }]) => ({
        date,
        duration,
        sessions,
        sessionDetails
      }))
      .sort((a, b) => moment(a.date).diff(moment(b.date)));
  };

  const generateReportsFromLogs = (logs: Log[], selectedUsers: any[]) => {
    const userLogsMap = new Map<string, Log[]>();

    logs.forEach((log) => {
      const userId =
        typeof log.userId === 'string' ? log.userId : log.userId._id;
      if (!userLogsMap.has(userId)) {
        userLogsMap.set(userId, []);
      }
      userLogsMap.get(userId)!.push(log);
    });

    // If users are selected, only show those users, otherwise show all users with logs
    const usersToShow =
      selectedUsers.length > 0
        ? selectedUsers
        : Array.from(userLogsMap.keys()).map((userId) => {
            const userFromLogs = logs.find(
              (log) =>
                (typeof log.userId === 'string'
                  ? log.userId
                  : log.userId._id) === userId
            );
            const userName =
              userFromLogs && typeof userFromLogs.userId !== 'string'
                ? userFromLogs.userId?.name
                : userId;
            return {
              value: userId,
              label: userName
            };
          });

    const userReports: UserReport[] = usersToShow.map((user) => {
      const userLogs = userLogsMap.get(user.value) || [];
      const dailyReports = calculateDuration(
        // map logs to flatten userId to string for calculateDuration
        userLogs.map((log) => ({
          ...log,
          userId: typeof log.userId === 'string' ? log.userId : log.userId._id
        }))
      );
      const totalDuration = dailyReports.reduce(
        (sum, dr) => sum + dr.duration,
        0
      );
      return {
        userId: user.value,
        userName: user.label,
        dailyReports,
        totalDuration
      };
    });

    setReports(userReports);
  };

  const fetchLogs = async () => {
    if (selectedUsers.length === 0) {
      toast({
        title: 'Warning',
        description: 'Please select at least one user',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const userIds = selectedUsers.map((u) => u.value).join(',');
      const response = await axiosInstance.get('/logs?limit=all', {
        params: {
          userId: userIds,
          fromDate: moment(startDate).format('YYYY-MM-DD'),
          toDate: moment(endDate).format('YYYY-MM-DD')
        }
      });

      const logs: Log[] = response.data.data?.result || response.data || [];
      generateReportsFromLogs(logs, selectedUsers);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch logs',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatDateTime = (dateTime: string) => {
    return moment(dateTime).format('MMM DD, YYYY HH:mm');
  };

  const userOptions = users.map((user) => ({
    value: user._id,
    label: user.name || user.email
  }));

  return (
    <div className="rounded-md bg-white p-4">
      <div className="space-y-2">
        <Card className="rounded-md border border-gray-300 shadow-none">
          <CardHeader>
            <CardTitle>Employee Report</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:items-end">
              {/* From Date */}
              <div className="flex flex-col space-y-2 lg:col-span-2">
                <Label className="text-sm font-medium">From Date</Label>
                <DatePicker
                  selected={startDate}
                  onChange={(date) => date && setStartDate(date)}
                  selectsStart
                  startDate={startDate}
                  endDate={endDate}
                  maxDate={endDate}
                  className="h-10 w-full rounded-sm border border-gray-300 px-3 py-2"
                  dateFormat="MM/dd/yyyy"
                />
              </div>

              {/* To Date */}
              <div className="flex flex-col space-y-2 lg:col-span-2">
                <Label className="text-sm font-medium">To Date</Label>
                <DatePicker
                  selected={endDate}
                  onChange={(date) => date && setEndDate(date)}
                  selectsEnd
                  startDate={startDate}
                  endDate={endDate}
                  minDate={startDate}
                  className="h-10 w-full rounded-sm border border-gray-300 px-3 py-2"
                  dateFormat="MM/dd/yyyy"
                />
              </div>

              {/* Users */}
              <div className="flex flex-col space-y-2 lg:col-span-7">
                <Label className="text-sm font-medium">Select Users</Label>
                <Select
                  isMulti
                  value={selectedUsers}
                  onChange={(selected) => {
                    setSelectedUsers(selected || []);
                    // Remove this block:
                    // if (selected && selected.length > 0) {
                    //   const filteredLogs = allLogs.filter((log) => {
                    //     const logUserId = typeof log.userId === 'string' ? log.userId : log.userId._id;
                    //     return selected.some((user) => user.value === logUserId);
                    //   });
                    //   generateReportsFromLogs(filteredLogs, selected);
                    // } else {
                    //   generateReportsFromLogs(allLogs, []);
                    // }
                  }}
                  options={userOptions}
                  isLoading={usersLoading}
                  className="react-select-container"
                  classNamePrefix="react-select"
                  placeholder="Select users..."
                />
              </div>

              {/* Generate Button */}
              <div className="flex flex-col space-y-2 lg:col-span-1">
                <Button
                  onClick={fetchLogs}
                  disabled={loading}
                  className="h-10 w-full bg-watney text-white hover:bg-watney/90"
                >
                  {loading ? 'Generating...' : 'Generate'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading Indicator */}
        {loading && (
          <div className="flex justify-center py-10">
            <BlinkingDots size="large" color="bg-watney" />
          </div>
        )}

        {/* Reports */}
        {!loading && reports.length > 0 && (
          <>
            {reports.map((report) => (
              <div key={report.userId} className="overflow-hidden rounded-lg">
                <div className="py-4 pb-3">
                  <h3 className="text-lg font-semibold">{report.userName}</h3>
                </div>
                <div className="pb-6">
                  <div className="border border-gray-300">
                    <Table className="text-xs">
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead className="px-2 py-2 text-xs font-semibold ">
                            Date
                          </TableHead>
                          <TableHead className="px-2 py-2  text-xs font-semibold ">
                            Sessions
                          </TableHead>
                          <TableHead className="w-[30vw] px-2 py-2 text-xs font-semibold ">
                            Session Times
                          </TableHead>
                          <TableHead className="px-2 py-2 text-right text-xs font-semibold ">
                            Duration
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {report.dailyReports.length > 0 ? (
                          <>
                            {report.dailyReports.map((daily, idx) => (
                              <TableRow
                                key={daily.date}
                                className={
                                  idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                                }
                              >
                                <TableCell className="whitespace-nowrap px-2 py-1.5 text-xs font-semibold">
                                  {moment(daily.date).format('MMM DD, YYYY')}
                                </TableCell>

                                <TableCell className="px-2 py-1.5  text-xs font-semibold">
                                  {daily.sessions}
                                </TableCell>

                                <TableCell className="px-2 py-1.5 text-xs">
                                  <div className="max-h-24 space-y-0.5 overflow-y-auto">
                                    {daily.sessionDetails.map(
                                      (session, index) => (
                                        <div
                                          key={index}
                                          className="flex justify-between gap-2 border-b border-gray-100 pb-0.5 text-[11px] font-semibold last:border-0"
                                        >
                                          <span className="">
                                            Login:{' '}
                                            {moment(session.loginAt).format(
                                              'HH:mm'
                                            )}
                                          </span>
                                          <span className="">-</span>
                                          <span className="">
                                            Logout:{' '}
                                            {session.logoutAt
                                              ? moment(session.logoutAt).format(
                                                  'HH:mm'
                                                )
                                              : 'Active'}
                                          </span>
                                          <span className="ml-1 ">
                                            ({formatDuration(session.duration)})
                                          </span>
                                        </div>
                                      )
                                    )}
                                  </div>
                                </TableCell>

                                <TableCell className="px-2 py-1.5 text-right text-xs font-semibold">
                                  {formatDuration(daily.duration)}
                                </TableCell>
                              </TableRow>
                            ))}

                            {/* Total Row */}
                            <TableRow className="bg-gray-100 font-semibold">
                              <TableCell
                                colSpan={3}
                                className="px-2 py-2 text-xs"
                              >
                                Total
                              </TableCell>
                              <TableCell className="px-2 py-2 text-right text-xs font-semibold">
                                {formatDuration(report.totalDuration)}
                              </TableCell>
                            </TableRow>
                          </>
                        ) : (
                          <TableRow>
                            <TableCell
                              colSpan={4}
                              className="px-2 py-4 text-center text-xs text-gray-500"
                            >
                              No activity recorded
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}

        {!loading && !initialLoad && reports.length === 0 && (
          <Card className="shadow-none">
            <CardContent className="flex min-h-[200px] items-center justify-center">
              <p className="text-muted-foreground">
                {allLogs.length === 0
                  ? 'No logs data available'
                  : 'Select users and date range to generate report'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ReportPage;
