import { useForm, FormProvider, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import Select from 'react-select';
import { countries } from "@/types";
import axiosInstance from '../../../../lib/axios'
import { useToast } from "@/components/ui/use-toast";

export function AddressForm({ student }) {
  const { control, handleSubmit, register } = useForm();
  const { toast } = useToast();
  const onSubmit = async (data) => {
    try {
      const countryValue = data.country ? data.country.value : "";
      const formData = {
        ...data,
        country: countryValue,  // Update country field to only contain the value
      };
      await axiosInstance.patch(`/students/${student.id}`, formData);
      toast({ title: "Student Updated successfully", className: "bg-supperagent border-none text-white", });
      
    } catch (error) {
      console.error("Error fetching institutions:", error);
    }

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
            <Input id="addressLine1"
              defaultValue={student.addressLine1}
              {...register("addressLine1")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="addressLine2">Address Line 2*</Label>
            <Input id="addressLine2"
              defaultValue={student.addressLine2}
              {...register("addressLine2")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="townCity">Town / City</Label>
            <Input id="townCity" defaultValue={student.townCity} {...register("townCity")} />

          </div>
          <div className="space-y-2">
            <Label htmlFor="state">State</Label>
            <Input id="state" defaultValue={student.state} {...register("state")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="postCode">Post Code</Label>
            <Input id="postCode" defaultValue={student.postCode} {...register("postCode")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Controller
              name="country"
              control={control}
              defaultValue={student.country || ""}
              render={({ field }) => (
                <Select
                  {...field}
                  classNamePrefix="select"
                  options={countries}
                />
              )}
            />
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
