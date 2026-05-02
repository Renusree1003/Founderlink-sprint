import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register, verifyOtp, resendOtp, createUserProfile, updateUserProfile, toMessage } from "../lib/api";
import { Check } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const roles = ["FOUNDER", "INVESTOR", "COFOUNDER", "ADMIN"];

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("FOUNDER");
  const [otp, setOtp] = useState("");
  const [status, setStatus] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  function decodeJwtPayload(token) {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    let payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    while (payload.length % 4 !== 0) payload += "=";
    return JSON.parse(atob(payload));
  }

  async function onRegister(e) {
    e.preventDefault();
    setLoading(true);
    setStatus("");
    setIsError(false);
    try {
      const msg = await register({ email, password, role });
      setStatus(typeof msg === "string" ? msg : "Registered. Check email for OTP.");
    } catch (err) {
      setStatus(toMessage(err));
      setIsError(true);
    } finally {
      setLoading(false);
    }
  }

  async function onVerify(e) {
    e.preventDefault();
    setLoading(true);
    setStatus("");
    setIsError(false);
    try {
      const msg = await verifyOtp({ email, otp });
      const loginResult = await login({ email, password, role });
      if (!loginResult?.ok) {
        throw new Error(loginResult?.message || "Login failed after OTP verification.");
      }
      const storedToken = localStorage.getItem("founderlink.token");
      if (!storedToken) {
        throw new Error("Login token missing after verification.");
      }
      const jwtPayload = decodeJwtPayload(storedToken);
      const userId = jwtPayload.sub || jwtPayload.userId;
      const profilePayload = {
        username,
        fullName,
        email,
        bio: `${role} at FounderLink`,
        name: fullName
      };
      try {
        await updateUserProfile(userId, profilePayload);
      } catch (_err) {
        await createUserProfile(profilePayload);
      }
      setStatus(typeof msg === "string" ? msg : "OTP verified and profile created.");
      navigate("/dashboard");
    } catch (err) {
      setStatus(toMessage(err));
      setIsError(true);
    } finally {
      setLoading(false);
    }
  }

  async function onResend() {
    setLoading(true);
    setStatus("");
    setIsError(false);
    try {
      const msg = await resendOtp({ email });
      setStatus(typeof msg === "string" ? msg : "OTP resent to your email.");
    } catch (err) {
      setStatus(toMessage(err));
      setIsError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-hero">
        <div className="auth-hero-content">
          <div className="brand-icon" aria-hidden="true" style={{ width: 56, height: 56, fontSize: "1.5rem", marginBottom: "1.5rem" }}>F</div>
          <h2>Join the FounderLink community</h2>
          <p>Create your account and start building your startup ecosystem today.</p>
          <div className="auth-features">
            <div className="auth-feature"><Check size={20} /> <span>Free to join as any role</span></div>
            <div className="auth-feature"><Check size={20} /> <span>OTP-secured registration</span></div>
            <div className="auth-feature"><Check size={20} /> <span>Instant access after verification</span></div>
          </div>
        </div>
      </div>

      <div className="auth-form-panel">
        <div className="auth-form-box">
          <h2>Create Account</h2>
          <p className="muted">Choose your role, then fill details and verify OTP.</p>
          <div className="stepper">
            <span className="active">1 Choose role</span>
            <span>2 Personal info</span>
            <span>3 Profile details</span>
          </div>
          <div className="role-grid">
            {roles.map((r) => (
              <button
                type="button"
                key={r}
                className={`role-card ${role === r ? "selected" : ""}`}
                onClick={() => setRole(r)}
              >
                <h4>{r === "COFOUNDER" ? "CO-FOUNDER" : r}</h4>
                <p>
                  {r === "FOUNDER" && "Publish startup, build a team, and attract investors."}
                  {r === "INVESTOR" && "Discover vetted startups and deploy capital."}
                  {r === "COFOUNDER" && "Browse opportunities and join startup teams."}
                  {r === "ADMIN" && "Platform administration and approvals."}
                </p>
              </button>
            ))}
          </div>

          <form className="auth-form" onSubmit={onRegister}>
            <div className="form-group">
              <label className="form-label">Username</label>
              <input className="form-input" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="renusree24" required />
            </div>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Renusree Malapati" required />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" minLength={8} required />
            </div>
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? "Submitting..." : "Register"}
            </button>
          </form>

          <div className="otp-section">
            <h3>Verify OTP</h3>
            <form className="auth-form" onSubmit={onVerify}>
              <div className="form-group">
                <label className="form-label">OTP Code</label>
                <input className="form-input" type="text" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="Enter OTP from email" required />
              </div>
              <button className="btn btn-primary" type="submit" disabled={loading}>
                {loading ? "Verifying..." : "Verify OTP"}
              </button>
              <button type="button" className="btn btn-secondary" onClick={onResend} disabled={loading} style={{ width: "100%" }}>
                Resend OTP
              </button>
            </form>
          </div>

          {status && <p className={isError ? "error-msg" : "info-msg"} style={{ marginTop: "1rem" }}>{status}</p>}

          <p className="auth-link">
            Already verified? <Link to="/login">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
