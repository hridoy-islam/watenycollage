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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import moment from "moment";


const formSchema = z.object({
  institution: z.string().min(1, "Institution is required"),
  course: z.string().min(1, "Course is required"),
  studyLevel: z.string().min(1, "Study level is required"),
  resultScore: z.string(),
  outOf: z.string(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
});

export function AcademicHistoryDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
}) {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      institution: "",
      course: "",
      studyLevel: "",
      resultScore: "",
      outOf: "",
      startDate: initialData?.startDate ? moment(initialData.startDate, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD') : moment().format('YYYY-MM-DD'),
      endDate: initialData?.endDate ? moment(initialData.endDate, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD') : moment().format('YYYY-MM-DD'),
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        ...initialData,
        startDate: initialData?.startDate ? moment(initialData.startDate, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD') : moment().format('YYYY-MM-DD'),
      endDate: initialData?.endDate ? moment(initialData.endDate, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD') : moment().format('YYYY-MM-DD'),
      });
    } else {
      form.reset();
    }
  }, [initialData, form]);

  const handleSubmit = (values) => {
    const transformedData = {
      ...values,
      resultScore: parseInt(values.resultScore, 10),
      outOf: parseInt(values.outOf, 10)
    };
    onSubmit(transformedData)
    form.reset()
    onOpenChange(false)
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Academic History" : "Add Academic History"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="institution"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Institution</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="course"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Course</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="studyLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Study Level</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select study level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="undergraduate">High School</SelectItem>
                      <SelectItem value="postgraduate">Higher Secondary</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="resultScore"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Result Score</FormLabel>
                  <FormControl>
                    <Input {...field} type="number" min="0" step="any" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="outOf"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Out Of</FormLabel>
                  <FormControl>
                    <Input {...field} type="number" min="0" step="any"/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">{initialData ? "Update History" : "Add History"}</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
