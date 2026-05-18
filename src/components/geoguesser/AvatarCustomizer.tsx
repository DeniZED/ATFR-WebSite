import { useState } from 'react';
import { Lock, Palette, Sparkles, Star, Tag, X } from 'lucide-react';
import { Badge, Button, Card, CardBody } from '@/components/ui';
import { cn } from '@/lib/cn';
import {
  UNLOCKS,
  getUnlockedIds,
  type AvatarConfig,
  type LevelInfo,
  type UnlockType,
} from '@/features/geoguesser/playerProfile';
import { TankAvatar } from './TankAvatar';

const TABS: { id: UnlockType; label: string; icon: typeof Palette }[] = [
  { id: 'skin',      label: 'Skins',       icon: Palette },
  { id: 'accessory', label: 'Accessoires', icon: Star },
  { id: 'effect',    label: 'Effets',      icon: Sparkles },
  { id: 'title',     label: 'Titres',      icon: Tag },
];

interface AvatarCustomizerProps {
  config: AvatarConfig;
  levelInfo: LevelInfo;
  onSave: (config: AvatarConfig) => void;
  onClose: () => void;
}

export function AvatarCustomizer({ config, levelInfo, onSave, onClose }: AvatarCustomizerProps) {
  const [draft, setDraft] = useState<AvatarConfig>({ ...config });
  const [tab, setTab] = useState<UnlockType>('skin');

  const unlocked = getUnlockedIds(levelInfo.level);
  const items = UNLOCKS.filter((u) => u.type === tab);

  function toggleAccessory(id: string) {
    setDraft((prev) => {
      const already = prev.accessoryIds.includes(id);
      return {
        ...prev,
        accessoryIds: already
          ? prev.accessoryIds.filter((a) => a !== id)
          : [...prev.accessoryIds, id],
      };
    });
  }

  function selectSkin(id: string) {
    setDraft((prev) => ({ ...prev, skinId: id }));
  }

  function selectEffect(id: string) {
    setDraft((prev) => ({ ...prev, effectId: prev.effectId === id ? null : id }));
  }

  function selectTitle(id: string) {
    setDraft((prev) => ({ ...prev, titleId: prev.titleId === id ? null : id }));
  }

  function handleItem(type: UnlockType, id: string, isLocked: boolean) {
    if (isLocked) return;
    if (type === 'skin') selectSkin(id);
    else if (type === 'accessory') toggleAccessory(id);
    else if (type === 'effect') selectEffect(id);
    else if (type === 'title') selectTitle(id);
  }

  function isSelected(type: UnlockType, id: string): boolean {
    if (type === 'skin') return draft.skinId === id;
    if (type === 'accessory') return draft.accessoryIds.includes(id);
    if (type === 'effect') return draft.effectId === id;
    if (type === 'title') return draft.titleId === id;
    return false;
  }

  const xpPct = Math.round(levelInfo.progress * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-0 shrink-0">
          <h2 className="font-display text-xl text-atfr-bone flex items-center gap-2">
            <Palette size={18} className="text-atfr-gold" />
            Personnaliser l'avatar
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-atfr-fog hover:text-atfr-bone hover:bg-atfr-graphite/60 transition-colors"
            aria-label="Fermer"
          >
            <X size={18} />
          </button>
        </div>

        <CardBody className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Preview + level */}
          <div className="flex items-center gap-5 rounded-xl border border-atfr-gold/20 bg-atfr-graphite/40 p-4">
            <div className="shrink-0 flex items-center justify-center w-28 h-20 rounded-lg bg-atfr-ink/60 border border-atfr-gold/15">
              <TankAvatar config={draft} size={110} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1.5">
                <span className="font-display text-2xl text-atfr-gold">Niv. {levelInfo.level}</span>
                <Badge variant="gold">{levelInfo.title}</Badge>
              </div>
              {draft.titleId && (
                <p className="text-xs text-atfr-fog/70 mb-2 italic">
                  {UNLOCKS.find((u) => u.id === draft.titleId)?.label}
                </p>
              )}
              {/* XP bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-atfr-fog">
                  <span>{levelInfo.xp.toLocaleString('fr')} XP</span>
                  {!levelInfo.isMax && (
                    <span>+{levelInfo.xpToNext.toLocaleString('fr')} XP pour le niveau {levelInfo.level + 1}</span>
                  )}
                  {levelInfo.isMax && <span className="text-atfr-gold">Niveau maximum atteint</span>}
                </div>
                <div className="h-2 rounded-full bg-atfr-ink/70 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-atfr-gold/80 to-atfr-gold transition-all duration-500"
                    style={{ width: `${xpPct}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 rounded-xl bg-atfr-ink/60 p-1">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={cn(
                  'flex-1 flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-medium transition-all',
                  tab === id
                    ? 'bg-atfr-graphite text-atfr-gold shadow-sm'
                    : 'text-atfr-fog hover:text-atfr-bone',
                )}
              >
                <Icon size={12} />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>

          {/* Items grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {items.map((item) => {
              const isLocked = !unlocked.has(item.id);
              const selected = isSelected(item.type, item.id);
              return (
                <button
                  key={item.id}
                  onClick={() => handleItem(item.type, item.id, isLocked)}
                  disabled={isLocked}
                  className={cn(
                    'relative rounded-xl border p-3 text-left transition-all min-h-[80px] flex flex-col justify-between',
                    isLocked
                      ? 'border-atfr-gold/8 bg-atfr-ink/30 opacity-50 cursor-not-allowed'
                      : selected
                        ? 'border-atfr-gold/60 bg-atfr-gold/12 shadow-sm shadow-atfr-gold/20'
                        : 'border-atfr-gold/15 bg-atfr-graphite/30 hover:border-atfr-gold/30 hover:bg-atfr-graphite/50',
                  )}
                >
                  {/* Lock icon */}
                  {isLocked && (
                    <div className="absolute top-2 right-2 text-atfr-fog/40">
                      <Lock size={10} />
                    </div>
                  )}
                  {/* Selection dot */}
                  {selected && !isLocked && (
                    <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-atfr-gold" />
                  )}
                  <div>
                    {/* Skin color preview */}
                    {item.type === 'skin' && (
                      <SkinSwatch skinId={item.id.replace('skin-', '')} />
                    )}
                    <p className="text-xs font-medium text-atfr-bone mt-1.5 leading-tight">
                      {item.label}
                    </p>
                    {item.description && (
                      <p className="text-[10px] text-atfr-fog/60 mt-0.5 leading-tight">
                        {item.description}
                      </p>
                    )}
                  </div>
                  {isLocked && (
                    <p className="text-[9px] text-atfr-fog/40 uppercase tracking-widest mt-1">
                      Niv. {item.levelRequired}
                    </p>
                  )}
                </button>
              );
            })}
          </div>
        </CardBody>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 pb-5 pt-3 border-t border-atfr-gold/10 shrink-0 bg-atfr-ink/30">
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button
            onClick={() => { onSave(draft); onClose(); }}
            trailingIcon={<Palette size={13} />}
          >
            Appliquer
          </Button>
        </div>
      </Card>
    </div>
  );
}

// Small color swatch for skin items
const SKIN_COLORS: Record<string, string[]> = {
  default:  ['#556B2F', '#6B7E38'],
  desert:   ['#C19A3E', '#CDA844'],
  winter:   ['#C4CDD6', '#D2DBE4'],
  urban:    ['#6B7280', '#7D8D9A'],
  forest:   ['#2D4A1E', '#3A5E27'],
  digital:  ['#4A6741', '#5A7A4E'],
  arctic:   ['#D0E0EC', '#DDE8F4'],
  atfr:     ['#0F1923', '#C9A227'],
  chrome:   ['#A8B4C4', '#D0DCE8'],
  prestige: ['#0C0C0C', '#C9A227'],
};

function SkinSwatch({ skinId }: { skinId: string }) {
  const colors = SKIN_COLORS[skinId] ?? ['#556B2F', '#6B7E38'];
  return (
    <div className="flex gap-1 h-4">
      {colors.map((c, i) => (
        <div key={i} className="flex-1 rounded-sm" style={{ background: c }} />
      ))}
    </div>
  );
}
