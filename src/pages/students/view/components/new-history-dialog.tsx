import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import moment from "moment";

// Schema for form validation
const formSchema = z.object({
  purpose: z.string().min(1, "Purpose is required"),
  arrival: z.string().min(1, "Arrival Date is required"),
  departure: z.string().min(1, "Departure Date is required"),
  visaStart: z.string().min(1, "Visa Start Date is required"),
  visaExpiry: z.string().min(1, "Visa Expiry Date is required"),
  visaType: z.string().min(1, "Visa Type is required"),
});

export function NewHistoryDialog({ open, onOpenChange, onSubmit, initialData }) {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      purpose: initialData?.purpose || "",
      arrival: initialData?.arrival ? moment(initialData.arrival, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD') : "",
      departure: initialData?.departure ? moment(initialData.departure, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD') : "",
      visaStart: initialData?.visaStart ? moment(initialData.visaStart, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD') : "",
      visaExpiry: initialData?.visaExpiry ? moment(initialData.visaExpiry, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD') : "",
      visaType: initialData?.visaType || "",
    },
  });

  // Reset form when initialData changes (for editing existing data)
  useEffect(() => {
    if (initialData) {
      form.reset({
        purpose: initialData.purpose || "",
        arrival: initialData.arrival ? moment(initialData.arrival, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD') : "",
        departure: initialData.departure ? moment(initialData.departure, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD') : "",
        visaStart: initialData.visaStart ? moment(initialData.visaStart, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD') : "",
        visaExpiry: initialData.visaExpiry ? moment(initialData.visaExpiry, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD') : "",
        visaType: initialData.visaType || "",
      });
    } else {
      form.reset(); // Reset for new entry
    }
  }, [initialData, form]);

  const handleSubmit = (values) => {
    onSubmit(values);  // Send the values back to the parent
    form.reset();  // Reset the form after submission
    onOpenChange(false);  // Close the dialog
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Visa History" : "Add New Visa History"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Purpose Field */}
            <FormField
              control={form.control}
              name="purpose"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Purpose</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Arrival Date Field */}
            <FormField
              control={form.control}
              name="arrival"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Arrival Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Departure Date Field */}
            <FormField
              control={form.control}
              name="departure"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Departure Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Visa Start Date Field */}
            <FormField
              control={form.control}
              name="visaStart"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Visa Start Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Visa Expiry Date Field */}
            <FormField
              control={form.control}
              name="visaExpiry"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Visa Expiry Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Visa Type Field */}
            <FormField
              control={form.control}
              name="visaType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Visa Type</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Action Buttons */}
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-supperagent text-white hover:bg-supperagent/90">
                {initialData ? "Update History" : "Add History"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
