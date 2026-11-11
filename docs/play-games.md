# Google Play Games: sign-in and cloud save

The game uses Play Games Services v2 for an optional sign-in and one cloud
save slot. The code is in the repo; it stays switched off until the steps
below give it a project id. Builds without the id (web, sideload tests) show
"comes with the Google Play version" in More > Settings > Account.

## How it works in the game

- **Sign-in.** On Android, Play Games signs returning players in
  automatically at launch. Anyone who isn't signed in sees SIGN IN WITH PLAY
  GAMES in More > Settings > Account. Every feature works without signing in.
- **Cloud save.** The cloud copy is the same backup code the Save Backup panel
  makes, checked the same way when it's loaded.
- **No silent overwrites.** Each session first compares the cloud copy with
  the phone. If the cloud copy has more career earnings, the player chooses
  LOAD CLOUD SAVE or KEEP THIS PHONE'S. Nothing is uploaded until that check
  is done, so a fresh install can't wipe a better cloud save.
- **Auto cloud save** (on by default, can be turned off): uploads when the
  app goes to the background and every 5 minutes, at most once a minute.
- **Manual:** SAVE TO CLOUD NOW and LOAD FROM CLOUD (which shows the cloud
  save's numbers and asks before replacing anything).

Code: `android/.../PlayGamesPlugin.java` (native), `src/lib/cloudSave.js`,
`src/components/game/CloudSync.jsx` and `AccountPanel.jsx`.

## Play Console setup (one time)

You do these in Play Console and Google Cloud; nothing here needs the
signing key's password, only its public SHA-1 fingerprint.

1. **Create the Play Games Services project.** Play Console > your app >
   Grow users > Play Games Services > Setup and management > Configuration.
   (The app must be marked as a game in Play Console.) Choose that the game doesn't use Google APIs yet, and create a new
   project. Fill in the display name (Tech Evolution Tycoon) and category.
2. **OAuth consent screen.** The Credentials section shows a Configure
   prompt that sends you to Google Cloud: External, app name, your support
   email, and the scopes `games`, `games_lite` and `drive.appdata` (the last
   one is what cloud saves use). Google recommends publishing the consent
   screen right away; it must be published before the game is.
3. **Credentials.** Back in Configuration > Credentials, add an **Android**
   credential for package `tech.evolution.tycoon`. Create one OAuth client
   per signing certificate, using its **SHA-1**:
   - **Play app signing key:** Play Console > Test and release > App
     integrity > App signing > "App signing key certificate" SHA-1. This is
     the one Play installs use.
   - **Your upload key** (for APKs you sign and install yourself): run
     `keytool -list -v -keystore <your keystore> -alias <your alias>` on your
     computer and copy the SHA-1. keytool asks for the keystore password
     locally; never paste the password anywhere else.
   Without the matching SHA-1, sign-in fails with a developer error.
4. **Turn on Saved games.** Configuration > Properties > Saved games: On.
5. **Testers.** Play Games Services > Testers: add the Google accounts that
   will test. Until Play Games Services is published, only testers can sign
   in, and new testers can take a couple of hours to work.
6. **Project id.** Copy the numeric **Project ID** shown under the game's
   name at the top of the Configuration page (12 or more digits; it's also
   the first part of the OAuth client ID) into `android/app/src/main/res/values/strings.xml`:
   `<string name="game_services_project_id" translatable="false">123456789012</string>`.
   It's not a secret; it ships inside every copy of the app.
7. **Publish.** Publish the Play Games Services settings (Publish Game)
   **before** the app goes to production, or players who aren't testers get
   sign-in errors.
8. **Data safety and privacy.** Update the Data safety form with the Play
   Games answers in `docs/play-store/data-safety.md`. The privacy policy
   already describes the cloud save.

## Testing checklist

- A build without the project id: Account says "comes with the Google Play
  version", nothing else changes.
- A tester account on a build signed with a registered key: sign-in works,
  the name shows, SAVE TO CLOUD NOW succeeds.
- Install on a second phone (or clear storage), sign in: the CLOUD SAVE FOUND
  choice appears; both buttons do what they say.
- Turn Auto cloud save off: no uploads happen until it's turned back on.
- Airplane mode: Play Games keeps the save and syncs later; the game keeps
  running.
