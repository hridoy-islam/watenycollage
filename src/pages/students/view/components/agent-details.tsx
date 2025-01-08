import { Trash2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function AgentDetails({ agent, onDelete }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Agent Details</CardTitle>
        <Button
          variant="destructive"
          size="icon"
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Agent Name</p>
            <p className="text-sm">{agent.agent_name}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Contact Person</p>
            <p className="text-sm">{agent.contact_person}</p>
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
            <p className="text-sm">{agent.nominated_staff}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Added On</p>
            <p className="text-sm">{agent.created_at.toLocaleDateString()}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

