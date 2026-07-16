export default function handler(req, res) {
  console.log('🔔 WEBHOOK APPELÉ');
  console.log('Body:', JSON.stringify(req.body));
  
  if (req.body?.type === 'url_verification') {
    console.log('✓ CHALLENGE ENVOYÉ');
    return res.json({ challenge: req.body.challenge });
  }

  res.json({ ok: true });
}
