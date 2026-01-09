import type { AISummary } from "~/data/mock";

type AISummaryPanelProps = {
  summary: AISummary;
  onAskMore: () => void;
};

export function AISummaryPanel({ summary, onAskMore }: AISummaryPanelProps) {
  const riskColors = {
    low: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300",
    medium: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
    high: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300",
  };

  const riskLabels = {
    low: "低リスク",
    medium: "中リスク",
    high: "高リスク",
  };

  const severityIcons = {
    error: "text-red-500",
    warning: "text-amber-500",
    info: "text-blue-500",
  };

  return (
    <div className="card overflow-hidden animate-fade-in">
      <div className="p-4 bg-gradient-to-r from-violet-500/10 to-blue-500/10 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SparklesIcon className="w-5 h-5 text-violet-500" />
            <h2 className="font-semibold text-gray-900 dark:text-white">AI分析サマリー</h2>
          </div>
          <span
            className={`px-2.5 py-1 text-xs font-medium rounded-full ${riskColors[summary.riskLevel]}`}
          >
            {riskLabels[summary.riskLevel]}
          </span>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div>
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            {summary.overview}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              構造の変更
            </h3>
            <ul className="space-y-1">
              {summary.structureChanges.map((change) => (
                <li
                  key={change}
                  className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400"
                >
                  <span className="text-violet-500 mt-0.5">•</span>
                  {change}
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              影響範囲
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {summary.impactedAreas.map((area) => (
                <span
                  key={area}
                  className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-md font-mono"
                >
                  {area}
                </span>
              ))}
            </div>
          </div>
        </div>

        {summary.conventionIssues.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              規約チェック
            </h3>
            <div className="space-y-1.5">
              {summary.conventionIssues.map((issue) => (
                <div
                  key={`${issue.severity}-${issue.location}`}
                  className="flex items-center gap-2 text-sm p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50"
                >
                  <span className={severityIcons[issue.severity]}>
                    {issue.severity === "error" ? (
                      <ErrorIcon />
                    ) : issue.severity === "warning" ? (
                      <WarningIcon />
                    ) : (
                      <InfoIcon />
                    )}
                  </span>
                  <span className="flex-1 text-gray-700 dark:text-gray-300">{issue.message}</span>
                  <button
                    type="button"
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-mono"
                  >
                    {issue.location}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {summary.testSuggestions.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              テスト提案
            </h3>
            <ul className="space-y-1">
              {summary.testSuggestions.map((test) => (
                <li
                  key={test}
                  className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400"
                >
                  <CheckIcon className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                  {test}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
          <button
            type="button"
            onClick={onAskMore}
            className="text-sm text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 font-medium flex items-center gap-1 group"
          >
            詳しく聞く
            <ArrowRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </button>
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
        strokeWidth={1.5}
        d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
      />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}
