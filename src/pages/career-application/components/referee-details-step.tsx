import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

// Referee schema (simplified)
const refereeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  position: z.string().min(1, 'Position is required'),
  relationship: z.string().min(1, 'Relationship is required'),
  organisation: z.string().min(1, 'Organisation is required'),
  address: z.string().min(1, 'Address is required'),
  tel: z.string().min(1, 'Tel number is required'),
  fax: z.string().optional(),
  email: z.string().email('Invalid email address')
});

// Updated schema for 3 referees
const refereeDetailsSchema = z.object({
  professionalReferee1: refereeSchema,
  professionalReferee2: refereeSchema,
  personalReferee: refereeSchema
});

export type RefereeFormValues = z.infer<typeof refereeDetailsSchema>;

export function RefereeDetailsStep({
  defaultValues,
  onSaveAndContinue,
  setCurrentStep
}) {
  const form = useForm<RefereeFormValues>({
    resolver: zodResolver(refereeDetailsSchema),
    defaultValues: {
      professionalReferee1: defaultValues?.professionalReferee1 ?? {
        name: '', position: '', relationship: '', organisation: '', address: '', tel: '', fax: '', email: ''
      },
      professionalReferee2: defaultValues?.professionalReferee2 ?? {
        name: '', position: '', relationship: '', organisation: '', address: '', tel: '', fax: '', email: ''
      },
      personalReferee: defaultValues?.personalReferee ?? {
        name: '', position: '', relationship: '', organisation: '', address: '', tel: '', fax: '', email: ''
      }
    }
  });

  const onSubmit = (data: RefereeFormValues) => {
    onSaveAndContinue(data);
  };

  function handleBack() {
    setCurrentStep(8);
  }

  const renderRefereeFields = (
    refKey: keyof RefereeFormValues,
    title: string,
    description: string
  ) => {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">
          {title} <span className="text-red-500">*</span>
        </h3>
        <p className="text-md text-gray-600">{description}</p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Name */}
          <FormField
            control={form.control}
            name={`${refKey}.name`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg font-medium">
                  Name <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Sarah Johnson"
                    className=""
                  />
                </FormControl>
                <p className="text-md text-gray-400">Example: Sarah Johnson</p>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Position */}
          <FormField
            control={form.control}
            name={`${refKey}.position`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg font-medium">
                  Position <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Senior Manager"
                    className=""
                  />
                </FormControl>
                <p className="text-md text-gray-400">Example: Senior Manager</p>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Relationship */}
          <FormField
            control={form.control}
            name={`${refKey}.relationship`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg font-medium">
                  Relationship to you <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Line Manager, Colleague, Friend"
                    className=""
                  />
                </FormControl>
                <p className="text-md text-gray-400">Example: Line Manager</p>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Organisation */}
          <FormField
            control={form.control}
            name={`${refKey}.organisation`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg font-medium">
                  Organisation <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="ABC Health Services Ltd."
                    className=""
                  />
                </FormControl>
                <p className="text-md text-gray-400">Example: ABC Health Services Ltd.</p>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Address */}
          <FormField
            control={form.control}
            name={`${refKey}.address`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg font-medium">
                  Address <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="123 High Street, London, W1A 1AA"
                    className=""
                  />
                </FormControl>
                <p className="text-md text-gray-400">
                  Example: 123 High Street, London, W1A 1AA
                </p>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Tel */}
          <FormField
            control={form.control}
            name={`${refKey}.tel`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg font-medium">
                  Tel No. (NOT Mobile) <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="+44 20 1234 5678"
                    className=""
                  />
                </FormControl>
                <p className="text-md text-gray-400">Example: +44 20 1234 5678</p>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* FAX */}
          <FormField
            control={form.control}
            name={`${refKey}.fax`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg font-medium">FAX No.</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="+44 20 1234 5679"
                    className=""
                  />
                </FormControl>
                <p className="text-md text-gray-400">Example: +44 20 1234 5679</p>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Email */}
          <FormField
            control={form.control}
            name={`${refKey}.email`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg font-medium">
                  Email Address <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="s.johnson@abcservices.com"
                    type="email"
                    className=""
                  />
                </FormControl>
                <p className="text-md text-gray-400">
                  Example: s.johnson@abcservices.com
                </p>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    );
  };

  return (
    <Card className="border-none shadow-none">
      <CardHeader>
        <h2 className="text-2xl font-semibold">Reference Details</h2>
        <p className="text-lg text-gray-400">
          Please give the names and addresses of three referees. Two of these must be your current and most recent employers. If this period of employment was for less than three month you will require a further referee from your next previous employer for whom you worked for a minimum of three months. A referee from your employment must be a senior line manager who knows you. Referees must not be family&nbsp;members.
        </p>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {renderRefereeFields(
              'professionalReferee1',
              'Reference 1',
              'Your current or most recent employer. Must be a senior line manager.'
            )}
            {renderRefereeFields(
              'professionalReferee2',
              'Reference 2',
              'Your previous employer. Must be a senior line manager.'
            )}
            {renderRefereeFields(
              'personalReferee',
              'Reference 3',
              'A personal referee who knows you and can speak to your character. Must not be a family member.'
            )}

            <div className="flex justify-between pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                className=" bg-watney text-lg text-white hover:bg-watney/90"
              >
                Back
              </Button>
              <Button
                type="submit"
                className=" bg-watney text-lg text-white hover:bg-watney/90"
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