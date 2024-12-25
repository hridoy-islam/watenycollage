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

interface AddressInfoProps {
  defaultValues: StudentFormData;
  onSubmit: (data: StudentFormData) => void;
}

export function AddressInfo({ defaultValues, onSubmit }: AddressInfoProps) {
  const { control, handleSubmit, register } = useForm<StudentFormData>({
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
       <div className="grid grid-cols-4 gap-4">
      {/* Address Line 1 */}
      <div>
        <Label htmlFor="addressLine1">Address Line 1 *</Label>
        <Input id="addressLine1" {...register("addressLine1")} />
      </div>

      {/* Address Line 2 */}
      <div>
        <Label htmlFor="addressLine2">Address Line 2</Label>
        <Input id="addressLine2" {...register("addressLine2")} />
      </div>

      {/* Town/City */}
      <div>
        <Label htmlFor="city">Town/City *</Label>
        <Input id="city" {...register("townCity")} />
      </div>

      {/* State */}
      <div>
        <Label htmlFor="state">State</Label>
        <Input id="state" {...register("state")} />
      </div>

      {/* Post Code */}
      <div>
        <Label htmlFor="postCode">Post Code *</Label>
        <Input id="postCode" {...register("postCode")} />
      </div>

      {/* Country */}
      <div>
        <Label htmlFor="country">Country *</Label>
        <Input id="country" {...register("country")} />
      </div>
      
      </div>
    </form>
  );
}
