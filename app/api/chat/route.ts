import { groq } from '@ai-sdk/groq';
import { streamText, tool, stepCountIs } from 'ai';
import { z } from 'zod';

export const maxDuration = 60; 

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: groq('llama-3.3-70b-versatile'),
    messages,
    system: `You are an expert startup validator and business planner. 
    When a user submits an idea:
    1. Always search the web for direct competitors, market size, and current industry trends.
    2. Analyze the findings to identify market gaps and potential risks.
    3. Generate a structured business plan including an Executive Summary, Market Analysis, Competitive Landscape, and Go-to-Market strategy.`,
    tools: {
      searchWeb: tool({
        description: 'Search the web for competitors, market data, and industry trends.',
        // FIX 1: 'parameters' is now 'inputSchema'
        inputSchema: z.object({
          query: z.string().describe('The precise search query to execute'),
        }),
        execute: async ({ query }) => {
          const apiKey = process.env.TAVILY_API_KEY;
          if (!apiKey) throw new Error("Tavily API key missing.");
          
          const response = await fetch('https://api.tavily.com/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              api_key: apiKey, 
              query, 
              search_depth: "advanced" 
            })
          });
          const data = await response.json();
          return data.results;
        },
      }),
    },
    // FIX 2: 'maxSteps' is now 'stopWhen' using 'stepCountIs'
    stopWhen: stepCountIs(5), 
  });

  return result.toUIMessageStreamResponse();
}
