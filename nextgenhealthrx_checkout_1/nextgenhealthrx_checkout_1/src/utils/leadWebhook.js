import { SITE_ID } from "./Constant";

export const LEAD_WEBHOOK_URL =
  "https://n8n.whitelabelmd.com/webhook/f7e33dc8-c81c-4879-b36b-eafe07e02c65";

const STORAGE_KEY = "ngrx_questionnaire";
const LAST_SENT_KEY = "ngrx_lead_webhook_last_payload";

const QUERY_ALIASES = {
  state: ["state", "state_name"],
  first_name: ["first_name", "fname", "firstName"],
  last_name: ["last_name", "lname", "lastName"],
  email: ["email"],
  email_consent: ["email_consent"],
  phone: ["phone", "phone_number"],
  sms_consent: ["sms_consent"],
  dob: ["dob", "date_of_birth"],
  gender: ["gender"],
  bmi: ["bmi"],
  weight_current: ["weight_current", "weight", "current_weight"],
  weight_goal: ["weight_goal", "goal_weight"],
  taking_weight_loss_meds: ["taking_weight_loss_meds"],
  weight_loss_medications_currently_taking: [
    "weight_loss_medications_currently_taking",
  ],
  medication_trying_to_get: ["medication_trying_to_get"],
  source_url: ["source_url"],
  click_id: ["click_id", "clickid", "cid"],
  utm_source: ["utm_source"],
  utm_medium: ["utm_medium"],
  utm_term: ["utm_term"],
  utm_campaign: ["utm_campaign"],
  utm_content: ["utm_content"],
  fbclid: ["fbclid"],
  google_click_id: ["google_click_id", "gclid"],
  msclkid: ["msclkid"],
  medication_dose: ["medication_dose"],
  ed_prior_treatments: ["ed_prior_treatments"],
  ed_problem_duration: ["ed_problem_duration"],
};

const SIGNAL_KEYS = [
  "state",
  "first_name",
  "last_name",
  "email",
  "phone",
  "dob",
  "gender",
  "bmi",
  "weight_current",
  "weight_goal",
  "taking_weight_loss_meds",
  "weight_loss_medications_currently_taking",
  "medication_trying_to_get",
  "click_id",
  "fbclid",
  "google_click_id",
  "msclkid",
  "medication_dose",
  "ed_prior_treatments",
  "ed_problem_duration",
];

const readQuery = (params, keys) => {
  for (const key of keys) {
    const value = params.get(key);
    if (value !== null && String(value).trim() !== "") return value;
  }
  return "";
};

const asString = (value) =>
  value === null || value === undefined ? "" : String(value);

const asNumberOrNull = (value) => {
  if (value === null || value === undefined || String(value).trim() === "") {
    return null;
  }
  const number = parseFloat(String(value).replace(/,/g, ""));
  return Number.isFinite(number) ? number : null;
};

const hasText = (value) =>
  value !== null && value !== undefined && String(value).trim() !== "";

export function loadQuestionnaire() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (error) {
    return {};
  }
}

export function persistQuestionnaire(partial) {
  const next = { ...loadQuestionnaire(), ...partial };
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch (error) {
    // Ignore storage failures; the webhook can still send.
  }
  return next;
}

export function captureQuestionnaireFromLocation() {
  const params = new URLSearchParams(window.location.search);
  const stored = loadQuestionnaire();
  const captured = {};

  Object.entries(QUERY_ALIASES).forEach(([field, aliases]) => {
    const fromUrl = readQuery(params, aliases);
    captured[field] = fromUrl || stored[field] || "";
  });

  if (!captured.source_url) {
    captured.source_url = document.referrer || window.location.href;
  }

  return persistQuestionnaire(captured);
}

function pick(form, stored, key) {
  if (form && Object.prototype.hasOwnProperty.call(form, key) && hasText(form[key])) {
    return form[key];
  }
  if (hasText(stored[key])) return stored[key];
  return "";
}

