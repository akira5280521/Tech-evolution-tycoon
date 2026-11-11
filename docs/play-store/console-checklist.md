# What to do in Play Console

The repo can produce the signed Android App Bundle. These steps only exist in the Play Console account.

1. **Developer account.** Register a Google Play Console account (one-time fee). New personal accounts have to run a closed test with at least **12 testers opted in for 14 consecutive days** before Google will let the app apply for production.
2. **Create the app** with package name `tech.evolution.tycoon`. Play Console already has the app under this id, and the id cannot be changed. It does not update phones that installed `com.techevolutiontycoon.game` or the earlier `com.akira5280521.techevolutiontycoon`.
3. **Play App Signing.** On the first upload, enroll in Play App Signing. Upload the **play** bundle `app-play-release.aab` (from `bundlePlayRelease`; never the sideload build) signed with your private release key (see `docs/signing.md`). That key is the **upload key**; Google holds the app signing key. The key that used to be in this repo is public, so use a new one: if the old key was ever uploaded to Play, ask Play Console support to reset the upload key.
4. **Privacy policy URL.** Host `docs/privacy-policy.md` at a public HTTPS address (the GitHub page for this file is enough if the repository is public) and paste that URL into the store listing and the Data safety form.
5. **Store listing.** Paste the short and full descriptions from `listing.md`. Upload `icon-512.png` and `feature-graphic.png`. Add at least two portrait phone screenshots taken on a device.
6. **Data safety.** Enter the answers in `data-safety.md`.
7. **Content rating.** Complete the IARC questionnaire using `content-rating.md`, then submit so Console issues the certificate.
8. **Declarations.** Ads: no. News: no. Government: no. Financial features: no. Health: no. Target audience: general, not the Families program, unless you separately meet the Designed for Families rules.
9. **App access.** Declare that every feature works without a sign-in (Play Games sign-in is optional).
10. **Play Games Services** (sign-in and cloud save): follow `docs/play-games.md`, then update the Data safety answers as it describes.
11. **Release.** Put the AAB in the closed-testing track, add the testers, wait out the new-account requirement, then promote the same bundle to production. Pricing: free. Choose the countries you want.

## Declarations

- **Request install packages permission.** The play build doesn't have it.
  If Play Console asks for this declaration, the uploaded bundle is an
  older or sideload build: upload a new `app-play-release.aab` (higher
  versionCode) instead of filling in the form. The game isn't a file
  manager, browser or messaging app, so none of the form's options are true
  for it.
