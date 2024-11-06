import React, { useState, useEffect } from 'react';

interface AvailabilitySelectorProps {
  onChange: (value: string) => void;
  disabled?: boolean;
}

const DAYS = [
  'Lundi', 'Mardi', 'Mercredi', 'Jeudi',
  'Vendredi', 'Samedi', 'Dimanche'
];

const HOURS = [
  'Matin (8h-12h)',
  'Après-midi (12h-18h)',
  'Soir (18h-22h)',
  'Nuit (22h-00h)'
];

export default function AvailabilitySelector({ onChange, disabled }: AvailabilitySelectorProps) {
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [selectedHours, setSelectedHours] = useState<string[]>([]);

  useEffect(() => {
    const availability = [
      ...selectedDays,
      ...selectedHours
    ].join(', ');
    onChange(availability);
  }, [selectedDays, selectedHours, onChange]);

  const toggleDay = (day: string) => {
    setSelectedDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  const toggleHour = (hour: string) => {
    setSelectedHours(prev =>
      prev.includes(hour)
        ? prev.filter(h => h !== hour)
        : [...prev, hour]
    );
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-wot-light/80">
        Disponibilités *
      </label>

      <div className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm text-wot-light/60">Jours disponibles:</p>
          <div className="flex flex-wrap gap-2">
            {DAYS.map(day => (
              <button
                key={day}
                type="button"
                onClick={() => toggleDay(day)}
                disabled={disabled}
                className={`px-3 py-1 rounded-full text-sm transition-colors
                  ${selectedDays.includes(day)
                    ? 'bg-wot-gold text-wot-dark'
                    : 'bg-wot-dark text-wot-light/60 hover:text-wot-light'
                  }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm text-wot-light/60">Horaires disponibles:</p>
          <div className="flex flex-wrap gap-2">
            {HOURS.map(hour => (
              <button
                key={hour}
                type="button"
                onClick={() => toggleHour(hour)}
                disabled={disabled}
                className={`px-3 py-1 rounded-full text-sm transition-colors
                  ${selectedHours.includes(hour)
                    ? 'bg-wot-gold text-wot-dark'
                    : 'bg-wot-dark text-wot-light/60 hover:text-wot-light'
                  }`}
              >
                {hour}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}