export function buildLeadPayload(form = {}) {
  const stored = loadQuestionnaire();
  const rawSms = pick(form, stored, "sms_consent");
  const sms = /^(yes|true|1)$/i.test(String(rawSms)) ? "yes" : "no";
  const rawEmailConsent = pick(form, stored, "email_consent");
  const emailConsent = rawEmailConsent
    ? /^(yes|true|1)$/i.test(String(rawEmailConsent))
      ? "yes"
      : "no"
    : "";

  return {
    site_id: String(SITE_ID),
    state: asString(pick(form, stored, "state")),
    first_name: asString(pick(form, stored, "first_name")),
    last_name: asString(pick(form, stored, "last_name")),
    email: asString(pick(form, stored, "email")),
    email_consent: emailConsent,
    phone: asString(pick(form, stored, "phone")),
    sms_consent: sms,
    dob: asString(pick(form, stored, "dob")),
    gender: asString(pick(form, stored, "gender")),
    bmi: asNumberOrNull(pick(form, stored, "bmi")),
    weight_current: asNumberOrNull(pick(form, stored, "weight_current")),
    weight_goal: asNumberOrNull(pick(form, stored, "weight_goal")),
    taking_weight_loss_meds: asString(pick(form, stored, "taking_weight_loss_meds")),
    weight_loss_medications_currently_taking: asString(
      pick(form, stored, "weight_loss_medications_currently_taking")
    ),
    medication_trying_to_get: asString(pick(form, stored, "medication_trying_to_get")),
    source_url: asString(
      pick(form, stored, "source_url") || document.referrer || window.location.href
    ),
    click_id: asString(pick(form, stored, "click_id")),
    utm_source: asString(pick(form, stored, "utm_source")),
    utm_medium: asString(pick(form, stored, "utm_medium")),
    utm_term: asString(pick(form, stored, "utm_term")),
    utm_campaign: asString(pick(form, stored, "utm_campaign")),
    utm_content: asString(pick(form, stored, "utm_content")),
    fbclid: asString(pick(form, stored, "fbclid")),
    google_click_id: asString(pick(form, stored, "google_click_id")),
    msclkid: asString(pick(form, stored, "msclkid")),
    medication_dose: asString(pick(form, stored, "medication_dose")),
    ed_prior_treatments: asString(pick(form, stored, "ed_prior_treatments")),
    ed_problem_duration: asString(pick(form, stored, "ed_problem_duration")),
  };
}

function hasLeadSignal(payload) {
  return SIGNAL_KEYS.some((key) => {
    const value = payload[key];
    return value !== null && value !== undefined && String(value).trim() !== "";
  });
}

let inFlightPayload = "";

export async function sendLeadWebhook(form = {}) {
  const payload = buildLeadPayload(form);
  const partial = {};
  Object.entries(form).forEach(([key, value]) => {
    if (hasText(value)) partial[key] = value;
  });
  if (payload.source_url) partial.source_url = payload.source_url;
  persistQuestionnaire(partial);

  if (!hasLeadSignal(payload)) return;

  const serialized = JSON.stringify(payload);
  try {
    if (
      inFlightPayload === serialized ||
      sessionStorage.getItem(LAST_SENT_KEY) === serialized
    ) {
      return;
    }
  } catch (error) {
    if (inFlightPayload === serialized) return;
  }

  inFlightPayload = serialized;

  try {
    const response = await fetch(LEAD_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: serialized,
      keepalive: true,
    });
    if (response.ok) {
      sessionStorage.setItem(LAST_SENT_KEY, serialized);
      console.info("Lead webhook sent", response.status);
    } else {
      console.error("Lead webhook failed", response.status);
      if (inFlightPayload === serialized) inFlightPayload = "";
    }
  } catch (error) {
    console.error("Lead webhook failed", error);
    if (inFlightPayload === serialized) inFlightPayload = "";
  }
}
