import { useState } from 'react';
import { Check, Gift, Lock, Palette, Shield, Tag, X } from 'lucide-react';
import { Badge, Button, Card, CardBody } from '@/components/ui';
import { cn } from '@/lib/cn';
import {
  UNLOCKS,
  PRIMARY_COLORS,
  ACCENT_COLORS,
  PATTERNS,
  BORDER_STYLES,
  getNextReward,
  getUnlockedIds,
  type AvatarConfig,
  type LevelInfo,
} from '@/features/geoguesser/playerProfile';
import { AcademyBadge } from './AcademyBadge';

type CustomizerTab = 'color' | 'emblem' | 'title';

const TABS: { id: CustomizerTab; label: string; icon: typeof Palette }[] = [
  { id: 'color',  label: 'Couleur',  icon: Palette },
  { id: 'emblem', label: 'Emblèmes', icon: Shield },
  { id: 'title',  label: 'Titres',   icon: Tag },
];

// Palette commune primaire + accent pour les sélecteurs secondaires
const ALL_COLORS = [
  ...PRIMARY_COLORS,
  ...ACCENT_COLORS,
];

interface AvatarCustomizerProps {
  config: AvatarConfig;
  levelInfo: LevelInfo;
  onSave: (config: AvatarConfig) => void;
  onClose: () => void;
}

