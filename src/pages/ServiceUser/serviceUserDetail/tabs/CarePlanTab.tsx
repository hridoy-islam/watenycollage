import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '@/lib/axios';
import { BlinkingDots } from '@/components/shared/blinking-dots';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CustomDatePicker } from '@/components/shared/CustomDatePicker';
import { SignatureField } from '../components/SignatureField';
import { Plus, Trash2, Save, FileText } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface ScheduleEntry {
  day: string;
  time: string;
  hoursNo: string;
  task: string;
}

interface CarePlanForm {
  serviceUserName: string;
  preferredTermOfAddress: string;
  idNumber: string;
  serviceStartDate: Date | null;
  address: string;
  dob: Date | null;
  caseManager: string;
  schedule: ScheduleEntry[];
  agreedByServiceUserName: string;
  agreedByCaseManagerName: string;
  serviceUserSignatureUrl: string;
  caseManagerSignatureUrl: string;
  serviceUserAgreedDate: Date | null;
  caseManagerAgreedDate: Date | null;
}

const emptyForm = (): CarePlanForm => ({
  serviceUserName: '',
  preferredTermOfAddress: '',
  idNumber: '',
  serviceStartDate: null,
  address: '',
  dob: null,
  caseManager: '',
  schedule: [{ day: '', time: '', hoursNo: '', task: '' }],
  agreedByServiceUserName: '',
  agreedByCaseManagerName: '',
  serviceUserSignatureUrl: '',
  caseManagerSignatureUrl: '',
  serviceUserAgreedDate: null,
  caseManagerAgreedDate: null
});

