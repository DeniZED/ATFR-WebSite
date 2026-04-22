import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { env } from '@/lib/env';

const SESSION_KEY = 'atfr_intro_shown';

export function IntroLoader() {
  const reduce = useReducedMotion();
  const [visible, setVisible] = useState(() => {
    if (typeof window === 'undefined') return false;
    return sessionStorage.getItem(SESSION_KEY) !== '1';
  });

  useEffect(() => {
    if (!visible) return;
    if (reduce) {
      setVisible(false);
      sessionStorage.setItem(SESSION_KEY, '1');
      return;
    }
    const t = setTimeout(() => {
      sessionStorage.setItem(SESSION_KEY, '1');
      setVisible(false);
    }, 1600);
    return () => clearTimeout(t);
  }, [visible, reduce]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="intro"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-atfr-ink"
        >
          <div
            className="absolute inset-0 bg-grid bg-[size:42px_42px] opacity-15"
            aria-hidden
          />
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-atfr-gold/10 blur-[120px]"
            aria-hidden
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
            className="relative flex flex-col items-center gap-4"
          >
            <motion.img
              src={`https://eu.wargaming.net/clans/media/clans/emblems/cl_501/${env.clanId}/emblem_195x195.png`}
              alt=""
              width={100}
              height={100}
              className="drop-shadow-[0_0_40px_rgba(232,176,67,0.4)]"
              initial={{ rotate: -8 }}
              animate={{ rotate: 0 }}
              transition={{ duration: 1, ease: [0.2, 0.8, 0.2, 1] }}
            />
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 120, opacity: 1 }}
              transition={{ duration: 0.9, delay: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
              className="h-[2px] bg-gradient-to-r from-transparent via-atfr-gold to-transparent"
            />
            <motion.p
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="font-display text-2xl tracking-[0.4em] text-atfr-gold"
            >
              {env.clanTag}
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
