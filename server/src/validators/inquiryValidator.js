import { z } from "zod";
import mongoose from "mongoose";
import {
  ANNUAL_INCOMES,
  BUDGET_RANGES,
  CONTACT_METHODS,
  CUSTOMER_PROFILES,
  DESIGNATIONS,
  ENQUIRY_OPTIONS,
  HOUSING_STYLES,
  INDUSTRY_TYPES,
  INQUIRY_STATUSES,
  LIVING_STATUSES,
  MARITAL_STATUSES,
  PURCHASE_PURPOSES,
  REFERRAL_SOURCES,
  RESIDENTIAL_STATUSES,
  SALUTATIONS,
  TIMELINES,
} from "../models/ContactInquiry.js";

const mobileDigitsRegex = /^\d{7,15}$/;

export const createInquirySchema = z.object({
  salutation: z.enum(SALUTATIONS).optional().default("Mr."),
  firstName: z
    .string({ required_error: "First name is required." })
    .trim()
    .min(1, "First name is required.")
    .max(60, "First name must be 60 characters or fewer."),
  middleName: z.string().trim().max(60).optional().default(""),
  lastName: z
    .string({ required_error: "Last name is required." })
    .trim()
    .min(1, "Last name is required.")
    .max(60, "Last name must be 60 characters or fewer."),
  correspondenceAddress: z.string().trim().max(250).optional().default(""),
  city: z.string().trim().max(80).optional().default("Jaipur"),
  state: z.string().trim().max(80).optional().default("Rajasthan"),
  country: z.string().trim().min(1, "Country is required.").max(80).default("India"),
  pin: z.string().trim().max(20).optional().default(""),
  dialCode: z.string().trim().max(10).optional().default("+91"),
  phone: z
    .string({ required_error: "Mobile number is required." })
    .trim()
    .refine((val) => mobileDigitsRegex.test(val.replace(/\D/g, "")), {
      message: "Please enter a valid mobile number.",
    }),
  email: z
    .string({ required_error: "Email is required." })
    .trim()
    .min(1, "Email is required.")
    .email("Please enter a valid email address."),
  preferredContactMethod: z.enum(CONTACT_METHODS).optional().default("Email"),
  dateOfBirth: z.string().trim().max(20).optional().default(""),
  maritalStatus: z.enum(MARITAL_STATUSES).optional().default("Single"),
  residentialStatus: z.enum(RESIDENTIAL_STATUSES).optional().default("-None-"),
  purposeOfPurchase: z.enum(PURCHASE_PURPOSES).optional().default("End Use"),
  customerProfile: z.enum(CUSTOMER_PROFILES).optional().default("-None-"),
  companyName: z.string().trim().max(120).optional().default(""),
  industryType: z.enum(INDUSTRY_TYPES).optional().default("-None-"),
  designation: z.enum(DESIGNATIONS).optional().default("-None-"),
  department: z.string().trim().max(100).optional().default(""),
  annualIncome: z.enum(ANNUAL_INCOMES).optional().default("-None-"),
  currentLivingStatus: z.enum(LIVING_STATUSES).optional().default("Own"),
  desiredHousingStyle: z.enum(HOUSING_STYLES).optional().default("2/3 BHK"),
  timeline: z.enum(TIMELINES, {
    errorMap: () => ({ message: "Please select a purchase timeline." }),
  }),
  budgetRange: z.enum(BUDGET_RANGES).optional().default("₹50 Lakhs-₹1 Crore"),
  referralSource: z
    .enum(REFERRAL_SOURCES)
    .optional()
    .default("Company website / social media / online search"),
  channelPartnerName: z.string().trim().max(120).optional().default(""),
  empId: z.string().trim().max(60).optional().default(""),
  referralDetails: z.string().trim().max(200).optional().default(""),
  otherSourceDetails: z.string().trim().max(200).optional().default(""),
  enquiries: z.array(z.enum(ENQUIRY_OPTIONS)).optional().default([]),
  message: z
    .string({ required_error: "Message is required." })
    .trim()
    .min(10, "Please provide at least 10 characters describing your requirement.")
    .max(3000, "Message must be 3000 characters or fewer."),
  consentGiven: z.literal(true, {
    errorMap: () => ({
      message: "Please confirm permission for our team to contact you.",
    }),
  }),
  website: z.string().max(0).optional().default(""),
});

export const updateStatusSchema = z.object({
  status: z.enum(INQUIRY_STATUSES, {
    errorMap: () => ({ message: "Invalid status value." }),
  }),
});

export const listInquiriesQuerySchema = z.object({
  status: z.enum(INQUIRY_STATUSES).optional(),
  priority: z.enum(["high", "medium", "standard"]).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
});

export const inquiryIdParamSchema = z.string().refine(
  (val) =>
    mongoose.isValidObjectId(val) || /^mem_\d+_[a-z0-9]+$/i.test(val),
  { message: "Invalid enquiry identifier." }
);

export const adminLoginSchema = z.object({
  passkey: z
    .string({ required_error: "Admin passkey is required." })
    .min(8, "Passkey must be at least 8 characters.")
    .max(128, "Passkey is too long."),
});
