import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MoveLeft } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// shadcn/ui Table Components
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// Mock Data
const riskAssessments = [
  {
    id: 1,
    name: 'Choking Risk',
    scores: {
      Jan: null,
      Feb: null,
      Mar: null,
      Apr: null,
      May: null,
      Jun: 6,
      Jul: null,
      Aug: null,
    },
  },
  {
    id: 2,
    name: 'Continence Risk',
    scores: {
      Jan: null,
      Feb: null,
      Mar: null,
      Apr: null,
      May: null,
      Jun: 6,
      Jul: null,
      Aug: null,
    },
  },
  {
    id: 3,
    name: 'Eating and Drinking',
    scores: {
      Jan: null,
      Feb: null,
      Mar: null,
      Apr: null,
      May: null,
      Jun: 9,
      Jul: null,
      Aug: null,
    },
  },
  {
    id: 4,
    name: 'Generic Assessment for Daljit Singh',
    scores: {
      Jan: null,
      Feb: null,
      Mar: null,
      Apr: null,
      May: null,
      Jun: 12,
      Jul: null,
      Aug: null,
    },
  },
  {
    id: 5,
    name: 'Mental Capacity Assessment for Daljit Singh',
    scores: {
      Jan: null,
      Feb: null,
      Mar: null,
      Apr: null,
      May: null,
      Jun: 'RA',
      Jul: null,
      Aug: null,
    },
  },
];

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function RiskAssessmentScorePage() {
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    new Date('2024-08-16'),
    new Date('2025-08-16'),
  ]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [startDate, endDate] = dateRange;

  // Pagination logic
  const totalPages = Math.ceil(riskAssessments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedAssessments = riskAssessments.slice(startIndex, endIndex);

  // Score color mapping
  const getScoreColor = (score: number | string | null) => {
    if (score === null || score === undefined) return 'bg-gray-100 text-gray-500';
    if (typeof score === 'number') {
      if (score <= 5) return 'bg-green-100 text-green-800';
      if (score <= 8) return 'bg-yellow-100 text-yellow-800';
      if (score <= 10) return 'bg-orange-100 text-orange-800';
      return 'bg-red-100 text-red-800';
    }
    if (score === 'RA') return 'bg-gray-500 text-white';
    return 'bg-gray-100 text-gray-500';
  };

  const getScoreSize = (score: number | string | null) => {
    if (score === null || score === undefined) return 'w-8 h-8';
    if (typeof score === 'number' && score > 9) return 'w-8 h-8';
    return 'w-7 h-7';
  };

  return (
    <div className="">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Risk Assessment Scores</h1>
        <Button variant="default" onClick={() => window.history.back()}>
          <MoveLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      {/* Date Range Picker */}
      <div className="mb-6 rounded-lg border border-gray-300 bg-white p-4 shadow-sm">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Date Range
        </label>
        <DatePicker
          selectsRange
          startDate={startDate}
          endDate={endDate}
          onChange={(update) => {
            setDateRange(update as [Date | null, Date | null]);
          }}
          dateFormat="dd MMM yyyy"
          placeholderText="Select date range"
          className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          wrapperClassName="w-[20%]"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-300 bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-100 hover:bg-gray-100">
              <TableHead className="w-1/3 font-semibold text-gray-700">Risk Assessment</TableHead>
              {months.map((month) => (
                <TableHead key={month} className="px-4 py-3 text-center font-semibold text-gray-700">
                  {month}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedAssessments.map((assessment) => (
              <TableRow key={assessment.id} className="hover:bg-gray-50">
                <TableCell className="font-medium">{assessment.name}</TableCell>
                {months.map((month) => {
                  const score = assessment.scores[month];
                  return (
                    <TableCell key={month} className="text-center">
                      {score !== null && score !== undefined ? (
                        <span
                          className={`inline-flex items-center justify-center rounded-full ${getScoreColor(
                            score
                          )} ${getScoreSize(score)} text-xs font-semibold`}
                        >
                          {score}
                        </span>
                      ) : (
                        <div className="h-7 w-7 mx-auto"></div>
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="mt-6 flex items-center justify-center space-x-4">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="rounded-md px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50"
        >
         Prev
        </button>
        <span className="rounded-md bg-blue-500 px-3 py-1 text-sm font-medium text-white">
          {currentPage}
        </span>
        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="rounded-md px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50"
        >
          Next
        </button>
        <select
          value={`${itemsPerPage}/page`}
          onChange={() => {}}
          className="rounded-md border px-3 py-1 text-sm"
        >
          <option value="10/page">10 / page</option>
          <option value="20/page">20 / page</option>
          <option value="50/page">50 / page</option>
        </select>
      </div>
    </div>
  );
}