import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Student } from "@/types/index"

interface PersonalDetailsFormProps {
  student: Student
  onSave: (data: Partial<Student>) => void
}

export function PersonalDetailsForm({ student, onSave }: PersonalDetailsFormProps) {
  return (
    <form className="space-y-6 p-6" onSubmit={(e) => e.preventDefault()}>
      <div className="grid grid-cols-3 gap-6">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Select defaultValue={student.title}>
            <SelectTrigger id="title">
              <SelectValue placeholder="Select title" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Mr">Mr</SelectItem>
              <SelectItem value="Mrs">Mrs</SelectItem>
              <SelectItem value="Ms">Ms</SelectItem>
              <SelectItem value="Dr">Dr</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input id="firstName" defaultValue={student.firstName} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input id="lastName" defaultValue={student.lastName} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" defaultValue={student.email} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" type="tel" defaultValue={student.phone} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dateOfBirth">Date of Birth</Label>
          <Input id="dateOfBirth" type="date" defaultValue={student.dateOfBirth} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="nationality">Nationality</Label>
          <Select defaultValue={student.nationality}>
            <SelectTrigger id="nationality">
              <SelectValue placeholder="Select nationality" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="United Kingdom">United Kingdom</SelectItem>
              <SelectItem value="United States">United States</SelectItem>
              {/* Add more countries */}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="countryOfBirth">Country of Birth</Label>
          <Select defaultValue={student.countryOfBirth}>
            <SelectTrigger id="countryOfBirth">
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="United Kingdom">United Kingdom</SelectItem>
              <SelectItem value="Hungary">Hungary</SelectItem>
              {/* Add more countries */}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="nativeLanguage">Native Language</Label>
          <Select defaultValue={student.nativeLanguage}>
            <SelectTrigger id="nativeLanguage">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="English">English</SelectItem>
              <SelectItem value="Hungarian">Hungarian</SelectItem>
              {/* Add more languages */}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex justify-end">
        <Button variant={'outline'} className="bg-supperagent text-white hover:bg-supperagent/90 border-none" onClick={() => onSave(student)}>Save Changes</Button>
      </div>
    </form>
  )
}

