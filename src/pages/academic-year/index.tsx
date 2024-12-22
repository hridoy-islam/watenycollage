import { useState } from "react"
import { Plus, Settings } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { AcademicYearDialog } from "./components/academic-year-dialog"

const initialAcademicYears = [
  { id: 1, name: "2021-2022", active: true },
  { id: 2, name: "2022-2023", active: true },
  { id: 3, name: "2023-2024", active: true },
]

export default function AcademicYearPage() {
  const [academicYears, setAcademicYears] = useState(initialAcademicYears)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingAcademicYear, setEditingAcademicYear] = useState()

  const handleSubmit = (data) => {
    if (editingAcademicYear) {
      setAcademicYears(academicYears.map(year => 
        year.id === editingAcademicYear?.id
          ? { ...year, ...data }
          : year
      ))
      setEditingAcademicYear(undefined)
    } else {
      const newId = Math.max(...academicYears.map(year => year.id)) + 1
      setAcademicYears([...academicYears, { id: newId, ...data }])
    }
  }

  const handleStatusChange = (id, active) => {
    setAcademicYears(academicYears.map(year => 
      year.id === id ? { ...year, active } : year
    ))
  }

  const handleEdit = (academicYear) => {
    setEditingAcademicYear(academicYear)
    setDialogOpen(true)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">All Academic Years</h1>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Academic Year
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-20">#ID</TableHead>
            <TableHead>Academic Year</TableHead>
            <TableHead className="w-32 text-center">Status</TableHead>
            <TableHead className="w-32 text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {academicYears.map((year) => (
            <TableRow key={year.id}>
              <TableCell>{year.id}</TableCell>
              <TableCell>{year.name}</TableCell>
              <TableCell className="text-center">
                <Switch
                  checked={year.active}
                  onCheckedChange={(checked) => handleStatusChange(year.id, checked)}
                  className="mx-auto"
                />
              </TableCell>
              <TableCell className="text-center">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEdit(year)}
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <AcademicYearDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) setEditingAcademicYear(undefined)
        }}
        onSubmit={handleSubmit}
        initialData={editingAcademicYear}
      />
    </div>
  )
}
