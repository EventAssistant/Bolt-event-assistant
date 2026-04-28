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
  location: string
  whyMatch: string
}

export interface DemoOrgRec {
  name: string
  category: string
  whyJoin: string
}

export interface DemoReportData {
  intro: string
  events: [DemoEventRec, DemoEventRec]
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

const EVENT_DATA: Record<
  DemoGoal,
  [Omit<DemoEventRec, "date">, Omit<DemoEventRec, "date">]
> = {
  Referrals: [
    {
      title: "San Antonio Business Referral Network Mixer",
      location: "Pearl Brewery — San Antonio, TX",
      whyMatch:
        "This referral-focused mixer brings together service professionals actively looking to exchange qualified leads. Your industry background makes you a natural fit for the breakout referral circles.",
    },
    {
      title: "Chambers Crossover Networking Breakfast",
      location: "Marriott Rivercenter — San Antonio, TX",
      whyMatch:
        "Multi-chamber breakfasts consistently attract decision-makers from complementary industries — exactly the referral partner profile you're targeting.",
    },
  ],
  Partnerships: [
    {
      title: "SA Startup & SMB Partnership Summit",
      location: "Geekdom — San Antonio, TX",
      whyMatch:
        "Partnership-minded founders and business leads attend specifically to explore co-marketing and service bundling opportunities aligned with your industry.",
    },
    {
      title: "B2B Connector Happy Hour",
      location: "The RIM — San Antonio, TX",
      whyMatch:
        "Structured one-to-one connection rounds make it easy to surface mutual clients and identify natural partnership fit in an informal setting.",
    },
  ],
  Clients: [
    {
      title: "San Antonio Executive Roundtable",
      location: "La Cantera Resort — San Antonio, TX",
      whyMatch:
        "Decision-makers from mid-sized businesses attend this roundtable — the exact buyer profile most likely to need your services.",
    },
    {
      title: "Small Business Saturday Kickoff Luncheon",
      location: "Henry B. González Convention Center — San Antonio, TX",
      whyMatch:
        "Local business owners gathering here are actively investing in growth, making this a high-density environment for your ideal client profile.",
    },
  ],
  Visibility: [
    {
      title: "SA Thought Leaders Speaker Series",
      location: "Frost Bank Tower — San Antonio, TX",
      whyMatch:
        "Attending and engaging with panelists here positions you as a peer in your space. Past attendees frequently cite this event as where they first met a key collaborator.",
    },
    {
      title: "Greater SA Chamber Monthly Luncheon",
      location: "Omni San Antonio Hotel — San Antonio, TX",
      whyMatch:
        "The chamber luncheon is one of the highest-visibility recurring events in the market — consistent attendance builds name recognition across multiple industries.",
    },
  ],
  Hiring: [
    {
      title: "SA Talent & Workforce Connect Expo",
      location: "Freeman Coliseum — San Antonio, TX",
      whyMatch:
        "Local professionals exploring new opportunities attend this expo, giving you a direct pipeline to active and passive candidates for your open roles.",
    },
    {
      title: "UT San Antonio Alumni Professional Mixer",
      location: "UTSA Main Campus — San Antonio, TX",
      whyMatch:
        "Alumni mixers surface motivated professionals with locally verified credentials — a strong sourcing ground for relationship-first hiring.",
    },
  ],
}

const ORG_DATA: Record<DemoGoal, DemoOrgRec> = {
  Referrals: {
    name: "BNI San Antonio — Alamo City Chapter",
    category: "Referral Organization",
    whyJoin:
      "BNI chapters are structured specifically around referral reciprocity. One member per profession means no internal competition and a built-in expectation to pass leads to each other weekly.",
  },
  Partnerships: {
    name: "San Antonio Hispanic Chamber of Commerce",
    category: "Chamber of Commerce",
    whyJoin:
      "The SAHCC convenes business owners and decision-makers across industries who are actively seeking collaborative relationships. Committee involvement fast-tracks meaningful introductions.",
  },
  Clients: {
    name: "North SA Business Association",
    category: "Business Association",
    whyJoin:
      "This association's membership skews toward established local businesses with real purchasing authority — consistent attendance puts you in front of new prospective clients every month.",
  },
  Visibility: {
    name: "San Antonio Young Professionals",
    category: "Professional Development",
    whyJoin:
      "SAYP hosts high-attendance social and speaker events where visibility compounds over time. Members who show up regularly become known faces across the city's professional community.",
  },
  Hiring: {
    name: "Society for Human Resource Management — SA Chapter",
    category: "Professional Association",
    whyJoin:
      "SHRM members include HR leaders and talent professionals who can refer candidates, share sourcing strategies, and connect you with passive talent in your target skill set.",
  },
}

const INTRO_TEMPLATES: Record<DemoGoal, (name: string, industry: string) => string> = {
  Referrals: (name, industry) =>
    `${name}, based on your background in ${industry}, you're well-positioned to build a strong referral network in San Antonio. The connections below represent events and organizations where professionals actively exchange qualified leads — not just business cards. Consistent presence in these spaces will put you in front of the right referral partners.`,
  Partnerships: (name, industry) =>
    `${name}, your experience in ${industry} makes you a compelling partnership candidate for complementary businesses in the San Antonio market. The recommendations below focus on environments where business owners and operators are specifically looking to collaborate, bundle services, or co-market to shared audiences.`,
  Clients: (name, industry) =>
    `${name}, with your focus in ${industry}, the most direct path to new clients is showing up where decision-makers are already gathering. The events and organization below are known for attracting business owners and executives with real purchasing authority — exactly the room you want to be in.`,
  Visibility: (name, industry) =>
    `${name}, building visibility in ${industry} across San Antonio means showing up consistently in the right rooms. The recommendations below prioritize high-profile events and organizations where your presence compounds over time — turning a familiar face into a recognized name.`,
  Hiring: (name, industry) =>
    `${name}, finding the right talent in ${industry} starts with being present where professionals gather. The events and organization below are strong sourcing environments for both active job seekers and the passive candidates who are hardest to reach through job boards alone.`,
}

export function buildDemoReport(data: DemoFormData): DemoReportData {
  const [event1Raw, event2Raw] = EVENT_DATA[data.goal]
  const dates = getNextWeekdays(5)

  const events: [DemoEventRec, DemoEventRec] = [
    { ...event1Raw, date: dates[1] },
    { ...event2Raw, date: dates[3] },
  ]

  return {
    intro: INTRO_TEMPLATES[data.goal](data.name, data.industry),
    events,
    org: ORG_DATA[data.goal],
  }
}
