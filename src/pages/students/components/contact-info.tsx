import { useForm } from "react-hook-form";
import { StudentFormData } from "@/types/index";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface ContactInfoProps {
  defaultValues: StudentFormData;
  onSubmit: (data: StudentFormData) => void;
}

export function ContactInfo({ defaultValues, onSubmit }: ContactInfoProps) {
  const { register, handleSubmit } = useForm<StudentFormData>({
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
      <div className="grid grid-cols-4 gap-4">
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

      </div>
    </form>
  );
}
