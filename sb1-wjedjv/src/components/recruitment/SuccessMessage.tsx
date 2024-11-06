import React from 'react';

interface SuccessMessageProps {
  onClose: () => void;
}

export default function SuccessMessage({ onClose }: SuccessMessageProps) {
  return (
    <div className="text-center">
      <h3 className="text-xl font-bold text-wot-goldLight mb-4">
        Candidature envoyée avec succès !
      </h3>
      <p className="text-wot-light/80 mb-6">
        Nous examinerons votre candidature dans les plus brefs délais.
        Vous serez contacté via Discord pour la suite du processus.
      </p>
      <button
        onClick={onClose}
        className="btn-primary"
      >
        Fermer
      </button>
    </div>
  );
}