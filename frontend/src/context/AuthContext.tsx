import { createContext, useContext, useEffect, useMemo, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";

import { authApi } from "../api/auth";
import { clearStoredToken, getStoredToken, storeToken } from "../api/http";
import { connectSocket, disconnectSocket } from "../socket";
import type { LoginPayload, RegisterPayload, SessionState, User } from "../types";

interface AuthContextValue extends SessionState {
  isReady: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
  setUser: Dispatch<SetStateAction<User | null>>;
}

const userStorageKey = "penscience_user";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const readStoredUser = () => {
  const raw = localStorage.getItem(userStorageKey);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => readStoredUser());
  const [token, setToken] = useState<string | null>(() => getStoredToken());
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const handleLogout = () => {
      localStorage.removeItem(userStorageKey);
      clearStoredToken();
      setUser(null);
      setToken(null);
      disconnectSocket();
    };

    window.addEventListener("auth:logout", handleLogout);
    setIsReady(true);

    return () => {
      window.removeEventListener("auth:logout", handleLogout);
    };
  }, []);

  useEffect(() => {
    if (user && token) {
      localStorage.setItem(userStorageKey, JSON.stringify(user));
      storeToken(token);
      connectSocket();
    }
  }, [token, user]);

  const persistSession = (nextUser: User, nextToken: string) => {
    setUser(nextUser);
    setToken(nextToken);
    localStorage.setItem(userStorageKey, JSON.stringify(nextUser));
    storeToken(nextToken);
  };

  const login = async (payload: LoginPayload) => {
    const session = await authApi.login(payload);
    persistSession(session.user, session.token);
  };

  const register = async (payload: RegisterPayload) => {
    await authApi.register(payload);
    await login(payload);
  };

  const logout = () => {
    localStorage.removeItem(userStorageKey);
    clearStoredToken();
    setUser(null);
    setToken(null);
    disconnectSocket();
  };

  const value = useMemo<AuthContextValue>(
    () => ({ user, token, isReady, login, register, logout, setUser }),
    [user, token, isReady]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuthContext must be used inside AuthProvider");
  }

  return context;
};