import { useState } from "react"
import { Plus } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { AgentDialog } from "./agent-dialog"
import { AgentDetails } from "./agent-details"

export function AgentPage() {
  const [agent, setAgent] = useState<any>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleSubmit = (data) => {
    const newAgent = {
      id: Math.random().toString(36).substr(2, 9),
      ...data,
      created_at: new Date(),
    }
    setAgent(newAgent)
    setDialogOpen(false)
  }

  const handleDelete = () => {
    setAgent(null)
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
        <AgentDetails agent={agent} onDelete={handleDelete} />
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed">
          <p className="text-muted-foreground">No agent assigned</p>
        </div>
      )}

      <AgentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
      />
    </div>
  )
}

