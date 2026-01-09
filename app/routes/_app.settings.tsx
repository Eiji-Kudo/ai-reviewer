import { useState } from "react";

export function meta() {
  return [
    { title: "Settings - Reviewer" },
    { name: "description", content: "Configure your preferences" },
  ];
}

export default function Settings() {
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("claude-3-opus");
  const [autoAnalyze, setAutoAnalyze] = useState(true);
  const [strictMode, setStrictMode] = useState(false);

  return (
    <div className="min-h-full p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Configure your Reviewer preferences
          </p>
        </div>

        <div className="space-y-6">
          <section className="card p-6 animate-fade-in" style={{ animationDelay: "100ms" }}>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <AIIcon />
              AI Configuration
            </h2>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="api-key"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  API Key
                </label>
                <input
                  id="api-key"
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-..."
                  className="input-field"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Your API key is stored locally and never sent to our servers.
                </p>
              </div>

              <div>
                <label
                  htmlFor="model"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  AI Model
                </label>
                <select
                  id="model"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="input-field"
                >
                  <option value="claude-3-opus">Claude 3 Opus</option>
                  <option value="claude-3-sonnet">Claude 3 Sonnet</option>
                  <option value="claude-3-haiku">Claude 3 Haiku</option>
                  <option value="gpt-4">GPT-4</option>
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                </select>
              </div>

              <div className="flex items-center justify-between py-3 border-t border-gray-100 dark:border-gray-800">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Auto-analyze reviews
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Automatically analyze new code reviews with AI
                  </p>
                </div>
                <Toggle checked={autoAnalyze} onChange={setAutoAnalyze} />
              </div>

              <div className="flex items-center justify-between py-3 border-t border-gray-100 dark:border-gray-800">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Strict mode</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Apply stricter code quality checks
                  </p>
                </div>
                <Toggle checked={strictMode} onChange={setStrictMode} />
              </div>
            </div>
          </section>

          <section className="card p-6 animate-fade-in" style={{ animationDelay: "200ms" }}>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <IntegrationIcon />
              Integrations
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-900 dark:bg-white flex items-center justify-center">
                    <GitHubIcon />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">GitHub</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Not connected</p>
                  </div>
                </div>
                <button type="button" className="btn-secondary text-sm">
                  Connect
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center">
                    <GitLabIcon />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">GitLab</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Coming soon</p>
                  </div>
                </div>
                <button type="button" className="btn-ghost text-sm" disabled>
                  Connect
                </button>
              </div>
            </div>
          </section>

          <section className="card p-6 animate-fade-in" style={{ animationDelay: "300ms" }}>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <NotificationIcon />
              Notifications
            </h2>
            <div className="space-y-3">
              <NotificationOption
                title="New review assigned"
                description="Get notified when you're assigned to review"
                defaultChecked={true}
              />
              <NotificationOption
                title="Comments on your reviews"
                description="Get notified when someone comments on your code"
                defaultChecked={true}
              />
              <NotificationOption
                title="Review status changes"
                description="Get notified when a review is approved or merged"
                defaultChecked={false}
              />
              <NotificationOption
                title="AI analysis complete"
                description="Get notified when AI finishes analyzing a review"
                defaultChecked={true}
              />
            </div>
          </section>

          <div
            className="flex justify-end gap-3 animate-fade-in"
            style={{ animationDelay: "400ms" }}
          >
            <button type="button" className="btn-ghost">
              Cancel
            </button>
            <button type="button" className="btn-primary">
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors ${
        checked ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

function NotificationOption({
  title,
  description,
  defaultChecked,
}: {
  title: string;
  description: string;
  defaultChecked: boolean;
}) {
  const [checked, setChecked] = useState(defaultChecked);

  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
      <div>
        <p className="text-sm font-medium text-gray-900 dark:text-white">{title}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
      </div>
      <Toggle checked={checked} onChange={setChecked} />
    </div>
  );
}

function AIIcon() {
  return (
    <svg className="w-5 h-5 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
      />
    </svg>
  );
}

function IntegrationIcon() {
  return (
    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
      />
    </svg>
  );
}

function NotificationIcon() {
  return (
    <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
      />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg className="w-6 h-6 text-white dark:text-gray-900" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

function GitLabIcon() {
  return (
    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
      <path d="m23.6 9.593-1.248-3.85-2.449-7.54a.403.403 0 0 0-.768 0l-2.45 7.54H7.314l-2.45-7.54a.403.403 0 0 0-.767 0L1.647 5.742.4 9.593a.807.807 0 0 0 .293.903l11.307 8.214 11.307-8.214a.807.807 0 0 0 .293-.903Z" />
    </svg>
  );
}
