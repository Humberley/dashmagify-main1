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
  console.log("PLUGGY_CLIENT_ID loaded:", PLUGGY_CLIENT_ID ? `******${PLUGGY_CLIENT_ID.slice(-4)}` : "NOT LOADED");
  console.log("PLUGGY_CLIENT_SECRET loaded:", PLUGGY_CLIENT_SECRET ? "****** (present)" : "NOT LOADED");
  console.log("PLUGGY_WEBHOOK_URL:", PLUGGY_WEBHOOK_URL);

  try {
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
    console.log("Requesting Pluggy API Key from https://api.pluggy.ai/auth...");
    const authResponse = await fetch('https://api.pluggy.ai/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientId: PLUGGY_CLIENT_ID,
        clientSecret: PLUGGY_CLIENT_SECRET,
      }),
    });

    console.log("Pluggy Auth API response status:", authResponse.status);
    const authResponseText = await authResponse.text(); // Get text first for logging
    console.log("Pluggy Auth API response text:", authResponseText.substring(0, 500));


    if (!authResponse.ok) {
      console.error("Pluggy Auth Error Details:", authResponseText);
      throw new Error(`Failed to get Pluggy API Key: ${authResponse.status} ${authResponse.statusText} - ${authResponseText}`);
    }
    
    const authJson = JSON.parse(authResponseText);
    const apiKey = authJson.apiKey;

    if (!apiKey || typeof apiKey !== 'string') {
        console.error("Pluggy API Key was not returned from auth endpoint or is not a string. Received:", apiKey);
        throw new Error("Pluggy API Key was not returned from auth endpoint or is not a string.");
    }
    const cleanedApiKey = apiKey.trim();
    console.log("Pluggy API Key obtained successfully. Length:", cleanedApiKey.length, "First 10 chars:", cleanedApiKey.substring(0, 10) + "...");

    // 2. Generate Connect Token
    console.log("Requesting Pluggy Connect Token from https://api.pluggy.ai/connect_token...");
    const authorizationHeaderValue = `Bearer ${cleanedApiKey}`;
    console.log("Authorization Header to be sent (first 20 chars of token): Bearer", cleanedApiKey.substring(0, 20) + "...");


    const connectTokenPayload = {
      clientUserId: userId,
      options: {
        webhookUrl: PLUGGY_WEBHOOK_URL, // Ensure this webhook is correctly set up and accessible
        avoidDuplicates: true,
        products: ["transactions", "accounts"], // Common products, adjust if needed
      },
    };
    console.log("Connect Token Payload to be sent:", JSON.stringify(connectTokenPayload));

    const connectTokenResponse = await fetch('https://api.pluggy.ai/connect_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authorizationHeaderValue,
      },
      body: JSON.stringify(connectTokenPayload),
    });

    console.log("Pluggy Connect Token API response status:", connectTokenResponse.status);
    const connectTokenResponseText = await connectTokenResponse.text(); // Get text first
    console.log("Pluggy Connect Token API response text:", connectTokenResponseText.substring(0, 500));


    if (!connectTokenResponse.ok) {
      console.error("Pluggy Connect Token Error Details:", connectTokenResponseText);
      throw new Error(`Failed to generate Pluggy Connect Token: ${connectTokenResponse.status} ${connectTokenResponse.statusText} - ${connectTokenResponseText}`);
    }
    
    const connectTokenJson = JSON.parse(connectTokenResponseText);
    const connectToken = connectTokenJson.connectToken;

    if (!connectToken) {
        console.error("Pluggy Connect Token was not returned. Received:", connectTokenJson);
        throw new Error("Pluggy Connect Token was not returned.");
    }
    console.log("Pluggy Connect Token generated successfully.");

    return new Response(JSON.stringify({ connectToken }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error) {
    console.error("Edge Function Catch Block Error:", error.message);
    // Log a more structured error if possible
    const errorDetails = error.stack ? error.stack : error.toString();
    console.error("Error stack/details:", errorDetails);
    return new Response(JSON.stringify({ error: error.message, details: errorDetails }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});