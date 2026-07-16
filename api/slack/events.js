export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Parser le body
  let body;
  if (typeof req.body === 'string') {
    body = JSON.parse(req.body);
  } else if (req.body instanceof Buffer) {
    body = JSON.parse(req.body.toString());
  } else {
    body = req.body;
  }

  const { type, challenge, event } = body;

  console.log('📨 Événement reçu:', type, 'Challenge:', challenge);

  // Vérification Slack (CRITIQUE)
  if (type === 'url_verification') {
    console.log('✓ Slack verification - envoi challenge:', challenge);
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json({ challenge: challenge });
  }

  // Traiter les messages
  if (event?.type === 'message' && !event.bot_id) {
    console.log('📬 Message:', event.text);

    // Extraire email
    const emailMatch = event.text?.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/);
    const email = emailMatch?.[1];

    // Extraire campagne (après |)
    const campaignMatch = event.text?.match(/\|\s*(.+)/);
    const campagne = campaignMatch?.[1]?.trim() || 'Unknown';

    if (email) {
      console.log(`✓ Lead importé: ${email} | ${campagne}`);
    }
  }

  res.status(200).json({ ok: true });
}
