import { useForm, Controller } from "react-hook-form";
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
  defaultValues: StudentFormData;
  onSubmit: (data: StudentFormData) => void;
}

export function PersonalInfo({ defaultValues, onSubmit }: PersonalInfoProps) {
  const { control, handleSubmit, register } = useForm<StudentFormData>({
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
      <div className="grid grid-cols-4 gap-4">
        {/* Title */}
        <div>
          <Label htmlFor="title">Title *</Label>
          <Controller
            name="title"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
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
            )}
          />
        </div>

        {/* First Name */}
        <div>
          <Label htmlFor="firstName">First Name *</Label>
          <Input id="firstName" {...register("firstName")} />
        </div>

        {/* Last Name */}
        <div>
          <Label htmlFor="lastName">Last Name *</Label>
          <Input id="lastName" {...register("lastName")} />
        </div>

        {/* Email */}
        <div>
          <Label htmlFor="email">Email *</Label>
          <Input id="email" type="email" {...register("email")} />
        </div>

        {/* Phone */}
        <div>
          <Label htmlFor="phone">Phone *</Label>
          <Input id="phone" type="tel" {...register("phone")} />
        </div>

        {/* Nationality */}
        <div>
          <Label htmlFor="nationality">Nationality</Label>
          <Input id="nationality" {...register("nationality")} />
        </div>

        {/* passportnumber */}
        <div>
          <Label htmlFor="passportnumber">Passport Number (if applicable):
          </Label>
          <Input id="passportnumber" {...register("passportnumber")} />
        </div>

        {/* countryofbirth */}
        <div>
          <Label htmlFor="countryofbirth">Country Of Birth
          </Label>
          <Input id="countryofbirth" {...register("countryofbirth")} />
        </div>

        {/* Date of Birth */}
        <div>
          <Label htmlFor="dateOfBirth">Date of Birth *</Label>
          <Input id="dateOfBirth" type="date" {...register("dateOfBirth")} />
        </div>

        {/* Marital Status */}
        <div>
          <Label htmlFor="gender">Gender *</Label>
          <Controller
            name="gender"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Gender" />
                </SelectTrigger>
                <SelectContent>
                  {mockData.gender.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        {/* Marital Status */}
        <div>
          <Label htmlFor="maritalStatus">Marital Status *</Label>
          <Controller
            name="maritalStatus"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
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
            )}
          />
        </div>
        
      </div>
    </form>
  );
}
