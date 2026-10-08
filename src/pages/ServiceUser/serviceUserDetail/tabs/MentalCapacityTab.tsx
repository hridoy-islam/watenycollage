import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '@/lib/axios';
import { BlinkingDots } from '@/components/shared/blinking-dots';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CustomDatePicker } from '@/components/shared/CustomDatePicker';
import { SignatureField } from '../components/SignatureField';
import { Save, ClipboardCheck } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

type YesNo = 'yes' | 'no';

interface RelevantDomains {
  washingAndShowering: YesNo | '';
  dressingAndGrooming: YesNo | '';
  supportUsingCommode: YesNo | '';
  nutrition: YesNo | '';
  mobility: YesNo | '';
  pressureCareAndPositionChange: YesNo | '';
  otherMedications: YesNo | '';
}

interface MentalCapacityForm {
  serviceUserName: string;
  address: string;
  dateOfFirstAssessment: Date | null;
  hasBrainImpairmentOrDisturbance: YesNo | '';
  relevantDomains: RelevantDomains;
  additionalDetail: string;
  purposeExplained: string;
  understandInformation: YesNo | '';
  retainInformation: YesNo | '';
  discussProsCons: YesNo | '';
  communicateDecision: YesNo | '';
  overallOutcomeHasCapacity: YesNo | '';
  bestInterestAction: string;
  reviewDate: Date | null;
  assessorName: string;
  assessorSignatureUrl: string;
}

const emptyDomains = (): RelevantDomains => ({
  washingAndShowering: '',
  dressingAndGrooming: '',
  supportUsingCommode: '',
  nutrition: '',
  mobility: '',
  pressureCareAndPositionChange: '',
  otherMedications: ''
});

const emptyForm = (): MentalCapacityForm => ({
  serviceUserName: '',
  address: '',
  dateOfFirstAssessment: null,
  hasBrainImpairmentOrDisturbance: '',
  relevantDomains: emptyDomains(),
  additionalDetail: '',
  purposeExplained: '',
  understandInformation: '',
  retainInformation: '',
  discussProsCons: '',
  communicateDecision: '',
  overallOutcomeHasCapacity: '',
  bestInterestAction: '',
  reviewDate: null,
  assessorName: '',
  assessorSignatureUrl: ''
});

const mapToForm = (item: any): MentalCapacityForm => ({
  serviceUserName: item.serviceUserName || '',
  address: item.address || '',
  dateOfFirstAssessment: item.dateOfFirstAssessment
    ? new Date(item.dateOfFirstAssessment)
    : null,
  hasBrainImpairmentOrDisturbance: item.hasBrainImpairmentOrDisturbance || '',
  relevantDomains: {
    washingAndShowering: item.relevantDomains?.washingAndShowering || '',
    dressingAndGrooming: item.relevantDomains?.dressingAndGrooming || '',
    supportUsingCommode: item.relevantDomains?.supportUsingCommode || '',
    nutrition: item.relevantDomains?.nutrition || '',
    mobility: item.relevantDomains?.mobility || '',
    pressureCareAndPositionChange:
      item.relevantDomains?.pressureCareAndPositionChange || '',
    otherMedications: item.relevantDomains?.otherMedications || ''
  },
  additionalDetail: item.additionalDetail || '',
  purposeExplained: item.purposeExplained || '',
  understandInformation: item.understandInformation || '',
  retainInformation: item.retainInformation || '',
  discussProsCons: item.discussProsCons || '',
  communicateDecision: item.communicateDecision || '',
  overallOutcomeHasCapacity: item.overallOutcomeHasCapacity || '',
  bestInterestAction: item.bestInterestAction || '',
  reviewDate: item.reviewDate ? new Date(item.reviewDate) : null,
  assessorName: item.assessorName || '',
  assessorSignatureUrl: item.assessorSignatureUrl || ''
});

const toISOString = (date: Date | null) =>
  date
    ? new Date(
        Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
      ).toISOString()
    : undefined;

