import { useState } from "react";
import {
  BUDGET_RANGES,
  COUNTRIES,
  HOUSING_STYLES,
  PURCHASE_PURPOSES,
  REFERRAL_SOURCES,
  SALUTATIONS,
  TIMELINES,
} from "../constants/formOptions.js";
import { submitContactInquiry } from "../services/inquiryApi.js";

const INITIAL_STATE = {
  salutation: "Mr.",
  firstName: "",
  lastName: "",
  country: "India",
  dialCode: "+91",
  phone: "",
  email: "",
  purposeOfPurchase: "End Use",
  desiredHousingStyle: "2/3 BHK",
  timeline: "1-3 Months",
  budgetRange: "₹50 Lakhs-₹1 Crore",
  referralSource: "Company Website",
  channelPartnerName: "",
  empId: "",
  referralDetails: "",
  otherSourceDetails: "",
  message: "",
  consentGiven: false,
  website: "",
};

function getCountryMeta(countryName) {
  return (
    COUNTRIES.find((c) => c.name === countryName) || {
      name: "India",
      code: "+91",
      iso: "in",
      digitLength: 10,
    }
  );
}

function validateForm(values) {
  const errors = {};
  const countryMeta = getCountryMeta(values.country);
  const digits = values.phone.replace(/\D/g, "");

  if (!values.firstName.trim()) errors.firstName = "First name is required.";
  if (!values.lastName.trim()) errors.lastName = "Last name is required.";
  if (!values.country.trim()) errors.country = "Country is required.";

  if (!digits) {
    errors.phone = "Mobile number is required.";
  } else if (digits.length !== countryMeta.digitLength) {
    errors.phone = `Enter exactly ${countryMeta.digitLength} digits for ${countryMeta.name} (${countryMeta.code}).`;
  }

  if (!values.email.trim()) {
    errors.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = "Please enter a valid email address.";
  }

  if (
    values.referralSource === "Channel Partner" &&
    !values.channelPartnerName.trim()
  ) {
    errors.channelPartnerName = "Channel Partner name is required.";
  }
  if (values.referralSource === "Employee Referral" && !values.empId.trim()) {
    errors.empId = "Employee ID is required.";
  }
  if (
    values.referralSource.includes("Referral from") &&
    !values.referralDetails.trim()
  ) {
    errors.referralDetails = "Referral details are required.";
  }

  if (!values.timeline) errors.timeline = "Please select a purchase timeline.";
  if (values.message.trim().length < 10) {
    errors.message = "Please enter at least 10 characters.";
  }
  if (!values.consentGiven) {
    errors.consentGiven =
      "Please confirm permission for our team to contact you.";
  }
  return errors;
}

