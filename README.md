# MD Quality

Astro website for `mdquality.pl`, with an IleZostaje product showcase and separate application privacy notice.

## Local checks

Requires Node.js 22.12 or later.

```sh
npm ci
npm run build
npm run preview
```

The output is generated under `dist/`. For a repeatable GitHub check, open **Actions > Verify MD Quality site > Run workflow**, choose `main`, then run the single Astro build. This is manual only and does not publish anything.

## Privacy pages

- Website: `/privacy/` and `/pl/privacy/`
- IleZostaje app: `/ilezostaje/privacy/` and `/pl/ilezostaje/privacy/`

The application policy is distinct from the website privacy terms. Both localized routes should be available without login before being submitted to App Store Connect or Microsoft Store. The app Help Center opens these URLs in the system browser.

## Cloudflare deployment

Cloudflare handles the live deployment separately from this repository's manual build verification. A green GitHub Astro build validates the generated static pages **but does not prove** that `mdquality.pl` was deployed.

If Cloudflare reports **Workers Builds: mdquality – failure**, inspect the exact build via Cloudflare dashboard > Workers & Pages > `mdquality` > Deployments > Build history. Note the first failing step and its error lines. Compare the build command, deployment command and output directory against this site's `astro build` output; do not change production credentials or hosting mode based on a failed GitHub status alone. After fixing the cause, confirm live HTTPS responses for both app privacy URLs and their footer links before updating store submissions.

The site has no backend or user account provisioning. Do not move IleZostaje financial files or connect this site to its local database.
