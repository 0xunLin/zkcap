import { getSystemPrompt } from './prompt.js';

// Phala expects a default export function to handle the request
export default async function (req: any) {
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
        // Updated to use the Groq API endpoint
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                // Specify a fast, powerful Groq model
                model: "llama-3.3-70b-versatile", // Or "llama-3.1-8b-instant" if you want extreme speed
                messages: [
                    { role: "system", content: getSystemPrompt() },
                    { role: "user", content: `Evaluate this diff:\n\n${commitDiff}` }
                ],
                // Low temperature is critical for structured data
                temperature: 0.1, 
                
                // REMOVED: response_format parameter to prevent Groq validation errors.
                // We rely on the system prompt to enforce the JSON structure.
            })
        });

        const data = await response.json();
        
        // Add error handling just in case the Groq API returns an auth/rate-limit error
        if (data.error) {
            throw new Error(`Groq API Error: ${data.error.message}`);
        }

        const rawContent = data.choices[0].message.content;
        
        // Sometimes LLMs (even when instructed not to) wrap JSON in markdown blockticks
        // This regex safely strips ```json and ``` if they exist before parsing.
        const cleanContent = rawContent.replace(/```json/g, '').replace(/```/g, '').trim();
        
        const evaluationJson = JSON.parse(cleanContent);

        // 4. Return the result
        return {
            status: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                commit_id: commitId,
                evaluation: evaluationJson,
                tee_execution: "success" 
            })
        };

    } catch (error: any) {
        return {
            status: 500,
            body: JSON.stringify({ error: `TEE Execution Failed: ${error.message}` })
        };
    }
}