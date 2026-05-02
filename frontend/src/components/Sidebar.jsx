import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard, User, Rocket, HandCoins,
  Users, MessageSquare, ChevronLeft, ChevronRight, LogOut
} from "lucide-react";
import { useState } from "react";

const mainLinks = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/profile",   icon: User,            label: "My Profile" },
];

const workspaceLinks = [
  { to: "/startups",    icon: Rocket,       label: "Startups" },
  { to: "/investments", icon: HandCoins,    label: "Investments" },
  { to: "/teams",       icon: Users,        label: "Teams" },
  { to: "/messages",    icon: MessageSquare, label: "Messages" },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  function renderLink({ to, icon: Icon, label }) {
    return (
      <NavLink
        key={to}
        to={to}
        className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
      >
        <Icon size={20} />
        <span>{label}</span>
      </NavLink>
    );
  }

  return (
    <aside className={`sidebar${collapsed ? " collapsed" : ""}`}>
      <div className="sidebar-brand">
        <div className="brand-icon" aria-hidden="true">F</div>
        <div className="brand-text">
          <h1>FounderLink</h1>
          <p>Collaboration platform</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        <span className="nav-section-title">Main</span>
        {mainLinks.map(renderLink)}

        <span className="nav-section-title">Workspace</span>
        {workspaceLinks.map(renderLink)}
      </nav>

      <div className={`sidebar-footer${collapsed ? " collapsed" : ""}`}>
        <button type="button" className="sidebar-logout" onClick={logout} title="Logout">
          <LogOut size={18} />
          <span>Logout</span>
        </button>
        <button className="sidebar-toggle" onClick={() => setCollapsed(!collapsed)} title={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>
    </aside>
  );
}
