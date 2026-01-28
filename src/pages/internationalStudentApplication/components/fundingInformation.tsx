// import { zodResolver } from '@hookform/resolvers/zod';
// import { useForm } from 'react-hook-form';
// import * as z from 'zod';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent } from '@/components/ui/card';
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage
// } from '@/components/ui/form';
// import { Textarea } from '@/components/ui/textarea';
// import Select from 'react-select';
// import { useEffect } from 'react';


// const fundingSchema = z
//   .object({
//     fundingType: z.string().min(1, { message: 'Funding type is required' }),
//     grantDetails: z.string().optional(),
//     fundingCompanyName: z.string().optional(),
//     fundingContactPerson: z.string().optional(),
//     fundingEmail: z.string().optional(),
//     fundingPhoneNumber: z.string().optional()
//   })
//   .superRefine((data, ctx) => {
//     if (data.fundingType === 'Bursary/Grant' && !data.grantDetails?.trim()) {
//       ctx.addIssue({
//         code: z.ZodIssueCode.custom,
//         message: 'Please specify the bursary or grant details',
//         path: ['grantDetails']
//       });
//     }

//     if (data.fundingType === 'Employer-sponsored') {
//       if (!data.fundingCompanyName?.trim()) {
//         ctx.addIssue({
//           code: z.ZodIssueCode.custom,
//           message: 'Company name is required for employer-sponsored funding',
//           path: ['fundingCompanyName']
//         });
//       }
//       if (!data.fundingContactPerson?.trim()) {
//         ctx.addIssue({
//           code: z.ZodIssueCode.custom,
//           message: 'Contact person is required for employer-sponsored funding',
//           path: ['fundingContactPerson']
//         });
//       }
//       if (!data.fundingEmail?.trim()) {
//         ctx.addIssue({
//           code: z.ZodIssueCode.custom,
//           message: 'Email is required for employer-sponsored funding',
//           path: ['fundingEmail']
//         });
//       }
//       if (!data.fundingPhoneNumber?.trim()) {
//         ctx.addIssue({
//           code: z.ZodIssueCode.custom,
//           message: 'Phone number is required for employer-sponsored funding',
//           path: ['fundingPhoneNumber']
//         });
//       }
//     }
//   });

// export default fundingSchema;


// type FundingData = z.infer<typeof fundingSchema>;

// export function FundingInformation({
//   defaultValues,
//   onSaveAndContinue,
//   setCurrentStep
// }: {
//   defaultValues?: Partial<FundingData>;
//   onSaveAndContinue: (data: FundingData) => void;
//   setCurrentStep: (step: number) => void;
// }) {
//   const form = useForm<FundingData>({
//     resolver: zodResolver(fundingSchema),
//     defaultValues: {
//       fundingType: defaultValues?.fundingType || '',
//       grantDetails: defaultValues?.grantDetails || '',
//       fundingCompanyName: defaultValues?.fundingCompanyName || '',
//       fundingContactPerson: defaultValues?.fundingContactPerson || '',
//       fundingEmail: defaultValues?.fundingEmail || '',
//       fundingPhoneNumber: defaultValues?.fundingPhoneNumber || ''
//     }
//   });

//   function onSubmit(data: FundingData) {
//     onSaveAndContinue(data);
//   }

//   function handleBack() {
//     setCurrentStep(9);
//   }

//   useEffect(() => {
//     if (defaultValues) {
//       form.reset({
//         ...defaultValues
//       });
//     }
//   }, [defaultValues, form]);

//   const fundingOptions = [
//     { value: 'Self-funded', label: 'Self-funded' },
//     { value: 'Student Loan', label: 'Student Loan' },
//     { value: 'Employer-sponsored', label: 'Employer-sponsored' },
//     {
//       value: 'Bursary/Grant',
//       label: 'Bursary/Grant'
//     }
//   ];

//   return (
//     <Form {...form}>
//       <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
//         <CardContent className="p-0">
//           <div className="space-y-4">
//             <h2 className="text-xl font-semibold">Funding Information</h2>
//             <p className="text-sm text-gray-600">
//               Please indicate who is funding your course.
//             </p>

