import { useState } from "react"
import { Plus } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { DataTablePagination } from "./data-table-pagination"
import { AcademicHistoryDialog } from "./academic-history-dialog"
import { EnglishExamDialog } from "./english-exam-dialog"
import type { AcademicRecord, EnglishExam } from "@/types/index"

export function AcademicRecords({ student, onSave }: PersonalDetailsFormProps) {
  // State for academic history
  const [academicNotRequired, setAcademicNotRequired] = useState(false)
  const [academicHistory, setAcademicHistory] = useState<AcademicRecord[]>([])
  const [academicPageSize, setAcademicPageSize] = useState(10)
  const [academicPage, setAcademicPage] = useState(1)
  const [newAcademicOpen, setNewAcademicOpen] = useState(false)

  // State for English exams
  const [examNotRequired, setExamNotRequired] = useState(false)
  const [examHistory, setExamHistory] = useState<EnglishExam[]>([])
  const [examPageSize, setExamPageSize] = useState(10)
  const [examPage, setExamPage] = useState(1)
  const [newExamOpen, setNewExamOpen] = useState(false)

  // Handlers for academic history
  const handleAddAcademic = (data: Omit<AcademicRecord, "id">) => {
    const newRecord: AcademicRecord = {
      id: `AC${academicHistory.length + 1}`,
      ...data,
    }
    setAcademicHistory([...academicHistory, newRecord])
  }

  // Handlers for English exams
  const handleAddExam = (data: Omit<EnglishExam, "id">) => {
    const newExam: EnglishExam = {
      id: `EX${examHistory.length + 1}`,
      ...data,
    }
    setExamHistory([...examHistory, newExam])
  }

  // Pagination calculations
  const academicTotalPages = Math.ceil(academicHistory.length / academicPageSize)
  const examTotalPages = Math.ceil(examHistory.length / examPageSize)

  const paginatedAcademicHistory = academicHistory.slice(
    (academicPage - 1) * academicPageSize,
    academicPage * academicPageSize
  )

  const paginatedExamHistory = examHistory.slice(
    (examPage - 1) * examPageSize,
    examPage * examPageSize
  )

  return (
    <div className="space-y-8">
      <div className="space-y-4 p-4 shadow-md rounded-md">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Academic History</h2>
          {!academicNotRequired && (
            <Button className="bg-supperagent text-white hover:bg-supperagent/90" onClick={() => setNewAcademicOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New History
            </Button>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="academicNotRequired"
            checked={academicNotRequired}
            onCheckedChange={(checked) => setAcademicNotRequired(checked as boolean)}
          />
          <label htmlFor="academicNotRequired">
            Academic History not required for this student.
          </label>
        </div>

        {!academicNotRequired && (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">#ID</TableHead>
                  <TableHead>Institution</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Study Level</TableHead>
                  <TableHead>Result Score</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedAcademicHistory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center">
                      No matching records found
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedAcademicHistory.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{record.id}</TableCell>
                      <TableCell>{record.institution}</TableCell>
                      <TableCell>{record.course}</TableCell>
                      <TableCell>{record.studyLevel}</TableCell>
                      <TableCell>{record.resultScore}</TableCell>
                      <TableCell>{record.startDate}</TableCell>
                      <TableCell>{record.endDate}</TableCell>
                      <TableCell>{record.status}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <DataTablePagination
              pageSize={academicPageSize}
              setPageSize={setAcademicPageSize}
              currentPage={academicPage}
              totalPages={academicTotalPages}
              onPageChange={setAcademicPage}
            />
          </>
        )}
      </div>

      <div className="space-y-4 p-4 shadow-xl rounded-md">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">English Language Exams</h2>
          {!examNotRequired && (
            <Button className="bg-supperagent text-white hover:bg-supperagent/90" onClick={() => setNewExamOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Exam
            </Button>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="examNotRequired"
            checked={examNotRequired}
            onCheckedChange={(checked) => setExamNotRequired(checked as boolean)}
          />
          <label htmlFor="examNotRequired">
            English exam not required for this student.
          </label>
        </div>

        {!examNotRequired && (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">#ID</TableHead>
                  <TableHead>Exam</TableHead>
                  <TableHead>Exam Date</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedExamHistory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      No matching records found
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedExamHistory.map((exam) => (
                    <TableRow key={exam.id}>
                      <TableCell>{exam.id}</TableCell>
                      <TableCell>{exam.exam}</TableCell>
                      <TableCell>{exam.examDate}</TableCell>
                      <TableCell>{exam.score}</TableCell>
                      <TableCell>{exam.status}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <DataTablePagination
              pageSize={examPageSize}
              setPageSize={setExamPageSize}
              currentPage={examPage}
              totalPages={examTotalPages}
              onPageChange={setExamPage}
            />
          </>
        )}
      </div>

      <AcademicHistoryDialog
        open={newAcademicOpen}
        onOpenChange={setNewAcademicOpen}
        onSubmit={handleAddAcademic}
      />

      <EnglishExamDialog
        open={newExamOpen}
        onOpenChange={setNewExamOpen}
        onSubmit={handleAddExam}
      />
    </div>
  )
}

