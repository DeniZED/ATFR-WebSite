-- Audit log for HR-sensitive tables.
-- Tracks every INSERT / UPDATE / DELETE on players and player_staff_notes
-- so that accidental deletions or unauthorised changes can be traced.

CREATE TABLE IF NOT EXISTS rh_audit_log (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name   text        NOT NULL,
  operation    text        NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
  row_id       uuid,
  old_data     jsonb,
  new_data     jsonb,
  changed_by   uuid        REFERENCES auth.users (id) ON DELETE SET NULL,
  changed_at   timestamptz NOT NULL DEFAULT now()
);

-- Only admins may read the audit log; nobody can insert/update/delete directly.
ALTER TABLE rh_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins can read rh_audit_log"
  ON rh_audit_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Trigger function — runs as SECURITY DEFINER so it can always write the log
-- regardless of the caller's RLS context.
CREATE OR REPLACE FUNCTION log_rh_change()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = public
AS $$
BEGIN
  INSERT INTO rh_audit_log (table_name, operation, row_id, old_data, new_data, changed_by)
  VALUES (
    TG_TABLE_NAME,
    TG_OP,
    COALESCE((NEW).id, (OLD).id),
    CASE WHEN TG_OP = 'INSERT' THEN NULL ELSE to_jsonb(OLD) END,
    CASE WHEN TG_OP = 'DELETE' THEN NULL ELSE to_jsonb(NEW) END,
    auth.uid()
  );
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Attach trigger to the two most sensitive HR tables.
DROP TRIGGER IF EXISTS rh_audit_players ON players;
CREATE TRIGGER rh_audit_players
  AFTER INSERT OR UPDATE OR DELETE ON players
  FOR EACH ROW EXECUTE FUNCTION log_rh_change();

DROP TRIGGER IF EXISTS rh_audit_staff_notes ON player_staff_notes;
CREATE TRIGGER rh_audit_staff_notes
  AFTER INSERT OR UPDATE OR DELETE ON player_staff_notes
  FOR EACH ROW EXECUTE FUNCTION log_rh_change();
