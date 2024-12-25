import { useState } from "react"
import { Plus, Pencil } from 'lucide-react'
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
import { DataTablePagination } from "./data-table-pagination"
import { EmergencyContactDialog } from "./emergency-contact-dialog"
import type { EmergencyContact } from "@/types/index"

const initialContacts: EmergencyContact[] = [
  {
    id: "32",
    name: "Rawnok Nodi",
    phone: "07477351793",
    email: "rawnoknodi@gmail.com",
    address: "",
    relationship: "Brother",
    status: true
  }
]

export function EmergencyContacts({ student, onSave }: PersonalDetailsFormProps) {
  const [contacts, setContacts] = useState<EmergencyContact[]>(initialContacts)
  const [pageSize, setPageSize] = useState(10)
  const [page, setPage] = useState(1)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingContact, setEditingContact] = useState<EmergencyContact | undefined>()

  const handleAddContact = (data: Omit<EmergencyContact, "id" | "status">) => {
    if (editingContact) {
      setContacts(contacts.map(contact => 
        contact.id === editingContact.id 
          ? { ...contact, ...data }
          : contact
      ))
      setEditingContact(undefined)
    } else {
      const newContact: EmergencyContact = {
        id: `EC${contacts.length + 1}`,
        ...data,
        status: true
      }
      setContacts([...contacts, newContact])
    }
  }

  const handleEdit = (contact: EmergencyContact) => {
    setEditingContact(contact)
    setDialogOpen(true)
  }

  const handleStatusChange = (id: string, status: boolean) => {
    setContacts(contacts.map(contact =>
      contact.id === id ? { ...contact, status } : contact
    ))
  }

  const totalPages = Math.ceil(contacts.length / pageSize)
  const paginatedContacts = contacts.slice(
    (page - 1) * pageSize,
    page * pageSize
  )

  return (
    <div className="space-y-4 p-4 shadow-md rounded-md">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Emergency Contacts</h2>
        <Button className="bg-supperagent hover:bg-supperagent/90 text-white" onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Contact
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">#ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Address</TableHead>
            <TableHead>Relationship</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedContacts.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center">
                No contacts found
              </TableCell>
            </TableRow>
          ) : (
            paginatedContacts.map((contact) => (
              <TableRow key={contact.id}>
                <TableCell>{contact.id}</TableCell>
                <TableCell>{contact.name}</TableCell>
                <TableCell>{contact.phone}</TableCell>
                <TableCell>{contact.email}</TableCell>
                <TableCell>{contact.address}</TableCell>
                <TableCell>{contact.relationship}</TableCell>
                <TableCell className="text-center">
                  <Switch
                    checked={contact.status}
                    onCheckedChange={(checked) => handleStatusChange(contact.id, checked)}
                  />
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(contact)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {contacts.length > 0 && (
        <DataTablePagination
          pageSize={pageSize}
          setPageSize={setPageSize}
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      )}

      <EmergencyContactDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) setEditingContact(undefined)
        }}
        onSubmit={handleAddContact}
        initialData={editingContact}
      />
    </div>
  )
}

