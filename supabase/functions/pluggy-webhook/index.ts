import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    console.log("Pluggy Webhook recebido:", payload);

    // Aqui você pode adicionar a lógica para processar o webhook,
    // por exemplo, buscar transações atualizadas na Pluggy e
    // salvar/atualizar no seu banco de dados Supabase.
    // Exemplo: if (payload.event === 'item.updated') { /* ... */ }

    return new Response("ok", { 
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error) {
    console.error("Erro ao processar Pluggy Webhook:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});