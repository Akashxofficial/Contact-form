import {
  createInquirySchema,
  inquiryIdParamSchema,
  listInquiriesQuerySchema,
  updateStatusSchema,
} from "../validators/inquiryValidator.js";
import {
  computeLeadQualification,
  generateReferenceCode,
} from "../utils/leadScoring.js";
import {
  createInquiryRecord,
  listInquiryRecords,
  updateInquiryStatusRecord,
} from "../storage/inquiryRepository.js";

function formatZodErrors(zodError) {
  const fieldErrors = {};
  for (const issue of zodError.issues) {
    const key = issue.path[0] || "form";
    if (!fieldErrors[key]) {
      fieldErrors[key] = issue.message;
    }
  }
  return fieldErrors;
}

export async function submitInquiry(req, res, next) {
  try {
    // Honeypot check: silently accept bots without storing junk
    if (req.body && typeof req.body.website === "string" && req.body.website.trim() !== "") {
      return res.status(201).json({
        success: true,
        message: "Thank you. Your enquiry has been received.",
        data: { referenceCode: generateReferenceCode() },
      });
    }

    const parsed = createInquirySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Please review the highlighted fields.",
        errors: formatZodErrors(parsed.error),
      });
    }

    const { website: _ignored, ...cleanData } = parsed.data;
    const { leadScore, priority } = computeLeadQualification(cleanData);
    const referenceCode = generateReferenceCode();

    const record = await createInquiryRecord({
      ...cleanData,
      referenceCode,
      leadScore,
      priority,
      status: "new",
    });

    return res.status(201).json({
      success: true,
      message:
        "Thank you for reaching out. Our real estate advisory team will respond shortly.",
      data: {
        id: record._id,
        referenceCode: record.referenceCode,
        priority: record.priority,
        leadScore: record.leadScore,
        createdAt: record.createdAt,
      },
    });
  } catch (err) {
    return next(err);
  }
}

export async function getInquiries(req, res, next) {
  try {
    const parsedQuery = listInquiriesQuerySchema.safeParse(req.query);
    if (!parsedQuery.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid filter parameters.",
        errors: formatZodErrors(parsedQuery.error),
      });
    }

    const { status, priority, limit } = parsedQuery.data;
    const records = await listInquiryRecords({
      status,
      priority,
      limit,
    });

    return res.json({
      success: true,
      count: records.length,
      data: records,
    });
  } catch (err) {
    return next(err);
  }
}

export async function updateInquiryStatus(req, res, next) {
  try {
    const idCheck = inquiryIdParamSchema.safeParse(req.params.id);
    if (!idCheck.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid enquiry identifier.",
      });
    }

    const parsed = updateStatusSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid status update.",
        errors: formatZodErrors(parsed.error),
      });
    }

    const updated = await updateInquiryStatusRecord(
      idCheck.data,
      parsed.data.status
    );
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Enquiry not found.",
      });
    }

    return res.json({
      success: true,
      data: updated,
    });
  } catch (err) {
    return next(err);
  }
}

