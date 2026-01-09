import { useState } from "react";
import { Link, Outlet, useLocation, useParams } from "react-router";
import { AIIssueCard } from "~/components/ai-review/ai-issue-card";
import { AISummaryPanel } from "~/components/ai-review/ai-summary";
import { CommentComposer } from "~/components/ai-review/comment-composer";
import { AssignReviewerModal, MemberAvatar } from "~/components/assign-reviewer-modal";
import {
  type AIIssue,
  mockAIIssues,
  mockAISummary,
  mockComments,
  mockFileChanges,
  mockReviews,
  statusLabels,
} from "~/data/mock";

export function meta() {
  return [
    { title: "Review Details - Reviewer" },
    { name: "description", content: "View and manage code review" },
  ];
}

const statusConfig = {
  needs_review: {
    bg: "bg-red-100 dark:bg-red-900/50",
    text: "text-red-700 dark:text-red-300",
    dot: "bg-red-500",
  },
  reviewing: {
    bg: "bg-blue-100 dark:bg-blue-900/50",
    text: "text-blue-700 dark:text-blue-300",
    dot: "bg-blue-500",
  },
  waiting_author: {
    bg: "bg-amber-100 dark:bg-amber-900/50",
    text: "text-amber-700 dark:text-amber-300",
    dot: "bg-amber-500",
  },
  done: {
    bg: "bg-emerald-100 dark:bg-emerald-900/50",
    text: "text-emerald-700 dark:text-emerald-300",
    dot: "bg-emerald-500",
  },
};

const priorityConfig = {
  high: { bg: "bg-red-100 dark:bg-red-900/50", text: "text-red-700 dark:text-red-300" },
  medium: { bg: "bg-amber-100 dark:bg-amber-900/50", text: "text-amber-700 dark:text-amber-300" },
  low: { bg: "bg-gray-100 dark:bg-gray-800", text: "text-gray-600 dark:text-gray-400" },
};

export default function ReviewDetail() {
  const { id } = useParams();
  const location = useLocation();
  const review = mockReviews.find((r) => r.id === id);

  if (!review) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Review not found
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            The review you're looking for doesn't exist.
          </p>
          <Link to="/board" className="btn-primary">
            Back to Board
          </Link>
        </div>
      </div>
    );
  }

  const isFilesPage = location.pathname.includes("/files");
  const isChatPage = location.pathname.includes("/chat");
  const isMainPage = !isFilesPage && !isChatPage;

  return (
    <div className="h-full flex flex-col">
      <div className="glass border-b border-gray-200/50 dark:border-gray-800/50">
        <div className="p-6">
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-3">
                <Link
                  to="/board"
                  className="p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <BackIcon />
                </Link>
                <span
                  className={`badge ${statusConfig[review.status].bg} ${statusConfig[review.status].text}`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${statusConfig[review.status].dot} mr-1.5`}
                  ></span>
                  {statusLabels[review.status]}
                </span>
                <span
                  className={`badge ${priorityConfig[review.priority].bg} ${priorityConfig[review.priority].text}`}
                >
                  {review.priority}
                </span>
              </div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {review.title}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm">{review.description}</p>
              <div className="flex items-center gap-4 mt-4 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-medium">
                    {review.author[0].toUpperCase()}
                  </div>
                  <span>{review.author}</span>
                </div>
                <span className="text-gray-300 dark:text-gray-700">·</span>
                <span>{mockFileChanges.length} files changed</span>
                <span className="text-gray-300 dark:text-gray-700">·</span>
                <span>{review.commentCount} comments</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" className="btn-secondary text-sm">
                Request Changes
              </button>
              <button type="button" className="btn-primary text-sm flex items-center gap-2">
                <CheckIcon />
                Approve
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-1 px-6 border-t border-gray-200/50 dark:border-gray-800/50">
          <TabLink to={`/review/${id}`} active={isMainPage}>
            <OverviewIcon />
            Overview
          </TabLink>
          <TabLink to={`/review/${id}/files`} active={isFilesPage}>
            <FilesIcon />
            Files
            <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-gray-200 dark:bg-gray-700 rounded">
              {mockFileChanges.length}
            </span>
          </TabLink>
          <TabLink to={`/review/${id}/chat`} active={isChatPage}>
            <AIIcon />
            AI Chat
          </TabLink>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {isMainPage ? <ReviewOverview review={review} /> : <Outlet />}
      </div>
    </div>
  );
}

function TabLink({
  to,
  active,
  children,
}: {
  to: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all ${
        active
          ? "border-blue-600 text-blue-600 dark:text-blue-400"
          : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600"
      }`}
    >
      {children}
    </Link>
  );
}

