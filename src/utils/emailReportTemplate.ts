// Shared HTML email builder used by both the full report and demo report emails.
// Pass demo: true to render the sample banner, sample note, and locked-section teaser.

export interface EmailEventCard {
  priorityRank: number
  title: string
  eventType: string
  date: string
  time: string
  venue: string
  cost: string
  description: string
  whyThisEvent: string
  whoYoullMeet: string
  whatToDo: string[]
  registrationLink?: string
  calendarBlock?: string
}

export interface EmailOrgCard {
  priorityRank: number
  name: string
  website?: string
  orgType: string
  description: string
  whyThisOrg: string
  whoYoullMeet: string
  whatToDo: string[]
  meetingFrequency: string
  membershipCost: string
  primaryBenefit: string
}

export interface FullReportEmailOptions {
  demo: false
  recipientName: string
  recipientTitle?: string
  industry: string
  targetIndustries?: string[]
  targetRoles?: string[]
  events: EmailEventCard[]
  orgs: EmailOrgCard[]
}

export interface DemoReportEmailOptions {
  demo: true
  recipientName: string
  industry: string
  goal: string
  intro: string
  event: EmailEventCard
  org: EmailOrgCard
}

type EmailOptions = FullReportEmailOptions | DemoReportEmailOptions

// ─── Colour palette (inline for email client compatibility) ──────────────────
const NAVY = "#0f2044"
const GOLD = "#c9a84c"
const GOLD_LIGHT = "#f5ecd4"
const GREY_BG = "#f8f9fa"
const BORDER = "#e5e7eb"
const TEXT_MAIN = "#1a202c"
const TEXT_MUTED = "#6b7280"
const TEXT_SMALL = "#9ca3af"
const WHITE = "#ffffff"

const ICON_EXTERNAL = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="${WHITE}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;margin-right:5px;"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`
const ICON_LOCK = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="${NAVY}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`

// ─── Priority badge (circle #N) ───────────────────────────────────────────────
function priorityBadgeHTML(rank: number): string {
  const borderColor = rank === 1 ? "#4a7c59" : rank === 2 ? "#0f2044" : "#6b7280"
  const textColor = rank === 1 ? "#2d5a3d" : rank === 2 ? "#0f2044" : "#6b7280"
  const bgColor = rank === 1 ? "#e8f5ed" : rank === 2 ? "#e8edf5" : "#f3f4f6"
  return `<table cellpadding="0" cellspacing="0" border="0" style="display:inline-table;text-align:center;">
    <tr>
      <td style="width:56px;height:56px;border-radius:50%;border:2px solid ${borderColor};background:${bgColor};text-align:center;vertical-align:middle;">
        <span style="font-size:16px;font-weight:800;color:${textColor};">#${rank}</span>
      </td>
    </tr>
    <tr>
      <td style="text-align:center;padding-top:3px;">
        <span style="font-size:10px;color:#9ca3af;font-weight:500;">priority</span>
      </td>
    </tr>
  </table>`
}

// ─── Tag pill ─────────────────────────────────────────────────────────────────
function tagPill(label: string, style: "navy-filled" | "gold-filled" | "outline-navy"): string {
  const styles: Record<typeof style, string> = {
    "navy-filled": `background:${NAVY};color:${WHITE};border:1px solid ${NAVY};`,
    "gold-filled": `background:${GOLD};color:${NAVY};border:1px solid ${GOLD};`,
    "outline-navy": `background:${WHITE};color:${NAVY};border:1px solid ${NAVY};`,
  }
  return `<span style="display:inline-block;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;letter-spacing:0.03em;${styles[style]}">${label}</span>`
}

