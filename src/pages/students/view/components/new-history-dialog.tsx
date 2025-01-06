// import { useEffect } from "react";
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { z } from "zod";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { mockData } from "@/types";

// const formSchema = z.object({
//   purpose: z.string().min(1, "Purpose is required"),
//   arrival: z.string().min(1, "Arrival Date is required"),
//   departure: z.string().min(1, "Departure Date is required"),
//   visaStart: z.string().min(1, "Visa Start Date is required"),
//   visaExpiry: z.string().min(1, "Visa Expiry Date is required"),
//   visaType: z.string().min(1, "Visa Type is required"),
// });

// export function NewHistoryDialog({ open, onOpenChange, onSubmit, initialData }) {
//   const form = useForm({
//     resolver: zodResolver(formSchema),
//     defaultValues: {
//       purpose: "",
//       arrival: "",
//       departure: "",
//       visaStart: "",
//       visaExpiry: "",
//       visaType: "",
//     },
//   });


//   useEffect(() => {
//     if (initialData) {
//       form.reset({
//         ...initialData,
//       });
//     } else {
//       form.reset();
//     }
//   }, [initialData, form]);

//   const handleSubmit = (values) => {
//     const transformedData = {
//       ...values,
//     };
//     onSubmit(transformedData);
//     form.reset();
//     onOpenChange(false);
//   };

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="sm:max-w-[425px]">
//         <DialogHeader>
//           <DialogTitle>{initialData ? "Edit Visa History" : "Add New Visa History"}</DialogTitle>
//         </DialogHeader>
//         <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
//           <div className="space-y-2">
//             <label htmlFor="purpose" className="block text-sm font-medium text-gray-700">
//               Purpose
//             </label>
//             <Input id="purpose" {...form.register("purpose")} />
//           </div>
//           <div className="grid grid-cols-2 gap-4">
//             <div className="space-y-2">
//               <label htmlFor="arrival" className="block text-sm font-medium text-gray-700">
//                 Arrival Date
//               </label>
//               <Input id="arrival" type="date" {...form.register("arrival")} />
//             </div>
//             <div className="space-y-2">
//               <label htmlFor="departure" className="block text-sm font-medium text-gray-700">
//                 Departure Date
//               </label>
//               <Input id="departure" type="date" {...form.register("departure")} />
             
//             </div>
//           </div>
//           <div className="grid grid-cols-2 gap-4">
//             <div className="space-y-2">
//               <label htmlFor="visaStart" className="block text-sm font-medium text-gray-700">
//                 Visa Start Date
//               </label>
//               <Input id="visaStart" type="date" {...form.register("visaStart")} />
//             </div>
//             <div className="space-y-2">
//               <label htmlFor="visaExpiry" className="block text-sm font-medium text-gray-700">
//                 Visa Expiry Date
//               </label>
//               <Input id="visaExpiry" type="date" {...form.register("visaExpiry")} />
//             </div>
//           </div>
//           <div className="space-y-2">
//             <label htmlFor="visaType" className="block text-sm font-medium text-gray-700">
//               Visa Type
//             </label>
//             <Select
//               {...form.register("visaType")}
//               onValueChange={(value) => form.setValue("visaType", value)}
//             >
//               <SelectTrigger>
//                 <SelectValue placeholder="Select visa type" />
//               </SelectTrigger>
//               <SelectContent>
//                 {mockData.visaTypes.map((title, index) => (
//                   <SelectItem key={index} value={title}>
//                     {title}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//           </div>
//           <div className="flex justify-end space-x-2">
//             <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
//               Cancel
//             </Button>
//             <Button className="bg-supperagent hover:bg-supperagent/90 text-white" type="submit">{initialData ? "Update History" : "Add History"}</Button>
//           </div>
//         </form>
//       </DialogContent>
//     </Dialog>
//   );
// }

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
    defaultValues: initialData || {
      purpose: "",
      arrival: initialData?.arrival ? moment(initialData.arrival, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD') : moment().format('YYYY-MM-DD'),
      departure: initialData?.departure ? moment(initialData.departure, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD') : moment().format('YYYY-MM-DD'),
      visaStart: initialData?.visaStart ? moment(initialData.visaStart, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD') : moment().format('YYYY-MM-DD'),
      visaExpiry: initialData?.visaExpiry ? moment(initialData.visaExpiry, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD') : moment().format('YYYY-MM-DD'),
      visaType: "",
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        ...initialData,
        arrival: initialData?.arrival ? moment(initialData.arrival, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD') : moment().format('YYYY-MM-DD'),
      departure: initialData?.departure ? moment(initialData.departure, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD') : moment().format('YYYY-MM-DD'),
      visaStart: initialData?.visaStart ? moment(initialData.visaStart, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD') : moment().format('YYYY-MM-DD'),
      visaExpiry: initialData?.visaExpiry ? moment(initialData.visaExpiry, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD') : moment().format('YYYY-MM-DD'),
      });
    }
  }, [initialData, form]);

  const handleSubmit = (values) => {
    onSubmit(values);
    form.reset();
    onOpenChange(false);
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
              <Button type="submit" className={"bg-supperagent text-white hover:bg-supperagent/90"}>{initialData ? "Update History" : "Add History"}</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
