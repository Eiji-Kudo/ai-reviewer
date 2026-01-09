import { useRef, useState } from "react";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  codeContext?: {
    filePath: string;
    lineNumber: number;
    code: string;
  };
};

type AIChatPanelProps = {
  initialContext?: string;
  onJumpToCode?: (filePath: string, line: number) => void;
};

const quickActions = [
  { label: "この変更を説明して", icon: "📖" },
  { label: "エッジケースを教えて", icon: "🔍" },
  { label: "テストケースを提案して", icon: "🧪" },
  { label: "より良い書き方は?", icon: "✨" },
];

export function AIChatPanel({ initialContext, onJumpToCode }: AIChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "このPRについて質問があればどうぞ。コードを選択して質問することもできます。",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    requestAnimationFrame(scrollToBottom);

    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: generateMockResponse(content),
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsLoading(false);
      requestAnimationFrame(scrollToBottom);
    }, 1000);
  };

  const handleQuickAction = (action: string) => {
    handleSend(action);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800">
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <SparklesIcon className="w-5 h-5 text-violet-500" />
          <h3 className="font-semibold text-gray-900 dark:text-white">AI Assistant</h3>
        </div>
        {initialContext && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
            コンテキスト: {initialContext}
          </p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                message.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
              }`}
            >
              {message.codeContext && (
                <button
                  type="button"
                  onClick={() =>
                    onJumpToCode?.(message.codeContext!.filePath, message.codeContext!.lineNumber)
                  }
                  className="block w-full mb-2 p-2 bg-gray-900/20 rounded-lg text-xs font-mono text-left hover:bg-gray-900/30 transition-colors"
                >
                  <div className="text-gray-400 mb-1">
                    {message.codeContext.filePath}:{message.codeContext.lineNumber}
                  </div>
                  <code className="text-gray-200">{message.codeContext.code}</code>
                </button>
              )}
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-3">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <span
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                />
                <span
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-3">
        <div className="flex flex-wrap gap-1.5">
          {quickActions.map((action) => (
            <button
              key={action.label}
              type="button"
              onClick={() => handleQuickAction(action.label)}
              className="px-2.5 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-1"
            >
              <span>{action.icon}</span>
              <span>{action.label}</span>
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend(input)}
            placeholder="質問を入力..."
            className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 border-2 border-transparent focus:border-violet-500 focus:bg-white dark:focus:bg-gray-900 transition-all outline-none"
          />
          <button
            type="button"
            onClick={() => handleSend(input)}
            disabled={!input.trim() || isLoading}
            className="p-2.5 bg-violet-600 text-white rounded-xl hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <SendIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function generateMockResponse(question: string): string {
  if (question.includes("説明")) {
    return "この変更は、ユーザー認証フローを実装しています。\n\n主な変更点:\n1. useAuthフックでセッション管理\n2. Loginコンポーネントでフォーム処理\n3. AuthContextでグローバル状態管理\n\n影響範囲: App.tsx、routes.ts";
  }
  if (question.includes("エッジケース")) {
    return "以下のエッジケースを考慮する必要があります:\n\n1. **ネットワークエラー**: fetchが失敗した場合のハンドリング\n2. **セッション切れ**: トークン有効期限切れ時の再認証\n3. **同時ログイン**: 別デバイスでのログイン時の処理\n4. **空入力**: バリデーション前のsubmit";
  }
  if (question.includes("テスト")) {
    return "推奨するテストケース:\n\n```typescript\ndescribe('useAuth', () => {\n  it('正常にログインできる', async () => {\n    // ...\n  });\n  \n  it('無効な認証情報でエラー', async () => {\n    // ...\n  });\n  \n  it('セッション切れで再認証', async () => {\n    // ...\n  });\n});\n```";
  }
  if (question.includes("書き方")) {
    return "いくつかの改善提案があります:\n\n1. **カスタムフックの抽出**: ログインロジックをuseLoginに分離\n2. **エラーハンドリング**: try-catchでより詳細なエラー処理\n3. **型安全性**: User型の明示的な定義\n\n詳しく知りたい部分はありますか?";
  }
  return "その質問について確認しました。\n\nこのPRの変更内容を踏まえると、特に認証フローの実装に関して注意が必要です。\n\n他に気になる点があればお聞きください。";
}

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
      />
    </svg>
  );
}

function SendIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
      />
    </svg>
  );
}
