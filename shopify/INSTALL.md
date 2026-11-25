# Motor Re Cycle — installing the redesign (Horizon theme)

Three sections, no other theme files touched. Work on a copy so the live store is safe.

## 1. Make a safe copy
Online Store › Themes › Horizon › **…** › **Duplicate**. Do every step below on the copy, then **Publish** it when happy.

## 2. Add the sections
On the copy: **…** › **Edit code** › Sections › **Add a new section** (Liquid). Create each file and paste its contents:
- `mrc-hero` ← `sections/mrc-hero.liquid`
- `mrc-product-row` ← `sections/mrc-product-row.liquid`
- `mrc-contact` ← `sections/mrc-contact.liquid`

## 3. Colours (no code)
**Customize** › Theme settings › Colors › edit **Scheme 1**:

| Setting | Colour |
|---|---|
| Background | `#0B0B0C` |
| Text / Foreground | `#FFFFFF` |
| Primary button background | `#E2582B` |
| Primary button text | `#0B0B0C` |
| Secondary button / outline | `#FFFFFF` |
| Borders | `#2A2A2F` |

If a block (cards, cart drawer, inputs) uses another scheme, set that scheme to Background `#18181B`, Text `#FFFFFF`.

## 4. Collections for the home page rows
Products › Collections › **Create collection** › *Automated* › condition **Product title contains**, "any condition":

| Collection | Title contains |
|---|---|
| Fuel Tanks & Bodywork | tank, panel, mudguard, hugger, bracket |
| Exhausts & Protection | exhaust, guard, knee |
| Seats, Wheels & Suspension | seat, wheel, suspension |
| Visors & Glass | visor |
| Lighting & Indicators | headlamp, indicator |
| Controls, Mirrors & Electrics | lever, mirror, clip, switch, pump, fuelx, key |

Check each collection's product list once — adjust words if something lands in the wrong row.

## 5. Home page
Customize › Home page:
1. **Add section › MRC hero**. Upload the showroom photo, set Button 2 link to the Contact page. Remove the old hero.
2. **Add section › MRC product row** — one per collection above, plus one with **All products** titled "Latest products" and link text "View all". Remove the old product list.

## 6. Contact page
Customize › top dropdown › Pages › **Contact**:
1. **Add section › MRC contact**.
2. Fill in: WhatsApp group invite link, admin WhatsApp number (with +91), email.
3. Remove the old contact form section (MRC contact has its own form; untick "Show contact form" to hide it).

## Notes
- Sold-out products show greyed with a "Sold out" label automatically.
- Hover on a card shows price, stock and "View"; keyboard focus does the same.
- Only use the showroom photo if it's your own or you have rights to it.
