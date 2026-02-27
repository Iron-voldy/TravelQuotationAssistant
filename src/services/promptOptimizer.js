/**
 * promptOptimizer.js
 * Uses OpenAI GPT-4o-mini to analyze a failed user prompt and
 * generate 2–3 simplified, optimized booking prompts the system
 * will actually understand.
 */

const OPENAI_KEY = process.env.REACT_APP_OPENAI_KEY;

const SYSTEM_PROMPT = `You are a travel booking prompt optimizer for a Southeast/South Asian travel company.

The user sent a complex or unclear travel request that the booking system could NOT process.
Your job: extract the travel details and return 2–3 SIMPLIFIED prompts the system CAN handle.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SUPPORTED DESTINATIONS ONLY
(map any city, landmark, or attraction to these countries)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Sri Lanka  → Colombo, Kandy, Galle, Nuwara Eliya, Ella, Bentota, Sigiriya,
               Dambulla, Anuradhapura, Mirissa, Trincomalee, Yala
• Malaysia   → Kuala Lumpur, Langkawi, Penang
               Landmarks: Twin Towers, Petronas, KLCC, Genting, Putrajaya,
               Batu Caves, KL Tower, Aquaria KLCC, Sunway Lagoon
• Vietnam    → Hanoi, Da Nang, Ho Chi Minh City (Saigon), Phu Quoc, Sa Pa
• Singapore  → Singapore City
               Landmarks: Marina Bay Sands, Gardens by the Bay, Universal Studios,
               Sentosa, Orchard Road, Clarke Quay

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OUTPUT FORMAT — JSON array ONLY, no extra text
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
["prompt 1", "prompt 2", "prompt 3"]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PROMPT FORMAT RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Each prompt MUST follow this pattern:
  "Create [Country] for [X] nights for [N] pax"
  "Create [Country] for [X] nights for [N] adults and [Y] children traveling on [Date] with [star]-star hotel"

Rules:
1. Country is ALWAYS the country name (Sri Lanka / Malaysia / Vietnam / Singapore), NOT the city.
2. Remove all activity/tour/landmark details — booking system does not support them.
3. Simplify pax: ignore "no bed", "extra bed", bed type, child ages — just count adults and children.
4. If multiple cities mentioned for the same country, use only the country name.
5. If no duration found, generate variants: 3-night and 5-night options.
6. If travel date found, include it as "Xth Month YYYY" (e.g., "5th April 2026").
7. If hotel star rating found (e.g., 4 star, luxury), include "with X-star hotel".
8. Generate exactly 2 prompts: one minimal, one with full details.
9. If destination is NOT in the supported list, return: ["Sorry, we only support Sri Lanka, Malaysia, Vietnam, and Singapore at this time."]

Example input: "create a quote for 2 adults + 1 child 8 yrs no bed for 5th April 2026 with 4 star hotel, city tour, twin tower, day trip of genting, out door theme park, putrajaya, on private transfer"
Example output: ["Create Malaysia for 3 nights for 2 adults and 1 child", "Create Malaysia for 3 nights for 2 adults and 1 child traveling on 5th April 2026 with 4-star hotel"]`;

/**
 * Call OpenAI and return an array of 2–3 optimized prompt strings.
 * Returns null on any failure so callers can show static fallback.
 *
 * @param {string} userPrompt - The original failed user message
 * @returns {Promise<string[]|null>}
 */
export async function getOptimizedPrompts(userPrompt) {
    if (!OPENAI_KEY) {
        console.warn('[PromptOptimizer] REACT_APP_OPENAI_KEY is not set. Check your .env file and restart the dev server.');
        return null;
    }

    console.log('[PromptOptimizer] Calling OpenAI for prompt:', userPrompt.substring(0, 80));

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_KEY}`,
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: SYSTEM_PROMPT },
                    { role: 'user', content: userPrompt },
                ],
                temperature: 0.2,
                max_tokens: 300,
            }),
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            console.error('[PromptOptimizer] OpenAI HTTP error:', response.status, JSON.stringify(err));
            return null;
        }

        const data = await response.json();
        console.log('[PromptOptimizer] Raw OpenAI response:', JSON.stringify(data));

        const raw = data?.choices?.[0]?.message?.content?.trim();
        if (!raw) {
            console.warn('[PromptOptimizer] Empty content in response');
            return null;
        }

        // Strip markdown code fences if present
        const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
        console.log('[PromptOptimizer] Cleaned content:', cleaned);

        const suggestions = JSON.parse(cleaned);

        if (Array.isArray(suggestions) && suggestions.length > 0) {
            console.log('[PromptOptimizer] Suggestions:', suggestions);
            return suggestions;
        }
        console.warn('[PromptOptimizer] Parsed result is not a non-empty array:', suggestions);
        return null;
    } catch (e) {
        console.error('[PromptOptimizer] Exception:', e.message, e);
        return null;
    }
}
