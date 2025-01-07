import { useEffect, useState } from "react";
import { Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AcademicHistoryDialog } from "./academic-history-dialog";
import { EnglishExamDialog } from "./english-exam-dialog";
import moment from "moment";
import { Switch } from "@/components/ui/switch";

export function AcademicRecords({ student, onSave }) {
  const [academicNotRequired, setAcademicNotRequired] = useState(student.academicHistoryRequired);
  const [academicHistory, setAcademicHistory] = useState<any>([]);
  const [newAcademicOpen, setNewAcademicOpen] = useState(false);
  const [editingAcademic, setEditingAcademic] = useState<any>(null);

  const [examNotRequired, setExamNotRequired] = useState(student.englishLanguageRequired);
  const [examHistory, setExamHistory] = useState<any>(student.englishLanguageExam);
  const [newExamOpen, setNewExamOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<any>(null);

  useEffect(() => {
    if (Array.isArray(student.academicHistory)) {
      setAcademicHistory(student.academicHistory);
    }
    if (Array.isArray(student.englishLanguageExam)) {
      setExamHistory(student.englishLanguageExam);
    }
  }, [student.academicHistory, student.examHistory]);

  const handleAddAcademic = async (data) => {
    console.log(data)
    if (editingAcademic) {
      const updatedRecord = { ...data, id: editingAcademic.id };
      onSave({ academicHistory: [updatedRecord] });
      setEditingAcademic(null);
    } else {
      onSave({ academicHistory: [data] });
    }
  };

  const handleAddExam = async (data) => {
    if (editingExam) {
      const updatedExam = { ...data, id: editingExam.id };
      onSave({ englishLanguageExam: [updatedExam] });
      setEditingExam(null);
    } else {
      onSave({ englishLanguageExam: [data] });
    }
  };

  const handleEditAcademic = (record) => {
    setEditingAcademic(record);
    setNewAcademicOpen(true);
  };

  const handleEditExam = (exam) => {
    setEditingExam(exam);
    setNewExamOpen(true);
  };


  const handleAcademicNotRequiredChange = (checked) => {
    setAcademicNotRequired(checked);
    onSave({ academicHistoryRequired: checked });
  };

  const handleExamNotRequiredChange = (checked) => {
    setExamNotRequired(checked);
    onSave({ englishLanguageRequired: checked });
  };

  const handleStatusChange = (id, currentStatus) => {
    // Toggle the status
    const newStatus = currentStatus === 1 ? 0 : 1;
    // Persist the change using onSave
    const updatedContact = academicHistory.find(contact => contact.id === id);
    if (updatedContact) {
      const updatedContactWithStatus = { ...updatedContact, status: newStatus };
      onSave({ academicHistory: [updatedContactWithStatus] });
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4 p-4 shadow-md rounded-md">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Academic History</h2>
          {!academicNotRequired && (
            <Button
              className="bg-supperagent text-white hover:bg-supperagent/90"
              onClick={() => setNewAcademicOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              New History
            </Button>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="academicNotRequired"
            checked={academicNotRequired}
            onCheckedChange={(checked) => handleAcademicNotRequiredChange(checked)}
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
                  
                  <TableHead>Institution</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Study Level</TableHead>
                  <TableHead>Result Score</TableHead>
                  <TableHead>Out Of</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {academicHistory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center">
                      No matching records found
                    </TableCell>
                  </TableRow>
                ) : (
                  academicHistory.map((record) => (
                    <TableRow key={record.id}>
                      
                      <TableCell>{record.institution}</TableCell>
                      <TableCell>{record.course}</TableCell>
                      <TableCell>{record.studyLevel}</TableCell>
                      <TableCell>{record.resultScore}</TableCell>
                      <TableCell>{record.outOf}</TableCell>
                      <TableCell>{moment(record.startDate).format('DD-MM-YYYY')}</TableCell>
                      <TableCell>{moment(record.endDate).format('DD-MM-YYYY')}</TableCell>
                      <TableCell>
                      <Switch
                            checked={parseInt(record.status) === 1}
                            onCheckedChange={(checked) => handleStatusChange(record.id, checked ? 0 : 1)}
                            className="mx-auto"
                          />


                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditAcademic(record)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </>
        )}
      </div>

      <div className="space-y-4 p-4 shadow-xl rounded-md">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">English Language Exams</h2>
          {!examNotRequired && (
            <Button
              className="bg-supperagent text-white hover:bg-supperagent/90"
              onClick={() => setNewExamOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              New Exam
            </Button>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="examNotRequired"
            checked={examNotRequired}
            onCheckedChange={(checked) => handleExamNotRequiredChange(checked)}
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
                  
                  <TableHead>Exam</TableHead>
                  <TableHead>Exam Date</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {examHistory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      No matching records found
                    </TableCell>
                  </TableRow>
                ) : (
                  examHistory.map((exam) => (
                    <TableRow key={exam.id}>
                      
                      <TableCell>{exam.exam}</TableCell>
                      <TableCell>{exam.examDate}</TableCell>
                      <TableCell>{exam.score}</TableCell>
                      <TableCell>{exam.status}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditExam(exam)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </>
        )}
      </div>

      <AcademicHistoryDialog
        open={newAcademicOpen}
        onOpenChange={(open) => {
          setNewAcademicOpen(open);
          if (!open) setEditingAcademic(null);
        }}
        onSubmit={handleAddAcademic}
        initialData={editingAcademic}
      />

      <EnglishExamDialog
        open={newExamOpen}
        onOpenChange={(open) => {
          setNewExamOpen(open);
          if (!open) setEditingExam(null);
        }}
        onSubmit={handleAddExam}
        initialData={editingExam}
      />
    </div>
  );
}
