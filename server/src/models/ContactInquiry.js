import mongoose from "mongoose";

export const SALUTATIONS = ["Mr.", "Ms.", "Mrs."];

export const MARITAL_STATUSES = ["Single", "Married"];

export const RESIDENTIAL_STATUSES = [
  "-None-",
  "Resident",
  "Non-Resident",
  "Foreign National of Indian Origin",
];

export const PURCHASE_PURPOSES = ["Investment", "End Use"];

export const CUSTOMER_PROFILES = [
  "-None-",
  "Self Employed",
  "Private Service",
  "Govt. Service",
  "Retired",
  "NRI",
  "Housewife",
];

export const INDUSTRY_TYPES = [
  "-None-",
  "Banking & Finance",
  "Consulting",
  "Insurance",
  "Legal",
  "Accounting",
  "Investment Management",
  "Healthcare",
  "Pharmaceuticals",
  "Wellness",
  "Medical Devices",
  "Information Technology",
  "Software Development",
  "Telecommunications",
  "Technology",
  "Cloud Computing",
  "Arts & Culture",
  "Entertainment",
  "Fashion & Apparel",
  "Media & Publishing",
  "Advertising",
  "Agriculture",
  "Automotive",
  "Aviation",
  "Construction",
  "Energy & Utilities",
  "Manufacturing",
  "Mining & Metals",
  "Chemicals",
  "Education",
  "Government & Public Sector",
  "Hospitality & Tourism",
  "Non-Profit",
  "Real Estate",
  "Retail",
  "Sports & Recreation",
  "Transportation & Logistics",
  "Primary & Secondary Education",
  "Higher Education",
  "Vocational Training",
  "Online Learning",
  "Defense & Security",
  "E-Commerce",
  "Environmental Services",
  "Food & Beverage",
  "Gaming",
  "Marine",
  "Research & Development",
  "Supply Chain Management",
  "Startups",
  "Other",
];

export const DESIGNATIONS = [
  "-None-",
  "CEO",
  "CTO",
  "CFO",
  "Vice President (VP)",
  "Country Head / Regional Head",
  "Executive",
  "Director",
  "Director / Executive Director",
  "Assistant / Associate Vice President (Avp)",
  "Senior Manager",
  "General Manager (GM)",
  "Manager",
  "Supervisor",
  "Operations Manager",
  "Team-Lead",
  "Architect",
  "Sales / Business Development Manager",
  "Marketing Manager",
  "Hr Manager",
  "Finance / Accounts Manager",
  "Project / Program Manager",
  "Product Manager",
  "Assistant Manager",
  "Team Lead / Supervisor",
  "Senior Executive / Senior Officer",
  "Coordinator",
  "Executive / Officer / Associate",
  "Engineer / Developer / Analyst",
  "Consultant / Specialist",
  "Intern",
  "Product-Manager",
  "Project-Manager",
  "Business-Analyst",
  "HR-Specialist",
  "Marketing-Specialist",
  "Sales-Representative",
  "Customer-Service-Rep",
  "Financial-Analyst",
  "Advisor",
  "Freelancer / Self-Employed",
  "Intern / Trainee",
  "Student",
  "Homemaker",
  "Retired",
  "Other / Not Applicable",
];

export const ANNUAL_INCOMES = [
  "-None-",
  "Upto 10 Lakhs",
  "10-50 Lakhs",
  "More than 50 Lakhs",
  "Prefer not to disclose",
];

export const LIVING_STATUSES = ["Own", "Rent"];

export const HOUSING_STYLES = ["Plot", "2/3 BHK", "Serviced Apartment"];

export const TIMELINES = ["With in 1 Month", "1-3 Months", "6-12 Months"];

export const BUDGET_RANGES = [
  "<₹50 Lakhs",
  "₹50 Lakhs-₹1 Crore",
  ">₹1 Crore",
  "Prefer not to disclose",
];

export const REFERRAL_SOURCES = [
  "Newspaper/magazine ad",
  "Hoarding/billboard",
  "Email/SMS/ Whats app campaign",
  "Event/Exhibition",
  "Channel Partner",
  "Employee Referral",
  "Referral from friend/family/ Existing Customer",
  "Company Website",
  "Social Media",
  "Online Search",
  "Real estate portal (e.g., Magic Bricks, 99acres)",
  "Other",
];

