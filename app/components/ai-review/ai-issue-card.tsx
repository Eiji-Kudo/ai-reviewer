import { useState } from "react";
import type { AIIssue } from "~/data/mock";

type AIIssueCardProps = {
  issue: AIIssue;
  onCreateComment: (issue: AIIssue) => void;
  onJumpToCode: (filePath: string, line: number) => void;
};

export function AIIssueCard({ issue, onCreateComment, onJumpToCode }: AIIssueCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showTryFix, setShowTryFix] = useState(false);
  const [customFix, setCustomFix] = useState(issue.suggestion?.code || "");
  const [aiEvaluation, setAiEvaluation] = useState<string | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  const typeConfig = {
    error: {
      bg: "bg-red-50 dark:bg-red-900/20",
      border: "border-red-200 dark:border-red-800/50",
      icon: "text-red-500",
      badge: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300",
    },
    warning: {
      bg: "bg-amber-50 dark:bg-amber-900/20",
      border: "border-amber-200 dark:border-amber-800/50",
      icon: "text-amber-500",
      badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
    },
    info: {
      bg: "bg-blue-50 dark:bg-blue-900/20",
      border: "border-blue-200 dark:border-blue-800/50",
      icon: "text-blue-500",
      badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
    },
    suggestion: {
      bg: "bg-violet-50 dark:bg-violet-900/20",
      border: "border-violet-200 dark:border-violet-800/50",
      icon: "text-violet-500",
      badge: "bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300",
    },
  };

  const config = typeConfig[issue.type];

  const handleEvaluateFix = () => {
    setIsEvaluating(true);
    setTimeout(() => {
      setAiEvaluation(
        "この修正は適切です。依存配列にuserIdを追加することで、userIdが変更された際に副作用が正しく再実行されます。"
      );
      setIsEvaluating(false);
    }, 1000);
  };

  return (
    <div
      className={`rounded-xl border ${config.border} ${config.bg} overflow-hidden animate-fade-in`}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <span className={`mt-0.5 ${config.icon}`}>
            {issue.type === "error" ? (
              <ErrorIcon />
            ) : issue.type === "warning" ? (
              <WarningIcon />
            ) : issue.type === "info" ? (
              <InfoIcon />
            ) : (
              <SuggestionIcon />
            )}
          </span>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium text-gray-900 dark:text-white text-sm">{issue.title}</h3>
              <span className={`text-xs px-2 py-0.5 rounded-full ${config.badge}`}>
                {issue.type === "error"
                  ? "エラー"
                  : issue.type === "warning"
                    ? "警告"
                    : issue.type === "info"
                      ? "情報"
                      : "提案"}
              </span>
            </div>

            <button
              type="button"
              onClick={() => onJumpToCode(issue.filePath, issue.lineNumber)}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-mono mb-2 flex items-center gap-1"
            >
              <FileIcon className="w-3 h-3" />
              {issue.filePath}:{issue.lineNumber}
            </button>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{issue.description}</p>

            <div className="bg-gray-900 rounded-lg p-3 mb-3 overflow-x-auto">
              <pre className="text-xs text-gray-300 font-mono">{issue.codeSnippet}</pre>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-xs px-3 py-1.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-1"
              >
                {isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
                {issue.suggestion ? "提案を見る" : "詳細"}
              </button>

              <button
                type="button"
                onClick={() => setShowTryFix(!showTryFix)}
                className="text-xs px-3 py-1.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-1"
              >
                <EditIcon />
                試行錯誤
              </button>

              <button
                type="button"
                onClick={() => onCreateComment(issue)}
                className="text-xs px-3 py-1.5 rounded-lg bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300 hover:bg-violet-200 dark:hover:bg-violet-900/70 transition-colors flex items-center gap-1"
              >
                <CommentIcon />
                コメント作成
              </button>

              {issue.relatedSymbols && issue.relatedSymbols.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-xs px-3 py-1.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-1"
                >
                  <LinkIcon />
                  関連コード
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {isExpanded && issue.suggestion && (
        <div className="px-4 pb-4 pt-0">
          <div className="border-t border-gray-200 dark:border-gray-700/50 pt-4">
            <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              AIの提案
            </h4>
            <div className="bg-emerald-900/90 rounded-lg p-3 mb-2 overflow-x-auto">
              <pre className="text-xs text-emerald-300 font-mono">{issue.suggestion.code}</pre>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {issue.suggestion.explanation}
            </p>
          </div>

          {issue.relatedSymbols && issue.relatedSymbols.length > 0 && (
            <div className="border-t border-gray-200 dark:border-gray-700/50 pt-4 mt-4">
              <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                関連コード
              </h4>
              <div className="space-y-1">
                {issue.relatedSymbols.map((symbol) => (
                  <button
                    key={`${symbol.name}-${symbol.location}`}
                    type="button"
                    onClick={() => {
                      const [file, line] = symbol.location.split(":");
                      onJumpToCode(file, parseInt(line, 10));
                    }}
                    className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors text-left"
                  >
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {symbol.type === "definition"
                        ? "定義"
                        : symbol.type === "usage"
                          ? "使用"
                          : "型"}
                    </span>
                    <span className="text-sm font-mono text-gray-900 dark:text-white">
                      {symbol.name}
                    </span>
                    <span className="text-xs text-blue-600 dark:text-blue-400 font-mono ml-auto">
                      {symbol.location}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {showTryFix && (
        <div className="px-4 pb-4 pt-0">
          <div className="border-t border-gray-200 dark:border-gray-700/50 pt-4">
            <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              修正を試す
            </h4>
            <textarea
              value={customFix}
              onChange={(e) => setCustomFix(e.target.value)}
              className="w-full h-24 bg-gray-900 text-gray-300 font-mono text-xs p-3 rounded-lg border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none"
              placeholder="修正案を入力..."
            />
            <div className="flex items-center gap-2 mt-2">
              <button
                type="button"
                onClick={handleEvaluateFix}
                disabled={isEvaluating}
                className="text-xs px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center gap-1 disabled:opacity-50"
              >
                {isEvaluating ? (
                  <>
                    <SpinnerIcon />
                    評価中...
                  </>
                ) : (
                  <>
                    <SparklesIcon />
                    AIに評価してもらう
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setCustomFix(issue.suggestion?.code || "")}
                className="text-xs px-3 py-1.5 rounded-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                提案をコピー
              </button>
            </div>

            {aiEvaluation && (
              <div className="mt-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800/50">
                <div className="flex items-start gap-2">
                  <SparklesIcon className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                  <p className="text-sm text-emerald-700 dark:text-emerald-300">{aiEvaluation}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ErrorIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
      />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

function SuggestionIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
      />
    </svg>
  );
}

function FileIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function ChevronUpIcon() {
  return (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
      />
    </svg>
  );
}

function CommentIcon() {
  return (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
      />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
      />
    </svg>
  );
}

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg className={className || "w-3 h-3"} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
      />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}
