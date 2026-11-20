const API_BASE = import.meta.env.VITE_API_URL || "/api";

export async function submitContactInquiry(payload) {
  const response = await fetch(`${API_BASE}/inquiries`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.message || "Unable to submit enquiry.");
    error.fieldErrors = data.errors || {};
    error.status = response.status;
    throw error;
  }

  return data;
}

export async function fetchInquiries() {
  const response = await fetch(`${API_BASE}/inquiries`, {
    credentials: "include",
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.message || "Unable to load enquiries.");
    error.status = response.status;
    throw error;
  }
  return data.data || [];
}

export async function updateInquiryStatus(id, status) {
  const response = await fetch(`${API_BASE}/inquiries/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ status }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.message || "Unable to update status.");
    error.status = response.status;
    throw error;
  }
  return data.data;
}

export async function adminLogin(passkey) {
  const response = await fetch(`${API_BASE}/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ passkey }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "Authentication failed.");
  }
  return data;
}

export async function adminLogout() {
  await fetch(`${API_BASE}/admin/logout`, {
    method: "POST",
    credentials: "include",
  });
}
