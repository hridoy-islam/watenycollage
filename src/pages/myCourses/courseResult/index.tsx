import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Printer, Loader2, MoveLeft } from "lucide-react";
import axiosInstance from "@/lib/axios";
import { formatReleaseMoment } from '@/lib/result-release';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSelector } from "react-redux";
import { BlinkingDots } from "@/components/shared/blinking-dots";
import React from "react";

export default function MyCoursesResultPage() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasUnpublished, setHasUnpublished] = useState(false);
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get("courseId") || "";
  const { user } = useSelector((state: any) => state.auth);
  const navigate = useNavigate();
  useEffect(() => {
    if (!courseId || !user?._id) return;
    setLoading(true);
    axiosInstance
      .get(`/assignment/student-assignments/result/${user._id}`, {
        params: { courseId, limit: "all" },
      })
      .then((res: any) => {
        const data = res.data?.data?.result || res.data?.data || [];
        setResults(data);
        setHasUnpublished(!data.length);
      })
      .catch((e) => console.error("Failed to load results:", e))
      .finally(() => setLoading(false));
  }, [courseId, user?._id]);

  const organizedResults = useMemo(() => {
    // Group by year first, then by courseTerm
    const yearGroups = new Map<string, Map<string, any[]>>();
    
    for (const item of results) {
      const yearKey = item.year || "year 1";
      const termKey = item.courseTermName || item.courseTerm || "Unknown Term";
      
      if (!yearGroups.has(yearKey)) {
        yearGroups.set(yearKey, new Map());
      }
      
      const termGroups = yearGroups.get(yearKey)!;
      if (!termGroups.has(termKey)) {
        termGroups.set(termKey, []);
      }
      
      termGroups.get(termKey)!.push(item);
    }
    
    // Sort items within each term group by courseTermOrder
    for (const termGroups of yearGroups.values()) {
      for (const items of termGroups.values()) {
        items.sort(
          (a: any, b: any) => (a.courseTermOrder || 0) - (b.courseTermOrder || 0)
        );
      }
    }
    
    // Sort years
    const yearOrder: Record<string, number> = {
      "year 1": 1,
      "year 2": 2,
      "year 3": 3,
      "year 4": 4,
      "year 5": 5,
    };
    
    const sortedYears = [...yearGroups.keys()].sort(
      (a, b) => (yearOrder[a] ?? 99) - (yearOrder[b] ?? 99)
    );
    
    // Build final structure
    const result = [];
    for (const year of sortedYears) {
      const termGroups = yearGroups.get(year)!;
      
      // Sort terms within a year
      const sortedTerms = [...termGroups.keys()].sort((a, b) => {
        const aItems = termGroups.get(a)!;
        const bItems = termGroups.get(b)!;
        const aOrder = aItems[0]?.courseTermOrder || 0;
        const bOrder = bItems[0]?.courseTermOrder || 0;
        return aOrder - bOrder;
      });
      
      for (const term of sortedTerms) {
        result.push({
          year,
          term,
          items: termGroups.get(term) || [],
        });
      }
    }
    
    return result;
  }, [results]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <BlinkingDots />
      </div>
    );
  }

  if (!results.length) {
    return (
      <div className="rounded-2xl border border-black/10 bg-gradient-to-br from-black/5 to-white p-8 text-center shadow-sm">
        <h3 className="text-base font-semibold text-black">
          {hasUnpublished ? "Results Not Published Yet" : "No Published Results"}
        </h3>
        <p className="mt-1 text-sm text-black">
          {hasUnpublished
            ? "The assignment results for this course, term and group have not been published."
            : "No published assignment results are available for the selected course, term and group."}
        </p>
      </div>
    );
  }

  const firstResult = results[0] || {};
  const courseName =
    firstResult.courseName ||
    "Unknown Course";
  const intakeName =
    firstResult.intakeName ||
    "Unknown Intake";

  return (
    <div className="rounded-lg border border-gray-100 bg-white shadow-sm overflow-hidden">
      {/* Single Card Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 p-4 border-b border-gray-200">
        <div>
          <h2 className="text-xl font-extrabold text-black tracking-tight">
            Student Results
          </h2>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-black">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-theme/10  py-0.5 text-xs font-bold text-theme">
              Course: <span className="font-extrabold">{courseName}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-bold text-indigo-900">
              Intake: <span className="font-extrabold">{intakeName}</span>
            </span>
          </div>
        </div>

        <div>
          <Button size={'sm'} onClick={()=> navigate(-1)}><MoveLeft className="w-4 h-4 mr-2" />Back</Button>
        </div>
       
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-black/5 to-black/5 hover:from-black/5 hover:to-black/5">
              <TableHead className="text-[10px] font-extrabold uppercase tracking-widest text-black text-left px-4 py-3">
                Assignment Title
              </TableHead>
              <TableHead className="text-[10px] font-extrabold uppercase tracking-widest text-black text-left px-4 py-3">
                Unit
              </TableHead>
              <TableHead className="text-[10px] font-extrabold uppercase tracking-widest text-black text-left px-4 py-3">
                Group
              </TableHead>
              <TableHead className="text-[10px] font-extrabold uppercase tracking-widest text-black text-left px-4 py-3">
                Release Date
              </TableHead>
              <TableHead className="text-[10px] font-extrabold uppercase tracking-widest text-black text-left px-4 py-3">
                Status
              </TableHead>
              <TableHead className="text-[10px] font-extrabold uppercase tracking-widest text-black text-left px-4 py-3">
                Result / Grade
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {organizedResults.map((group: any) => (
              <React.Fragment key={`${group.year}-${group.term}`}>
                <TableRow className="bg-gradient-to-r from-theme/10 to-theme/5 hover:from-theme/15 hover:to-theme/5 border-b-0">
                  <TableCell
                    colSpan={6}
                    className="text-[10px] font-extrabold uppercase tracking-widest text-theme px-4 py-2.5 bg-gradient-to-r from-theme/10 to-theme/5"
                  >
                    <div className="flex items-center gap-2">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-theme"></span>
                      Year: {group.year ? group.year.replace("year ", "Year ") : "—"}
                      <span className="mx-1 text-black">|</span>
                      Term: {group.term || "—"}
                    </div>
                  </TableCell>
                </TableRow>
                {group.items.map((item: any, idx: number) => (
                  <TableRow
                    key={item.assignmentSettingId || item.assignmentId || idx}
                    className="hover:bg-black/5 transition-colors border-b border-black/10 last:border-0"
                  >
                    <TableCell className="text-xs font-semibold text-black px-4 py-3">
                      {item.assignmentName || item.unitTitle || "—"}
                    </TableCell>
                    <TableCell className="text-xs text-black px-4 py-3">
                      {item.unitTitle || "—"}
                    </TableCell>
                    <TableCell className="text-xs text-black px-4 py-3">
                      {item.groupName || "—"}
                    </TableCell>
                    <TableCell className="text-xs text-black px-4 py-3 whitespace-nowrap">
                      {/* Shown in UK time, which is the clock the release was
                          set against - not the reader's own. */}
                      {item.resultReleaseDate
                        ? formatReleaseMoment(
                            item.resultReleaseDate,
                            item.resultReleaseTime
                          )
                        : "—"}
                    </TableCell>
                    <TableCell className="text-xs px-4 py-3">
                      <Badge
                        className={`text-[10px] font-extrabold rounded-full px-2.5 py-0.5 ${
                          item.status === "completed"
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                            : item.status === "submitted"
                            ? "bg-sky-50 text-sky-800 border-sky-200"
                            : item.status === "resubmission_required"
                            ? "bg-amber-50 text-amber-800 border-amber-200"
                            : "bg-black/5 text-black border-black/10"
                        }`}
                      >
                        {item.status ? item.status.replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase()) : "—"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs font-bold px-4 py-3">
                      {item.finalGrade && item.status === "completed" ? (
                        <Badge
                          variant="default"
                          className="bg-emerald-50 text-emerald-800 border-emerald-300 px-2.5 py-0.5 text-xs font-extrabold rounded-full"
                        >
                          {item.finalGrade}
                        </Badge>
                      ) : item.status === "completed" ? (
                        <Badge
                          variant="outline"
                          className="text-xs px-2.5 py-0.5 rounded-full text-amber-700 border-amber-300 bg-amber-50"
                        >
                          —
                        </Badge>
                      ) : (
                        <span className="text-xs text-black">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}