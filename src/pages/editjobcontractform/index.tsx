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
  Pencil
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '@/lib/axios';
import { BlinkingDots } from '@/components/shared/blinking-dots';
import SignatureCanvas from 'react-signature-canvas';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';

const contractSchema = z.object({
  jobStartDate: z.date({
    required_error: 'Job start date is required'
  }),
  signatureUrl: z.string().min(1, 'Signature is required'),
});

type ContractFormValues = z.infer<typeof contractSchema>;

export default function EditJobContractForm() {
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [contractId, setContractId] = useState<string | null>(null);

  const [signatureUrl, setSignatureUrl] = useState<string>('');
  const [signatureSaving, setSignatureSaving] = useState(false);
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const signatureRef = useRef<SignatureCanvas>(null);

  const navigate = useNavigate();
  const { toast } = useToast();
  const { id } = useParams();

  const form = useForm<ContractFormValues>({
    resolver: zodResolver(contractSchema),
    defaultValues: {
      jobStartDate: undefined,
      signatureUrl: '',
    },
  });

  const todayDate = format(new Date(), 'MM/dd/yyyy');
  const watchedJobStartDate = form.watch('jobStartDate');

  const fetchData = async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const userRes = await axiosInstance.get(`/application-job?applicantId=${id}`);
      setUserData(userRes.data?.data?.result[0]);

      let existingData = null;
      try {
        const dataRes = await axiosInstance.get(`/job-contracts?userId=${id}`);
        existingData = Array.isArray(dataRes.data.data.result)
          ? dataRes.data.data.result[0]
          : (Array.isArray(dataRes.data.data) ? dataRes.data.data[0] : dataRes.data.data);
      } catch (err) {
        console.log('No existing job contract found.');
      }

      if (existingData) {
        setContractId(existingData._id);
        setSignatureUrl(existingData.signatureUrl || '');
        if (existingData.signatureUrl) {
          form.setValue('signatureUrl', existingData.signatureUrl);
        }

        form.reset({
          jobStartDate: existingData.jobStartDate ? new Date(existingData.jobStartDate) : undefined,
          signatureUrl: existingData.signatureUrl || '',
        });
      }

      setLoading(false);
    } catch (error: any) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Failed to load user information.',
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

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

  const onSubmit = async (data: ContractFormValues) => {
    if (!id) return;
    setSubmitting(true);

    try {
      const payload = {
        userId: id,
        name: `${userData?.applicantId?.firstName || ''} ${userData?.applicantId?.initial || ''} ${userData?.applicantId?.lastName || ''}`.trim(),
        jobStartDate: data.jobStartDate,
        signatureUrl: signatureUrl || undefined,
      };

      if (contractId) {
        await axiosInstance.patch(`/job-contracts/${contractId}`, payload);
        toast({
          title: 'Success',
          description: 'Job contract updated successfully.',
        });
      } else {
        await axiosInstance.post('/job-contracts', payload);
        toast({
          title: 'Success',
          description: 'Job contract submitted successfully.',
        });
      }

      await axiosInstance.patch(`/users/${id}`, { jobContractDone: true });
      navigate(-1);
    } catch (error: any) {
      console.error('Error submitting job contract:', error);
      toast({
        title: 'Submission Failed',
        description: error?.response?.data?.message || 'Could not save job contract.',
        variant: 'destructive',
      });
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

  return (
    <div className="flex min-h-screen justify-center">
      <div className="w-full">
        <Card className="overflow-hidden border-0 shadow-xl">
          <CardHeader className="border-b border-gray-100 bg-white pb-6 pt-8">
            <CardTitle className="text-2xl font-bold text-watney">
              <div className="flex flex-row items-center justify-between">
                <div>Job Contract</div>
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
              Edit the job contract details.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-4 md:p-8">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
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

                        Job Start Date <span className="text-red-500">*</span>
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

            <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4 md:p-6">
              <div className="space-y-4 text-sm text-gray-600">
                <h3 className="text-lg font-semibold text-gray-900">Contract of Employment Statement & Written Particulars of Main Terms of Employment</h3>
                <p className="font-medium text-gray-900">{userData?.jobId?.jobTitle}</p>

                <p>This statement dated <strong>{todayDate}</strong> meets the requirements of the Employment Rights Act 1996. It is the Statement of Initial Employment Particulars relating to the Contract of Employment of the person named below and supersedes any previous such statements or contracts.</p>

                <p><strong>Name of Employee:</strong> {userData?.applicantId?.firstName} {userData?.applicantId?.initial} {userData?.applicantId?.lastName}</p>

                <p><strong>Name of Employer:</strong> SMS Health Care Services Limited T/A Everycare Romford</p>

                <p><strong>Address of Employer:</strong> 37 High Street, Romford, Essex, RM1 1JL</p>

                <p><strong>Start date:</strong> <strong>{watchedJobStartDate ? format(new Date(watchedJobStartDate), 'MM/dd/yyyy') : '_____/_____/_____'}</strong></p>

                <p><strong>Job title:</strong> {userData?.jobId?.jobTitle}</p>

                <p>The Company may from time to time require you to undertake additional or other duties as necessary to meet the needs of the business on a short-term basis e.g. holiday or sickness cover.</p>

                <h4 className="font-semibold text-gray-900">Probationary period</h4>
                <p>New employees join the Company on a six-month probationary period.</p>
                <p>During and/or at the end of your probationary period you may be asked to attend employment reviews to discuss your overall work performance. Absence, time keeping and general attitude may also be considered. If the Company is satisfied that you have reached the required standards your permanent status will be confirmed.</p>
                <p>If you have not reached the required standards, your employment will be terminated with the required notice.</p>
                <p>The Company reserves the right in borderline cases to extend the probationary period, in the hope that a further period will enable you to reach the required standard. A subsequent employment review will be held and a decision made. Your employment will then either be confirmed or terminated with the required notice.</p>

                <h4 className="font-semibold text-gray-900">Continuous employment</h4>
                <p>The date on which your continuous employment began is the same as shown above.</p>

                <h4 className="font-semibold text-gray-900">Place of Work</h4>
                <p>Your normal place of work is SMS Health Care Services Limited T/A Everycare Romford, 37 High Street, Romford, Essex, RM1 1JL. You may be required to work in other locations to meet the needs of the business.</p>

                <h4 className="font-semibold text-gray-900">Pay Arrangements</h4>
                <p>Your rate of pay is the amount notified to you separately.</p>
                <p>Payment is made monthly, in arrears, directly into your bank/building society. (Payable by 10th of every month.)</p>
                <p>If a mistake is made in the payment of any monies due, the Company expects to be notified immediately. The error will normally be corrected at the next available opportunity.</p>

                <h4 className="font-semibold text-gray-900">Hours of work</h4>
                <p>Your normal hours of work a week shall be as per your contract. Your shifts each week shall be determined by the Manager and published on the weekly rota.</p>
                <p>You will be entitled to an unpaid break of 15 minutes if you work in excess of 3.15 hours, 30 minutes if you work in excess of 4.45 hours, 45 minutes if you work seven hours or more and one hour if you work eight hours or more a day. These normal hours of work may be varied to meet the needs of the business.</p>
                <p>You may be required to work a reasonable amount of overtime hours as directed by the Company. This may include the need to work shifts, unsocial hours and weekends.</p>

                <h4 className="font-semibold text-gray-900">Holiday Entitlement</h4>
                <p>The holiday year runs from 1st April to 31st March. You are entitled to 5.6 weeks' holiday a year, inclusive of any bank/public holidays that you may be permitted to take, calculated at the rate of 1/52nd of the annual entitlement for each complete week of service remaining in the current holiday year.</p>
                <p>During your first year of service, however, your entitlement to take holidays will accrue on the first day of each month of that year at the rate of 1/12th of the annual entitlement. Where the current accrual includes a fraction of a day other than a half-day, the fraction will be treated as a half-day if it is less than a half-day and as a whole day if it is more than a half-day.</p>
                <p>There is no additional entitlement to bank/public holidays.</p>
                <p>You will be required to work on any bank/public holiday that falls on your rostered working days.</p>
                <p>A more detailed explanation is contained in the Employee Handbook.</p>

                <h4 className="font-semibold text-gray-900">Holiday Pay</h4>
                <p>Payment for holidays will be at your normal basic rate under your terms and conditions of employment for your normal hours of work.</p>
                <p>On termination of employment holidays will be calculated in proportion to the full entitlement. If you have taken less than this entitlement the surplus holiday pay will be added to your final pay. If you have taken more than this entitlement the excess holiday pay will be deducted from your final pay.</p>

                <h4 className="font-semibold text-gray-900">Sickness Absences</h4>
                <p>The Company is required to pay Statutory Sick Pay for certain periods of sickness absence. Payment may be made to eligible employees for periods of absence of four days or more. There is a maximum period of 28 weeks payment in one period of incapacity for work.</p>
                <p>A more detailed explanation is contained in the Employee Handbook.</p>

                <h4 className="font-semibold text-gray-900">Disciplinary Procedure and Rules</h4>
                <p>Should your conduct or performance fall below the standards required then disciplinary action may be taken. This procedure is designed to help and encourage employees to achieve and maintain the Company's standards of conduct and performance and should be looked upon as a corrective process.</p>
                <p>A more detailed explanation of the procedure and rules is contained in the Employee Handbook.</p>

                <h4 className="font-semibold text-gray-900">Disciplinary Appeal Procedure</h4>
                <p>You have the right to appeal at any stage in the disciplinary procedure if you are dissatisfied either with a disciplinary decision made against you or the level of penalty imposed. You should do this in writing to the immediate superior of the person who took the disciplinary action within five days of receiving your confirmation of discipline letter.</p>
                <p>A more detailed explanation of the procedure is contained in the Employee Handbook.</p>

                <h4 className="font-semibold text-gray-900">Grievance Procedure</h4>
                <p>If you have any grievance relating to your employment, you should raise it with your Line Manager in the first instance. If you want the grievance to be dealt with formally, you must raise it in writing.</p>
                <p>A more detailed explanation of the formal procedure is contained in the Employee Handbook.</p>

                <h4 className="font-semibold text-gray-900">Pension Scheme</h4>
                <p>The Company offers access to a Stakeholder pension scheme that you are entitled to join on completion of three months' service. A contracting out certificate is not in force.</p>

                <h4 className="font-semibold text-gray-900">Collective Agreements</h4>
                <p>There are no collective agreements directly affecting your terms and conditions of employment.</p>

                <h4 className="font-semibold text-gray-900">Notice Periods</h4>
                <p className="font-semibold text-gray-900">NOTICE OF TERMINATION TO BE GIVEN BY EMPLOYER</p>
                <ul className="list-disc space-y-1 pl-5">
                  <li>Under 1 month's service - Nil.</li>
                  <li>1 month up to successful completion of your probationary period - 1 week.</li>
                  <li>On successful completion of probationary period but less than 5 years' service - 4 weeks.</li>
                  <li>5 years' service or more - 1 week for each completed year of service to a maximum of 12 weeks after 12 years.</li>
                </ul>
                <p className="font-semibold text-gray-900">NOTICE OF TERMINATION TO BE GIVEN BY EMPLOYEE</p>
                <ul className="list-disc space-y-1 pl-5">
                  <li>Under 1 month's service - 1 week.</li>
                  <li>1 month to successful completion of your probationary period - 1 week.</li>
                  <li>On successful completion of your probationary period - 4 weeks.</li>
                </ul>
                <p>We reserve the contractual right to give pay in lieu of all or any part of the above notice by either party.</p>

                <h4 className="font-semibold text-gray-900">General</h4>
                <p>If you leave without giving and working your full notice, any additional cost in covering your duties during the notice period not worked will be deducted from any termination pay due to you.</p>
                <p>The Company may require you to take some or all of any outstanding holiday entitlement that you may have during your notice period.</p>

                <h4 className="font-semibold text-gray-900">Pay In Lieu Of Notice</h4>
                <p>It is agreed that the Company may make a payment in lieu of notice to you. You shall not be entitled to any benefit other than pay or money in lieu of such benefits in respect of any period for which payment in lieu has been made.</p>

                <h4 className="font-semibold text-gray-900">Garden Leave</h4>
                <p>The Company reserves the right to require you to remain away from your place of employment for all or part of your notice period, with or without work, whether you or the Company gives notice. You must accept that whilst still employed by the Company on notice either at home or on the Company's premises you must not work for any other company, firm, person or business.</p>

                <h4 className="font-semibold text-gray-900">Lay Off / Short Time Working</h4>
                <p>The Company reserves the right to lay off employees or to introduce short-time working should this be required by a downturn in work or other needs of the business.</p>
                <p>A more detailed explanation of the procedure is shown in the Employee Handbook.</p>

                <h4 className="font-semibold text-gray-900">Confidentiality</h4>
                <p>For the purposes of this section "confidential information" shall include (without limitation) information concerning any unpublished financial, trading or operational information, including particulars of processes, designs, products, and statistics in relation to: the Company, any of the Company's customers, suppliers, agents or distributors so far as it has come to your knowledge by reason of your employment.</p>
                <p>You will not (except in the proper performance of your job) either during your employment or at any time after its termination for whatever reason: disclose any confidential information to any person, turn such confidential information to your own account.</p>
                <p>You will use your best efforts to prevent: the publication or disclosure of confidential information, any misuse of such information.</p>
                <p>You must obtain permission from the Managing Director before agreeing to give any lecture, press interview, or to publish any article, which would give details of the Company's business.</p>

                <h4 className="font-semibold text-gray-900">Return of Company Property</h4>
                <p>On the termination of your employment for whatever reason, you must return all Company property in your possession or for which you have responsibility. Failure to return all such items will result in the cost of the unreturned items being deducted from any monies outstanding to you. This is an express written term of your contract of employment.</p>

                <h4 className="font-semibold text-gray-900">Non-Solicitation Agreement</h4>
                <p>You shall not for a period of six months from the termination of your employment (and whether directly or indirectly solely or jointly and whether on your own behalf or on behalf of any other person, firm or company), solicit, endeavour to entice or accept the custom of any person who at any time during the period of 12 months prior to the termination of your employment has been a customer or client of the Company and with whom you had business dealings on behalf of the Company, where such solicitation enticement or acceptance of custom relates to the provision of services similar to those which are, could be, or have been, provided by the Company.</p>
                <p>You shall not for a period of six months following the termination of your employment (either on your own behalf or for any other person, firm or company and whether directly or indirectly) approach any other employee of the Company who has over 12 months continuous employment with the Company, with a view to encouraging him or her to leave the Company and/or employing him or her.</p>

                <h4 className="font-semibold text-gray-900">Restrictive Covenant</h4>
                <p>You agree that you will not during the period of six months following the termination of your employment within a radius of 5 miles of any premises of the Company at which you have during the period of 12 months prior to the termination of your employment been employed, and whether directly or indirectly solely or jointly and whether on your own behalf or on behalf of any other third person, firm or company, be engaged in or concerned with any trade or business which provides services in competition with the services carried out by the Company at the date of termination of your employment.</p>

                <h4 className="font-semibold text-gray-900">Conflict of Interest</h4>
                <p>During your employment you will be expected to devote the whole of your working time and attention to the Company's business and to use your best endeavours to promote the Company's general interest.</p>
                <p>If required to do so you must provide details of any relationships with any of the Company's customers or suppliers and comply with any reasonable instructions given to you by the Company on such relationships.</p>

                <h4 className="font-semibold text-gray-900">Other terms and conditions of employment</h4>
                <p>Any agreed amendments that materially alter the terms and conditions contained in your contract will be notified to you in writing and shall take precedence over the terms in this statement.</p>

                <p className="font-medium text-gray-900">I have read, understood and am willing to abide by the terms and conditions laid down in the Employee Handbook and accept that they form an integral part of this Contract of Employment.</p>


              </div>
            </div>

                <div className="space-y-2">
                  <FormLabel className="block text-base font-medium">
                    Signature <span className="text-red-500">*</span>
                  </FormLabel>

                  {signatureUrl && !showSignaturePad ? (
                    <div className="flex flex-col items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
                      <img
                        src={signatureUrl}
                        alt="Signature"
                        className="h-16 rounded border border-gray-300 bg-white object-contain"
                      />
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="outline"
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
                      <div className="rounded-lg border border-gray-300 bg-white">
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

                <div className="flex justify-end border-t border-gray-100 pt-6">
                  <Button
                    type="submit"
                    size="lg"
                    disabled={submitting || signatureSaving}
                    className="h-12 w-full min-w-[200px] bg-watney text-base text-white hover:bg-watney/90 md:w-auto"
                  >
                    {submitting ? 'Saving...' : contractId ? 'Update' : 'Submit'}
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
