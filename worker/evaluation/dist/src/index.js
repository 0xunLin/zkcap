import { getSystemPrompt } from './prompt.js';
// Phala expects a default export function to handle the request
export default async function (req) {
    // 1. Parse incoming data from the FastAPI backend
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const commitDiff = body.commitDiff;
    const commitId = body.commitId;
    // 2. Access the hardware-secured API key
    // The founder inputs this via Phala's vault. It is NEVER exposed to the public.
    const apiKey = req.secret?.openaiApiKey;
    if (!apiKey) {
        return { status: 500, body: JSON.stringify({ error: "Missing OpenAI API Key in TEE secret vault." }) };
    }
    if (!commitDiff) {
        return { status: 400, body: JSON.stringify({ error: "No commit diff provided." }) };
    }
    try {
        // 3. Call the LLM directly using native fetch (supported in Phala QuickJS)
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "gpt-4o", // You can configure this to use Claude or others
                messages: [
                    { role: "system", content: getSystemPrompt() },
                    { role: "user", content: `Evaluate this diff:\n\n${commitDiff}` }
                ],
                temperature: 0.1, // Low temperature for deterministic, analytical outputs
                response_format: { type: "json_object" } // Force JSON return
            })
        });
        const data = await response.json();
        const evaluationJson = JSON.parse(data.choices[0].message.content);
        // 4. Return the result.
        // Under the hood, Phala will mathematically sign this HTTP response 
        // using the Intel SGX hardware key before sending it back to your backend.
        return {
            status: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                commit_id: commitId,
                evaluation: evaluationJson,
                // We stamp it with a success flag so the backend knows the TEE completed the run
                tee_execution: "success"
            })
        };
    }
    catch (error) {
        return {
            status: 500,
            body: JSON.stringify({ error: `TEE Execution Failed: ${error.message}` })
        };
    }
}
