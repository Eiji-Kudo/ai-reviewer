import { useState } from "react";
import { Link } from "react-router";
import { MemberAvatar } from "~/components/assign-reviewer-modal";
import {
  mockReviews,
  mockTeamMembers,
  type Review,
  type ReviewStatus,
  statusLabels,
} from "~/data/mock";

export function meta() {
  return [
    { title: "Kanban Board - Reviewer" },
    { name: "description", content: "Manage code reviews with Kanban board" },
  ];
}

const columns: ReviewStatus[] = ["pending", "in_review", "changes_requested", "approved", "merged"];

const columnConfig: Record<ReviewStatus, { color: string; dotColor: string; bgHover: string }> = {
  pending: { color: "text-gray-600", dotColor: "bg-gray-400", bgHover: "hover:border-gray-300" },
  in_review: { color: "text-blue-600", dotColor: "bg-blue-500", bgHover: "hover:border-blue-300" },
  changes_requested: {
    color: "text-amber-600",
    dotColor: "bg-amber-500",
    bgHover: "hover:border-amber-300",
  },
  approved: {
    color: "text-emerald-600",
    dotColor: "bg-emerald-500",
    bgHover: "hover:border-emerald-300",
  },
  merged: {
    color: "text-violet-600",
    dotColor: "bg-violet-500",
    bgHover: "hover:border-violet-300",
  },
};

