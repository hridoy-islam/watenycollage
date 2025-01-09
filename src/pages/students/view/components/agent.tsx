import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AgentDetails } from "./agent-details";
import { AgentDialog } from "./agent-dialog";
import { useState } from "react";

export function AgentPage({student}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [agent, setAgent] = useState(student.agent)



  const handleSubmit = ()=> {
    
  }

  const handleDelete = ()=> {

  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Assigned Agent</h2>
        {!agent && (
          <Button 
            onClick={() => setDialogOpen(true)}
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Agent
          </Button>
        )}
      </div>

      {agent ? (
        // <AgentDetails agent={agent} onDelete={handleDelete} />
        <h1>A</h1>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed">
          <p className="text-muted-foreground">No agent assigned</p>
        </div>
      )}

      {/* <AgentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
      /> */}
    </div>
  )
}

