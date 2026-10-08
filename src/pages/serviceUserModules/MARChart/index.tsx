import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Download, CalendarIcon, HelpCircle, ChevronLeft, ChevronRight, MoveLeft } from "lucide-react";
import { Link } from "react-router-dom";

// Mock Medications with Boolean Status Array (true = administered, false = missed)
const mockMedications = [
  {
    id: 1,
    name: "Acidase and suspension 40mg",
    dose: "40 mg",
    times: ["08:00", "20:00"],
    status: Array(31).fill(true).map((val, i) => (i === 1 ? false : val)), // Missed on day 2
  },
  {
    id: 2,
    name: "Aspirin 75mg tablets",
    dose: "75 mg",
    times: ["08:00"],
    status: Array(31).fill(true),
  },
  {
    id: 3,
    name: "Citalopram 75mg tablets",
    dose: "75 mg",
    times: ["08:00"],
    status: Array(31).fill(true).map((val, i) => (i === 6 ? false : val)),
  },
  {
    id: 4,
    name: "Famotidine 20mg tablets",
    dose: "20 mg",
    times: ["08:00"],
    status: Array(31).fill(true),
  },
  {
    id: 5,
    name: "Folic acid 5mg/5ml oral solution",
    dose: "5 ml",
    times: ["08:00", "20:00"],
    status: Array(31).fill(true),
  },
  {
    id: 6,
    name: "Fucidin 20mg/g cream",
    dose: "5",
    times: ["PRN"],
    status: Array(31).fill(true),
  },
  {
    id: 7,
    name: "Hydrocortisone 1% cream",
    dose: "15",
    times: ["PRN"],
    status: Array(31).fill(true),
  },
  {
    id: 8,
    name: "Levotiroxine 125 mcg tablets",
    dose: "12.5 mcg",
    times: ["08:00", "20:00"],
    status: Array(31).fill(true),
  },
  {
    id: 9,
    name: "Lingultan 5mg tablets",
    dose: "5",
    times: ["08:00"],
    status: Array(31).fill(true),
  },
  {
    id: 10,
    name: "Loperamide 2mg capsules",
    dose: "1+1",
    times: ["PRN"],
    status: Array(31).fill(true),
  },
];

const months = [
  { value: "june-2025", label: "June 2025" },
  { value: "july-2025", label: "July 2025" },
  { value: "august-2025", label: "August 2025" },
];

