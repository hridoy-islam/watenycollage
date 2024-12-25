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
import { NewHistoryDialog } from "./new-history-dialog"
import { NewRefusalDialog } from "./new-refusal-dialog"
import type { VisaHistory, RefusalHistory } from "@/types/index"

export function TravelImmigrationHistory({ student, onSave }: PersonalDetailsFormProps) {
  const [hasApplied, setHasApplied] = useState(false)
  const [needsVisa, setNeedsVisa] = useState(false)
  const [hasRefusal, setHasRefusal] = useState(false)
  const [currentlyInUK, setCurrentlyInUK] = useState(false)
  const [visaHistory, setVisaHistory] = useState<VisaHistory[]>([])
  const [refusalHistory, setRefusalHistory] = useState<RefusalHistory[]>([])
  const [newHistoryOpen, setNewHistoryOpen] = useState(false)
  const [newRefusalOpen, setNewRefusalOpen] = useState(false)

  const handleAddHistory = (data: Omit<VisaHistory, "id">) => {
    const newHistory: VisaHistory = {
      id: `VH${visaHistory.length + 1}`,
      ...data
    }
    setVisaHistory([...visaHistory, newHistory])
  }

  const handleAddRefusal = (data: Omit<RefusalHistory, "id">) => {
    const newRefusal: RefusalHistory = {
      id: `RF${refusalHistory.length + 1}`,
      ...data
    }
    setRefusalHistory([...refusalHistory, newRefusal])
  }

  return (
    <div className="space-y-8">
      <div className="space-y-4 p-4 shadow-md rounded-md">
        <h2 className="text-lg font-semibold">Travel History</h2>
        
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <p>Has this student applied for leave to remain in the UK in the past 10 years?</p>
            <div className="flex gap-2">
              <Button
                variant={hasApplied ? "default" : "outline"}
                onClick={() => setHasApplied(true)}
              >
                Yes
              </Button>
              <Button
                variant={!hasApplied ? "default" : "outline"}
                onClick={() => setHasApplied(false)}
              >
                No
              </Button>
            </div>
          </div>

          {hasApplied && (
            <>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="currentlyInUK"
                  checked={currentlyInUK}
                  onCheckedChange={(checked) => setCurrentlyInUK(checked as boolean)}
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
                  <Button className="bg-supperagent text-white hover:bg-supperagent/90" onClick={() => setNewHistoryOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    New History
                  </Button>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">#ID</TableHead>
                      <TableHead>Purpose</TableHead>
                      <TableHead>Arrival</TableHead>
                      <TableHead>Departure</TableHead>
                      <TableHead>Visa Start</TableHead>
                      <TableHead>Visa Expiry</TableHead>
                      <TableHead>Visa Type</TableHead>
                      <TableHead>Status</TableHead>
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
                          <TableCell>{history.id}</TableCell>
                          <TableCell>{history.purpose}</TableCell>
                          <TableCell>{history.arrival}</TableCell>
                          <TableCell>{history.departure}</TableCell>
                          <TableCell>{history.visaStart}</TableCell>
                          <TableCell>{history.visaExpiry}</TableCell>
                          <TableCell>{history.visaType}</TableCell>
                          <TableCell>{history.status}</TableCell>
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

      <div className="space-y-4 p-4 shadow-md rounded-md">
        <h2 className="text-lg font-semibold">Immigration History</h2>
        
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <p>Does this student need a visa to stay in the UK?</p>
            <div className="flex gap-2">
              <Button
                variant={needsVisa ? "default" : "outline"}
                onClick={() => setNeedsVisa(true)}
              >
                Yes
              </Button>
              <Button
                variant={!needsVisa ? "default" : "outline"}
                onClick={() => setNeedsVisa(false)}
              >
                No
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <p>For the UK or any other country, has this student ever been refused a visa, refused permission to stay or remain, refused asylum, or deported?</p>
            <div className="flex gap-2">
              <Button
                variant={hasRefusal ? "default" : "outline"}
                onClick={() => setHasRefusal(true)}
              >
                Yes
              </Button>
              <Button
                variant={!hasRefusal ? "default" : "outline"}
                onClick={() => setHasRefusal(false)}
              >
                No
              </Button>
            </div>
          </div>

          {hasRefusal && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  Please provide details of any visa refusals or immigration issues.
                </p>
                <Button onClick={() => setNewRefusalOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  New Refuse History
                </Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">#ID</TableHead>
                    <TableHead>Refusal Type</TableHead>
                    <TableHead>Refusal Date</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead>Visa Type</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {refusalHistory.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center">
                        No matching records found
                      </TableCell>
                    </TableRow>
                  ) : (
                    refusalHistory.map((history) => (
                      <TableRow key={history.id}>
                        <TableCell>{history.id}</TableCell>
                        <TableCell>{history.refusalType}</TableCell>
                        <TableCell>{history.refusalDate}</TableCell>
                        <TableCell>{history.details}</TableCell>
                        <TableCell>{history.country}</TableCell>
                        <TableCell>{history.visaType}</TableCell>
                        <TableCell>{history.status}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>

      <NewHistoryDialog
        open={newHistoryOpen}
        onOpenChange={setNewHistoryOpen}
        onSubmit={handleAddHistory}
      />

      <NewRefusalDialog
        open={newRefusalOpen}
        onOpenChange={setNewRefusalOpen}
        onSubmit={handleAddRefusal}
      />
    </div>
  )
}

