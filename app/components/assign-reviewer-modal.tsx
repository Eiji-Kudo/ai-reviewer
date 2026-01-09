import { useState } from "react";
import { mockTeamMembers, type TeamMember } from "~/data/mock";

type AssignReviewerModalProps = {
  isOpen: boolean;
  onClose: () => void;
  currentReviewers: string[];
  onAssign: (reviewers: string[]) => void;
  reviewTitle: string;
};

export function AssignReviewerModal({
  isOpen,
  onClose,
  currentReviewers,
  onAssign,
  reviewTitle,
}: AssignReviewerModalProps) {
  const [selectedMembers, setSelectedMembers] = useState<string[]>(currentReviewers);
  const [searchQuery, setSearchQuery] = useState("");

  if (!isOpen) return null;

  const filteredMembers = mockTeamMembers.filter(
    (member) =>
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleMember = (memberName: string) => {
    setSelectedMembers((prev) =>
      prev.includes(memberName) ? prev.filter((m) => m !== memberName) : [...prev, memberName]
    );
  };

  const handleSave = () => {
    onAssign(selectedMembers);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md mx-4 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl animate-scale-in">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Assign Reviewers
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 truncate max-w-[280px]">
                {reviewTitle}
              </p>
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

        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search team members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-gray-100 dark:bg-gray-800 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 border-2 border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-gray-900 transition-all outline-none"
            />
          </div>
        </div>

        <div className="max-h-80 overflow-y-auto p-2">
          {filteredMembers.length === 0 ? (
            <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-8">
              No members found
            </p>
          ) : (
            <div className="space-y-1">
              {filteredMembers.map((member) => {
                const isSelected = selectedMembers.includes(member.name.toLowerCase().split(" ")[0]);
                const memberKey = member.name.toLowerCase().split(" ")[0];

                return (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => toggleMember(memberKey)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                      isSelected
                        ? "bg-blue-50 dark:bg-blue-900/30 ring-2 ring-blue-500"
                        : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    }`}
                  >
                    <div className="relative">
                      <MemberAvatar name={member.name} />
                      {isSelected && (
                        <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                          <CheckIcon />
                        </span>
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {member.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{member.email}</p>
                    </div>
                    <span
                      className={`badge text-xs ${
                        member.role === "admin"
                          ? "badge-purple"
                          : member.role === "reviewer"
                            ? "badge-blue"
                            : "badge-gray"
                      }`}
                    >
                      {member.role}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {selectedMembers.length} reviewer{selectedMembers.length !== 1 ? "s" : ""} selected
            </p>
            <div className="flex gap-2">
              <button type="button" onClick={onClose} className="btn-ghost text-sm">
                Cancel
              </button>
              <button type="button" onClick={handleSave} className="btn-primary text-sm">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function MemberAvatar({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const colors = [
    "from-blue-400 to-blue-600",
    "from-emerald-400 to-emerald-600",
    "from-violet-400 to-violet-600",
    "from-amber-400 to-amber-600",
    "from-rose-400 to-rose-600",
    "from-cyan-400 to-cyan-600",
  ];

  const colorIndex = name.charCodeAt(0) % colors.length;

  const sizeClasses = {
    sm: "w-6 h-6 text-xs",
    md: "w-8 h-8 text-sm",
    lg: "w-10 h-10 text-base",
  };

  return (
    <div
      className={`${sizeClasses[size]} rounded-full bg-gradient-to-br ${colors[colorIndex]} flex items-center justify-center text-white font-medium shadow-sm`}
    >
      {initials}
    </div>
  );
}

function CloseIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
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

function CheckIcon() {
  return (
    <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
    </svg>
  );
}
