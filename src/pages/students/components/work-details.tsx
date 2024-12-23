import { StudentFormData, mockData } from "@/types/index";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PersonalInfoProps {
  data: StudentFormData;
  updateFields: (fields: Partial<StudentFormData>) => void;
}

export function WorkDetails({ data, updateFields }: PersonalInfoProps) {
  return (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-4 gap-4">
        <div>
          <Label htmlFor="title">Title *</Label>
          <Select
            value={data.title}
            onValueChange={(value) => updateFields({ title: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select title" />
            </SelectTrigger>
            <SelectContent>
              {mockData.titles.map((title) => (
                <SelectItem key={title} value={title}>
                  {title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="">
          <Label htmlFor="firstName">First Name *</Label>
          <Input
            id="firstName"
            value={data.firstName}
            onChange={(e) => updateFields({ firstName: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="lastName">Last Name *</Label>
          <Input
            id="lastName"
            value={data.lastName}
            onChange={(e) => updateFields({ lastName: e.target.value })}
          />
        </div>
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
        <div>
          <Label htmlFor="dateOfBirth">Date of Birth *</Label>
          <Input
            id="dateOfBirth"
            type="date"
            value={data.dateOfBirth}
            onChange={(e) => updateFields({ dateOfBirth: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="maritalStatus">Marital Status *</Label>
          <Select
            value={data.maritalStatus}
            onValueChange={(value) => updateFields({ maritalStatus: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select marital status" />
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
        <div>
          <Label htmlFor="city">Town/City *</Label>
          <Input
            id="city"
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
          <Input
            id="country"
            value={data.country}
            onChange={(e) => updateFields({ country: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="agent">Agent *</Label>
          <Select
            value={data.agent}
            onValueChange={(value) => updateFields({ agent: value })}
          >
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
    </div>
  );
}
