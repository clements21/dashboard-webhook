import { createClient } from '@supabase/supabase-js';

console.log('🔧 SUPABASE OK:', process.env.SUPABASE_URL ? '✓' : '❌');

export default async function handler(req, res) {
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
  );

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    body = JSON.parse(body);
  }

  const { type, challenge, event } = body;

  if (type === 'url_verification') {
    return res.json({ challenge });
  }

  if (event?.type === 'message' && !event.bot_id) {
    const text = event.text || '';
    
    // Extract email
    const emailMatch = text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/);
    const email = emailMatch?.[1];

    // Extract campaign - cherche tout ce qui est entre "Campaign:" et la fin ou la prochaine balise
    let campagne = 'Unknown';
    const campaignMatch = text.match(/Campaign:\s*\n?\s*"?([^"\n]+)"?/);
    if (campaignMatch?.[1]) {
      campagne = campaignMatch[1].trim();
    }

    console.log(`📧 ${email} | ${campagne}`);

    if (email && campagne !== 'Unknown') {
      try {
        await supabase.from('leads').insert({
          email,
          campagne,
          datetime: new Date(event.ts * 1000).toISOString(),
          slack_message_id: event.ts,
          slack_channel_id: event.channel,
        });

        console.log(`✅ SAVED: ${email} | ${campagne}`);
      } catch (err) {
        console.error('❌ Error:', err.message);
      }
    }
  }

  res.status(200).json({ ok: true });
}
