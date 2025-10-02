import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';

// Simple schema with two optional string fields
const experienceSchema = z.object({
  lifeSkillsAndInterests: z
    .string()
    .min(1, "Life skills and interests are required"),
  relevantExperience: z
    .string()
    .min(1, "Relevant experience is required"),
});
type ExperienceFormValues = z.infer<typeof experienceSchema>;

export function ExperienceStep({
  defaultValues,
  onSaveAndContinue,
  setCurrentStep
}) {
  const form = useForm<ExperienceFormValues>({
    resolver: zodResolver(experienceSchema),
    defaultValues: {
      lifeSkillsAndInterests: '',
      relevantExperience: '',
      ...defaultValues
    },
    mode: 'onSubmit' // Only validate on blur or submit (no aggressive validation)
  });

  function onSubmit(data: ExperienceFormValues) {
    onSaveAndContinue(data);
  }

  function handleBack() {
    setCurrentStep(9);
  }

  return (
  <Card className="border-none shadow-none">
    <CardHeader>
      <CardTitle className="text-2xl">Experience & Interests</CardTitle>
      <CardDescription className='text-lg'>
        Help us get to know you better by sharing your personal interests and
        any relevant experience you feel supports your application.
      </CardDescription>
    </CardHeader>
    <CardContent>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Life Skills & Interests */}
          <FormField
            control={form.control}
            name="lifeSkillsAndInterests"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg font-medium">
                  What are your life skills and interests?{' '}
                  <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="e.g., Football, cooking, volunteering, public speaking, playing guitar"
                    className="min-h-[100px]  border border-gray-300 p-4 text-lg resize-none placeholder:text-gray-400"
                  />
                </FormControl>
                <p className="mt-1 text-md text-gray-400">
                  Example: I play football weekly and enjoy mentoring young
                  players. I’m also passionate about cooking and community
                  gardening.
                </p>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Relevant Experience */}
          <FormField
            control={form.control}
            name="relevantExperience"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg font-medium">
                  Please provide a brief description of any experience
                  relevant to this application{' '}
                  <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="e.g., Cared for elderly relative, worked in hospitality, completed first aid training"
                    className="min-h-[100px]  border border-gray-300 p-4 text-lg resize-none placeholder:text-gray-400"
                  />
                </FormControl>
                <p className="mt-1 text-md text-gray-400">
                  Example: I supported my grandmother with daily living tasks
                  for 3 years, including medication management and mobility
                  assistance.
                </p>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-between pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              className="h-12 rounded-full bg-watney text-lg text-white hover:bg-watney/90"
            >
              Back
            </Button>
            <Button
              type="submit"
              className="h-12 rounded-full bg-watney text-lg text-white hover:bg-watney/90"
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