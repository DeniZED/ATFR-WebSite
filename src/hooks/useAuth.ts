import { useState, useEffect } from 'react';

interface User {
  uid: string;
  email: string | null;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulation d'une vérification d'authentification
    const timer = setTimeout(() => {
      setUser(null);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return { user, loading };
}