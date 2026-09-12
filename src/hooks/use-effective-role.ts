/**
 * The role a user should be treated as, rather than the one on their record.
 *
 * Teaching staff are stored as `role: "employee"` carrying a designation
 * titled "Teacher" - the teacher role itself is only used for accounts created
 * as teachers directly. Anything that branches on "is this a teacher" has to
 * account for both, or a real teacher silently falls through to the student
 * path and is shown an empty page.
 *
 * The designation may arrive populated on the user or as bare ids, so both are
 * handled: the populated objects answer immediately, and only bare ids cost a
 * request. `resolved` says whether that request has finished - callers that
 * fetch different data per role must wait for it, or they fire the student
 * query first and show its empty result.
 */
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axiosInstance from '@/lib/axios';

const TEACHER_DESIGNATION = 'teacher';

/** Reads a designation that is already populated on the user. */
const labelOf = (designation: any): string => {
  if (!designation) return '';
  if (typeof designation === 'string') return designation.trim().toLowerCase();
  return (designation.title ?? designation.name ?? '')
    .toString()
    .trim()
    .toLowerCase();
};

const idOf = (designation: any): string => {
  if (!designation) return '';
  if (typeof designation === 'string') return designation;
  return (designation._id ?? '').toString();
};

export function useEffectiveRole() {
  const { user } = useSelector((state: any) => state.auth) || {};

  const designations: any[] = Array.isArray(user?.designationId)
    ? user.designationId
    : [];

  // A populated designation answers without a request.
  const teacherFromPopulated = designations.some(
    (designation) => labelOf(designation) === TEACHER_DESIGNATION
  );

  const [isTeacherDesignation, setIsTeacherDesignation] =
    useState(teacherFromPopulated);
  const [resolved, setResolved] = useState(
    user?.role !== 'employee' || teacherFromPopulated || designations.length === 0
  );

  useEffect(() => {
    // Only an employee can be promoted this way, and only bare ids need a look-up.
    if (user?.role !== 'employee' || teacherFromPopulated) {
      setIsTeacherDesignation(teacherFromPopulated);
      setResolved(true);
      return;
    }

    const unresolved = designations.map(idOf).filter(Boolean);

    if (unresolved.length === 0) {
      setResolved(true);
      return;
    }

    let cancelled = false;

    (async () => {
      const titles = await Promise.all(
        unresolved.map(async (id) => {
          try {
            const res = await axiosInstance.get(`/designation/${id}`);
            const data = res?.data?.data || res?.data || {};
            return labelOf(data);
          } catch (error) {
            console.error('Failed to fetch designation:', error);
            return '';
          }
        })
      );

      if (cancelled) return;

      setIsTeacherDesignation(
        titles.some((title) => title === TEACHER_DESIGNATION)
      );
      setResolved(true);
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id, user?.role, teacherFromPopulated, designations.length]);

  const effectiveRole =
    user?.role === 'employee' && isTeacherDesignation ? 'teacher' : user?.role;

  return {
    user,
    effectiveRole,
    isTeacher: effectiveRole === 'teacher',
    isAdmin: effectiveRole === 'admin',
    /** False while an employee's designation is still being looked up. */
    resolved
  };
}

export default useEffectiveRole;
