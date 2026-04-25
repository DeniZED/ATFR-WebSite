import { motion } from 'framer-motion';
import { ExternalLink, Headphones, MessageSquare, Mic, Radio } from 'lucide-react';
import { Button, Card, CardBody, Section } from '@/components/ui';
import { cn } from '@/lib/cn';
import { useContent } from '@/hooks/useContent';
import {
  useDiscordWidget,
  type DiscordWidgetMember,
} from '@/features/discord/queries';

const STATUS_DOT = {
  online: 'bg-emerald-400',
  idle: 'bg-amber-400',
  dnd: 'bg-red-400',
} as const;

interface VoiceChannelGroup {
  channelId: string;
  channelName: string;
  members: DiscordWidgetMember[];
}

export function DiscordCommunity() {
  const { get } = useContent();
  const serverId = get('discord_server_id');
  const invite = get('discord_invite_url');
  const { data: widget, isLoading } = useDiscordWidget(serverId || null);

  if (!serverId && !invite) return null;

  const inviteUrl = widget?.instant_invite || invite;
  const name = widget?.name ?? 'Rejoindre le Discord';
  const presenceCount = widget?.presence_count ?? null;

  const channels = widget?.channels ?? [];
  const members = widget?.members ?? [];

  // Group voice members by channel.
  const voiceMembers = members.filter((m) => !!m.channel_id);
  const voiceCount = voiceMembers.length;
  const channelsById = new Map(channels.map((c) => [c.id, c]));
  const groupsMap = new Map<string, VoiceChannelGroup>();
  for (const m of voiceMembers) {
    const cid = m.channel_id!;
    const channel = channelsById.get(cid);
    const channelName = channel?.name ?? 'Salon vocal';
    if (!groupsMap.has(cid)) {
      groupsMap.set(cid, { channelId: cid, channelName, members: [] });
    }
    groupsMap.get(cid)!.members.push(m);
  }
  const voiceGroups = [...groupsMap.values()].sort((a, b) => {
    const pa = channelsById.get(a.channelId)?.position ?? 0;
    const pb = channelsById.get(b.channelId)?.position ?? 0;
    return pa - pb;
  });

  // Members not in voice — used as fallback when no voice activity.
  const onlineNotInVoice = members
    .filter((m) => !m.channel_id)
    .slice(0, 8);

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

            {/* Stats row */}
            <div className="relative mt-8 grid grid-cols-3 gap-3 sm:gap-4">
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
              <Stat
                icon={<Headphones size={16} />}
                label="Salons actifs"
                value={voiceGroups.length}
                highlight={voiceGroups.length > 0}
              />
            </div>

            {/* Voice channels detail */}
            {isLoading ? (
              <div className="mt-8 h-24 shimmer rounded-lg" />
            ) : voiceGroups.length > 0 ? (
              <div className="mt-8 space-y-4">
                {voiceGroups.map((g) => (
                  <div
                    key={g.channelId}
                    className="rounded-lg border border-atfr-gold/15 bg-atfr-graphite/40 p-4"
                  >
                    <div className="mb-3 flex items-center gap-2 text-sm text-atfr-bone">
                      <Mic size={14} className="text-emerald-400" />
                      <span className="font-medium">{g.channelName}</span>
                      <span className="text-xs text-atfr-fog">
                        · {g.members.length}{' '}
                        {g.members.length > 1 ? 'connectés' : 'connecté'}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {g.members.map((m) => (
                        <MemberChip key={m.id} member={m} />
                      ))}
                    </div>
                  </div>
                ))}
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
              !widget && (
                <p className="relative mt-6 text-sm text-atfr-fog">
                  Le widget est désactivé ou n'a pas pu être chargé. Utilisez
                  le bouton ci-dessus pour rejoindre.
                </p>
              )
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
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        'rounded-lg border p-3 text-center transition-colors',
        highlight
          ? 'border-emerald-400/40 bg-emerald-400/5'
          : 'border-atfr-gold/15 bg-atfr-graphite/40',
      )}
    >
      <div
        className={cn(
          'inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em]',
          highlight ? 'text-emerald-300' : 'text-atfr-fog',
        )}
      >
        {icon}
        {label}
      </div>
      <p className="mt-1 font-display text-2xl text-atfr-bone">{value}</p>
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