const mapToForm = (item: any): CarePlanForm => ({
  serviceUserName: item.serviceUserName || '',
  preferredTermOfAddress: item.preferredTermOfAddress || '',
  idNumber: item.idNumber || '',
  serviceStartDate: item.serviceStartDate ? new Date(item.serviceStartDate) : null,
  address: item.address || '',
  dob: item.dob ? new Date(item.dob) : null,
  caseManager: item.caseManager || '',
  schedule:
    item.schedule && item.schedule.length > 0
      ? item.schedule.map((s: any) => ({
          day: s.day || '',
          time: s.time || '',
          hoursNo: s.hoursNo || '',
          task: s.task || ''
        }))
      : [{ day: '', time: '', hoursNo: '', task: '' }],
  agreedByServiceUserName: item.agreedByServiceUserName || '',
  agreedByCaseManagerName: item.agreedByCaseManagerName || '',
  serviceUserSignatureUrl: item.serviceUserSignatureUrl || '',
  caseManagerSignatureUrl: item.caseManagerSignatureUrl || '',
  serviceUserAgreedDate: item.serviceUserAgreedDate
    ? new Date(item.serviceUserAgreedDate)
    : null,
  caseManagerAgreedDate: item.caseManagerAgreedDate
    ? new Date(item.caseManagerAgreedDate)
    : null
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

const withUserFallback = (form: CarePlanForm, user: any): CarePlanForm => ({
  ...form,
  serviceUserName: form.serviceUserName || getServiceUserName(user),
  address: form.address || user?.address || '',
  dob: form.dob || (user?.dateOfBirth ? new Date(user.dateOfBirth) : null)
});

export const CarePlanTab: React.FC = () => {
  const { sid } = useParams<{ sid: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [carePlanId, setCarePlanId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [form, setForm] = useState<CarePlanForm>(emptyForm());
  const {toast}= useToast();

  const setField = <K extends keyof CarePlanForm>(
    key: K,
    value: CarePlanForm[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateScheduleRow = (
    index: number,
    field: keyof ScheduleEntry,
    value: string
  ) => {
    setForm((prev) => ({
      ...prev,
      schedule: prev.schedule.map((row, i) =>
        i === index ? { ...row, [field]: value } : row
      )
    }));
  };

  const addScheduleRow = () => {
    setForm((prev) => ({
      ...prev,
      schedule: [...prev.schedule, { day: '', time: '', hoursNo: '', task: '' }]
    }));
  };

  const removeScheduleRow = (index: number) => {
    setForm((prev) => ({
      ...prev,
      schedule: prev.schedule.filter((_, i) => i !== index)
    }));
  };

  const fetchCarePlan = useCallback(async () => {
    if (!sid) return;
    try {
      const [carePlanRes, userRes] = await Promise.all([
        axiosInstance.get('/careplan', {
          params: { serviceUserId: sid, limit: 1 }
        }),
        axiosInstance.get(`/users/${sid}`)
      ]);
      const user = userRes.data?.data;
      setUserData(user);
      const result = carePlanRes.data?.data?.result || [];
      if (result.length > 0) {
        setCarePlanId(result[0]._id);
        setForm(withUserFallback(mapToForm(result[0]), user));
        setShowForm(true);
      } else {
        setCarePlanId(null);
        setForm(withUserFallback(emptyForm(), user));
        setShowForm(false);
      }
    } catch (error) {
      console.error('Failed to fetch care plan:', error);
    } finally {
      setLoading(false);
    }
  }, [sid]);

  useEffect(() => {
    fetchCarePlan();
  }, [fetchCarePlan]);

  const handleSave = async () => {
    if (!sid) return;
    setSaving(true);
    try {
      const payload = {
        serviceUserId: sid,
        serviceUserName: form.serviceUserName,
        preferredTermOfAddress: form.preferredTermOfAddress,
        idNumber: form.idNumber,
        serviceStartDate: toISOString(form.serviceStartDate),
        address: form.address,
        dob: toISOString(form.dob),
        caseManager: form.caseManager,
        schedule: form.schedule,
        agreedByServiceUserName: form.agreedByServiceUserName,
        agreedByCaseManagerName: form.agreedByCaseManagerName,
        serviceUserSignatureUrl: form.serviceUserSignatureUrl,
        caseManagerSignatureUrl: form.caseManagerSignatureUrl,
        serviceUserAgreedDate: toISOString(form.serviceUserAgreedDate),
        caseManagerAgreedDate: toISOString(form.caseManagerAgreedDate)
      };

      if (carePlanId) {
        await axiosInstance.patch(`/careplan/${carePlanId}`, payload);
        toast({
          title: 'Success!',
          description: 'Care Plan updated successfully',
          className: 'bg-watney border-none text-white'
        });
      } else {
        const res = await axiosInstance.post('/careplan', payload);
        setCarePlanId(res.data?.data?._id || null);
        toast({
          title: 'Success!',
          description: 'Care Plan created successfully',
          className: 'bg-watney border-none text-white'
        });
      }
    } catch (error: any) {
      console.error('Failed to save care plan:', error);
      toast({
        title: 'Error',
        description:
          error?.response?.data?.message || 'Failed to save Care Plan',
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
          <FileText className="h-12 w-12 text-gray-300" />
          <p className="text-gray-500">
            No Care Plan exists for this service user yet.
          </p>
          <Button
            onClick={() => {
              setForm(withUserFallback(emptyForm(), userData));
              setShowForm(true);
            }}
            variant="default"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Care Plan
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Care Plan</CardTitle>
        <Button onClick={handleSave} disabled={saving} variant="default">
          <Save className="mr-2 h-4 w-4" />
          {saving ? 'Saving...' : 'Save'}
        </Button>
      </CardHeader>
      <CardContent className="space-y-8">
        <section className="space-y-4">
          <h3 className="text-lg font-semibold">Service User Details</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Service User Name</Label>
              <Input
                value={form.serviceUserName}
                onChange={(e) => setField('serviceUserName', e.target.value)}
                placeholder="Service user name"
              />
            </div>
            <div className="space-y-2">
              <Label>Preferred Term of Address</Label>
              <Input
                value={form.preferredTermOfAddress}
                onChange={(e) => setField('preferredTermOfAddress', e.target.value)}
                placeholder="Preferred term of address"
              />
            </div>
            <div className="space-y-2">
              <Label>ID Number</Label>
              <Input
                value={form.idNumber}
                onChange={(e) => setField('idNumber', e.target.value)}
                placeholder="ID number"
              />
            </div>
            <div className="space-y-2">
              <Label>Service Start Date</Label>
              <CustomDatePicker
                selected={form.serviceStartDate}
                onChange={(date) => setField('serviceStartDate', date)}
                placeholder="Select start date"
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
              <Label>Date of Birth</Label>
              <CustomDatePicker
                selected={form.dob}
                onChange={(date) => setField('dob', date)}
                placeholder="Select date of birth"
              />
            </div>
            <div className="space-y-2">
              <Label>Case Manager</Label>
              <Input
                value={form.caseManager}
                onChange={(e) => setField('caseManager', e.target.value)}
                placeholder="Case manager"
              />
            </div>
          </div>
        </section>

        <Separator />

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Service Delivery Schedule</h3>
            <Button onClick={addScheduleRow} variant="outline">
              <Plus className="mr-1 h-4 w-4" />
              Add Row
            </Button>
          </div>
          {form.schedule.map((row, index) => (
            <div
              key={index}
              className="relative space-y-3 rounded-lg border border-gray-200 p-3"
            >
              <Button
                variant="destructive"
                size="icon"
                onClick={() => removeScheduleRow(index)}
                disabled={form.schedule.length === 1}
                className="absolute -top-3 -right-3 h-7 w-7"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <div className="grid grid-cols-1 items-end gap-3 md:grid-cols-10">
                <div className="space-y-2 md:col-span-4">
                  <Label>Day</Label>
                  <Input
                    value={row.day}
                    onChange={(e) => updateScheduleRow(index, 'day', e.target.value)}
                    placeholder="e.g. Monday"
                  />
                </div>
                <div className="space-y-2 md:col-span-3">
                  <Label>Time</Label>
                  <Input
                    value={row.time}
                    onChange={(e) => updateScheduleRow(index, 'time', e.target.value)}
                    placeholder="e.g. 09:00"
                  />
                </div>
                <div className="space-y-2 md:col-span-3">
                  <Label>Hours / No</Label>
                  <Input
                    value={row.hoursNo}
                    onChange={(e) => updateScheduleRow(index, 'hoursNo', e.target.value)}
                    placeholder="e.g. 2 hours"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Task</Label>
                <Textarea
                  value={row.task}
                  onChange={(e) => updateScheduleRow(index, 'task', e.target.value)}
                  placeholder="Task description"
                  rows={2}
                />
              </div>
            </div>
          ))}
        </section>

        <Separator />

        <section className="space-y-4">
          <h3 className="text-lg font-semibold">Agreed By</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Service User Name</Label>
              <Input
                value={form.agreedByServiceUserName}
                onChange={(e) => setField('agreedByServiceUserName', e.target.value)}
                placeholder="Service user name"
              />
            </div>
            <div className="space-y-2">
              <Label>Case Manager Name</Label>
              <Input
                value={form.agreedByCaseManagerName}
                onChange={(e) => setField('agreedByCaseManagerName', e.target.value)}
                placeholder="Case manager name"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <SignatureField
              label="Service User Signature"
              entityId={sid}
              signatureUrl={form.serviceUserSignatureUrl}
              onSaved={(url) => setField('serviceUserSignatureUrl', url)}
            />
            <SignatureField
              label="Case Manager Signature"
              entityId={sid}
              signatureUrl={form.caseManagerSignatureUrl}
              onSaved={(url) => setField('caseManagerSignatureUrl', url)}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Service User Agreed Date</Label>
              <CustomDatePicker
                selected={form.serviceUserAgreedDate}
                onChange={(date) => setField('serviceUserAgreedDate', date)}
                placeholder="Select date"
              />
            </div>
            <div className="space-y-2">
              <Label>Case Manager Agreed Date</Label>
              <CustomDatePicker
                selected={form.caseManagerAgreedDate}
                onChange={(date) => setField('caseManagerAgreedDate', date)}
                placeholder="Select date"
              />
            </div>
          </div>
        </section>
      </CardContent>
    </Card>
  );
};