const getServiceUserName = (user: any) =>
  [user?.firstName, user?.middleInitial, user?.lastName]
    .filter(Boolean)
    .join(' ') || user?.name || '';

const withUserFallback = (
  form: MentalCapacityForm,
  user: any
): MentalCapacityForm => ({
  ...form,
  serviceUserName: form.serviceUserName || getServiceUserName(user),
  address: form.address || user?.address || ''
});

const domainLabels: { key: keyof RelevantDomains; label: string }[] = [
  { key: 'washingAndShowering', label: 'Washing and Showering' },
  { key: 'dressingAndGrooming', label: 'Dressing and Grooming' },
  { key: 'supportUsingCommode', label: 'Support in using the commode' },
  { key: 'nutrition', label: 'Nutrition' },
  { key: 'mobility', label: 'Mobility' },
  { key: 'pressureCareAndPositionChange', label: 'Pressure care and change in position' },
  { key: 'otherMedications', label: 'Other (Medications)' }
];

const capacityQuestions: {
  key: keyof Pick<
    MentalCapacityForm,
    'understandInformation' | 'retainInformation' | 'discussProsCons' | 'communicateDecision'
  >;
  label: string;
}[] = [
  { key: 'understandInformation', label: 'Understand the information relevant to the decision' },
  { key: 'retainInformation', label: 'Retain this information long enough to make a decision' },
  { key: 'discussProsCons', label: 'Discuss the pros and cons of this decision with you, i.e. process the given information' },
  { key: 'communicateDecision', label: 'Communicate their decision' }
];

function YesNoCheckbox({
  value,
  onChange,
  label
}: {
  value: YesNo | '';
  onChange: (value: YesNo | '') => void;
  label: string;
}) {
  const setValue = (v: YesNo, checked: boolean) => {
    if (checked) onChange(v);
    else if (value === v) onChange('');
  };

  return (
    <div className="flex items-center gap-6">
      <div className="flex items-center gap-2">
        <Checkbox
          id={`${label}-yes`}
          checked={value === 'yes'}
          onCheckedChange={(c) => setValue('yes', !!c)}
        />
        <Label htmlFor={`${label}-yes`} className="cursor-pointer">
          Yes
        </Label>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox
          id={`${label}-no`}
          checked={value === 'no'}
          onCheckedChange={(c) => setValue('no', !!c)}
        />
        <Label htmlFor={`${label}-no`} className="cursor-pointer">
          No
        </Label>
      </div>
    </div>
  );
}

