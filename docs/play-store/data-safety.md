# Play Data safety — draft answers

Use these answers in Play Console → App content → Data safety. They match the app: no account, no ads, no analytics, saves only in local storage. A sideloaded copy may make one anonymous request to GitHub's public releases API, and if the player taps Update it downloads that release APK. Neither request sends a save, account, or advertising id, and this developer does not receive or store them. Play installs skip the check and the download. The `REQUEST_INSTALL_PACKAGES` permission is only used for that sideload installer handoff.

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

## Once Google Play Games is switched on

The answers above are for builds without Play Games. When the Play Games
project id is added (see `docs/play-games.md`), Play Games Services handles an
optional sign-in and a cloud save, and the Play Games SDK sends Google its own
diagnostics. Google's page on this: Prepare for Google Play's data disclosure
requirements (developer.android.com/games/pgs/data-collection). Draft
answers to check against that page and the form:

- Collects data: **Yes**. Shared: **No** (Google processes it for the
  developer as the service provider).
- **Personal info > User IDs:** the Play Games player id and gamer name.
  Purpose: App functionality, Account management. Optional (sign-in is
  optional).
- **App activity > Other actions:** the saved game progress (the cloud
  save). Purpose: App functionality. Optional.
- **App info and performance > Diagnostics:** collected by the Play Games
  SDK. Purpose: Analytics. Required if the SDK is in the app.
- Encrypted in transit: **Yes** (HTTPS).
- Deletion: players can delete their Play Games data from their Play Games
  profile or Google Account; the local save is deleted by uninstalling.
- The app still has no ads, no other analytics and no account of its own.
