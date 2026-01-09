import { useEffect, useRef, useState } from "react";

type Position = {
  x: number;
  y: number;
};

type CodeContextMenuProps = {
  selectedCode: string;
  position: Position;
  onClose: () => void;
  onAction: (action: string, code: string) => void;
};

const quickActions = [
  {
    id: "explain",
    label: "このコードを説明して",
    icon: "📖",
    description: "選択したコードの動作を説明",
  },
  {
    id: "edge-cases",
    label: "エッジケースを見つけて",
    icon: "🔍",
    description: "潜在的な問題を検出",
  },
  {
    id: "test-cases",
    label: "テストケースを生成",
    icon: "🧪",
    description: "ユニットテストを提案",
  },
  { id: "improve", label: "より良い書き方は?", icon: "✨", description: "リファクタリング提案" },
  { id: "behavior", label: "動作を確認", icon: "▶️", description: "特定の入力での動作を確認" },
  { id: "types", label: "型を確認", icon: "📐", description: "型の定義と使用を確認" },
];

export function CodeContextMenu({
  selectedCode,
  position,
  onClose,
  onAction,
}: CodeContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target;
      if (menuRef.current && target instanceof Node && !menuRef.current.contains(target)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  const adjustedPosition = {
    x: Math.min(position.x, window.innerWidth - 280),
    y: Math.min(position.y, window.innerHeight - 400),
  };

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 py-2 w-64 animate-scale-in"
      style={{
        left: adjustedPosition.x,
        top: adjustedPosition.y,
      }}
    >
      <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2 text-violet-600 dark:text-violet-400">
          <SparklesIcon className="w-4 h-4" />
          <span className="text-sm font-medium">AI アシスタント</span>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
          {selectedCode.slice(0, 30)}...
        </p>
      </div>

      <div className="py-1">
        {quickActions.map((action) => (
          <button
            key={action.id}
            type="button"
            onClick={() => {
              onAction(action.id, selectedCode);
              onClose();
            }}
            className="w-full flex items-start gap-3 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
          >
            <span className="text-base mt-0.5">{action.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900 dark:text-white">{action.label}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{action.description}</p>
            </div>
          </button>
        ))}
      </div>

      <div className="px-3 py-2 border-t border-gray-100 dark:border-gray-800">
        <div className="text-xs text-gray-400 dark:text-gray-500">
          💡 Tip: コードを選択してAIに質問できます
        </div>
      </div>
    </div>
  );
}

export function BehaviorTestPanel({ code, onClose }: { code: string; onClose: () => void }) {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleTest = () => {
    setIsLoading(true);
    setTimeout(() => {
      setResult(
        `入力: ${input || "(空)"}\n\n実行結果のシミュレーション:\n• 関数は正常に実行されます\n• 戻り値: ${input ? "true" : "false"}\n• 副作用: なし\n\n注意点:\n• nullが渡された場合、エラーが発生する可能性があります`
      );
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg mx-4 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl animate-scale-in overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">▶️</span>
              <h3 className="font-semibold text-gray-900 dark:text-white">動作確認</h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500"
            >
              <CloseIcon />
            </button>
          </div>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <div className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              対象コード
            </div>
            <div className="bg-gray-900 rounded-lg p-3 overflow-x-auto">
              <pre className="text-xs text-gray-300 font-mono">{code}</pre>
            </div>
          </div>

          <div>
            <label
              htmlFor="test-input"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              テスト入力
            </label>
            <input
              id="test-input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder='例: { userId: "123" }'
              className="w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-800 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 border-2 border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-gray-900 transition-all outline-none font-mono"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleTest}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <SpinnerIcon />
                  実行中...
                </>
              ) : (
                <>
                  <PlayIcon />
                  実行をシミュレート
                </>
              )}
            </button>
          </div>

          {result && (
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">結果</h4>
              <pre className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap font-mono">
                {result}
              </pre>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">よく使うテストケース:</span>
            <button
              type="button"
              onClick={() => setInput("null")}
              className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              null
            </button>
            <button
              type="button"
              onClick={() => setInput("undefined")}
              className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              undefined
            </button>
            <button
              type="button"
              onClick={() => setInput('""')}
              className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              空文字
            </button>
            <button
              type="button"
              onClick={() => setInput("[]")}
              className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              空配列
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CodeExplainPanel({ code, onClose }: { code: string; onClose: () => void }) {
  const [explanation, setExplanation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setExplanation(`## コードの説明

このコードは以下の処理を行っています:

### 1. 概要
選択されたコードは、主に状態管理と副作用の処理を行う部分です。

### 2. 詳細な動作
- **入力**: 関数は引数を受け取り、処理を開始します
- **処理**: 条件分岐を通じて、適切な結果を計算します
- **出力**: 計算結果を返却または状態を更新します

### 3. 注意点
- nullやundefinedの入力には注意が必要です
- 非同期処理の場合、エラーハンドリングを確認してください

### 4. 関連コード
- この関数は他の箇所から呼び出されている可能性があります
- 型定義を確認することで、期待される入出力を把握できます`);
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl mx-4 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl animate-scale-in overflow-hidden max-h-[80vh] flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">📖</span>
              <h3 className="font-semibold text-gray-900 dark:text-white">コード説明</h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500"
            >
              <CloseIcon />
            </button>
          </div>
        </div>

        <div className="p-4 overflow-y-auto flex-1">
          <div className="mb-4">
            <div className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              対象コード
            </div>
            <div className="bg-gray-900 rounded-lg p-3 overflow-x-auto">
              <pre className="text-xs text-gray-300 font-mono">{code}</pre>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                <SpinnerIcon />
                <span>分析中...</span>
              </div>
            </div>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {explanation}
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-800 shrink-0">
          <div className="flex gap-2">
            <button
              type="button"
              className="flex-1 px-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              もっと詳しく
            </button>
            <button
              type="button"
              className="flex-1 px-4 py-2 text-sm bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300 rounded-xl hover:bg-violet-200 dark:hover:bg-violet-900/70 transition-colors"
            >
              チャットで質問
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}
