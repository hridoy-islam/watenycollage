'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const declarationSchema = z.object({
  // declarationCorrectUpload: z
  //   .boolean()
  //   .optional()
  //   .refine((val) => val !== undefined, { message: 'Required' }),

  // declarationContactReferee: z
  //   .boolean()
  //   .optional()

  //   .refine((val) => val !== undefined, { message: 'Required' }),
  // criminalConviction: z.boolean(),
  // criminalConvictionDetails: z.string().optional(), // <-- add this
  // appliedBefore: z.boolean(),
  documents: z.object({
    ID: z.instanceof(File).optional(),
    cv: z.instanceof(File).optional(),
    proofOfAddress: z.instanceof(File).optional(),
    qualification: z.instanceof(File).optional(),
    reference: z.instanceof(File).optional(),
    shareCode: z.instanceof(File).optional()
  })
});
// .refine(
//   (data) => {
//     if (data.criminalConviction && !data.criminalConvictionDetails) {
//       return false;
//     }
//     return true;
//   },
//   {
//     message: 'Please provide details of the conviction',
//     path: ['criminalConvictionDetails']
//   }
// );

type DeclarationFormValues = z.infer<typeof declarationSchema>;

interface DeclarationStepProps {
  value: Partial<DeclarationFormValues>;
  onNext: (data: DeclarationFormValues) => void;
  onBack: () => void;
}

