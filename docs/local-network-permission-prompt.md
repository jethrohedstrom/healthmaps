# "Apps on device" permission prompt investigation (July 2026)

## The report

Android Chrome showed this dialog over healthmaps.com.au on page load, with no
interaction (screenshots IMG_3508/IMG_3509, taken 24 June 2026 on a 5G connection):

> healthmaps.com.au wants to access other apps and services on this device — Block / Allow

This is Chrome's **Local Network Access (LNA)** permission — shipped in Chrome 142,
renamed **"Apps on device"** around Chrome 144. Chrome shows it when a public website
tries to make a network request to a loopback address (`localhost`, `127.0.0.1`), a
private IP (`192.168.x.x`, `10.x.x.x`, etc.), or a `.local` domain.

## What we ruled out (the site is clean)

- **Source:** no `fetch`/XHR/WebSocket/`sendBeacon`/`navigator.*` calls anywhere in
  `src/`; no service worker, no web manifest, no analytics or third-party scripts.
- **Deployed output:** live HTML for `/` and `/practitioners/` plus every inline script
  and the bubble-map JS bundle contain zero network calls and zero localhost /
  private-IP / dev-server strings. Live HTML is byte-equivalent to the local
  `dist/` build (only asset hashes differ from a newer local build) — so nothing is
  injected by Netlify between build and edge, and the response is identical under an
  Android-Chrome mobile user agent.
- **Runtime:** loading the live practitioners page in Chrome with network capture
  shows exactly six requests, all same-origin (document, 2 fonts, 2 CSS, 1 JS).

## Best-supported explanation

Chrome classifies a request as "local" by the **resolved IP address**, and there is a
documented class of false positives: DNS setups that resolve hostnames into
carrier-grade NAT space (`100.64.0.0/10` — common on mobile 5G networks and ZTNA/VPN
tunnels) or ad-block DNS returning `0.0.0.0`/`127.0.0.1` make Chrome treat a
perfectly normal request as a local-network request and prompt. The report fits this
profile: on a 5G carrier connection, on page load, and not reproducible elsewhere.
The trigger was the user's network/device environment, not the site.

## Mitigation shipped

`netlify.toml` now sends on every response:

```
Permissions-Policy: local-network-access=(), local-network=(), loopback-network=()
```

An empty allowlist means local-network requests are **denied without prompting** —
the dialog can never appear for this origin, even on misclassifying networks.
The site only ever makes same-origin requests to its public host, so denying this
permission changes nothing in normal operation. (`local-network-access` is the
legacy alias used by earlier Chrome versions; `local-network` and `loopback-network`
are the current spec tokens. Unknown tokens are ignored, so sending all three is safe.)

## References

- https://developer.chrome.com/blog/local-network-access
- https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Permissions-Policy/local-network
- https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Permissions-Policy/local-network-access
- CGNAT false-positive write-up: https://steeleobrienconsulting.com/blog/chrome-local-network-access/
