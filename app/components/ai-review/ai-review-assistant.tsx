import { useState } from "react";

type Concern = {
  id: string;
  lineNumber: number;
  code: string;
  risk: "high" | "medium" | "low";
  title: string;
  reason: string;
  suggestedComments: {
    gentle: string;
    neutral: string;
    strict: string;
  };
  suggestedFix?: string;
};

type Tone = "gentle" | "neutral" | "strict";

type AIReviewAssistantProps = {
  concerns: Concern[];
  onPostComment: (lineNumber: number, comment: string) => void;
  onJumpToLine: (lineNumber: number) => void;
};

const mockConcerns: Concern[] = [
  {
    id: "1",
    lineNumber: 11,
    code: "const [user, setUser] = useState<any>(null);",
    risk: "medium",
    title: "any型の使用",
    reason:
      "any型は型安全性を損なうため、バグの温床になりやすいです。User型が定義されているなら、それを使うことで補完も効き、型チェックも働きます。",
    suggestedComments: {
      gentle: "ここ、User型使うともっと安全になりそう！型定義あったら教えて〜",
      neutral: "any型ではなくUser型を使用してください。型安全性の観点から推奨します。",
      strict: "[TYPE] any型は型安全性を損ないます。User | null に変更が必要です。",
    },
    suggestedFix: "const [user, setUser] = useState<User | null>(null);",
  },
  {
    id: "2",
    lineNumber: 15,
    code: "useEffect(() => {\n  fetchUser(userId);\n}, []);",
    risk: "high",
    title: "useEffectの依存配列が不完全",
    reason:
      "userIdが依存配列に含まれていないため、userIdが変更されても再fetchされません。古いデータが表示され続けるバグの原因になります。",
    suggestedComments: {
      gentle: "依存配列にuserIdを入れると、変更時に再取得されて良さそう！",
      neutral: "useEffectの依存配列にuserIdを追加してください。変更時に再実行されません。",
      strict: "[HOOKS] 依存配列が不完全です。userIdを追加しないとstale closureになります。",
    },
    suggestedFix: "useEffect(() => {\n  fetchUser(userId);\n}, [userId]);",
  },
  {
    id: "3",
    lineNumber: 30,
    code: "onClick={() => navigate('/login')}",
    risk: "high",
    title: "未定義の関数呼び出し",
    reason:
      "navigateがインポートされておらず、このコードは実行時エラーになります。react-routerのuseNavigateフックを使用する必要があります。",
    suggestedComments: {
      gentle: "navigateがimportされてないみたい、useNavigate使う感じかな？",
      neutral: "navigate関数が未定義です。useNavigateをインポートして使用してください。",
      strict:
        "[ERROR] 未定義関数の呼び出し。ランタイムエラーになります。useNavigateをインポートしてください。",
    },
    suggestedFix:
      "import { useNavigate } from 'react-router';\n// コンポーネント内で:\nconst navigate = useNavigate();",
  },
];