// ─── Event card ───────────────────────────────────────────────────────────────
function buildEventCardHTML(card: EmailEventCard): string {
  const whatToDoItems = card.whatToDo
    .map((action, i) => `<tr><td style="padding:3px 0 3px 0;vertical-align:top;"><span style="font-size:13px;font-weight:700;color:${GOLD};margin-right:8px;">${i + 1}.</span></td><td style="padding:3px 0;font-size:13px;color:${TEXT_MAIN};line-height:1.55;">${action}</td></tr>`)
    .join("")

  const viewEventBtn = card.registrationLink
    ? `<a href="${card.registrationLink}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:9px 18px;background:${NAVY};color:${WHITE};border-radius:6px;font-size:12px;font-weight:700;text-decoration:none;margin-right:8px;">${ICON_EXTERNAL}View Event</a>`
    : ""

  return `
  <div style="margin-bottom:28px;border:1px solid ${BORDER};border-radius:10px;overflow:hidden;background:${WHITE};">
    <!-- Card top accent bar -->
    <div style="height:3px;background:${GOLD};"></div>

    <!-- Card header -->
    <div style="padding:20px 22px 16px;background:${WHITE};">
      <!-- Priority + tags + title row -->
      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:14px;">
        <tr>
          <td style="vertical-align:middle;width:66px;padding-right:14px;">
            ${priorityBadgeHTML(card.priorityRank)}
          </td>
          <td style="vertical-align:middle;">
            <div style="margin-bottom:6px;">
              ${tagPill("Top Pick", "navy-filled")}
              &nbsp;${tagPill(card.eventType, "outline-navy")}
            </div>
            <h2 style="margin:0;font-size:17px;font-weight:800;color:${NAVY};line-height:1.3;">${card.title}</h2>
          </td>
        </tr>
      </table>

      <!-- Date / time / venue / cost row -->
      <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:6px;">
        <tr>
          <td style="padding:3px 16px 3px 0;font-size:13px;color:${TEXT_MAIN};white-space:nowrap;">${card.date}</td>
          <td style="padding:3px 16px 3px 0;font-size:13px;color:${TEXT_MAIN};white-space:nowrap;">${card.time}</td>
        </tr>
        <tr>
          <td colspan="2" style="padding:3px 0;font-size:13px;color:${TEXT_MAIN};">${card.venue || "—"}</td>
        </tr>
        <tr>
          <td colspan="2" style="padding:3px 0;font-size:13px;color:${TEXT_MAIN};">${card.cost}</td>
        </tr>
      </table>
    </div>

    <!-- Card body -->
    <div style="padding:0 22px 22px;">
      <!-- Description -->
      <p style="margin:0 0 18px;font-size:13px;color:${TEXT_MUTED};line-height:1.6;">${card.description}</p>

      <!-- Divider -->
      <div style="height:1px;background:${BORDER};margin-bottom:18px;"></div>

      <!-- WHY THIS EVENT -->
      <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:0.08em;color:${NAVY};text-transform:uppercase;">Why This Event</p>
      <p style="margin:0 0 18px;font-size:13px;color:${TEXT_MAIN};line-height:1.6;">${card.whyThisEvent}</p>

      <!-- WHO YOU'LL MEET -->
      <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:0.08em;color:${NAVY};text-transform:uppercase;">Who You'll Meet</p>
      <p style="margin:0 0 18px;font-size:13px;color:${TEXT_MAIN};line-height:1.6;">${card.whoYoullMeet}</p>

      <!-- Divider -->
      <div style="height:1px;background:${BORDER};margin-bottom:18px;"></div>

      <!-- WHAT TO DO -->
      <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:0.08em;color:${NAVY};text-transform:uppercase;">What To Do</p>
      <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;width:100%;">
        ${whatToDoItems}
      </table>

      <!-- View Event button -->
      ${viewEventBtn ? `<div style="margin-bottom:12px;">${viewEventBtn}</div>` : ""}

      <!-- Calendar buttons -->
      ${card.calendarBlock ?? ""}
    </div>
  </div>`
}

