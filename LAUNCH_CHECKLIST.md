# LAUNCH CHECKLIST — NXT Agency

Every placeholder, draft, empty setting, and launch decision tracked in one place. Work through each item before switching the site public.

---

## 1. Placeholders, Drafts & Empty Settings to Decide

| Item | File | What it is now | What the team must decide |
| --- | --- | --- | --- |
| **Agency name & short mark** | `site.config.ts` (`brand.name`, `brand.short`) | `"NXT Agency"` / `"NXT"` | Confirm final agency name and short form. If changed, also update the logo artwork in `components/Logo.tsx` and `app/icon.svg` and remake `public/og.png`. |
| **Placeholder logo artwork** | `components/Logo.tsx`, `app/icon.svg` | Geometric N-X-T wordmark with Volt arrow | Confirm keeping the N-X-T artwork or swap in final brand artwork while keeping the four `data-logo-part` hooks (`n`, `x-stroke`, `x-arrow`, `t`). |
| **Site address (`siteUrl`)** | `site.config.ts` (`siteUrl` / `resolvedSiteUrl`) | `siteUrl: ""` (empty; build uses safe fallback `"https://nxt.agency"` via `resolvedSiteUrl` so `metadataBase` never fails) | Set the real production domain (e.g. `"https://yourdomain.com"`) with no trailing slash before going public so canonical URLs, OG sharing links, and `sitemap.xml` point to the real domain. |
| **Search engine toggle (`allowSearchEngines`)** | `site.config.ts` (`allowSearchEngines`) | `false` (`noindex, nofollow` + `Disallow: /` in `robots.txt`) | Keep `false` during staging/preview. Flip to `true` only once all placeholders are replaced and the real domain is live. |
| **WhatsApp number** | `site.config.ts` (`contactSection.whatsappNumber`) | `""` (empty — WhatsApp buttons are hidden) | Enter real WhatsApp number in digits only with country code (e.g. `"919876543210"`). |
| **Contact email** | `site.config.ts` (`contactSection.contactEmail` & `brand.email`) | `contactEmail: ""` (hidden); `brand.email: "hello@nxt.agency"` | Enter the real studio inbox email (and align `brand.email`). Leaving both WhatsApp and Email empty shows `"Contact details coming soon."`. |
| **Hero booking status line** | `site.config.ts` (`hero.status`) | `"Booking projects for Q1 2027"` | Confirm the real availability quarter/month or booking message before launch. |
| **Hero ticker phrases** | `site.config.ts` (`hero.ticker`) | `"Websites that sell"`, `"Dashboards your team actually opens"`, `"Automations that hand back hours"`, `"Shipped in weeks, not quarters"`, `"Small team. Big output."`, `"CRM without the clutter"`, `"Fast by default"` | Review all 7 phrases for tone, accuracy, and promises we stand behind. |
| **Team members (5× PLACEHOLDER)** | `site.config.ts` (`teamSection.members[0..4]`) | `Member One` (`Designer`), `Member Two` (`Front-end developer`), `Member Three` (`Automation engineer`), `Member Four` (`Back-end and CRM developer`), `Member Five` (`Client lead`); all `bio: ""` and `photo: ""` | Replace all 5 names and confirm exact role titles. Optionally add a one-line `bio` and/or portrait `photo` path (e.g. `"/team/name.jpg"`) if you want portraits inside the geometric silhouettes instead of the characters. |
| **FAQ questions & answers (6× DRAFT)** | `site.config.ts` (`faqSection.items[0..5]`) | Draft Q&As: (01) Who is behind this?, (02) What can you build?, (03) How much does it cost?, (04) How long does it take?, (05) Do I need to understand technology?, (06) What happens after launch? | Review every question and answer for accuracy (especially honesty about team size, timelines, pricing expectations, and post-launch support). |
| **Contact budget ranges (PLACEHOLDER)** | `site.config.ts` (`contactSection.questions.budget.options`) | `"Under 25,000 rupees"`, `"25,000 to 75,000"`, `"75,000 and above"`, `"Not sure yet"` | Confirm currency (INR / USD / etc.) and realistic budget brackets for target clients. |
| **Contact reply SLA** | `site.config.ts` (`contactSection.thanks.body`) | `"We read every message ourselves and reply within one working day."` | Confirm the team commits to replying within one working day. |
| **Social links** | `site.config.ts` (`social`) | Generic root URLs (`https://instagram.com/`, `https://linkedin.com/`, `https://github.com/`) — currently unused in UI | Replace with real studio profile URLs if/when linked, or remove unused entries. |
| **Unfinished sections** | `site.config.ts` (`sectionReady.proof`, `sectionReady.packages`, `showUnfinishedSections`) | `proof: false`, `packages: false`, `showUnfinishedSections: false` | Decide whether to launch with Proof and Packages hidden or build and set them to `true` before launch. |
| **Footer year & tagline** | `site.config.ts` (`footerSection.year`, `footerSection.tagline`) | `2026` / `"Built by a team of five."` | Confirm copyright year and tagline at launch. |
| **Sample demo data** | `site.config.ts` (`liveDemos.miniCrm.initialLeads`, `incomingLeads`) | 8 fictional sample leads (`Asha M.`, `Rohan K.`, etc., ₹ amounts) clearly marked `SAMPLE DATA / SIMULATED` | Confirm fictional sample names and ₹ amounts remain clearly marked simulated (never real client data). |

