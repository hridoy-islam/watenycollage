import { Controller, useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import ErrorMessage from "@/components/shared/error-message";
import { useEffect, useState } from "react";
import axiosInstance from "../../../lib/axios";

export function AgentDialog({ open, onOpenChange, onSubmit, initialData }) {
  const [staffOptions, setStaffOptions] = useState<any>([]);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      agentName: "",
      organization: "",
      contactPerson: "",
      phone: "",
      email: "",
      location: "",
      nominatedStaff: "",
      password: "",
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get(`/staffs?limit=all`);
        setStaffOptions(response.data.data.result);
      } catch (error) {
        console.error("Error fetching staff options:", error);
      }
    };

    if (open) {
      fetchData();
    }

    return () => {
      if (!open) {
        reset();
      }
    };
  }, [open, reset]);

  useEffect(() => {
    if (initialData) {
      reset({
        agentName: initialData.agentName ?? "",
        organization: initialData.organization ?? "",
        contactPerson: initialData.contactPerson ?? "",
        phone: initialData.phone ?? "",
        email: initialData.email ?? "",
        location: initialData.location ?? "",
        nominatedStaff: initialData.nominatedStaff ?? "",
        password: initialData.password ?? "",
      });
    }
  }, [initialData, reset]);

  const onSubmitForm = (data) => {
    onSubmit(data);
    onOpenChange(false);
  };



  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Agent" : "Add New Agent"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Agent Name *</label>
              <Input
                {...register("agentName", { required: "Agent Name is required" })}
                placeholder="Agent Name"
              />
              <ErrorMessage message={errors.agentName?.message?.toString()} />
            </div>

            <div>
              <label className="block text-sm font-medium">Organization</label>
              <Input {...register("organization")} placeholder="Organization" />
              <ErrorMessage message={errors.organization?.message?.toString()} />
            </div>

            <div>
              <label className="block text-sm font-medium">Contact Person *</label>
              <Input
                {...register("contactPerson", { required: "Contact Person is required" })}
                placeholder="Contact Person"
              />
              <ErrorMessage message={errors.contactPerson?.message?.toString()} />
            </div>

            <div>
              <label className="block text-sm font-medium">Phone</label>
              <Input {...register("phone")} placeholder="Phone" />
              <ErrorMessage message={errors.phone?.message?.toString()} />
            </div>

            <div>
              <label className="block text-sm font-medium">Email</label>
              <Input
                {...register("email", {
                  pattern: { value: /^\S+@\S+$/i, message: "Invalid email format" },
                })}
                placeholder="Email"
              />
              <ErrorMessage message={errors.email?.message?.toString()} />
            </div>

            <div>
              <label className="block text-sm font-medium">Location *</label>
              <Input
                {...register("location", { required: "Location is required" })}
                placeholder="Location"
              />
              <ErrorMessage message={errors.location?.message?.toString()} />
            </div>

            <div>
              <label className="block text-sm font-medium">Nominated Staff</label>
              <Controller
                name="nominatedStaff"
                control={control}
                rules={{ required: "Please select a staff member" }}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(value) => field.onChange(value)}
                  >
                    <SelectTrigger>
                      <SelectValue>
                        {field.value
                          ? staffOptions.find((staff) => staff.id === field.value)?.firstName +
                          ' ' +
                          staffOptions.find((staff) => staff.id === field.value)?.lastName
                          : "Please select"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {staffOptions.map((staff) => (
                        <SelectItem key={staff.id} value={staff.id}>
                          {staff.firstName} {staff.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <ErrorMessage message={errors.nominatedStaff?.message?.toString()} />

            </div>

            <div>
              <label className="block text-sm font-medium">Password</label>
              <Input type="password" {...register("password")} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-supperagent text-white hover:bg-supperagent/90">
              {initialData ? "Save Changes" : "Add Agent"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
