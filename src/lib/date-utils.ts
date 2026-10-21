import moment from '@/lib/moment-setup';

// Single source of truth for how dates are displayed across the app.
// Change the format here and every page picks it up.
export const DATE_FORMAT = 'DD-MM-YYYY'; // moment tokens
export const DATE_TIME_FORMAT = `${DATE_FORMAT} HH:mm`;
export const DATE_FORMAT_FNS = 'dd-MM-yyyy'; // date-fns / react-datepicker tokens
export const DATE_TIME_FORMAT_FNS = `${DATE_FORMAT_FNS} HH:mm`;

type DateInput = string | number | Date | moment.Moment | null | undefined;

const toMoment = (value: DateInput) => {
  if (value === null || value === undefined || value === '') return null;
  const m = moment(value);
  return m.isValid() ? m : null;
};

/** Formats a date as dd-mm-yyyy. Returns `fallback` for empty/invalid input. */
export const formatDate = (value: DateInput, fallback = ''): string =>
  toMoment(value)?.format(DATE_FORMAT) ?? fallback;

/** Formats a date as dd-mm-yyyy HH:mm. Returns `fallback` for empty/invalid input. */
export const formatDateTime = (value: DateInput, fallback = ''): string =>
  toMoment(value)?.format(DATE_TIME_FORMAT) ?? fallback;
