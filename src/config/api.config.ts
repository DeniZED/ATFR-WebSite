// Configuration de l'environnement
const ENV = {
  development: {
    API_URL: 'http://localhost/atfr-api',
  },
  production: {
    API_URL: import.meta.env.VITE_API_URL || 'https://votre-serveur.com/atfr-api',
  }
};

const currentEnv = import.meta.env.MODE === 'production' ? 'production' : 'development';

export const config = {
  API_URL: ENV[currentEnv].API_URL,
};