---

## 2. Before Going Public

Complete these steps in order before sharing the public URL:

1. **Replace the placeholders** — Update every `PLACEHOLDER`, `DRAFT`, and empty setting in `site.config.ts` (team names/roles, FAQ copy, budget ranges, booking status line, ticker phrases, agency name/logo if changed).
2. **Test the contact flow with a real number and email** — Fill in `contactSection.whatsappNumber` and `contactSection.contactEmail`, walk through Q1–Q4 on both desktop and phone, and verify the pre-filled WhatsApp message opens cleanly and the `mailto:` email arrives in the real inbox.
3. **Test on a real iPhone and a real Android phone** — Check the intro, hero X-ray Blueprint button, Services Journey scroll morph, Live Demos touch tabs, Team swipe row & tap animations, FAQ accordion, Contact inputs (no Safari auto-zoom), Footer wordmark, and 404 page on real mobile devices.
4. **Set the site address** — Put the real production URL into `siteUrl` in `site.config.ts`, verify `public/og.png` previews cleanly in WhatsApp, Instagram, LinkedIn, and Telegram link debuggers, and confirm canonical metadata resolves to the real domain.
5. **Switch search engines on** — Set `allowSearchEngines` to `true` in `site.config.ts`, redeploy, and confirm the page no longer outputs `noindex`, `/robots.txt` allows crawling with the sitemap URL, and `/sitemap.xml` lists the live home page.

---

## 3. Sharing Image (`public/og.png`) Regeneration

> **Important:** `public/og.png` (1200×630) **must be remade** whenever the agency name, headline, or logo artwork in `components/Logo.tsx` changes.

To remake `public/og.png` using the live logo artwork and local fonts:
1. Read the four `<g data-logo-part="...">` groups directly from `components/Logo.tsx` (never hand-draw duplicate logo shapes) alongside `app/fonts/bricolage-grotesque-latin.woff2`, `app/fonts/instrument-serif-latin-400-italic.woff2`, `app/fonts/jetbrains-mono-latin.woff2`, and `public/grain.png`.
2. Render a temporary 1200×630 HTML page on `#0C0C0D` Ink with subtle grain, the NXT logo, `"We build what's next for your business."`, and `"Websites / Dashboards / Automations"`.
3. Capture with Playwright Chromium (`viewport: { width: 1200, height: 630 }`, `deviceScaleFactor: 1`) after `document.fonts.ready` to `public/og.png`, then delete the temporary HTML file.
4. Update `ogImageAlt` in `site.config.ts` if the brand name or headline changes.
