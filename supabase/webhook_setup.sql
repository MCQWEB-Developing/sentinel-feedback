-- SQL Script to setup Supabase Webhook for IA Analysis
-- Note: You should replace 'YOUR_BACKEND_URL' with the actual URL where your backend is running.

-- 1. Ensure the webhook extension is enabled (usually is in Supabase)
-- CREATE EXTENSION IF NOT EXISTS "http" WITH SCHEMA "extensions";

-- 2. Create the Trigger function to call the Webhook
-- In Supabase, it's easier to use the Dashboard (Database -> Webhooks)
-- but here is the manual SQL approach for documentation:

/*
CREATE TRIGGER on_answer_inserted
AFTER INSERT ON public.answers
FOR EACH ROW
WHEN (
  EXISTS (
    SELECT 1 FROM questions 
    WHERE id = NEW.question_id AND question_type = 'text'
  )
)
EXECUTE FUNCTION supabase_functions.http_request(
  'http://YOUR_BACKEND_URL/api/analyze-sentiment',
  'POST',
  '{"Content-Type": "application/json"}',
  '{}' -- The record is automatically included in the body by Supabase Webhooks
);
*/

-- RECOMMENDED STEP:
-- Go to Supabase Dashboard -> Database -> Webhooks -> Create New Webhook:
-- Name: analyze_sentiment_webhook
-- Table: answers
-- Events: Insert
-- Type: HTTP Request
-- Method: POST
-- URL: http://your-backend-api.com/api/analyze-sentiment
-- HTTP Headers: Content-Type: application/json
