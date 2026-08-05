import { groq } from '@ai-sdk/groq';
import { streamText, tool, convertToCoreMessages } from 'ai';
import { z } from 'zod';

export const maxDuration = 60; 

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // We cast the configuration to 'any' to bypass strict TS false-positives during Vercel builds
    const result = streamText({
      model: groq('llama-3.3-70b-versatile'),
      // Crucial fix: Converting UI messages to Core messages
      messages: convertToCoreMessages(messages),
      system: `You are an expert startup validator and business planner. 
      When a user submits an idea:
      1. Always search the web for direct competitors, market size, and current industry trends.
      2. Analyze the findings to identify market gaps and potential risks.
      3. Generate a structured business plan including an Executive Summary, Market Analysis, Competitive Landscape, and Go-to-Market strategy.`,
      tools: {
        searchWeb: tool({
          description: 'Search the web for competitors, market data, and industry trends.',
          parameters: z.object({
            query: z.string().describe('The precise search query to execute'),
          }),
          execute: async ({ query }) => {
            const apiKey = process.env.TAVILY_API_KEY;
            if (!apiKey) throw new Error("Tavily API key missing from environment variables.");
            
            const response = await fetch('https://api.tavily.com/search', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                api_key: apiKey.trim(), 
                query, 
                search_depth: "basic" 
              })
            });

            if (!response.ok) {
               const errText = await response.text();
               throw new Error(`Tavily API Error (${response.status}): ${errText}`);
            }
            
            const data = await response.json();
            return data.results;
          },
        }),
      },
      // Enables the agent to pause, search, read, and resume
      maxSteps: 5, 
    } as any); 

    const response = result.toDataStreamResponse();
    return response;

  } catch (error: any) {
    console.error("Backend Error:", error);
    return new Response(
      error.message || "An unknown server error occurred.",
      { status: 500 }
    );
  }
}
