import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect } from "react";
import { mockData } from "@/types";

// export function PersonalInfoForm({ student, onSave }) {
//   const form = useForm({
//     defaultValues: {
//       disabilities: "",
//       ethnicity: "",
//       genderIdentity: "",
//       sexualOrientation: "",
//       religion: "",
//     },
//   });

//   const { handleSubmit, control, reset } = form;

//   useEffect(() => {
//     if (student) {
//       reset({
//         disabilities: student.disabilities || "",
//         ethnicity: student.ethnicity || "",
//         genderIdentity: student.genderIdentity || "",
//         sexualOrientation: student.sexualOrientation || "",
//         religion: student.religion || "",
//       });
//     }
//   }, [student, reset]);

//   const onSubmit = (data) => {
//     console.log("Submitted Data:", data);
//     onSave(data);
//   };

//   return (
//     <Form {...form}>
//       <form
//         onSubmit={handleSubmit(onSubmit)}
//         className="space-y-4 p-4 rounded-md shadow-md"
//       >
//         <div className="grid grid-cols-2 gap-6">
//           <FormField
//             control={control}
//             name="disabilities"
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel>
//                   Do you have any disabilities that require arrangements from
//                   the college or special needs that applies to you? *
//                 </FormLabel>
//                 <Select onValueChange={field.onChange} defaultValue={field.value}>
//                   <FormControl>
//                     <SelectTrigger>
//                       <SelectValue placeholder="Please select" />
//                     </SelectTrigger>
//                   </FormControl>
//                   <SelectContent>
//                     <SelectItem value="no">No</SelectItem>
//                     <SelectItem value="yes">Yes</SelectItem>
//                   </SelectContent>
//                 </Select>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />

//           <FormField
//             control={control}
//             name="ethnicity"
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel>Ethnicity *</FormLabel>
//                 <Select onValueChange={field.onChange} defaultValue={field.value}>
//                   <FormControl>
//                     <SelectTrigger>
//                       <SelectValue placeholder="Please select" />
//                     </SelectTrigger>
//                   </FormControl>
//                   <SelectContent>
//                   {mockData.ethnicities.map((title, index) => (
//                       <SelectItem key={index} value={title}>
//                         {title}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />

//           <FormField
//             control={control}
//             name="genderIdentity"
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel>
//                   Please indicate if your Gender identity is the same as the
//                   gender originally assigned to you at birth *
//                 </FormLabel>
//                 <Select onValueChange={field.onChange} defaultValue={field.value}>
//                   <FormControl>
//                     <SelectTrigger>
//                       <SelectValue placeholder="Please select" />
//                     </SelectTrigger>
//                   </FormControl>
//                   <SelectContent>
//                     <SelectItem value="yes">Yes</SelectItem>
//                     <SelectItem value="no">No</SelectItem>
//                     <SelectItem value="prefer-not-to-say">
//                       Prefer not to say
//                     </SelectItem>
//                   </SelectContent>
//                 </Select>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />

//           <FormField
//             control={control}
//             name="sexualOrientation"
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel>Sexual Orientation *</FormLabel>
//                 <Select onValueChange={field.onChange} defaultValue={field.value}>
//                   <FormControl>
//                     <SelectTrigger>
//                       <SelectValue placeholder="Please select" />
//                     </SelectTrigger>
//                   </FormControl>
//                   <SelectContent>
//                   {mockData.sexualOrientation.map((title, index) => (
//                       <SelectItem key={index} value={title}>
//                         {title}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />

//           <FormField
//             control={control}
//             name="religion"
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel>Religion or Belief *</FormLabel>
//                 <Select onValueChange={field.onChange} defaultValue={field.value}>
//                   <FormControl>
//                     <SelectTrigger>
//                       <SelectValue placeholder="Please select" />
//                     </SelectTrigger>
//                   </FormControl>
//                   <SelectContent>
//                   {mockData.religion.map((title, index) => (
//                       <SelectItem key={index} value={title}>
//                         {title}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />
//         </div>
//         <div className="flex justify-end">
//           <Button
//             type="submit"
//             className="bg-supperagent hover:bg-supperagent/90 text-white"
//           >
//             Save Changes
//           </Button>
//         </div>
//       </form>
//     </Form>
//   );
// }


export function PersonalInfoForm({ student, onSave }) {
  const form = useForm({
    defaultValues: {
      disabilities: "",
      ethnicity: "",
      genderIdentity: "",
      sexualOrientation: "",
      religion: "",
    },
  });

  const { handleSubmit, control, reset } = form;

  useEffect(() => {
    if (student) {
      reset({
        disabilities: student.disabilities || "",
        ethnicity: student.ethnicity || "",
        genderIdentity: student.genderIdentity || "",
        sexualOrientation: student.sexualOrientation || "",
        religion: student.religion || "",
      });
    }
  }, [student, reset]);

  const onSubmit = (data) => {
    console.log("Submitted Data:", data);
    onSave(data);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 p-4 rounded-md shadow-md"
      >
        <div className="grid grid-cols-2 gap-6">
          <FormField
            control={control}
            name="disabilities"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Do you have any disabilities that require arrangements from
                  the college or special needs that applies to you? *
                </FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Please select" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="no">No</SelectItem>
                    <SelectItem value="yes">Yes</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="ethnicity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ethnicity *</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Please select" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {mockData.ethnicities.map((title, index) => (
                      <SelectItem key={index} value={title}>
                        {title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="genderIdentity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Please indicate if your Gender identity is the same as the
                  gender originally assigned to you at birth *
                </FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Please select" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                    <SelectItem value="prefer-not-to-say">
                      Prefer not to say
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="sexualOrientation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sexual Orientation *</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Please select" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {mockData.sexualOrientation.map((title, index) => (
                      <SelectItem key={index} value={title}>
                        {title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="religion"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Religion or Belief *</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Please select" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {mockData.religion.map((title, index) => (
                      <SelectItem key={index} value={title}>
                        {title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex justify-end">
          <Button
            type="submit"
            className="bg-supperagent hover:bg-supperagent/90 text-white"
          >
            Save Changes
          </Button>
        </div>
      </form>
    </Form>
  );
}
