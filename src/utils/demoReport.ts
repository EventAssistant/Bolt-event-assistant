export type DemoGoal = "Referrals" | "Partnerships" | "Clients" | "Visibility" | "Hiring"

export interface DemoFormData {
  name: string
  industry: string
  goal: DemoGoal
  email: string
}

export interface DemoEventRec {
  title: string
  date: string
  time: string
  venueName: string
  address: string
  description: string
  whyMatch: string
  registrationLink: string
  attendanceNote: string
  eventType: string
  hostedBy: string
  costNote: string
}

export interface DemoOrgRec {
  name: string
  website: string
  description: string
  whyJoin: string
  meetingFrequency: string
  membershipCost: string
  primaryBenefit: string
}

export interface DemoReportData {
  intro: string
  event: DemoEventRec
  org: DemoOrgRec
}

function getNextWeekdays(count: number): string[] {
  const results: string[] = []
  const d = new Date()
  const formatter = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  })
  while (results.length < count) {
    d.setDate(d.getDate() + 1)
    const day = d.getDay()
    if (day !== 0 && day !== 6) {
      results.push(formatter.format(d))
    }
  }
  return results
}

const EVENT_DATA: Record<DemoGoal, Omit<DemoEventRec, "date">> = {
  Referrals: {
    title: "San Antonio Business Referral Network Mixer",
    time: "5:30 PM – 7:30 PM",
    venueName: "Pearl Brewery — The Granary",
    address: "602 Avenue A, San Antonio, TX 78215",
    description:
      "A structured networking mixer designed exclusively for service professionals in San Antonio. Attendees participate in timed referral circles, exchange qualified leads, and connect with peers across complementary industries. Light appetizers and drinks included.",
    whyMatch:
      "This referral-focused mixer brings together service professionals actively looking to exchange qualified leads. Your industry background makes you a natural fit for the breakout referral circles — attendees come expecting to give and receive referrals, not just collect business cards.",
    registrationLink: "https://texasbusinesscalendars.com",
    attendanceNote: "Typically 60–90 attendees",
    eventType: "Referral Mixer",
    hostedBy: "SA Referral Network",
    costNote: "Free — RSVP required",
  },
  Partnerships: {
    title: "SA Startup & SMB Partnership Summit",
    time: "9:00 AM – 1:00 PM",
    venueName: "Geekdom",
    address: "110 E. Houston St., San Antonio, TX 78205",
    description:
      "A half-day summit connecting founders, small business owners, and service providers who are actively exploring co-marketing, referral, and service-bundling opportunities. Includes structured one-to-one match rounds and open networking.",
    whyMatch:
      "Partnership-minded founders and business leads attend specifically to explore co-marketing and service bundling opportunities. Your industry profile aligns well with the operators and vendors attending — the structured rounds give you a repeatable format to surface mutual-fit conversations quickly.",
    registrationLink: "https://texasbusinesscalendars.com",
    attendanceNote: "80–120 attendees",
    eventType: "Partnership Summit",
    hostedBy: "Geekdom & SA Tech Bloc",
    costNote: "$25 — Early bird available",
  },
  Clients: {
    title: "San Antonio Executive Roundtable",
    time: "11:30 AM – 1:30 PM",
    venueName: "La Cantera Resort & Spa",
    address: "16641 La Cantera Pkwy, San Antonio, TX 78256",
    description:
      "A curated luncheon for C-suite executives and business owners from mid-sized San Antonio companies. Includes a keynote presentation followed by open networking. Attendance is limited and vetted to ensure a high-quality guest list.",
    whyMatch:
      "Decision-makers from mid-sized businesses attend this roundtable — the exact buyer profile most likely to need your services. The vetting process means everyone in the room has real purchasing authority. First-time attendees frequently leave with multiple qualified follow-up conversations.",
    registrationLink: "https://texasbusinesscalendars.com",
    attendanceNote: "40–60 verified executives",
    eventType: "Executive Luncheon",
    hostedBy: "SA Executive Network",
    costNote: "$65 per seat — Invite or register online",
  },
  Visibility: {
    title: "SA Thought Leaders Speaker Series",
    time: "6:00 PM – 8:00 PM",
    venueName: "Frost Bank Tower — 14th Floor Event Space",
    address: "100 W. Houston St., San Antonio, TX 78205",
    description:
      "A monthly speaker series featuring local business and community leaders. Each session includes a 30-minute keynote, facilitated Q&A, and open networking. The series attracts professionals from across San Antonio who are invested in learning and community building.",
    whyMatch:
      "Attending and engaging with panelists here positions you as a peer in your space. Past attendees frequently cite this event as where they first met a key collaborator. Consistent presence over 3–4 months is typically enough to become a recognized name in the room.",
    registrationLink: "https://texasbusinesscalendars.com",
    attendanceNote: "100–150 attendees per session",
    eventType: "Speaker Series / Panel",
    hostedBy: "SA Business Journal",
    costNote: "Free — Registration preferred",
  },
  Hiring: {
    title: "SA Talent & Workforce Connect Expo",
    time: "10:00 AM – 3:00 PM",
    venueName: "Freeman Coliseum",
    address: "3201 E. Houston St., San Antonio, TX 78219",
    description:
      "A full-day workforce expo bringing together San Antonio employers and job seekers across industries. Employers set up booths for on-the-spot conversations and first-round screenings. Active and passive candidates attend to explore new opportunities.",
    whyMatch:
      "Local professionals exploring new opportunities attend this expo, giving you a direct pipeline to both active and passive candidates for your open roles. The format allows for real conversation — not just resume drops — so you can screen for culture fit on the spot.",
    registrationLink: "https://texasbusinesscalendars.com",
    attendanceNote: "500–800 total attendees",
    eventType: "Career & Workforce Expo",
    hostedBy: "Workforce Solutions Alamo",
    costNote: "Employer table: $150 — Job seekers: Free",
  },
}