export default function MarChartPage() {
  const [selectedMonth, setSelectedMonth] = useState("august-2025");
  const [dateRange, setDateRange] = useState("all");
  const [viewMode, setViewMode] = useState("cards");
  const [currentPage, setCurrentPage] = useState(1);
  const medicationsPerPage = 4;

  // Filter medications based on selected month
  const filteredMedications = mockMedications.filter(med => {
    if (dateRange === "all") return true;
    if (dateRange === "15-aug") {
      // Check if medication was administered or missed on Aug 15 (day 15)
      return med.status[14] !== undefined;
    }
    return true;
  });

  // Pagination
  const indexOfLastMed = currentPage * medicationsPerPage;
  const indexOfFirstMed = indexOfLastMed - medicationsPerPage;
  const currentMeds = filteredMedications.slice(indexOfFirstMed, indexOfLastMed);
  const totalPages = Math.ceil(filteredMedications.length / medicationsPerPage);

  // Generate dates based on selected month
  const generateDates = () => {
    if (selectedMonth === "august-2025") return Array.from({ length: 31 }, (_, i) => i + 1);
    if (selectedMonth === "july-2025") return Array.from({ length: 31 }, (_, i) => i + 1);
    if (selectedMonth === "june-2025") return Array.from({ length: 30 }, (_, i) => i + 1);
    return Array.from({ length: 31 }, (_, i) => i + 1);
  };

  const dates = generateDates();
  const currentMonth = months.find(m => m.value === selectedMonth)?.label || "August 2025";
  const patientName = "Dajit Singh";

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <div className=" p-4 rounded-lg shadow-md space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-gray-800">
              {patientName}'s eMAR
            </h1>
            <p className="text-lg text-gray-600 mt-1">
              <CalendarIcon className="inline w-4 h-4 mr-1" />
              {currentMonth} • Medication Administration Record
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button variant="default" size="sm" onClick={() => window.history.back()}>
              <MoveLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2 border-gray-300 hover:border-gray-400"
            >
              <Download className="w-4 h-4" />
              Export PDF
            </Button>
            <Link to="add-medication">
              <Button className=" text-white flex items-center gap-2 shadow-sm">
                <Plus className="w-4 h-4" />
                Add Medication
              </Button>
            </Link>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
          <Button 
            variant={dateRange === "all" ? "outline" : "default"} 
            size="sm" 
            onClick={() => setDateRange("all")}
          >
            All
          </Button>
          <Button 
            variant={dateRange === "15-aug" ?  "outline" : "default"} 
            size="sm" 
            onClick={() => setDateRange("15-aug")}
          >
            15-Aug
          </Button>
          <select
            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-theme/30"
            value={selectedMonth}
            onChange={(e) => {
              setSelectedMonth(e.target.value);
              setDateRange("all");
              setCurrentPage(1);
            }}
          >
            {months.map(month => (
              <option key={month.value} value={month.value}>{month.label}</option>
            ))}
          </select>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode(viewMode === "list" ? "cards" : "list")}
          >
            {viewMode === "list" ? "View Medication Cards" : "View Medication List"}
          </Button>
        </div>

        {viewMode === "list" ? (
          /* Table View */
          <Card className="border border-gray-200 shadow-sm overflow-hidden">
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full table-auto text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 text-xs uppercase tracking-wider">
                      Medication
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 text-xs uppercase tracking-wider">
                      Time / Type
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 text-xs uppercase tracking-wider">
                      Dose
                    </th>
                    {dates.map((date) => (
                      <th
                        key={date}
                        className="px-2 py-3 text-center font-semibold text-gray-700 text-xs uppercase tracking-wider min-w-12 border-l border-gray-100"
                      >
                        {date}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {currentMeds.map((med) =>
                    med.times.map((time, timeIndex) => (
                      <tr key={`${med.id}-${time}`} className="hover:bg-gray-25 transition-colors">
                        {timeIndex === 0 ? (
                          <td
                            rowSpan={med.times.length}
                            className="px-4 py-3 font-medium text-gray-800 border-r border-gray-100 align-top pt-3 pb-3"
                          >
                            {med.name}
                          </td>
                        ) : null}

                        <td className="px-4 py-2 text-gray-600 font-medium">
                          {time === "PRN" ? (
                            <Badge
                              variant="secondary"
                              className="bg-blue-50 text-blue-700 border-blue-200 text-xs px-2 py-0.5"
                            >
                              PRN
                            </Badge>
                          ) : (
                            time
                          )}
                        </td>

                        <td className="px-4 py-2 text-gray-600">{med.dose}</td>

                        {med.status.map((given, dayIndex) => (
                          <td
                            key={`status-${med.id}-${time}-${dayIndex}`}
                            className="px-2 py-2 text-center border-l border-gray-100"
                          >
                            <div className="flex justify-center items-center h-6">
                              {given === true ? (
                                <span className="w-5 h-5 flex items-center justify-center rounded-full bg-green-100 text-green-700 text-xs font-bold">
                                  ✓
                                </span>
                              ) : given === false ? (
                                <span className="w-5 h-5 flex items-center justify-center rounded-full bg-red-100 text-red-700 text-xs font-bold">
                                  ✗
                                </span>
                              ) : (
                                <span className="w-5 h-5 rounded-full border border-gray-300"></span>
                              )}
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        ) : (
          /* Card View */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentMeds.map((med) => (
              <Card key={med.id} className="border border-gray-200 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{med.name}</CardTitle>
                  <div className="flex gap-4 text-sm text-gray-600">
                    <span>Dose: {med.dose}</span>
                    <div className="flex items-center gap-1">
                      Times: 
                      {med.times.map((time, idx) => (
                        <React.Fragment key={time}>
                          {time === "PRN" ? (
                            <Badge
                              variant="secondary"
                              className="bg-blue-50 text-blue-700 border-blue-200 text-xs px-2 py-0.5"
                            >
                              PRN
                            </Badge>
                          ) : (
                            <span>{time}</span>
                          )}
                          {idx < med.times.length - 1 && <span>,</span>}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex overflow-x-auto pb-2">
                    <div className="flex space-x-2">
                      {dates.map((date, dayIndex) => (
                        <div key={`${med.id}-${date}`} className="flex flex-col items-center min-w-10">
                          <span className="text-xs text-gray-500 mb-1">{date}</span>
                          <div className="w-8 h-8 flex items-center justify-center">
                            {med.status[dayIndex] === true ? (
                              <span className="w-6 h-6 flex items-center justify-center rounded-full bg-green-100 text-green-700 text-xs font-bold">
                                ✓
                              </span>
                            ) : med.status[dayIndex] === false ? (
                              <span className="w-6 h-6 flex items-center justify-center rounded-full bg-red-100 text-red-700 text-xs font-bold">
                                ✗
                              </span>
                            ) : (
                              <span className="w-6 h-6 rounded-full border border-gray-300"></span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {filteredMedications.length > medicationsPerPage && (
          <div className="flex justify-center items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}

        {/* Legend */}
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg text-gray-800 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-gray-600" />
              Legend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-700">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 flex items-center justify-center rounded-full bg-green-100 text-green-700 text-xs font-bold">
                  ✓
                </span>
                <span>Administered</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 flex items-center justify-center rounded-full bg-red-100 text-red-700 text-xs font-bold">
                  ✗
                </span>
                <span>Missed</span>
              </div>
              <div className="flex items-center gap-3">
                <Badge
                  variant="secondary"
                  className="bg-blue-50 text-blue-700 border-blue-200 text-xs px-2 py-0.5"
                >
                  PRN
                </Badge>
                <span>As Needed</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer Note */}
        <p className="text-xs text-gray-500 text-center mt-8">
          This eMAR is auto-generated and reflects medication administration logs.
          Always verify with clinical notes.
        </p>
      </div>
    </div>
  );
}