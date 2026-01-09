export type ReviewStatus = "pending" | "in_review" | "changes_requested" | "approved" | "merged";

export type Priority = "high" | "medium" | "low";

export type TeamMember = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: "admin" | "developer" | "reviewer";
};

export const mockTeamMembers: TeamMember[] = [
  { id: "1", name: "Alice Chen", email: "alice@example.com", role: "admin" },
  { id: "2", name: "Bob Smith", email: "bob@example.com", role: "developer" },
  { id: "3", name: "Charlie Brown", email: "charlie@example.com", role: "developer" },
  { id: "4", name: "Diana Lee", email: "diana@example.com", role: "reviewer" },
  { id: "5", name: "Eve Wilson", email: "eve@example.com", role: "developer" },
  { id: "6", name: "Frank Miller", email: "frank@example.com", role: "reviewer" },
];

export type Review = {
  id: string;
  title: string;
  description: string;
  status: ReviewStatus;
  priority: Priority;
  author: string;
  reviewers: string[];
  labels: string[];
  commentCount: number;
  aiAnalyzed: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Comment = {
  id: string;
  reviewId: string;
  filePath: string;
  lineNumber: number;
  content: string;
  author: string;
  resolved: boolean;
  parentId: string | null;
  createdAt: string;
};

export type FileChange = {
  path: string;
  additions: number;
  deletions: number;
  status: "added" | "modified" | "deleted";
};

export const mockReviews: Review[] = [
  {
    id: "1",
    title: "Add user authentication flow",
    description: "Implement login, logout, and session management",
    status: "pending",
    priority: "high",
    author: "alice",
    reviewers: ["bob", "charlie"],
    labels: ["feature", "auth"],
    commentCount: 0,
    aiAnalyzed: false,
    createdAt: "2025-01-08T10:00:00Z",
    updatedAt: "2025-01-08T10:00:00Z",
  },
  {
    id: "2",
    title: "Fix memory leak in dashboard",
    description: "useEffect cleanup was missing in chart component",
    status: "in_review",
    priority: "high",
    author: "bob",
    reviewers: ["alice"],
    labels: ["bug", "performance"],
    commentCount: 3,
    aiAnalyzed: true,
    createdAt: "2025-01-07T14:30:00Z",
    updatedAt: "2025-01-08T09:00:00Z",
  },
  {
    id: "3",
    title: "Update dependencies to latest versions",
    description: "Bump React, TypeScript and other core dependencies",
    status: "in_review",
    priority: "medium",
    author: "charlie",
    reviewers: ["alice", "bob"],
    labels: ["chore", "dependencies"],
    commentCount: 1,
    aiAnalyzed: true,
    createdAt: "2025-01-06T16:00:00Z",
    updatedAt: "2025-01-07T11:00:00Z",
  },
  {
    id: "4",
    title: "Refactor API client",
    description: "Extract common fetch logic into reusable hooks",
    status: "changes_requested",
    priority: "medium",
    author: "alice",
    reviewers: ["charlie"],
    labels: ["refactor"],
    commentCount: 5,
    aiAnalyzed: true,
    createdAt: "2025-01-05T09:00:00Z",
    updatedAt: "2025-01-08T08:00:00Z",
  },
  {
    id: "5",
    title: "Add dark mode support",
    description: "Implement theme switching with system preference detection",
    status: "approved",
    priority: "low",
    author: "bob",
    reviewers: ["alice"],
    labels: ["feature", "ui"],
    commentCount: 2,
    aiAnalyzed: true,
    createdAt: "2025-01-04T13:00:00Z",
    updatedAt: "2025-01-07T15:00:00Z",
  },
  {
    id: "6",
    title: "Fix typo in README",
    description: "Correct spelling mistakes in documentation",
    status: "merged",
    priority: "low",
    author: "charlie",
    reviewers: ["bob"],
    labels: ["docs"],
    commentCount: 0,
    aiAnalyzed: false,
    createdAt: "2025-01-03T10:00:00Z",
    updatedAt: "2025-01-03T11:00:00Z",
  },
  {
    id: "7",
    title: "Implement search functionality",
    description: "Add full-text search for reviews and comments",
    status: "pending",
    priority: "medium",
    author: "alice",
    reviewers: [],
    labels: ["feature"],
    commentCount: 0,
    aiAnalyzed: false,
    createdAt: "2025-01-08T11:00:00Z",
    updatedAt: "2025-01-08T11:00:00Z",
  },
];

export const mockFileChanges: FileChange[] = [
  { path: "src/components/Auth/Login.tsx", additions: 45, deletions: 0, status: "added" },
  { path: "src/components/Auth/Logout.tsx", additions: 23, deletions: 0, status: "added" },
  { path: "src/hooks/useAuth.ts", additions: 67, deletions: 0, status: "added" },
  { path: "src/contexts/AuthContext.tsx", additions: 89, deletions: 0, status: "added" },
  { path: "src/App.tsx", additions: 12, deletions: 3, status: "modified" },
  { path: "src/routes.ts", additions: 8, deletions: 2, status: "modified" },
  { path: "package.json", additions: 3, deletions: 1, status: "modified" },
];

export const mockFullFileContent = `import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { fetchUser } from '../api/user';

type AppProps = {
  userId: string;
};

export function App({ userId }: AppProps) {
  const [count, setCount] = useState(0);
  const [user, setUser] = useState<any>(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    fetchUser(userId);
  }, []);

  const handleClick = () => {
    setCount(c => c + 1);
  };

  return (
    <div className="app">
      <h1>Welcome{isAuthenticated ? \`, \${user?.name}\` : ''}</h1>
      <button onClick={handleClick}>
        Count: {count}
      </button>
      {!isAuthenticated && (
        <button onClick={() => navigate('/login')}>
          Login
        </button>
      )}
    </div>
  );
}`;

export type LineSuggestion = {
  lineNumber: number;
  type: "warning" | "info" | "suggestion" | "error";
  title: string;
  description: string;
  suggestedComment?: {
    gentle: string;
    neutral: string;
    strict: string;
  };
  suggestedCode?: string;
};

export type FileTreeNode = {
  name: string;
  type: "file" | "folder";
  path: string;
  children?: FileTreeNode[];
  status?: "added" | "modified" | "deleted";
};

export const mockFileTree: FileTreeNode[] = [
  {
    name: "src",
    type: "folder",
    path: "src",
    children: [
      {
        name: "components",
        type: "folder",
        path: "src/components",
        children: [
          {
            name: "Auth",
            type: "folder",
            path: "src/components/Auth",
            children: [
              { name: "Login.tsx", type: "file", path: "src/components/Auth/Login.tsx", status: "added" },
              { name: "Logout.tsx", type: "file", path: "src/components/Auth/Logout.tsx", status: "added" },
              { name: "index.ts", type: "file", path: "src/components/Auth/index.ts" },
            ],
          },
          {
            name: "Dashboard",
            type: "folder",
            path: "src/components/Dashboard",
            children: [
              { name: "Chart.tsx", type: "file", path: "src/components/Dashboard/Chart.tsx" },
              { name: "Stats.tsx", type: "file", path: "src/components/Dashboard/Stats.tsx" },
            ],
          },
          { name: "Button.tsx", type: "file", path: "src/components/Button.tsx" },
          { name: "Input.tsx", type: "file", path: "src/components/Input.tsx" },
        ],
      },
      {
        name: "hooks",
        type: "folder",
        path: "src/hooks",
        children: [
          { name: "useAuth.ts", type: "file", path: "src/hooks/useAuth.ts", status: "added" },
          { name: "useLocalStorage.ts", type: "file", path: "src/hooks/useLocalStorage.ts" },
        ],
      },
      {
        name: "contexts",
        type: "folder",
        path: "src/contexts",
        children: [
          { name: "AuthContext.tsx", type: "file", path: "src/contexts/AuthContext.tsx", status: "added" },
          { name: "ThemeContext.tsx", type: "file", path: "src/contexts/ThemeContext.tsx" },
        ],
      },
      {
        name: "types",
        type: "folder",
        path: "src/types",
        children: [
          { name: "user.ts", type: "file", path: "src/types/user.ts" },
          { name: "api.ts", type: "file", path: "src/types/api.ts" },
        ],
      },
      { name: "App.tsx", type: "file", path: "src/App.tsx", status: "modified" },
      { name: "routes.ts", type: "file", path: "src/routes.ts", status: "modified" },
      { name: "main.tsx", type: "file", path: "src/main.tsx" },
    ],
  },
  { name: "package.json", type: "file", path: "package.json", status: "modified" },
  { name: "tsconfig.json", type: "file", path: "tsconfig.json" },
  { name: "README.md", type: "file", path: "README.md" },
];

export const mockLineSuggestions: LineSuggestion[] = [
  {
    lineNumber: 11,
    type: "warning",
    title: "any型の使用",
    description: "型安全性のためUser型を使用してください",
    suggestedComment: {
      gentle: "ここ、User型使うともっと安全になりそう！",
      neutral: "any型ではなくUser型を使用してください。",
      strict: "[TYPE] any型は型安全性を損ないます。User型に変更が必要です。",
    },
    suggestedCode: "const [user, setUser] = useState<User | null>(null);",
  },
  {
    lineNumber: 15,
    type: "warning",
    title: "useEffectの依存配列が不完全",
    description: "userIdが依存配列に含まれていないため、userIdが変更されても再実行されません",
    suggestedComment: {
      gentle: "依存配列にuserIdを入れると、変更時に再取得されて良さそう！",
      neutral: "useEffectの依存配列にuserIdを追加してください。",
      strict: "[HOOKS] 依存配列が不完全です。stale closureの原因になります。",
    },
    suggestedCode: "  }, [userId]);",
  },
  {
    lineNumber: 30,
    type: "error",
    title: "未定義の関数呼び出し",
    description: "navigate関数がインポートされていません",
    suggestedComment: {
      gentle: "navigateがimportされてないみたい、useNavigate使う感じかな？",
      neutral: "navigate関数が未定義です。react-routerからuseNavigateをインポートしてください。",
      strict: "[ERROR] 未定義関数の呼び出し。useNavigateフックをインポートし、コンポーネント内で呼び出してください。",
    },
    suggestedCode: "import { useNavigate } from 'react-router';\n// ...\nconst navigate = useNavigate();",
  },
];

export const mockCodeDiff = `@@ -1,15 +1,25 @@
 import { useState } from 'react';
+import { useAuth } from '../hooks/useAuth';

 export function App() {
   const [count, setCount] = useState(0);
+  const { user, isAuthenticated } = useAuth();

   return (
     <div className="app">
-      <h1>Welcome</h1>
+      <h1>Welcome{isAuthenticated ? \`, \${user.name}\` : ''}</h1>
       <button onClick={() => setCount(c => c + 1)}>
         Count: {count}
       </button>
+      {!isAuthenticated && (
+        <button onClick={() => navigate('/login')}>
+          Login
+        </button>
+      )}
     </div>
   );
 }`;

export const mockComments: Comment[] = [
  {
    id: "c1",
    reviewId: "2",
    filePath: "src/components/Dashboard/Chart.tsx",
    lineNumber: 42,
    content:
      "This useEffect is missing a cleanup function. The subscription should be cancelled on unmount.",
    author: "alice",
    resolved: false,
    parentId: null,
    createdAt: "2025-01-08T08:30:00Z",
  },
  {
    id: "c2",
    reviewId: "2",
    filePath: "src/components/Dashboard/Chart.tsx",
    lineNumber: 42,
    content: "Good catch! I'll add the cleanup.",
    author: "bob",
    resolved: false,
    parentId: "c1",
    createdAt: "2025-01-08T08:45:00Z",
  },
  {
    id: "c3",
    reviewId: "2",
    filePath: "src/components/Dashboard/Chart.tsx",
    lineNumber: 15,
    content: "Consider memoizing this calculation with useMemo.",
    author: "alice",
    resolved: true,
    parentId: null,
    createdAt: "2025-01-08T08:35:00Z",
  },
];

export const mockAIMessages = [
  {
    id: "ai1",
    role: "assistant" as const,
    content:
      "I've analyzed this code review. Here are my findings:\n\n**Potential Issues:**\n1. Missing cleanup in useEffect on line 42\n2. Possible memory leak from event listener\n\n**Suggestions:**\n- Add return statement with cleanup function\n- Consider using AbortController for fetch requests",
  },
];

export type AIIssue = {
  id: string;
  type: "error" | "warning" | "info" | "suggestion";
  title: string;
  description: string;
  filePath: string;
  lineNumber: number;
  codeSnippet: string;
  suggestion?: {
    code: string;
    explanation: string;
  };
  relatedSymbols?: {
    name: string;
    location: string;
    type: "definition" | "usage" | "type";
  }[];
};

export type AISummary = {
  overview: string;
  structureChanges: string[];
  impactedAreas: string[];
  conventionIssues: { severity: "error" | "warning" | "info"; message: string; location: string }[];
  riskLevel: "low" | "medium" | "high";
  testSuggestions: string[];
};

export const mockAISummary: AISummary = {
  overview:
    "このPRはユーザー認証フローを追加します。Login/Logoutコンポーネント、useAuthフック、AuthContextを新規作成し、既存のAppとroutesを更新しています。",
  structureChanges: [
    "新規: 認証関連コンポーネント (Auth/)",
    "新規: useAuthカスタムフック",
    "新規: AuthContextプロバイダー",
    "変更: App.tsxにAuthProvider追加",
    "変更: routes.tsに認証ルート追加",
  ],
  impactedAreas: ["App.tsx", "routes.ts", "全ての認証が必要なページ"],
  conventionIssues: [
    { severity: "warning", message: "useEffectの依存配列が不完全", location: "Login.tsx:42" },
    { severity: "warning", message: "any型の使用", location: "useAuth.ts:15" },
    { severity: "info", message: "コンポーネントのメモ化を検討", location: "Login.tsx:28" },
  ],
  riskLevel: "medium",
  testSuggestions: [
    "ログイン成功/失敗のテスト",
    "セッション有効期限切れのテスト",
    "未認証時のリダイレクトテスト",
  ],
};

export const mockAIIssues: AIIssue[] = [
  {
    id: "issue-1",
    type: "warning",
    title: "useEffectの依存配列が不完全",
    description:
      "userIdが依存配列に含まれていないため、userIdが変更されてもfetchUserが再実行されません。これによりstale closureが発生する可能性があります。",
    filePath: "src/components/Auth/Login.tsx",
    lineNumber: 42,
    codeSnippet: `useEffect(() => {
  fetchUser(userId);
}, []);`,
    suggestion: {
      code: `useEffect(() => {
  fetchUser(userId);
}, [userId]);`,
      explanation: "userIdを依存配列に追加することで、userIdが変更された際に副作用が再実行されます。",
    },
    relatedSymbols: [
      { name: "fetchUser", location: "useAuth.ts:23", type: "definition" },
      { name: "userId", location: "Login.tsx:12", type: "usage" },
      { name: "User", location: "types/user.ts:5", type: "type" },
    ],
  },
  {
    id: "issue-2",
    type: "warning",
    title: "any型の使用",
    description: "明示的な型定義がないため、型安全性が損なわれています。",
    filePath: "src/hooks/useAuth.ts",
    lineNumber: 15,
    codeSnippet: `const [user, setUser] = useState<any>(null);`,
    suggestion: {
      code: `const [user, setUser] = useState<User | null>(null);`,
      explanation: "User型を使用することで型安全性が向上します。",
    },
    relatedSymbols: [{ name: "User", location: "types/user.ts:5", type: "type" }],
  },
  {
    id: "issue-3",
    type: "info",
    title: "コンポーネントのメモ化を検討",
    description:
      "このコンポーネントは頻繁に再レンダリングされる可能性があります。React.memoでラップすることを検討してください。",
    filePath: "src/components/Auth/Login.tsx",
    lineNumber: 28,
    codeSnippet: `export function LoginForm({ onSubmit }) {`,
    suggestion: {
      code: `export const LoginForm = memo(function LoginForm({ onSubmit }) {`,
      explanation: "React.memoを使用することで不要な再レンダリングを防げます。",
    },
  },
];

export type ReviewCommentDraft = {
  id: string;
  issueId: string;
  filePath: string;
  lineNumber: number;
  content: string;
  tone: "gentle" | "neutral" | "strict";
  suggestion?: string;
};

export const statusLabels: Record<ReviewStatus, string> = {
  pending: "Pending",
  in_review: "In Review",
  changes_requested: "Changes Requested",
  approved: "Approved",
  merged: "Merged",
};

export const statusColors: Record<ReviewStatus, string> = {
  pending: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  in_review: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  changes_requested: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
  approved: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  merged: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
};

export const priorityColors: Record<Priority, string> = {
  high: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  low: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};
