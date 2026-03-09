import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { authService } from "../services";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      authService
        .getProfile()
        .then((res) => setUser(res.data.data))
        .catch(() => {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("user");
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (credentials) => {
    const res = await authService.login(credentials);
    const { accessToken } = res.data.data;
    localStorage.setItem("accessToken", accessToken);
    const profile = await authService.getProfile();
    const userData = profile.data.data;
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    return userData;
  }, []);

  const register = useCallback(async (data) => {
    const res = await authService.register(data);
    return res.data;
  }, []);

  const logout = useCallback(() => {
    const token = localStorage.getItem("accessToken");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    setUser(null);
    if (token) {
      authService.logout(token).catch(() => {});
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const profile = await authService.getProfile();
      const userData = profile.data.data;
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
    } catch { /* ignore */ }
  }, []);

  const value = useMemo(
    () => ({ user, login, register, logout, refreshUser, loading }),
    [user, login, register, logout, refreshUser, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
