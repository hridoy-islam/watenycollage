import { useForm, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { countries } from "@/types";
import ErrorMessage from "@/components/shared/error-message";
import { useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function AddressForm({ student, onSave }) {
  const { handleSubmit, register, control, reset, formState: { errors } } = useForm({
    defaultValues: {
      addressLine1: "",
      addressLine2: "",
      townCity: "",
      state: "",
      postCode: "",
      country: "",
    },
  });

  // Populate form fields when `student` data is available
  useEffect(() => {
    if (student) {
      reset({
        addressLine1: student.addressLine1 || "",
        addressLine2: student.addressLine2 || "",
        townCity: student.townCity || "",
        state: student.state || "",
        postCode: student.postCode || "",
        country: student.country || "",
      });
    }
  }, [student, reset]);

  const onSubmit = (data) => {
    
    onSave(data);
  };


  return (
    <div className="space-y-4 p-4 shadow-md rounded-md">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Address</h2>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
        <div className="grid grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="addressLine1">Address Line 1*</Label>
            <Input id="addressLine1" {...register("addressLine1", { required: "Address Line 1 is required" })}  />
            <ErrorMessage message={errors.addressLine1?.message?.toString()} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="addressLine2">Address Line 2*</Label>
            <Input id="addressLine2"
              
              {...register("addressLine2", { required: "Address Line 2 is required" })} />
            <ErrorMessage message={errors.addressLine2?.message?.toString()} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="townCity">Town / City</Label>
            <Input id="townCity"  {...register("townCity")} />

          </div>
          <div className="space-y-2">
            <Label htmlFor="state">State</Label>
            <Input id="state"  {...register("state")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="postCode">Post Code</Label>
            <Input id="postCode" {...register("postCode")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Input id="country" {...register("country")} />
            {/* <Controller
              name="country"
              control={control}
              render={({ field }) => (
                <Select {...field} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Please select" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((title, index) => (
                      <SelectItem key={index} value={title}>
                        {title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            /> */}
          </div>

        </div>
        <div className="flex justify-end">
          <Button type="submit" className="bg-supperagent hover:bg-supperagent/90 text-white">
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
