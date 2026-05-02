import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import Modal from "../components/Modal";
import EmptyState from "../components/EmptyState";
import { useAuth } from "../context/AuthContext";
import { getMyTeams, getTeamByStartup, inviteTeamMember, joinTeam, toMessage } from "../lib/api";
import { Users, UserPlus, LogIn } from "lucide-react";

export default function TeamsPage() {
  const { user } = useAuth();
  const role = user?.role || "";
  const userId = user?.sub || user?.userId;

  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [inviteForm, setInviteForm] = useState({ startupId: "", userId: "", role: "COFOUNDER" });
  const [joinForm, setJoinForm] = useState({ startupId: "", role: "COFOUNDER" });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [searchId, setSearchId] = useState("");

  useEffect(() => { fetchMyTeams(); }, []);

  function fetchMyTeams() {
    setLoading(true);
    getMyTeams()
      .then((data) => setTeams(Array.isArray(data) ? data : []))
      .catch(() => setTeams([]))
      .finally(() => setLoading(false));
  }

  function searchByStartup(e) {
    e.preventDefault();
    if (!searchId) return;
    setLoading(true);
    getTeamByStartup(searchId)
      .then((data) => setTeams(Array.isArray(data) ? data : []))
      .catch(() => setTeams([]))
      .finally(() => setLoading(false));
  }

  async function onInvite(e) {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    try {
      await inviteTeamMember({ startupId: Number(inviteForm.startupId), userId: Number(inviteForm.userId), role: inviteForm.role });
      setShowInvite(false);
      setInviteForm({ startupId: "", userId: "", role: "COFOUNDER" });
      setMsg("Invited successfully.");
      fetchMyTeams();
    } catch (err) {
      setMsg(toMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function onJoin(e) {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    try {
      await joinTeam({ startupId: Number(joinForm.startupId), userId: Number(userId), role: joinForm.role });
      setShowJoin(false);
      setJoinForm({ startupId: "", role: "COFOUNDER" });
      setMsg("Joined team successfully.");
      fetchMyTeams();
    } catch (err) {
      setMsg(toMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Layout title="Teams">
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.75rem" }}>
        <div>
          <h2>Teams</h2>
          <p>Manage your startup teams and collaborators</p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          {(role === "FOUNDER" || role === "ADMIN") && (
            <button className="btn btn-primary btn-sm" onClick={() => setShowInvite(true)}>
              <UserPlus size={16} /> Invite Member
            </button>
          )}
          {(role === "COFOUNDER" || role === "ADMIN") && (
            <button className="btn btn-secondary btn-sm" onClick={() => setShowJoin(true)}>
              <LogIn size={16} /> Join Team
            </button>
          )}
        </div>
      </div>

      <form onSubmit={searchByStartup} style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
        <input className="form-input" type="number" placeholder="Search by Startup ID" value={searchId} onChange={(e) => setSearchId(e.target.value)} style={{ maxWidth: 220 }} />
        <button className="btn btn-primary btn-sm" type="submit">Search</button>
        <button className="btn btn-secondary btn-sm" type="button" onClick={fetchMyTeams}>My Teams</button>
      </form>

      {msg && <p className="info-msg" style={{ marginBottom: "1rem" }}>{msg}</p>}

      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : teams.length === 0 ? (
        <EmptyState icon={Users} title="No Teams Found" subtitle="You are not part of any teams yet, or no results for your search." />
      ) : (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <table className="data-table">
            <thead><tr><th>ID</th><th>Startup</th><th>User</th><th>Role</th></tr></thead>
            <tbody>
              {teams.map((t) => (
                <tr key={t.id}>
                  <td>#{t.id}</td>
                  <td>Startup #{t.startupId}</td>
                  <td>User #{t.userId}</td>
                  <td><span className={`badge ${t.role === "FOUNDER" ? "badge-success" : "badge-pending"}`}>{t.role}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showInvite && (
        <Modal title="Invite Team Member" onClose={() => setShowInvite(false)}>
          <form onSubmit={onInvite}>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Startup ID</label>
                <input className="form-input" type="number" value={inviteForm.startupId} onChange={(e) => setInviteForm({ ...inviteForm, startupId: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">User ID</label>
                <input className="form-input" type="number" value={inviteForm.userId} onChange={(e) => setInviteForm({ ...inviteForm, userId: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Role</label>
                <select className="form-select" value={inviteForm.role} onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}>
                  <option value="COFOUNDER">Co-Founder</option>
                  <option value="FOUNDER">Founder</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setShowInvite(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Inviting..." : "Send Invite"}</button>
            </div>
          </form>
        </Modal>
      )}

      {showJoin && (
        <Modal title="Join a Team" onClose={() => setShowJoin(false)}>
          <form onSubmit={onJoin}>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Startup ID</label>
                <input className="form-input" type="number" value={joinForm.startupId} onChange={(e) => setJoinForm({ ...joinForm, startupId: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Your Role</label>
                <select className="form-select" value={joinForm.role} onChange={(e) => setJoinForm({ ...joinForm, role: e.target.value })}>
                  <option value="COFOUNDER">Co-Founder</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setShowJoin(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Joining..." : "Join Team"}</button>
            </div>
          </form>
        </Modal>
      )}
    </Layout>
  );
}
