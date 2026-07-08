import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import { Button } from '@/components/ui/button';
import { CustomDatePicker } from '@/components/shared/CustomDatePicker';
import {
  MoveLeft,
  Loader2,
  Pencil,
  Trash2
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '@/lib/axios';
import { BlinkingDots } from '@/components/shared/blinking-dots';
import SignatureCanvas from 'react-signature-canvas';
import { format } from 'date-fns';

const employmentContractSchema = z.object({
  jobStartDate: z.date({
    required_error: 'Job start date is required'
  }),
  signatureUrl: z.string().min(1, 'Signature is required'),
});

type EmploymentContractFormValues = z.infer<typeof employmentContractSchema>;

export default function EmploymentContractForm() {
  const [submitting, setSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isAlreadySubmitted, setIsAlreadySubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>([]);

  const [signatureUrl, setSignatureUrl] = useState<string>('');
  const [signatureSaving, setSignatureSaving] = useState(false);
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const signatureRef = useRef<SignatureCanvas>(null);

  const navigate = useNavigate();
  const form = useForm<EmploymentContractFormValues>({
    resolver: zodResolver(employmentContractSchema),
    defaultValues: {
      jobStartDate: undefined,
      signatureUrl: '',
    },
  });
  const { id } = useParams();

  const todayDate = format(new Date(), 'MM/dd/yyyy');
  const watchedJobStartDate = form.watch('jobStartDate');

  const fetchData = async () => {
    setLoading(true);
    try {
      const userRes = await axiosInstance.get(`/application-job?applicantId=${id}`);
      const userStatusRes = await axiosInstance.get(`/users/${id}`);

      setIsAlreadySubmitted(userStatusRes.data.data.employementContractDone);
      setUserData(userRes.data?.data?.result[0]);

      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveSignature = async () => {
    if (!signatureRef.current) return;
    const dataUrl = signatureRef.current.toDataURL();
    if (!dataUrl) return;
    const blob = await (await fetch(dataUrl)).blob();
    const file = new File([blob], 'signature.png', { type: 'image/png' });
    const formData = new FormData();
    formData.append('entityId', id || '');
    formData.append('file_type', 'careerDoc');
    formData.append('file', file);
    setSignatureSaving(true);
    try {
      const response = await axiosInstance.post('/documents', formData);
      if (response.status === 200) {
        const url = response.data?.data?.fileUrl || response.data?.data?.url || response.data?.url;
        if (url) {
          setSignatureUrl(url);
          form.setValue('signatureUrl', url, { shouldValidate: true });
          setShowSignaturePad(false);
        }
      }
    } catch (error) {
      console.error('Error uploading signature:', error);
    } finally {
      setSignatureSaving(false);
    }
  };

  const handleClearSignature = () => {
    signatureRef.current?.clear();
  };

  const onSubmit = async (data: EmploymentContractFormValues) => {
    setSubmitting(true);

    try {
      const payload = {
        userId: id,
        name: `${userData?.applicantId?.firstName} ${userData?.applicantId?.initial || ''} ${userData?.applicantId?.lastName}`,
        jobStartDate: data.jobStartDate,
        signatureUrl: signatureUrl || undefined,
      };

      await axiosInstance.post('/employement-contracts', payload);
      await axiosInstance.patch(`/users/${id}`, { employementContractDone: true });
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error submitting employment contract:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-6">
        <BlinkingDots size="large" color="bg-watney" />
      </div>
    );
  }

  if (isAlreadySubmitted) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-3xl border-t-4 border-t-red-500 p-8 text-center shadow-lg">
          <CardTitle className="mb-4 text-3xl text-red-500">
            Form Already Submitted
          </CardTitle>
          <CardDescription className="mb-6">
            You have already completed the Employment Contract.
          </CardDescription>
          <Button className="mx-auto" onClick={() => navigate(-1)}>
            Go Home
          </Button>
        </Card>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <Card className="w-full max-w-3xl border-t-4 border-t-watney p-8 text-center shadow-lg">
          <CardTitle className="mb-4 text-3xl text-watney">
            Thank You!
          </CardTitle>
          <CardDescription className="text-2xl text-black mb-6">
            The Employment Contract has been successfully completed.
          </CardDescription>
          <Button className="mx-auto" onClick={() => navigate(-1)}>
            Done
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen justify-center">
      <div className="l w-full">
        <Card className="overflow-hidden border-0 shadow-xl">
          <CardHeader className="border-b border-gray-100 bg-white pb-6 pt-8">
            <CardTitle className="text-2xl font-bold text-watney">
              <div className="flex flex-row items-center justify-between">
                <div>Staff Employment Contract</div>
                <Button
                  className="border-none bg-watney text-white hover:bg-watney/90"
                  onClick={() => navigate(-1)}
                >
                  <MoveLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              </div>
            </CardTitle>
            <CardDescription>
              Please provide your job start date and sign the employment contract.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-4 md:p-8">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8"
              >
                <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="space-y-1">
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      Employee Name
                    </p>
                    <p className="text-sm font-semibold text-gray-900 md:text-lg">
                      {userData?.applicantId?.firstName}{' '}
                      {userData?.applicantId?.initial}{' '}
                      {userData?.applicantId?.lastName}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      Post
                    </p>
                    <p className="text-sm font-semibold text-gray-800 md:text-lg">
                      {userData?.jobId?.jobTitle}
                    </p>
                  </div>

                  <FormField
                    control={form.control}
                    name="jobStartDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className="text-xs font-medium uppercase tracking-wide text-gray-500">
                          <div>

                          Job Start Date (MM/dd/yyyy) <span className="text-red-500">*</span>
                          </div>
                        </FormLabel>
                        <FormControl>
                          <CustomDatePicker
                            selected={field.value}
                            onChange={field.onChange}
                            placeholder="e.g. 15/10/2026"
                            futureDate={false}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 md:p-6">
                  <div className="space-y-4 text-sm text-gray-600">
                    <h3 className="text-lg font-semibold text-gray-900">Contract of Employment Statement & Written Particulars of Main Terms of Employment</h3>
                    <p className="font-medium text-gray-900">  {userData?.jobId?.jobTitle}</p>

                    <p>This statement dated <strong>{todayDate}</strong> sets out certain particulars of the terms and conditions which, in conjunction with the Staff Handbook, Policies & Procedures, Job Description and any other operating procedures, form part of the Contract of Employment on which Everycare employs. In your employment, Everycare is acting as an employment business.</p>

                    <p><strong>Name:</strong> {userData?.applicantId?.firstName} {userData?.applicantId?.initial} {userData?.applicantId?.lastName}</p>

                    <p>Any changes or amendments to this will be confirmed in writing within one month of them occurring.</p>

                    <p>Your employment began on <strong>{watchedJobStartDate ? format(new Date(watchedJobStartDate), 'MM/dd/yyyy') : '_____/_____/_____'}</strong> (i.e. the day you undertook your first assignment). Employment with your previous employer does not count as part of your continuous period of employment.</p>

                    <p>You are employed as a Health and Social Care Assistant/Health Care Assistant. As a predominantly domiciliary based worker you will organise your duties from your home base. You will not be entitled to any expenses or payment from Everycare towards the operation of your home-based office.</p>

                    <p>You are employed subject to the satisfactory completion of a three-month probationary period during which time your work will be assessed.</p>

                    <p>The duties of this post are specified in your job description which accompanies these terms of employment. Everycare's full personnel system is found in the Staff Handbooks and Policies & Procedures available on-line at www.everycare.co.uk. Everycare reserves the right to require you to perform other duties and work in various locations or geographical areas from time to time and it is a condition of your employment that you are prepared to do this. You will not be required to work outside the UK for a period or periods exceeding one month.</p>

                    <p>Your salary will be paid at weekly intervals by credit transfer in arrears (except during public holiday weeks). Details of your salary level have been notified to you. You will be paid in respect of the work that you have undertaken as instructed by Everycare whether or not it is paid by the hirer in respect of that work.</p>

                    <p>Your hours of work will be as per your personal variable rota for the week and will be in accordance with the job's requirements. You may be requested to work hours in addition to those published on your personal rota when authorised and as necessitated by the needs of the business. If there is a temporary shortage of work for any reason, we will try to maintain your continuity of employment even if this necessitates placing you on short time working. If you are placed on short time working, your pay will be reduced according to the time actually worked. However there are no guaranteed hours of work attached to this post.</p>

                    <p>Your holiday year begins 1st April and ends 31st March each year. There is an entitlement to paid holidays of 5.6 weeks per annum (pro rata to the hours worked) attached to this post, accruing from the commencement of employment. Payment for Bank Holidays will be made in accordance with rates notified to you.</p>

                    <p>Payment for periods of absence due to authorised sickness will be made in accordance with the current Statutory Sick Pay Schedule. You accept that under our contractual terms with local authorities and private funded service users that we are obliged to provide a continuous service and service users have the right to retain the services of care staff introduced during periods of sickness. We cannot therefore guarantee that assignments with particular service users will continue on your return from sick leave. We therefore cannot guarantee any of your work hours in this circumstance or in the event of loss of a contract, hospitalisation or death of a service user that you are assigned to. In these circumstances we will make every effort to provide you with alternative care work.</p>

                    <p>It is a condition of employment that you maintain a high level of physical and mental fitness whilst employed by Everycare.</p>

                    <p>Everycare rules and personnel policies and procedures form part of your conditions of employment. It is your responsibility to familiarise yourself with these and observe them at all times.</p>

                    <p>Once initial training & assessment has been provided you are required to work for a minimum period of thirteen weeks under this contract. Failure to fulfil this requirement will render you liable to repay &pound;100.00 for training costs to Everycare, which will be deducted from your final salary and / or money in your personal holiday fund. The cost of any future training will be covered by Everycare's Training Agreement and dealt with similarly.</p>

                    <p>All items loaned to you to assist in the carrying out of your duties are the property of Everycare and must be returned on termination of your employment. The final week's salary and any amount of money in your holiday fund will be held at the Everycare office for collection upon the return of all Everycare property, settlement of any money due in accordance with Everycare Training Agreements and repayment of any loans or wages advances made at the organisation's sole discretion.</p>

                    <p>If you wish to raise any grievance relating to your employment, you should do so in accordance with the Grievance Policy & Procedure.</p>

                    <p>If whilst an employee of the Everycare company at the head of this contract you take up employment with another private health & social care organisation, you must inform Everycare immediately. If you enter into any private arrangement to provide services to an Everycare Service User disciplinary action may be considered against you which may include dismissal.</p>

                    <p>It is also a condition of your employment, that for a period of 12 months immediately following the termination of your employment for any reason whatsoever, you will not, whether directly or indirectly as principal, agent, employee, director, partner or otherwise howsoever approach any individual or organisation who has during your period of employment been a customer of an Everycare Franchise or of Everycare (UK) Limited, if the purpose for such an approach is to solicit business which could have been undertaken by them. Neither shall you set up a business in any capacity, in direct competition with an Everycare Franchise or Everycare (UK) Limited within a 5 mile radius of any of their Territories or duties, within the same 12 month period.</p>

                    <p className="font-semibold text-gray-900">In accepting this contract of employment, you acknowledge that you give an undertaking to:</p>

                    <ul className="list-disc space-y-1.5 pl-5">
                      <li>Adhere to all national codes and standards of the industry at all times.</li>
                      <li>Agree to records relating to your employment being kept in accordance with the statutory minimum requirements.</li>
                      <li>That you have given Everycare the authority to store a photographic image of you electronically on Everycare's computer and in your personal file and permit Everycare to pass on a copy if requested by the contractor or service user for identification verification.</li>
                      <li>Abide strictly to Everycare's policies in relation to Confidentiality and Data Protection.</li>
                      <li>Maintain confidentiality of all Everycare copyright documents, materials, intellectual property, operating systems not to disclose their contents or make any copies.</li>
                      <li>Always carry out responsibilities with due regard to Everycare's Equal Opportunities Policy.</li>
                      <li>Always abide by the Health and Safety at Work Act 1974, to ensure that the agreed Health and Safety procedures are carried out to maintain a safe working environment for all including the service user yourself and your colleagues.</li>
                      <li>Notify Everycare management of any employment whatsoever taken up concurrent with your employment at Everycare, not disclosed on your application form.</li>
                      <li>That you have declared all information relating to your criminal record and that you will notify Everycare immediately of any conviction or police caution received whilst employed by Everycare. You will be required to obtain a satisfactory Enhanced Criminal Records Bureau disclosure and have it renewed every three years.</li>
                      <li>That you have never been dismissed from any post involving care services or been involved in any disciplinary process involving gross misconduct or any Safeguarding investigation taken against you, whether or not this resulted in dismissal, that you have not declared and to notify Everycare immediately of any disciplinary or Safeguarding action taking against you whilst employed by Everycare.</li>
                      <li>To inform your insurance company if you are using your car in connection with your job, to provide evidence of adequate insurance to Everycare and inform Everycare of any change in your vehicle insurance status.</li>
                      <li>Notify Everycare immediately of any driving convictions or penalties (except parking) whilst employed by Everycare.</li>
                      <li>That the information provided by yourself concerning your experience, personal details and history and your physical and mental health shall be true and accurate to the best of your knowledge.</li>
                      <li>Notify Everycare of any change in your physical or psychological status and that Everycare may contact your GP and obtain information on your health status if and when required and that if you work regular nights you will comply with the required annual health screening and complete the annual Health Declaration Questionnaire and that you will do so in any case if requested by management.</li>
                      <li>Undergo such supervision / appraisal as Everycare shall supply and specify at its sole discretion.</li>
                      <li>Be prepared to undergo such training as Everycare shall supply and specify at its sole discretion, the cost of which is recoverable from the employee under the terms of the Everycare Training Agreements.</li>
                      <li>To be prepared to perform reasonable on call duties.</li>
                      <li>To be and remain contactable by telephone.</li>
                      <li>That you agree to the recovery from your weekly wages, the weekly agreed amount of any advances or loans that have been made to you at the organisations sole discretion and that any outstanding amount may be recovered from your final weeks pay or remaining money in your Personal Holiday Fund.</li>
                    </ul>

                    <div className="border-t pt-3">
                      <p className="font-semibold text-gray-900">Notice of Termination to be given by Employer</p>
                      <ul className="list-disc space-y-1 pl-5">
                        <li>Under 1 month's service - Nil.</li>
                        <li>1 month up to successful completion of your probationary period - 1 week.</li>
                        <li>On successful completion of probationary period but less than 5 years' service - 4 weeks.</li>
                        <li>5 years service or more - 1 week for each completed year of service to a maximum of 12 weeks after 12 years.</li>
                      </ul>
                    </div>

                    <div className="border-t pt-3">
                      <p className="font-semibold text-gray-900">Notice of Termination to be given by Employee</p>
                      <ul className="list-disc space-y-1 pl-5">
                        <li>Under 1 month's service - 1 week.</li>
                        <li>1 month to successful completion of your probationary period - 1 week.</li>
                        <li>On successful completion of your probationary period - 4 weeks.</li>
                      </ul>
                      <p className="mt-2">We reserve the contractual right to give pay in lieu of all or any part of the above notice by either party.</p>
                    </div>

                    <p className="font-medium text-gray-900">I give an undertaking that I am able to satisfy all the above conditions and agree to all the terms imposed above as a condition of my employment with Everycare. Should it prove that I have made any false statement relative to the above, I accept that this may result in the exercise of Everycare's Disciplinary & Dismissal Policy.</p>

                    <div className="pt-2 text-xs text-gray-500">
                      <p>Also refer to: Policy & Procedure - Employment Rights - Main Terms & Conditions of Employment.</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <FormLabel className="block text-base font-medium">
                    <div>

                    Signature <span className="text-red-500">*</span>
                    </div>
                  </FormLabel>

                  {signatureUrl && !showSignaturePad ? (
                    <div className="flex flex-col items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4 max-w-sm">
                      <img
                        src={signatureUrl}
                        alt="Signature"
                        className="h-16 rounded border border-gray-300 bg-white object-contain"
                      />
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => {
                            setShowSignaturePad(true);
                            setTimeout(() => signatureRef.current?.clear(), 100);
                          }}
                        >
                          <Pencil className="mr-1 h-4 w-4" /> Update Signature
                        </Button>
                       
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="rounded-lg border border-gray-300 bg-white max-w-sm">
                        <SignatureCanvas
                          ref={signatureRef}
                          penColor="black"
                          canvasProps={{
                            width: 400,
                            height: 120,
                            className: 'rounded-lg signature-canvas w-full max-w-sm',
                          }}
                        />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleClearSignature}
                          disabled={signatureSaving}
                        >
                          Clear
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          onClick={handleSaveSignature}
                          disabled={signatureSaving}
                          className="bg-watney text-white hover:bg-watney/90"
                        >
                          {signatureSaving ? (
                            <>
                              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            'Save Signature'
                          )}
                        </Button>
                      </div>
                    </div>
                  )}

                  {form.formState.errors.signatureUrl && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.signatureUrl.message}
                    </p>
                  )}
                </div>

                <div className="mt-8 flex justify-end border-t border-gray-100 pt-6">
                  <Button
                    type="submit"
                    size="lg"
                    disabled={submitting || signatureSaving}
                    className="h-12 w-full min-w-[200px] bg-watney text-base text-white hover:bg-watney/90 md:w-auto"
                  >
                    {submitting ? 'Saving...' : 'Submit'}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
