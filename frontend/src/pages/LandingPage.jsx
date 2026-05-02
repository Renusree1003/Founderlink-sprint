import { Link } from "react-router-dom";
import { Rocket, Users, HandCoins, MessageSquare, ArrowRight } from "lucide-react";

const features = [
  { icon: Rocket, color: "green", title: "Launch Startups", desc: "Create and manage startup ideas from ideation to growth." },
  { icon: Users, color: "purple", title: "Build Teams", desc: "Invite co-founders and build effective startup teams." },
  { icon: HandCoins, color: "blue", title: "Attract Investments", desc: "Connect with investors and manage your funding journey." },
  { icon: MessageSquare, color: "orange", title: "Real-time Messaging", desc: "Collaborate with founders, investors, and teammates in one place." }
];

export default function LandingPage() {
  return (
    <div className="landing-page">
      <nav className="landing-nav">
        <div className="landing-brand">
          <div className="brand-icon">F</div>
          <h1>FounderLink</h1>
        </div>
        <div className="landing-nav-links">
          <Link to="/login" className="btn btn-secondary">Sign In</Link>
          <Link to="/register" className="btn btn-primary">
            Get Started <ArrowRight size={16} />
          </Link>
        </div>
      </nav>

      <section className="landing-hero">
        <h1>Build Faster. Connect Smarter. Scale Together.</h1>
        <p>
          FounderLink brings founders, investors, and co-founders together on one powerful platform.
          Launch startups, build teams, secure funding, and collaborate in one place.
        </p>
        <div className="landing-cta">
          <Link to="/register" className="btn btn-primary btn-lg">
            Start Building Today <ArrowRight size={18} />
          </Link>
          <Link to="/login" className="btn btn-secondary btn-lg">
            Sign In
          </Link>
        </div>
      </section>

      <section className="landing-features">
        {features.map((f) => (
          <div className="feature-card" key={f.title}>
            <div className={`feature-card-icon stat-icon ${f.color}`}>
              <f.icon size={22} />
            </div>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </div>
        ))}
      </section>

      <footer style={{ textAlign: "center", padding: "3rem 1rem 2rem", color: "var(--text-muted)", fontSize: "0.85rem" }}>
        <p>© 2026 FounderLink - Build faster, connect smarter.</p>
      </footer>
    </div>
  );
}
