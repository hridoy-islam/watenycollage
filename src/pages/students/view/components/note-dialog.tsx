import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import Select from 'react-select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import axiosInstance from '@/lib/axios';
const formSchema = z.object({
  course: z.string().min(1, 'Course is required'),
  notes: z.string().min(1, 'Note is required'),
  followUp: z.boolean().default(false),
  followUpBy: z.array(z.string()).optional()
});

export function AddNoteDialog({ open, onOpenChange, onSubmit, staffMembers }) {
  const [isFollowUp, setIsFollowUp] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [staffs, setStaffs] = useState<any>([]);
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      course: '',
      notes: '',
      followUp: false,
      followUpBy: [] //
    }
  });

  const handleSubmit = (values) => {
    const selectedStaffMembers = values.followUpBy
      ? values.followUpBy.map((id) =>
          staffMembers.find((staff) => staff.id === id)
        )
      : [];

    console.log(selectedStaffMembers);

    onSubmit({
      course: values.course,
      notes: values.notes,
      followUp: values.followUp,
      followUpBy: selectedStaffMembers
    });

    form.reset();
    setIsFollowUp(false);
  };

  const fetchData = async () => {
    try {
      if (initialLoading) setInitialLoading(true);
      const response = await axiosInstance.get(`/staffs?limit=all`);
      setStaffs(response.data.data.result);
    } catch (error) {
      console.error('Error fetching institutions:', error);
    } finally {
      setInitialLoading(false); // Disable initial loading after the first fetch
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Note</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Note</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter your note here"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="followUp"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Is Follow Up</FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={(checked) => {
                        field.onChange(checked);
                        setIsFollowUp(checked);
                      }}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            {isFollowUp && (
              <FormField
                control={form.control}
                name="followUpBy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Follow Up By</FormLabel>
                    <Select
                      isMulti
                      name="followUpBy"
                      options={staffs.map((staff) => ({
                        value: staff.id,
                        label: `${staff.firstName} ${staff.lastName}`
                      }))}
                      onChange={(selectedOptions) => {
                        // Update form value with selected staff IDs
                        const selectedIds = selectedOptions
                          ? selectedOptions.map((option) => option.value)
                          : [];
                        field.onChange(selectedIds);
                      }}
                      value={staffs
                        .filter((staff) => field.value?.includes(staff.id))
                        .map((staff) => ({
                          value: staff.id,
                          label: `${staff.firstName} ${staff.lastName}`
                        }))}
                      placeholder="Select staff members"
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-supperagent text-white hover:bg-supperagent"
              >
                Submit
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
