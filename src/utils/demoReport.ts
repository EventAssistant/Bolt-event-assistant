import { buildReportEmailHTML } from "@/utils/emailReportTemplate"

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
  whoYoullMeet: string
  whatToDo: string[]
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
  whoYoullMeet: string
  whatToDo: string[]
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
    whoYoullMeet:
      "Service professionals, consultants, and business owners from complementary industries — accountants, attorneys, financial advisors, insurance agents, and marketing professionals actively looking to cross-refer clients.",
    whatToDo: [
      "Before the event, prepare a one-sentence description of your ideal referral client so you can clearly tell others exactly who to send your way.",
      "During referral circles, lead with the problem you solve rather than your title — people refer solutions, not job descriptions.",
      "Follow up within 24 hours with anyone who expressed interest in referring to you; send a brief intro email so they have your contact ready when the moment comes.",
    ],
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
    whoYoullMeet:
      "Founders, small business owners, and service providers across industries — many of whom serve the same clients you do and are actively seeking co-marketing, referral, or bundling arrangements rather than transactional sales relationships.",
    whatToDo: [
      "Come prepared with a clear pitch for what a partnership with you looks like: what you bring, what you're looking for, and what the referral or revenue share arrangement would be.",
      "During the structured rounds, ask each person 'Who is your ideal partner or referral source?' — this surfaces mutual fit faster than describing your own services.",
      "Exchange contact info with at least 3 people and propose a 20-minute follow-up call before leaving the room.",
    ],
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
    whoYoullMeet:
      "C-suite executives, business owners, and senior leaders from mid-sized San Antonio companies — people with budget authority who are actively thinking about growth, operations, and the vendors and services that support those goals.",
    whatToDo: [
      "Research 2–3 attendees before arriving using LinkedIn or the event guest list, so you can enter conversations with context rather than starting cold.",
      "During open networking, ask 'What's the biggest challenge your business is focused on this quarter?' — this surfaces needs naturally and positions you as a consultant, not a salesperson.",
      "If a conversation goes well, close for a specific next step before it ends: a 15-minute call, a coffee, or a referral introduction — not just a card exchange.",
    ],
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
    whoYoullMeet:
      "Ambitious professionals, business owners, and community leaders who prioritize continuous learning and are actively building their professional reputation in San Antonio — exactly the network that amplifies your visibility over time.",
    whatToDo: [
      "During Q&A, ask a thoughtful question that demonstrates your expertise in your field — this positions you as a knowledgeable peer in front of the entire room, not just the people next to you.",
      "After the session, introduce yourself to the speaker — a brief 2-minute conversation leaves a stronger impression than exchanging cards with 20 attendees.",
      "Commit to attending 3 consecutive sessions; visibility compounds through repetition and familiar faces become trusted names.",
    ],
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
    whoYoullMeet:
      "Active job seekers, passive candidates exploring options, and other employers — a mix that includes experienced professionals, recent graduates, and career changers across multiple industries who are open to the right opportunity.",
    whatToDo: [
      "Prepare a 30-second company pitch that leads with your culture and growth trajectory rather than a list of open roles — top candidates choose employers, not just jobs.",
      "Ask every candidate 'What does your ideal next role look like?' before describing your openings — this helps you identify fit quickly and avoids wasting both parties' time.",
      "Collect contact info from every promising conversation and send a personalized follow-up the same day while the interaction is still fresh.",
    ],
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
    whoYoullMeet:
      "One professional per industry category — accountants, attorneys, financial planners, mortgage brokers, insurance agents, contractors, and more — each committed to sending qualified referrals to fellow members every single week.",
    whatToDo: [
      "Request a visitor invitation to attend a chapter meeting before committing to membership — most chapters allow 1–2 guest visits so you can evaluate the room's quality and referral culture.",
      "At your first visit, prepare a 60-second member spotlight describing who you are, who your ideal client is, and a specific example of the type of referral that would be most valuable to you.",
      "After joining, track your referrals given and received monthly — active givers consistently receive the most referrals back.",
    ],
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
    whoYoullMeet:
      "Business owners, executives, and entrepreneurs from across San Antonio's economy — ranging from startups to established enterprises — many of whom are specifically looking for strategic partnerships, vendor relationships, and co-marketing opportunities.",
    whatToDo: [
      "Join a committee aligned with your business focus — committee work creates recurring contact with the same people over time, which is where real partnerships are built.",
      "Sponsor a chamber event at the entry level if your budget allows — it gets your name and brand in front of 2,000+ member businesses and signals commitment to the community.",
      "Attend three consecutive monthly luncheons before evaluating ROI; relationships in chambers compound slowly but compound reliably.",
    ],
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
    whoYoullMeet:
      "Owners and operators of established businesses in the north San Antonio corridor — retail, professional services, healthcare, real estate, and finance — the exact community where your prospective clients are concentrated.",
    whatToDo: [
      "Attend the monthly luncheon three times before asking for anything; trust is currency in association settings and new members who sell too early rarely get referrals.",
      "Volunteer for an event committee or board role — visible contribution builds name recognition faster than attendance alone.",
      "After each meeting, follow up with one new connection by email within 48 hours; consistent follow-through separates members who build business from those who just attend.",
    ],
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
    whoYoullMeet:
      "Ambitious professionals in their 20s and 30s across every industry in San Antonio — a diverse, well-connected audience that punches above its weight in referrals and introductions as careers and businesses grow.",
    whatToDo: [
      "Attend the monthly happy hour and set a goal of having 3 real conversations rather than collecting 10 cards — depth of connection drives visibility more than volume.",
      "Offer to speak or contribute content at a workshop or panel; even a 10-minute slot positions you as an expert in front of hundreds of engaged members.",
      "Use the member directory to identify professionals in industries adjacent to yours and send a brief, direct outreach message requesting a coffee introduction.",
    ],
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
    whoYoullMeet:
      "HR directors, talent acquisition specialists, and workforce consultants from San Antonio companies of all sizes — professionals who know where the talent is and are often the bridge between your open roles and the right candidates.",
    whatToDo: [
      "Attend a monthly program meeting as a guest before joining — HR meetings often include sourcing discussions where you can learn which talent pools are active right now.",
      "Introduce yourself as an employer and describe your culture and hiring goals; HR professionals in the room will naturally think of you when relevant candidates come across their desk.",
      "Sponsor or present at the annual conference for maximum exposure to the full talent community — even a tabletop presence drives months of follow-on introductions.",
    ],
    meetingFrequency: "Monthly program meetings + annual conference",
    membershipCost: "$175/year (local + national dues)",
    primaryBenefit: "Talent Pipeline & Sourcing Network",
  },
}