export const ENQUIRY_OPTIONS = [
  "Home Staging",
  "Home Improvement",
  "Warehousing",
  "Property Acquisition / Sales",
  "Interior Design & Fit-Out",
  "Commercial Leasing",
];

export const CONTACT_METHODS = ["Email", "Phone", "WhatsApp / SMS"];

export const INQUIRY_STATUSES = ["new", "contacted", "qualified", "archived"];

const contactInquirySchema = new mongoose.Schema(
  {
    referenceCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    salutation: {
      type: String,
      enum: SALUTATIONS,
      default: "Mr.",
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 60,
    },
    middleName: {
      type: String,
      trim: true,
      maxlength: 60,
      default: "",
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 60,
    },
    correspondenceAddress: {
      type: String,
      trim: true,
      maxlength: 250,
      default: "",
    },
    city: { type: String, trim: true, maxlength: 80, default: "Jaipur" },
    state: { type: String, trim: true, maxlength: 80, default: "Rajasthan" },
    country: { type: String, trim: true, maxlength: 80, default: "India" },
    pin: { type: String, trim: true, maxlength: 20, default: "" },
    dialCode: { type: String, trim: true, maxlength: 10, default: "+91" },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    preferredContactMethod: {
      type: String,
      enum: CONTACT_METHODS,
      default: "Email",
    },
    dateOfBirth: { type: String, trim: true, default: "" },
    maritalStatus: {
      type: String,
      enum: MARITAL_STATUSES,
      default: "Single",
    },
    residentialStatus: {
      type: String,
      enum: RESIDENTIAL_STATUSES,
      default: "-None-",
    },
    purposeOfPurchase: {
      type: String,
      enum: PURCHASE_PURPOSES,
      default: "End Use",
    },
    customerProfile: {
      type: String,
      enum: CUSTOMER_PROFILES,
      default: "-None-",
    },
    companyName: { type: String, trim: true, maxlength: 120, default: "" },
    industryType: {
      type: String,
      enum: INDUSTRY_TYPES,
      default: "-None-",
    },
    designation: {
      type: String,
      enum: DESIGNATIONS,
      default: "-None-",
    },
    department: { type: String, trim: true, maxlength: 100, default: "" },
    annualIncome: {
      type: String,
      enum: ANNUAL_INCOMES,
      default: "-None-",
    },
    currentLivingStatus: {
      type: String,
      enum: LIVING_STATUSES,
      default: "Own",
    },
    desiredHousingStyle: {
      type: String,
      enum: HOUSING_STYLES,
      default: "2/3 BHK",
    },
    timeline: {
      type: String,
      enum: TIMELINES,
      required: true,
    },
    budgetRange: {
      type: String,
      enum: BUDGET_RANGES,
      default: "₹50 Lakhs-₹1 Crore",
    },
    referralSource: {
      type: String,
      enum: REFERRAL_SOURCES,
      default: "Company Website",
    },
    channelPartnerName: { type: String, trim: true, maxlength: 120, default: "" },
    empId: { type: String, trim: true, maxlength: 60, default: "" },
    referralDetails: { type: String, trim: true, maxlength: 200, default: "" },
    otherSourceDetails: { type: String, trim: true, maxlength: 200, default: "" },
    enquiries: {
      type: [String],
      enum: ENQUIRY_OPTIONS,
      default: [],
    },
    message: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 3000,
    },
    consentGiven: {
      type: Boolean,
      required: true,
      validate: {
        validator: (v) => v === true,
        message: "Consent is required to submit an enquiry.",
      },
    },
    leadScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 50,
    },
    priority: {
      type: String,
      enum: ["high", "medium", "standard"],
      default: "standard",
      index: true,
    },
    status: {
      type: String,
      enum: INQUIRY_STATUSES,
      default: "new",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

contactInquirySchema.index({ createdAt: -1 });

export const ContactInquiry = mongoose.model(
  "ContactInquiry",
  contactInquirySchema
);
