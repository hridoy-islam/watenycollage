import { useState } from "react"
import { Plus, Pencil } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { DataTablePagination } from "./data-table-pagination"
import { WorkExperienceDialog } from "./work-experience-dialog"
import type { WorkExperience } from "@/types/index"

export function WorkExperienceSection({ student, onSave }: PersonalDetailsFormProps) {
  const [noExperience, setNoExperience] = useState(false)
  const [workExperiences, setWorkExperiences] = useState<WorkExperience[]>([
    {
      id: "22",
      jobTitle: "Chef",
      organizationName: "Champer Champer",
      organizationAddress: "Holborn",
      phone: "",
      fromDate: "2019-01-01",
      toDate: "2021-12-31",
      currentlyWorking: false,
      status: "Completed"
    }
  ])
  const [pageSize, setPageSize] = useState(10)
  const [page, setPage] = useState(1)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingExperience, setEditingExperience] = useState<WorkExperience | null>(null)

  const handleAddExperience = (data: Omit<WorkExperience, "id">) => {
    if (editingExperience) {
      setWorkExperiences(workExperiences.map(exp => 
        exp.id === editingExperience.id ? { ...exp, ...data } : exp
      ))
      setEditingExperience(null)
    } else {
      const newExperience: WorkExperience = {
        id: `WE${workExperiences.length + 1}`,
        ...data
      }
      setWorkExperiences([...workExperiences, newExperience])
    }
  }

  const handleEdit = (experience: WorkExperience) => {
    setEditingExperience(experience)
    setDialogOpen(true)
  }

  const totalPages = Math.ceil(workExperiences.length / pageSize)
  const paginatedExperiences = workExperiences.slice(
    (page - 1) * pageSize,
    page * pageSize
  )

  return (
    <div className="space-y-4 rounded-md shadow-md p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Work Details</h2>
        {!noExperience && (
          <Button className="bg-supperagent text-white hover:bg-supperagent/90" onClick={() => setDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Work
          </Button>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="noExperience"
          checked={noExperience}
          onCheckedChange={(checked) => setNoExperience(checked as boolean)}
        />
        <label htmlFor="noExperience">
          No work Experiences.
        </label>
      </div>

      {!noExperience && (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">#ID</TableHead>
                <TableHead>Job Title</TableHead>
                <TableHead>Name of Org.</TableHead>
                <TableHead>Org. Address</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>From</TableHead>
                <TableHead>To</TableHead>
                <TableHead className="text-center">Currently Working</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedExperiences.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center">
                    No matching records found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedExperiences.map((experience) => (
                  <TableRow key={experience.id}>
                    <TableCell>{experience.id}</TableCell>
                    <TableCell>{experience.jobTitle}</TableCell>
                    <TableCell>{experience.organizationName}</TableCell>
                    <TableCell>{experience.organizationAddress}</TableCell>
                    <TableCell>{experience.phone}</TableCell>
                    <TableCell>{experience.fromDate}</TableCell>
                    <TableCell>
                      {experience.currentlyWorking ? "Present" : experience.toDate}
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch
                        checked={experience.currentlyWorking}
                        onCheckedChange={(checked) => {
                          setWorkExperiences(workExperiences.map(exp =>
                            exp.id === experience.id
                              ? { ...exp, currentlyWorking: checked }
                              : exp
                          ))
                        }}
                      />
                    </TableCell>
                    <TableCell>{experience.status}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(experience)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <DataTablePagination
            pageSize={pageSize}
            setPageSize={setPageSize}
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </>
      )}

      <WorkExperienceDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) setEditingExperience(null)
        }}
        onSubmit={handleAddExperience}
      />
    </div>
  )
}

