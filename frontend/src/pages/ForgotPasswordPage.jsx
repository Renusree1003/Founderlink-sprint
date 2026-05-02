import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Check, ArrowLeft, Mail, Lock, Key, Eye, EyeOff } from "lucide-react";
import { forgotPassword, resetPassword, toMessage } from "../lib/api";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState(1); // 1: Email, 2: OTP & New Password
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  async function onRequestOtp(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const data = await forgotPassword({ email });
      setMessage(data || "OTP sent successfully");
      setStep(2);
    } catch (err) {
      setError(toMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function onResetPassword(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const data = await resetPassword({ email, otp, newPassword });
      setMessage(data || "Password reset successfully");
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(toMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-hero">
        <div className="auth-hero-content">
          <div className="brand-icon" aria-hidden="true" style={{ width: 56, height: 56, fontSize: "1.5rem", marginBottom: "1.5rem" }}>F</div>
          <h2>Secure your account.</h2>
          <p>Follow the steps to reset your password and get back to building the next big thing.</p>
          <div className="auth-features">
            <div className="auth-feature"><Check size={20} /> <span>Two-step verification for security</span></div>
            <div className="auth-feature"><Check size={20} /> <span>Instant OTP delivery to your email</span></div>
            <div className="auth-feature"><Check size={20} /> <span>Secure password encryption</span></div>
          </div>
        </div>
      </div>

      <div className="auth-form-panel">
        <div className="auth-form-box">
          <Link to="/login" className="btn btn-ghost btn-sm" style={{ alignSelf: "flex-start", marginBottom: "1.5rem", paddingLeft: 0 }}>
            <ArrowLeft size={16} /> Back to Sign In
          </Link>
          
          <h2>{step === 1 ? "Forgot Password" : "Reset Password"}</h2>
          <p className="muted">
            {step === 1 
              ? "Enter your email address and we'll send you an OTP to reset your password."
              : `We've sent a 6-digit OTP to ${email}. Please enter it below along with your new password.`
            }
          </p>

          {step === 1 ? (
            <form className="auth-form" onSubmit={onRequestOtp}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div style={{ position: "relative" }}>
                  <input 
                    className="form-input" 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    placeholder="you@example.com" 
                    required 
                    style={{ paddingLeft: "2.5rem" }}
                  />
                  <Mail size={18} style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                </div>
              </div>

              {error && <p className="error-msg">{error}</p>}
              {message && <p className="success-msg" style={{ color: "var(--status-success)", fontSize: "0.85rem" }}>{message}</p>}

              <button className="btn btn-primary" type="submit" disabled={loading} style={{ marginTop: "1rem" }}>
                {loading ? "Sending OTP..." : "Send OTP"}
              </button>
            </form>
          ) : (
            <form className="auth-form" onSubmit={onResetPassword}>
              <div className="form-group">
                <label className="form-label">OTP (One-Time Password)</label>
                <div style={{ position: "relative" }}>
                  <input 
                    className="form-input" 
                    type="text" 
                    value={otp} 
                    onChange={(e) => setOtp(e.target.value)} 
                    placeholder="Enter 6-digit OTP" 
                    required 
                    maxLength={6}
                    style={{ paddingLeft: "2.5rem", letterSpacing: "0.5em", fontWeight: "bold" }}
                  />
                  <Key size={18} style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">New Password</label>
                <div className="password-input-wrapper">
                  <input 
                    className="form-input" 
                    type={showPassword ? "text" : "password"} 
                    value={newPassword} 
                    onChange={(e) => setNewPassword(e.target.value)} 
                    placeholder="Create a strong password" 
                    required 
                    style={{ paddingLeft: "2.5rem" }}
                  />
                  <Lock size={18} style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                  <button 
                    type="button" 
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ right: "0.75rem" }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && <p className="error-msg">{error}</p>}
              {message && <p className="success-msg" style={{ color: "var(--status-success)", fontSize: "0.85rem" }}>{message}</p>}

              <button className="btn btn-primary" type="submit" disabled={loading} style={{ marginTop: "1rem" }}>
                {loading ? "Resetting Password..." : "Reset Password"}
              </button>

              <button 
                type="button" 
                className="btn btn-ghost btn-sm" 
                onClick={() => setStep(1)}
                style={{ marginTop: "0.5rem" }}
              >
                Resend OTP / Change Email
              </button>
            </form>
          )}

          <p className="auth-link">
            Remember your password? <Link to="/login">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
