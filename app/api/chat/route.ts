import { groq } from '@ai-sdk/groq';
import { streamText, tool } from 'ai';
import { z } from 'zod';

export const maxDuration = 60; 

export async function POST(req: Request) {
  try {
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
          inputSchema: z.object({
            query: z.string().describe('The precise search query to execute'),
          }),
          execute: async ({ query }) => {
            const apiKey = process.env.TAVILY_API_KEY;
            if (!apiKey) throw new Error("Tavily API key missing from environment variables.");
            
            const response = await fetch('https://api.tavily.com/search', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                // .trim() removes accidental trailing spaces copied from the dashboard
                api_key: apiKey.trim(), 
                query, 
                // 'basic' prevents 403 errors on free tvly-dev- keys
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
      // Restoring maxSteps for native streaming loop compatibility
      maxSteps: 5, 
    });

    return result.toUIMessageStreamResponse();

  } catch (error: any) {
    // Intercepts any backend crash and sends the exact reason to the UI
    console.error("Backend Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "An unknown server error occurred." }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
}
