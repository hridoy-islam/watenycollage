import { useState, useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Download, Calendar, MoveLeft } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// Utility: Parse string date like "2 Jun" into a Date object (assume current year)
const parseDateFromString = (dateStr: string): Date => {
  const [day, month] = dateStr.split(' ');
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthIndex = monthNames.indexOf(month);
  const year = new Date().getFullYear();
  return new Date(year, monthIndex, parseInt(day, 10));
};

// Format Date object back to "2 Jun"
const formatDateToLabel = (date: Date): string => {
  const day = date.getDate();
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${day} ${monthNames[date.getMonth()]}`;
};

// Format full date for log parsing: "Fri 16 Aug 21:52" → "16 Aug"
const extractDateFromLog = (logDateStr: string): string | null => {
  const match = logDateStr.match(/\d{1,2} [A-Za-z]{3}/);
  return match ? match[0] : null;
};

// Sample chart data (unchanged)
const chartDataMap: Record<string, any> = {
  weight: {
    name: 'Weight Chart',
    unit: 'kg',
    data: [
      { date: '2 Jun', value: 58, label: 'Jun 2' },
      { date: '9 Jun', value: 57, label: 'Jun 9' },
      { date: '16 Jun', value: 60, label: 'Jun 16' },
      { date: '23 Jun', value: 61, label: 'Jun 23' },
      { date: '30 Jun', value: 62, label: 'Jun 30' },
      { date: '7 Jul', value: 63, label: 'Jul 7' },
      { date: '14 Jul', value: 64, label: 'Jul 14' },
      { date: '21 Jul', value: 64, label: 'Jul 21' },
      { date: '28 Jul', value: 65, label: 'Jul 28' },
      { date: '4 Aug', value: 65, label: 'Aug 4' },
      { date: '11 Aug', value: 62, label: 'Aug 11' },
      { date: '18 Aug', value: 61, label: 'Aug 18' },
    ],
    logs: [
      { id: 1, date: 'Fri 16 Aug 21:52', user: 'John Jackson', title: 'Weight 62kg', description: "Adam's weight was measured as 62kg" },
      { id: 2, date: 'Fri 01 Aug 21:52', user: 'John Jackson', title: 'Weight 65kg', description: "Adam's weight was measured as 65kg" },
      { id: 3, date: 'Fri 18 Jul 21:52', user: 'John Jackson', title: 'Weight 64kg', description: "Adam's weight was measured as 64kg" },
      { id: 4, date: 'Tue 24 Jun 21:52', user: 'John Jackson', title: 'Weight 61kg', description: "Adam's weight was measured as 61kg" },
    ],
  },
  'blood-pressure': {
    name: 'Blood Pressure Chart',
    unit: 'mmHg',
    data: [
      { date: '2 Jun', value: 120, label: 'Jun 2' },
      { date: '9 Jun', value: 118, label: 'Jun 9' },
      { date: '16 Jun', value: 122, label: 'Jun 16' },
      { date: '23 Jun', value: 125, label: 'Jun 23' },
      { date: '30 Jun', value: 119, label: 'Jun 30' },
      { date: '7 Jul', value: 121, label: 'Jul 7' },
      { date: '14 Jul', value: 123, label: 'Jul 14' },
      { date: '21 Jul', value: 120, label: 'Jul 21' },
    ],
    logs: [
      { id: 1, date: 'Fri 16 Aug 21:52', user: 'Sarah Wilson', title: 'Blood Pressure 120/80', description: 'Blood pressure reading taken during routine check' },
      { id: 2, date: 'Wed 14 Aug 09:30', user: 'Mike Johnson', title: 'Blood Pressure 118/75', description: 'Morning blood pressure measurement' },
    ],
  },
};

const getDefaultChartData = (chartName: string) => ({
  name:
    chartName.charAt(0).toUpperCase() +
    chartName.slice(1).replace(/-/g, ' ') +
    ' Chart',
  unit: 'units',
  data: [
    { date: '2 Jun', value: 45, label: 'Jun 2' },
    { date: '9 Jun', value: 52, label: 'Jun 9' },
    { date: '16 Jun', value: 48, label: 'Jun 16' },
    { date: '23 Jun', value: 61, label: 'Jun 23' },
    { date: '30 Jun', value: 55, label: 'Jun 30' },
    { date: '7 Jul', value: 67, label: 'Jul 7' },
    { date: '14 Jul', value: 69, label: 'Jul 14' },
    { date: '21 Jul', value: 64, label: 'Jul 21' },
  ],
  logs: [
    { id: 1, date: 'Fri 16 Aug 21:52', user: 'Healthcare Provider', title: `${chartName.replace(/-/g, ' ')} Reading`, description: `Latest ${chartName.replace(/-/g, ' ')} measurement recorded` },
    { id: 2, date: 'Wed 14 Aug 09:30', user: 'Healthcare Provider', title: `${chartName.replace(/-/g, ' ')} Update`, description: `Routine ${chartName.replace(/-/g, ' ')} monitoring` },
  ],
});

export default function ChartDetailPage() {
  const { id } = useParams<{ id: string }>();
  const chartInfo = chartDataMap[id!] || getDefaultChartData(id!);
  const navigate = useNavigate();

  // 🔹 Set default date range: last 30 days
  const thirtyDaysAgo = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() - 120);
    return date;
  }, []);

  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([thirtyDaysAgo, new Date()]);

  const [startDate, endDate] = dateRange;

  // 🔹 Filter data based on selected date range
  const filteredData = useMemo(() => {
    if (!startDate || !endDate) return chartInfo.data;
    return chartInfo.data.filter((item: any) => {
      const itemDate = parseDateFromString(item.date);
      return itemDate >= startDate && itemDate <= endDate;
    });
  }, [chartInfo.data, startDate, endDate]);

  // 🔹 Filter logs
  const filteredLogs = useMemo(() => {
    if (!startDate || !endDate) return chartInfo.logs;
    return chartInfo.logs.filter((log: any) => {
      const logDateStr = extractDateFromLog(log.date);
      if (!logDateStr) return true;
      const parsedLogDate = parseDateFromString(logDateStr);
      return parsedLogDate >= startDate && parsedLogDate <= endDate;
    });
  }, [chartInfo.logs, startDate, endDate]);

  // 🔹 Format display date range
  const displayDateRange = startDate && endDate
    ? `${formatDateToLabel(startDate)} — ${formatDateToLabel(endDate)}`
    : 'Select date range';

  return (
    <div className="">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <Button
          variant="outline"
          className="flex items-center gap-2 border-none bg-theme hover:bg-theme/90"
          onClick={() => navigate(-1)}
        >
          <MoveLeft className="h-4 w-4" />
          back
        </Button>
        <Button
          variant="outline"
          className="flex items-center gap-2 border-none bg-theme hover:bg-theme/90"
        >
          <Download className="h-4 w-4" />
          Download PDF
        </Button>
      </div>

      {/* Chart Title */}
      <div className="mb-6">
        <h1 className="mb-4 text-3xl font-bold">{chartInfo.name}</h1>

        {/* Date Range Selector */}
        <div className="mb-6 flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <DatePicker
            selectsRange
            startDate={startDate}
            endDate={endDate}
            onChange={(update: [Date | null, Date | null]) => setDateRange(update)}
            placeholderText="Select date range"
            dateFormat="d MMM"
            className="rounded border px-3 py-1 text-sm font-medium focus:outline-none"
            maxDate={new Date()}
          />
          <span className="text-sm text-muted-foreground">
            {displayDateRange}
          </span>
        </div>
      </div>

      {/* Chart */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <ChartContainer
            config={{
              value: {
                label: chartInfo.name,
                color: 'hsl(var(--chart-1))',
              },
            }}
            className="h-[400px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={filteredData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-xs" tick={{ fontSize: 12 }} />
                <YAxis className="text-xs" tick={{ fontSize: 12 }} />
<ChartTooltip
  content={({ payload, label }) => {
    if (!payload || !payload.length) return null;

    return (
      <div
        className="rounded-lg border bg-white p-2 shadow-md"
        style={{ fontSize: '12px', color: '#000' }}
      >
        <p className="mb-1 font-semibold">{label}</p>
        <div className="space-y-1">
          {payload.map((item: any, i) => (
            <div key={i} className="flex items-center gap-2" style={{ color: item.color }}>
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span style={{ color: '#000' }}>
                {item.name}: {item.value} {item.unit || ''}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }}
/>               <Line
                  type="monotone"
                  dataKey="value"
                  stroke="var(--color-value)"
                  strokeWidth={2}
                  dot={{ fill: 'var(--color-value)', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: 'var(--color-value)', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Logs Section */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Logs</CardTitle>
          <CardDescription>
            Latest entries and measurements for {chartInfo.name.toLowerCase()}{' '}
            {startDate && endDate && <>from {displayDateRange}</>}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredLogs.length > 0 ? (
              filteredLogs.map((log: any) => (
                <div
                  key={log.id}
                  className="flex items-start gap-4 rounded-lg border p-4"
                >
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-theme/10">
                    <div className="h-2 w-2 rounded-full bg-theme"></div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <p className="text-sm text-muted-foreground">
                        {log.date} - {log.user}
                      </p>
                    </div>
                    <h4 className="mb-1 text-sm font-semibold">{log.title}</h4>
                    <p className="text-sm text-muted-foreground">{log.description}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No logs in selected range.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}