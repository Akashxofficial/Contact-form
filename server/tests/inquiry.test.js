import test from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { createApp } from "../src/app.js";

process.env.ADMIN_API_KEY = "test-admin-passkey-123456";
process.env.ADMIN_SESSION_SECRET = "test-session-secret-abcdef-1234567890";

function startTestServer() {
  const app = createApp();
  const server = http.createServer(app);
  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address();
      resolve({ server, baseUrl: `http://127.0.0.1:${port}` });
    });
  });
}

test("GET /api/health returns ok", async () => {
  const { server, baseUrl } = await startTestServer();
  try {
    const res = await fetch(`${baseUrl}/api/health`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.ok, true);
    assert.ok(["mongodb", "memory-fallback"].includes(body.storage));
  } finally {
    server.close();
  }
});

test("Unauthenticated GET and PATCH on /api/inquiries are rejected with 401", async () => {
  const { server, baseUrl } = await startTestServer();
  try {
    const listRes = await fetch(`${baseUrl}/api/inquiries`);
    assert.equal(listRes.status, 401);

    const patchRes = await fetch(`${baseUrl}/api/inquiries/mem_123_abc/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "qualified" }),
    });
    assert.equal(patchRes.status, 401);
  } finally {
    server.close();
  }
});

test("POST /api/inquiries rejects invalid payload with field errors", async () => {
  const { server, baseUrl } = await startTestServer();
  try {
    const res = await fetch(`${baseUrl}/api/inquiries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: "",
        email: "not-an-email",
        enquiries: [],
      }),
    });
    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.ok(body.errors.firstName);
    assert.ok(body.errors.email);
    assert.ok(body.errors.phone);
  } finally {
    server.close();
  }
});

test("Full authenticated admin flow, NoSQL query validation, and ID validation", async () => {
  const { server, baseUrl } = await startTestServer();
  try {
    // 1. Create a lead publicly
    const payload = {
      salutation: "Mr.",
      firstName: "Rajesh",
      lastName: "Sharma",
      country: "India",
      dialCode: "+91",
      phone: "9876543210",
      email: "rajesh.sharma@gmail.com",
      purposeOfPurchase: "Investment",
      desiredHousingStyle: "Plot",
      timeline: "With in 1 Month",
      budgetRange: ">₹1 Crore",
      referralSource: "Channel Partner",
      channelPartnerName: "Horizon Realty Partners",
      enquiries: ["Property Acquisition / Sales", "Home Staging"],
      message:
        "Interested in a corner residential plot at UrbanGaon Jaipur for immediate investment.",
      consentGiven: true,
    };

    const createRes = await fetch(`${baseUrl}/api/inquiries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    assert.equal(createRes.status, 201);
    const created = await createRes.json();
    assert.equal(created.success, true);
    assert.match(created.data.referenceCode, /^UG-\d{4}-[A-F0-9]{6}$/);
    assert.equal(created.data.priority, "high");

    // 2. Reject invalid admin login
    const badLogin = await fetch(`${baseUrl}/api/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ passkey: "wrong-passkey-123" }),
    });
    assert.equal(badLogin.status, 401);

    // 3. Valid admin login sets HttpOnly cookie
    const loginRes = await fetch(`${baseUrl}/api/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ passkey: process.env.ADMIN_API_KEY }),
    });
    assert.equal(loginRes.status, 200);
    const setCookie = loginRes.headers.get("set-cookie");
    assert.ok(setCookie && setCookie.includes("HttpOnly"));
    const cookiePair = setCookie.split(";")[0];

    // 4. Reject invalid status filter (NoSQL operator injection protection)
    const badFilter = await fetch(`${baseUrl}/api/inquiries?status[$ne]=new`, {
      headers: { Cookie: cookiePair },
    });
    assert.equal(badFilter.status, 400);

    // 5. Reject malformed inquiry ID
    const badIdRes = await fetch(
      `${baseUrl}/api/inquiries/not-a-valid-id/status`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookiePair,
        },
        body: JSON.stringify({ status: "qualified" }),
      }
    );
    assert.equal(badIdRes.status, 400);

    // 6. List and update status with valid session cookie
    const listRes = await fetch(`${baseUrl}/api/inquiries`, {
      headers: { Cookie: cookiePair },
    });
    assert.equal(listRes.status, 200);
    const listBody = await listRes.json();
    assert.ok(listBody.count >= 1);

    const patchRes = await fetch(
      `${baseUrl}/api/inquiries/${created.data.id}/status`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookiePair,
        },
        body: JSON.stringify({ status: "qualified" }),
      }
    );
    assert.equal(patchRes.status, 200);
    const patched = await patchRes.json();
    assert.equal(patched.data.status, "qualified");
  } finally {
    server.close();
  }
});
