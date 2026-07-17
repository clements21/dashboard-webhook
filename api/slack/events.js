export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch (e) {
    console.error('Parse error:', e);
    return res.status(400).json({ error: 'Parse error' });
  }

  const { type, challenge, event } = body;

  // Slack verification
  if (type === 'url_verification') {
    console.log('✓ Challenge received');
    return res.json({ challenge });
  }

  // Process message
  if (event?.type === 'message' && !event.bot_id) {
    console.log('📨 Message reçu');

    // Extract email
    const text = event.text || '';
    const emailMatch = text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/);
    const email = emailMatch?.[1];

    // Extract campaign from text
    const campaignMatch = text.match(/\*Campaign:\*\s*"([^"]+)"/);
    const campagne = campaignMatch?.[1] || 'Unknown';

    if (email) {
      try {
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_KEY;

        const response = await fetch(`${supabaseUrl}/rest/v1/leads`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
          },
          body: JSON.stringify({
            email,
            campagne,
            datetime: new Date(event.ts * 1000).toISOString(),
            slack_message_id: event.ts,
            slack_channel_id: event.channel,
          }),
        });

        if (response.ok) {
          console.log(`✓ Sauvegardé: ${email} | ${campagne}`);
        } else {
          console.error('Erreur:', await response.text());
        }
      } catch (err) {
        console.error('Erreur Supabase:', err);
      }
    }
  }

  res.status(200).json({ ok: true });
}
