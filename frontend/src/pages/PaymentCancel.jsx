import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import { XCircle } from "lucide-react";

export default function PaymentCancel() {
  return (
    <Layout title="Payment Cancelled">
      <div className="card" style={{ textAlign: "center", padding: "4rem 2rem", maxWidth: 600, margin: "2rem auto" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "1.5rem" }}>
          <XCircle size={64} color="var(--status-danger)" />
        </div>
        <h2 style={{ fontSize: "2rem", marginBottom: "1rem" }}>Payment Cancelled</h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem", marginBottom: "2rem" }}>
          The investment process was cancelled. No funds were transferred. If you encountered an issue, please try again or contact support.
        </p>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
          <Link to="/startups" className="btn btn-primary">Browse Startups</Link>
          <Link to="/dashboard" className="btn btn-secondary">Back to Dashboard</Link>
        </div>
      </div>
    </Layout>
  );
}
