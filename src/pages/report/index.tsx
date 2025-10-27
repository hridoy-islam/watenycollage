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
import { Label } from '@/components/ui/label';
import { DataTablePagination } from '@/components/shared/data-table-pagination';

interface User {
  _id: string;
  name: string;
  email: string;
}

interface Log {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  action: 'login' | 'logout';
  loginAt: string;
  logoutAt?: string;
  createdAt: string;
  updatedAt: string;
  date: string;
  duration: number;
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
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(200);

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

  const fetchLogs = async (page: number, entriesPerPage: number) => {
    setLoading(true);
    try {
      const params: any = {
        page,
        limit: entriesPerPage
      };

      if (selectedUsers?.length > 0) {
        params.userId = selectedUsers.map((u: any) => u.value).join(',');
      }

      if (startDate && endDate) {
        params.fromDate = moment(startDate).format('YYYY-MM-DD');
        params.toDate = moment(endDate).format('YYYY-MM-DD');
      }

      const response = await axiosInstance.get('/logs', { params });
      const logsData: Log[] = response.data.data?.result || response.data || [];
      setLogs(logsData);
      setTotalPages(response.data.data?.meta?.totalPage || 1);
    } catch (error) {
      console.error('Error fetching logs:', error);
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

  useEffect(() => {
    fetchUsers();
    fetchLogs(currentPage, entriesPerPage);
  }, [currentPage, entriesPerPage]);

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
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
                  onChange={setSelectedUsers}
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
                  onClick={() => fetchLogs(1, entriesPerPage)}
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

        {/* Logs Table */}
        {!loading && logs.length > 0 && (
          <div>
            <div className="">
              <div className="p-0">
                <div className="">
                  <Table className="text-xs">
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="px-2 py-2 text-xs font-semibold">
                          Date
                        </TableHead>
                        <TableHead className="px-2 py-2 text-xs font-semibold">
                          User
                        </TableHead>
                        <TableHead className="px-2 py-2 text-xs font-semibold">
                          Login Time
                        </TableHead>
                        <TableHead className="px-2 py-2 text-xs font-semibold">
                          Logout Time
                        </TableHead>
                        <TableHead className="px-2 py-2 text-right text-xs font-semibold">
                          Duration
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {logs.map((log) => (
                        <TableRow key={log._id}>
                          <TableCell className="whitespace-nowrap px-2 py-1.5 text-xs ">
                            {moment(log.createdAt).format('MMM DD, YYYY')}
                          </TableCell>
                          <TableCell className="whitespace-nowrap px-2 py-1.5 text-xs ">
                            {log.userId.name}
                          </TableCell>
                          <TableCell className="whitespace-nowrap px-2 py-1.5 text-xs">
                            {moment(log.loginAt).format('HH:mm')}
                          </TableCell>
                          <TableCell className="whitespace-nowrap px-2 py-1.5 text-xs">
                            {moment(log.logoutAt).format('HH:mm')}
                          </TableCell>
                          <TableCell className="whitespace-nowrap px-2 py-1.5 text-right ">
                            {formatDuration(
                              moment(log.logoutAt || new Date()).diff(
                                moment(log.loginAt),
                                'minutes'
                              )
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>

            {totalPages > 1 && (
              <div className="mt-4">
                <DataTablePagination
                  pageSize={entriesPerPage}
                  setPageSize={setEntriesPerPage}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </div>
        )}

        {!loading && !initialLoad && logs.length === 0 && (
          <Card className="shadow-none">
            <CardContent className="flex min-h-[200px] items-center justify-center">
              <p className="text-muted-foreground">
                {logs.length === 0
                  ? 'No logs data available'
                  : 'No logs found for selected users'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ReportPage;
