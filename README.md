# Dashboard Webhook

Webhook Slack pour capturer les leads depuis une channel dédiée.

## Format du message Slack

```
email@example.com | Nom Campagne
```

Exemple :
```
john@example.com | Google Ads
marie@example.com | LinkedIn
```

## Déploiement

Deployé sur Vercel : https://dashboard-webhook.vercel.app

## Configuration Slack

Request URL : https://dashboard-webhook.vercel.app/api/slack/events

## Logs

Voir les logs sur le dashboard Vercel → Deployments → Logs