const INTRO_TEMPLATES: Record<DemoGoal, (name: string, industry: string) => string> = {
  Referrals: (_name, industry) =>
    `${industry} professionals in San Antonio are sitting on one of the strongest referral ecosystems in the state — but most are tapping into only a fraction of it. The events and organizations below were selected because they attract professionals who come specifically to give and receive qualified leads. Consistent presence in these spaces will generate a reliable pipeline, not just a stack of business cards.`,
  Partnerships: (_name, industry) =>
    `San Antonio's ${industry} space is full of potential partners — businesses that serve the same clients you do from a different angle. The events and organizations below put you in the same room as founders and operators who are actively looking to bundle services, share audiences, and build long-term collaborative relationships. Your background makes you a natural fit for those conversations.`,
  Clients: (_name, industry) =>
    `The buyers who need ${industry} services in San Antonio aren't hard to find — they're just concentrated in a handful of rooms that most people overlook. The events and organizations below draw decision-makers who are already in a growth mindset and open to new solutions. Showing up here consistently is the fastest path to qualified conversations, without cold outreach.`,
  Visibility: (_name, industry) =>
    `In San Antonio's ${industry} space, visibility is a compounding asset — and it's built event by event, conversation by conversation. The recommendations below are the highest-leverage rooms in the city for professionals in your field: the places where a familiar face becomes a recognized name within 60 to 90 days. Showing up once is networking. Showing up consistently is positioning.`,
  Hiring: (_name, industry) =>
    `The strongest candidates in ${industry} in San Antonio aren't on job boards — they're in the professional communities where people grow their careers. The events and organizations below are where active and passive candidates show up, learn, and connect with employers they can trust. Getting in front of them here leads to faster placements and better-fit hires than any posting will.`,
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

  return buildReportEmailHTML({
    demo: true,
    recipientName: formData.name,
    industry: formData.industry,
    goal: formData.goal,
    intro: report.intro,
    event: {
      priorityRank: 1,
      title: e.title,
      eventType: e.eventType,
      date: e.date,
      time: e.time,
      venue: `${e.venueName} — ${e.address}`,
      cost: e.costNote,
      description: e.description,
      whyThisEvent: e.whyMatch,
      whoYoullMeet: e.whoYoullMeet,
      whatToDo: e.whatToDo,
      registrationLink: e.registrationLink,
    },
    org: {
      priorityRank: 1,
      name: o.name,
      website: o.website,
      orgType: o.primaryBenefit,
      description: o.description,
      whyThisOrg: o.whyJoin,
      whoYoullMeet: o.whoYoullMeet,
      whatToDo: o.whatToDo,
      meetingFrequency: o.meetingFrequency,
      membershipCost: o.membershipCost,
      primaryBenefit: o.primaryBenefit,
    },
  })
}
