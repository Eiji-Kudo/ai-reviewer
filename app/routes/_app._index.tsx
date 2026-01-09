import { Link } from "react-router";
import { mockReviews, priorityColors } from "~/data/mock";

export function meta() {
  return [
    { title: "Dashboard - Reviewer" },
    { name: "description", content: "AI-Powered Code Review Dashboard" },
  ];
}

export default function Dashboard() {
  const stats = {
    needsReview: mockReviews.filter((r) => r.status === "needs_review").length,
    reviewing: mockReviews.filter((r) => r.status === "reviewing").length,
    waitingAuthor: mockReviews.filter((r) => r.status === "waiting_author").length,
    done: mockReviews.filter((r) => r.status === "done").length,
  };

  const totalReviews = mockReviews.length;
  const activeReviews = stats.needsReview + stats.reviewing;

  const recentReviews = [...mockReviews]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  return (
    <div className="min-h-full p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome back</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Here's what's happening with your code reviews
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            label="Needs Review"
            value={stats.needsReview}
            icon={<ActiveIcon />}
            color="red"
            trend="Waiting for your review"
          />
          <StatCard
            label="Reviewing"
            value={stats.reviewing}
            icon={<ReviewIcon />}
            color="blue"
            trend="In progress"
          />
          <StatCard
            label="Waiting for Author"
            value={stats.waitingAuthor}
            icon={<ApprovedIcon />}
            color="amber"
            trend="Pending author changes"
          />
          <StatCard
            label="Done"
            value={stats.done}
            icon={<MergedIcon />}
            color="emerald"
            trend="Completed"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="card p-6 animate-fade-in" style={{ animationDelay: "100ms" }}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Recent Activity
                </h2>
                <Link
                  to="/board"
                  className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium flex items-center gap-1 group"
                >
                  View all
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
              <div className="space-y-3">
                {recentReviews.map((review, index) => (
                  <ReviewItem key={review.id} review={review} index={index} />
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="card p-6 animate-fade-in" style={{ animationDelay: "200ms" }}>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Review Status
              </h2>
              <div className="space-y-4">
                <StatusBar
                  label="Needs Review"
                  value={stats.needsReview}
                  total={totalReviews}
                  color="red"
                />
                <StatusBar
                  label="Reviewing"
                  value={stats.reviewing}
                  total={totalReviews}
                  color="blue"
                />
                <StatusBar
                  label="Waiting for Author"
                  value={stats.waitingAuthor}
                  total={totalReviews}
                  color="amber"
                />
                <StatusBar
                  label="Done"
                  value={stats.done}
                  total={totalReviews}
                  color="emerald"
                />
              </div>
            </div>

            <div className="card p-6 animate-fade-in" style={{ animationDelay: "300ms" }}>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Quick Actions
              </h2>
              <div className="space-y-2">
                <Link
                  to="/board"
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">New Review</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Create a new code review
                    </p>
                  </div>
                </Link>
                <button
                  type="button"
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900/50 flex items-center justify-center text-violet-600 dark:text-violet-400 group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
                      />
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">AI Analysis</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Analyze code with AI</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  color,
  trend,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: "blue" | "amber" | "emerald" | "violet" | "red";
  trend: string;
}) {
  const bgColors = {
    blue: "bg-blue-50 dark:bg-blue-900/20",
    amber: "bg-amber-50 dark:bg-amber-900/20",
    emerald: "bg-emerald-50 dark:bg-emerald-900/20",
    violet: "bg-violet-50 dark:bg-violet-900/20",
    red: "bg-red-50 dark:bg-red-900/20",
  };

  const iconColors = {
    blue: "text-blue-600 dark:text-blue-400",
    amber: "text-amber-600 dark:text-amber-400",
    emerald: "text-emerald-600 dark:text-emerald-400",
    violet: "text-violet-600 dark:text-violet-400",
    red: "text-red-600 dark:text-red-400",
  };

  return (
    <div className="card p-6 animate-fade-in hover:scale-[1.02] transition-transform cursor-default">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{value}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{trend}</p>
        </div>
        <div className={`p-3 rounded-xl ${bgColors[color]}`}>
          <span className={iconColors[color]}>{icon}</span>
        </div>
      </div>
    </div>
  );
}

function ReviewItem({ review, index }: { review: (typeof mockReviews)[0]; index: number }) {
  const statusDotClass = {
    needs_review: "bg-red-500",
    reviewing: "bg-blue-500 animate-pulse",
    waiting_author: "bg-amber-500",
    done: "bg-emerald-500",
  };

  return (
    <Link
      to={`/review/${review.id}`}
      className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all group animate-slide-in"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="relative">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-300 font-medium text-sm">
          {review.author[0].toUpperCase()}
        </div>
        <span
          className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-gray-900 ${statusDotClass[review.status]}`}
        ></span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {review.title}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          {review.author} · {formatDate(review.updatedAt)}
        </p>
      </div>
      <div className="flex items-center gap-2">
        {review.aiAnalyzed && (
          <span className="badge badge-purple">
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
              />
            </svg>
            AI
          </span>
        )}
        <span
          className={`badge ${priorityColors[review.priority].includes("red") ? "badge-red" : priorityColors[review.priority].includes("yellow") ? "badge-orange" : "badge-gray"}`}
        >
          {review.priority}
        </span>
      </div>
    </Link>
  );
}

function StatusBar({
  label,
  value,
  total,
  color,
}: {
  label: string;
  value: number;
  total: number;
  color: "red" | "blue" | "amber" | "emerald";
}) {
  const percentage = total > 0 ? (value / total) * 100 : 0;
  const barColors = {
    red: "bg-red-500",
    blue: "bg-blue-500",
    amber: "bg-amber-500",
    emerald: "bg-emerald-500",
  };

  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1.5">
        <span className="text-gray-600 dark:text-gray-400">{label}</span>
        <span className="font-medium text-gray-900 dark:text-white">{value}</span>
      </div>
      <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
        <div
          className={`h-full ${barColors[color]} rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

function ActiveIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
      />
    </svg>
  );
}

function ReviewIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
      />
    </svg>
  );
}

function ApprovedIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

function MergedIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
      />
    </svg>
  );
}
