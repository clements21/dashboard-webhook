import { createClient } from '@supabase/supabase-js';

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
    
    // 1. Extract Lead (email)
    const emailMatch = text.match(/Lead:\s*\n?\s*\[?([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)\]?/);
    const email = emailMatch?.[1];

    // 2. Extract Campaign
    let campagne = 'Unknown';
    const campaignMatch = text.match(/Campaign:\s*\n?\s*"([^"]+)"/);
    if (campaignMatch?.[1]) {
      campagne = campaignMatch[1].trim();
    }

    // 3. Extract Message
    let message = '';
    const messageMatch = text.match(/Message:\s*\n?\s*(.+?)(?:\n|$)/);
    if (messageMatch?.[1]) {
      message = messageMatch[1].trim();
    }

    // 4. Date & Time (depuis Slack event)
    const datetime = new Date(event.ts * 1000);
    const date = datetime.toISOString().split('T')[0];
    const time = datetime.toISOString().split('T')[1].split('.')[0];

    console.log(`✅ Lead: ${email} | Campaign: ${campagne} | Message: ${message} | ${date} ${time}`);

    if (email && campagne !== 'Unknown') {
      try {
        await supabase.from('leads').insert({
          email,
          campagne,
          message: message || null,
          datetime: datetime.toISOString(),
          slack_message_id: event.ts,
          slack_channel_id: event.channel,
        });

        console.log(`💾 Saved!`);
      } catch (err) {
        console.error('❌', err.message);
      }
    }
  }

  res.status(200).json({ ok: true });
}
