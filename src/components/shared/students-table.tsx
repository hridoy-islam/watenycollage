import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Eye, Trash2Icon } from 'lucide-react'

interface Student {
  id: number
  reference: string
  name: string
  email: string
  phone: string
  agent: string
  type: string
  status: string
}

const students: Student[] = [
  {
    id: 1,
    reference: "STD000001",
    name: "Mr. Mark Nemes",
    email: "nemes.mark@yahoo.com",
    phone: "07706457032",
    agent: "Omniscient",
    type: "Local",
    status: "Active"
  },
  {
    id: 1,
    reference: "STD000001",
    name: "Mr. Mark Nemes",
    email: "nemes.mark@yahoo.com",
    phone: "07706457032",
    agent: "Omniscient",
    type: "Local",
    status: "Active"
  },
  {
    id: 1,
    reference: "STD000001",
    name: "Mr. Mark Nemes",
    email: "nemes.mark@yahoo.com",
    phone: "07706457032",
    agent: "Omniscient",
    type: "Local",
    status: "Active"
  },
  {
    id: 1,
    reference: "STD000001",
    name: "Mr. Mark Nemes",
    email: "nemes.mark@yahoo.com",
    phone: "07706457032",
    agent: "Omniscient",
    type: "Local",
    status: "Active"
  },
  {
    id: 1,
    reference: "STD000001",
    name: "Mr. Mark Nemes",
    email: "nemes.mark@yahoo.com",
    phone: "07706457032",
    agent: "Omniscient",
    type: "Local",
    status: "Active"
  },
  {
    id: 1,
    reference: "STD000001",
    name: "Mr. Mark Nemes",
    email: "nemes.mark@yahoo.com",
    phone: "07706457032",
    agent: "Omniscient",
    type: "Local",
    status: "Active"
  },
  {
    id: 1,
    reference: "STD000001",
    name: "Mr. Mark Nemes",
    email: "nemes.mark@yahoo.com",
    phone: "07706457032",
    agent: "Omniscient",
    type: "Local",
    status: "Active"
  },
  {
    id: 1,
    reference: "STD000001",
    name: "Mr. Mark Nemes",
    email: "nemes.mark@yahoo.com",
    phone: "07706457032",
    agent: "Omniscient",
    type: "Local",
    status: "Active"
  },
  {
    id: 1,
    reference: "STD000001",
    name: "Mr. Mark Nemes",
    email: "nemes.mark@yahoo.com",
    phone: "07706457032",
    agent: "Omniscient",
    type: "Local",
    status: "Active"
  },
  {
    id: 1,
    reference: "STD000001",
    name: "Mr. Mark Nemes",
    email: "nemes.mark@yahoo.com",
    phone: "07706457032",
    agent: "Omniscient",
    type: "Local",
    status: "Active"
  },
  {
    id: 1,
    reference: "STD000001",
    name: "Mr. Mark Nemes",
    email: "nemes.mark@yahoo.com",
    phone: "07706457032",
    agent: "Omniscient",
    type: "Local",
    status: "Active"
  },
  {
    id: 1,
    reference: "STD000001",
    name: "Mr. Mark Nemes",
    email: "nemes.mark@yahoo.com",
    phone: "07706457032",
    agent: "Omniscient",
    type: "Local",
    status: "Active"
  },
  {
    id: 1,
    reference: "STD000001",
    name: "Mr. Mark Nemes",
    email: "nemes.mark@yahoo.com",
    phone: "07706457032",
    agent: "Omniscient",
    type: "Local",
    status: "Active"
  },
  {
    id: 1,
    reference: "STD000001",
    name: "Mr. Mark Nemes",
    email: "nemes.mark@yahoo.com",
    phone: "07706457032",
    agent: "Omniscient",
    type: "Local",
    status: "Active"
  },
  {
    id: 1,
    reference: "STD000001",
    name: "Mr. Mark Nemes",
    email: "nemes.mark@yahoo.com",
    phone: "07706457032",
    agent: "Omniscient",
    type: "Local",
    status: "Active"
  },
  {
    id: 1,
    reference: "STD000001",
    name: "Mr. Mark Nemes",
    email: "nemes.mark@yahoo.com",
    phone: "07706457032",
    agent: "Omniscient",
    type: "Local",
    status: "Active"
  },
  {
    id: 1,
    reference: "STD000001",
    name: "Mr. Mark Nemes",
    email: "nemes.mark@yahoo.com",
    phone: "07706457032",
    agent: "Omniscient",
    type: "Local",
    status: "Active"
  },
  {
    id: 1,
    reference: "STD000001",
    name: "Mr. Mark Nemes",
    email: "nemes.mark@yahoo.com",
    phone: "07706457032",
    agent: "Omniscient",
    type: "Local",
    status: "Active"
  },
  {
    id: 1,
    reference: "STD000001",
    name: "Mr. Mark Nemes",
    email: "nemes.mark@yahoo.com",
    phone: "07706457032",
    agent: "Omniscient",
    type: "Local",
    status: "Active"
  },
  {
    id: 1,
    reference: "STD000001",
    name: "Mr. Mark Nemes",
    email: "nemes.mark@yahoo.com",
    phone: "07706457032",
    agent: "Omniscient",
    type: "Local",
    status: "Active"
  },
  {
    id: 1,
    reference: "STD000001",
    name: "Mr. Mark Nemes",
    email: "nemes.mark@yahoo.com",
    phone: "07706457032",
    agent: "Omniscient",
    type: "Local",
    status: "Active"
  },
  {
    id: 1,
    reference: "STD000001",
    name: "Mr. Mark Nemes",
    email: "nemes.mark@yahoo.com",
    phone: "07706457032",
    agent: "Omniscient",
    type: "Local",
    status: "Active"
  },
  // Add more student data as needed
]

export function StudentsTable() {
  return (
    <div className="rounded-md bg-white shadow-2xl p-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">#ID</TableHead>
            <TableHead>Reference No</TableHead>
            <TableHead>Student Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Agent</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.map((student) => (
            <TableRow key={student.id}>
              <TableCell>{student.id}</TableCell>
              <TableCell>{student.reference}</TableCell>
              <TableCell>{student.name}</TableCell>
              <TableCell>{student.email}</TableCell>
              <TableCell>{student.phone}</TableCell>
              <TableCell>{student.agent}</TableCell>
              <TableCell>
                <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                  {student.type}
                </span>
              </TableCell>
              <TableCell>
                <Switch defaultChecked />
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" size="icon">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="destructive" size="icon">
                    <Trash2Icon className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

