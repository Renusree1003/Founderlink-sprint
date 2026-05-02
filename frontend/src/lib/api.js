import axios from "axios";
import { getToken } from "./storage";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" }
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function toMessage(error) {
  if (error?.response?.data) {
    if (typeof error.response.data === "string") return error.response.data;
    if (error.response.data.message) return error.response.data.message;
    return JSON.stringify(error.response.data);
  }
  return error.message || "Request failed";
}

/* ── Auth ── */
export const login      = (d) => api.post("/auth/login", d).then(r => r.data);
export const register   = (d) => api.post("/auth/register", d).then(r => r.data);
export const verifyOtp  = (d) => api.post("/auth/verify-otp", d).then(r => r.data);
export const resendOtp  = (d) => api.post("/auth/resend-otp", d).then(r => r.data);
export const forgotPassword = (d) => api.post("/auth/forgot-password", d).then(r => r.data);
export const resetPassword  = (d) => api.post("/auth/reset-password", d).then(r => r.data);

/* ── Users ── */
export const getUsers         = ()     => api.get("/users").then(r => r.data);
export const getUserById      = (id)   => api.get(`/users/${id}`).then(r => r.data);
export const getUserByUsername= (u)    => api.get(`/users/internal/username/${encodeURIComponent(u)}`).then(r => r.data);
export const createUserProfile= (d)    => api.post("/users", d).then(r => r.data);
export const updateUserProfile= (id,d) => api.put(`/users/${id}`, d).then(r => r.data);

/* ── Startups ── */
export const getStartups = (params = {}) => {
  const qp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") qp.append(k, v);
  });
  const qs = qp.toString();
  return api.get(`/startups${qs ? "?" + qs : ""}`).then(r => r.data);
};
export const getStartupById  = (id)   => api.get(`/startups/${id}`).then(r => r.data);
export const createStartup   = (d)    => api.post("/startups", d).then(r => r.data);
export const updateStartup   = (id,d) => api.put(`/startups/${id}`, d).then(r => r.data);
export const deleteStartup   = (id)   => api.delete(`/startups/${id}`).then(r => r.data);

/* ── Startup File Uploads ── */
export const uploadStartupLogo = (id, file) => {
  const form = new FormData();
  form.append("file", file);
  return api.post(`/startups/${id}/logo`, form, {
    headers: { "Content-Type": "multipart/form-data" }
  }).then(r => r.data);
};

export const uploadPitchDeck = (id, file) => {
  const form = new FormData();
  form.append("file", file);
  return api.post(`/startups/${id}/pitch-deck`, form, {
    headers: { "Content-Type": "multipart/form-data" }
  }).then(r => r.data);
};

/** Build full URL for a stored file, e.g. getFileUrl("logos/5_abc.png") */
export const getFileUrl = (relativePath) =>
  relativePath ? `${baseURL}/startups/files/${relativePath}` : null;

/* ── Investments ── */
export const getInvestmentsByStartup  = (id) => api.get(`/investments/startup/${id}`).then(r => r.data);
export const getInvestmentsByInvestor = (id) => api.get(`/investments/investor/${id}`).then(r => r.data);
export const getAllInvestments        = ()   => api.get("/investments/all").then(r => r.data);
export const createInvestment         = (d)  => api.post("/investments", d).then(r => r.data);
export const createStripeSession      = (d)  => api.post("/investments/stripe/create-session", d).then(r => r.data);
export const updateInvestmentStatus   = (id, s) => api.post(`/investments/${id}/status/${s}`).then(r => r.data);

/* ── Teams ── */
export const getTeamByStartup  = (id) => api.get(`/teams/startup/${id}`).then(r => r.data);
export const getMyTeams        = ()   => api.get("/teams/my").then(r => r.data);
export const inviteTeamMember  = (d)  => api.post("/teams/invite", d).then(r => r.data);
export const joinTeam          = (d)  => api.post("/teams/join", d).then(r => r.data);

/* ── Messaging ── */
export const createConversation = (d)  => api.post("/messages/conversation", d).then(r => r.data);
export const getConversations  = (id) => api.get(`/messages/user/${id}`).then(r => r.data);
export const getMessages       = (id) => api.get(`/messages/conversation/${id}`).then(r => r.data);
export const sendMessage        = (d)  => api.post("/messages", d).then(r => r.data);
export const deleteConversation = (id) => api.delete(`/messages/conversation/${id}`).then(r => r.data);

/* ── Notifications ── */
export const getNotificationStatus = () => api.get("/notifications/api/notifications/status").then(r => r.data);

/* ── Health (dashboard) ── */
export async function getHealthCards() {
  const [auth, startups, notifications] = await Promise.allSettled([
    api.get("/auth/test"),
    api.get("/startups"),
    api.get("/notifications/api/notifications/status")
  ]);
  return {
    auth: auth.status === "fulfilled" ? auth.value.data : toMessage(auth.reason),
    startups: startups.status === "fulfilled" ? startups.value.data : toMessage(startups.reason),
    notifications: notifications.status === "fulfilled" ? notifications.value.data : toMessage(notifications.reason)
  };
}

export default api;
