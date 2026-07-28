import { readFileSync } from "node:fs";
import { isAbsolute, join, resolve } from "node:path";
import process from "node:process";

const SAFE_CONTROL_ENV_KEYS = new Set([
  "CODEX_SUBSCRIPTION_BIN",
  "CLAUDE_SUBSCRIPTION_BIN",
  "CODEX_HOME",
]);
const PROVIDER_OR_CLOUD_ENV = /^(?:OPENAI|CODEX|ANTHROPIC|CLAUDE|OLLAMA|AWS|AZURE|GOOGLE|GCP|VERTEX|BEDROCK|FOUNDRY)(?:_|$)/iu;
const PROVIDER_ROUTE_OR_CREDENTIAL_ENV = /(?:API_KEY|AUTH_TOKEN|OAUTH_TOKEN|ACCESS_TOKEN|BASE_URL|API_BASE|HOST|PROFILE|BACKEND|USE_BEDROCK|USE_VERTEX|USE_FOUNDRY|CLOUD_ROUTING|BILLING(?:_ACCOUNT)?|PROJECT_ID|ORG_ID|ACCOUNT_ID|ACCESS_KEY_ID|SECRET_ACCESS_KEY|SECRET_KEY|SESSION_TOKEN|APPLICATION_CREDENTIALS|MODEL|REGION)$/iu;
const PROXY_ENV = /^(?:HTTP|HTTPS|ALL|NO)_PROXY$/iu;

export const CODEX_PERMISSION_PROFILE_ID = "study-minimal";
export const CODEX_PERMISSION_PROFILE_SELECTION =
  `default_permissions="${CODEX_PERMISSION_PROFILE_ID}"`;
export const CODEX_PERMISSION_PROFILE_DEFINITION =
  `permissions={${CODEX_PERMISSION_PROFILE_ID}={filesystem={":minimal"="read"}}}`;

export const CODEX_ISOLATION = Object.freeze({
  ephemeral: true,
  approval_policy: "never",
  sandbox: "custom-permissions-profile",
  permissions_profile: Object.freeze({
    id: CODEX_PERMISSION_PROFILE_ID,
    config_overrides: Object.freeze([
      CODEX_PERMISSION_PROFILE_SELECTION,
      CODEX_PERMISSION_PROFILE_DEFINITION,
    ]),
    filesystem: Object.freeze({ ":minimal": "read" }),
    network: "restricted",
    managed_requirements: "included-in-offline-proof-with-no-warnings",
  }),
  ignore_user_config: true,
  ignore_rules: true,
  empty_working_directory: true,
});

export const CLAUDE_ISOLATION = Object.freeze({
  safe_mode: true,
  setting_sources: Object.freeze([]),
  strict_mcp_config: true,
  mcp_config: Object.freeze({}),
  slash_commands: false,
  chrome: false,
  tools: Object.freeze([]),
  session_persistence: false,
  max_turns: 1,
  empty_working_directory: true,
});

export function assertSubscriptionAccess({ codexStatus, claudeStatus, env = process.env }) {
  buildSubscriptionChildEnv(env);
  if (!String(codexStatus).includes("Logged in using ChatGPT")) {
    throw new Error("Codex must use the ChatGPT subscription login");
  }
  let claude;
  try {
    claude = JSON.parse(claudeStatus);
  } catch {
    throw new Error("Claude Code subscription status is not valid JSON");
  }
  if (!claude.loggedIn || claude.authMethod !== "claude.ai" || claude.subscriptionType !== "max") {
    throw new Error("Claude Code must use the claude.ai Max subscription login");
  }
  if (["OPENAI_API_KEY", "CODEX_API_KEY", "ANTHROPIC_API_KEY"].some((name) => env[name])) {
    throw new Error("API credentials must be absent during subscription collection");
  }
}

export function buildSubscriptionChildEnv(ambientEnv = process.env) {
  for (const [name, value] of Object.entries(ambientEnv)) {
    if (!value || SAFE_CONTROL_ENV_KEYS.has(name)) continue;
    if ((PROVIDER_OR_CLOUD_ENV.test(name) && PROVIDER_ROUTE_OR_CREDENTIAL_ENV.test(name))
      || PROXY_ENV.test(name)) {
      throw new Error(`API credentials or routing are forbidden in the subscription child environment variable: ${name}`);
    }
  }
  if (!isAbsolute(ambientEnv.HOME ?? "")) {
    throw new Error("Subscription child environment requires an absolute HOME");
  }
  const codexHome = join(resolve(ambientEnv.HOME), ".codex");
  if (ambientEnv.CODEX_HOME && resolve(ambientEnv.CODEX_HOME) !== codexHome) {
    throw new Error("Subscription child CODEX_HOME must be the isolated HOME/.codex directory");
  }
  return {
    CODEX_HOME: codexHome,
    HOME: ambientEnv.HOME,
    LANG: "C",
    LC_ALL: "C",
    NO_COLOR: "1",
    PATH: "/usr/bin:/bin:/usr/sbin:/sbin",
    TERM: "dumb",
  };
}

export function renderCliPrompt(request) {
  if (!Array.isArray(request?.messages) || request.messages.length !== 2
    || request.messages[0].role !== "system" || request.messages[1].role !== "user") {
    throw new Error("Expected one system and one user message");
  }
  return `SYSTEM:\n${request.messages[0].content}\n\nUSER:\n${request.messages[1].content}\n`;
}

export function buildSubscriptionCommand(
  systemId,
  schemaPath,
  cwd,
  { codexBin = "codex", claudeBin = "claude", schemaBytes } = {},
) {
  if (systemId === "codex-cli/gpt-5.5") {
    return {
      command: codexBin,
      args: [
        "--ask-for-approval", "never", "exec", "--ephemeral", "--json",
        "--ignore-user-config", "--ignore-rules",
        "--config", CODEX_PERMISSION_PROFILE_SELECTION,
        "--config", CODEX_PERMISSION_PROFILE_DEFINITION,
        "--skip-git-repo-check",
        "--cd", cwd, "--model", "gpt-5.5", "--output-schema", schemaPath, "-",
      ],
    };
  }
  if (systemId === "claude-code/sonnet") {
    return {
      command: claudeBin,
      args: [
        "-p", "--safe-mode", "--setting-sources", "", "--strict-mcp-config",
        "--mcp-config", "{}", "--disable-slash-commands", "--no-chrome",
        "--output-format", "json", "--json-schema",
        JSON.stringify(JSON.parse(schemaBytes ?? readFileSync(schemaPath, "utf8"))),
        "--max-turns", "1", "--no-session-persistence", "--tools", "", "--model", "sonnet",
      ],
      cwd,
    };
  }
  throw new Error(`Unknown subscription review system: ${systemId}`);
}
