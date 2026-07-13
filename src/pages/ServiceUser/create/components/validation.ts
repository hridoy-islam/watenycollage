import { z } from 'zod';

export const serviceUserSchema = z
  .object({
    // Personal Information
    serviceUserType: z.string().min(1, 'Type is required'),

    title: z.string().min(1, 'Title is required'),

    image: z.any().optional(),
    firstName: z.string().min(1, 'First name is required'),
    middleInitial: z.string().optional(),
    lastName: z.string().min(1, 'Last name is required'),
    preferredName: z.string().optional(),
    dateOfBirth: z.string().min(1, 'Date of birth is required'),

    gender: z.string().min(1, 'Gender is required'),

    maritalStatus: z.string().optional(),

    ethnicOrigin: z.string().optional(),

    religion: z.string().optional(),

    // Address & Location
    address: z.string().min(1, 'Address is required'),
    city: z.string().min(1, 'City is required'),
    country: z.string().min(1, 'Country is required'),
    postCode: z.string().min(1, 'Post code is required'),

    // Contact Information
    phone: z.string().optional(),
    fax: z.string().optional(),
    mobile: z.string().optional(),
    other: z.string().optional(),
    email: z.string().email('Please enter a valid email address'),
    website: z.string().optional(),

    // Employment / Service Details
    lastDutyDate: z.date().optional(),
    startDate: z.date({ required_error: 'Start date is required' }),
    servicePriority: z.string().min(1, 'Service priority is required'),
    serviceLocationExId: z
      .string().optional(),

    timesheetSignature: z.boolean(),

    timesheetSignatureNote: z.string().optional()
  })
  // Optional: Only require timesheetSignatureNote if timesheetSignature is true
  .refine(
    (data) => {
      if (data.timesheetSignature === true) {
        return (
          typeof data.timesheetSignatureNote === 'string' &&
          data.timesheetSignatureNote.trim().length > 0
        );
      }
      return true;
    },
    {
      path: ['timesheetSignatureNote'],
      message: 'Note is required when Timesheet Signature is required'
    }
  );

export type ServiceUserFormData = z.infer<typeof serviceUserSchema>;
