import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { Lock, AlertCircle } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore(state => state.login);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Email ou mot de passe incorrect');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-wot-dark flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8 bg-wot-darker p-8 rounded-lg border border-wot-gold/20">
        <div className="text-center">
          <Lock className="mx-auto h-12 w-12 text-wot-gold" strokeWidth={1.5} />
          <h2 className="mt-6 text-3xl font-bold text-wot-gold">Dashboard ATFR</h2>
          <p className="mt-2 text-sm text-wot-light/80">
            Accès réservé aux administrateurs
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none rounded relative block w-full px-3 py-2 
                         border border-wot-gold/20 bg-wot-dark text-wot-light
                         placeholder-wot-light/50 focus:outline-none focus:ring-2 
                         focus:ring-wot-gold focus:border-transparent"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="password" className="sr-only">Mot de passe</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded relative block w-full px-3 py-2 
                         border border-wot-gold/20 bg-wot-dark text-wot-light
                         placeholder-wot-light/50 focus:outline-none focus:ring-2 
                         focus:ring-wot-gold focus:border-transparent"
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm">
              <AlertCircle className="h-4 w-4" strokeWidth={1.5} />
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn-primary w-full"
            disabled={loading}
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  );
}