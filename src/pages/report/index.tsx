import { useState, useEffect } from 'react';
import Select from 'react-select';
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

// Import react-pdf components
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';

// Types
interface User {
  _id: string;
  name: string;
  email: string;
}

interface Break {
  _id: string;
  breakStart: string; // ISO UTC
  breakEnd?: string; // ISO UTC
}

interface Log {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  action: 'login' | 'logout';
  clockIn: string; // ISO UTC
  clockOut?: string; // ISO UTC
  breaks?: Break[];
  createdAt: string;
  updatedAt: string;
  date?: string; // optional, may not be used
  duration?: number; // optional
}

// ----------------------------------------------------------------------------
// Utility Functions
// ----------------------------------------------------------------------------
const formatToLondon = (
  isoString: string | undefined,
  format = 'DD/MM/YYYY HH:mm'
) => {
  if (!isoString) return '—';
  return moment.utc(isoString).tz('Europe/London').format(format);
};

const calculateTotalDurationSeconds = (log: Log): number => {
  if (!log.clockIn) return 0;

  const clockIn = moment.tz(log.clockIn, 'Europe/London');
  const clockOut = log.clockOut
    ? moment.tz(log.clockOut, 'Europe/London')
    : moment.tz('Europe/London');

  const totalWorkMs = clockOut.diff(clockIn);
  return Math.floor(Math.max(0, totalWorkMs) / 1000);
};

