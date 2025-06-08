import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Pluggy API credentials from Supabase secrets
const PLUGGY_CLIENT_ID = Deno.env.get("PLUGGY_CLIENT_ID");
const PLUGGY_CLIENT_SECRET = Deno.env.get("PLUGGY_CLIENT_SECRET");

// Use the correct Supabase Function URL for the Pluggy webhook
const PLUGGY_WEBHOOK_URL = "https://kgmtbffyvygfjkwadkrc.supabase.co/functions/v1/pluggy-webhook"; 

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log("generate-pluggy-connect-token function invoked.");
  console.log("Attempting to use PLUGGY_CLIENT_ID:", PLUGGY_CLIENT_ID ? `${PLUGGY_CLIENT_ID.substring(0, 5)}...` : "Not Set");
  // DO NOT LOG PLUGGY_CLIENT_SECRET for security reasons.

  try {
    // Ensure Pluggy credentials are set
    if (!PLUGGY_CLIENT_ID || !PLUGGY_CLIENT_SECRET) {
      console.error("Pluggy CLIENT_ID or CLIENT_SECRET is not set in Supabase secrets.");
      throw new Error("Pluggy CLIENT_ID or CLIENT_SECRET not set in Supabase secrets.");
    }

    const { userId } = await req.json(); 
    console.log("Received userId:", userId);

    if (!userId) {
      console.error("userId is required in the request body.");
      return new Response(JSON.stringify({ error: "userId is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // 1. Get Pluggy API Key
    console.log("Requesting Pluggy API Key...");
    const authResponse = await fetch('https://api.pluggy.ai/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientId: PLUGGY_CLIENT_ID,
        clientSecret: PLUGGY_CLIENT_SECRET,
      }),
    });

    console.log("Pluggy Auth API response status:", authResponse.status);
    if (!authResponse.ok) {
      const errorText = await authResponse.text();
      console.error("Pluggy Auth Error Details:", errorText);
      // Try to parse the errorText if it's JSON
      let parsedError;
      try {
        parsedError = JSON.parse(errorText);
      } catch (e) {
        parsedError = errorText;
      }
      throw new Error(`Failed to get Pluggy API Key: ${authResponse.statusText} - ${JSON.stringify(parsedError)}`);
    }
    const { apiKey } = await authResponse.json();
    if (!apiKey) {
        console.error("Pluggy API Key was not returned from auth endpoint.");
        throw new Error("Pluggy API Key was not returned from auth endpoint.");
    }
    console.log("Pluggy API Key obtained successfully.");

    // 2. Generate Connect Token
    console.log("Requesting Pluggy Connect Token with apiKey:", apiKey ? `${apiKey.substring(0,10)}...` : "API Key is null/undefined");
    const connectTokenPayload = {
      clientUserId: userId,
      options: {
        webhookUrl: PLUGGY_WEBHOOK_URL,
        avoidDuplicates: true,
        products: ["transactions", "accounts"],
      },
    };
    console.log("Connect Token Payload:", JSON.stringify(connectTokenPayload));

    const connectTokenResponse = await fetch('https://api.pluggy.ai/connect_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`, // <-- CORRIGIDO AQUI!
      },
      body: JSON.stringify(connectTokenPayload),
    });

    console.log("Pluggy Connect Token API response status:", connectTokenResponse.status);
    if (!connectTokenResponse.ok) {
      const errorText = await connectTokenResponse.text();
      console.error("Pluggy Connect Token Error Details:", errorText);
      let parsedError;
      try {
        parsedError = JSON.parse(errorText);
      } catch (e) {
        parsedError = errorText;
      }
      throw new Error(`Failed to generate Pluggy Connect Token: ${connectTokenResponse.statusText} - ${JSON.stringify(parsedError)}`);
    }
    const { connectToken } = await connectTokenResponse.json();
    if (!connectToken) {
        console.error("Pluggy Connect Token was not returned.");
        throw new Error("Pluggy Connect Token was not returned.");
    }
    console.log("Pluggy Connect Token generated successfully.");

    return new Response(JSON.stringify({ connectToken }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error) {
    console.error("Edge Function Catch Block Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});