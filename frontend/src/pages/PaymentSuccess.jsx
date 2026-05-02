import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import { CheckCircle } from "lucide-react";

export default function PaymentSuccess() {
  return (
    <Layout title="Payment Successful">
      <div className="card" style={{ textAlign: "center", padding: "4rem 2rem", maxWidth: 600, margin: "2rem auto" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "1.5rem" }}>
          <CheckCircle size={64} color="var(--status-success)" />
        </div>
        <h2 style={{ fontSize: "2rem", marginBottom: "1rem" }}>Investment Confirmed!</h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem", marginBottom: "2rem" }}>
          Thank you for your investment. The startup founder will be notified, and your equity status will be updated shortly.
        </p>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
          <Link to="/investments" className="btn btn-primary">View My Portfolio</Link>
          <Link to="/dashboard" className="btn btn-secondary">Back to Dashboard</Link>
        </div>
      </div>
    </Layout>
  );
}