export default function ContactForm({ onSubmitted }) {
  const [form, setForm] = useState(INITIAL_STATE);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [successData, setSuccessData] = useState(null);

  const countryMeta = getCountryMeta(form.country);
  const phoneDigits = form.phone.replace(/\D/g, "");

  function handleChange(e) {
    const { name, value, type, checked } = e.target;

    if (name === "country") {
      const nextCountry = getCountryMeta(value);
      setForm((prev) => ({
        ...prev,
        country: value,
        dialCode: nextCountry.code,
        phone: prev.phone.replace(/\D/g, "").slice(0, nextCountry.digitLength),
      }));
    } else if (name === "phone") {
      const digitsOnly = value
        .replace(/\D/g, "")
        .slice(0, countryMeta.digitLength);

      setForm((prev) => ({ ...prev, phone: digitsOnly }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError("");
    setSuccessData(null);

    const clientErrors = validateForm(form);
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      return;
    }

    setSubmitting(true);
    try {
      const response = await submitContactInquiry(form);
      setSuccessData(response.data);
      setForm(INITIAL_STATE);
      setErrors({});
      if (onSubmitted) onSubmitted(response.data);
    } catch (err) {
      if (err.fieldErrors && Object.keys(err.fieldErrors).length > 0) {
        setErrors(err.fieldErrors);
      }
      setServerError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit} noValidate>
      {successData && (
        <div className="status-banner" role="status">
          <strong>Enquiry Received</strong> — Thank you for contacting UrbanGaon
          × AXIO. Our advisory team will follow up shortly.
          <div className="status-meta">
            Reference: <strong>{successData.referenceCode}</strong> · Lead
            Priority: <strong>{successData.priority?.toUpperCase()}</strong>
          </div>
        </div>
      )}

      {serverError && (
        <div className="status-banner status-banner--error" role="alert">
          {serverError}
        </div>
      )}

      {/* Name (Mandatory: Title, First Name, Last Name) */}
      <div className="field-group">
        <span className="group-title">Name</span>
        <div
          className="name-row"
          style={{ gridTemplateColumns: "92px 1fr 1fr" }}
        >
          <div className="field-group">
            <label className="field-label" htmlFor="salutation">
              Title
            </label>
            <select
              id="salutation"
              name="salutation"
              className="select-input"
              value={form.salutation}
              onChange={handleChange}
            >
              {SALUTATIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="field-group">
            <label className="field-label" htmlFor="firstName">
              First Name <span className="required-tag">(required)</span>
            </label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              placeholder="e.g. Rajesh"
              className={`text-input ${errors.firstName ? "input-error" : ""}`}
              value={form.firstName}
              onChange={handleChange}
              autoComplete="given-name"
              aria-invalid={Boolean(errors.firstName)}
            />
            {errors.firstName && (
              <span className="error-text">{errors.firstName}</span>
            )}
          </div>

          <div className="field-group">
            <label className="field-label" htmlFor="lastName">
              Last Name <span className="required-tag">(required)</span>
            </label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              placeholder="e.g. Sharma"
              className={`text-input ${errors.lastName ? "input-error" : ""}`}
              value={form.lastName}
              onChange={handleChange}
              autoComplete="family-name"
              aria-invalid={Boolean(errors.lastName)}
            />
            {errors.lastName && (
              <span className="error-text">{errors.lastName}</span>
            )}
          </div>
        </div>
      </div>

      {/* Country & Mobile Number (Flag + Auto-synced dial code + exact digit count) */}
      <div className="two-col">
        <div className="field-group">
          <label className="field-label" htmlFor="country">
            Country <span className="required-tag">(required)</span>
          </label>
          <div className="phone-group">
            <span className="dial-code-badge" aria-hidden="true">
              <img
                src={`https://flagcdn.com/w20/${countryMeta.iso}.png`}
                alt=""
                width="20"
                height="14"
                style={{ display: "block", objectFit: "cover" }}
              />
            </span>
            <select
              id="country"
              name="country"
              className={`select-input ${errors.country ? "input-error" : ""}`}
              value={form.country}
              onChange={handleChange}
            >
              {COUNTRIES.map((c) => (
                <option key={c.iso} value={c.name}>
                  {c.name} ({c.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="field-group">
          <label className="field-label" htmlFor="phone">
            Mobile Number{" "}
            <span className="required-tag">
              ({phoneDigits.length}/{countryMeta.digitLength} Digits)
            </span>
          </label>
          <div className="phone-group">
            <span className="dial-code-badge">{form.dialCode}</span>
            <input
              id="phone"
              name="phone"
              type="tel"
              inputMode="numeric"
              placeholder="9876543210"
              className={`text-input ${errors.phone ? "input-error" : ""}`}
              value={form.phone}
              onChange={handleChange}
              autoComplete="tel-national"
              aria-invalid={Boolean(errors.phone)}
            />
          </div>
          {errors.phone && <span className="error-text">{errors.phone}</span>}
        </div>
      </div>

      {/* Email Address */}
      <div className="field-group">
        <label className="field-label" htmlFor="email">
          Email Address <span className="required-tag">(required)</span>
        </label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="rajesh.sharma@gmail.com"
          className={`text-input ${errors.email ? "input-error" : ""}`}
          value={form.email}
          onChange={handleChange}
          autoComplete="email"
          aria-invalid={Boolean(errors.email)}
        />
        {errors.email && <span className="error-text">{errors.email}</span>}
      </div>

      {/* Core CRM Buying Intent Dropdowns (Synced 1:1 with CRM) */}
      <div className="two-col">
        <div className="field-group">
          <label className="field-label" htmlFor="desiredHousingStyle">
            Desired Housing Style{" "}
            <span className="required-tag">(required)</span>
          </label>
          <select
            id="desiredHousingStyle"
            name="desiredHousingStyle"
            className="select-input"
            value={form.desiredHousingStyle}
            onChange={handleChange}
          >
            {HOUSING_STYLES.map((hs) => (
              <option key={hs} value={hs}>
                {hs}
              </option>
            ))}
          </select>
        </div>

        <div className="field-group">
          <label className="field-label" htmlFor="purposeOfPurchase">
            Purpose of Purchase <span className="required-tag">(required)</span>
          </label>
          <select
            id="purposeOfPurchase"
            name="purposeOfPurchase"
            className="select-input"
            value={form.purposeOfPurchase}
            onChange={handleChange}
          >
            {PURCHASE_PURPOSES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="two-col">
        <div className="field-group">
          <label className="field-label" htmlFor="timeline">
            Purchase Timelines <span className="required-tag">(required)</span>
          </label>
          <select
            id="timeline"
            name="timeline"
            className={`select-input ${errors.timeline ? "input-error" : ""}`}
            value={form.timeline}
            onChange={handleChange}
          >
            {TIMELINES.map((tl) => (
              <option key={tl} value={tl}>
                {tl}
              </option>
            ))}
          </select>
          {errors.timeline && (
            <span className="error-text">{errors.timeline}</span>
          )}
        </div>

        <div className="field-group">
          <label className="field-label" htmlFor="budgetRange">
            Overall Budget Range{" "}
            <span className="required-tag">(required)</span>
          </label>
          <select
            id="budgetRange"
            name="budgetRange"
            className="select-input"
            value={form.budgetRange}
            onChange={handleChange}
          >
            {BUDGET_RANGES.map((br) => (
              <option key={br} value={br}>
                {br}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Lead Source (Synced 1:1 with CRM + conditional mandatory sub-fields) */}
      <div className="field-group">
        <label className="field-label" htmlFor="referralSource">
          How did you first hear about this Project?{" "}
          <span className="required-tag">(required)</span>
        </label>
        <select
          id="referralSource"
          name="referralSource"
          className="select-input"
          value={form.referralSource}
          onChange={handleChange}
        >
          {REFERRAL_SOURCES.map((src) => (
            <option key={src} value={src}>
              {src}
            </option>
          ))}
        </select>
      </div>

      {form.referralSource === "Channel Partner" && (
        <div className="field-group">
          <label className="field-label" htmlFor="channelPartnerName">
            Channel Partner Name <span className="required-tag">(required)</span>
          </label>
          <input
            id="channelPartnerName"
            name="channelPartnerName"
            type="text"
            placeholder="e.g. Horizon Realty Partners"
            className={`text-input ${errors.channelPartnerName ? "input-error" : ""}`}
            value={form.channelPartnerName}
            onChange={handleChange}
          />
          {errors.channelPartnerName && (
            <span className="error-text">{errors.channelPartnerName}</span>
          )}
        </div>
      )}

      {form.referralSource === "Employee Referral" && (
        <div className="field-group">
          <label className="field-label" htmlFor="empId">
            Employee Referral Emp ID{" "}
            <span className="required-tag">(required)</span>
          </label>
          <input
            id="empId"
            name="empId"
            type="text"
            placeholder="e.g. EMP-9204"
            className={`text-input ${errors.empId ? "input-error" : ""}`}
            value={form.empId}
            onChange={handleChange}
          />
          {errors.empId && <span className="error-text">{errors.empId}</span>}
        </div>
      )}

      {form.referralSource.includes("Referral from") && (
        <div className="field-group">
          <label className="field-label" htmlFor="referralDetails">
            Referral Details / Existing Unit / Name{" "}
            <span className="required-tag">(required)</span>
          </label>
          <input
            id="referralDetails"
            name="referralDetails"
            type="text"
            placeholder="Friend/family or Existing Customer unit no. & name..."
            className={`text-input ${errors.referralDetails ? "input-error" : ""}`}
            value={form.referralDetails}
            onChange={handleChange}
          />
          {errors.referralDetails && (
            <span className="error-text">{errors.referralDetails}</span>
          )}
        </div>
      )}

      {form.referralSource === "Other" && (
        <div className="field-group">
          <label className="field-label" htmlFor="otherSourceDetails">
            Other Source Details
          </label>
          <input
            id="otherSourceDetails"
            name="otherSourceDetails"
            type="text"
            placeholder="Please specify..."
            className="text-input"
            value={form.otherSourceDetails}
            onChange={handleChange}
          />
        </div>
      )}

      {/* Message */}
      <div className="field-group">
        <label className="field-label" htmlFor="message">
          Message <span className="required-tag">(required)</span>
        </label>
        <textarea
          id="message"
          name="message"
          className={`textarea-input ${errors.message ? "input-error" : ""}`}
          value={form.message}
          onChange={handleChange}
          placeholder="Tell us about your preferred project, unit configuration, or site visit timing..."
          aria-invalid={Boolean(errors.message)}
        />
        {errors.message && <span className="error-text">{errors.message}</span>}
      </div>

      {/* Consent */}
      <div className="field-group consent-row">
        <label className="checkbox-item">
          <input
            type="checkbox"
            name="consentGiven"
            checked={form.consentGiven}
            onChange={handleChange}
          />
          <span>
            I agree to be contacted by UrbanGaon regarding my property enquiry.{" "}
            <span className="required-tag">(required)</span>
          </span>
        </label>
        {errors.consentGiven && (
          <span className="error-text">{errors.consentGiven}</span>
        )}
      </div>

      {/* Anti-bot honeypot */}
      <div className="hp-field" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input
          id="website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={form.website}
          onChange={handleChange}
        />
      </div>

      <div className="submit-row">
        <button type="submit" className="send-button" disabled={submitting}>
          {submitting ? "SENDING..." : "SEND"}
        </button>
      </div>
    </form>
  );
}
