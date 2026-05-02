import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import Modal from "../components/Modal";
import EmptyState from "../components/EmptyState";
import { useAuth } from "../context/AuthContext";
import { getInvestmentsByInvestor, getInvestmentsByStartup, createInvestment, updateInvestmentStatus, toMessage } from "../lib/api";
import { HandCoins, Plus } from "lucide-react";

export default function InvestmentsPage() {
  const { user } = useAuth();
  const role = user?.role || "";
  const userId = user?.sub || user?.userId;

  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ startupId: "", amount: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [searchId, setSearchId] = useState("");

  useEffect(() => {
    if (role === "INVESTOR") fetchByInvestor();
  }, [role, userId]);

  function fetchByInvestor() {
    setLoading(true);
    getInvestmentsByInvestor(userId)
      .then((data) => setInvestments(Array.isArray(data) ? data : []))
      .catch(() => setInvestments([]))
      .finally(() => setLoading(false));
  }

  function fetchByStartup(e) {
    if (e) e.preventDefault();
    if (!searchId) return;
    setLoading(true);
    getInvestmentsByStartup(searchId)
      .then((data) => setInvestments(Array.isArray(data) ? data : []))
      .catch(() => setInvestments([]))
      .finally(() => setLoading(false));
  }

  async function onUpdateStatus(id, status) {
    try {
      await updateInvestmentStatus(id, status);
      if (role === "INVESTOR") fetchByInvestor();
      else if (searchId) fetchByStartup();
    } catch (err) {
      alert(toMessage(err));
    }
  }

  async function onCreateInvestment(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await createInvestment({ startupId: Number(form.startupId), investorId: Number(userId), amount: Number(form.amount) });
      setShowModal(false);
      setForm({ startupId: "", amount: "" });
      if (role === "INVESTOR") fetchByInvestor();
    } catch (err) {
      setError(toMessage(err));
    } finally {
      setSaving(false);
    }
  }

  const totalInvested = investments.reduce((sum, i) => sum + (i.amount || 0), 0);
  const amount = Number(form.amount || 0);

  return (
    <Layout title="Investments">
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h2>Investments</h2>
          <p>{role === "INVESTOR" ? "Your investment portfolio" : "Search investments by startup"}</p>
        </div>
        {(role === "INVESTOR" || role === "ADMIN") && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={18} /> Make Investment
          </button>
        )}
      </div>

      {role !== "INVESTOR" && (
        <form onSubmit={fetchByStartup} style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
          <input className="form-input" type="number" placeholder="Enter Startup ID" value={searchId} onChange={(e) => setSearchId(e.target.value)} style={{ maxWidth: 220 }} />
          <button className="btn btn-primary btn-sm" type="submit">Search</button>
        </form>
      )}

      <div className="wizard-steps">
        <span className="active">1 Amount</span>
        <span>2 Instrument</span>
        <span>3 Confirm</span>
        <span>4 Done</span>
      </div>

      <div className="grid-2 investment-wizard" style={{ marginBottom: "1.5rem" }}>
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Investment Amount</h3>
          <p className="muted">Minimum 5L - Maximum 50L per investor</p>
          <div className="amount-preview">{amount ? `₹${amount.toLocaleString("en-IN")}` : "₹0"}</div>
          <div className="quick-actions" style={{ marginTop: "0.8rem" }}>
            <button className="btn btn-secondary btn-sm" type="button" onClick={() => setForm({ ...form, amount: "1000000" })}>₹10L</button>
            <button className="btn btn-secondary btn-sm" type="button" onClick={() => setForm({ ...form, amount: "2500000" })}>₹25L</button>
            <button className="btn btn-secondary btn-sm" type="button" onClick={() => setForm({ ...form, amount: "5000000" })}>₹50L</button>
          </div>
        </div>
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Portfolio Snapshot</h3>
          <div className="stat-label">Total Investments</div>
          <div className="stat-value" style={{ fontSize: "1.3rem" }}>{investments.length}</div>
          <div className="stat-label" style={{ marginTop: "0.8rem" }}>Total Amount</div>
          <div className="stat-value" style={{ fontSize: "1.3rem" }}>₹{totalInvested.toLocaleString("en-IN")}</div>
          <div className="progress-track"><span style={{ width: "78%" }} /></div>
        </div>
      </div>

      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : investments.length === 0 ? (
        <EmptyState icon={HandCoins} title="No Investments Found" subtitle={role === "INVESTOR" ? "You have not made any investments yet." : "No investments found for this search."} />
      ) : (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Startup</th>
                <th>Investor</th>
                <th>Amount</th>
                <th>Status</th>
                {role === "FOUNDER" && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {investments.map((inv) => (
                <tr key={inv.id}>
                  <td>#{inv.id}</td>
                  <td>Startup #{inv.startupId}</td>
                  <td>User #{inv.investorId}</td>
                  <td style={{ fontWeight: 600 }}>₹{inv.amount?.toLocaleString("en-IN")}</td>
                  <td><span className={`badge ${inv.status === "APPROVED" ? "badge-success" : "badge-pending"}`}>{inv.status || "PENDING"}</span></td>
                  {role === "FOUNDER" && (
                    <td>
                      {(!inv.status || inv.status === "PENDING") ? (
                        <div style={{ display: "flex", gap: "0.35rem" }}>
                          <button className="btn btn-primary btn-xs" onClick={() => onUpdateStatus(inv.id, "APPROVED")}>Accept</button>
                          <button className="btn btn-ghost btn-xs" onClick={() => onUpdateStatus(inv.id, "REJECTED")}>Reject</button>
                        </div>
                      ) : (
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Done</span>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <Modal title="Make Investment" onClose={() => setShowModal(false)}>
          <form onSubmit={onCreateInvestment}>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Startup ID</label>
                <input className="form-input" type="number" value={form.startupId} onChange={(e) => setForm({ ...form, startupId: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Amount (₹)</label>
                <input className="form-input" type="number" min="1" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
              </div>
              {error && <p className="error-msg">{error}</p>}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Investing..." : "Confirm"}</button>
            </div>
          </form>
        </Modal>
      )}
    </Layout>
  );
}