// ─── Org card ─────────────────────────────────────────────────────────────────
function buildOrgCardHTML(card: EmailOrgCard): string {
  const whatToDoItems = card.whatToDo
    .map((action, i) => `<tr><td style="padding:3px 0 3px 0;vertical-align:top;"><span style="font-size:13px;font-weight:700;color:${GOLD};margin-right:8px;">${i + 1}.</span></td><td style="padding:3px 0;font-size:13px;color:${TEXT_MAIN};line-height:1.55;">${action}</td></tr>`)
    .join("")

  const websiteLink = card.website
    ? `<p style="margin:6px 0 0;font-size:13px;"><a href="${card.website}" target="_blank" rel="noopener noreferrer" style="color:${GOLD};text-decoration:underline;font-weight:600;">${card.website.replace("https://", "")}</a></p>`
    : ""

  return `
  <div style="margin-bottom:28px;border:1px solid ${BORDER};border-radius:10px;overflow:hidden;background:${WHITE};">
    <!-- Card top accent bar -->
    <div style="height:3px;background:${GOLD};"></div>

    <!-- Card header -->
    <div style="padding:20px 22px 16px;background:${WHITE};">
      <!-- Priority + tags + title row -->
      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:14px;">
        <tr>
          <td style="vertical-align:middle;width:66px;padding-right:14px;">
            ${priorityBadgeHTML(card.priorityRank)}
          </td>
          <td style="vertical-align:middle;">
            <div style="margin-bottom:6px;">
              ${tagPill("Top Pick", "navy-filled")}
              &nbsp;${tagPill(card.orgType, "outline-navy")}
            </div>
            <h2 style="margin:0 0 4px;font-size:17px;font-weight:800;color:${NAVY};line-height:1.3;">${card.name}</h2>
            ${websiteLink}
          </td>
        </tr>
      </table>
    </div>

    <!-- Card body -->
    <div style="padding:0 22px 22px;">
      <!-- Description -->
      <p style="margin:0 0 18px;font-size:13px;color:${TEXT_MUTED};line-height:1.6;">${card.description}</p>

      <!-- Divider -->
      <div style="height:1px;background:${BORDER};margin-bottom:18px;"></div>

      <!-- WHY THIS ORG -->
      <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:0.08em;color:${NAVY};text-transform:uppercase;">Why This Organization</p>
      <p style="margin:0 0 18px;font-size:13px;color:${TEXT_MAIN};line-height:1.6;">${card.whyThisOrg}</p>

      <!-- WHO YOU'LL MEET -->
      <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:0.08em;color:${NAVY};text-transform:uppercase;">Who You'll Meet</p>
      <p style="margin:0 0 18px;font-size:13px;color:${TEXT_MAIN};line-height:1.6;">${card.whoYoullMeet}</p>

      <!-- Divider -->
      <div style="height:1px;background:${BORDER};margin-bottom:18px;"></div>

      <!-- WHAT TO DO -->
      <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:0.08em;color:${NAVY};text-transform:uppercase;">What To Do</p>
      <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;width:100%;">
        ${whatToDoItems}
      </table>

      <!-- Meta rows -->
      <div style="background:${GREY_BG};border-radius:8px;padding:14px 16px;">
        <table cellpadding="0" cellspacing="0" border="0" width="100%">
          <tr>
            <td style="padding:4px 0;font-size:12px;font-weight:700;color:${TEXT_MUTED};text-transform:uppercase;letter-spacing:0.05em;width:160px;">Meeting Frequency</td>
            <td style="padding:4px 0;font-size:13px;font-weight:600;color:${NAVY};">${card.meetingFrequency}</td>
          </tr>
          <tr>
            <td style="padding:4px 0;font-size:12px;font-weight:700;color:${TEXT_MUTED};text-transform:uppercase;letter-spacing:0.05em;">Membership Cost</td>
            <td style="padding:4px 0;font-size:13px;font-weight:600;color:${NAVY};">${card.membershipCost}</td>
          </tr>
          <tr>
            <td style="padding:4px 0;font-size:12px;font-weight:700;color:${TEXT_MUTED};text-transform:uppercase;letter-spacing:0.05em;">Primary Benefit</td>
            <td style="padding:4px 0;font-size:13px;font-weight:600;color:${NAVY};">${card.primaryBenefit}</td>
          </tr>
        </table>
      </div>
    </div>
  </div>`
}

