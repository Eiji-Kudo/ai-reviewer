import { useState } from "react";
import { useParams } from "react-router";
import { AIChatPanel } from "~/components/ai-review/ai-chat-panel";
import {
  CodeContextMenu,
  BehaviorTestPanel,
  CodeExplainPanel,
} from "~/components/ai-review/code-context-menu";
import {
  mockFullFileContent,
  mockLineSuggestions,
  mockComments,
  mockFileChanges,
  mockFileTree,
  type LineSuggestion,
  type FileTreeNode,
} from "~/data/mock";

type ContextMenuState = {
  isOpen: boolean;
  code: string;
  position: { x: number; y: number };
};

type Tone = "gentle" | "neutral" | "strict";

export default function ReviewFiles() {
  const { id } = useParams();
  const [selectedFile, setSelectedFile] = useState(mockFileChanges[0]);
  const [showAIPanel, setShowAIPanel] = useState(true);
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    isOpen: false,
    code: "",
    position: { x: 0, y: 0 },
  });
  const [showBehaviorTest, setShowBehaviorTest] = useState(false);
  const [showExplain, setShowExplain] = useState(false);
  const [activeCode, setActiveCode] = useState("");
  const [postedComments, setPostedComments] = useState<number[]>([]);

  const fileComments = mockComments.filter(
    (c) => c.reviewId === id && c.filePath === selectedFile.path
  );

  const handleJumpToCode = (filePath: string, line: number) => {
    const file = mockFileChanges.find((f) => f.path.includes(filePath.split("/").pop() || ""));
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleCodeSelection = (code: string, event: React.MouseEvent) => {
    if (code.trim()) {
      setContextMenu({
        isOpen: true,
        code,
        position: { x: event.clientX, y: event.clientY },
      });
      setSelectedCode(code);
    }
  };

  const handleContextAction = (action: string, code: string) => {
    setActiveCode(code);
    switch (action) {
      case "behavior":
        setShowBehaviorTest(true);
        break;
      case "explain":
        setShowExplain(true);
        break;
      default:
        setSelectedCode(`${action}: ${code}`);
        break;
    }
  };

  const handlePostComment = (lineNumber: number) => {
    setPostedComments((prev) => [...prev, lineNumber]);
  };

  return (
    <div className="flex h-full">
      <div className="w-64 border-r border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 overflow-y-auto shrink-0">
        <div className="p-3 border-b border-gray-200 dark:border-gray-800">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Changed Files</h3>
        </div>
        <div className="p-2">
          {mockFileChanges.map((file) => {
            const hasSuggestions = file.path.includes("App.tsx");
            return (
              <button
                type="button"
                key={file.path}
                onClick={() => setSelectedFile(file)}
                className={`w-full text-left p-2 rounded-lg text-sm transition-colors ${
                  selectedFile.path === file.path
                    ? "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <div className="flex items-center gap-2">
                  <FileStatusIcon status={file.status} />
                  <span className="truncate font-mono text-xs">{file.path.split("/").pop()}</span>
                  {hasSuggestions && (
                    <span className="ml-auto px-1.5 py-0.5 text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300 rounded">
                      3
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1 ml-6 text-xs">
                  <span className="text-green-600 dark:text-green-400">+{file.additions}</span>
                  <span className="text-red-600 dark:text-red-400">-{file.deletions}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm text-gray-900 dark:text-white">{selectedFile.path}</span>
            <span
              className={`px-2 py-0.5 text-xs rounded ${
                selectedFile.status === "added"
                  ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                  : selectedFile.status === "deleted"
                    ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                    : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
              }`}
            >
              {selectedFile.status}
            </span>
            {selectedFile.path.includes("App.tsx") && (
              <span className="px-2 py-0.5 text-xs rounded bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300 flex items-center gap-1">
                <SparklesIcon className="w-3 h-3" />
                {mockLineSuggestions.length - postedComments.length} suggestions
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowAIPanel(!showAIPanel)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                showAIPanel
                  ? "bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <SparklesIcon className="w-3.5 h-3.5" />
              AI Chat
            </button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          <div className={`${showAIPanel ? "flex-1" : "w-full"} overflow-auto bg-white dark:bg-gray-950`}>
            <FullFileView
              content={mockFullFileContent}
              suggestions={mockLineSuggestions}
              postedComments={postedComments}
              onSelectCode={handleCodeSelection}
              onPostComment={handlePostComment}
            />
          </div>

          {showAIPanel && (
            <div className="w-96 shrink-0">
              <AIChatPanel
                initialContext={selectedCode || selectedFile.path}
                onJumpToCode={handleJumpToCode}
              />
            </div>
          )}
        </div>
      </div>

      {contextMenu.isOpen && (
        <CodeContextMenu
          selectedCode={contextMenu.code}
          position={contextMenu.position}
          onClose={() => setContextMenu({ ...contextMenu, isOpen: false })}
          onAction={handleContextAction}
        />
      )}

      {showBehaviorTest && (
        <BehaviorTestPanel code={activeCode} onClose={() => setShowBehaviorTest(false)} />
      )}

      {showExplain && (
        <CodeExplainPanel code={activeCode} onClose={() => setShowExplain(false)} />
      )}
    </div>
  );
}

function FullFileView({
  content,
  suggestions,
  postedComments,
  onSelectCode,
  onPostComment,
}: {
  content: string;
  suggestions: LineSuggestion[];
  postedComments: number[];
  onSelectCode: (code: string, event: React.MouseEvent) => void;
  onPostComment: (lineNumber: number) => void;
}) {
  const lines = content.split("\n");

  const handleTextSelection = (event: React.MouseEvent) => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim()) {
      onSelectCode(selection.toString(), event);
    }
  };

  return (
    <div className="font-mono text-sm" onMouseUp={handleTextSelection}>
      {lines.map((line, index) => {
        const lineNumber = index + 1;
        const suggestion = suggestions.find((s) => s.lineNumber === lineNumber);
        const isPosted = postedComments.includes(lineNumber);

        return (
          <div key={index}>
            <div className="group flex hover:bg-gray-50 dark:hover:bg-gray-900/50">
              <div className="w-12 flex-shrink-0 px-2 py-0.5 text-right text-gray-400 dark:text-gray-600 select-none border-r border-gray-200 dark:border-gray-800">
                {lineNumber}
              </div>
              <div className="flex-shrink-0 w-8 flex items-center justify-center">
                {suggestion && !isPosted ? (
                  <span
                    className={`${
                      suggestion.type === "error"
                        ? "text-red-500"
                        : suggestion.type === "warning"
                          ? "text-amber-500"
                          : "text-blue-500"
                    }`}
                  >
                    <IndicatorIcon type={suggestion.type} />
                  </span>
                ) : (
                  <button
                    type="button"
                    className="opacity-0 group-hover:opacity-100 w-5 h-5 rounded bg-blue-500 text-white flex items-center justify-center text-xs hover:bg-blue-600 transition-opacity"
                  >
                    +
                  </button>
                )}
              </div>
              <pre className="flex-1 px-4 py-0.5 overflow-x-auto text-gray-800 dark:text-gray-200">
                {line || " "}
              </pre>
            </div>

            {suggestion && !isPosted && (
              <InlineSuggestion
                suggestion={suggestion}
                onPost={() => onPostComment(lineNumber)}
              />
            )}

            {isPosted && suggestion && (
              <div className="ml-12 py-2 px-4 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500">
                <div className="flex items-center gap-2 text-green-700 dark:text-green-300 text-xs">
                  <CheckIcon className="w-4 h-4" />
                  <span>コメントを投稿しました</span>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function InlineSuggestion({
  suggestion,
  onPost,
}: {
  suggestion: LineSuggestion;
  onPost: () => void;
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [tone, setTone] = useState<Tone>("neutral");
  const [customComment, setCustomComment] = useState("");

  const currentComment = customComment || suggestion.suggestedComment?.[tone] || "";

  const typeConfig = {
    error: {
      bg: "bg-red-50 dark:bg-red-900/20",
      border: "border-red-300 dark:border-red-800",
      icon: "text-red-500",
      label: "エラー",
    },
    warning: {
      bg: "bg-amber-50 dark:bg-amber-900/20",
      border: "border-amber-300 dark:border-amber-800",
      icon: "text-amber-500",
      label: "警告",
    },
    info: {
      bg: "bg-blue-50 dark:bg-blue-900/20",
      border: "border-blue-300 dark:border-blue-800",
      icon: "text-blue-500",
      label: "情報",
    },
    suggestion: {
      bg: "bg-violet-50 dark:bg-violet-900/20",
      border: "border-violet-300 dark:border-violet-800",
      icon: "text-violet-500",
      label: "提案",
    },
  };

  const config = typeConfig[suggestion.type];

  return (
    <div className={`ml-12 mr-4 my-2 rounded-lg border-l-4 ${config.border} ${config.bg} overflow-hidden`}>
      <div className="p-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2 flex-1">
            <span className={`mt-0.5 ${config.icon}`}>
              <SparklesIcon className="w-4 h-4" />
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {suggestion.title}
                </span>
                <span className={`text-xs px-1.5 py-0.5 rounded ${config.bg} ${config.icon}`}>
                  {config.label}
                </span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">{suggestion.description}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            {isExpanded ? "閉じる" : "開く"}
          </button>
        </div>

        {isExpanded && (
          <div className="mt-3 space-y-3">
            {suggestion.suggestedCode && (
              <div className="bg-gray-900 rounded-lg p-3 overflow-x-auto">
                <div className="text-xs text-gray-500 mb-1">💡 修正案:</div>
                <pre className="text-xs text-emerald-300">{suggestion.suggestedCode}</pre>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">コメントのトーン:</span>
                <div className="flex gap-1">
                  <ToneButton
                    tone="gentle"
                    currentTone={tone}
                    onClick={() => {
                      setTone("gentle");
                      setCustomComment("");
                    }}
                    label="😊"
                  />
                  <ToneButton
                    tone="neutral"
                    currentTone={tone}
                    onClick={() => {
                      setTone("neutral");
                      setCustomComment("");
                    }}
                    label="😐"
                  />
                  <ToneButton
                    tone="strict"
                    currentTone={tone}
                    onClick={() => {
                      setTone("strict");
                      setCustomComment("");
                    }}
                    label="🔍"
                  />
                </div>
              </div>

              <div className="relative">
                <textarea
                  value={currentComment}
                  onChange={(e) => setCustomComment(e.target.value)}
                  className="w-full p-2 text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                  rows={2}
                  placeholder="コメントを編集..."
                />
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 flex items-center gap-1"
                >
                  <CopyIcon className="w-3 h-3" />
                  コピー
                </button>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    スキップ
                  </button>
                  <button
                    type="button"
                    onClick={onPost}
                    className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1"
                  >
                    <SendIcon className="w-3 h-3" />
                    コメント投稿
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
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
      className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
        isActive
          ? "bg-blue-100 dark:bg-blue-900/50 ring-2 ring-blue-500"
          : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
      }`}
    >
      {label}
    </button>
  );
}

function FileStatusIcon({ status }: { status: "added" | "modified" | "deleted" }) {
  if (status === "added") {
    return (
      <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
    );
  }
  if (status === "deleted") {
    return (
      <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
      </svg>
    );
  }
  return (
    <svg className="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
      />
    </svg>
  );
}

function IndicatorIcon({ type }: { type: "error" | "warning" | "info" | "suggestion" }) {
  if (type === "error") {
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

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
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
