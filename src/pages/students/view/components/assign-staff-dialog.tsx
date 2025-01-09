import { useEffect, useState } from "react";
import * as z from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Select from "react-select";
import axiosInstance from "@/lib/axios"; // Adjust the path as needed

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const schema = z.object({
  followUpBy: z.string().nonempty("Please select a staff member"),
});

export function StaffDialog({ open, onOpenChange, onSubmit }) {
  const [staffOptions, setStaffOptions] = useState<any>([]);

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      assignStaff: "",
    },
  });

  useEffect(() => {
    const fetchStaffMembers = async () => {
      try {
        const response = await axiosInstance.get('/staffs?limit=all');
        const options = response.data.data.result.map((staff) => ({
          value: staff.id,
          label: `${staff.firstName} ${staff.lastName}`,
        }));

        setStaffOptions(options);
      } catch (error) {
        console.error("Error fetching staff members:", error);
      }
    };

    if (open) {
      fetchStaffMembers();
    }
  }, [open]);

  const handleSubmit = (data) => {
    onSubmit(data); // 'data' will contain { followUpBy: selectedStaffId }
    onOpenChange(false);
  };

  

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Staff</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <Controller
              name="assignStaff"
              control={form.control}
              render={({ field }) => {
                return (
                  <Select
                    options={staffOptions}
                    onChange={(selectedOption) => field.onChange(selectedOption?.value)}
                    value={staffOptions.find(option => option.value === field.value)}
                    placeholder="Select staff member"
                  />
                );
              }}
            />
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-supperagent text-white hover:bg-supperagent">
                Submit
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
