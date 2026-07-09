import agent from './index.js';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from the .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function runLocalSimulation() {
    // 1. Define a dummy "bad" Git commit diff
    // This diff removes a secure parameterized SQL query and replaces it with an insecure string concatenation (SQL Injection).
    const fakeDiff = `
diff --git a/database.js b/database.js
index 832d... b930... 100644
--- a/database.js
+++ b/database.js
@@ -10,6 +10,7 @@ class Database {
     }
 
     async getUser(userId) {
-        return await db.query("SELECT * FROM users WHERE id = $1", [userId]);
+        // Optimized for speed
+        return await db.query("SELECT * FROM users WHERE id = " + userId);
     }
 }
`;

    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
        throw new Error("Missing GROQ_API_KEY in environment variables");
    }

    // 2. Mock the Phala TEE request object
    const mockRequest = {
        body: {
            commitId: "abcdef1234567890",
            commitDiff: fakeDiff
        },
        secret: {
            // NOTE: Replace this string with a real OpenAI API key to test.
            // DO NOT commit this file to GitHub with your real key.
            openaiApiKey: apiKey
        }
    };

    console.log("🚀 Starting local Agent simulation...");
    console.log("📦 Ingesting commit diff...");

    try {
        // 3. Execute the agent just like the Phala Worker would
        const response = await agent(mockRequest);

        console.log("\n✅ Execution Complete. Result from Agent:");
        
        // Parse the body to display the JSON cleanly
        if (response.body) {
            const parsedBody = JSON.parse(response.body);
            console.log(JSON.stringify(parsedBody, null, 2));
        } else {
            console.log(response);
        }

    } catch (error) {
        console.error("❌ Simulation Failed:", error);
    }
}

runLocalSimulation();