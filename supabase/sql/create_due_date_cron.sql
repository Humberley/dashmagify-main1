
-- Enable the required extensions if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create a function to invoke the edge function
CREATE OR REPLACE FUNCTION public.invoke_check_due_dates()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  project_ref TEXT := 'kgmtbffyvygfjkwadkrc';
  anon_key TEXT := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtnbXRiZmZ5dnlnZmprd2Fka3JjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU4ODAzMDYsImV4cCI6MjA2MTQ1NjMwNn0.v3ek8Dkl60OuvzyJEI5zCXsBBNNGfWdmL2e55Lgdgow';
BEGIN
  PERFORM net.http_post(
    url:='https://kgmtbffyvygfjkwadkrc.supabase.co/functions/v1/check-due-dates',
    headers:=jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', concat('Bearer ', anon_key)
    ),
    body:=jsonb_build_object('run_at', now()::text)
  );
END;
$$;

-- Schedule the function to run daily at 8:00 AM
SELECT cron.schedule(
  'check-due-dates-daily',
  '0 8 * * *',
  'SELECT public.invoke_check_due_dates();'
);
