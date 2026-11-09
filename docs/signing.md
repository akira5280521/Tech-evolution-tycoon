# Release signing

The release key that used to be committed here (`android/keystore/release.keystore`
and the passwords in `android/keystore.properties`) was public. Treat it as
compromised: anyone could sign an APK that Android accepts as an update to a
sideloaded install. This file covers moving to a private key.

## 0. Back up the old key first

Applying the change that removed the key from the repo also deletes those two
files from your checkout. Copy them somewhere outside the repo before pulling,
or recover them from history later:

```bash
git show 8db13e8:android/keystore/release.keystore > ~/old-release.keystore
git show 8db13e8:android/keystore.properties > ~/old-keystore.properties
```

You only need the old key until the first release signed with the new one.

## 1. Make a new key (on your own computer)

```bash
keytool -genkeypair -v -keystore ~/keys/tet-release.jks -alias tet \
  -keyalg RSA -keysize 4096 -validity 10000
```

Use a long random password and keep the file and password in a password
manager. Never put either in the repo, a chat, or a shared drive.

## 2. Point the build at it

Either create `android/keystore.properties` (git-ignored):

```properties
storeFile=/home/you/keys/tet-release.jks
storePassword=...
keyAlias=tet
keyPassword=...
```

or, on a build server or cloud agent, set environment variables:
`TET_KEYSTORE_FILE`, `TET_KEYSTORE_PASSWORD`, `TET_KEY_ALIAS`, `TET_KEY_PASSWORD`.

A release build stops with an error if neither is set. Debug builds don't need it.

## 3. Remove the old key from git history

Removing the files only stops new commits from carrying them. To clear the
history (run on a fresh clone, then force-push every branch and tag):

```bash
git filter-repo --invert-paths --path android/keystore.properties --path android/keystore/
git push --force --all && git push --force --tags
```

Forks, old clones and caches may still hold the old key, so this does not make
it safe again. Rotating to the new key (steps 1-2) is the real fix.

## 4. What players see

- **Sideloaded installs:** Android won't update an app with an APK signed by a
  different key. Players must uninstall and reinstall once, which clears local
  progress. Ship save export/import first so they can carry their save across.
  The in-app updater will (correctly) refuse the new-key APK with a "didn't pass
  the safety check" message, so say "reinstall from GitHub" in the release notes.
- **Google Play installs:** Play re-signs with Google's app signing key, so
  players are not affected. If the old key was ever used as the Play upload key,
  ask Play Console support to reset the upload key and register the new one.
