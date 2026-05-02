import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import { getStartups, getAllInvestments } from "../lib/api";
import { Rocket, HandCoins, Users, MessageSquare, Plus, ArrowRight, TrendingUp, PieChart as PieChartIcon } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

export default function DashboardPage() {
  const { user, profile } = useAuth();
  const [startups, setStartups] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);

  const role = user?.role || "USER";
  const userId = user?.sub || user?.userId || "";
  const displayName =
    profile?.fullName ||
    profile?.username ||
    profile?.name ||
    user?.fullName ||
    user?.username ||
    user?.name ||
    `${role} #${userId}`;
  const username =
    profile?.username ||
    user?.username ||
    (typeof user?.sub === "string" && !/^\d+$/.test(user.sub) ? user.sub : null) ||
    `user_${userId}`;

  useEffect(() => {
    setLoading(true);
    Promise.allSettled([getStartups(), getAllInvestments()])
      .then(([sResult, iResult]) => {
        if (sResult.status === "fulfilled") {
          const data = sResult.value;
          setStartups(Array.isArray(data.content) ? data.content : Array.isArray(data) ? data : []);
        }
        if (iResult.status === "fulfilled") {
          setInvestments(Array.isArray(iResult.value) ? iResult.value : []);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const stats = [
    { icon: Rocket, color: "green", label: "Total Startups", value: startups.length },
    { icon: HandCoins, color: "blue", label: "Platform Status", value: "Live" },
    { icon: Users, color: "purple", label: "Your Role", value: role },
    { icon: TrendingUp, color: "orange", label: "Username", value: username }
  ];

  // Prepare Pie Chart Data
  const domainCounts = startups.reduce((acc, s) => {
    const d = s.domain || "Other";
    acc[d] = (acc[d] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.keys(domainCounts).map(key => ({
    name: key,
    value: domainCounts[key]
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#a4de6c', '#8dd1e1', '#8884d8'];

  // Prepare Recent Activity (Combine Startups and Investments)
  const activities = [
    ...startups.map(s => ({
      id: `s-${s.id}`,
      type: "startup",
      title: s.title,
      description: `New startup created by ${s.ownerName || 'a founder'}`,
      date: new Date(s.createdAt || Date.now()),
      icon: Rocket,
      color: "green"
    })),
    ...investments.map(i => ({
      id: `i-${i.id}`,
      type: "investment",
      title: `₹${(i.amount || 0).toLocaleString("en-IN")} Investment`,
      description: `Invested in Startup #${i.startupId}`,
      date: new Date(i.createdAt || i.date || Date.now()),
      icon: HandCoins,
      color: "blue"
    }))
  ].sort((a, b) => b.date - a.date).slice(0, 10);

  return (
    <Layout title="Dashboard">
      <div className="welcome-banner">
        <h2>Welcome back, {displayName}</h2>
        <p>Here is what is happening in your FounderLink workspace today.</p>
        <div className="quick-actions">
          <Link to="/startups" className="btn btn-primary btn-sm">
            <Rocket size={16} /> View Startups
          </Link>
          <Link to="/messages" className="btn btn-secondary btn-sm">
            <MessageSquare size={16} /> Messages
          </Link>
          <Link to="/teams" className="btn btn-secondary btn-sm">
            <Users size={16} /> My Teams
          </Link>
          <Link to="/profile" className="btn btn-secondary btn-sm">
            Edit Profile
          </Link>
        </div>
      </div>

      <div className="grid-4" style={{ marginBottom: "2rem" }}>
        {stats.map((s, i) => (
          <div className="stat-card" key={i} style={{ animationDelay: `${i * 0.1}s` }}>
            <div className={`stat-icon ${s.color}`}><s.icon size={22} /></div>
            <div className="stat-info">
              <div className="stat-label">{s.label}</div>
              <div className="stat-value">{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ marginBottom: "2rem" }}>
        <div className="card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column" }}>
          <div className="section-title" style={{ marginTop: 0 }}>
            <TrendingUp size={20} />
            Recent Activity
          </div>
          <div className="activity-list" style={{ flex: 1, overflowY: "auto", maxHeight: 300 }}>
            {activities.length > 0 ? activities.map((act, i) => (
              <div key={act.id} className="activity-item" style={{ 
                display: "flex", 
                gap: "1rem", 
                padding: "0.75rem 0", 
                borderBottom: i < activities.length - 1 ? "1px solid var(--border-color)" : "none",
                alignItems: "center"
              }}>
                <div className={`stat-icon ${act.color}`} style={{ width: 36, height: 36, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <act.icon size={18} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{act.title}</div>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{act.description}</div>
                </div>
                <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                  {act.date.toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                </div>
              </div>
            )) : (
              <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>No recent activity</div>
            )}
          </div>
        </div>

        <div className="card" style={{ padding: "1.5rem" }}>
          <div className="section-title" style={{ marginTop: 0 }}>
            <PieChartIcon size={20} />
            Startups by Domain
          </div>
          <div style={{ width: "100%", height: 300 }}>
            {startups.length > 0 ? (
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)', borderRadius: '8px' }} 
                    itemStyle={{ color: 'var(--text-main)' }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="loading-center">
                <p style={{ color: "var(--text-muted)" }}>{loading ? "Loading..." : "No startup data available"}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div>
        <div className="section-title">
          <Rocket size={20} />
          Recent Startups
          <Link to="/startups" style={{ marginLeft: "auto", fontSize: "0.82rem", display: "flex", alignItems: "center", gap: 4 }}>
            View all <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : startups.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "2rem" }}>
            <p style={{ color: "var(--text-muted)", marginBottom: "1rem" }}>No startups found yet.</p>
            <Link to="/startups" className="btn btn-primary btn-sm">
              <Plus size={16} /> Create Your First Startup
            </Link>
          </div>
        ) : (
          <div className="grid-3">
            {startups.slice(0, 6).map((s) => (
              <Link to={`/startups/${s.id}`} key={s.id} className="startup-card" style={{ textDecoration: "none", color: "inherit" }}>
                <div className="startup-card-header">
                  <h3>{s.title || "Untitled"}</h3>
                  <span className={`badge ${s.status === "APPROVED" ? "badge-success" : s.status === "PENDING" ? "badge-pending" : "badge-warning"}`}>
                    {s.status || "PENDING"}
                  </span>
                </div>
                <p>{s.description || "No description"}</p>
                <div className="startup-meta">
                  <div className="startup-meta-row">
                    <div className="startup-tags">
                      {s.domain && <span className="startup-tag">{s.domain}</span>}
                    </div>
                    <span className="startup-owner">
                      <Users size={12} style={{ marginRight: 4 }} /> {s.ownerName || `User #${s.userId}`}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