function ReviewOverview({ review }: { review: (typeof mockReviews)[0] }) {
  const reviewComments = mockComments.filter((c) => c.reviewId === review.id);
  const unresolvedComments = reviewComments.filter((c) => !c.resolved && !c.parentId);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [reviewers, setReviewers] = useState(review.reviewers);
  const [commentIssue, setCommentIssue] = useState<AIIssue | null>(null);

  const handleCreateComment = (issue: AIIssue) => {
    setCommentIssue(issue);
  };

  const handleJumpToCode = (_filePath: string, _line: number) => {
    window.location.href = `/review/${review.id}/files`;
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {review.aiAnalyzed && (
        <AISummaryPanel
          summary={mockAISummary}
          onAskMore={() => {
            window.location.href = `/review/${review.id}/chat`;
          }}
        />
      )}

      {mockAIIssues.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <WarningIcon className="w-5 h-5 text-amber-500" />
              AI検出した懸念点
              <span className="px-2 py-0.5 text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300 rounded-full">
                {mockAIIssues.length}
              </span>
            </h2>
          </div>
          <div className="space-y-4">
            {mockAIIssues.map((issue) => (
              <AIIssueCard
                key={issue.id}
                issue={issue}
                onCreateComment={handleCreateComment}
                onJumpToCode={handleJumpToCode}
              />
            ))}
          </div>
        </div>
      )}

      {commentIssue && (
        <CommentComposer
          issue={commentIssue}
          onClose={() => setCommentIssue(null)}
          onSubmit={(comment) => {
            console.log("Comment submitted:", comment);
          }}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FilesIcon />
              Files Changed
            </h2>
            <div className="space-y-1">
              {mockFileChanges.map((file) => (
                <Link
                  key={file.path}
                  to={`/review/${review.id}/files`}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <FileStatusIcon status={file.status} />
                    <span className="text-sm font-mono text-gray-700 dark:text-gray-300 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {file.path}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-mono">
                    <span className="text-emerald-600 dark:text-emerald-400">
                      +{file.additions}
                    </span>
                    <span className="text-red-500 dark:text-red-400">-{file.deletions}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {unresolvedComments.length > 0 && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <CommentIcon />
                Unresolved Comments
                <span className="badge badge-orange">{unresolvedComments.length}</span>
              </h2>
              <div className="space-y-4">
                {unresolvedComments.map((comment) => (
                  <div
                    key={comment.id}
                    className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800/50"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-xs font-medium">
                        {comment.author[0].toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {comment.author}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                        {comment.filePath}:{comment.lineNumber}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 pl-10">
                      {comment.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Reviewers</h2>
              <button
                type="button"
                onClick={() => setIsAssignModalOpen(true)}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <EditIcon />
              </button>
            </div>
            <div className="space-y-3">
              {reviewers.length > 0 ? (
                reviewers.map((reviewer) => (
                  <div key={reviewer} className="flex items-center gap-3">
                    <MemberAvatar name={reviewer} />
                    <span className="text-sm text-gray-900 dark:text-white capitalize">
                      {reviewer}
                    </span>
                  </div>
                ))
              ) : (
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(true)}
                  className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                >
                  <PlusIcon />
                  <span className="text-sm">Assign reviewers</span>
                </button>
              )}
            </div>
          </div>

          <AssignReviewerModal
            isOpen={isAssignModalOpen}
            onClose={() => setIsAssignModalOpen(false)}
            currentReviewers={reviewers}
            onAssign={setReviewers}
            reviewTitle={review.title}
          />

          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Labels</h2>
            <div className="flex flex-wrap gap-2">
              {review.labels.map((label) => (
                <span
                  key={label}
                  className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 rounded-lg"
                >
                  {label}
                </span>
              ))}
            </div>
          </div>

          {review.aiAnalyzed && (
            <div className="card-elevated p-6 bg-gradient-to-br from-violet-50 to-blue-50 dark:from-violet-900/30 dark:to-blue-900/30 border-violet-200 dark:border-violet-800/50">
              <div className="flex items-center gap-2 mb-3">
                <AIIcon />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">AI Analysis</h2>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                This review has been analyzed by AI. Get detailed insights and suggestions.
              </p>
              <Link
                to={`/review/${review.id}/chat`}
                className="inline-flex items-center gap-2 text-sm text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300 font-medium group"
              >
                View AI insights
                <svg
                  className="w-4 h-4 transition-transform group-hover:translate-x-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
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

function FileStatusIcon({ status }: { status: "added" | "modified" | "deleted" }) {
  const config = {
    added: { color: "text-emerald-500", icon: "M12 4v16m8-8H4" },
    modified: {
      color: "text-amber-500",
      icon: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
    },
    deleted: { color: "text-red-500", icon: "M20 12H4" },
  };

  return (
    <svg
      className={`w-4 h-4 ${config[status].color}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={config[status].icon} />
    </svg>
  );
}

function BackIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}

function OverviewIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M4 6h16M4 10h16M4 14h16M4 18h16"
      />
    </svg>
  );
}

function FilesIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  );
}

function AIIcon() {
  return (
    <svg className="w-4 h-4 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
      />
    </svg>
  );
}

function CommentIcon() {
  return (
    <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
      />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
      />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  );
}
