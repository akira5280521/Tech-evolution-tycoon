# What to do in Play Console

The repo can produce the signed Android App Bundle. These steps only exist in the Play Console account.

1. **Developer account.** Register a Google Play Console account (one-time fee). New personal accounts have to run a closed test with at least **12 testers opted in for 14 consecutive days** before Google will let the app apply for production.
2. **Create the app** with package name `com.techevolutiontycoon.game`. This is a different id from `com.akira5280521.techevolutiontycoon`, so it does not update phones that installed that earlier package.
3. **Play App Signing.** On the first upload, enroll in Play App Signing. Upload `app-release.aab` signed with the keystore already in this repo (`android/keystore/release.keystore`, alias `techevolutiontycoon`, passwords in `android/keystore.properties`). That file is the **upload key**. Google holds the app signing key. Do not generate a replacement upload key.
4. **Privacy policy URL.** Host `docs/privacy-policy.md` at a public HTTPS address (the GitHub page for this file is enough if the repository is public) and paste that URL into the store listing and the Data safety form.
5. **Store listing.** Paste the short and full descriptions from `listing.md`. Upload `icon-512.png` and `feature-graphic.png`. Add at least two portrait phone screenshots taken on a device.
6. **Data safety.** Enter the answers in `data-safety.md`.
7. **Content rating.** Complete the IARC questionnaire using `content-rating.md`, then submit so Console issues the certificate.
8. **Declarations.** Ads: no. News: no. Government: no. Financial features: no. Health: no. Target audience: general, not the Families program, unless you separately meet the Designed for Families rules.
9. **App access.** Declare that every feature works without a sign-in.
10. **Release.** Put the AAB in the closed-testing track, add the testers, wait out the new-account requirement, then promote the same bundle to production. Pricing: free. Choose the countries you want.
