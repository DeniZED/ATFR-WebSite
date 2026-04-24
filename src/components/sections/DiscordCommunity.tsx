import { motion } from 'framer-motion';
import { ExternalLink, MessageSquare, Users } from 'lucide-react';
import { Button, Card, CardBody, Section } from '@/components/ui';
import { cn } from '@/lib/cn';
import { useContent } from '@/hooks/useContent';
import { useDiscordWidget } from '@/features/discord/queries';

const STATUS_DOT = {
  online: 'bg-emerald-400',
  idle: 'bg-amber-400',
  dnd: 'bg-red-400',
} as const;

export function DiscordCommunity() {
  const { get } = useContent();
  const serverId = get('discord_server_id');
  const invite = get('discord_invite_url');
  const { data: widget, isLoading } = useDiscordWidget(serverId || null);

  if (!serverId && !invite) return null;

  const inviteUrl = widget?.instant_invite || invite;
  const name = widget?.name ?? 'Rejoindre le Discord';
  const members = widget?.members.slice(0, 8) ?? [];
  const count = widget?.presence_count ?? null;

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
                  {count != null && (
                    <p className="text-sm text-atfr-fog mt-1 flex items-center gap-2">
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-70" />
                        <span className="relative rounded-full h-2 w-2 bg-emerald-400" />
                      </span>
                      <span>
                        <strong className="text-atfr-bone">{count}</strong> en
                        ligne
                      </span>
                    </p>
                  )}
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

            {isLoading ? (
              <div className="mt-8 h-24 shimmer rounded-lg" />
            ) : members.length > 0 ? (
              <div className="mt-8 border-t border-atfr-gold/10 pt-6">
                <p className="text-xs uppercase tracking-[0.25em] text-atfr-fog mb-4 flex items-center gap-2">
                  <Users size={12} />
                  Connectés
                </p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                  {members.map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center gap-2 rounded-md bg-atfr-graphite/60 border border-atfr-gold/10 px-3 py-2 text-sm"
                    >
                      <div className="relative shrink-0">
                        <div className="h-8 w-8 rounded-full bg-atfr-ink border border-atfr-gold/20 overflow-hidden flex items-center justify-center text-atfr-gold text-xs font-display">
                          {m.avatar_url ? (
                            <img
                              src={m.avatar_url}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            m.username.slice(0, 2).toUpperCase()
                          )}
                        </div>
                        <span
                          className={cn(
                            'absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-atfr-carbon',
                            STATUS_DOT[m.status] ?? STATUS_DOT.online,
                          )}
                        />
                      </div>
                      <span className="truncate text-atfr-bone">
                        {m.username}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              !widget && (
                <p className="mt-6 text-sm text-atfr-fog">
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
