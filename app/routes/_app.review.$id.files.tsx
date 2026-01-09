import { useRef, useState } from "react";
import { useParams } from "react-router";
import { AIReviewAssistant } from "~/components/ai-review/ai-review-assistant";
import {
  BehaviorTestPanel,
  CodeContextMenu,
  CodeExplainPanel,
} from "~/components/ai-review/code-context-menu";
import {
  type FileTreeNode,
  type LineSuggestion,
  mockFileChanges,
  mockFileTree,
  mockFullFileContent,
  mockLineSuggestions,
} from "~/data/mock";

type ContextMenuState = {
  isOpen: boolean;
  code: string;
  position: { x: number; y: number };
};

type Tone = "gentle" | "neutral" | "strict";

function getDefaultExpandedFolders(
  nodes: FileTreeNode[],
  result: Set<string> = new Set()
): Set<string> {
  for (const node of nodes) {
    if (node.type === "folder" && node.children) {
      const hasChangedFile = node.children.some(
        (child) => child.status || (child.type === "folder" && child.children)
      );
      if (hasChangedFile) {
        result.add(node.path);
        getDefaultExpandedFolders(node.children, result);
      }
    }
  }
  return result;
}

export default function ReviewFiles() {
  const { id: _reviewId } = useParams();
  const [selectedFile, setSelectedFile] = useState(mockFileChanges[0]);
  const [showAIPanel, setShowAIPanel] = useState(true);
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    isOpen: false,
    code: "",
    position: { x: 0, y: 0 },
  });
  const [showBehaviorTest, setShowBehaviorTest] = useState(false);
  const [showExplain, setShowExplain] = useState(false);
  const [activeCode, setActiveCode] = useState("");
  const [postedComments, setPostedComments] = useState<number[]>([]);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(() =>
    getDefaultExpandedFolders(mockFileTree)
  );
  const [showChangedOnly, setShowChangedOnly] = useState(true);
  const [highlightedLine, setHighlightedLine] = useState<number | null>(null);
  const codeViewRef = useRef<HTMLDivElement>(null);

  const handleJumpToLine = (lineNumber: number) => {
    setHighlightedLine(lineNumber);
    const lineElement = document.getElementById(`line-${lineNumber}`);
    if (lineElement && codeViewRef.current) {
      lineElement.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => setHighlightedLine(null), 2000);
    }
  };

  const handlePostCommentFromAssistant = (lineNumber: number, _comment: string) => {
    setPostedComments((prev) => [...prev, lineNumber]);
    handleJumpToLine(lineNumber);
  };

  const handleCodeSelection = (code: string, event: React.MouseEvent) => {
    if (code.trim()) {
      setContextMenu({
        isOpen: true,
        code,
        position: { x: event.clientX, y: event.clientY },
      });
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
        break;
    }
  };

  const handlePostComment = (lineNumber: number) => {
    setPostedComments((prev) => [...prev, lineNumber]);
  };

  const toggleFolder = (path: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const handleFileSelect = (node: FileTreeNode) => {
    const fileChange = mockFileChanges.find((f) => f.path === node.path);
    if (fileChange) {
      setSelectedFile(fileChange);
    }
  };

  return (
    <div className="flex h-full">
      <div className="w-72 border-r border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 overflow-y-auto shrink-0 flex flex-col">
        <div className="p-3 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Explorer</h3>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setExpandedFolders(getDefaultExpandedFolders(mockFileTree))}
                className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                title="変更ファイルに折りたたむ"
              >
                <CollapseIcon className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  const all = new Set<string>();
                  const expandAll = (nodes: FileTreeNode[]) => {
                    for (const n of nodes) {
                      if (n.type === "folder") {
                        all.add(n.path);
                        if (n.children) expandAll(n.children);
                      }
                    }
                  };
                  expandAll(mockFileTree);
                  setExpandedFolders(all);
                }}
                className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                title="すべて展開"
              >
                <ExpandIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowChangedOnly(!showChangedOnly)}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                showChangedOnly
                  ? "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
              }`}
            >
              変更のみ
            </button>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {mockFileChanges.length} files changed
            </span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto py-1">
          <FileTree
            nodes={mockFileTree}
            expandedFolders={expandedFolders}
            selectedPath={selectedFile.path}
            showChangedOnly={showChangedOnly}
            onToggle={toggleFolder}
            onSelect={handleFileSelect}
          />
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm text-gray-900 dark:text-white">
              {selectedFile.path}
            </span>
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
          <div
            ref={codeViewRef}
            className={`${showAIPanel ? "flex-1" : "w-full"} overflow-auto bg-white dark:bg-gray-950`}
          >
            <FullFileView
              content={mockFullFileContent}
              suggestions={mockLineSuggestions}
              postedComments={postedComments}
              highlightedLine={highlightedLine}
              onSelectCode={handleCodeSelection}
              onPostComment={handlePostComment}
            />
          </div>

          {showAIPanel && (
            <div className="w-96 shrink-0">
              <AIReviewAssistant
                concerns={[]}
                onPostComment={handlePostCommentFromAssistant}
                onJumpToLine={handleJumpToLine}
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

      {showExplain && <CodeExplainPanel code={activeCode} onClose={() => setShowExplain(false)} />}
    </div>
  );
}

function FullFileView({
  content,
  suggestions,
  postedComments,
  highlightedLine,
  onSelectCode,
  onPostComment,
}: {
  content: string;
  suggestions: LineSuggestion[];
  postedComments: number[];
  highlightedLine: number | null;
  onSelectCode: (code: string, event: React.MouseEvent) => void;
  onPostComment: (lineNumber: number) => void;
}) {
  const lines = content.split("\n");

  const handleTextSelection = (event: React.MouseEvent) => {
    const selection = window.getSelection();
    if (selection?.toString().trim()) {
      onSelectCode(selection.toString(), event);
    }
  };

  return (
    <div className="font-mono text-sm" onMouseUp={handleTextSelection}>
      {lines.map((line, index) => {
        const lineNumber = index + 1;
        const suggestion = suggestions.find((s) => s.lineNumber === lineNumber);
        const isPosted = postedComments.includes(lineNumber);
        const isHighlighted = highlightedLine === lineNumber;

        return (
          <div key={`line-${lineNumber}`} id={`line-${lineNumber}`}>
            <div
              className={`group flex transition-colors ${
                isHighlighted
                  ? "bg-violet-100 dark:bg-violet-900/30 ring-2 ring-violet-500"
                  : "hover:bg-gray-50 dark:hover:bg-gray-900/50"
              }`}
            >
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
              <InlineSuggestion suggestion={suggestion} onPost={() => onPostComment(lineNumber)} />
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
    <div
      className={`ml-12 mr-4 my-2 rounded-lg border-l-4 ${config.border} ${config.bg} overflow-hidden`}
    >
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

function CollapseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function ExpandIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
      />
    </svg>
  );
}

function FolderIcon({ className, isOpen }: { className?: string; isOpen: boolean }) {
  if (isOpen) {
    return (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z"
        />
      </svg>
    );
  }
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
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

function ChevronIcon({ className, isOpen }: { className?: string; isOpen: boolean }) {
  return (
    <svg
      className={`${className} transition-transform ${isOpen ? "rotate-90" : ""}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}

