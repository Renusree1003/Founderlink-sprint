import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { clearToken, getToken, setToken } from "../lib/storage";
import { login as loginRequest, getUserById, toMessage } from "../lib/api";

const AuthContext = createContext(null);

function parseJwt(token) {
  try {
    const payload = token.split(".")[1];
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    const decoded = JSON.parse(json);

    // Normalize roles to a singular role string for the frontend (e.g., ROLE_FOUNDER -> FOUNDER)
    if (decoded.roles && Array.isArray(decoded.roles) && decoded.roles.length > 0) {
      decoded.role = decoded.roles[0].replace("ROLE_", "");
    } else if (decoded.role && decoded.role.startsWith("ROLE_")) {
      decoded.role = decoded.role.replace("ROLE_", "");
    }

    // Map common token claim names used across providers/services.
    decoded.username =
      decoded.username ||
      decoded.preferred_username ||
      decoded.user_name ||
      decoded.unique_name ||
      null;
    decoded.fullName = decoded.fullName || decoded.name || null;

    return decoded;
  } catch (_error) {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(getToken());
  const [user, setUser] = useState(() => (token ? parseJwt(token) : null));
  const [profile, setProfile] = useState(null);

  const isAuthenticated = Boolean(token);

  const fetchProfile = async (uId) => {
    try {
      const data = await getUserById(uId);
      return data;
    } catch (e) {
      console.error("Failed to fetch profile", e);
      return null;
    }
  };

  useEffect(() => {
    let active = true;
    const uId = user?.sub || user?.userId;

    if (!uId) {
      setProfile(null);
      return () => {
        active = false;
      };
    }

    setProfile(null);
    fetchProfile(uId).then((data) => {
      if (active) {
        setProfile(data);
      }
    });

    return () => {
      active = false;
    };
  }, [user?.sub, user?.userId]);

  const value = useMemo(
    () => ({
      token,
      user,
      profile,
      isAuthenticated,
      async login(credentials) {
        try {
          const data = await loginRequest(credentials);
          const resolvedToken =
            typeof data === "string" ? data : data?.token || data?.accessToken || "";

          if (!resolvedToken) {
            throw new Error("Login succeeded but no token was returned.");
          }

          setToken(resolvedToken);
          setTokenState(resolvedToken);
          const decoded = parseJwt(resolvedToken);
          setProfile(null);
          setUser(decoded);
          return { ok: true };
        } catch (error) {
          return { ok: false, message: toMessage(error) };
        }
      },
      logout() {
        clearToken();
        setTokenState(null);
        setUser(null);
        setProfile(null);
      }
    }),
    [isAuthenticated, token, user, profile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
