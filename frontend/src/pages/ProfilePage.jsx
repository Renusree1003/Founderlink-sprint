import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import { getUserById, updateUserProfile, createUserProfile, toMessage } from "../lib/api";
import { Save, Edit3, X } from "lucide-react";

export default function ProfilePage() {
  const { user } = useAuth();
  const userId = user?.sub || user?.userId;
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ username: "", fullName: "", email: "", bio: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    getUserById(userId)
      .then((data) => {
        setProfile(data);
        setForm({
          username: data.username || "",
          fullName: data.fullName || data.name || "",
          email: data.email || "",
          bio: data.bio || ""
        });
      })
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  }, [userId]);

  async function onSave(e) {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    try {
      const payload = { ...form, name: form.fullName };
      let result;
      if (profile) {
        result = await updateUserProfile(userId, payload);
      } else {
        result = await createUserProfile(payload);
      }
      setProfile(result);
      setEditing(false);
      setMsg("Profile saved.");
    } catch (err) {
      setMsg(toMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Layout title="My Profile">
      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : (
        <div className="profile-card">
          <div className="profile-avatar-lg">{(form.fullName || form.username || "U").charAt(0).toUpperCase()}</div>

          {!editing ? (
            <>
              <div className="profile-field">
                <span className="profile-field-label">Username</span>
                <span className="profile-field-value">{profile?.username || "Not set"}</span>
              </div>
              <div className="profile-field">
                <span className="profile-field-label">Full Name</span>
                <span className="profile-field-value">{profile?.fullName || profile?.name || "Not set"}</span>
              </div>
              <div className="profile-field">
                <span className="profile-field-label">Email</span>
                <span className="profile-field-value">{profile?.email || "Not set"}</span>
              </div>
              <div className="profile-field">
                <span className="profile-field-label">Bio</span>
                <span className="profile-field-value">{profile?.bio || "No bio yet"}</span>
              </div>
              <div style={{ marginTop: "1.5rem" }}>
                <button className="btn btn-primary" onClick={() => setEditing(true)}>
                  <Edit3 size={16} /> Edit Profile
                </button>
              </div>
            </>
          ) : (
            <form onSubmit={onSave} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div className="form-group">
                <label className="form-label">Username</label>
                <input className="form-input" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-input" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Bio</label>
                <textarea className="form-textarea" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} maxLength={500} />
              </div>
              <div style={{ display: "flex", gap: "0.75rem" }}>
                <button className="btn btn-primary" type="submit" disabled={saving}>
                  <Save size={16} /> {saving ? "Saving..." : "Save"}
                </button>
                <button className="btn btn-secondary" type="button" onClick={() => setEditing(false)}>
                  <X size={16} /> Cancel
                </button>
              </div>
            </form>
          )}

          {msg && <p className="info-msg" style={{ marginTop: "1rem" }}>{msg}</p>}
        </div>
      )}
    </Layout>
  );
}