export default function Board() {
  const [reviews, setReviews] = useState<Review[]>(mockReviews);
  const [draggedReview, setDraggedReview] = useState<Review | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<ReviewStatus | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [assigneeFilter, setAssigneeFilter] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const filteredReviews = reviews.filter((r) => {
    const matchesSearch =
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.labels.some((l) => l.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesAssignee = assigneeFilter === null || r.reviewers.includes(assigneeFilter);

    return matchesSearch && matchesAssignee;
  });

  const handleDragStart = (review: Review) => {
    setDraggedReview(review);
  };

  const handleDragOver = (e: React.DragEvent, status: ReviewStatus) => {
    e.preventDefault();
    setDragOverColumn(status);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (status: ReviewStatus) => {
    if (draggedReview && draggedReview.status !== status) {
      setReviews((prev) =>
        prev.map((r) =>
          r.id === draggedReview.id ? { ...r, status, updatedAt: new Date().toISOString() } : r
        )
      );
    }
    setDraggedReview(null);
    setDragOverColumn(null);
  };

  const handleDragEnd = () => {
    setDraggedReview(null);
    setDragOverColumn(null);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 glass border-b border-gray-200/50 dark:border-gray-800/50">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Kanban Board</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Drag cards to update review status
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search reviews..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 w-64 bg-gray-100 dark:bg-gray-800 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 border-2 border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-gray-900 transition-all outline-none"
              />
            </div>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all border-2 ${
                  assigneeFilter
                    ? "bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300"
                    : "bg-gray-100 dark:bg-gray-800 border-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                <FilterIcon className="w-4 h-4" />
                {assigneeFilter ? <span className="capitalize">{assigneeFilter}</span> : "Assignee"}
                <ChevronDownIcon className="w-3 h-3" />
              </button>
              {isFilterOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsFilterOpen(false)} />
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 z-20 py-2 animate-scale-in">
                    <button
                      type="button"
                      onClick={() => {
                        setAssigneeFilter(null);
                        setIsFilterOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                        assigneeFilter === null
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      <span className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs">
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                      </span>
                      <span>All Assignees</span>
                      {assigneeFilter === null && <CheckmarkIcon className="w-4 h-4 ml-auto" />}
                    </button>
                    <div className="border-t border-gray-100 dark:border-gray-800 my-1" />
                    {mockTeamMembers.map((member) => {
                      const memberKey = member.name.toLowerCase().split(" ")[0];
                      return (
                        <button
                          key={member.id}
                          type="button"
                          onClick={() => {
                            setAssigneeFilter(memberKey);
                            setIsFilterOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                            assigneeFilter === memberKey
                              ? "text-blue-600 dark:text-blue-400"
                              : "text-gray-700 dark:text-gray-300"
                          }`}
                        >
                          <MemberAvatar name={member.name} size="sm" />
                          <span>{member.name}</span>
                          {assigneeFilter === memberKey && (
                            <CheckmarkIcon className="w-4 h-4 ml-auto" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
            <button type="button" className="btn-primary flex items-center gap-2">
              <PlusIcon className="w-4 h-4" />
              New Review
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto p-6">
        <div className="flex gap-5 h-full min-w-max">
          {columns.map((status, columnIndex) => {
            const columnReviews = filteredReviews.filter((r) => r.status === status);
            const isOver = dragOverColumn === status;
            const config = columnConfig[status];

            return (
              <div
                key={status}
                className={`w-80 flex flex-col rounded-2xl transition-all duration-200 animate-fade-in ${
                  isOver
                    ? "ring-2 ring-blue-500 ring-offset-2 ring-offset-gray-50 dark:ring-offset-gray-950 scale-[1.01]"
                    : ""
                }`}
                style={{ animationDelay: `${columnIndex * 50}ms` }}
                onDragOver={(e) => handleDragOver(e, status)}
                onDragLeave={handleDragLeave}
                onDrop={() => handleDrop(status)}
              >
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${config.dotColor}`}></span>
                    <h3 className={`font-semibold ${config.color} dark:opacity-90`}>
                      {statusLabels[status]}
                    </h3>
                    <span className="ml-1 px-2 py-0.5 text-xs font-medium bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full">
                      {columnReviews.length}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <MoreIcon className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex-1 px-3 pb-3 space-y-3 overflow-y-auto">
                  {columnReviews.map((review, index) => (
                    <ReviewCard
                      key={review.id}
                      review={review}
                      onDragStart={() => handleDragStart(review)}
                      onDragEnd={handleDragEnd}
                      isDragging={draggedReview?.id === review.id}
                      index={index}
                    />
                  ))}
                  {columnReviews.length === 0 && (
                    <div className="h-32 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl flex items-center justify-center">
                      <p className="text-sm text-gray-400 dark:text-gray-600">Drop reviews here</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ReviewCard({
  review,
  onDragStart,
  onDragEnd,
  isDragging,
  index,
}: {
  review: Review;
  onDragStart: () => void;
  onDragEnd: () => void;
  isDragging: boolean;
  index: number;
}) {
  const priorityConfig = {
    high: { badge: "badge-red", dot: "bg-red-500" },
    medium: { badge: "badge-orange", dot: "bg-amber-500" },
    low: { badge: "badge-gray", dot: "bg-gray-400" },
  };

  return (
    <Link
      to={`/review/${review.id}`}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = "move";
        onDragStart();
      }}
      onDragEnd={onDragEnd}
      className={`block card p-4 cursor-grab active:cursor-grabbing animate-scale-in group ${
        isDragging ? "opacity-50 rotate-1 scale-105 shadow-2xl" : ""
      }`}
      style={{ animationDelay: `${index * 30}ms` }}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {review.title}
        </h3>
        <span
          className={`shrink-0 w-2 h-2 rounded-full mt-1.5 ${priorityConfig[review.priority].dot}`}
        ></span>
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
        {review.description}
      </p>

      {review.labels.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {review.labels.slice(0, 3).map((label) => (
            <span
              key={label}
              className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 rounded-md"
            >
              {label}
            </span>
          ))}
          {review.labels.length > 3 && (
            <span className="px-2 py-0.5 text-xs text-gray-400 dark:text-gray-500">
              +{review.labels.length - 3}
            </span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-medium shadow-sm">
            {review.author[0].toUpperCase()}
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">{review.author}</span>
        </div>
        <div className="flex items-center gap-2">
          {review.aiAnalyzed && (
            <span className="flex items-center gap-1 text-violet-500 dark:text-violet-400">
              <AIIcon className="w-3.5 h-3.5" />
            </span>
          )}
          {review.commentCount > 0 && (
            <span className="flex items-center gap-1 text-gray-400 dark:text-gray-500 text-xs">
              <CommentIcon className="w-3.5 h-3.5" />
              {review.commentCount}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  );
}

function MoreIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
      />
    </svg>
  );
}

function CommentIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
      />
    </svg>
  );
}

function AIIcon({ className }: { className?: string }) {
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

function FilterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
      />
    </svg>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function CheckmarkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}