export function AvatarCustomizer({ config, levelInfo, onSave, onClose }: AvatarCustomizerProps) {
  const [draft, setDraft] = useState<AvatarConfig>({ ...config });
  const [tab, setTab] = useState<CustomizerTab>('color');

  const unlocked = getUnlockedIds(levelInfo.level);
  const playerLevel = levelInfo.level;

  function selectColor(id: string) {
    setDraft((prev) => ({ ...prev, primaryColorId: id }));
  }
  function selectAccent(id: string | null) {
    setDraft((prev) => ({ ...prev, accentColorId: id }));
  }
  function selectNumeralColor(id: string | null) {
    setDraft((prev) => ({ ...prev, numeralColorId: id }));
  }
  function selectBorderStyle(id: string) {
    setDraft((prev) => ({ ...prev, borderStyleId: id }));
  }
  function selectPattern(id: string | null) {
    setDraft((prev) => ({ ...prev, patternId: prev.patternId === id ? null : id }));
  }
  function selectEmblem(id: string) {
    setDraft((prev) => ({ ...prev, emblemId: prev.emblemId === id ? null : id }));
  }
  function selectEmblemColor(id: string | null) {
    setDraft((prev) => ({ ...prev, emblemColorId: id }));
  }
  function selectTitle(id: string) {
    setDraft((prev) => ({ ...prev, titleId: prev.titleId === id ? null : id }));
  }

  const xpPct = Math.round(levelInfo.progress * 100);
  const nextReward = getNextReward(levelInfo.level);

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-0 shrink-0">
          <h2 className="font-display text-xl text-atfr-bone flex items-center gap-2">
            <Palette size={18} className="text-atfr-gold" />
            Personnaliser l'insigne
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
            <div className="shrink-0 flex items-center justify-center w-24 h-28 rounded-lg bg-atfr-ink/60 border border-atfr-gold/15">
              <AcademyBadge
                levelInfo={levelInfo}
                primaryColorId={draft.primaryColorId}
                accentColorId={draft.accentColorId}
                numeralColorId={draft.numeralColorId}
                emblemId={draft.emblemId}
                emblemColorId={draft.emblemColorId}
                patternId={draft.patternId}
                borderStyleId={draft.borderStyleId}
                size={90}
              />
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
                    <span>+{levelInfo.xpToNext.toLocaleString('fr')} XP → Niv. {levelInfo.level + 1}</span>
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
              {/* Next reward */}
              {nextReward && (
                <div className="flex items-start gap-1.5 mt-1.5 rounded-lg bg-atfr-ink/50 border border-atfr-gold/10 px-2.5 py-1.5">
                  <Gift size={11} className="text-atfr-gold/60 mt-0.5 shrink-0" />
                  <p className="text-[10px] text-atfr-fog/60 leading-tight">
                    <span className="text-atfr-gold/80 font-medium">Niv. {nextReward.level} :</span>{' '}
                    {nextReward.unlocks.map((u) => u.label).join(', ')}
                  </p>
                </div>
              )}
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

          {/* ── Tab: Couleur ── */}
          {tab === 'color' && (
            <div className="space-y-5">

              {/* Couleur primaire */}
              <div>
                <p className="text-[10px] text-atfr-fog/60 uppercase tracking-widest mb-2">Couleur principale</p>
                <div className="grid grid-cols-8 gap-2">
                  {PRIMARY_COLORS.map((color) => {
                    const isLocked = color.levelRequired > playerLevel;
                    const selected = draft.primaryColorId === color.id;
                    return (
                      <button
                        key={color.id}
                        onClick={() => !isLocked && selectColor(color.id)}
                        disabled={isLocked}
                        title={`${color.label}${isLocked ? ` (Niv. ${color.levelRequired})` : ''}`}
                        className={cn(
                          'relative w-8 h-8 rounded-full transition-all',
                          isLocked ? 'opacity-35 cursor-not-allowed grayscale' : 'cursor-pointer hover:scale-110',
                          selected && 'ring-2 ring-atfr-gold ring-offset-2 ring-offset-atfr-ink scale-110',
                        )}
                        style={{ backgroundColor: color.hex }}
                      >
                        {selected && <span className="absolute inset-0 flex items-center justify-center"><Check size={12} className="text-white drop-shadow" /></span>}
                        {isLocked && <span className="absolute inset-0 flex items-center justify-center"><Lock size={8} className="text-white/60" /></span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Couleur accent */}
              <div>
                <p className="text-[10px] text-atfr-fog/60 uppercase tracking-widest mb-2">Accent (Niv. 4+)</p>
                <div className="grid grid-cols-8 gap-2">
                  <button
                    onClick={() => selectAccent(null)}
                    title="Aucun accent"
                    className={cn(
                      'relative w-8 h-8 rounded-full border border-atfr-fog/30 transition-all flex items-center justify-center cursor-pointer hover:scale-110 bg-atfr-ink',
                      draft.accentColorId === null && 'ring-2 ring-atfr-gold ring-offset-2 ring-offset-atfr-ink scale-110',
                    )}
                  >
                    <X size={10} className="text-atfr-fog/60" />
                  </button>
                  {ACCENT_COLORS.map((color) => {
                    const isLocked = color.levelRequired > playerLevel;
                    const selected = draft.accentColorId === color.id;
                    return (
                      <button
                        key={color.id}
                        onClick={() => !isLocked && selectAccent(color.id)}
                        disabled={isLocked}
                        title={`${color.label}${isLocked ? ` (Niv. ${color.levelRequired})` : ''}`}
                        className={cn(
                          'relative w-8 h-8 rounded-full transition-all',
                          isLocked ? 'opacity-35 cursor-not-allowed grayscale' : 'cursor-pointer hover:scale-110',
                          selected && 'ring-2 ring-atfr-gold ring-offset-2 ring-offset-atfr-ink scale-110',
                        )}
                        style={{ backgroundColor: color.hex }}
                      >
                        {selected && <span className="absolute inset-0 flex items-center justify-center"><Check size={12} className="text-white drop-shadow" /></span>}
                        {isLocked && <span className="absolute inset-0 flex items-center justify-center"><Lock size={8} className="text-white/60" /></span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Couleur du chiffre */}
              <div>
                <p className="text-[10px] text-atfr-fog/60 uppercase tracking-widest mb-2">Couleur du chiffre</p>
                <div className="grid grid-cols-8 gap-2">
                  <button
                    onClick={() => selectNumeralColor(null)}
                    title="Défaut (dérivé de la couleur principale)"
                    className={cn(
                      'relative w-8 h-8 rounded-full border border-atfr-fog/30 transition-all flex items-center justify-center cursor-pointer hover:scale-110 bg-atfr-ink',
                      draft.numeralColorId === null && 'ring-2 ring-atfr-gold ring-offset-2 ring-offset-atfr-ink scale-110',
                    )}
                  >
                    <X size={10} className="text-atfr-fog/60" />
                  </button>
                  {ALL_COLORS.map((color) => {
                    const isLocked = color.levelRequired > playerLevel;
                    const selected = draft.numeralColorId === color.id;
                    return (
                      <button
                        key={color.id}
                        onClick={() => !isLocked && selectNumeralColor(color.id)}
                        disabled={isLocked}
                        title={`${color.label}${isLocked ? ` (Niv. ${color.levelRequired})` : ''}`}
                        className={cn(
                          'relative w-8 h-8 rounded-full transition-all',
                          isLocked ? 'opacity-35 cursor-not-allowed grayscale' : 'cursor-pointer hover:scale-110',
                          selected && 'ring-2 ring-atfr-gold ring-offset-2 ring-offset-atfr-ink scale-110',
                        )}
                        style={{ backgroundColor: color.hex }}
                      >
                        {selected && <span className="absolute inset-0 flex items-center justify-center"><Check size={12} className="text-white drop-shadow" /></span>}
                        {isLocked && <span className="absolute inset-0 flex items-center justify-center"><Lock size={8} className="text-white/60" /></span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Style de bordure */}
              <div>
                <p className="text-[10px] text-atfr-fog/60 uppercase tracking-widest mb-2">Style de bordure</p>
                <div className="flex gap-2 flex-wrap">
                  {BORDER_STYLES.map((style) => (
                    <button
                      key={style.id}
                      onClick={() => selectBorderStyle(style.id)}
                      className={cn(
                        'rounded-lg border px-3 py-1.5 text-xs font-medium transition-all',
                        draft.borderStyleId === style.id
                          ? 'border-atfr-gold/60 bg-atfr-gold/15 text-atfr-gold'
                          : 'border-atfr-gold/20 bg-atfr-graphite/30 text-atfr-fog hover:border-atfr-gold/40 hover:text-atfr-bone',
                      )}
                    >
                      {style.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Motif de fond */}
              <div>
                <p className="text-[10px] text-atfr-fog/60 uppercase tracking-widest mb-2">Motif de fond</p>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => selectPattern(null)}
                    className={cn(
                      'rounded-lg border px-3 py-1.5 text-xs font-medium transition-all',
                      draft.patternId === null
                        ? 'border-atfr-gold/60 bg-atfr-gold/15 text-atfr-gold'
                        : 'border-atfr-gold/20 bg-atfr-graphite/30 text-atfr-fog hover:border-atfr-gold/40 hover:text-atfr-bone',
                    )}
                  >
                    Aucun
                  </button>
                  {PATTERNS.map((pat) => (
                    <button
                      key={pat.id}
                      onClick={() => selectPattern(pat.id)}
                      className={cn(
                        'rounded-lg border px-3 py-1.5 text-xs font-medium transition-all',
                        draft.patternId === pat.id
                          ? 'border-atfr-gold/60 bg-atfr-gold/15 text-atfr-gold'
                          : 'border-atfr-gold/20 bg-atfr-graphite/30 text-atfr-fog hover:border-atfr-gold/40 hover:text-atfr-bone',
                      )}
                    >
                      {pat.label}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* ── Tab: Emblèmes ── */}
          {tab === 'emblem' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {UNLOCKS.filter((u) => u.type === 'emblem').map((item) => {
                  const isLocked = !unlocked.has(item.id);
                  const selected = draft.emblemId === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => !isLocked && selectEmblem(item.id)}
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
                      {isLocked && <div className="absolute top-2 right-2 text-atfr-fog/40"><Lock size={10} /></div>}
                      {selected && !isLocked && <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-atfr-gold" />}
                      <div>
                        <p className="text-xs font-medium text-atfr-bone mt-1.5 leading-tight">{item.label}</p>
                        {item.description && (
                          <p className="text-[10px] text-atfr-fog/60 mt-0.5 leading-tight">{item.description}</p>
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

              {/* Couleur de l'emblème */}
              {draft.emblemId && (
                <div>
                  <p className="text-[10px] text-atfr-fog/60 uppercase tracking-widest mb-2">Couleur de l'emblème</p>
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => selectEmblemColor(null)}
                      title="Défaut (couleur accent)"
                      className={cn(
                        'relative w-8 h-8 rounded-full border border-atfr-fog/30 transition-all flex items-center justify-center cursor-pointer hover:scale-110 bg-atfr-ink',
                        draft.emblemColorId === null && 'ring-2 ring-atfr-gold ring-offset-2 ring-offset-atfr-ink scale-110',
                      )}
                    >
                      <X size={10} className="text-atfr-fog/60" />
                    </button>
                    {ALL_COLORS.map((color) => {
                      const isLocked = color.levelRequired > playerLevel;
                      const selected = draft.emblemColorId === color.id;
                      return (
                        <button
                          key={color.id}
                          onClick={() => !isLocked && selectEmblemColor(color.id)}
                          disabled={isLocked}
                          title={`${color.label}${isLocked ? ` (Niv. ${color.levelRequired})` : ''}`}
                          className={cn(
                            'relative w-8 h-8 rounded-full transition-all',
                            isLocked ? 'opacity-35 cursor-not-allowed grayscale' : 'cursor-pointer hover:scale-110',
                            selected && 'ring-2 ring-atfr-gold ring-offset-2 ring-offset-atfr-ink scale-110',
                          )}
                          style={{ backgroundColor: color.hex }}
                        >
                          {selected && <span className="absolute inset-0 flex items-center justify-center"><Check size={12} className="text-white drop-shadow" /></span>}
                          {isLocked && <span className="absolute inset-0 flex items-center justify-center"><Lock size={8} className="text-white/60" /></span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Tab: Titres ── */}
          {tab === 'title' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {UNLOCKS.filter((u) => u.type === 'title').map((item) => {
                const isLocked = !unlocked.has(item.id);
                const selected = draft.titleId === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => !isLocked && selectTitle(item.id)}
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
                    {isLocked && <div className="absolute top-2 right-2 text-atfr-fog/40"><Lock size={10} /></div>}
                    {selected && !isLocked && <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-atfr-gold" />}
                    <div>
                      <p className="text-xs font-medium text-atfr-bone mt-1.5 leading-tight">{item.label}</p>
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
          )}
        </CardBody>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 pb-5 pt-3 border-t border-atfr-gold/10 shrink-0 bg-atfr-ink/30">
          <Button variant="outline" onClick={onClose}>Annuler</Button>
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