const ORG_DATA: Record<DemoGoal, DemoOrgRec> = {
  Referrals: {
    name: "BNI San Antonio — Alamo City Chapter",
    website: "https://bni.com",
    description:
      "BNI (Business Network International) is the world's largest structured referral organization. The Alamo City chapter meets weekly and operates on a one-member-per-profession model, meaning each category has a single representative who receives referrals exclusively from the group.",
    whyJoin:
      "BNI chapters are structured specifically around referral reciprocity. One member per profession means no internal competition and a built-in expectation to pass leads to each other weekly. Members routinely credit BNI as their single highest-ROI networking investment.",
    meetingFrequency: "Weekly — Thursday mornings, 7:00–8:30 AM",
    membershipCost: "~$1,200/year (includes chapter dues + national membership)",
    primaryBenefit: "Exclusive Referral Pipeline",
  },
  Partnerships: {
    name: "San Antonio Hispanic Chamber of Commerce",
    website: "https://sahcc.org",
    description:
      "The SAHCC is one of the largest chambers in San Antonio, representing over 2,000 businesses across industries. The chamber offers monthly luncheons, networking events, committee involvement, and business development programming throughout the year.",
    whyJoin:
      "The SAHCC convenes business owners and decision-makers across industries who are actively seeking collaborative relationships. Committee involvement fast-tracks meaningful introductions that would take years to build through cold outreach alone.",
    meetingFrequency: "Monthly luncheon + weekly committee meetings",
    membershipCost: "Starting at $350/year",
    primaryBenefit: "Cross-Industry Introductions",
  },
  Clients: {
    name: "North SA Business Association",
    website: "https://northsabusiness.org",
    description:
      "The North SA Business Association serves established businesses in the northern San Antonio corridor. Members include retail, professional services, real estate, healthcare, and finance. Monthly events draw 50–120 members with a strong emphasis on referral and relationship-building.",
    whyJoin:
      "This association's membership skews toward established local businesses with real purchasing authority. Consistent attendance puts you in front of new prospective clients every month — members often say they acquired their best local clients through this group.",
    meetingFrequency: "Monthly luncheon — 2nd Tuesday of each month",
    membershipCost: "$250/year",
    primaryBenefit: "Direct Client Acquisition",
  },
  Visibility: {
    name: "San Antonio Young Professionals",
    website: "https://sayp.org",
    description:
      "SAYP is San Antonio's largest network for young professionals, with over 3,000 active members across industries. The organization hosts monthly happy hours, professional development workshops, and community events that draw large, diverse crowds.",
    whyJoin:
      "SAYP hosts high-attendance social and speaker events where visibility compounds over time. Members who show up consistently become known faces across the city's professional community within 60–90 days. The member directory also provides year-round visibility to a large, engaged audience.",
    meetingFrequency: "Monthly events + quarterly workshops",
    membershipCost: "$75/year",
    primaryBenefit: "Brand Visibility & Name Recognition",
  },
  Hiring: {
    name: "Society for Human Resource Management — SA Chapter",
    website: "https://shrmsa.org",
    description:
      "SHRM San Antonio is the local chapter of the national HR professional association. Members include HR directors, talent acquisition leads, and workforce consultants from companies of all sizes. The chapter hosts monthly educational programs and an annual conference.",
    whyJoin:
      "SHRM members include HR leaders and talent professionals who can refer candidates, share sourcing strategies, and connect you with passive talent in your target skill set. Involvement in programming also positions you as a trusted employer in the local HR community.",
    meetingFrequency: "Monthly program meetings + annual conference",
    membershipCost: "$175/year (local + national dues)",
    primaryBenefit: "Talent Pipeline & Sourcing Network",
  },
}

