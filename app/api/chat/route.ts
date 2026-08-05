import { groq } from '@ai-sdk/groq';
import { streamText } from 'ai';

export const maxDuration = 60; 

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const result = streamText({
      model: groq('llama-3.3-70b-versatile'),
      messages,
      system: `You are an expert startup validator and business planner. 
      When a user submits an idea:
      1. Analyze the idea based on your extensive knowledge of markets, competitors, and industry trends.
      2. Identify market gaps, differentiators, and potential risks.
      3. Generate a structured business plan including an Executive Summary, Market Analysis, Competitive Landscape, and Go-to-Market strategy.`,
    });

    return result.toUIMessageStreamResponse();

  } catch (error: any) {
    console.error("Backend Error:", error);
    return new Response(
      error.message || "An unknown server error occurred.",
      { status: 500 }
    );
  }
}
