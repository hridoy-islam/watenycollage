import { useEffect, useState } from "react"
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
import { WorkExperienceDialog } from "./work-experience-dialog"
import moment from "moment"

export function WorkExperienceSection({ student, onSave }) {
  const [noExperience, setNoExperience] = useState(false)
  const [workExperiences, setWorkExperiences] = useState<any>(student.workDetails || [])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingWorkDetail, setEditingWorkDetail] = useState<any>(null)


  const handleEdit = (experience) => {
    setEditingWorkDetail(experience)
    setDialogOpen(true)
  }

  useEffect(() => {
    if (Array.isArray(student.workDetails)) {
      setWorkExperiences(student.workDetails);
    }
  }, [student.workDetails]);

  const handleAddWorkDetail = async (data) => {
    if (editingWorkDetail) {
      const updatedWorkDetail = { ...data, id: editingWorkDetail.id }
      onSave({ workDetails: [updatedWorkDetail] });
      setEditingWorkDetail(null);
    } else {
      onSave({ workDetails: [data] });
    }
  };

  const handleWorkExperience = (checked) => {
    setNoExperience(checked);
    onSave({ workExperience: checked });
  };

  const handleStatusChange = (id, currentStatus) => {
    // Toggle the status
    const newStatus = currentStatus === 1 ? 0 : 1;
    // Persist the change using onSave
    const updatedContact = workExperiences.find(contact => contact.id === id);
    if (updatedContact) {
      const updatedContactWithStatus = { ...updatedContact, status: newStatus };
      onSave({ workDetails: [updatedContactWithStatus] });
    }
  };

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
          onCheckedChange={(checked) => handleWorkExperience(checked)}
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
              {workExperiences?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center">
                    No matching records found
                  </TableCell>
                </TableRow>
              ) : (
                workExperiences.map((experience) => (
                  <TableRow key={experience.id}>
                    <TableCell>{experience.jobTitle}</TableCell>
                    <TableCell>{experience.organization}</TableCell>
                    <TableCell>{experience.address}</TableCell>
                    <TableCell>{experience.phone}</TableCell>
                    <TableCell>{moment(experience.fromDate).format('DD-MM-YYYY')}</TableCell>
                    <TableCell>
                      {experience.toDate !==null && moment(experience.toDate).format('DD-MM-YYYY')}
                    </TableCell>
                    <TableCell className="text-center">
                    {experience.currentlyWorking == 1 && "Yes"}
                    </TableCell>
                    <TableCell>

                      <Switch
                        checked={parseInt(experience.status) === 1}
                        onCheckedChange={(checked) => handleStatusChange(experience.id, checked ? 0 : 1)}
                        className="mx-auto"
                      />


                    </TableCell>
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

        </>
      )}

      <WorkExperienceDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) setEditingWorkDetail(null)
        }}
        onSubmit={handleAddWorkDetail}
        initialData={editingWorkDetail}
      />
    </div>
  )
}

