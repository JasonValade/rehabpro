import dotenv from "dotenv";

dotenv.config({ quiet: true });

const apiKey = process.env.OPENAI_API_KEY;
const model = process.env.OPENAI_MODEL || "gpt-5-mini";

if (!apiKey) {
  console.error("AI check failed: OPENAI_API_KEY is empty in .env");
  console.error("Create a key at https://platform.openai.com/api-keys, add it to .env, then run npm run check:ai again.");
  process.exit(1);
}

try {
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      input: "Reply with exactly: RehabPro AI is connected.",
      max_output_tokens: 30,
    }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    console.error(`AI check failed (${response.status}): ${data?.error?.message || "Unknown OpenAI API error"}`);
    process.exit(1);
  }

  const output = data?.output
    ?.flatMap((item) => item.content || [])
    .filter((item) => item.type === "output_text")
    .map((item) => item.text)
    .join("\n");

  console.log(`AI check passed using ${model}.`);
  console.log(output || "OpenAI returned a successful response.");
} catch (error) {
  console.error(`AI check failed: ${error.message}`);
  process.exit(1);
}
