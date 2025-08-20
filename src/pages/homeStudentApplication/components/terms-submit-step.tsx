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
import { useEffect, useState, useRef } from 'react';
import { Textarea } from '@/components/ui/textarea';

const termsSchema = z
  .object({
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: 'You must accept the terms and conditions to proceed'
    }),
    acceptDataProcessing: z.boolean().refine((val) => val === true, {
      message: 'You must consent to data processing to proceed'
    }),
    criminalConviction: z.boolean().optional(),
    convictionDetails: z.string().optional()
  })
  .superRefine((data, ctx) => {
    // Check if criminalConviction is "yes" and if convictionDetails is provided
    if (data.criminalConviction === true && !data.convictionDetails?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'Conviction details are required when criminal conviction is "yes".',
        path: ['convictionDetails']
      });
    }
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
  onSaveAndContinue,
  setCurrentStep
}: any) {
  const form = useForm<TermsData>({
    resolver: zodResolver(termsSchema),
    defaultValues: {
      acceptTerms: defaultValues?.acceptTerms || false,
      acceptDataProcessing: defaultValues?.acceptDataProcessing || false,
      criminalConviction: defaultValues?.criminalConviction ?? false,
      convictionDetails: defaultValues?.convictionDetails || ''
    }
  });

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);

  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (container) {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isAtBottom = scrollHeight - scrollTop <= clientHeight + 5;
      if (isAtBottom && !hasScrolledToBottom) {
        setHasScrolledToBottom(true);
      }
    }
  };

  const handleSave = (data: TermsData) => {
    onSaveAndContinue(data);
  };

  const handleBack = () => {
    setCurrentStep(8);
  };

  const isValid = form.formState.isValid;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSave)}>
        <div>
          <CardContent className="space-y-2">
            <div>
              <h2 className="mb-2 text-xl font-semibold">
                Terms and Conditions
              </h2>
              <div
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="mb-2 max-h-[350px] overflow-y-auto rounded-md bg-gray-50 p-4"
              >
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
                  If you have any queries please contact us on{' '}
                  <a
                    href="mailto:admission@watneycollege.co.uk"
                    className="text-blue-600 underline"
                  >
                    admission@watneycollege.co.uk
                  </a>{' '}
                  or telephone +44 (0)208 004 6463.
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
                name="criminalConviction"
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
                        Do you have any criminal conviction?
                      </label>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              {/* Show conviction details textarea only if criminalConviction is true */}
              {form.watch('criminalConviction') && (
                <FormField
                  control={form.control}
                  name="convictionDetails"
                  render={({ field }) => (
                    <FormItem className="py-2">
                      <label className="text-sm font-medium">
                        Conviction Details
                      </label>
                      <FormControl>
                        <Textarea
                          {...field}
                          className="md:w-[50%] resize-none rounded-md border border-gray-300  px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
                          rows={4}
                          placeholder="Please provide details about your conviction"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
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
                        I consent to Watney College processing my personal data
                        for purposes related to my application, studies, health
                        and safety, and compliance with College policies. This
                        includes academic performance, learning support,
                        disciplinary matters, CCTV usage, ID card photos, and
                        data required by the Higher Education Statistics Agency
                        (HESA) or other legitimate purposes. I consent to the
                        disclosure of this data for academic references, further
                        education, employment, council tax, or immigration
                        matters, including verification with the UK Border
                        Agency. I understand I can request a copy of my data and
                        that details on HESA are available on the College’s
                        intranet
                      </label>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </div>
        <div className="px-6 py-4">
          <div className="grid gap-3 sm:flex sm:justify-between">
            {/* Back Button */}
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              className="w-full bg-watney text-white hover:bg-watney/90 sm:w-auto"
            >
              Back
            </Button>

            {/* Right side buttons */}
            <div className="grid w-full gap-3 sm:flex sm:w-auto sm:space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={onReview}
                className="w-full bg-watney text-white hover:bg-watney/90 sm:w-auto"
              >
                Review Application
              </Button>
              <Button
                type="submit"
                disabled={!hasScrolledToBottom}
                className={`w-full sm:w-auto ${
                  hasScrolledToBottom
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'cursor-not-allowed bg-green-600/50'
                } text-white`}
              >
                Submit
              </Button>
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
}
