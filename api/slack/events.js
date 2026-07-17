import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    body = JSON.parse(body);
  }

  const { type, challenge, event } = body;

  console.log('📨 Event reçu:', type);

  // Slack URL verification
  if (type === 'url_verification') {
    console.log('✓ Challenge reçu');
    return res.json({ challenge });
  }

  // Process message
  if (event?.type === 'message' && !event.bot_id) {
    const text = event.text || '';
    console.log('📝 Message text:', text);

    // Extract email (n'importe quel format)
    const emailMatch = text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/);
    const email = emailMatch?.[1];

    // Extract campaign entre "Campaign:" et la ligne suivante
    const campaignMatch = text.match(/Campaign:\s*"?([^"\n]+)"?/);
    const campagne = campaignMatch?.[1]?.trim() || 'Unknown';

    console.log(`🔍 Parsed: email=${email}, campaign=${campagne}`);

    if (email) {
      try {
        const { data, error } = await supabase
          .from('leads')
          .insert({
            email,
            campagne,
            datetime: new Date(event.ts * 1000).toISOString(),
            slack_message_id: event.ts,
            slack_channel_id: event.channel,
          });

        if (error) {
          console.error('❌ DB Error:', error.message);
          throw error;
        }

        console.log(`✅ Saved: ${email} | ${campagne}`);
      } catch (err) {
        console.error('Error saving to Supabase:', err.message);
      }
    } else {
      console.log('⚠️ No email found in message');
    }
  }

  res.status(200).json({ ok: true });
}
