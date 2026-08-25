# Secrets Directory
Place your Firebase Admin SDK service-account JSON file here.

Any file matching `*firebase-adminsdk*.json` inside this folder will be
auto-discovered at startup. The default name is:

`secrets/firebase-adminsdk.json`

…but files Firebase generates (e.g.
`<project-id>-firebase-adminsdk-<hash>.json`) are also picked up
automatically.

This directory is gitignored to keep your credentials secure.
