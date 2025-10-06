import moment from 'moment';

export const formatDate = (dateString: string) => {
  return moment(dateString).format('DD-MM-YYYY');
};

export const formatDeadline = (deadline: string) => {
  return moment(deadline).format('DD-MM-YYYY');
};

export const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

export const allowedFileTypes = [
  'image/',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'video/',
  'audio/'
];