export function DeclarationStep({
  value,
  onNext,
  onBack
}: DeclarationStepProps) {
  const form = useForm<DeclarationFormValues>({
    resolver: zodResolver(declarationSchema),
    defaultValues: {
      // declarationCorrectUpload: value.declarationCorrectUpload || false,
      // declarationContactReferee: value.declarationContactReferee || false,
      // criminalConviction: value.criminalConviction || false,
      // criminalConvictionDetails: value.criminalConvictionDetails || '',
      // appliedBefore: value.appliedBefore || false,
      documents: {
        ID: undefined,
        cv: undefined,
        proofOfAddress: undefined,
        qualification: undefined,
        reference: undefined,
        shareCode: undefined
      }
    }
  });

  const onSubmit = (data: DeclarationFormValues) => {
    onNext(data);
  };

  // const watchConviction = form.watch('criminalConviction');

  const renderFileInput = (
    name: keyof DeclarationFormValues['documents'],
    label: string,
    helperText: string,
    helperText2: string
  ) => (
    <FormField
      control={form.control}
      name={`documents.${name}`}
      render={({ field: { onChange, ...rest } }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              type="file"
              // Do not spread 'value' prop for file input to avoid type error
              onChange={(e) => onChange(e.target.files?.[0])}
              name={rest.name}
              ref={rest.ref}
              onBlur={rest.onBlur}
              disabled={rest.disabled}
            />
          </FormControl>
          <p className="mt-2 text-xs text-gray-400">{helperText}{'   '} {helperText2}</p>
          {/* <p className="mt-2 text-xs text-gray-400">{helperText2}</p> */}

          <FormMessage />
        </FormItem>
      )}
    />
  );

  return (
    <Card className='border-none shadow-none '>
      <CardHeader>
        <h2 className="text-xl font-semibold">Documents</h2>
        <p className="text-sm text-muted-foreground">
          Please review the required documents and upload clear, valid copies.
          This information is necessary to verify your identity, qualifications,
          and right to work in the UK.
        </p>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* <FormField
              control={form.control}
              name="declarationCorrectUpload"
              render={({ field }) => (
                <FormItem className="flex items-center gap-4">
                  <FormLabel className="mr-2">
                    Are you giving this declaration that what you have uploaded
                    is correct?
                  </FormLabel>
                  <FormControl>
                    <div className="flex items-center">
                      <Checkbox
                        checked={field.value === true}
                        onCheckedChange={() => field.onChange(true)}
                      />
                      <FormLabel className="ml-2">Yes</FormLabel>
                    </div>
                  </FormControl>
                  <FormControl>
                    <div className="flex items-center">
                      <Checkbox
                        checked={field.value === false}
                        onCheckedChange={() => field.onChange(false)}
                      />
                      <FormLabel className="ml-2">No</FormLabel>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="declarationContactReferee"
              render={({ field }) => (
                <FormItem className="flex items-center gap-4">
                  <FormLabel className="mr-2">
                    Do you give us permission to contact the referee on your
                    behalf?
                  </FormLabel>
                  <FormControl>
                    <div className="flex items-center">
                      <Checkbox
                        checked={field.value === true}
                        onCheckedChange={() => field.onChange(true)}
                      />
                      <FormLabel className="ml-2">Yes</FormLabel>
                    </div>
                  </FormControl>
                  <FormControl>
                    <div className="flex items-center">
                      <Checkbox
                        checked={field.value === false}
                        onCheckedChange={() => field.onChange(false)}
                      />
                      <FormLabel className="ml-2">No</FormLabel>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="criminalConviction"
              render={({ field }) => (
                <FormItem className="flex items-center gap-4">
                  <FormLabel className="mr-2">
                    Do you have any criminal conviction?
                  </FormLabel>
                  <FormControl>
                    <div className="flex items-center">
                      <Checkbox
                        checked={field.value === true}
                        onCheckedChange={() => field.onChange(true)}
                      />
                      <FormLabel className="ml-2">Yes</FormLabel>
                    </div>
                  </FormControl>
                  <FormControl>
                    <div className="flex items-center">
                      <Checkbox
                        checked={field.value === false}
                        onCheckedChange={() => field.onChange(false)}
                      />
                      <FormLabel className="ml-2">No</FormLabel>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {watchConviction && (
              <FormField
                control={form.control}
                name="criminalConvictionDetails"
                render={({ field }) => (
                  <FormItem className="w-[500px]">
                    <FormLabel>
                      Please provide details of the conviction
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter details here..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="appliedBefore"
              render={({ field }) => (
                <FormItem className="flex items-center gap-4">
                  <FormLabel className="mr-2">
                    Have you applied here before?
                  </FormLabel>
                  <FormControl>
                    <div className="flex items-center">
                      <Checkbox
                        checked={field.value === true}
                        onCheckedChange={() => field.onChange(true)}
                      />
                      <FormLabel className="ml-2">Yes</FormLabel>
                    </div>
                  </FormControl>
                  <FormControl>
                    <div className="flex items-center">
                      <Checkbox
                        checked={field.value === false}
                        onCheckedChange={() => field.onChange(false)}
                      />
                      <FormLabel className="ml-2">No</FormLabel>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            /> */}

            <div className="grid grid-cols-1 gap-4 pt-4 sm:grid-cols-2">
              {renderFileInput('ID', 'Upload a Valid ID (Passport or UK Driving Licence)','Upload a scanned copy or a clear photo of a valid government-issued ID.','Accepted Formats: PDF, JPG, PNG')}
              {renderFileInput('cv', 'CV','Attach your most recent CV detailing your experience and qualifications','Accepted Formats: PDF, DOC, DOCX')}
              {renderFileInput('proofOfAddress', 'Upload Proof of Address','This can include a recent utility bill, bank statement, or government correspondence (within the last 3 months).','Accepted Formats: PDF, JPG')}
              {renderFileInput('qualification', 'Upload Academic Qualification','Provide your most relevant academic certificate for this role.','Accepted Formats: PDF, JPG')}
              {renderFileInput('reference', 'Upload Reference Letters (if available)','Optional but encouraged. Upload reference letters from your listed referees.','Accepted Formats: PDF, DOC')}
              {renderFileInput('shareCode', 'Provide Your UK Right to Work Share Code','If you are not a British citizen, enter your Home Office-issued share code for employment verification.', 'Example: J9E-4K2-17A')}
            </div>

            <div className="flex justify-between pt-6">
              <Button
                type="button"
                variant="outline"
                className="bg-watney text-white hover:bg-watney/90"
                onClick={onBack}
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
      </CardContent>
    </Card>
  );
}
