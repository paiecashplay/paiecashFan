import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);   // auth.User de Supabase
  const [profile, setProfile] = useState(null);   // public.profiles row
  const [loading, setLoading] = useState(true);

  // Charge le profil Supabase (role, display_name, club_id…)
  async function fetchProfile(userId) {
    const { data } = await supabase
      .from('profiles')
      .select('id, display_name, username, avatar_url, role, club_id, locale')
      .eq('id', userId)
      .maybeSingle();
    setProfile(data || null);
  }

  // Sync session au montage + écoute des changements d'auth
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) fetchProfile(session.user.id);
        else setProfile(null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Permet de forcer un re-fetch du profil (utile après changement de rôle)
  async function refreshProfile() {
    if (!user) return;
    await fetchProfile(user.id);
  }

  // ─── Actions ─────────────────────────────────────────────────

  async function signUp({ email, password, displayName }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } }
    });
    if (error) throw error;
    return data;
  }

  async function signIn({ email, password }) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }

  async function signInWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    });
    if (error) throw error;
  }

  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  }

  async function updateProfile(updates) {
    if (!user) return;
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();
    if (error) throw error;
    setProfile(data);
    return data;
  }

  const isAdmin      = profile?.role === 'super_admin';
  const isClubAdmin  = profile?.role === 'club_admin' || isAdmin;

  return (
    <AuthContext.Provider value={{
      user, profile, loading,
      isAdmin, isClubAdmin,
      signUp, signIn, signInWithGoogle, signOut, updateProfile, refreshProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
