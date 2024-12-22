import { StudentFormData, mockData } from "@/types/index"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface AdditionalInfoProps {
  data: StudentFormData
  updateFields: (fields: Partial<StudentFormData>) => void
}

export function AdditionalInfo({ data, updateFields }: AdditionalInfoProps) {
  return (
    <div className="grid gap-4 py-4">
      <div>
        <Label htmlFor="maritalStatus">Marital Status</Label>
        <Select
          value={data.maritalStatus}
          onValueChange={(value) => updateFields({ maritalStatus: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            {mockData.maritalStatuses.map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="agent">Agent *</Label>
        <Select value={data.agent} onValueChange={(value) => updateFields({ agent: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select agent" />
          </SelectTrigger>
          <SelectContent>
            {mockData.agents.map((agent) => (
              <SelectItem key={agent} value={agent}>
                {agent}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

