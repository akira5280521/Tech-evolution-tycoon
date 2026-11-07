# Play Data safety — draft answers

Use these answers in Play Console → App content → Data safety. They match the app: no account, no ads, no analytics, saves only in local storage. A sideloaded copy may make one anonymous request to GitHub's public releases API. That request sends no save, account, or advertising id, and this developer does not receive or store it. Play installs skip the check.

## Overview

- Does your app collect or share any of the required user data types? **No**
- Is all of the user data collected by your app encrypted in transit? **Not applicable** — no user data is transmitted
- Do you provide a way for users to request that their data be deleted? **Not applicable** — the only save is on the device. Uninstalling the app or clearing its storage deletes it. There is no server copy to delete.

## Data types

Answer **not collected** and **not shared** for every category, including:

- Location
- Personal info (name, email, user id, address, phone)
- Financial info
- Health and fitness
- Messages
- Photos and videos
- Audio files
- Files and docs
- Calendar
- Contacts
- App activity
- Web browsing
- App info and performance (crash logs, diagnostics)
- Device or other IDs (including advertising ID)

## Security practices

- Data is not sold
- Data is not shared with third parties
- No data is collected for advertising or analytics
- No account is required
- The only off-device request is an anonymous GET of the public GitHub releases document. Do not mark a data type as collected for it.

If Console still asks about encryption or deletion because a toggle was set to Yes by mistake, go back and set collection to No.
