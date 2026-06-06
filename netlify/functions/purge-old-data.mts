import type { Config } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Keep rejected / withdrawn applications 6 months for potential re-application.
const APPLICATIONS_RETENTION_DAYS = 180;
// Activity logs are operational — 90 days is sufficient.
const ACTIVITY_LOG_RETENTION_DAYS = 90;

function cutoff(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

export default async function handler() {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.error('[purge-old-data] Supabase service role not configured');
    return;
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { error: appError, count: appCount } = await supabase
    .from('applications')
    .delete({ count: 'exact' })
    .in('status', ['rejected', 'withdrawn'])
    .lt('created_at', cutoff(APPLICATIONS_RETENTION_DAYS));

  if (appError) {
    console.error('[purge-old-data] applications purge failed:', appError.message);
  } else {
    console.log(`[purge-old-data] applications purged: ${appCount ?? 0}`);
  }

  const { error: logError, count: logCount } = await supabase
    .from('activity_logs')
    .delete({ count: 'exact' })
    .lt('created_at', cutoff(ACTIVITY_LOG_RETENTION_DAYS));

  if (logError) {
    console.error('[purge-old-data] activity_logs purge failed:', logError.message);
  } else {
    console.log(`[purge-old-data] activity_logs purged: ${logCount ?? 0}`);
  }
}

// Every Sunday at 03:00 UTC.
export const config: Config = {
  schedule: '0 3 * * 0',
};