function hasChangedChildren(node: FileTreeNode): boolean {
  if (node.status) return true;
  if (node.children) {
    return node.children.some(hasChangedChildren);
  }
  return false;
}

function FileTree({
  nodes,
  expandedFolders,
  selectedPath,
  showChangedOnly,
  onToggle,
  onSelect,
  depth = 0,
}: {
  nodes: FileTreeNode[];
  expandedFolders: Set<string>;
  selectedPath: string;
  showChangedOnly: boolean;
  onToggle: (path: string) => void;
  onSelect: (node: FileTreeNode) => void;
  depth?: number;
}) {
  const filteredNodes = showChangedOnly ? nodes.filter(hasChangedChildren) : nodes;

  return (
    <>
      {filteredNodes.map((node) => (
        <FileTreeItem
          key={node.path}
          node={node}
          depth={depth}
          isExpanded={expandedFolders.has(node.path)}
          isSelected={selectedPath === node.path}
          expandedFolders={expandedFolders}
          selectedPath={selectedPath}
          showChangedOnly={showChangedOnly}
          onToggle={onToggle}
          onSelect={onSelect}
        />
      ))}
    </>
  );
}

function FileTreeItem({
  node,
  depth,
  isExpanded,
  isSelected,
  expandedFolders,
  selectedPath,
  showChangedOnly,
  onToggle,
  onSelect,
}: {
  node: FileTreeNode;
  depth: number;
  isExpanded: boolean;
  isSelected: boolean;
  expandedFolders: Set<string>;
  selectedPath: string;
  showChangedOnly: boolean;
  onToggle: (path: string) => void;
  onSelect: (node: FileTreeNode) => void;
}) {
  const isFolder = node.type === "folder";
  const hasChange = node.status;
  const fileChange = mockFileChanges.find((f) => f.path === node.path);

  const statusColorMap = {
    added: "text-green-500",
    modified: "text-amber-500",
    deleted: "text-red-500",
  };

  return (
    <div>
      <button
        type="button"
        onClick={() => {
          if (isFolder) {
            onToggle(node.path);
          } else {
            onSelect(node);
          }
        }}
        className={`w-full flex items-center gap-1 px-2 py-1 text-left text-sm transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 ${
          isSelected ? "bg-blue-100 dark:bg-blue-900/50" : ""
        }`}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
      >
        {isFolder ? (
          <>
            <ChevronIcon className="w-3 h-3 text-gray-400 shrink-0" isOpen={isExpanded} />
            <FolderIcon
              className={`w-4 h-4 shrink-0 ${hasChange ? statusColorMap[hasChange] : "text-amber-400"}`}
              isOpen={isExpanded}
            />
          </>
        ) : (
          <>
            <span className="w-3" />
            <FileIcon
              className={`w-4 h-4 shrink-0 ${hasChange ? statusColorMap[hasChange] : "text-gray-400"}`}
            />
          </>
        )}
        <span
          className={`truncate font-mono text-xs ${
            isSelected
              ? "text-blue-700 dark:text-blue-300"
              : hasChange
                ? statusColorMap[hasChange]
                : "text-gray-700 dark:text-gray-300"
          }`}
        >
          {node.name}
        </span>
        {hasChange && (
          <span
            className={`ml-auto text-xs ${
              hasChange === "added"
                ? "text-green-500"
                : hasChange === "deleted"
                  ? "text-red-500"
                  : "text-amber-500"
            }`}
          >
            {hasChange === "added" ? "A" : hasChange === "deleted" ? "D" : "M"}
          </span>
        )}
        {fileChange && (
          <span className="ml-1 text-xs text-gray-400">
            +{fileChange.additions} -{fileChange.deletions}
          </span>
        )}
      </button>
      {isFolder && isExpanded && node.children && (
        <FileTree
          nodes={node.children}
          expandedFolders={expandedFolders}
          selectedPath={selectedPath}
          showChangedOnly={showChangedOnly}
          onToggle={onToggle}
          onSelect={onSelect}
          depth={depth + 1}
        />
      )}
    </div>
  );
}
