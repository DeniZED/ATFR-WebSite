import { describe, it, expect } from 'vitest';
import { computePlayerTimeline } from './timeline';

describe('computePlayerTimeline', () => {
  it('fusionne et trie les événements du plus récent au plus ancien', () => {
    const events = computePlayerTimeline({
      memberHistory: [
        { occurred_at: '2026-01-01T10:00:00Z', action: 'joined', new_role: 'private' } as never,
        { occurred_at: '2026-06-01T10:00:00Z', action: 'left' } as never,
      ],
      statusHistory: [
        {
          changed_at: '2026-03-01T10:00:00Z',
          old_status: 'active',
          new_status: 'watch',
        } as never,
      ],
      notes: [
        { created_at: '2026-05-01T10:00:00Z', content: 'Contacté sur Discord' } as never,
      ],
      alerts: [
        {
          detected_at: '2026-04-01T10:00:00Z',
          resolved_at: '2026-04-10T10:00:00Z',
          kind: 'inactive',
          severity: 'danger',
        } as never,
      ],
      discordLink: { linked_at: '2026-02-01T10:00:00Z', discord_tag: 'user#1' } as never,
    });

    // 2 mouvements + 1 statut + 1 note + 2 alertes (open+resolved) + 1 discord = 7
    expect(events).toHaveLength(7);
    // Le plus récent en tête (départ du 01/06).
    expect(events[0].kind).toBe('clan_leave');
    // Trié strictement décroissant.
    for (let i = 1; i < events.length; i++) {
      expect(new Date(events[i - 1].at).getTime()).toBeGreaterThanOrEqual(
        new Date(events[i].at).getTime(),
      );
    }
  });

  it('ignore le lien Discord sans horodatage', () => {
    const events = computePlayerTimeline({
      memberHistory: [],
      statusHistory: [],
      notes: [],
      alerts: [],
      discordLink: null,
    });
    expect(events).toHaveLength(0);
  });
});
