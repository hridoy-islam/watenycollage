/**
 * When a student may see an assignment result.
 *
 * Mirrors the server's `isResultVisible` so a page holding the raw settings
 * document answers the same way as one handed the API's `resultReleased` flag.
 * Prefer the flag where the API sends it; this is for the screens that read
 * `/assignment-settings` directly and have to work it out themselves.
 *
 * Two halves have to hold: staff have published the results, and the release
 * moment has arrived. The date is stored as midnight UTC - it names a day -
 * and the time is a UK wall-clock time, so they are read back that way. Doing
 * it in the browser's own timezone lands an hour out through British Summer
 * Time, and a whole day out for anyone travelling.
 */
import moment from 'moment-timezone';

export const UK_TIMEZONE = 'Europe/London';

const TIME_OF_DAY_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

export interface ReleaseSchedule {
  isResultPublished?: boolean;
  resultReleaseDate?: string | Date | null;
  resultReleaseTime?: string | null;
}

/** The real instant a `date + HH:mm` UK schedule falls on, or null. */
export const ukReleaseMoment = (
  date?: string | Date | null,
  time?: string | null
): moment.Moment | null => {
  if (!date) return null;

  const day = moment.utc(date);
  if (!day.isValid()) return null;

  const clock =
    typeof time === 'string' && TIME_OF_DAY_PATTERN.test(time.trim())
      ? time.trim()
      : '00:00';

  const at = moment.tz(
    `${day.format('YYYY-MM-DD')} ${clock}`,
    'YYYY-MM-DD HH:mm',
    UK_TIMEZONE
  );

  return at.isValid() ? at : null;
};

/** No schedule set means nothing is being waited for. */
export const hasReleaseMomentPassed = (
  date?: string | Date | null,
  time?: string | null
): boolean => {
  const at = ukReleaseMoment(date, time);
  if (!at) return true;
  return moment().isSameOrAfter(at);
};

export const isResultVisible = (setting?: ReleaseSchedule | null): boolean =>
  Boolean(setting?.isResultPublished) &&
  hasReleaseMomentPassed(setting?.resultReleaseDate, setting?.resultReleaseTime);

/** "01 Sep 2026, 04:00" - what a student is told while they wait. */
export const formatReleaseMoment = (
  date?: string | Date | null,
  time?: string | null
): string => {
  const at = ukReleaseMoment(date, time);
  return at ? at.format('DD MMM YYYY, HH:mm') : '';
};