const calculateNetWorkingSeconds = (log: Log): number => {
  if (!log.clockIn) return 0;

  const clockIn = moment.tz(log.clockIn, 'Europe/London');
  const clockOut = log.clockOut
    ? moment.tz(log.clockOut, 'Europe/London')
    : moment.tz('Europe/London');

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

// Updated function to use moment.duration for HH:MM:ss formatting
const formatDurationHHMMSS = (totalSeconds: number) => {
  if (!totalSeconds || totalSeconds <= 0) return '00:00:00';
  
  const duration = moment.duration(totalSeconds, 'seconds');
  const hours = Math.floor(duration.asHours()).toString().padStart(2, '0');
  const minutes = duration.minutes().toString().padStart(2, '0');
  const seconds = duration.seconds().toString().padStart(2, '0');
  
  return `${hours}:${minutes}`;
};

// ----------------------------------------------------------------------------
// PDF Styles & Document Component
// ----------------------------------------------------------------------------
const pdfStyles = StyleSheet.create({
  page: { padding: 30, fontFamily: 'Helvetica' },
  title: { fontSize: 16, marginBottom: 15, fontWeight: 'bold', textAlign: 'center' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  headerLeft: { flexDirection: 'column' },
  headerRight: { flexDirection: 'column', alignItems: 'flex-end' },
  userInfo: { fontSize: 11, marginBottom: 4, fontWeight: 'semibold' },
  periodInfo: { fontSize: 11, fontWeight: 'bold', color: '#333' },
  table: { display: 'flex', width: 'auto', borderStyle: 'solid', borderWidth: 1, borderRightWidth: 0, borderBottomWidth: 0 },
  tableRow: { margin: 'auto', flexDirection: 'row' },
  tableColHeader: { borderStyle: 'solid', borderWidth: 1, borderLeftWidth: 0, borderTopWidth: 0, backgroundColor: '#f3f4f6' },
  tableCol: { borderStyle: 'solid', borderWidth: 1, borderLeftWidth: 0, borderTopWidth: 0 },
  tableCellHeader: { margin: 5, fontSize: 10, fontWeight: 'bold' },
  tableCell: { margin: 5, fontSize: 9 },
  breakText: { marginBottom: 2 }
});

const ReportDocument = ({
  logs,
  selectedUsers,
  startDate,
  endDate
}: {
  logs: Log[];
  selectedUsers: any[];
  startDate: Date;
  endDate: Date;
}) => {
  const isSingleUser = selectedUsers?.length === 1;
  const singleUser = isSingleUser ? selectedUsers[0] : null;

  const dynamicColWidth = isSingleUser ? '14.28%' : '12.5%';

  return (
    <Document>
      <Page size="A4" orientation="portrait" style={pdfStyles.page}>
        <Text style={pdfStyles.title}>Watney College</Text>

        <View style={pdfStyles.headerRow}>
          <View style={pdfStyles.headerLeft}>
            {isSingleUser && (
              <>
                <Text style={pdfStyles.userInfo}>Employee Name: {singleUser.label}</Text>
                <Text style={pdfStyles.userInfo}>Email: {singleUser.email}</Text>
              </>
            )}
          </View>
          <View style={pdfStyles.headerRight}>
            <Text style={pdfStyles.periodInfo}>
              Attendance period: {moment(startDate).format('DD/MM/YYYY')} - {moment(endDate).format('DD/MM/YYYY')}
            </Text>
          </View>
        </View>

        <View style={pdfStyles.table}>
          {/* Header Row */}
          <View style={pdfStyles.tableRow}>
            {!isSingleUser && (
              <View style={[pdfStyles.tableColHeader, { width: dynamicColWidth }]}>
                <Text style={pdfStyles.tableCellHeader}>Employee Name</Text>
              </View>
            )}
            <View style={[pdfStyles.tableColHeader, { width: dynamicColWidth }]}>
              <Text style={pdfStyles.tableCellHeader}>Clock-In Date</Text>
            </View>
            <View style={[pdfStyles.tableColHeader, { width: dynamicColWidth }]}>
              <Text style={pdfStyles.tableCellHeader}>Clock-In</Text>
            </View>
            <View style={[pdfStyles.tableColHeader, { width: dynamicColWidth }]}>
              <Text style={pdfStyles.tableCellHeader}>Clock-Out Date</Text>
            </View>
            <View style={[pdfStyles.tableColHeader, { width: dynamicColWidth }]}>
              <Text style={pdfStyles.tableCellHeader}>Clock-Out</Text>
            </View>
            <View style={[pdfStyles.tableColHeader, { width: dynamicColWidth }]}>
              <Text style={pdfStyles.tableCellHeader}>Duration</Text>
            </View>
            <View style={[pdfStyles.tableColHeader, { width: dynamicColWidth }]}>
              <Text style={pdfStyles.tableCellHeader}>Break</Text>
            </View>
            <View style={[pdfStyles.tableColHeader, { width: dynamicColWidth }]}>
              <Text style={pdfStyles.tableCellHeader}>Hours Worked</Text>
            </View>
          </View>

          {/* Data Rows */}
          {logs.map((log) => (
            <View style={pdfStyles.tableRow} key={log._id}>
              {!isSingleUser && (
                <View style={[pdfStyles.tableCol, { width: dynamicColWidth }]}>
                  <Text style={pdfStyles.tableCell}>{log.userId?.name}</Text>
                </View>
              )}
              <View style={[pdfStyles.tableCol, { width: dynamicColWidth }]}>
                <Text style={pdfStyles.tableCell}>{formatToLondon(log.clockIn, 'DD/MM/YYYY')}</Text>
              </View>
              <View style={[pdfStyles.tableCol, { width: dynamicColWidth }]}>
                <Text style={pdfStyles.tableCell}>{formatToLondon(log.clockIn, 'HH:mm')}</Text>
              </View>
              <View style={[pdfStyles.tableCol, { width: dynamicColWidth }]}>
                <Text style={pdfStyles.tableCell}>{formatToLondon(log.clockOut, 'DD/MM/YYYY')}</Text>
              </View>
              <View style={[pdfStyles.tableCol, { width: dynamicColWidth }]}>
                <Text style={pdfStyles.tableCell}>{formatToLondon(log.clockOut, 'HH:mm')}</Text>
              </View>
              <View style={[pdfStyles.tableCol, { width: dynamicColWidth }]}>
                <Text style={pdfStyles.tableCell}>
                  {formatDurationHHMMSS(calculateTotalDurationSeconds(log))}
                </Text>
              </View>
              <View style={[pdfStyles.tableCol, { width: dynamicColWidth }]}>
                <View style={pdfStyles.tableCell}>
                  {log.breaks && log.breaks.length > 0 ? (
                    log.breaks.map((brk, i) => (
                      <View key={i} style={{ marginBottom: 4 }}>
                        <Text style={pdfStyles.breakText}>
                          Break: {formatToLondon(brk.breakStart, 'DD-MM-YYYY HH:mm')}
                        </Text>
                        <Text style={pdfStyles.breakText}>
                          Return: {brk.breakEnd ? formatToLondon(brk.breakEnd, 'DD-MM-YYYY HH:mm') : '—'}
                        </Text>
                      </View>
                    ))
                  ) : (
                    <Text>—</Text>
                  )}
                </View>
              </View>
              <View style={[pdfStyles.tableCol, { width: dynamicColWidth }]}>
                <Text style={pdfStyles.tableCell}>
                  {formatDurationHHMMSS(calculateNetWorkingSeconds(log))}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Total Working Hours — outside the table, no borders */}
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8 }}>
          <Text style={{ fontSize: 10, fontWeight: 'bold' }}>Total Working Hours:</Text>
          <Text style={{ fontSize: 10, fontWeight: 'bold', marginLeft: 16 }}>
            {formatDurationHHMMSS(
              logs.reduce((sum, log) => sum + calculateNetWorkingSeconds(log), 0)
            )}
          </Text>
        </View>
      </Page>
    </Document>
  );
};


// BlinkingDots
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

// ----------------------------------------------------------------------------
// Main Page Component
// ----------------------------------------------------------------------------
const ReportPage = () => {
  const { toast } = useToast();
  const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [startDate, setStartDate] = useState<Date>(
    moment().tz('Europe/London').startOf('month').toDate()
  );
  const [endDate, setEndDate] = useState<Date>(
    moment().tz('Europe/London').endOf('month').toDate()
  );
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(200);

  // Fetch users
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

  // Fetch logs
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

  // Generate and Download PDF
  const handleDownloadPdf = async () => {
    try {
      setPdfLoading(true);
      const doc = (
        <ReportDocument 
          logs={logs} 
          selectedUsers={selectedUsers} 
          startDate={startDate} 
          endDate={endDate} 
        />
      );
      const asPdf = pdf([]);
      asPdf.updateContainer(doc);
      const blob = await asPdf.toBlob();
      
      // Trigger download
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Timesheet_Report_${moment().format('YYYY-MM-DD')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate PDF',
        variant: 'destructive'
      });
    } finally {
      setPdfLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    fetchLogs(currentPage, entriesPerPage);
  }, [currentPage, entriesPerPage]);

  const userOptions = users.map((user) => ({
    value: user._id,
    label: user.name || user.email,
    email: user.email // Added email to options for the PDF logic
  }));

  return (
    <div className="rounded-md bg-white md:p-5 shadow-md">
      <div className="space-y-2">
        <Card className="rounded-md p-0 shadow-none">
          <CardHeader className="p-0 py-3">
            <CardTitle>Attendance Report</CardTitle>
          </CardHeader>
          <CardContent className="p-0 py-3">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:items-end">
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
                  dateFormat="dd/MM/yyyy"
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                />
              </div>

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
                  dateFormat="dd/MM/yyyy"
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                />
              </div>

              <div className="flex flex-col space-y-2 lg:col-span-3">
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

              <div className="flex flex-col space-y-2 lg:col-span-2 justify-end">
                 <div className="flex space-x-2 w-full">
                  <Button
                    onClick={() => fetchLogs(1, entriesPerPage)}
                    disabled={loading}
                    className="h-10 w-full bg-watney text-white hover:bg-watney/90"
                  >
                    {loading ? 'Wait...' : 'Search'}
                  </Button>
                  <Button
                    onClick={handleDownloadPdf}
                    disabled={pdfLoading || logs.length === 0}
                    variant="outline"
                    className="h-10 w-full"
                  >
                    {pdfLoading ? 'Building...' : 'Generate PDF'}
                  </Button>
                </div>
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
                <TableRow>
                  <TableHead className="px-2 py-2 font-semibold">Employee Name</TableHead>
                  <TableHead className="px-2 py-2 font-semibold">Clock-In Date</TableHead>
                  <TableHead className="px-2 py-2 font-semibold">Clock-In</TableHead>
                  <TableHead className="px-2 py-2 font-semibold">Clock-Out Date</TableHead>
                  <TableHead className="px-2 py-2 font-semibold">Clock-Out</TableHead>
                  <TableHead className="px-2 py-2 font-semibold">Duration</TableHead>
                  <TableHead className="px-2 py-2 font-semibold">Break</TableHead>
                  <TableHead className="px-2 py-2 text-right font-semibold">Hours Worked</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log._id}>
                    <TableCell className="whitespace-nowrap px-2 py-1.5">{log.userId.name}</TableCell>
                    <TableCell className="whitespace-nowrap px-2 py-1.5">{formatToLondon(log.clockIn, 'DD/MM/YYYY')}</TableCell>
                    <TableCell className="whitespace-nowrap px-2 py-1.5">{formatToLondon(log.clockIn, 'HH:mm')}</TableCell>
                    <TableCell className="whitespace-nowrap px-2 py-1.5">{formatToLondon(log.clockOut, 'DD/MM/YYYY')}</TableCell>
                    <TableCell className="whitespace-nowrap px-2 py-1.5">{formatToLondon(log.clockOut, 'HH:mm')}</TableCell>
                    <TableCell className="whitespace-nowrap px-2 py-1.5">
                      {formatDurationHHMMSS(calculateTotalDurationSeconds(log))}
                    </TableCell>
                    <TableCell className="whitespace-nowrap px-2 py-1.5">
                      {log.breaks && log.breaks.length > 0 ? (
                        <div className="space-y-1 text-xs">
                          {log.breaks.map((brk) => (
                            <div key={brk._id}>
                              <div>Break: {formatToLondon(brk.breakStart, 'DD-MM-YYYY HH:mm')}</div>
                              <div>Return: {brk.breakEnd ? formatToLondon(brk.breakEnd, 'DD-MM-YYYY HH:mm') : '—'}</div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        '—'
                      )}
                    </TableCell>
                    <TableCell className="whitespace-nowrap px-2 py-1.5 text-right">
                      {formatDurationHHMMSS(calculateNetWorkingSeconds(log))}
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

export default ReportPage;