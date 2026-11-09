# Release notes template

Paste this into the GitHub release description. Keep the `versionCode:` line exact, and make it match `versionCode` in `android/app/build.gradle`. List only things that are in this build. Coming soon is for work that is not in the app yet.

```
versionCode: 9

## What's new
- NEXT buy: buys exactly enough to reach the next milestone or gate
- Eight boardroom dilemmas, each with a fixed reward
- Six new mega-projects, from ARPANET Node to Parallel Timeline
- More news headlines
- What's New and Coming Soon, read from these notes

## Coming soon
- Investor upgrade shop
- A second world: the Space Age
- Cloud save backup
```

Rules the app uses:
- Every line starting with `-`, `*`, `•` or `1.` is one point. Up to 15 per list.
- A heading (`## ...`) or a line ending in `:` starts a new section.
- Sections whose heading says Coming soon, Planned, On the way, Next up or Roadmap go in the COMING SOON list. Everything else goes in WHAT'S NEW.
- Bold, code marks and links are shown as plain text.
