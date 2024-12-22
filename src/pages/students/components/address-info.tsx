import { StudentFormData, mockData } from "@/types/index"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface AddressInfoProps {
  data: StudentFormData
  updateFields: (fields: Partial<StudentFormData>) => void
}

export function AddressInfo({ data, updateFields }: AddressInfoProps) {
  return (
    <div className="grid gap-4 py-4">
      <div>
        <Label htmlFor="addressLine1">Address Line 1 *</Label>
        <Input
          id="addressLine1"
          value={data.addressLine1}
          onChange={(e) => updateFields({ addressLine1: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="addressLine2">Address Line 2</Label>
        <Input
          id="addressLine2"
          value={data.addressLine2}
          onChange={(e) => updateFields({ addressLine2: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="townCity">Town/City *</Label>
          <Input
            id="townCity"
            value={data.townCity}
            onChange={(e) => updateFields({ townCity: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="state">State</Label>
          <Input
            id="state"
            value={data.state}
            onChange={(e) => updateFields({ state: e.target.value })}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="postCode">Post Code *</Label>
          <Input
            id="postCode"
            value={data.postCode}
            onChange={(e) => updateFields({ postCode: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="country">Country *</Label>
          <Select value={data.country} onValueChange={(value) => updateFields({ country: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent>
              {mockData.countries.map((country) => (
                <SelectItem key={country} value={country}>
                  {country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}

