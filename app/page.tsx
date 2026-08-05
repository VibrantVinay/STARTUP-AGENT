'use client';

import { useChat } from '@ai-sdk/react';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    maxSteps: 5,
  });

  return (
    <div className="flex flex-col w-full max-w-3xl py-24 mx-auto stretch px-4 min-h-screen">
      <div className="space-y-6 mb-24">
        {messages.map(m => (
          <div key={m.id} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`p-5 rounded-xl max-w-[85%] ${
              m.role === 'user' ? 'bg-black text-white' : 'bg-gray-100 text-black'
            }`}>
              <div className="whitespace-pre-wrap leading-relaxed">{m.content}</div>
              
              {m.toolInvocations?.map(toolInvocation => {
                const { toolCallId, state, args } = toolInvocation;
                if (state === 'result') {
                  return (
                    <div key={toolCallId} className="text-sm text-gray-500 mt-3 pt-3 border-t border-gray-200">
                      ✓ Analyzed market data for: <strong>{args.query}</strong>
                    </div>
                  );
                } else {
                  return (
                    <div key={toolCallId} className="text-sm text-gray-500 mt-3 pt-3 border-t border-gray-200 animate-pulse">
                      Searching the web for: <strong>{args.query}</strong>...
                    </div>
                  );
                }
              })}
            </div>
          </div>
        ))}
      </div>

      <form 
        onSubmit={handleSubmit} 
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-3xl p-4 bg-white"
      >
        <div className="relative flex items-center">
          <input
            className="w-full p-4 pr-16 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-black transition-all"
            value={input}
            placeholder="Describe your startup idea..."
            onChange={handleInputChange}
            disabled={isLoading}
          />
          <button 
            type="submit" 
            disabled={isLoading || !input}
            className="absolute right-2 p-2 bg-black text-white rounded-lg disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
