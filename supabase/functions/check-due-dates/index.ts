
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Configure Supabase client with environment variables
const supabaseUrl = "https://kgmtbffyvygfjkwadkrc.supabase.co";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const webhookUrl = "https://nwh.fluxerautoma.shop/webhook/aviso-venceu";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body
    const requestData = await req.json();
    
    // Check if this is a test request
    if (requestData && requestData.test === true) {
      console.log("Received test webhook request for email:", requestData.email);
      
      // For test requests, send a webhook with sample data
      if (requestData.email) {
        const testPayload = {
          email: requestData.email,
          item: {
            name: "[TESTE] Item de Pagamento",
            description: "Este é um teste de webhook de vencimento",
            type: "pagamento",
            value: 100.00,
            due_date: new Date().toISOString().split('T')[0]
          }
        };
        
        // Send test webhook
        const response = await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(testPayload),
        });
        
        if (!response.ok) {
          throw new Error(`Webhook test failed with status: ${response.status}`);
        }
        
        console.log("Test webhook sent successfully for", requestData.email);
        
        return new Response(JSON.stringify({
          status: "success",
          message: `Test webhook sent successfully for ${requestData.email}`,
        }), {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }
      
      throw new Error("No email provided for test webhook");
    }
    
    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log("Starting check for due dates...");

    // Get today's date in ISO format (YYYY-MM-DD)
    const today = new Date();
    const todayDay = today.getDate();
    const todayMonth = today.getMonth() + 1;
    
    console.log(`Checking for entries due on day ${todayDay} of month ${todayMonth}`);

    // Fetch all fixed expenses and income with payment dates
    const { data: fixedEntries, error: fixedError } = await supabase
      .from("entradas_financeiras")
      .select("*")
      .in("tipo", ["receita", "despesa_fixa"])
      .not("data_pagamento", "is", null);

    if (fixedError) {
      console.error("Error fetching fixed entries:", fixedError);
      throw fixedError;
    }

    console.log(`Found ${fixedEntries.length} fixed entries to check`);

    // Get all users to fetch email addresses
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
    if (usersError) {
      console.error("Error fetching users:", usersError);
      throw usersError;
    }

    // Create a map of user IDs to emails
    const userEmails = new Map();
    users.users.forEach(user => {
      userEmails.set(user.id, user.email);
    });

    // Filter entries that are due today (matching day of month)
    const dueTodayEntries = fixedEntries.filter(entry => {
      const dueDate = new Date(entry.data_pagamento);
      return dueDate.getDate() === todayDay;
    });

    console.log(`Found ${dueTodayEntries.length} entries due today`);

    // Send webhooks for each due entry
    const webhookPromises = dueTodayEntries.map(async (entry) => {
      const userEmail = userEmails.get(entry.user_id);
      
      if (!userEmail) {
        console.error(`Could not find email for user ID: ${entry.user_id}`);
        return null;
      }

      const webhookPayload = {
        email: userEmail,
        item: {
          name: entry.nome,
          description: entry.descricao || "",
          type: entry.tipo === "receita" ? "recebimento" : "pagamento",
          value: entry.valor,
          due_date: entry.data_pagamento
        }
      };

      console.log(`Sending webhook for ${entry.tipo} '${entry.nome}' for user ${userEmail}`);

      // Send webhook
      return fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(webhookPayload),
      });
    });

    // Wait for all webhook requests to complete
    const results = await Promise.allSettled(webhookPromises);
    
    const successful = results.filter(r => r.status === "fulfilled").length;
    const failed = results.filter(r => r.status === "rejected").length;
    
    console.log(`Webhook sending complete: ${successful} successful, ${failed} failed`);

    return new Response(JSON.stringify({
      status: "success",
      message: `Processed ${dueTodayEntries.length} due entries. Sent ${successful} notifications.`,
      processed: dueTodayEntries.length,
      successful,
      failed
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error) {
    console.error("Error processing due dates:", error);
    
    return new Response(JSON.stringify({
      status: "error",
      message: error.message,
    }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
