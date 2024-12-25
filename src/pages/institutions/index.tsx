import { useState } from "react"
import { Pen, Plus } from 'lucide-react'
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
import { InstitutionDialog } from "./components/institution-dialog"

const initialInstitutions = [
  { id: 1, name: "Demo Institution", active: true },
  { id: 2, name: "GBS (HND/HNC)", active: true },
  { id: 3, name: "GBS (CCCU)", active: true },
  { id: 4, name: "GBS (UOS)", active: true },
  { id: 5, name: "GBS (LTU)", active: true },
]

export default function InstitutionsPage() {
  const [institutions, setInstitutions] = useState(initialInstitutions)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingInstitution, setEditingInstitution] = useState()

  const handleSubmit = (data) => {
    console.log(data);
    if (editingInstitution) {
      setInstitutions(institutions.map(inst => 
        inst.id === editingInstitution?.id
          ? { ...inst, ...data }
          : inst
      ))
      setEditingInstitution(undefined)
    } else {
      const newId = Math.max(...institutions.map(i => i.id)) + 1
      setInstitutions([...institutions, { id: newId, ...data }])
    }
  }

  const handleStatusChange = (id: number, active: boolean) => {
    console.log(id, active)
    setInstitutions(institutions.map(inst => 
      inst.id === id ? { ...inst, active } : inst
    ))
  }

  const handleEdit = (institution) => {
    setEditingInstitution(institution)
    setDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">All Institutions</h1>
        <Button className="bg-supperagent text-white hover:bg-supperagent/90" size={'sm'} onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Institution
        </Button>
      </div>
      <div className="rounded-md bg-white shadow-2xl p-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-20">#ID</TableHead>
            <TableHead>Institution</TableHead>
            <TableHead className="w-32 text-center">Status</TableHead>
            <TableHead className="w-32 text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {institutions.map((institution) => (
            <TableRow key={institution.id}>
              <TableCell>{institution.id}</TableCell>
              <TableCell>{institution.name}</TableCell>
              <TableCell className="text-center">
                <Switch
                  checked={institution.active}
                  onCheckedChange={(checked) => handleStatusChange(institution.id, checked)}
                  className="mx-auto"
                />
              </TableCell>
              <TableCell className="text-center">
                <Button
                  variant="ghost"
                  className="bg-supperagent text-white hover:bg-supperagent/90 border-none"
                  size="icon"
                  onClick={() => handleEdit(institution)}
                >
                  <Pen className="w-4 h-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      </div>
      <InstitutionDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) setEditingInstitution(undefined)
        }}
        onSubmit={handleSubmit}
        initialData={editingInstitution}
      />
    </div>
  )
}

