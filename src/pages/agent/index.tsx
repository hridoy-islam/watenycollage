import { useEffect, useState } from "react"
import { Link, Pen, Plus, } from 'lucide-react'
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
import { DataTablePagination } from "../students/view/components/data-table-pagination"



export default function AgentsPage() {
  const [agents, setAgents] = useState<any>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingAgent, setEditingAgent] = useState<any>(null)
  const [initialLoading, setInitialLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  const fetchData = async (page, entriesPerPage) => {
    try {
      if (initialLoading) setInitialLoading(true);
      const response = await axiosInstance.get(`/agents`, {
        params: {
          page,
          limit: entriesPerPage,
        },
      });
      setAgents(response.data.data.result);
      setTotalPages(response.data.data.meta.totalPage);
    } catch (error) {
      console.error("Error fetching institutions:", error);
    } finally {
      setInitialLoading(false); // Disable initial loading after the first fetch
    }
  };

  const handleSubmit = async (data) => {
    try {
      let response;
      if (editingAgent) {
        // Update agent
        response = await axiosInstance.patch(`/agents/${editingAgent?.id}`, data);
      } else {
        // Create new agent
        response = await axiosInstance.post(`/agents`, data);
      }
  
      // Check if the API response indicates success
      if (response.data && response.data.success === true) {
        toast({
          title: response.data.message || "Operation completed successfully",
          className: "bg-supperagent border-none text-white",
        });
      } else if (response.data && response.data.success === false) {
        toast({
          title: response.data.message || "Operation failed",
          className: "bg-red-500 border-none text-white",
        });
      } else {
        toast({
          title: "Unexpected response. Please try again.",
          className: "bg-red-500 border-none text-white",
        });
      }
  
      // Refresh data
      fetchData(currentPage, entriesPerPage);
      setEditingAgent(null); // Reset editing state
  
    } catch (error) {

      // Display an error toast if the request fails
      toast({
        title: "An error occurred. Please try again.",
        className: "bg-red-500 border-none text-white",
      });
    }
  };


  const handleStatusChange = async (id, status) => {
    try {
      const updatedStatus = status ? "1" : "0";
      await axiosInstance.patch(`/agents/${id}`, { status: updatedStatus });
      toast({ title: "Record updated successfully", className: "bg-supperagent border-none text-white", });
      fetchData(currentPage, entriesPerPage); // Refresh data
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleEdit = (agent) => {
    setEditingAgent(agent)
    setDialogOpen(true)
  }



  useEffect(() => {
    fetchData(currentPage, entriesPerPage); // Refresh data

  }, [currentPage, entriesPerPage]);

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
                  <TableCell>
                    {agent.nominatedStaffs.map((item, index)=> 
                    <Badge key={index} className="bg-supperagent text-white hover:bg-supperagent m-1">{item.firstName} {item.lastName}</Badge>)}</TableCell> 
                  <TableCell className="text-center">
                    <Switch
                      checked={agent.status == 1}
                      onCheckedChange={(checked) => handleStatusChange(agent.id, checked)}
                      className="mx-auto"
                    />
                  </TableCell>
                  <TableCell className="text-center space-x-1">
                  <Button
                      variant="outline"
                      className="bg-blue-500 text-white hover:bg-blue-500/90 border-none"
                      size="icon"
                      
                    >
                      <Link className="w-4 h-4" />
                    </Button>
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

        <DataTablePagination
          pageSize={entriesPerPage}
          setPageSize={setEntriesPerPage}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
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
