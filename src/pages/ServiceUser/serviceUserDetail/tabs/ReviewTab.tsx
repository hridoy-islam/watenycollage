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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import {
  Plus,
  Trash2,
  Save,
  FileText,
  Pencil,
  ArrowLeft,
  CalendarDays
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import moment from 'moment';

interface SmartGoal {
  goalArea: string;
  timeFrame: Date | null;
}

interface ReviewForm {
  serviceUserName: string;
  date: Date | null;
  time: string;
  address: string;
  careManagerSupervisorName: string;
  socialWorkerCaseManager: string;
  careWorker: string;
  othersPresent: string;
  preReviewServiceUserComments: string;
  preReviewCareManagerComments: string;
  morningVisitsFocus: string;
  eveningVisitsFocus: string;
  followUp: string;
  preReviewNotes: string;
  reviewNotes: string;
  postReviewNotes: string;
  smartGoals: SmartGoal[];
  serviceUserSignatureUrl: string;
  careStaffSignatureUrl: string;
  managerSignatureUrl: string;
  signatureDate: Date | null;
  approximateNextReviewDate: Date | null;
}

const emptyForm = (): ReviewForm => ({
  serviceUserName: '',
  date: null,
  time: '',
  address: '',
  careManagerSupervisorName: '',
  socialWorkerCaseManager: '',
  careWorker: '',
  othersPresent: '',
  preReviewServiceUserComments: '',
  preReviewCareManagerComments: '',
  morningVisitsFocus: '',
  eveningVisitsFocus: '',
  followUp: '',
  reviewNotes: '',
  preReviewNotes: '',
  postReviewNotes: '',
  smartGoals: [{ goalArea: '', timeFrame: null }],
  serviceUserSignatureUrl: '',
  careStaffSignatureUrl: '',
  managerSignatureUrl: '',
  signatureDate: null,
  approximateNextReviewDate: null
});

const mapToForm = (item: any): ReviewForm => ({
  serviceUserName: item.serviceUserName || '',
  date: item.date ? new Date(item.date) : null,
  time: item.time || '',
  address: item.address || '',
  careManagerSupervisorName: item.careManagerSupervisorName || '',
  socialWorkerCaseManager: item.socialWorkerCaseManager || '',
  careWorker: item.careWorker || '',
  othersPresent: item.othersPresent || '',
  preReviewServiceUserComments: item.preReviewServiceUserComments || '',
  preReviewCareManagerComments: item.preReviewCareManagerComments || '',
  morningVisitsFocus: item.morningVisitsFocus || '',
  eveningVisitsFocus: item.eveningVisitsFocus || '',
  followUp: item.followUp || '',
  preReviewNotes: item.preReviewNotes || '',
  reviewNotes: item.reviewNotes || '',
  postReviewNotes: item.postReviewNotes || '',
  smartGoals:
    item.smartGoals && item.smartGoals.length > 0
      ? item.smartGoals.map((g: any) => ({
          goalArea: g.goalArea || '',
          timeFrame: g.timeFrame ? new Date(g.timeFrame) : null
        }))
      : [{ goalArea: '', timeFrame: null }],
  serviceUserSignatureUrl: item.serviceUserSignatureUrl || '',
  careStaffSignatureUrl: item.careStaffSignatureUrl || '',
  managerSignatureUrl: item.managerSignatureUrl || '',
  signatureDate: item.signatureDate ? new Date(item.signatureDate) : null,
  approximateNextReviewDate: item.approximateNextReviewDate
    ? new Date(item.approximateNextReviewDate)
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
    .join(' ') ||
  user?.name ||
  '';

const withUserFallback = (form: ReviewForm, user: any): ReviewForm => ({
  ...form,
  serviceUserName: form.serviceUserName || getServiceUserName(user),
  address: form.address || user?.address || ''
});

// Time formatting helper (masked HH:mm input on blur)
const handleTimeBlur = (value: string, onChange: (val: string) => void) => {
  let clean = value.trim();
  if (clean) {
    const m = moment(clean, ['HH:mm', 'H:mm', 'HHmm', 'Hmm', 'H']);
    if (m.isValid()) clean = m.format('HH:mm');
  }
  onChange(clean);
};

export const ReviewTab: React.FC = () => {
  const { sid } = useParams<{ sid: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewId, setReviewId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [form, setForm] = useState<ReviewForm>(emptyForm());
  const { toast } = useToast();

  // Delete confirmation state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const setField = <K extends keyof ReviewForm>(
    key: K,
    value: ReviewForm[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateGoalRow = (
    index: number,
    field: keyof SmartGoal,
    value: string | Date | null
  ) => {
    setForm((prev) => ({
      ...prev,
      smartGoals: prev.smartGoals.map((row, i) =>
        i === index ? { ...row, [field]: value } : row
      )
    }));
  };

  const addGoalRow = () => {
    setForm((prev) => ({
      ...prev,
      smartGoals: [...prev.smartGoals, { goalArea: '', timeFrame: null }]
    }));
  };

  const removeGoalRow = (index: number) => {
    setForm((prev) => ({
      ...prev,
      smartGoals: prev.smartGoals.filter((_, i) => i !== index)
    }));
  };

  const fetchReviews = useCallback(async () => {
    if (!sid) return;
    try {
      const [reviewRes, userRes] = await Promise.all([
        axiosInstance.get('/review', {
          params: { serviceUserId: sid }
        }),
        axiosInstance.get(`/users/${sid}`)
      ]);
      const user = userRes.data?.data;
      setUserData(user);
      setReviews(reviewRes.data?.data?.result || []);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setLoading(false);
    }
  }, [sid]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleSave = async () => {
    if (!sid) return;
    setSaving(true);
    try {
      const payload = {
        serviceUserId: sid,
        serviceUserName: form.serviceUserName,
        date: toISOString(form.date),
        time: form.time,
        address: form.address,
        careManagerSupervisorName: form.careManagerSupervisorName,
        socialWorkerCaseManager: form.socialWorkerCaseManager,
        careWorker: form.careWorker,
        othersPresent: form.othersPresent,
        preReviewServiceUserComments: form.preReviewServiceUserComments,
        preReviewCareManagerComments: form.preReviewCareManagerComments,
        morningVisitsFocus: form.morningVisitsFocus,
        eveningVisitsFocus: form.eveningVisitsFocus,
        followUp: form.followUp,
        preReviewNotes: form.preReviewNotes,
        reviewNotes: form.reviewNotes,
        postReviewNotes: form.postReviewNotes,
        smartGoals: form.smartGoals.map((g) => ({
          goalArea: g.goalArea,
          timeFrame: toISOString(g.timeFrame)
        })),
        serviceUserSignatureUrl: form.serviceUserSignatureUrl,
        careStaffSignatureUrl: form.careStaffSignatureUrl,
        managerSignatureUrl: form.managerSignatureUrl,
        signatureDate: toISOString(form.signatureDate),
        approximateNextReviewDate: toISOString(form.approximateNextReviewDate)
      };

      if (reviewId) {
        await axiosInstance.patch(`/review/${reviewId}`, payload);
        toast({
          title: 'Success!',
          description: 'Review updated successfully',
          className: 'bg-watney border-none text-white'
        });
      } else {
        await axiosInstance.post('/review', payload);
        toast({
          title: 'Success!',
          description: 'Review created successfully',
          className: 'bg-watney border-none text-white'
        });
      }
      setShowForm(false);
      setReviewId(null);
      fetchReviews();
    } catch (error: any) {
      console.error('Failed to save review:', error);
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to save Review',
        className: 'bg-red-500 border-none text-white'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setReviewToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!reviewToDelete) return;

    setDeleting(true);
    try {
      await axiosInstance.delete(`/review/${reviewToDelete}`);
      toast({
        title: 'Success!',
        description: 'Review deleted successfully',
        className: 'bg-watney border-none text-white'
      });
      fetchReviews();
    } catch (error: any) {
      console.error('Failed to delete review:', error);
      toast({
        title: 'Error',
        description:
          error?.response?.data?.message || 'Failed to delete Review',
        className: 'bg-red-500 border-none text-white'
      });
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
      setReviewToDelete(null);
    }
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setReviewToDelete(null);
  };

  const openEdit = (item: any) => {
    setReviewId(item._id);
    setForm(withUserFallback(mapToForm(item), userData));
    setShowForm(true);
  };

  const openCreate = () => {
    setReviewId(null);
    setForm(withUserFallback(emptyForm(), userData));
    setShowForm(true);
  };

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <BlinkingDots size="large" color="bg-watney" />
      </div>
    );
  }

  if (showForm) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              onClick={() => {
                setShowForm(false);
                setReviewId(null);
              }}
              variant="outline"
              size="icon"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <CardTitle>{reviewId ? 'Edit Review' : 'New Review'}</CardTitle>
          </div>
          <Button onClick={handleSave} disabled={saving} variant="default">
            <Save className="mr-2 h-4 w-4" />
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </CardHeader>
        <CardContent className="space-y-8">
          <section className="space-y-4">
            <h3 className="text-lg font-semibold">Review Details</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Service User's Name</Label>
                <Input
                  value={form.serviceUserName}
                  onChange={(e) => setField('serviceUserName', e.target.value)}
                  placeholder="Service user name"
                />
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <CustomDatePicker
                  selected={form.date}
                  onChange={(date) => setField('date', date)}
                  placeholder="Select date"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="review-time" className="text-sm font-semibold">
                  Time:
                </Label>
                <div className="mt-1">
                  <Input
                    id="review-time"
                    value={form.time}
                    placeholder="09:00"
                    maxLength={5}
                    className="font-mono"
                    onChange={(e) => {
                      let val = e.target.value
                        .replace(/[^0-9:]/g, '')
                        .slice(0, 5);
                      if (
                        val.length === 2 &&
                        form.time?.length === 1 &&
                        !val.includes(':')
                      ) {
                        val += ':';
                      }
                      setField('time', val);
                    }}
                    onBlur={(e) =>
                      handleTimeBlur(e.target.value, (val) =>
                        setField('time', val)
                      )
                    }
                  />
                </div>
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
                <Label>Care Manager / Supervisor Name</Label>
                <Input
                  value={form.careManagerSupervisorName}
                  onChange={(e) =>
                    setField('careManagerSupervisorName', e.target.value)
                  }
                  placeholder="Care manager / supervisor name"
                />
              </div>
              <div className="space-y-2">
                <Label>Social Worker / Case Manager</Label>
                <Input
                  value={form.socialWorkerCaseManager}
                  onChange={(e) =>
                    setField('socialWorkerCaseManager', e.target.value)
                  }
                  placeholder="Social worker / case manager"
                />
              </div>
              <div className="space-y-2">
                <Label>Care Worker</Label>
                <Input
                  value={form.careWorker}
                  onChange={(e) => setField('careWorker', e.target.value)}
                  placeholder="Care worker"
                />
              </div>
              <div className="space-y-2">
                <Label>Others Present at Review</Label>
                <Input
                  value={form.othersPresent}
                  onChange={(e) => setField('othersPresent', e.target.value)}
                  placeholder="Others present at review"
                />
              </div>
            </div>
          </section>

          <Separator />

          <section className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Service User's Comments</Label>
                <Textarea
                  value={form.preReviewServiceUserComments}
                  onChange={(e) =>
                    setField('preReviewServiceUserComments', e.target.value)
                  }
                  placeholder="Service user's comments"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Care Manager / Administrator's Comments</Label>
                <Textarea
                  value={form.preReviewCareManagerComments}
                  onChange={(e) =>
                    setField('preReviewCareManagerComments', e.target.value)
                  }
                  placeholder="Care manager / administrator's comments"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Pre-Review Notes</Label>
                <Textarea
                  value={form.preReviewNotes}
                  onChange={(e) => setField('preReviewNotes', e.target.value)}
                  placeholder="Pre-review notes"
                  rows={3}
                />
              </div>
              {/* <div className="space-y-2">
                <Label>Morning Visits Focus On</Label>
                <Textarea
                  value={form.morningVisitsFocus}
                  onChange={(e) => setField('morningVisitsFocus', e.target.value)}
                  placeholder="Morning visits focus on"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Evening Visits Focus On</Label>
                <Textarea
                  value={form.eveningVisitsFocus}
                  onChange={(e) => setField('eveningVisitsFocus', e.target.value)}
                  placeholder="Evening visits focus on"
                  rows={3}
                />
              </div> */}
              <div className="space-y-2">
                <Label>Follow Up</Label>
                <Textarea
                  value={form.followUp}
                  onChange={(e) => setField('followUp', e.target.value)}
                  placeholder="Follow up"
                  rows={3}
                />
              </div>
            </div>
          </section>

          <Separator />

          <section className="space-y-4">
            <h3 className="text-lg font-semibold">Review Notes</h3>
            <div className="space-y-2">
              <Textarea
                value={form.reviewNotes}
                onChange={(e) => setField('reviewNotes', e.target.value)}
                placeholder="Involve the service users in all stages of their review including the review itself by asking them questions and examples"
                rows={4}
              />
            </div>
          </section>

          <Separator />

          <section className="space-y-3">
            <div className="flex flex-col items-center justify-between">

            <h4 className="text-lg font-semibold text-blue-800 underline">Review Notes </h4>

            <h5 className="text-blue-800 text-center mb-2">
              Involve the Service Users in All Stages of Their Review Including
              the Review Itself by Asking Them Questions and Examples
            </h5>
            <h3 className="text-lg font-semibold underline">
              POST REVIEW NOTES and S.M.A.R.T Goals{' '}
            </h3>
            <h3 className="text-lg font-semibold">
S.M.A.R.T Goals for areas to focus on            </h3>

            </div>
            <div className="space-y-2">
              <Label>Post Review Notes</Label>
              <Textarea
                value={form.postReviewNotes}
                onChange={(e) => setField('postReviewNotes', e.target.value)}
                placeholder="Post review notes"
                rows={3}
              />
            </div>

            <div className="flex justify-end">
              <Button onClick={addGoalRow} variant="outline">
                <Plus className="mr-1 h-4 w-4" />
                Add Goal
              </Button>
            </div>

            <div className="space-y-4">
              <Label>S.M.A.R.T Goals for Areas to Focus On</Label>
              <div className="space-y-4">
                {form.smartGoals.map((goal, index) => (
                  <div
                    key={index}
                    className="relative grid grid-cols-1 gap-4 rounded-lg border border-gray-200 p-3 md:grid-cols-[2fr_1fr]"
                  >
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => removeGoalRow(index)}
                      disabled={form.smartGoals.length === 1}
                      className="absolute -right-3 -top-3 h-7 w-7"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <div className="space-y-2">
                      <Label>Goal Area</Label>
                      <Textarea
                        value={goal.goalArea}
                        onChange={(e) =>
                          updateGoalRow(index, 'goalArea', e.target.value)
                        }
                        placeholder="S.M.A.R.T goal for area to focus on"
                        rows={2}
                      />
                    </div>
                     <div className="space-y-2">
                       <Label className="text-sm font-semibold">
                         Time Frame
                       </Label>
                       <CustomDatePicker
                         selected={goal.timeFrame}
                         onChange={(date) => updateGoalRow(index, 'timeFrame', date)}
                         placeholder="Select date"
                       />
                     </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <Separator />

          <section className="space-y-4">
            <h3 className="text-lg font-semibold">Signatures</h3>
            <p className="text-sm text-gray-500">
              Please sign below to confirm all relevant documents such as care
              plans and risk assessments have been updated and to confirm
              service user's involvement in review.
            </p>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <SignatureField
                label="Service User's Signature"
                entityId={sid}
                signatureUrl={form.serviceUserSignatureUrl}
                onSaved={(url) => setField('serviceUserSignatureUrl', url)}
              />
              <SignatureField
                label="Care Staff's Signature"
                entityId={sid}
                signatureUrl={form.careStaffSignatureUrl}
                onSaved={(url) => setField('careStaffSignatureUrl', url)}
              />
              <SignatureField
                label="Manager's Signature"
                entityId={sid}
                signatureUrl={form.managerSignatureUrl}
                onSaved={(url) => setField('managerSignatureUrl', url)}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Signature Date</Label>
                <CustomDatePicker
                  selected={form.signatureDate}
                  onChange={(date) => setField('signatureDate', date)}
                  placeholder="Select date"
                />
              </div>
              <div className="space-y-2">
                <Label>Approximate Date of Next Review</Label>
                <CustomDatePicker
                  selected={form.approximateNextReviewDate}
                  onChange={(date) =>
                    setField('approximateNextReviewDate', date)
                  }
                  placeholder="Select date"
                  futureDate={true}
                />
              </div>
            </div>
          </section>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Reviews</CardTitle>
          <Button onClick={openCreate} variant="default">
            <Plus className="mr-2 h-4 w-4" />
            Create Review
          </Button>
        </CardHeader>
        <CardContent>
          {reviews.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 py-16">
              <FileText className="h-12 w-12 text-gray-300" />
              <p className="text-gray-500">
                No reviews exist for this service user yet.
              </p>
              <Button onClick={openCreate} variant="default">
                <Plus className="mr-2 h-4 w-4" />
                Create Review
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">
                      Service User Name
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">
                      Next Review Date
                    </th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-600">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.map((item) => (
                    <tr
                      key={item._id}
                      className="border-b border-gray-100 transition-colors hover:bg-gray-50"
                    >
                      <td className="px-4 py-3 font-medium">
                        {item.serviceUserName || 'Service User'}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {item.date
                          ? moment(item.date).format('DD MMM YYYY')
                          : '-'}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {item.approximateNextReviewDate
                          ? moment(item.approximateNextReviewDate).format(
                              'DD MMM YYYY'
                            )
                          : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            onClick={() => openEdit(item)}
                            variant="outline"
                            size="icon"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => handleDelete(item._id)}
                            variant="destructive"
                            size="icon"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this
              review and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDelete} disabled={deleting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleting}
              className="bg-red-500 hover:bg-red-600 focus:ring-red-500"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
