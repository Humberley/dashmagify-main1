
import { supabase } from "@/integrations/supabase/client";

/**
 * Function to manually test the due date webhook
 * @param userEmail The email of the user to send the test webhook for
 */
export async function testDueDateWebhook(userEmail?: string) {
  try {
    // If no email provided, try to get the current user's email
    if (!userEmail) {
      const { data: { user } } = await supabase.auth.getUser();
      userEmail = user?.email;
    }
    
    if (!userEmail) {
      throw new Error("No user email provided or found for testing");
    }
    
    const { data, error } = await supabase.functions.invoke('check-due-dates', {
      body: { 
        test: true,
        email: userEmail 
      }
    });
    
    if (error) {
      console.error("Error sending test webhook:", error);
      throw error;
    }
    
    console.log("Test webhook sent successfully:", data);
    return { success: true, data };
  } catch (error) {
    console.error("Exception when testing webhook:", error);
    return { success: false, error };
  }
}
