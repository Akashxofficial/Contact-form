import { useEffect, useState } from "react";
import {
  adminLogin,
  adminLogout,
  fetchInquiries,
  updateInquiryStatus,
} from "../services/inquiryApi.js";

const STATUS_OPTIONS = ["new", "contacted", "qualified", "archived"];

export default function InquiriesDrawer({ open, onClose }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [needsAuth, setNeedsAuth] = useState(false);
  const [passkey, setPasskey] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await fetchInquiries();
      setItems(data);
      setNeedsAuth(false);
    } catch (err) {
      if (err.status === 401) {
        setNeedsAuth(true);
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (open) {
      load();
    }
  }, [open]);

  async function handleLogin(e) {
    e.preventDefault();
    setLoggingIn(true);
    setError("");
    try {
      await adminLogin(passkey);
      setPasskey("");
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoggingIn(false);
    }
  }

  async function handleLogout() {
    await adminLogout();
    setItems([]);
    setNeedsAuth(true);
  }

  async function handleStatusChange(id, nextStatus) {
    try {
      const updated = await updateInquiryStatus(id, nextStatus);
      setItems((prev) =>
        prev.map((item) => (item._id === id ? updated : item))
      );
    } catch (err) {
      if (err.status === 401) {
        setNeedsAuth(true);
      } else {
        setError(err.message);
      }
    }
  }

  if (!open) return null;

  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <aside
        className="drawer-panel"
        onClick={(e) => e.stopPropagation()}
        aria-label="Lead Inbox"
      >
        <div className="drawer-header">
          <h2 className="drawer-title">
            Lead Inbox {!needsAuth ? `(${items.length})` : ""}
          </h2>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            {!needsAuth && (
              <button
                type="button"
                className="inbox-trigger"
                style={{ marginTop: 0 }}
                onClick={handleLogout}
              >
                LOGOUT
              </button>
            )}
            <button
              type="button"
              className="inbox-trigger"
              style={{ marginTop: 0 }}
              onClick={onClose}
            >
              CLOSE
            </button>
          </div>
        </div>

        {loading && <p className="lead-meta">Loading enquiries...</p>}
        {error && <p className="error-text">{error}</p>}

        {needsAuth && !loading && (
          <form
            onSubmit={handleLogin}
            style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}
          >
            <p className="lead-meta" style={{ margin: 0 }}>
              Admin authentication is required to view customer enquiries.
            </p>
            <div className="field-group">
              <label className="field-label" htmlFor="adminPasskey">
                Admin Passkey
              </label>
              <input
                id="adminPasskey"
                type="password"
                className="text-input"
                value={passkey}
                onChange={(e) => setPasskey(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>
            <button
              type="submit"
              className="send-button"
              disabled={loggingIn}
              style={{ alignSelf: "flex-start" }}
            >
              {loggingIn ? "VERIFYING..." : "UNLOCK INBOX"}
            </button>
          </form>
        )}

        {!needsAuth && !loading && !error && items.length === 0 && (
          <p className="lead-meta">No enquiries submitted yet.</p>
        )}

        {!needsAuth &&
          items.map((lead) => (
            <div key={lead._id} className="lead-card">
              <div className="lead-card-top">
                <strong>
                  {lead.salutation} {lead.firstName}{" "}
                  {lead.middleName ? `${lead.middleName} ` : ""}
                  {lead.lastName}
                </strong>
                <span
                  className={`lead-badge ${
                    lead.priority === "high" ? "lead-badge--high" : ""
                  }`}
                >
                  {lead.priority} · {lead.leadScore}/100
                </span>
              </div>

              <div className="lead-meta">
                {lead.referenceCode} · {lead.desiredHousingStyle} (
                {lead.purposeOfPurchase}) · {lead.country}
              </div>
              <div className="lead-meta">
                {lead.email}
                {lead.phone ? ` · ${lead.dialCode || ""} ${lead.phone}` : ""}
              </div>
              <div className="lead-meta">
                Budget: {lead.budgetRange} · Timeline: {lead.timeline} · Source:{" "}
                {lead.referralSource}
              </div>
              <div className="lead-meta">
                Services: {lead.enquiries?.join(", ")}
              </div>
              <p style={{ margin: "0.25rem 0", fontSize: "0.86rem" }}>
                {lead.message}
              </p>

              <div className="lead-card-top">
                <label className="lead-meta" htmlFor={`status-${lead._id}`}>
                  Pipeline Status:
                </label>
                <select
                  id={`status-${lead._id}`}
                  className="select-input"
                  style={{
                    width: "auto",
                    padding: "0.35rem 2rem 0.35rem 0.6rem",
                  }}
                  value={lead.status}
                  onChange={(e) => handleStatusChange(lead._id, e.target.value)}
                >
                  {STATUS_OPTIONS.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
      </aside>
    </div>
  );
}
