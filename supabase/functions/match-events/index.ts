import "jsr:@supabase/functions-js/edge-runtime.d.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
}

const EVENTS_SYSTEM_PROMPT = `You are an expert networking event strategist. You will receive two things:
1. A Client Persona Profile — this describes the TYPE OF PERSON your client wants to meet at events (their ideal networking target: their industry, role, company size, pain points, and what drives them).
2. A list of upcoming events with details including event type, description, typical audience, and industry focus.

Your job is to match the events to the persona. Select the 3-5 events where the client is MOST LIKELY to encounter people who match the persona profile.

For each event return:
- event_name
- why_this_event (2-3 sentences explaining which persona traits make this event a match)
- who_youll_meet (1-2 sentences describing who typically attends)
- what_to_do (3 bullet points of specific actions to take at the event)
- priority_rank (1 through 5)

Return only valid JSON. No explanation outside the JSON.`

const ORGS_SYSTEM_PROMPT = `You are an expert business networking strategist. You will receive two things:
1. A Client Persona Profile describing the type of person your client wants to meet — their industry, role, company size, pain points, and decision drivers.
2. A list of professional organizations in San Antonio with fields: name, category, description, activity level, status, and calendar link.

Recommend the 3-10 organizations this client should JOIN OR GET INVOLVED WITH to consistently meet people who match their persona. These are ongoing communities where ideal prospects show up regularly.

Prioritize organizations where status is 'Current'. Consider organizations with status 'Pending' only if their description is a strong match for the persona.

Also check the notes field — if notes say the org is inactive or no longer active, do NOT recommend it.

For each recommended organization return as JSON:
- org_name
- category
- home_page
- calendar_link (from the calendar field)
- why_join (2-3 sentences — which specific persona traits make this a strong match)
- who_youll_meet (1-2 sentences about typical members)
- how_to_engage (2-3 bullet points — specific ways to get involved: volunteering, committees, sponsoring, speaking)
- activity_level (from the activity field)
- priority_rank (1 through 5)

Return only valid JSON. No explanation outside the JSON.`

async function callClaude(apiKey: string, systemPrompt: string, userMessage: string) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-opus-4-5",
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Claude API error: ${response.status} - ${err}`)
  }

  const claudeResponse = await response.json()
  return claudeResponse.content?.[0]?.text ?? ""
}

function parseJsonFromText(text: string) {
  const arrayMatch = text.match(/\[[\s\S]*\]/)
  if (arrayMatch) {
    return JSON.parse(arrayMatch[0])
  }
  return JSON.parse(text)
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders })
  }

  try {
    const { profile, events, organizations } = await req.json()

    const apiKey = Deno.env.get("ANTHROPIC_API_KEY")
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "ANTHROPIC_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const eventsUserMessage = JSON.stringify({ persona_profile: profile, events }, null, 2)

    const [eventsText, orgsText] = await Promise.all([
      callClaude(apiKey, EVENTS_SYSTEM_PROMPT, eventsUserMessage),
      organizations && organizations.length > 0
        ? callClaude(
            apiKey,
            ORGS_SYSTEM_PROMPT,
            JSON.stringify({
              persona_profile: profile,
              organizations: organizations.map((o: Record<string, string>) => ({
                name: o.name,
                category: o.category,
                city: o.city,
                description: o.description,
                home_page: o.home_page,
                calendar_link: o.calendar_link || o.calendar || "",
                activity: o.activity || "",
                internal_type: o.internal_type,
                notes: o.notes,
              })),
            }, null, 2)
          )
        : Promise.resolve(null),
    ])

    let recommendations
    try {
      recommendations = parseJsonFromText(eventsText)
    } catch {
      return new Response(
        JSON.stringify({ error: "Failed to parse event recommendations from Claude", raw: eventsText }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    let orgRecommendations = null
    if (orgsText !== null) {
      try {
        const parsedOrgs = parseJsonFromText(orgsText)

        const orgList: Record<string, string>[] = organizations ?? []

        function findOrgMatch(aiName: string): Record<string, string> | undefined {
          if (!aiName) return undefined
          const needle = aiName.toLowerCase().trim()
          let best: Record<string, string> | undefined

          for (const o of orgList) {
            const hay = (o.name ?? "").toLowerCase().trim()
            if (hay === needle) return o
            if (!best && (hay.includes(needle) || needle.includes(hay))) {
              best = o
            }
          }
          return best
        }

        orgRecommendations = parsedOrgs.map((rec: Record<string, unknown>) => {
          const matched = findOrgMatch(rec.org_name as string)
          return {
            ...rec,
            home_page: matched?.home_page || "",
            calendar_link: matched?.calendar || matched?.calendar_link || "",
          }
        })
      } catch {
        orgRecommendations = null
      }
    }

    return new Response(
      JSON.stringify({ recommendations, org_recommendations: orgRecommendations }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})
