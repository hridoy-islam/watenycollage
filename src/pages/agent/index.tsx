import { useEffect, useState } from "react"
import { Pen, Plus, } from 'lucide-react'
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
import axiosInstance from '../../lib/axios';
import { BlinkingDots } from "@/components/shared/blinking-dots"
import { toast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"

const initialStaff = ["John Doe", "Jane Smith", "Sam Brown"]  // Example list of staff

export default function AgentsPage() {
  const [agents, setAgents] = useState<any>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingAgent, setEditingAgent] = useState<any>(null)
  const [initialLoading, setInitialLoading] = useState(true);


  const fetchData = async () => {
      try {
        if (initialLoading) setInitialLoading(true);
        const response = await axiosInstance.get(`/agents`);
        setAgents(response.data.data.result);
      } catch (error) {
        console.error("Error fetching institutions:", error);
      } finally {
        setInitialLoading(false); // Disable initial loading after the first fetch
      }
    };

  const handleSubmit = async (data) => {
      try {
        if (editingAgent) {
          // Update institution
          await axiosInstance.patch(`/agents/${editingAgent?.id}`, data);
          toast({ title: "Record Updated successfully", className: "bg-supperagent border-none text-white", });
          fetchData();
          setEditingAgent(null);
        } else {
          await axiosInstance.post(`/agents`, data);
          toast({ title: "Record Created successfully", className: "bg-supperagent border-none text-white", });
          fetchData()
        }
      } catch (error) {
        console.error("Error saving institution:", error);
      }
    };


  const handleStatusChange = async (id, status) => {
      try {
        const updatedStatus = status ? "1" : "0";
        await axiosInstance.patch(`/agents/${id}`, { status: updatedStatus });
        toast({ title: "Record updated successfully", className: "bg-supperagent border-none text-white", });
        fetchData(); // Refresh data
      } catch (error) {
        console.error("Error updating status:", error);
      }
    };

  const handleEdit = (agent) => {
    setEditingAgent(agent)
    setDialogOpen(true)
  }

  useEffect(() => {
      fetchData();
    }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">All Agents</h1>
        <Button className="bg-supperagent text-white hover:bg-supperagent/90" size={'sm'} onClick={() => {
          setEditingAgent(null)  // Clear editing agent when creating a new agent
          setDialogOpen(true)
        }}>
          <Plus className="w-4 h-4 mr-2" />
          New Agent
        </Button>
      </div>
      <div className="rounded-md bg-white shadow-2xl p-4">
        {initialLoading ? (
                  <div className="flex justify-center py-6">
                    <BlinkingDots size="large" color="bg-supperagent" />
                  </div>
                ) : agents.length === 0 ? (
                  <div className="flex justify-center py-6 text-gray-500">
                    No records found.
                  </div>
                ) : (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Agent Name</TableHead>
            <TableHead>Organization</TableHead>
            <TableHead>Contact Person</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Nominated Staff</TableHead>
            <TableHead className="w-32 text-center">Status</TableHead>
            <TableHead className="w-32 text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {agents.map((agent) => (
            <TableRow key={agent.id}>
              <TableCell>{agent.agentName}</TableCell>
              <TableCell>{agent.organization}</TableCell>
              <TableCell>{agent.contactPerson}</TableCell>
              <TableCell>{agent.phone}</TableCell>
              <TableCell>{agent.email}</TableCell>
              <TableCell>{agent.location}</TableCell>
              <TableCell><Badge className="bg-supperagent text-white hover:bg-supperagent">{agent.nominatedStaff.firstName} {agent.nominatedStaff.lastName}</Badge></TableCell>
              <TableCell className="text-center">
              <Switch
                    checked={agent.status == 1}
                    onCheckedChange={(checked) => handleStatusChange(agent.id, checked)}
                    className="mx-auto"
                  />
              </TableCell>
              <TableCell className="text-center">
                <Button
                  variant="outline"
                  className="bg-supperagent text-white hover:bg-supperagent/90 border-none"
                  size="icon"
                  onClick={() => handleEdit(agent)}
                >
                  <Pen className="w-4 h-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      )}
      </div>
      <AgentDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) setEditingAgent(null)  // Reset editing agent when closing dialog
        }}
        onSubmit={handleSubmit}
        initialData={editingAgent}
      />
    </div>
  )
}
