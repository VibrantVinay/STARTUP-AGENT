import { groq } from '@ai-sdk/groq';
import { streamText } from 'ai';

export const maxDuration = 60; 

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // Manually map messages to guarantee a safe structure without helper function bugs
    const formattedMessages = messages.map((m: any) => ({
      role: m.role,
      content: m.content || m.parts?.map((p: any) => p.text || '').join('') || '',
    }));

    const result = streamText({
      model: groq('llama-3.3-70b-versatile'),
      messages: formattedMessages,
      system: `You are an expert startup validator and business planner. 
      When a user submits an idea:
      1. Analyze the idea based on your extensive knowledge of markets, competitors, and industry trends.
      2. Identify market gaps, differentiators, and potential risks.
      3. Generate a structured business plan including an Executive Summary, Market Analysis, Competitive Landscape, and Go-to-Market strategy.
      
      IMPORTANT: At the very end of your response, you MUST provide a JSON object enclosed EXACTLY in <dashboard_data>...</dashboard_data> tags containing the risk analysis and timeline cash burn data tailored SPECIFICALLY to the user's startup idea. Do not use markdown \`\`\` inside the tags.
      
      Format strictly like this:
      <dashboard_data>
      {
        "riskData": [
          { "subject": "Specify Risk 1 (e.g. Server Costs)", "A": 85, "severity": "high" },
          { "subject": "Specify Risk 2 (e.g. Legal)", "A": 60, "severity": "medium" },
          { "subject": "Specify Risk 3", "A": 30, "severity": "low" },
          { "subject": "Specify Risk 4", "A": 75, "severity": "high" },
          { "subject": "Specify Risk 5", "A": 50, "severity": "medium" },
          { "subject": "Specify Risk 6", "A": 20, "severity": "low" }
        ],
        "timelineData": [
          { "month": "M1", "riskLevel": 85, "cashBurn": 50000 },
          { "month": "M3", "riskLevel": 70, "cashBurn": 40000 },
          { "month": "M6", "riskLevel": 55, "cashBurn": 30000 },
          { "month": "M9", "riskLevel": 40, "cashBurn": 20000 },
          { "month": "M12", "riskLevel": 25, "cashBurn": 15000 }
        ]
      }
      </dashboard_data>`,
    }); 

    return (result as any).toUIMessageStreamResponse();

  } catch (error: any) {
    console.error("Backend Error:", error);
    return new Response(
      error.message || "An unknown server error occurred.",
      { status: 500 }
    );
  }
}
