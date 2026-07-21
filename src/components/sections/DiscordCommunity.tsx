import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ExternalLink,
  Headphones,
  Info,
  MessageSquare,
  Mic,
  Radio,
  Shield,
  Users,
} from 'lucide-react';
import { Button, Card, CardBody, Section } from '@/components/ui';
import { cn } from '@/lib/cn';
import { useContent } from '@/hooks/useContent';
import {
  useDiscordCommunityStats,
  useDiscordWidget,
  type DiscordWidgetMember,
} from '@/features/discord/queries';

/** Formatte un nombre de secondes en « 128 h » / « 42 min ». */
function formatVoiceDuration(seconds: number): string {
  if (seconds <= 0) return '0 h';
  const hours = Math.round(seconds / 3600);
  if (hours >= 1) return `${hours.toLocaleString('fr-FR')} h`;
  return `${Math.round(seconds / 60)} min`;
}

const STATUS_DOT = {
  online: 'bg-atfr-success',
  idle: 'bg-atfr-warning',
  dnd: 'bg-atfr-danger',
} as const;

export function DiscordCommunity() {
  const { get } = useContent();
  const serverId = get('discord_server_id');
  const invite = get('discord_invite_url');
  const { data: widget, isLoading } = useDiscordWidget(serverId || null);
  const { data: community } = useDiscordCommunityStats();

  // On expose une présence vivante (qui est en vocal / en ligne) SANS révéler
  // la structure des salons : pas de nom de salon, pas de regroupement par
  // channel — juste une liste à plat des membres connectés en vocal.
  const { voiceMembers, voiceCount, onlineNotInVoice } = useMemo(() => {
    const members = widget?.members ?? [];
    const inVoice = members.filter((m) => !!m.channel_id);
    return {
      voiceMembers: inVoice.slice(0, 16),
      voiceCount: inVoice.length,
      onlineNotInVoice: members.filter((m) => !m.channel_id).slice(0, 8),
    };
  }, [widget]);

  if (!serverId && !invite) return null;

  const inviteUrl = widget?.instant_invite || invite;
  const name = widget?.name ?? 'Rejoindre le Discord';
  const presenceCount = widget?.presence_count ?? null;

  return (
    <Section
      eyebrow="Communauté"
      title="Sur notre Discord, en ce moment"
      description="Vocal ouvert, discussions tactiques, pelotons spontanés. Venez dire bonjour."
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
      >
        <Card className="overflow-hidden">
          <CardBody className="relative p-6 sm:p-8">
            <div
              className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-[#5865F2]/15 blur-3xl"
              aria-hidden
            />

            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#5865F2]/15 border border-[#5865F2]/40 text-[#A5B4FC]">
                  <MessageSquare size={26} strokeWidth={1.6} />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-atfr-gold/80 mb-1">
                    Serveur
                  </p>
                  <h3 className="font-display text-2xl text-atfr-bone">
                    {name}
                  </h3>
                </div>
              </div>

              {inviteUrl && (
                <a
                  href={inviteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="lg:self-start"
                >
                  <Button
                    size="lg"
                    trailingIcon={<ExternalLink size={14} />}
                    className="w-full lg:w-auto"
                  >
                    Rejoindre le Discord
                  </Button>
                </a>
              )}
            </div>

            {/* Stats row — issues du bot (membres par clan) avec repli sur
                le widget si l'agrégat serveur n'est pas disponible. */}
            {community ? (
              <div className="relative mt-8 grid grid-cols-3 gap-3 sm:gap-4">
                <Stat
                  icon={<Users size={16} />}
                  label="Membres serveur"
                  value={community.total_members.toLocaleString('fr-FR')}
                  sub={
                    community.online_total > 0
                      ? `${community.online_total} en ligne`
                      : undefined
                  }
                />
                <Stat
                  icon={<Shield size={16} />}
                  label="ATFR"
                  value={community.atfr_members.toLocaleString('fr-FR')}
                  highlight={community.atfr_members > 0}
                  sub={
                    community.atfr_online > 0
                      ? `${community.atfr_online} en ligne`
                      : undefined
                  }
                />
                <Stat
                  icon={<Shield size={16} />}
                  label="A-T-O"
                  value={community.ato_members.toLocaleString('fr-FR')}
                  highlight={community.ato_members > 0}
                  sub={
                    community.ato_online > 0
                      ? `${community.ato_online} en ligne`
                      : undefined
                  }
                />
              </div>
            ) : (
              <div className="relative mt-8 grid grid-cols-2 gap-3 sm:gap-4">
                <Stat
                  icon={<Radio size={16} />}
                  label="Connectés"
                  value={presenceCount ?? '—'}
                />
                <Stat
                  icon={<Mic size={16} />}
                  label="En vocal"
                  value={voiceCount}
                  highlight={voiceCount > 0}
                />
              </div>
            )}

            {/* Temps vocal cumulé sur 30 jours glissants (bot) */}
            {community && community.voice_seconds_30d > 0 && (
              <div className="relative mt-4 flex items-center justify-between gap-3 rounded-lg border border-atfr-gold/15 bg-atfr-graphite/40 px-4 py-3">
                <div className="flex items-center gap-2.5 text-atfr-fog">
                  <Headphones size={16} className="text-atfr-gold" />
                  <span className="text-xs uppercase tracking-[0.18em]">
                    Temps vocal · 30 derniers jours
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-display text-xl text-atfr-bone">
                    {formatVoiceDuration(community.voice_seconds_30d)}
                  </span>
                  {community.voice_members_30d > 0 && (
                    <span className="ml-2 text-xs text-atfr-fog">
                      · {community.voice_members_30d} membre
                      {community.voice_members_30d > 1 ? 's' : ''} actif
                      {community.voice_members_30d > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Voice channels detail */}
            {isLoading ? (
              <div className="mt-8 h-24 shimmer rounded-lg" />
            ) : !widget ? (
              <div className="relative mt-8 flex items-start gap-3 rounded-lg border border-atfr-gold/12 bg-atfr-graphite/40 p-4 text-sm text-atfr-fog">
                <Info size={16} className="mt-0.5 shrink-0 text-atfr-gold/70" />
                <p>
                  Le widget Discord est momentanément indisponible (désactivé ou
                  surchargé). Le bouton « Rejoindre le Discord » reste actif.
                </p>
              </div>
            ) : voiceMembers.length > 0 ? (
              <div className="mt-8 border-t border-atfr-gold/10 pt-6">
                <p className="mb-4 flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-atfr-fog">
                  <Mic size={14} className="text-atfr-success" />
                  En vocal · {voiceCount}{' '}
                  {voiceCount > 1 ? 'connectés' : 'connecté'}
                </p>
                <div className="flex flex-wrap gap-2">
                  {voiceMembers.map((m) => (
                    <MemberChip key={m.id} member={m} />
                  ))}
                </div>
              </div>
            ) : onlineNotInVoice.length > 0 ? (
              <div className="mt-8 border-t border-atfr-gold/10 pt-6">
                <p className="text-xs uppercase tracking-[0.25em] text-atfr-fog mb-4">
                  Personne en vocal · membres connectés
                </p>
                <div className="flex flex-wrap gap-2">
                  {onlineNotInVoice.map((m) => (
                    <MemberChip key={m.id} member={m} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="relative mt-8 rounded-lg border border-atfr-gold/12 bg-atfr-graphite/40 p-6 text-center">
                <Mic size={22} className="mx-auto mb-2 text-atfr-gold/60" />
                <p className="text-sm text-atfr-bone">C'est calme pour l'instant.</p>
                <p className="mt-1 text-xs text-atfr-fog">
                  Rejoins le vocal et lance le mouvement — les soirées démarrent
                  souvent comme ça.
                </p>
              </div>
            )}
          </CardBody>
        </Card>
      </motion.div>
    </Section>
  );
}

function Stat({
  icon,
  label,
  value,
  highlight,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  highlight?: boolean;
  sub?: string;
}) {
  return (
    <div
      className={cn(
        'rounded-lg border p-3 text-center transition-colors',
        highlight
          ? 'border-atfr-gold/40 bg-atfr-gold/5'
          : 'border-atfr-gold/15 bg-atfr-graphite/40',
      )}
    >
      <div
        className={cn(
          'inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em]',
          highlight ? 'text-atfr-gold' : 'text-atfr-fog',
        )}
      >
        {icon}
        {label}
      </div>
      <p className="mt-1 font-display text-2xl text-atfr-bone">{value}</p>
      {sub && (
        <p className="mt-0.5 inline-flex items-center gap-1 text-[10px] text-atfr-success">
          <span className="h-1.5 w-1.5 rounded-full bg-atfr-success" aria-hidden />
          {sub}
        </p>
      )}
    </div>
  );
}

function MemberChip({ member }: { member: DiscordWidgetMember }) {
  return (
    <div className="flex items-center gap-2 rounded-md bg-atfr-ink/60 border border-atfr-gold/10 px-2.5 py-1.5 text-sm">
      <div className="relative shrink-0">
        <div className="h-7 w-7 rounded-full bg-atfr-ink border border-atfr-gold/20 overflow-hidden flex items-center justify-center text-atfr-gold text-[10px] font-display">
          {member.avatar_url ? (
            <img
              src={member.avatar_url}
              alt=""
              className="h-full w-full object-cover"
              loading="lazy"
              decoding="async"
            />
          ) : (
            member.username.slice(0, 2).toUpperCase()
          )}
        </div>
        <span
          className={cn(
            'absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border-2 border-atfr-carbon',
            STATUS_DOT[member.status] ?? STATUS_DOT.online,
          )}
        />
      </div>
      <div className="min-w-0">
        <p className="truncate text-atfr-bone leading-none">
          {member.username}
        </p>
        {member.activity?.name && (
          <p className="truncate text-[10px] text-atfr-fog leading-tight mt-0.5">
            {member.activity.name}
          </p>
        )}
      </div>
    </div>
  );
}
