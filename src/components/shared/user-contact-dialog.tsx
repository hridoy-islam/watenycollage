import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Mail, MessageSquare, Phone } from 'lucide-react';
import axiosInstance from '@/lib/axios';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { UserAvatar } from '@/pages/message/components/user-avatar';
import { displayName } from '@/pages/message/components/message-utils';

export interface ContactPerson {
  _id: string;
  name?: string;
  title?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  image?: string;
}

interface UserContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** What is already known, shown straight away while the rest loads. */
  person: ContactPerson | null;
  /** "Teacher", "Student" - shown under the name. */
  roleLabel?: string;
  /** Hidden inside the chat itself, where it would lead back to the same place. */
  showMessageButton?: boolean;
}

const CONTACT_FIELDS = 'name,title,firstName,lastName,email,phone,image';

/**
 * Name, email and phone for a teacher or student, with a way to message them.
 *
 * The rosters only carry name and email, so the phone is read from the user
 * when the dialog opens. A failed read is not an error worth reporting - the
 * dialog keeps what it was given and simply has no phone to show.
 */
export function UserContactDialog({
  open,
  onOpenChange,
  person,
  roleLabel,
  showMessageButton = true
}: UserContactDialogProps) {
  const navigate = useNavigate();
  const { user } = useSelector((state: any) => state.auth);
  const [details, setDetails] = useState<ContactPerson | null>(person);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !person?._id) return;
    let cancelled = false;
    setDetails(person);
    setLoading(true);
    axiosInstance
      .get(`/users/${person._id}`, { params: { fields: CONTACT_FIELDS } })
      .then((res) => {
        if (!cancelled && res.data?.data) {
          setDetails({ ...person, ...res.data.data });
        }
      })
      .catch((error) => console.error('Failed to load contact details:', error))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
    // Keyed on the id: the chat hands in a fresh object on every new message.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, person?._id]);

  const shown = details || person;
  const name = displayName(shown);
  const isSelf = String(shown?._id) === String(user?._id);

  const handleMessage = () => {
    if (!shown?._id) return;
    onOpenChange(false);
    navigate(`/dashboard/messages?user=${shown._id}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>{name}</DialogTitle>
          <DialogDescription>Contact details</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center rounded-t-lg bg-watney/5 px-6 pb-5 pt-8 text-center">
          <UserAvatar name={name} image={shown?.image} size="lg" />
          <h3 className="mt-3 text-base font-bold text-black">{name}</h3>
          {roleLabel && (
            <span className="mt-1 rounded bg-watney/10 px-2 py-0.5 text-[11px] font-medium text-watney">
              {roleLabel}
            </span>
          )}
        </div>

        <div className="space-y-1 px-6 py-4">
          <ContactRow icon={Mail} label="Email">
            {shown?.email ? (
              <a
                href={`mailto:${shown.email}`}
                className="break-all text-watney hover:underline"
              >
                {shown.email}
              </a>
            ) : (
              <span className="text-black">Not provided</span>
            )}
          </ContactRow>
          <ContactRow icon={Phone} label="Phone">
            {loading && !shown?.phone ? (
              <Skeleton className="h-4 w-28" />
            ) : shown?.phone ? (
              <a href={`tel:${shown.phone}`} className="text-watney hover:underline">
                {shown.phone}
              </a>
            ) : (
              <span className="text-black">Not provided</span>
            )}
          </ContactRow>
        </div>

        {showMessageButton && !isSelf && (
          <div className="border-t border-gray-100 px-6 py-4">
            <Button
              onClick={handleMessage}
              className="w-full bg-watney text-white hover:bg-watney/90"
            >
              <MessageSquare className="mr-2 h-4 w-4" /> Message
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function ContactRow({
  icon: Icon,
  label,
  children
}: {
  icon: typeof Mail;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg px-2 py-2">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-black">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 text-sm">
        <p className="text-[11px] text-black">{label}</p>
        <div className="text-black">{children}</div>
      </div>
    </div>
  );
}
