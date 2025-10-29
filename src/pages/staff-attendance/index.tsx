import { useState, useEffect } from 'react';
import moment from 'moment-timezone';
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
import { useSelector } from 'react-redux';

// Define types
interface Break {
  _id: string;
  breakStart: string; // ISO string (UTC)
  breakEnd?: string; // ISO string (UTC)
}

interface Log {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  action: string;
  clockIn: string; // ISO UTC
  clockOut?: string; // ISO UTC
  breaks: Break[];
  createdAt: string;
  updatedAt: string;
}

// BlinkingDots component (unchanged)
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

const AttendancePage = () => {
  const { toast } = useToast();
  const [startDate, setStartDate] = useState<Date>(
    moment().tz('Europe/London').startOf('month').toDate()
  );
  const [endDate, setEndDate] = useState<Date>(
    moment().tz('Europe/London').endOf('month').toDate()
  );
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(200);
  const { user } = useSelector((state: any) => state.auth);

  // Helper: Format UTC ISO string to London date/time
  const formatToLondon = (
    isoString: string | undefined,
    format = 'DD/MM/YYYY HH:mm'
  ) => {
    if (!isoString) return '—';
    return moment.utc(isoString).tz('Europe/London').format(format);
  };

  // Helper: Calculate net working minutes (in UTC to avoid DST issues)
const calculateNetWorkingSeconds = (log: Log): number => {
  if (!log.clockIn) return 0;

  const clockIn = moment.tz(log.clockIn, 'Europe/London');
  const clockOut = log.clockOut
    ? moment.tz(log.clockOut, 'Europe/London')
    : moment.tz('Europe/London'); // use now in London time if no clockOut

  let totalBreakMs = 0;
  for (const brk of log.breaks || []) {
    if (brk.breakStart && brk.breakEnd) {
      const start = moment.tz(brk.breakStart, 'Europe/London');
      const end = moment.tz(brk.breakEnd, 'Europe/London');
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

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const fetchLogs = async (page: number, entriesPerPage: number) => {
    setLoading(true);
    try {
      const params: any = {
        page,
        limit: entriesPerPage
      };

      if (startDate && endDate) {
        // Send dates in YYYY-MM-DD (interpreted as London dates by backend)
        params.fromDate = moment(startDate).format('YYYY-MM-DD');
        params.toDate = moment(endDate).format('YYYY-MM-DD');
      }

      const response = await axiosInstance.get(`/logs?userId=${user._id}`, {
        params
      });
      const logsData: Log[] = response.data.data?.result || [];
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
    fetchLogs(currentPage, entriesPerPage);
  }, [currentPage, entriesPerPage]);

  return (
    <div className="rounded-md bg-white md:p-8">
      <div className="space-y-2">
        <Card className="rounded-md border border-gray-300 shadow-none">
          <CardHeader>
            <CardTitle>Attendances</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:items-end">
              <div className="flex flex-col space-y-2 lg:col-span-2">
                <Label className="text-sm font-medium">
                  From Date (DD/MM/YYYY)
                </Label>
                <DatePicker
                  selected={startDate}
                  onChange={(date) => date && setStartDate(date)}
                  selectsStart
                  startDate={startDate}
                  endDate={endDate}
                  maxDate={endDate}
                  className="h-10 w-full rounded-sm border border-gray-300 px-3 py-2"
                  dateFormat="dd/MM/yyyy"
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                />
              </div>

              <div className="flex flex-col space-y-2 lg:col-span-2">
                <Label className="text-sm font-medium">
                  To Date (DD/MM/YYYY)
                </Label>
                <DatePicker
                  selected={endDate}
                  onChange={(date) => date && setEndDate(date)}
                  selectsEnd
                  startDate={startDate}
                  endDate={endDate}
                  minDate={startDate}
                  className="h-10 w-full rounded-sm border border-gray-300 px-3 py-2"
                  dateFormat="dd/MM/yyyy"
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                />
              </div>

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

        {loading && (
          <div className="flex justify-center py-10">
            <BlinkingDots size="large" color="bg-watney" />
          </div>
        )}

        {!loading && logs.length > 0 && (
          <div>
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="px-2 py-2 font-semibold">
                    Work Date
                  </TableHead>
                  <TableHead className="px-2 py-2 font-semibold">
                    Clock-In
                  </TableHead>
                  <TableHead className="px-2 py-2 font-semibold">
                    Clock-Out
                  </TableHead>
                  <TableHead className="px-2 py-2 font-semibold">
                    Break
                  </TableHead>
                  <TableHead className="px-2 py-2 text-right font-semibold">
                    Hours Worked
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log._id}>
                    <TableCell className="whitespace-nowrap px-2 py-1.5">
                      {formatToLondon(log.createdAt, 'DD/MM/YYYY')}
                    </TableCell>
                    <TableCell className="whitespace-nowrap px-2 py-1.5">
                      {formatToLondon(log.clockIn, 'HH:mm:ss')}
                    </TableCell>
                    <TableCell className="whitespace-nowrap px-2 py-1.5">
                      {formatToLondon(log.clockOut, 'HH:mm:ss')}
                    </TableCell>
                    <TableCell className="whitespace-nowrap px-2 py-1.5">
                      {log.breaks && log.breaks.length > 0 ? (
                        <div className="space-y-2">
                          {log.breaks.map((brk) => (
                            <div key={brk._id} className="text-xs">
                              <div>
                                Break:{' '}
                                {formatToLondon(
                                  brk.breakStart,
                                  'DD-MM-YYYY HH:mm:ss'
                                )}
                              </div>
                              <div>
                                Return:{' '}
                                {brk.breakEnd
                                  ? formatToLondon(
                                      brk.breakEnd,
                                      'DD-MM-YYYY HH:mm:ss'
                                    )
                                  : '—'}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        '—'
                      )}
                    </TableCell>
                    <TableCell className="whitespace-nowrap px-2 py-1.5 text-right">
                      {
                        formatDurationWithSeconds(
                            calculateNetWorkingSeconds(log)
                          )
                        }
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

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
              <p className="text-muted-foreground">No logs data available</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AttendancePage;
