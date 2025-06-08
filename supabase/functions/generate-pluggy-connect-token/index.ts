import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client for database access (if needed, though not directly for this function)
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""; // Use service role key for admin operations if needed

// Pluggy API credentials from Supabase secrets
const PLUGGY_CLIENT_ID = Deno.env.get("PLUGGY_CLIENT_ID");
const PLUGGY_CLIENT_SECRET = Deno.env.get("PLUGGY_CLIENT_SECRET");

// IMPORTANT: Replace with your actual webhook URL
const PLUGGY_WEBHOOK_URL = "https://seuapp.com/webhook"; 

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Ensure Pluggy credentials are set
    if (!PLUGGY_CLIENT_ID || !PLUGGY_CLIENT_SECRET) {
      throw new Error("Pluggy CLIENT_ID or CLIENT_SECRET not set in Supabase secrets.");
    }

    const { userId } = await req.json(); // Expect userId in the request body

    if (!userId) {
      return new Response(JSON.stringify({ error: "userId is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // 1. Get Pluggy API Key
    const authResponse = await fetch('https://api.pluggy.ai/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientId: PLUGGY_CLIENT_ID,
        clientSecret: PLUGGY_CLIENT_SECRET,
      }),
    });

    if (!authResponse.ok) {
      const errorText = await authResponse.text();
      console.error("Pluggy Auth Error:", authResponse.status, errorText);
      throw new Error(`Failed to get Pluggy API Key: ${authResponse.statusText}`);
    }
    const { apiKey } = await authResponse.json();

    // 2. Generate Connect Token
    const connectTokenResponse = await fetch('https://api.pluggy.ai/connect_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        clientUserId: userId,
        options: {
          webhookUrl: PLUGGY_WEBHOOK_URL,
          avoidDuplicates: true,
          products: ["transactions", "accounts"],
        },
      }),
    });

    if (!connectTokenResponse.ok) {
      const errorText = await connectTokenResponse.text();
      console.error("Pluggy Connect Token Error:", connectTokenResponse.status, errorText);
      throw new Error(`Failed to generate Pluggy Connect Token: ${connectTokenResponse.statusText}`);
    }
    const { connectToken } = await connectTokenResponse.json();

    return new Response(JSON.stringify({ connectToken }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error) {
    console.error("Edge Function Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});