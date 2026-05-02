import { useAuth } from "../context/AuthContext";
import { Moon, Sun, Search } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Navbar({ title }) {
  const { user, profile } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const role = user?.role || "USER";
  const userId = user?.sub || user?.userId || "?";
  
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/startups?query=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  const displayName =
    profile?.fullName ||
    profile?.username ||
    profile?.name ||
    user?.fullName ||
    user?.username ||
    user?.name ||
    `User #${userId}`;
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <header className="navbar">
      <h2 className="navbar-title">{title || "FounderLink"}</h2>
      
      <form className="navbar-search" onSubmit={handleSearch}>
        <div className="search-input-wrapper">
          <Search size={16} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search startups, domains..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </form>

      <div className="navbar-actions">
        <button
          type="button"
          className="btn btn-ghost navbar-theme-btn"
          onClick={toggleTheme}
          title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
          <span>{isDark ? "Light" : "Dark"}</span>
        </button>
        <div className="navbar-user">
          <div className="user-avatar">{initial}</div>
          <div>
            <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>{displayName}</span>
            <span className={`role-badge ${role.toLowerCase()}`} style={{ marginLeft: "0.5rem" }}>
              {role}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