//             <FormField
//               control={form.control}
//               name="fundingType"
//               render={({ field }) => (
//                 <FormItem className="md:w-1/2">
//                   <FormLabel>
//                     Who is funding your course?{' '}
//                     <span className="text-red-500">*</span>
//                   </FormLabel>
//                   <FormControl>
//                     <Select
//                       options={fundingOptions}
//                       value={
//                         field.value
//                           ? fundingOptions.find(
//                               (opt) => opt.value === field.value
//                             ) || null
//                           : null
//                       }
//                       onChange={(selected) => field.onChange(selected?.value)}
//                       placeholder="Select funding source"
//                       styles={{
//                         placeholder: (provided) => ({
//                           ...provided,
//                           fontSize: '0.75rem',
//                           color: '#9CA3AF'
//                         })
//                       }}
//                     />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             {form.watch('fundingType') === 'Bursary/Grant' && (
//               <FormField
//                 control={form.control}
//                 name="grantDetails"
//                 render={({ field }) => (
//                   <FormItem className="md:w-1/2">
//                     <FormLabel>
//                       Bursary / Grant Details{' '}
//                       <span className="text-red-500">*</span>
//                     </FormLabel>
//                     <FormControl>
//                       <Textarea
//                         {...field}
//                         rows={4}
//                         placeholder="Please provide the name of the bursary or grant, and any relevant details."
//                         className="!placeholder:text-gray-500 border-gray-300 placeholder:text-xs"
//                       />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//             )}

//             {form.watch('fundingType') === 'Employer-sponsored' && (
//               <div className="grid gap-4 md:grid-cols-2">
//                 <FormField
//                   control={form.control}
//                   name="fundingCompanyName"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Company Name <span className="text-red-500">*</span></FormLabel>
//                       <FormControl>
//                         <input
//                           {...field}
//                           className="w-full rounded-md border border-gray-300 p-2 text-sm"
//                           placeholder="Enter company name"
//                         />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//                 <FormField
//                   control={form.control}
//                   name="fundingContactPerson"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Contact Person <span className="text-red-500">*</span></FormLabel>
//                       <FormControl>
//                         <input
//                           {...field}
//                           className="w-full rounded-md border border-gray-300 p-2 text-sm"
//                           placeholder="Enter contact person"
//                         />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//                 <FormField
//                   control={form.control}
//                   name="fundingEmail"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Email <span className="text-red-500">*</span></FormLabel>
//                       <FormControl>
//                         <input
//                           type="email"
//                           {...field}
//                           className="w-full rounded-md border border-gray-300 p-2 text-sm"
//                           placeholder="Enter email"
//                         />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//                 <FormField
//                   control={form.control}
//                   name="fundingPhoneNumber"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Phone Number <span className="text-red-500">*</span></FormLabel>
//                       <FormControl>
//                         <input
//                           type="tel"
//                           {...field}
//                           className="w-full rounded-md border border-gray-300 p-2 text-sm"
//                           placeholder="Enter phone number"
//                         />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//               </div>
//             )}
//           </div>
//         </CardContent>

//         <div className="mt-8 flex justify-between">
//           <Button
//             type="button"
//             variant="outline"
//             className="bg-watney text-white hover:bg-watney/90"
//             onClick={handleBack}
//           >
//             Back
//           </Button>
//           <Button
//             type="submit"
//             className="bg-watney text-white hover:bg-watney/90"
//           >
//             Next
//           </Button>
//         </div>
//       </form>
//     </Form>
//   );
// }



import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import Select from 'react-select';
import { useEffect } from 'react';


const fundingSchema = z
  .object({
    fundingType: z.string().min(1, { message: 'Funding type is required' }),
    // grantDetails: z.string().optional(),
    fundingCompanyName: z.string().optional(),
    // fundingContactPerson: z.string().optional(),
    // fundingEmail: z.string().optional(),
    // fundingPhoneNumber: z.string().optional()
  })
  .superRefine((data, ctx) => {
    // if (data.fundingType === 'Bursary/Grant' && !data.grantDetails?.trim()) {
    //   ctx.addIssue({
    //     code: z.ZodIssueCode.custom,
    //     message: 'Please specify the bursary or grant details',
    //     path: ['grantDetails']
    //   });
    // }

    if (data.fundingType === 'Employer') {
      if (!data.fundingCompanyName?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Employer name is required for employer funding',
          path: ['fundingCompanyName']
        });
      }
      // if (!data.fundingContactPerson?.trim()) {
      //   ctx.addIssue({
      //     code: z.ZodIssueCode.custom,
      //     message: 'Contact person is required for employer funding',
      //     path: ['fundingContactPerson']
      //   });
      // }
      // if (!data.fundingEmail?.trim()) {
      //   ctx.addIssue({
      //     code: z.ZodIssueCode.custom,
      //     message: 'Email is required for employer-sponsored funding',
      //     path: ['fundingEmail']
      //   });
      // }
      // if (!data.fundingPhoneNumber?.trim()) {
      //   ctx.addIssue({
      //     code: z.ZodIssueCode.custom,
      //     message: 'Phone number is required for employer-sponsored funding',
      //     path: ['fundingPhoneNumber']
      //   });
      // }
    }
  });

