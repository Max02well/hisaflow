import OpenAI from "openai";
import { env } from "../config/env.js";

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

export const aiService = {
  async extractIntent(text) {
    const res = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
        Extract product intent from user message.
        Return JSON:
        {
        "product": string,
        "budget": number|null,
        "color": string|null,
        "action": "search|buy"
        }
        `
        },
        { role: "user", content: text }
      ],
      response_format: { type: "json_object" }
    });

    return JSON.parse(res.choices[0].message.content);
  }
};