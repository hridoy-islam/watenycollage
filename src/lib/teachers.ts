/**
 * Who counts as a teacher, in one place.
 *
 * Teaching staff are no longer a role of their own. They are `employee` users
 * carrying a Designation titled "Teacher" (`designationId` is an array, so the
 * same person can hold other designations too). Legacy `role: "teacher"`
 * accounts still exist and still count.
 *
 * The API decides this — `GET /users/teachers` — so callers should not
 * re-implement the rule. `isTeacherUser` is exported for the cases where a
 * user object is already in hand and a second request would be wasteful.
 */
import axiosInstance from '@/lib/axios';

export interface TeacherUser {
  _id: string;
  name?: string;
  title?: string;
  firstName?: string;
  initial?: string;
  lastName?: string;
  email?: string;
  role?: string;
  status?: string;
  designationId?: Array<{ _id: string; title?: string }> | string[];
}

export interface TeacherOption {
  value: string;
  label: string;
  email?: string;
}

/** Matches "Teacher" and "teacher" but not "Teaching Assistant". */
const TEACHER_DESIGNATION_TITLE = /^\s*teacher\s*$/i;

/** The display name, falling back through the name parts to the email. */
export const teacherName = (user?: TeacherUser | null): string => {
  if (!user) return 'Unknown';
  return (
    user.name?.trim() ||
    [user.title, user.firstName, user.initial, user.lastName]
      .filter(Boolean)
      .join(' ')
      .trim() ||
    user.email ||
    'Unknown'
  );
};

/**
 * True when an already-loaded user is teaching staff. Mirrors the server rule;
 * only useful when the designations were populated with their titles.
 */
export const isTeacherUser = (user?: TeacherUser | null): boolean => {
  if (!user) return false;
  if (user.role === 'teacher') return true;
  if (user.role !== 'employee') return false;

  return (user.designationId || []).some(
    (designation: any) =>
      typeof designation === 'object' &&
      TEACHER_DESIGNATION_TITLE.test(designation?.title || '')
  );
};

/**
 * Every teacher the pickers can offer. Defaults to active accounts, since an
 * inactive one should not be assignable; pass `status: 'all'` to widen.
 */
export const fetchTeachers = async (
  params: Record<string, any> = {}
): Promise<TeacherUser[]> => {
  const { status, ...rest } = params;

  const response = await axiosInstance.get('/users/teachers', {
    params: {
      limit: 'all',
      ...rest,
      ...(status === 'all' ? {} : { status: status || 'active' })
    }
  });

  const result = response.data?.data?.result;
  return Array.isArray(result) ? result : [];
};

/** The same list, shaped for react-select. */
export const fetchTeacherOptions = async (
  params: Record<string, any> = {}
): Promise<TeacherOption[]> => {
  const teachers = await fetchTeachers(params);
  return toTeacherOptions(teachers);
};

/** Shapes an already-loaded list for react-select, dropping anything id-less. */
export const toTeacherOptions = (
  teachers: TeacherUser[] = []
): TeacherOption[] =>
  teachers
    .filter((teacher) => teacher?._id)
    .map((teacher) => ({
      value: teacher._id,
      label: teacherName(teacher),
      email: teacher.email
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
