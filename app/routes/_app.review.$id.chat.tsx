import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router";
import { mockCodeDiff, mockReviews } from "~/data/mock";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  codeContext?: string;
};

export default function ReviewChat() {
  const { id } = useParams();
  const review = mockReviews.find((r) => r.id === id);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `Hi! I'm your AI code review assistant. I've analyzed this review "${review?.title || ""}".

Here's what I found:

**Potential Issues:**
1. Missing cleanup in useEffect on line 42
2. Possible memory leak from event listener

**Suggestions:**
- Add return statement with cleanup function
- Consider using AbortController for fetch requests

Feel free to ask me any questions about the code!`,
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [scrollToBottom]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      codeContext: selectedCode || undefined,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setSelectedCode(null);
    setIsLoading(true);

    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: generateAIResponse(input),
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1000);
  };

  const quickActions = [
    { label: "Explain this code", prompt: "Can you explain what this code does?" },
    { label: "Find issues", prompt: "What potential issues do you see in this code?" },
    { label: "Suggest improvements", prompt: "How can I improve this code?" },
    { label: "Write tests", prompt: "Can you suggest tests for this code?" },
  ];

  return (
    <div className="flex h-full">
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
                }`}
              >
                {message.codeContext && (
                  <div className="mb-2 p-2 bg-gray-800 rounded text-xs font-mono text-gray-300 overflow-x-auto">
                    <pre>{message.codeContext}</pre>
                  </div>
                )}
                <div className="text-sm whitespace-pre-wrap">{message.content}</div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-3">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  />
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  />
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-gray-200 dark:border-gray-800 p-4">
          <div className="flex flex-wrap gap-2 mb-3">
            {quickActions.map((action) => (
              <button
                key={action.label}
                onClick={() => setInput(action.prompt)}
                className="px-3 py-1.5 text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                {action.label}
              </button>
            ))}
          </div>

          {selectedCode && (
            <div className="mb-3 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Selected code context
                </span>
                <button
                  onClick={() => setSelectedCode(null)}
                  className="text-xs text-red-500 hover:text-red-600"
                >
                  Remove
                </button>
              </div>
              <pre className="text-xs font-mono text-gray-700 dark:text-gray-300 overflow-x-auto">
                {selectedCode}
              </pre>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about the code..."
              className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <SendIcon />
            </button>
          </form>
        </div>
      </div>

      <div className="w-80 border-l border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-4 overflow-y-auto">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Code Context</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          Select code below to add context to your question
        </p>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
            <span className="text-xs font-mono text-gray-500 dark:text-gray-400">src/App.tsx</span>
          </div>
          <div className="p-3 font-mono text-xs overflow-x-auto">
            {mockCodeDiff.split("\n").map((line, i) => (
              <div
                key={i}
                onClick={() => {
                  const selectedLines = mockCodeDiff
                    .split("\n")
                    .slice(Math.max(0, i - 2), i + 3)
                    .join("\n");
                  setSelectedCode(selectedLines);
                }}
                className={`py-0.5 px-1 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded ${
                  line.startsWith("+") && !line.startsWith("+++")
                    ? "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20"
                    : line.startsWith("-") && !line.startsWith("---")
                      ? "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20"
                      : "text-gray-700 dark:text-gray-300"
                }`}
              >
                {line || " "}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function generateAIResponse(input: string): string {
  const lowerInput = input.toLowerCase();

  if (lowerInput.includes("explain")) {
    return `This code is implementing a React component that manages user authentication state.

**Key parts:**
1. \`useAuth()\` hook - Provides authentication context
2. \`isAuthenticated\` - Boolean flag for login status
3. Conditional rendering - Shows login button when not authenticated

The component uses the existing auth context to determine what UI to display to the user.`;
  }

  if (lowerInput.includes("issue") || lowerInput.includes("problem")) {
    return `I found a few potential issues:

1. **Missing error handling** - The \`navigate('/login')\` call could fail silently
2. **No loading state** - Users might click login multiple times
3. **Accessibility** - The button lacks proper ARIA labels

Would you like me to suggest fixes for any of these?`;
  }

  if (lowerInput.includes("improve") || lowerInput.includes("better")) {
    return `Here are some improvements I'd suggest:

\`\`\`typescript
const { user, isAuthenticated, isLoading } = useAuth();

if (isLoading) {
  return <LoadingSpinner />;
}

return (
  <div className="app">
    <h1>Welcome{isAuthenticated ? \`, \${user.name}\` : ''}</h1>
    {!isAuthenticated && (
      <button
        onClick={handleLogin}
        aria-label="Sign in to your account"
      >
        Login
      </button>
    )}
  </div>
);
\`\`\`

This adds loading state handling and improves accessibility.`;
  }

  if (lowerInput.includes("test")) {
    return `Here are some tests I'd recommend:

\`\`\`typescript
describe('App', () => {
  it('shows welcome message when authenticated', () => {
    // Mock useAuth to return authenticated state
    render(<App />);
    expect(screen.getByText(/Welcome, John/)).toBeInTheDocument();
  });

  it('shows login button when not authenticated', () => {
    // Mock useAuth to return unauthenticated state
    render(<App />);
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('navigates to login on button click', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button'));
    expect(navigate).toHaveBeenCalledWith('/login');
  });
});
\`\`\``;
  }

  return `I understand you're asking about "${input}".

Based on my analysis of this code review, I can help you with:
- Understanding what the code does
- Identifying potential issues or bugs
- Suggesting improvements or best practices
- Writing tests

Could you be more specific about what aspect you'd like me to focus on?`;
}

function SendIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
      />
    </svg>
  );
}