const INTRO_TEMPLATES: Record<DemoGoal, (name: string, industry: string) => string> = {
  Referrals: (_name, industry) =>
    `San Antonio's ${industry} professionals have one of the strongest referral opportunities in the market right now. The events and organizations below were selected specifically for your background and where you are in your networking journey. Showing up consistently in these spaces will put you in front of the right partners at the right time.`,
  Partnerships: (_name, industry) =>
    `${industry} is where partnership opportunities matter most in San Antonio's business ecosystem. The events and organizations below focus exclusively on rooms where business owners are actively looking to collaborate and co-create. Your background positions you perfectly to explore these opportunities.`,
  Clients: (_name, industry) =>
    `Decision-makers actively seeking ${industry} solutions gather in San Antonio throughout the year. The events and organizations below are where qualified prospects spend their time — where they're already thinking about growth and open to new partnerships. Consistent visibility in these rooms translates directly to client conversations.`,
  Visibility: (_name, industry) =>
    `Becoming a recognized name in ${industry} in San Antonio happens through strategic presence and consistent engagement. The events and organizations below are where practitioners and decision-makers gather — and where your visibility compounds fastest. Three to four months of consistent attendance typically makes you a known name.`,
  Hiring: (_name, industry) =>
    `The best ${industry} talent in San Antonio connects in specific professional circles and events. The events and organizations below are where both active job seekers and the passive candidates you're looking for spend their time. Direct conversations here often lead to faster, better-fit placements.`,
}

export function buildDemoReport(data: DemoFormData): DemoReportData {
  const eventRaw = EVENT_DATA[data.goal]
  const dates = getNextWeekdays(3)

  const event: DemoEventRec = { ...eventRaw, date: dates[1] }

  return {
    intro: INTRO_TEMPLATES[data.goal](data.name, data.industry),
    event,
    org: ORG_DATA[data.goal],
  }
}

export function formatReportForEmail(report: DemoReportData, formData: DemoFormData): string {
  const e = report.event
  const o = report.org

  return `SAMPLE REPORT — Networking Snapshot for ${formData.name}

---

INTRO:
${report.intro}

---

EVENT RECOMMENDATION

${e.title}
Date: ${e.date}
Time: ${e.time}
Venue: ${e.venueName}
Address: ${e.address}
Type: ${e.eventType}
Hosted By: ${e.hostedBy}
Attendance: ${e.attendanceNote}
Cost: ${e.costNote}

About This Event:
${e.description}

Why This Is Recommended for You:
${e.whyMatch}

Register / Learn More: ${e.registrationLink}

---

ORGANIZATION RECOMMENDATION

${o.name}
Website: ${o.website}
Meeting Frequency: ${o.meetingFrequency}
Membership Cost: ${o.membershipCost}
Primary Benefit: ${o.primaryBenefit}

About This Organization:
${o.description}

Why This Is Recommended for You:
${o.whyJoin}

---

This is a 2-item sample. Your full report includes a complete list of recommended events and organizations personalized to your profile. The more information you provide, the more accurate your results.`
}
