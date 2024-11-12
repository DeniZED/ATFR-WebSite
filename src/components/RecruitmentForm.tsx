import React from 'react';
import { X } from 'lucide-react';

interface RecruitmentFormProps {
  onClose: () => void;
}

const GOOGLE_FORM_URL = "https://forms.gle/oAGFeTVtq9GKgyn67";

export default function RecruitmentForm({ onClose }: RecruitmentFormProps) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-wot-darker border border-wot-gold/20 rounded-lg w-full max-w-2xl">
        <div className="sticky top-0 bg-wot-darker border-b border-wot-gold/20 p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-wot-gold">Candidature ATFR</h2>
          <button
            onClick={onClose}
            className="text-wot-light/60 hover:text-wot-light"
          >
            <X className="h-6 w-6" strokeWidth={1.5} />
          </button>
        </div>

        <div className="p-6">
          <div className="text-center space-y-4">
            <p className="text-wot-light/80">
              Pour postuler, veuillez remplir notre formulaire de candidature Google Forms.
              Cela nous permettra de mieux évaluer votre profil.
            </p>
            <div className="flex justify-center gap-4">
              <a
                href={GOOGLE_FORM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
                onClick={onClose}
              >
                Accéder au formulaire
              </a>
              <button
                onClick={onClose}
                className="btn-secondary"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}