// ─── Email wrapper shell ──────────────────────────────────────────────────────
function emailShell(innerContent: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Event Recommendations — Texas Business Calendars</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f3f4f6;">
    <tr>
      <td align="center" style="padding:24px 16px 40px;">
        <table cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;width:100%;">
          ${innerContent}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

// ─── Demo sample note + locked section ───────────────────────────────────────
function demoSampleNoteHTML(): string {
  return `
  <!-- Sample note -->
  <tr>
    <td style="padding-bottom:20px;">
      <div style="border:1px dashed ${GOLD};border-radius:10px;padding:16px 20px;background:${GOLD_LIGHT};">
        <p style="margin:0;font-size:13px;color:${TEXT_MUTED};text-align:center;line-height:1.6;">
          This is a 2-item sample. Your full report includes a complete list of recommended events and organizations personalized to your profile. The more information you provide, the more accurate your results.
        </p>
      </div>
    </td>
  </tr>

  <!-- Locked section teaser -->
  <tr>
    <td style="padding-bottom:24px;">
      <div style="border:1px solid ${BORDER};border-radius:10px;overflow:hidden;background:${WHITE};">
        <!-- Blurred rows (faked with grey blocks) -->
        <div style="padding:20px 22px;opacity:0.35;filter:blur(1px);">
          <div style="height:14px;background:#cbd5e1;border-radius:4px;width:70%;margin-bottom:10px;"></div>
          <div style="height:10px;background:#cbd5e1;border-radius:4px;width:50%;margin-bottom:8px;"></div>
          <div style="height:10px;background:#cbd5e1;border-radius:4px;width:80%;margin-bottom:8px;"></div>
          <div style="height:14px;background:#cbd5e1;border-radius:4px;width:65%;margin-bottom:10px;margin-top:14px;"></div>
          <div style="height:10px;background:#cbd5e1;border-radius:4px;width:45%;margin-bottom:8px;"></div>
          <div style="height:10px;background:#cbd5e1;border-radius:4px;width:75%;"></div>
        </div>
        <!-- Lock overlay -->
        <div style="background:rgba(248,249,250,0.95);padding:28px 22px;text-align:center;border-top:1px solid ${BORDER};">
          <div style="width:52px;height:52px;border-radius:50%;background:${GOLD_LIGHT};margin:0 auto 12px;display:flex;align-items:center;justify-content:center;text-align:center;line-height:52px;">
            <span style="display:inline-block;line-height:normal;vertical-align:middle;margin-top:14px;">${ICON_LOCK}</span>
          </div>
          <p style="margin:0 0 6px;font-size:14px;font-weight:700;color:${NAVY};">Your full report includes more events and organizations</p>
          <p style="margin:0 0 18px;font-size:12px;color:${TEXT_MUTED};">Personalized to your industry, goal, and schedule</p>
          <a href="https://texasbusinesscalendars.com" target="_blank" rel="noopener noreferrer"
             style="display:inline-block;padding:10px 28px;background:${NAVY};color:${WHITE};border-radius:6px;font-size:13px;font-weight:700;text-decoration:none;">
            Get Full Report
          </a>
        </div>
      </div>
    </td>
  </tr>`
}

// ─── Footer row ───────────────────────────────────────────────────────────────
function footerHTML(): string {
  return `
  <tr>
    <td>
      <div style="background:${NAVY};border-radius:10px;padding:22px 24px;text-align:center;">
        <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:${GOLD};">Want your full personalized report?</p>
        <p style="margin:0 0 2px;font-size:13px;color:${WHITE};">Michael Espinoza &middot; 210-370-7550</p>
        <p style="margin:0 0 10px;font-size:13px;color:${WHITE};">michael@texasbusinesscalendars.com</p>
        <p style="margin:0;font-size:13px;font-weight:600;color:${GOLD};">Contact Michael to start your Event Assistant subscription.</p>
      </div>
    </td>
  </tr>`
}

// ─── Strip SVGs and collapse whitespace to stay under EmailJS 50KB limit ─────
export function minifyForEmail(html: string): string {
  return html
    .replace(/<svg[\s\S]*?<\/svg>/gi, "")
    .replace(/\s{2,}/g, " ")
    .replace(/>\s+</g, "><")
    .trim()
}

// ─── Main entry point ─────────────────────────────────────────────────────────
export function buildReportEmailHTML(options: EmailOptions): string {
  if (options.demo) {
    const { recipientName, industry, goal, intro, event, org } = options

    const inner = `
      <!-- Demo banner -->
      <tr>
        <td style="padding-bottom:8px;">
          <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:${TEXT_SMALL};text-align:center;">
            Event Recommendation Report &mdash; Sample
          </p>
        </td>
      </tr>

      <!-- Hero header -->
      <tr>
        <td style="padding-bottom:20px;">
          <div style="border-radius:10px;overflow:hidden;border:1px solid rgba(15,32,68,0.15);">
            <div style="height:4px;background:${GOLD};"></div>
            <div style="background:${NAVY};padding:24px 24px 20px;">
              <p style="margin:0 0 10px;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:${GOLD};opacity:0.8;">Sample Report &middot; Texas Business Calendars</p>
              <h1 style="margin:0 0 4px;font-size:24px;font-weight:900;color:${WHITE};letter-spacing:-0.01em;line-height:1.2;">${recipientName}'s Event Recommendations</h1>
              <p style="margin:0 0 14px;font-size:13px;color:rgba(255,255,255,0.5);font-weight:500;">San Antonio, TX</p>
              ${tagPill(`Goal: ${goal}`, "gold-filled")}
              &nbsp;
              <span style="display:inline-block;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;background:rgba(255,255,255,0.12);color:rgba(255,255,255,0.8);border:1px solid rgba(255,255,255,0.2);">${industry}</span>
            </div>
            <!-- Intro attached below hero -->
            <div style="background:${WHITE};padding:18px 24px;border-top:1px solid rgba(15,32,68,0.08);">
              <p style="margin:0;font-size:13px;color:${TEXT_MAIN};line-height:1.65;">${intro}</p>
            </div>
          </div>
        </td>
      </tr>

      <!-- Event section label -->
      <tr>
        <td style="padding-bottom:10px;">
          <p style="margin:0;font-size:10px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:${GOLD};">Upcoming Event to Attend</p>
        </td>
      </tr>

      <!-- Event card -->
      <tr>
        <td style="padding-bottom:20px;">
          ${buildEventCardHTML(event)}
        </td>
      </tr>

      <!-- Org section label -->
      <tr>
        <td style="padding-bottom:10px;">
          <p style="margin:0;font-size:10px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:${GOLD};">Organization to Join</p>
        </td>
      </tr>

      <!-- Org card -->
      <tr>
        <td style="padding-bottom:20px;">
          ${buildOrgCardHTML(org)}
        </td>
      </tr>

      ${demoSampleNoteHTML()}

      ${footerHTML()}`

    return emailShell(inner)
  }

  // ── Full report mode ──────────────────────────────────────────────────────
  const { recipientName, recipientTitle, industry, targetIndustries, targetRoles, events, orgs } = options
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })

  const eventsHTML = events.map(buildEventCardHTML).join("")
  const orgsHTML = orgs.map(buildOrgCardHTML).join("")

  const inner = `
    <!-- Header -->
    <tr>
      <td style="padding-bottom:20px;">
        <div style="border-radius:10px;overflow:hidden;border:1px solid rgba(15,32,68,0.15);">
          <div style="height:4px;background:${GOLD};"></div>
          <div style="background:${NAVY};padding:24px 24px 20px;">
            <p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:${GOLD};opacity:0.8;">Texas Business Calendars</p>
            <h1 style="margin:0 0 4px;font-size:24px;font-weight:900;color:${WHITE};letter-spacing:-0.01em;line-height:1.2;">${recipientName}'s Event Recommendations</h1>
            ${recipientTitle ? `<p style="margin:0 0 6px;font-size:13px;color:rgba(255,255,255,0.6);">${recipientTitle}</p>` : ""}
            <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.45);">${today}</p>
          </div>
          <div style="background:${WHITE};padding:14px 24px;">
            <table cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="padding-right:12px;font-size:12px;color:${TEXT_MUTED};"><strong style="color:${NAVY};">Industry:</strong> ${industry}</td>
                ${targetIndustries?.length ? `<td style="padding-right:12px;font-size:12px;color:${TEXT_MUTED};"><strong style="color:${NAVY};">Target:</strong> ${targetIndustries.join(", ")}</td>` : ""}
                ${targetRoles?.length ? `<td style="font-size:12px;color:${TEXT_MUTED};"><strong style="color:${NAVY};">Roles:</strong> ${targetRoles.join(", ")}</td>` : ""}
              </tr>
            </table>
          </div>
        </div>
      </td>
    </tr>

    ${events.length > 0 ? `
    <!-- Events section label -->
    <tr>
      <td style="padding-bottom:10px;">
        <p style="margin:0;font-size:10px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:${GOLD};">Recommended Events (${events.length})</p>
      </td>
    </tr>
    <tr>
      <td style="padding-bottom:20px;">${eventsHTML}</td>
    </tr>` : ""}

    ${orgs.length > 0 ? `
    <!-- Orgs section label -->
    <tr>
      <td style="padding-bottom:10px;">
        <p style="margin:0;font-size:10px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:${GOLD};">Recommended Organizations (${orgs.length})</p>
      </td>
    </tr>
    <tr>
      <td style="padding-bottom:20px;">${orgsHTML}</td>
    </tr>` : ""}

    ${footerHTML()}`

  return emailShell(inner)
}
