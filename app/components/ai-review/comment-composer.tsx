import { useState } from "react";
import type { AIIssue } from "~/data/mock";

type Tone = "gentle" | "neutral" | "strict";

type CommentComposerProps = {
  issue: AIIssue;
  onClose: () => void;
  onSubmit: (comment: { content: string; suggestion?: string }) => void;
};

const toneTemplates: Record<Tone, (issue: AIIssue) => string> = {
  gentle: (issue) =>
    `ここ、${issue.title.replace("の", "が気になりました！")} \n\n${issue.suggestion ? `こんな感じはどうでしょう？` : ""}`,
  neutral: (issue) =>
    `${issue.title}が見つかりました。\n\n${issue.description}\n\n${issue.suggestion ? `以下の修正を検討してください。` : ""}`,
  strict: (issue) =>
    `[${issue.type.toUpperCase()}] ${issue.title}\n\n${issue.description}\n\n${issue.suggestion ? `修正が必要です。` : "この問題は解決する必要があります。"}`,
};

export function CommentComposer({ issue, onClose, onSubmit }: CommentComposerProps) {
  const [tone, setTone] = useState<Tone>("neutral");
  const [content, setContent] = useState(toneTemplates.neutral(issue));
  const [includeSuggestion, setIncludeSuggestion] = useState(!!issue.suggestion);

  const handleToneChange = (newTone: Tone) => {
    setTone(newTone);
    setContent(toneTemplates[newTone](issue));
  };

  const handleSubmit = () => {
    onSubmit({
      content,
      suggestion: includeSuggestion ? issue.suggestion?.code : undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl mx-4 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl animate-scale-in overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900/50 flex items-center justify-center">
                <CommentIcon className="w-5 h-5 text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  レビューコメントを作成
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                  {issue.filePath}:{issue.lineNumber}
                </p>
              </div>
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

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              トーン
            </label>
            <div className="flex gap-2">
              <ToneButton
                tone="gentle"
                currentTone={tone}
                onClick={() => handleToneChange("gentle")}
                emoji="😊"
                label="やさしめ"
              />
              <ToneButton
                tone="neutral"
                currentTone={tone}
                onClick={() => handleToneChange("neutral")}
                emoji="😐"
                label="ニュートラル"
              />
              <ToneButton
                tone="strict"
                currentTone={tone}
                onClick={() => handleToneChange("strict")}
                emoji="🔍"
                label="厳密"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              コメント内容
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
              className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm text-gray-900 dark:text-white border-2 border-transparent focus:border-violet-500 focus:bg-white dark:focus:bg-gray-900 transition-all outline-none resize-none"
              placeholder="コメントを入力..."
            />
          </div>

          {issue.suggestion && (
            <div>
              <label className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  checked={includeSuggestion}
                  onChange={(e) => setIncludeSuggestion(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  コード提案を含める (suggestion形式)
                </span>
              </label>

              {includeSuggestion && (
                <div className="bg-gray-900 rounded-lg p-3 overflow-x-auto">
                  <div className="text-xs text-gray-500 mb-1">```suggestion</div>
                  <pre className="text-xs text-emerald-300 font-mono">{issue.suggestion.code}</pre>
                  <div className="text-xs text-gray-500 mt-1">```</div>
                </div>
              )}
            </div>
          )}

          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
            <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              プレビュー
            </h4>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{content}</p>
              {includeSuggestion && issue.suggestion && (
                <div className="mt-2 bg-gray-900 rounded-lg p-3 overflow-x-auto">
                  <pre className="text-xs text-emerald-300 font-mono">{issue.suggestion.code}</pre>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            GitHubのsuggestion形式で投稿されます
          </p>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="btn-ghost text-sm">
              キャンセル
            </button>
            <button type="button" onClick={handleSubmit} className="btn-primary text-sm">
              コメントを追加
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ToneButton({
  tone,
  currentTone,
  onClick,
  emoji,
  label,
}: {
  tone: Tone;
  currentTone: Tone;
  onClick: () => void;
  emoji: string;
  label: string;
}) {
  const isActive = tone === currentTone;
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all ${
        isActive
          ? "bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300 ring-2 ring-violet-500"
          : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
      }`}
    >
      <span>{emoji}</span>
      <span>{label}</span>
    </button>
  );
}

function CommentIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
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
