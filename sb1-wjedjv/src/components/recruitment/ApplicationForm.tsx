import React, { useState } from 'react';
import AvailabilitySelector from './AvailabilitySelector';

interface ApplicationFormProps {
  onSubmit: (formData: FormData) => void;
  disabled?: boolean;
}

export default function ApplicationForm({ onSubmit, disabled }: ApplicationFormProps) {
  const [availability, setAvailability] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set('availability', availability);
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-wot-light/80 mb-2">
          Discord (pseudo#0000) *
        </label>
        <input
          required
          type="text"
          name="discordTag"
          pattern="^.{3,32}#[0-9]{4}$"
          title="Format: pseudo#0000"
          className="w-full px-3 py-2 bg-wot-dark border border-wot-gold/20 rounded-lg
                   text-wot-light placeholder-wot-light/50 focus:outline-none focus:border-wot-gold"
          placeholder="pseudo#0000"
          disabled={disabled}
        />
      </div>

      <AvailabilitySelector
        onChange={setAvailability}
        disabled={disabled}
      />

      <div>
        <label className="block text-sm font-medium text-wot-light/80 mb-2">
          Informations complémentaires *
        </label>
        <textarea
          required
          name="motivation"
          rows={4}
          className="w-full px-3 py-2 bg-wot-dark border border-wot-gold/20 rounded-lg
                   text-wot-light placeholder-wot-light/50 focus:outline-none focus:border-wot-gold
                   resize-none"
          placeholder="Parlez-nous de votre expérience, vos objectifs, et pourquoi vous souhaitez rejoindre notre clan..."
          disabled={disabled}
        />
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="submit"
          className="btn-primary"
          disabled={disabled || !availability}
        >
          {disabled ? 'Envoi...' : 'Envoyer ma candidature'}
        </button>
      </div>
    </form>
  );
}