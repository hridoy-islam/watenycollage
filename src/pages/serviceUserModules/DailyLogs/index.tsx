import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MoveLeft } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import moment from 'moment';
import html2pdf from 'html2pdf.js';

// Mock Data
const mockLogs = [
  {
    id: 1,
    date: '2023-08-09',
    time: '12:05',
    loggedAt: '23:33',
    status: 'Carer Present - End',
    details:
      "Carer is no longer with Anna. When I started my shift, she was listening and singing music to her room. I washed some dishes which was into the sink. Then I wiped to the living room surfaces, did hoover. Around 9am she came downstairs. I made a cup of coffee for her and made a tea for her daughter. She was not looks fine. She saw a lady bug to her room in the morning and she was thinking it's an alien. Then she went upstairs. I was making ready everything for her cooking. As she will cook later...",
    carerName: 'Sabiba Akther Mishi'
  },
  {
    id: 2,
    date: '2023-08-09',
    time: '18:49',
    loggedAt: '00:12',
    status: 'Carer Present - Start',
    details: 'Carer is with Anna',
    carerName: 'Sabiba Akther Mishi'
  },
  {
    id: 3,
    date: '2023-08-08',
    time: '12:05',
    loggedAt: '23:33',
    status: 'Carer Present - End',
    details:
      'Carer is no longer with Anna. She was upstairs when I started my shift. Then I went upstairs. She was getting ready for going out. Then I washed all of the dishes, tidied up the cupboard, cleaned the bathroom. Then she called me for going to her room. She showed me all of her pictures. I was spending time with her in her room. She was in a happy mood today. When I finished my shift, she was fine.',
    carerName: 'Sabiba Akther Mishi'
  },
  {
    id: 4,
    date: '2023-08-08',
    time: '18:49',
    loggedAt: '00:12',
    status: 'Carer Present - Start',
    details: 'Carer is with Anna',
    carerName: 'Sabiba Akther Mishi'
  }
];

export default function DailyLogs() {
  const [logs] = useState(mockLogs);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // Filter logs based on selected date range
  const filteredLogs = logs.filter((log) => {
    const logDate = new Date(log.date);
    if (startDate && endDate) {
      return logDate >= startDate && logDate <= endDate;
    }
    return true;
  });

  // Sort logs by date (newest first)
  const sortedLogs = filteredLogs.sort(
    (a, b) => new Date(b.date + ' ' + b.time) - new Date(a.date + ' ' + a.time)
  );

  // Download logs as PDF
  const downloadPDF = () => {
    const element = document.getElementById('logs-container');
    if (!element) return;

    const opt = {
      margin: 10,
      filename: `Anna_Logs_${moment().format('DD-MM-YYYY')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
  };

  return (
    <div className="min-h-screen ">
      {/* Header */}
      <div className="mx-auto mb-8  rounded-xl bg-white p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-extrabold text-gray-900 md:text-4xl">
            Anna Begum Khan Zadran's Daily Logs
          </h1>
          <Button variant="default" onClick={() => window.history.back()}>
            <MoveLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
        <p className="mt-2 text-center text-lg text-blue-600">
          Logged by Sabiba Akther Mishi
        </p>
      </div>

      {/* Controls: Date Filter + Download */}
      <div className=" mb-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="w-full sm:w-auto">
          <DatePicker
            selectsRange
            startDate={startDate}
            endDate={endDate}
            onChange={(update) => {
              const [start, end] = update;
              setStartDate(start);
              setEndDate(end);
            }}
            placeholderText="Select date range (e.g. 01/08/2023 - 10/08/2023)"
            dateFormat="dd/MM/yyyy"
            isClearable
            maxDate={new Date()}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            wrapperClassName="w-full"
          />
        </div>

        <button
          onClick={downloadPDF}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 font-medium text-white shadow-md transition hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Download PDF
        </button>
      </div>

      {/* Logs Container */}
      <div
        id="logs-container"
        className="space-y-6"
      >
        {sortedLogs.length === 0 ? (
          <div className="rounded-lg bg-white p-12 text-center shadow-md">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-700">
              No logs found
            </h3>
            <p className="mt-1 text-gray-500">
              Try adjusting your date filter or check back later.
            </p>
          </div>
        ) : (
          sortedLogs.map((log) => (
            <div
              key={log.id}
              className="rounded-xl bg-white p-6 shadow-lg transition-all duration-200 hover:shadow-xl"
            >
              {/* Log Header */}
              <div className="mb-4 flex flex-wrap items-center justify-between border-b border-gray-200 pb-3 text-sm text-gray-600">
                <span className="font-medium">
                  {moment(log.date).format('dddd, DD MMMM YYYY')} • {log.time}
                </span>
                <span>
                  Logged at: <strong>{log.loggedAt}</strong>
                </span>
              </div>

              {/* Log Content */}
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div
                  className={`mt-1 flex h-10 w-10 items-center justify-center rounded-full text-white ${
                    log.status.includes('Start')
                      ? 'bg-green-500'
                      : 'bg-red-500'
                  }`}
                >
                  {log.status.includes('Start') ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 00-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>

                <div className="flex-1">
                  <h3
                    className={`text-xl font-semibold ${
                      log.status.includes('Start')
                        ? 'text-green-700'
                        : 'text-red-700'
                    }`}
                  >
                    {log.status}
                  </h3>
                  <p className="mt-2 text-gray-700 leading-relaxed">
                    {log.details.length > 250
                      ? `${log.details.slice(0, 250)}...`
                      : log.details}
                  </p>
                  {log.details.length > 250 && (
                    <button
                      onClick={() =>
                        alert('Full Details:\n\n' + log.details)
                      }
                      className="mt-2 text-sm font-medium text-blue-600 transition hover:text-blue-800"
                    >
                      → Show more
                    </button>
                  )}
                </div>
              </div>

              {/* Carer Name */}
              <div className="mt-4 border-t border-gray-100 pt-3 text-right text-sm text-gray-500">
                <strong>{log.carerName}</strong>
              </div>
            </div>
          ))
        )}
      </div>

      
    </div>
  );
}