export function AIReviewAssistant({
  concerns = mockConcerns,
  onPostComment,
  onJumpToLine,
}: AIReviewAssistantProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [tone, setTone] = useState<Tone>("neutral");
  const [customComment, setCustomComment] = useState("");
  const [postedIds, setPostedIds] = useState<Set<string>>(new Set());
  const [skippedIds, setSkippedIds] = useState<Set<string>>(new Set());
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [followUpInput, setFollowUpInput] = useState("");

  const activeConcerns = concerns.filter((c) => !postedIds.has(c.id) && !skippedIds.has(c.id));
  const currentConcern = activeConcerns[currentIndex] || null;

  const handlePost = () => {
    if (!currentConcern) return;
    const comment = customComment || currentConcern.suggestedComments[tone];
    onPostComment(currentConcern.lineNumber, comment);
    setPostedIds((prev) => new Set([...prev, currentConcern.id]));
    setCustomComment("");
    setCurrentIndex(0);
  };

  const handleSkip = () => {
    if (!currentConcern) return;
    setSkippedIds((prev) => new Set([...prev, currentConcern.id]));
    setCustomComment("");
    setCurrentIndex(0);
  };

  const handleNext = () => {
    if (currentIndex < activeConcerns.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setCustomComment("");
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setCustomComment("");
    }
  };

  const riskColors = {
    high: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300",
    medium: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
    low: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
  };

  const riskLabels = {
    high: "要確認",
    medium: "注意",
    low: "提案",
  };

  const progressCount = postedIds.size + skippedIds.size;
  const totalCount = concerns.length;

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800">
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SparklesIcon className="w-5 h-5 text-violet-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white">レビューアシスタント</h3>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {progressCount}/{totalCount} 完了
          </div>
        </div>
        <div className="mt-2 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-violet-500 transition-all"
            style={{ width: `${(progressCount / totalCount) * 100}%` }}
          />
        </div>
      </div>

      {currentConcern ? (
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-0.5 text-xs font-medium rounded ${riskColors[currentConcern.risk]}`}
                >
                  {riskLabels[currentConcern.risk]}
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {currentConcern.title}
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30"
                >
                  <ChevronLeftIcon className="w-4 h-4" />
                </button>
                <span>
                  {currentIndex + 1}/{activeConcerns.length}
                </span>
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={currentIndex === activeConcerns.length - 1}
                  className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30"
                >
                  <ChevronRightIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onJumpToLine(currentConcern.lineNumber)}
              className="w-full text-left bg-gray-900 rounded-lg p-3 overflow-x-auto hover:ring-2 hover:ring-violet-500 transition-all"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-500">Line {currentConcern.lineNumber}</span>
                <span className="text-xs text-violet-400">クリックでジャンプ →</span>
              </div>
              <pre className="text-xs text-gray-300 font-mono whitespace-pre-wrap">
                {currentConcern.code}
              </pre>
            </button>

            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3 border border-amber-200 dark:border-amber-800">
              <div className="flex items-start gap-2">
                <WarningIcon className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                <div>
                  <div className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-1">
                    なぜ危険？
                  </div>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    {currentConcern.reason}
                  </p>
                </div>
              </div>
            </div>

            {currentConcern.suggestedFix && (
              <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-3 border border-emerald-200 dark:border-emerald-800">
                <div className="text-xs text-emerald-600 dark:text-emerald-400 mb-1">💡 修正案</div>
                <pre className="text-xs text-emerald-800 dark:text-emerald-200 font-mono whitespace-pre-wrap">
                  {currentConcern.suggestedFix}
                </pre>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  コメント提案
                </span>
                <div className="flex gap-1">
                  <ToneButton
                    tone="gentle"
                    currentTone={tone}
                    onClick={() => setTone("gentle")}
                    label="😊"
                  />
                  <ToneButton
                    tone="neutral"
                    currentTone={tone}
                    onClick={() => setTone("neutral")}
                    label="😐"
                  />
                  <ToneButton
                    tone="strict"
                    currentTone={tone}
                    onClick={() => setTone("strict")}
                    label="🔍"
                  />
                </div>
              </div>
              <textarea
                value={customComment || currentConcern.suggestedComments[tone]}
                onChange={(e) => setCustomComment(e.target.value)}
                rows={3}
                className="w-full p-3 text-sm bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-2">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSkip}
                className="flex-1 px-4 py-2.5 text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                スキップ
              </button>
              <button
                type="button"
                onClick={handlePost}
                className="flex-1 px-4 py-2.5 text-sm bg-violet-600 text-white rounded-xl hover:bg-violet-700 transition-colors flex items-center justify-center gap-2"
              >
                <SendIcon className="w-4 h-4" />
                コメント投稿
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowFollowUp(!showFollowUp)}
              className="w-full text-center text-xs text-gray-500 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 py-1"
            >
              {showFollowUp ? "閉じる" : "💬 この件についてもっと聞く"}
            </button>

            {showFollowUp && (
              <div className="pt-2 space-y-2">
                <div className="flex flex-wrap gap-1">
                  {["これは本当に問題？", "他に影響ある？", "どう直せばいい？"].map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setFollowUpInput(q)}
                      className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                    >
                      {q}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={followUpInput}
                    onChange={(e) => setFollowUpInput(e.target.value)}
                    placeholder="質問を入力..."
                    className="flex-1 px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-500 text-gray-900 dark:text-white"
                  />
                  <button
                    type="button"
                    disabled={!followUpInput.trim()}
                    className="px-3 py-2 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
                  >
                    聞く
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4">
            <CheckIcon className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            レビュー完了！
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {postedIds.size}件のコメントを投稿しました
            <br />
            {skippedIds.size}件をスキップしました
          </p>
          <button
            type="button"
            onClick={() => {
              setPostedIds(new Set());
              setSkippedIds(new Set());
              setCurrentIndex(0);
            }}
            className="text-sm text-violet-600 dark:text-violet-400 hover:underline"
          >
            最初からやり直す
          </button>
        </div>
      )}
    </div>
  );
}

function ToneButton({
  tone,
  currentTone,
  onClick,
  label,
}: {
  tone: Tone;
  currentTone: Tone;
  onClick: () => void;
  label: string;
}) {
  const isActive = tone === currentTone;
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all text-sm ${
        isActive
          ? "bg-violet-100 dark:bg-violet-900/50 ring-2 ring-violet-500"
          : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
      }`}
    >
      {label}
    </button>
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

function WarningIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
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

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}
