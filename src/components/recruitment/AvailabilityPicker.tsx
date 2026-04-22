import { cn } from '@/lib/cn';
import { DAYS, TIME_SLOTS } from '@/lib/constants';

interface AvailabilityPickerProps {
  days: string[];
  slots: string[];
  onChange: (value: { days: string[]; slots: string[] }) => void;
  error?: string;
}

export function AvailabilityPicker({
  days,
  slots,
  onChange,
  error,
}: AvailabilityPickerProps) {
  const toggleDay = (day: string) => {
    onChange({
      days: days.includes(day) ? days.filter((d) => d !== day) : [...days, day],
      slots,
    });
  };

  const toggleSlot = (slot: string) => {
    onChange({
      days,
      slots: slots.includes(slot) ? slots.filter((s) => s !== slot) : [...slots, slot],
    });
  };

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-atfr-fog mb-2">
          Jours de disponibilité
        </p>
        <div className="flex flex-wrap gap-2">
          {DAYS.map((d) => {
            const active = days.includes(d);
            return (
              <button
                key={d}
                type="button"
                onClick={() => toggleDay(d)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-sm border transition-colors',
                  active
                    ? 'bg-atfr-gold text-atfr-ink border-atfr-gold'
                    : 'border-atfr-gold/30 text-atfr-fog hover:text-atfr-bone hover:border-atfr-gold/60',
                )}
              >
                {d}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-atfr-fog mb-2">
          Plages horaires
        </p>
        <div className="grid grid-cols-2 gap-2">
          {TIME_SLOTS.map((s) => {
            const active = slots.includes(s.id);
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => toggleSlot(s.id)}
                className={cn(
                  'px-3 py-2 rounded-md text-sm border text-left transition-colors',
                  active
                    ? 'bg-atfr-gold/10 border-atfr-gold text-atfr-gold'
                    : 'border-atfr-gold/20 text-atfr-fog hover:text-atfr-bone hover:border-atfr-gold/50',
                )}
              >
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      {error && <p className="text-xs text-atfr-danger">{error}</p>}
    </div>
  );
}
