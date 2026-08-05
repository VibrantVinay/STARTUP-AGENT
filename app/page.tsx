'use client';

import { useChat } from '@ai-sdk/react';
import { useState } from 'react';

export default function Chat() {
  // 1. Manually manage input state
  const [input, setInput] = useState('');
  
  // Extract the new error property
  const { messages, status, sendMessage, error } = useChat();
  
  // 3. Derive loading state from the new status string
  const isLoading = status === 'submitted' || status === 'streaming';

  // 4. Custom submit handler using the new sendMessage method
  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage({ text: input });
    setInput('');
  };

  return (
    <div className="flex flex-col w-full max-w-3xl py-24 mx-auto stretch px-4 min-h-screen">
      <div className="space-y-6 mb-24">
        {messages.map(m => (
          <div key={m.id} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`p-5 rounded-xl max-w-[85%] ${
              m.role === 'user' ? 'bg-black text-white' : 'bg-gray-100 text-black'
            }`}>
              
              {/* 5. Render everything from the unified 'parts' array */}
              {m.parts?.map((part, index) => {
                
                // Render standard text
                if (part.type === 'text') {
                  return (
                    <div key={index} className="whitespace-pre-wrap leading-relaxed">
                      {part.text}
                    </div>
                  );
                }
                
                // Render tool execution states
                if (part.type === 'tool-searchWeb') {
                  const query = (part as any).input?.query || "market data";
                  
                  if (part.state === 'output-available') {
                     return (
                        <div key={index} className="text-sm text-gray-500 mt-3 pt-3 border-t border-gray-200">
                          ✓ Analyzed data for: <strong>{query}</strong>
                        </div>
                     );
                  } else {
                     return (
                        <div key={index} className="text-sm text-gray-500 mt-3 pt-3 border-t border-gray-200 animate-pulse">
                          Searching the web for: <strong>{query}</strong>...
                        </div>
                     );
                  }
                }
                
                return null;
              })}
            </div>
          </div>
        ))}
        
        {/* NEW BLOCK: Display backend errors so failures are visible */}
        {error && (
          <div className="flex flex-col items-center p-5 rounded-xl bg-red-50 text-red-600 border border-red-200">
            <strong>Connection Error</strong>
            <span className="text-sm mt-1 text-center">{error.message}</span>
            <span className="text-xs text-red-400 mt-2">Check your Vercel logs or verify your API keys.</span>
          </div>
        )}
      </div>

      <form 
        onSubmit={handleFormSubmit} 
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-3xl p-4 bg-white"
      >
        <div className="relative flex items-center">
          <input
            className="w-full p-4 pr-16 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-black transition-all"
            value={input}
            placeholder="Describe your startup idea..."
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
          />
          <button 
            type="submit" 
            disabled={isLoading || !input.trim()}
            className="absolute right-2 p-2 bg-black text-white rounded-lg disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
