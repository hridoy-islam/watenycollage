import { z } from 'zod';

export const serviceFunderSchema = z.object({
  // Personal Information
  type: z.string().min(1, 'Type is required'),

  title: z.string().min(1, 'Title is required'),

  serviceUser: z.string().optional(),
  image: z.any().optional(),

  firstName: z.string().min(1, 'First name is required'),

  middleInitial: z.string().optional(),

  lastName: z.string().min(1, 'Last name is required'),

  description: z.string().min(1, 'Description is required'),

  area: z.string().min(1, 'Area is required'),

  branch: z.string().min(1, 'Branch is required'),

  // Address & Location
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  country: z.string().min(1, 'Country is required'),
  postCode: z.string().min(1, 'Post code is required'),

  // Contact Information
  phone: z.string().min(1, 'Phone is required'),
  fax: z.string().optional(),
  mobile: z.string().min(1, 'Mobile is required'),
  other: z.string().optional(),
  email: z.string().email('Please enter a valid email address'),
  website: z.string().optional(),

  // Employment / Service Details
  startDate: z.string().min(1, 'Start date is required'),

  status: z.string().min(1, 'Status is required'),

  rateSheet: z.string().optional(),
  travelType: z.string().min(1, 'Travel type is required'),

  invoice: z.object({
    linked: z
      .boolean( { required_error: 'Linked is required' }),
    type: z.string().min(1, 'Type is required'),
    name: z.string().min(1, 'Name is required'),
    address: z.string().min(1, 'Address is required'),
    cityTown: z.string().min(1, 'City / Town is required'),
    county: z.string().optional(),
    postCode: z.string().min(1, 'Post code is required'),
    customerExternalId: z.string().min(1, 'Customer External ID is required'),
    invoiceRun: z.string().min(1, 'Invoice run is required'),
    invoiceFormat: z.string().min(1, 'Invoice format is required'),
    invoiceGrouping: z.string().min(1, 'Invoice grouping is required'),

    deliveryType: z.string().min(1, 'Delivery type is required'),
    phone: z.string().optional(),
    fax: z.string().optional(),
    mobile: z.string().optional(),
    other: z.string().optional(),
    email: z.string().email('Please enter a valid email address'),
    website: z.string().url('Invalid URL').optional()
  }),
  purchaseOrder: z.boolean({
    required_error: 'Please select if a purchase order is required'
  })
});

export type ServiceFunderFormData = z.infer<typeof serviceFunderSchema>;
