import { createContext, useContext, useEffect, useRef, useState } from "react";
import { onIdTokenChanged, signOut } from "firebase/auth";
import { authenticatedFetch, getClientAuth } from "../../lib/firebase/client";

const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const generation = useRef(0);
  async function syncProfile(nickname) {
    const version = ++generation.current;
    setError("");
    const identity = getClientAuth().currentUser;
    try {
      const res = await authenticatedFetch("/api/auth/session", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ nickname }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to load profile.");
      if (generation.current === version && getClientAuth().currentUser?.uid === identity?.uid) { setUser(data.user); setError(""); }
      return data.user;
    } catch (err) {
      if (generation.current === version && getClientAuth().currentUser?.uid === identity?.uid) { setUser(null); setError(err.message); }
      throw err;
    }
  }
  useEffect(() => {
    try { localStorage.removeItem("user"); } catch { /* Storage can be disabled in private browsers. */ }
    try {
      return onIdTokenChanged(getClientAuth(), async (firebaseUser) => {
        if (!firebaseUser) { ++generation.current; setUser(null); setLoading(false); return; }
        try { await syncProfile(); } catch { /* syncProfile records current errors. */ } finally { setLoading(false); }
      });
    } catch (err) { setError(err.message); setLoading(false); }
  }, []);
  async function logout() {
    await signOut(getClientAuth());
    ++generation.current;
    setUser(null);
    setError("");
  }
  return <AuthContext.Provider value={{ user, loading, error, syncProfile, logout }}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
