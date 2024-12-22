import { StudentFormData } from "@/types/index"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

interface ContactInfoProps {
  data: StudentFormData
  updateFields: (fields: Partial<StudentFormData>) => void
}

export function ContactInfo({ data, updateFields }: ContactInfoProps) {
  return (
    <div className="grid gap-4 py-4">
      <div>
        <Label htmlFor="email">Email *</Label>
        <Input
          id="email"
          type="email"
          value={data.email}
          onChange={(e) => updateFields({ email: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="phone">Phone *</Label>
        <Input
          id="phone"
          type="tel"
          value={data.phone}
          onChange={(e) => updateFields({ phone: e.target.value })}
        />
      </div>
    </div>
  )
}

