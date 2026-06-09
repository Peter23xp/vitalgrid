# Product

## Register

product

## Users

**Facility Manager** — hospital or clinic director managing stock across departments. Works from a desktop or tablet in a medical facility, often during active emergencies or shift handoffs. Primary task: monitor critical stock levels, approve transfers, act on alerts before they escalate.

**Field Agent** — on-the-ground staff (nurses, pharmacists, logistics coordinators) updating inventory and confirming incoming shipments. Works under time pressure with partial attention; the UI must be scannable and fast to operate.

**NGO Coordinator** — oversees multiple facilities across a region (e.g. DRC, Rwanda). Needs a cross-facility view to redistribute surplus stock to critical shortage sites. Works from a laptop, often over slow connections.

**Super Admin** — platform administrator responsible for org setup, user access, API keys, and billing. Low-frequency user; expects efficient forms and audit trails.

## Product Purpose

VitalGrid is a B2B platform for pooling and redistributing medical and humanitarian supplies across a network of health facilities. It exists because critical resources (blood bags, vaccines, medications) expire or run out at one facility while sitting in surplus at a nearby one — and no coordination mechanism exists to match supply to urgent demand in real time.

Success: a Field Agent in Kinshasa can request a transfer of O- blood from a surplus facility 40 km away in under 2 minutes; the Facility Manager approves it and an NGO Coordinator monitors the regional picture without manual phone calls.

## Brand Personality

Reliable, urgent, human.

The platform handles life-or-death logistics in resource-constrained settings. It should feel like a trusted tool in the hands of a skilled frontline worker — confident and authoritative, but never cold or bureaucratic. Urgency is conveyed through information density and clear alert hierarchy, not through alarming colors or anxious copy. Human warmth comes through in clear French-language copy, contextual guidance, and the sense that the system is on your side.

## Anti-references

- **Not generic SaaS** (Notion, Linear): avoid minimal pastel palettes, indigo accents, and the quiet "productivity tool" aesthetic. VitalGrid is operational, not contemplative.
- **Not sterile hospital software** (Epic, legacy SAP Health): avoid cold gray UI, dense forms, and the feeling of a system designed for compliance rather than people.
- **Not NGO-brochure soft**: avoid friendly-rounded, stock-photo, pastel-green "save the world" charity aesthetics. This is a logistics tool, not a donation page.
- **Not analytics-heavy BI** (Tableau, Looker): the platform is operational first. Data density serves action, not exploration.

## Design Principles

1. **Action over observation.** Every screen should make the highest-priority action obvious. Alerts exist to be resolved, not just acknowledged. Surface the next step.
2. **Density that respects cognitive load.** Field Agents work under stress. Information must be dense enough to be useful but never overwhelming. Use progressive disclosure for secondary data.
3. **Status is sacred.** The platform's core value is knowing the state of the supply chain. Status badges, stock levels, and transfer states must be unambiguous and always up to date — never stale or unclear.
4. **Urgency without alarm.** Critical situations are common. The design communicates severity clearly through hierarchy and color, not through anxiety-inducing patterns. Red means act now, not panic.
5. **Operational trust.** Medical staff trust instruments that behave predictably. Interactions should be decisive and direct — no ambiguous buttons, no mystery state changes, no confirmations for confirmations.

## Accessibility & Inclusion

- WCAG AA minimum for all interactive elements and body text.
- Color used for status must always be paired with a text label or icon (never color-only for critical information — some users may be color-blind).
- Interface is primarily in French (fr-FR locale); copy must be idiomatic, not machine-translated.
- Low-bandwidth consideration: no heavy animations that delay perceived performance; critical paths must be fast even on 3G.
- Reduced motion support required for all animations.