export default fundingSchema;


type FundingData = z.infer<typeof fundingSchema>;

export function FundingInformation({
  defaultValues,
  onSaveAndContinue,
  setCurrentStep
}: {
  defaultValues?: Partial<FundingData>;
  onSaveAndContinue: (data: FundingData) => void;
  setCurrentStep: (step: number) => void;
}) {
  const form = useForm<FundingData>({
    resolver: zodResolver(fundingSchema),
    defaultValues: {
      fundingType: defaultValues?.fundingType || '',
      // grantDetails: defaultValues?.grantDetails || '',
      fundingCompanyName: defaultValues?.fundingCompanyName || '',
      // fundingContactPerson: defaultValues?.fundingContactPerson || '',
      // fundingEmail: defaultValues?.fundingEmail || '',
      // fundingPhoneNumber: defaultValues?.fundingPhoneNumber || ''
    }
  });

  function onSubmit(data: FundingData) {
    onSaveAndContinue(data);
  }

  function handleBack() {
    setCurrentStep(9);
  }

  useEffect(() => {
    if (defaultValues) {
      form.reset({
        ...defaultValues
      });
    }
  }, [defaultValues, form]);

  const fundingOptions = [
    { value: 'Self', label: 'Self' },
    // { value: 'Student Loan', label: 'Student Loan' },
    { value: 'Employer', label: 'Employer' },
    {
      value: 'SLC',
      label: 'SLC'
    }
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <CardContent className="p-0">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Funding Information</h2>
            <p className="text-sm text-gray-600">
              Please indicate who is funding your course.
            </p>

            <FormField
              control={form.control}
              name="fundingType"
              render={({ field }) => (
                <FormItem className="md:w-1/2">
                  <FormLabel>
                    Who is funding the course?{' '}
                    <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Select
                      options={fundingOptions}
                      value={
                        field.value
                          ? fundingOptions.find(
                              (opt) => opt.value === field.value
                            ) || null
                          : null
                      }
                      onChange={(selected) => field.onChange(selected?.value)}
                      placeholder="Select funding source"
                      styles={{
                        placeholder: (provided) => ({
                          ...provided,
                          fontSize: '0.75rem',
                          color: '#9CA3AF'
                        })
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* {form.watch('fundingType') === 'Bursary/Grant' && (
              <FormField
                control={form.control}
                name="grantDetails"
                render={({ field }) => (
                  <FormItem className="md:w-1/2">
                    <FormLabel>
                      Bursary / Grant Details{' '}
                      <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        rows={4}
                        placeholder="Please provide the name of the bursary or grant, and any relevant details."
                        className="!placeholder:text-gray-500 border-gray-300 placeholder:text-xs"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )} */}

            {form.watch('fundingType') === 'Employer' && (
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="fundingCompanyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Employer Name <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <input
                          {...field}
                          className="w-full rounded-md border border-gray-300 p-2 text-sm"
                          placeholder="Enter Employer name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* <FormField
                  control={form.control}
                  name="fundingContactPerson"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Person <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <input
                          {...field}
                          className="w-full rounded-md border border-gray-300 p-2 text-sm"
                          placeholder="Enter contact person"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fundingEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <input
                          type="email"
                          {...field}
                          className="w-full rounded-md border border-gray-300 p-2 text-sm"
                          placeholder="Enter email"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fundingPhoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <input
                          type="tel"
                          {...field}
                          className="w-full rounded-md border border-gray-300 p-2 text-sm"
                          placeholder="Enter phone number"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                /> */}
              </div>
            )}
          </div>
        </CardContent>

        <div className="mt-8 flex justify-between">
          <Button
            type="button"
            variant="outline"
            className="bg-watney text-white hover:bg-watney/90"
            onClick={handleBack}
          >
            Back
          </Button>
          <Button
            type="submit"
            className="bg-watney text-white hover:bg-watney/90"
          >
            Next
          </Button>
        </div>
      </form>
    </Form>
  );
}

