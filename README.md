# Repo pulse

Real-time dashboard for public GitHub activity: live counters, an activity chart, a stars chart, and a clickable event feed.

## Quick start

1. Create a free token: GitHub > Settings > Developer settings > Fine-grained tokens. Public repositories only, no extra permissions.
2. `cp .env.example .env` and paste the token after `GITHUB_TOKEN=`.
3. `npm start`, then open http://localhost:3000 (Node 18+, no dependencies).

The token stays on the server and is never sent to the browser. Without a token the server still works at 60 requests per hour.

## Simulated mode

If GitHub cannot be reached (offline, rate limited, server not running) the UI falls back to simulated data and retries live data every two minutes. Add `?sim=1` to the URL to force it.

## How it works

- `server.js` proxies the GitHub REST API, caches responses for 20 seconds, and serves `public/`.
- `public/api.js` fetches repo stats and events, with `sim.js` as the fallback.
- `public/app.js` draws the charts (Chart.js) and the feed. Only the top X repos by recent activity are charted; X is set in the repo popup.
- `public/modal.js` and `public/repos.js` hold the event popup and the repo list.
