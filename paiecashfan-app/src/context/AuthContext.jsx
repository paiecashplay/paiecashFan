import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { supabase } from '@/lib/supabase';

const AuthContext = createContext(null);

/**
 * Retourne le meilleur nom disponible dans les métadonnées Supabase.
 */
function getAuthDisplayName(authUser) {
  const metadata = authUser?.user_metadata || {};

  return String(
    metadata.full_name ||
      metadata.name ||
      metadata.display_name ||
      ''
  ).trim();
}

/**
 * Indique si le nom enregistré dans profiles doit être corrigé.
 *
 * On ne modifie pas un vrai nom personnalisé.
 */
function shouldSynchronizeDisplayName(
  currentDisplayName,
  authUser
) {
  const normalizedCurrentName = String(
    currentDisplayName || ''
  )
    .trim()
    .toLowerCase();

  const normalizedEmail = String(
    authUser?.email || ''
  )
    .trim()
    .toLowerCase();

  return (
    !normalizedCurrentName ||
    normalizedCurrentName === normalizedEmail
  );
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * Charge le profil puis synchronise le nom Google
   * uniquement si le profil contient encore l'adresse e-mail.
   */
  const fetchProfile = useCallback(
    async (authUser) => {
      if (!authUser?.id) {
        setProfile(null);
        return null;
      }

      const { data: existingProfile, error: fetchError } =
        await supabase
          .from('profiles')
          .select(
            [
              'id',
              'display_name',
              'username',
              'avatar_url',
              'role',
              'role_request',
              'club_id',
              'locale',
            ].join(', ')
          )
          .eq('id', authUser.id)
          .maybeSingle();

      if (fetchError) {
        console.error(
          'Erreur lors du chargement du profil :',
          fetchError
        );

        setProfile(null);
        return null;
      }

      if (!existingProfile) {
        setProfile(null);
        return null;
      }

      const googleDisplayName =
        getAuthDisplayName(authUser);

      const googleAvatar =
        authUser.user_metadata?.avatar_url ||
        authUser.user_metadata?.picture ||
        '';

      const updates = {};

      if (
        googleDisplayName &&
        shouldSynchronizeDisplayName(
          existingProfile.display_name,
          authUser
        )
      ) {
        updates.display_name = googleDisplayName;
      }

      /**
       * On complète l'avatar Google uniquement si le profil
       * ne possède pas déjà un avatar personnalisé.
       */
      if (
        googleAvatar &&
        !String(
          existingProfile.avatar_url || ''
        ).trim()
      ) {
        updates.avatar_url = googleAvatar;
      }

      if (Object.keys(updates).length === 0) {
        setProfile(existingProfile);
        return existingProfile;
      }

      const {
        data: synchronizedProfile,
        error: updateError,
      } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', authUser.id)
        .select(
          [
            'id',
            'display_name',
            'username',
            'avatar_url',
            'role',
            'role_request',
            'club_id',
            'locale',
          ].join(', ')
        )
        .single();

      if (updateError) {
        console.error(
          'Erreur lors de la synchronisation du profil Google :',
          updateError
        );

        setProfile(existingProfile);
        return existingProfile;
      }

      setProfile(synchronizedProfile);
      return synchronizedProfile;
    },
    []
  );

  /**
   * Synchronisation de la session au montage
   * et écoute des changements d'authentification.
   */
  useEffect(() => {
    let isMounted = true;

    async function initializeSession() {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        if (!isMounted) {
          return;
        }

        const authUser = session?.user ?? null;

        setUser(authUser);

        if (authUser) {
          await fetchProfile(authUser);
        } else {
          setProfile(null);
        }
      } catch (error) {
        console.error(
          "Erreur lors de l'initialisation de la session :",
          error
        );

        if (isMounted) {
          setUser(null);
          setProfile(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    initializeSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const authUser = session?.user ?? null;

        setUser(authUser);

        if (authUser) {
          /**
           * On évite de bloquer le callback interne Supabase
           * avec une requête asynchrone longue.
           */
          window.setTimeout(() => {
            fetchProfile(authUser);
          }, 0);
        } else {
          setProfile(null);
        }

        setLoading(false);
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  /**
   * Force le rechargement du profil.
   */
  const refreshProfile = useCallback(async () => {
    if (!user) {
      return null;
    }

    return fetchProfile(user);
  }, [fetchProfile, user]);

  async function signUp({
    email,
    password,
    displayName,
  }) {
    const { data, error } =
      await supabase.auth.signUp({
        email,
        password,

        options: {
          data: {
            display_name: displayName,
          },
        },
      });

    if (error) {
      throw error;
    }

    return data;
  }

  async function signIn({
    email,
    password,
  }) {
    const { data, error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (error) {
      throw error;
    }

    return data;
  }

  async function signInWithGoogle(
    redirectTo = window.location.origin
  ) {
    const { data, error } =
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
        },
      });

    if (error) {
      throw error;
    }

    return data;
  }

  async function signOut() {
    const { error } =
      await supabase.auth.signOut();

    if (error) {
      throw error;
    }

    setUser(null);
    setProfile(null);
  }

  // Retourne les identités (méthodes de connexion) liées au compte courant.
  async function getIdentities() {
    const { data, error } =
      await supabase.auth.getUserIdentities();

    if (error) {
      throw error;
    }

    return data?.identities || [];
  }

  // Lie un compte Google au compte actuellement connecté (linking manuel).
  // Déclenche une redirection OAuth ; au retour, l'identité est rattachée.
  async function linkGoogle(
    redirectTo = `${window.location.origin}/parametres`
  ) {
    const { data, error } =
      await supabase.auth.linkIdentity({
        provider: 'google',
        options: { redirectTo },
      });

    if (error) {
      throw error;
    }

    return data;
  }

  // Délie le compte Google. Refuse si c'est la seule méthode de connexion
  // (sinon l'utilisateur ne pourrait plus se connecter).
  async function unlinkGoogle() {
    const identities = await getIdentities();

    const google = identities.find(
      (identity) => identity.provider === 'google'
    );

    if (!google) {
      throw new Error('Aucun compte Google lié.');
    }

    if (identities.length <= 1) {
      throw new Error(
        'Impossible de délier votre seule méthode de connexion.'
      );
    }

    const { error } =
      await supabase.auth.unlinkIdentity(google);

    if (error) {
      throw error;
    }
  }

  async function updateProfile(updates) {
    if (!user) {
      throw new Error(
        'Utilisateur non connecté.'
      );
    }

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select(
        [
          'id',
          'display_name',
          'username',
          'avatar_url',
          'role',
          'role_request',
          'club_id',
          'locale',
        ].join(', ')
      )
      .single();

    if (error) {
      throw error;
    }

    setProfile(data);

    return data;
  }

  const isAdmin =
    profile?.role === 'super_admin';

  const isClubAdmin =
    profile?.role === 'club_admin' ||
    isAdmin;

  const contextValue = useMemo(
    () => ({
      user,
      profile,
      loading,
      isAdmin,
      isClubAdmin,
      signUp,
      signIn,
      signInWithGoogle,
      signOut,
      updateProfile,
      refreshProfile,
      getIdentities,
      linkGoogle,
      unlinkGoogle,
    }),
    [
      user,
      profile,
      loading,
      isAdmin,
      isClubAdmin,
      refreshProfile,
    ]
  );

  return (
    <AuthContext.Provider
      value={contextValue}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth must be used inside <AuthProvider>'
    );
  }

  return context;
}