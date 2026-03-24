/**
 * promptOptimizer.js
 * Calls our backend proxy (/api/chat/optimize-prompt) which then calls OpenAI
 * server-side — avoiding the browser CORS restriction on direct OpenAI calls.
 */

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/**
 * Call backend which proxies to OpenAI GPT-4o-mini.
 * Returns an array of 2–3 optimized prompt strings, or null on failure.
 *
 * @param {string} userPrompt - The original failed user message
 * @returns {Promise<string[]|null>}
 */
export async function getOptimizedPrompts(userPrompt) {
    const token = localStorage.getItem('token');
    if (!token) {
        console.warn('[PromptOptimizer] No auth token found. Cannot call optimize endpoint.');
        return null;
    }

    console.log('[PromptOptimizer] Calling backend optimize-prompt for:', userPrompt.substring(0, 80));

    try {
        const response = await fetch(`${API_URL}/chat/optimize-prompt`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ prompt: userPrompt })
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            console.error('[PromptOptimizer] Backend error:', response.status, JSON.stringify(err));
            return null;
        }

        const result = await response.json();
        const raw = result?.data?.choices?.[0]?.message?.content?.trim();
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
