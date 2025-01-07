import { useEffect, useState } from "react"
import { Pencil, Plus } from 'lucide-react'
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
import { NewHistoryDialog } from "./new-history-dialog"
import type { VisaHistory } from "@/types/index"
import moment from "moment"
import { Switch } from "@/components/ui/switch"

export function TravelImmigrationHistory({ student, onSave }) {
  const [ukInPast, setUkInPast] = useState(student.ukInPast)
  const [currentlyInUK, setCurrentlyInUK] = useState(student.currentlyInUk)
  const [visaHistory, setVisaHistory] = useState<VisaHistory[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingHistory, setEditingHistory] = useState(null)

  const handleEditHistory = (experience) => {
    setEditingHistory(experience)
    setDialogOpen(true)
  }

  useEffect(() => {
    if (Array.isArray(student.travelHistory)) {
      setVisaHistory(student.travelHistory);
    }
  }, [student.travelHistory]);

  const handleAddHistory = async (data) => {
    if (editingHistory) {
      const updatedHistory = { ...data, id: editingHistory.id }
      onSave({ travelHistory: [updatedHistory] });
      setEditingHistory(null);
    } else {
      onSave({ travelHistory: [data] });
    }
  };

  const handleUkInPastChange = (applied) => {
    setUkInPast(applied);
    onSave({ ukInPast: applied });
  };


  const handleCurrentlyInUK = (applied) => {
    setCurrentlyInUK(applied);
    onSave({ currentlyInUk: applied });
  };



  const handleStatusChange = (id, currentStatus) => {
    // Toggle the status
    const newStatus = currentStatus === 1 ? 0 : 1;
    // Persist the change using onSave
    const updatedContact = visaHistory.find(contact => contact.id === id);
    if (updatedContact) {
      const updatedContactWithStatus = { ...updatedContact, status: newStatus };
      onSave({ travelHistory: [updatedContactWithStatus] });
    }
  };



  return (
    <div className="space-y-8">
      <div className="space-y-4 p-4 shadow-md rounded-md">
        <h2 className="text-lg font-semibold">Travel History</h2>

        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <p>Has this student applied for leave to remain in the UK in the past 10 years?</p>
            <div className="flex gap-2">
              <Button
                onClick={() => handleUkInPastChange(true)}
                className={ukInPast ? "bg-supperagent text-white hover:bg-supperagent/90" : "bg-white"}
              >
                Yes
              </Button>
              <Button
                onClick={() => handleUkInPastChange(false)}
                className={!ukInPast ? "bg-supperagent text-white hover:bg-supperagent/90" : "bg-white"}
              >
                No
              </Button>
            </div>
          </div>
          {ukInPast && (
            <>
              <div className="flex items-center space-x-2">
                
              <Checkbox
                id="currentlyInUK"
                checked={currentlyInUK}
                onCheckedChange={(checked) => handleCurrentlyInUK(checked as boolean)}  // Use handleCurrentlyInUK here
              />
                <label htmlFor="currentlyInUK">
                  Please tick if you are currently in the UK.
                </label>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">
                    Please provide details of each visa you have held to stay in the United Kingdom.
                  </p>
                  <Button className="bg-supperagent text-white hover:bg-supperagent/90" onClick={() => setDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    New History
                  </Button>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      
                      <TableHead>Purpose</TableHead>
                      <TableHead>Arrival</TableHead>
                      <TableHead>Departure</TableHead>
                      <TableHead>Visa Start</TableHead>
                      <TableHead>Visa Expiry</TableHead>
                      <TableHead>Visa Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visaHistory.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center">
                          No matching records found
                        </TableCell>
                      </TableRow>
                    ) : (
                      visaHistory.map((history) => (
                        <TableRow key={history.id}>
                          
                          <TableCell>{history.purpose}</TableCell>
                          <TableCell>{moment(history.arrival).format('DD-MM-YYYY')}</TableCell>
                          <TableCell>{moment(history.departure).format('DD-MM-YYYY')}</TableCell>
                          <TableCell>{moment(history.visaStart).format('DD-MM-YYYY')}</TableCell>
                          <TableCell>{moment(history.visaExpiry).format('DD-MM-YYYY')}</TableCell>
                          <TableCell>{history.visaType}</TableCell>
                          
                          <TableCell>
                          <Switch
                            checked={parseInt(history.status) === 1}
                            onCheckedChange={(checked) => handleStatusChange(history.id, checked ? 0 : 1)}
                            className="mx-auto"
                          />
                          </TableCell>

                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditHistory(history)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </div>
      </div>


      <NewHistoryDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) setEditingHistory(null)
        }}
        onSubmit={handleAddHistory}
        initialData={editingHistory}
      />
    </div>
  )
}

