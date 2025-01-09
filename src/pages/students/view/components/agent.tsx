import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Pen } from 'lucide-react'
import {
  CardTitle,
} from "@/components/ui/card"
import { AgentDialog } from "./agent-dialog";

export function AgentPage({ student, onSave }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [agent, setAgent] = useState(student.agent);

  const handleSubmit = (data) => {
    onSave(data);
    setDialogOpen(false);
  };

  const handleEdit = () => {
    setDialogOpen(true);
  };

  const hasAgent = agent && Object.keys(agent).length > 0;

  return (
    <div className="space-y-4 rounded-md shadow-md p-4">
      <div className="flex justify-between items-center">
        
        {!hasAgent && (
          <Button
            onClick={() => setDialogOpen(true)}
            className="bg-supperagent text-white hover:bg-supperagent"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Agent
          </Button>
        )}
      </div>

      {hasAgent ? (
        <div>
        <div className="flex flex-row items-center justify-between">
          <h2 className="font-semibold">Agent Details</h2>
          <Button
            variant="outline"
            size="icon"
            onClick={handleEdit}
          >
            <Pen className="h-4 w-4" />
          </Button>
        </div>
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Agent Name</p>
              <p className="text-sm">{agent.agentName}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Contact Person</p>
              <p className="text-sm">{agent.contactPerson}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p className="text-sm">{agent.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Phone</p>
              <p className="text-sm">{agent.phone}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Location</p>
              <p className="text-sm">{agent.location}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Organization</p>
              <p className="text-sm">{agent.organization}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Nominated Staff</p>
              <p className="text-sm">{agent.nominatedStaff.firstName} {agent.nominatedStaff.lastName}</p>
            </div>
            
          </div>
        </div>
      </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed">
          <p className="text-muted-foreground">No agent assigned</p>
        </div>
      )}

      <AgentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        initialData={agent}
      />
    </div>
  );
}
