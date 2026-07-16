export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  const { type, challenge, event } = body;

  console.log('📨 Événement reçu:', type);

  // Vérification Slack
  if (type === 'url_verification') {
    console.log('✓ Slack verification réussi');
    return res.json({ challenge });
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
      // À ce stade, tu peux ajouter la sauvegarde en DB
    }
  }

  res.status(200).json({ ok: true });
}
