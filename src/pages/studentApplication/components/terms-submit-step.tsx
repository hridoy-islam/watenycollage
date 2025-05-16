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
  FormMessage
} from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';

const termsSchema = z.object({
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: 'You must accept the terms and conditions to proceed'
  }),
  acceptDataProcessing: z.boolean().refine((val) => val === true, {
    message: 'You must consent to data processing to proceed'
  })
});

type TermsData = z.infer<typeof termsSchema>;

interface TermsSubmitStepProps {
  defaultValues?: Partial<TermsData>;
  onSave: (data: TermsData) => void;
  onReview: () => void;
  onSubmit: () => void;
}

export function TermsSubmitStep({
  defaultValues,
  onSave,
  onReview,
  onSubmit,
  setCurrentStep
}: any) {
  const form = useForm<TermsData>({
    resolver: zodResolver(termsSchema),
    defaultValues: {
      acceptTerms: defaultValues?.acceptTerms || false,
      acceptDataProcessing: defaultValues?.acceptDataProcessing || false
    }
  });

  // function handleSave() {
  //   const data = form.getValues();
  //   onSave(data);
  // }

  function handleBack() {
    setCurrentStep(8);
  }


  const isValid = form.formState.isValid;

  return (
    <Form {...form}>
      <form>
        <div>
          <CardContent className="space-y-2">
            <div>
              <h2 className="mb-2 text-xl font-semibold">
                Terms and Conditions
              </h2>
              <div className="mb-2 max-h-60 overflow-y-auto rounded-md bg-gray-50 p-4">
                <h3 className="mb-2 font-medium">What happens next</h3>
                <p className="mb-2 text-sm">
                  Thank you for taking the time to provide all of the
                  information required. Once you have clicked 'Submit' below the
                  application will be sent to our Centre Support Team. Once it
                  has passed our preliminary review an invoice for centre
                  recognition will be issued, this is usually within five
                  working days.
                </p>
                <p className="mb-2 text-sm">
                  Once the initial centre recognition invoice has been paid you
                  will be contacted within five working days by one of our
                  External Quality Assurers to take you through the centre
                  recognition process.
                </p>
                <p className="mb-2 text-sm">
                  If you have any queries please contact us on
                  support@example.co.uk or telephone +44(0)1234567890.
                </p>

                <Separator className="my-4" />

                <h3 className="mb-2 font-medium">Data Compliance Notice</h3>
                <p className="mb-2 text-sm">
                  We value your privacy and are committed to protecting your
                  personal data. The information you provide will be processed
                  in compliance with the General Data Protection Regulation
                  (GDPR).
                </p>

                <h4 className="mb-1 mt-3 text-sm font-medium">
                  Purpose of Processing
                </h4>
                <p className="mb-2 text-sm">
                  We collect and process your data for quality assuring your
                  initial and continued compliance to our terms of centre
                  recognition as found in the Centre Agreement.
                </p>

                <h4 className="mb-1 mt-3 text-sm font-medium">Data Sharing</h4>
                <p className="mb-2 text-sm">
                  Your information may be shared with third-party services,
                  including AI tools, to enhance our services. For example, we
                  use AI technologies to run preliminary checks on CVs.
                </p>

                <h4 className="mb-1 mt-3 text-sm font-medium">Your Rights</h4>
                <p className="mb-2 text-sm">
                  You have the right to access, correct, or request deletion of
                  your data. You can also object to certain types of processing.
                </p>

                <p className="mt-3 text-sm">
                  By clicking "Submit," you consent to the processing of your
                  data as outlined above.
                </p>
              </div>

              <FormField
                control={form.control}
                name="acceptTerms"
                render={({ field }) => (
                  <FormItem className="mb-2 flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <label className="cursor-pointer text-sm font-medium">
                        I confirm that the information given on this form is
                        true, complete and accurate and that none of the
                        information requested or other material information has
                        been omitted. I accept that if it is discovered that I
                        have supplied false, inaccurate or misleading
                        information, WATNEY COLLEGE reserves the right to cancel
                        my application, withdraw its offer of a place or
                        terminate attendance at the College and I shall have no
                        claim against WATNEY COLLEGE in relation thereto.
                      </label>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="acceptDataProcessing"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <label className="cursor-pointer text-sm font-medium">
                        I consent to the processing of my data as outlined
                        above.
                      </label>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </div>
        <div className="px-6 flex justify-between">
          <Button type="button" variant="outline" onClick={handleBack}  className='bg-watney text-white hover:bg-watney/90'>
            Back
          </Button>
          <div className="space-x-3">
            <Button type="button" variant="outline" onClick={onReview}  className='bg-watney text-white hover:bg-watney/90'>
              Review Application
            </Button>
            <Button
              type="button"
              onClick={onSubmit}
              disabled={!isValid}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Submit
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
