import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Check, Eye, EyeOff } from "lucide-react";

const roles = ["FOUNDER", "INVESTOR", "COFOUNDER", "ADMIN"];

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("FOUNDER");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setStatus("");
    const result = await login({ email, password, role });
    setLoading(false);
    if (!result.ok) {
      setStatus(result.message || "Login failed");
      return;
    }
    navigate("/dashboard");
  }

  return (
    <div className="auth-page">
      <div className="auth-hero">
        <div className="auth-hero-content">
          <div className="brand-icon" aria-hidden="true" style={{ width: 56, height: 56, fontSize: "1.5rem", marginBottom: "1.5rem" }}>F</div>
          <h2>Connect. Build. Fund your vision.</h2>
          <p>Where startup founders meet investors and co-founders ready to build the next big thing.</p>
          <div className="auth-features">
            <div className="auth-feature"><Check size={20} /> <span>Discover vetted startups seeking investment</span></div>
            <div className="auth-feature"><Check size={20} /> <span>Direct messaging between founders and investors</span></div>
            <div className="auth-feature"><Check size={20} /> <span>Track funding rounds and portfolio performance</span></div>
          </div>

        </div>
      </div>

      <div className="auth-form-panel">
        <div className="auth-form-box">
          <h2>Sign In</h2>
          <p className="muted">Enter your credentials to access your workspace</p>
          <div className="auth-switch">
            <button type="button" className="active">Sign in</button>
            <Link to="/register">Register</Link>
          </div>

          <form className="auth-form" onSubmit={onSubmit}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
            </div>
            <div className="form-group">
              <div className="form-label-header">
                <label className="form-label">Password</label>
                <Link to="/forgot-password" size="sm" className="forgot-password-link">Forgot password?</Link>
              </div>
              <div className="password-input-wrapper">
                <input 
                  className="form-input" 
                  type={showPassword ? "text" : "password"} 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="Your password" 
                  required 
                />
                <button 
                  type="button" 
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Role</label>
              <select className="form-select" value={role} onChange={(e) => setRole(e.target.value)}>
                {roles.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            {status && <p className="error-msg">{status}</p>}

            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="auth-link">
            Do not have an account? <Link to="/register">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
