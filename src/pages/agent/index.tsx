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
import { AgentDialog } from "./components/agent-dialog"

// Example initial agent data
const initialAgents = [
  { id: 1, agentName: "Acme Agency", organization: "Acme Corp", contactPerson: "Alice Smith", phone: "123-456-7890", email: "alice@acme.com", addressLine1: "123 Acme St", addressLine2: "Suite 101", townCity: "London", state: "London", postCode: "EC1A 1BB", country: "UK", nominatedStaff: "John Doe", active: true },
  { id: 2, agentName: "Beta Solutions", organization: "Beta Ltd", contactPerson: "Bob Brown", phone: "234-567-8901", email: "bob@beta.com", addressLine1: "456 Beta Rd", addressLine2: "Building 2", townCity: "Manchester", state: "Greater Manchester", postCode: "M1 1AA", country: "UK", nominatedStaff: "Jane Smith", active: true },
]

const initialStaff = ["John Doe", "Jane Smith", "Sam Brown"]  // Example list of staff

export default function AgentsPage() {
  const [agents, setAgents] = useState(initialAgents)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingAgent, setEditingAgent] = useState(null)

  const handleSubmit = (data) => {
    if (editingAgent) {
      setAgents(agents.map(agent =>
        agent.id === editingAgent?.id
          ? { ...agent, ...data }
          : agent
      ))
      setEditingAgent(null)
    } else {
      const newId = Math.max(...agents.map(a => a.id)) + 1
      setAgents([...agents, { id: newId, ...data }])
    }
    setDialogOpen(false)  // Close the dialog after submission
  }

  const handleStatusChange = (id: number, active: boolean) => {
    setAgents(agents.map(agent =>
      agent.id === id ? { ...agent, active } : agent
    ))
  }

  const handleEdit = (agent) => {
    setEditingAgent(agent)
    setDialogOpen(true)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">All Agents</h1>
        <Button onClick={() => {
          setEditingAgent(null)  // Clear editing agent when creating a new agent
          setDialogOpen(true)
        }}>
          <Plus className="w-4 h-4 mr-2" />
          New Agent
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-20">#ID</TableHead>
            <TableHead>Agent Name</TableHead>
            <TableHead>Organization</TableHead>
            <TableHead>Contact Person</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Location</TableHead>
            <TableHead className="w-32 text-center">Status</TableHead>
            <TableHead className="w-32 text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {agents.map((agent) => (
            <TableRow key={agent.id}>
              <TableCell>{agent.id}</TableCell>
              <TableCell>{agent.agentName}</TableCell>
              <TableCell>{agent.organization}</TableCell>
              <TableCell>{agent.contactPerson}</TableCell>
              <TableCell>{agent.phone}</TableCell>
              <TableCell>{agent.email}</TableCell>
              <TableCell>{agent.addressLine1}, {agent.townCity}</TableCell>
              <TableCell className="text-center">
                <Switch
                  checked={agent.active}
                  onCheckedChange={(checked) => handleStatusChange(agent.id, checked)}
                  className="mx-auto"
                />
              </TableCell>
              <TableCell className="text-center">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEdit(agent)}
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <AgentDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) setEditingAgent(null)  // Reset editing agent when closing dialog
        }}
        onSubmit={handleSubmit}
        initialData={editingAgent}
        staffOptions={initialStaff}  // Corrected staff options
      />
    </div>
  )
}
