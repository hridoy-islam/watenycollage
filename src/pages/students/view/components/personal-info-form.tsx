import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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

// Define Zod Schema
const formSchema = z.object({
  disabilities: z.string().nonempty("Disabilities selection is required."),
  ethnicity: z.string().nonempty("Ethnicity selection is required."),
  genderIdentity: z.string().nonempty("Gender identity selection is required."),
  sexualOrientation: z
    .string()
    .nonempty("Sexual orientation selection is required."),
  religion: z.string().nonempty("Religion selection is required."),
});

type PersonalInfoFormValues = z.infer<typeof formSchema>;

export function PersonalInfoForm() {
  const form = useForm<PersonalInfoFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      disabilities: "",
      ethnicity: "",
      genderIdentity: "",
      sexualOrientation: "",
      religion: "",
    },
  });

  const onSubmit = (data: PersonalInfoFormValues) => {
    console.log("Form Data:", data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-4 rounded-md shadow-md">
        <div className="grid grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="disabilities"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Do you have any disabilities that require arrangements from the
                college or special needs that applies to you? *
              </FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
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
          control={form.control}
          name="ethnicity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ethnicity *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Please select" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="white-british">White British</SelectItem>
                  <SelectItem value="asian">Asian</SelectItem>
                  <SelectItem value="black">Black</SelectItem>
                  <SelectItem value="mixed">Mixed</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="genderIdentity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Please indicate if your Gender identity is the same as the
                gender originally assigned to you at birth *
              </FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
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
          control={form.control}
          name="sexualOrientation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sexual Orientation *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Please select" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="heterosexual">Heterosexual</SelectItem>
                  <SelectItem value="gay">Gay</SelectItem>
                  <SelectItem value="lesbian">Lesbian</SelectItem>
                  <SelectItem value="bisexual">Bisexual</SelectItem>
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
          control={form.control}
          name="religion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Religion or Belief *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Please select" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="christian">Christian</SelectItem>
                  <SelectItem value="muslim">Muslim</SelectItem>
                  <SelectItem value="hindu">Hindu</SelectItem>
                  <SelectItem value="sikh">Sikh</SelectItem>
                  <SelectItem value="buddhist">Buddhist</SelectItem>
                  <SelectItem value="jewish">Jewish</SelectItem>
                  <SelectItem value="no-religion">No Religion</SelectItem>
                  <SelectItem value="prefer-not-to-say">
                    Prefer not to say
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        </div>
        <div className="flex justify-end">
        <Button type="submit" className="bg-supperagent hover:bg-supperagent/90 text-white">Save Changes</Button>
        </div>
      </form>
    </Form>
  );
}
