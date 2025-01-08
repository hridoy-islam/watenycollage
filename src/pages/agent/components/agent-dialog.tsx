import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import ErrorMessage from "@/components/shared/error-message";

export function AgentDialog({ open, onOpenChange, onSubmit, initialData, staffOptions }) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      agent_name: initialData?.agent_name ?? "",
      organization: initialData?.organization ?? "",
      contact_person: initialData?.contact_person ?? "",
      phone: initialData?.phone ?? "",
      email: initialData?.email ?? "",
      location: initialData?.location ?? "",
      nominatedStaff: initialData?.nominatedStaff ?? "",
    },
  });

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

        <form onSubmit={handleSubmit(onSubmitForm)}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Agent Name *</label>
              <Input
                {...register("agent_name", { required: "Agent Name is required" })}
                placeholder="Agent Name"
              />
              <ErrorMessage message={errors.agent_name?.message?.toString()} />
            </div>

            <div>
              <label className="block text-sm font-medium">Organization</label>
              <Input {...register("organization")} placeholder="Organization" />
              <ErrorMessage message={errors.organization?.message?.toString()} />
            </div>

            <div>
              <label className="block text-sm font-medium">Contact Person *</label>
              <Input
                {...register("contact_person", { required: "Contact Person is required" })}
                placeholder="Contact Person"
              />
              <ErrorMessage message={errors.contact_person?.message?.toString()} />
            </div>

            <div>
              <label className="block text-sm font-medium">Phone</label>
              <Input {...register("phone")} placeholder="Phone" />
              <ErrorMessage message={errors.phone?.message?.toString()} />
            </div>

            <div>
              <label className="block text-sm font-medium">Email</label>
              <Input {...register("email", { pattern: { value: /^\S+@\S+$/i, message: "Invalid email format" } })} placeholder="Email" />
              <ErrorMessage message={errors.email?.message?.toString()} />
            </div>

            <div>
              <label className="block text-sm font-medium">Location *</label>
              <Input
                {...register("location", { required: "location is required" })}
                placeholder="Location"
              />
              <ErrorMessage message={errors.location?.message?.toString()} />
            </div>

            <div>
              <label className="block text-sm font-medium">Nominated Staff</label>
              <Select
                value={initialData?.nominatedStaff ?? ""}
                onValueChange={(value) => setValue("nominatedStaff", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Staff" />
                </SelectTrigger>
                <SelectContent>
                  {staffOptions?.map((staff) => (
                    <SelectItem key={staff} value={staff}>
                      {staff}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium">Password</label>
              <Input type="password" />
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
