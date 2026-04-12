import { z } from 'zod';

export const BookingTypeEnum = z.enum(['ONSITE', 'MOBILE', 'BOTH']);

const OperatingHoursEntrySchema = z.object({
  day: z.string().min(1),
  open: z.string().min(1),
  close: z.string().min(1),
});

const OperatingHoursSchema = z.union([
  z.record(z.string()),
  z.array(OperatingHoursEntrySchema),
]);

export const SalonUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional().nullable(),
  province: z.string().optional(),
  city: z.string().optional(),
  town: z.string().optional(),
  address: z.string().optional().nullable(),
  contactEmail: z.string().email().optional().nullable(),
  phoneNumber: z.string().optional().nullable(),
  whatsapp: z.string().optional().nullable(),
  website: z.string().url().optional().nullable(),
  facebookUrl: z.string().url().optional().nullable(),
  instagramUrl: z.string().url().optional().nullable(),
  tiktokUrl: z.string().url().optional().nullable(),
  googleReviewsUrl: z.string().url().optional().nullable(),
  freshaReviewsUrl: z.string().url().optional().nullable(),
  booksyReviewsUrl: z.string().url().optional().nullable(),
  bookingType: BookingTypeEnum.optional(),
  offersMobile: z.boolean().optional(),
  mobileFee: z.number().min(0).optional().nullable(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  operatingDays: z.array(z.string()).optional().nullable(),
  operatingHours: OperatingHoursSchema.optional().nullable(),
  backgroundImage: z.string().url().optional().nullable(),
  logo: z.string().url().optional().nullable(),
  heroImages: z.array(z.string().url()).optional(),
});

export const SalonCreateSchema = SalonUpdateSchema.extend({
  name: z.string().min(1).max(100),
});

export type SalonUpdateInput = z.infer<typeof SalonUpdateSchema>;
export type SalonCreateInput = z.infer<typeof SalonCreateSchema>;