export const MentalCapacityTab: React.FC = () => {
  const { sid } = useParams<{ sid: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [form, setForm] = useState<MentalCapacityForm>(emptyForm());
  const {toast}= useToast();
  const setField = <K extends keyof MentalCapacityForm>(
    key: K,
    value: MentalCapacityForm[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const setDomain = (key: keyof RelevantDomains, value: YesNo | '') => {
    setForm((prev) => ({
      ...prev,
      relevantDomains: { ...prev.relevantDomains, [key]: value }
    }));
  };

  const fetchAssessment = useCallback(async () => {
    if (!sid) return;
    try {
      const [assessmentRes, userRes] = await Promise.all([
        axiosInstance.get('/mental-capacity', {
          params: { serviceUserId: sid, limit: 1 }
        }),
        axiosInstance.get(`/users/${sid}`)
      ]);
      const user = userRes.data?.data;
      setUserData(user);
      const result = assessmentRes.data?.data?.result || [];
      if (result.length > 0) {
        setAssessmentId(result[0]._id);
        setForm(withUserFallback(mapToForm(result[0]), user));
        setShowForm(true);
      } else {
        setAssessmentId(null);
        setForm(withUserFallback(emptyForm(), user));
        setShowForm(false);
      }
    } catch (error) {
      console.error('Failed to fetch mental capacity assessment:', error);
    } finally {
      setLoading(false);
    }
  }, [sid]);

  useEffect(() => {
    fetchAssessment();
  }, [fetchAssessment]);

  const handleSave = async () => {
    if (!sid) return;
    setSaving(true);
    try {
      const payload = {
        serviceUserId: sid,
        serviceUserName: form.serviceUserName,
        address: form.address,
        dateOfFirstAssessment: toISOString(form.dateOfFirstAssessment),
        hasBrainImpairmentOrDisturbance: form.hasBrainImpairmentOrDisturbance,
        relevantDomains: form.relevantDomains,
        additionalDetail: form.additionalDetail,
        purposeExplained: form.purposeExplained,
        understandInformation: form.understandInformation,
        retainInformation: form.retainInformation,
        discussProsCons: form.discussProsCons,
        communicateDecision: form.communicateDecision,
        overallOutcomeHasCapacity: form.overallOutcomeHasCapacity,
        bestInterestAction: form.bestInterestAction,
        reviewDate: toISOString(form.reviewDate),
        assessorName: form.assessorName,
        assessorSignatureUrl: form.assessorSignatureUrl
      };

      if (assessmentId) {
        await axiosInstance.patch(`/mental-capacity/${assessmentId}`, payload);
        toast({
          title: 'Success!',
          description: 'Mental Capacity assessment updated successfully',
          className: 'bg-watney border-none text-white'
        });
      } else {
        const res = await axiosInstance.post('/mental-capacity', payload);
        setAssessmentId(res.data?.data?._id || null);
        toast({
          title: 'Success!',
          description: 'Mental Capacity assessment created successfully',
          className: 'bg-watney border-none text-white'
        });
      }
    } catch (error: any) {
      console.error('Failed to save mental capacity assessment:', error);
      toast({
        title: 'Error',
        description:
          error?.response?.data?.message || 'Failed to save Mental Capacity assessment',
        className: 'bg-red-500 border-none text-white'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <BlinkingDots size="large" color="bg-watney" />
      </div>
    );
  }

  if (!showForm) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center gap-4 py-16">
          <ClipboardCheck className="h-12 w-12 text-gray-300" />
          <p className="text-gray-500">
            No Mental Capacity assessment exists for this service user yet.
          </p>
          <Button
            onClick={() => {
              setForm(withUserFallback(emptyForm(), userData));
              setShowForm(true);
            }}
            variant="default"
          >
            <Save className="mr-2 h-4 w-4" />
            Create Mental Capacity Assessment
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Assessment of Mental Capacity</CardTitle>
        <Button onClick={handleSave} disabled={saving} variant="default">
          <Save className="mr-2 h-4 w-4" />
          {saving ? 'Saving...' : 'Save'}
        </Button>
      </CardHeader>
      <CardContent className="space-y-8">
        <section className="space-y-4">
          <h3 className="text-lg font-semibold">Service User</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Name of the Service User</Label>
              <Input
                value={form.serviceUserName}
                onChange={(e) => setField('serviceUserName', e.target.value)}
                placeholder="Service user name"
              />
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Input
                value={form.address}
                onChange={(e) => setField('address', e.target.value)}
                placeholder="Address"
              />
            </div>
            <div className="space-y-2">
              <Label>Date of First Assessment</Label>
              <CustomDatePicker
                selected={form.dateOfFirstAssessment}
                onChange={(date) => setField('dateOfFirstAssessment', date)}
                placeholder="Select date"
              />
            </div>
          </div>
        </section>

        <Separator />

        <section className="space-y-4">
          <h3 className="text-lg font-semibold">
            Does the Service User have an impairment of, or a
            disturbance in the functioning of, the brain?
          </h3>
          <YesNoCheckbox
            value={form.hasBrainImpairmentOrDisturbance}
            onChange={(v) => setField('hasBrainImpairmentOrDisturbance', v)}
            label="brain-impairment"
          />
        </section>

        <Separator />

        <section className="space-y-4">
          <h3 className="text-lg font-semibold">
            Relevant Domains (please tick as appropriate)
          </h3>
          {domainLabels.map((domain) => (
            <div
              key={domain.key}
              className="flex flex-col justify-between gap-2 rounded-lg border border-gray-200 p-3 md:flex-row md:items-center"
            >
              <span className="text-sm font-medium text-gray-700">
                {domain.label}
              </span>
              <YesNoCheckbox
                value={form.relevantDomains[domain.key]}
                onChange={(v) => setDomain(domain.key, v)}
                label={`domain-${domain.key}`}
              />
            </div>
          ))}
        </section>

        <Separator />

        <section className="space-y-4">
          <h3 className="text-lg font-semibold">4. Additional Detail (please be as thorough as possible) relating to the exact decision the Service User is being assessed for:</h3>
          <Textarea
            value={form.additionalDetail}
            onChange={(e) => setField('additionalDetail', e.target.value)}
            placeholder="Please be as thorough as possible relating to the exact decision the Service User is being assessed for"
            rows={5}
          />
        </section>

        <Separator />

        <section className="space-y-4">
          <h3 className="text-lg font-semibold">
            5. Explain to the Service User the purpose of the assessment,
            including the decision that needs to be made or action that needs to
            be taken. Explain all available options and the pros and cons of
            each.
          </h3>
          {/* <Textarea
            value={form.purposeExplained}
            onChange={(e) => setField('purposeExplained', e.target.value)}
            placeholder="Explanation given"
            rows={4}
          /> */}
          <p className="text-sm font-semibold text-gray-700">
            Can the Service User:
          </p>
          {capacityQuestions.map((question) => (
            <div
              key={question.key}
              className="flex flex-col justify-between gap-2 rounded-lg border border-gray-200 p-3 md:flex-row md:items-center"
            >
              <span className="text-sm font-medium text-gray-700">
                {question.label}
              </span>
              <YesNoCheckbox
                value={form[question.key]}
                onChange={(v) => setField(question.key, v)}
                label={`q-${question.key}`}
              />
            </div>
          ))}
          <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-700">
            Note: if the answer to one or more of the questions above is "No"
            then the person lacks capacity to make this decision.
          </p>
        </section>

        <Separator />

        <section className="space-y-4">
          <h3 className="text-lg font-semibold">Overall Outcome</h3>
          <div className="flex flex-col justify-between gap-2 rounded-lg border border-gray-200 p-3 md:flex-row md:items-center">
            <span className="text-sm font-medium text-gray-700">
              This person has capacity to make this specific decision for
              themselves.
            </span>
            <YesNoCheckbox
              value={form.overallOutcomeHasCapacity}
              onChange={(v) => setField('overallOutcomeHasCapacity', v)}
              label="overall-outcome"
            />
          </div>
        </section>

        <Separator />

        <section className="space-y-4">
          <h3 className="text-lg font-semibold">
            6. Detail below the action you will be taking, evidencing why this
            is in the person's best interest. Also make a note of who else you
            have consulted and what their feelings were.
          </h3>
          <Textarea
            value={form.bestInterestAction}
            onChange={(e) => setField('bestInterestAction', e.target.value)}
            placeholder="Action in the person's best interest"
            rows={5}
          />
        </section>

        <Separator />

        <section className="space-y-4">
          <h3 className="text-lg font-semibold">Review & Sign-off</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Assessment to be reviewed on</Label>
              <CustomDatePicker
                selected={form.reviewDate}
                onChange={(date) => setField('reviewDate', date)}
                placeholder="Select review date"
              />
            </div>
            <div className="space-y-2">
              <Label>Name of the Assessor</Label>
              <Input
                value={form.assessorName}
                onChange={(e) => setField('assessorName', e.target.value)}
                placeholder="Assessor name"
              />
            </div>
          </div>

          <SignatureField
            label="Signature of Assessor"
            entityId={sid}
            signatureUrl={form.assessorSignatureUrl}
            onSaved={(url) => setField('assessorSignatureUrl', url)}
          />
        </section>
      </CardContent>
    </Card>
  );
};
