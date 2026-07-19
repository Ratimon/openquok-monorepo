/** Commented CLI snippets aligned with agent/skills/openquok-core/resources/command-reference.md */

export const OPENQUOK_COMMAND_TEMPLATES: Record<string, string> = {
	'config:show': '# Print resolved API URLs and auth server (no secrets)\nopenquok config:show',
	'auth:login':
		'# Start device OAuth (messaging agents: use --json --no-poll, then auth:login:poll)\nopenquok auth:login --json --no-poll',
	'auth:login:poll':
		'# Complete device OAuth after the user authorizes in the browser\nopenquok auth:login:poll --device-code "<device_code>"',
	'auth:status': '# Check whether stored credentials or OPENQUOK_API_KEY are valid\nopenquok auth:status',
	'auth:workspace': '# Return the current workspace id and name\nopenquok auth:workspace',
	'auth:logout': '# Clear stored CLI credentials\nopenquok auth:logout',
	'integrations:list':
		'# List all connected social channels (integration UUIDs)\nopenquok integrations:list',
	'integrations:groups':
		'# List channel groups (customers) as {id, name}\nopenquok integrations:groups',
	'integrations:settings':
		'# Get posting rules, character limits, and settings schema for an integration\nopenquok integrations:settings <integration-uuid>',
	'integrations:trigger':
		'# Trigger an allow-listed provider method to fetch dynamic data\nopenquok integrations:trigger <integration-uuid> <method-name> -d \'{"param":"value"}\'',
	'posts:list':
		'# List posts in a date window (default ±30 local calendar days)\nopenquok posts:list --start "2026-01-01T00:00:00Z" --end "2026-02-01T00:00:00Z"',
	'posts:create':
		'# Create or schedule a post (upload media first — Rule 2 in openquok-core)\nopenquok posts:create --json ./post.json',
	'posts:status':
		'# Flip a post between draft and scheduled at its stored publish time\nopenquok posts:status <post-id> --status draft',
	'posts:review-todo': '# Attach a human review note to a post row\nopenquok posts:review-todo <post-id> --note "Needs approval"',
	'posts:delete': '# Delete a post row from the workspace\nopenquok posts:delete <post-id>',
	'posts:missing':
		'# List provider release candidates when release_id is missing\nopenquok posts:missing <post-id>',
	'posts:connect':
		'# Link a post to a provider release id for per-post analytics\nopenquok posts:connect <post-id> --release-id "<provider-release-id>"',
	'analytics:platform':
		'# Platform-level metrics for a connected channel (7, 30, or 90 days)\nopenquok analytics:platform <integration-uuid> --days 7',
	'analytics:post':
		'# Per-post metrics for a published post row\nopenquok analytics:post <post-id> --days 7',
	upload: '# Upload a local image or video; returns media id and path for posts:create\nopenquok upload ./image.png',
	'upload-from-url':
		'# Upload media from a remote URL; returns media id and path\nopenquok upload-from-url "https://cdn.example.com/banner.png"',
	'plugs:catalog':
		'# List global plug types per provider (likes-threshold channel rules)\nopenquok plugs:catalog',
	'plugs:list':
		'# List saved global plug rules for a connected channel\nopenquok plugs:list <integration-uuid>',
	'plugs:upsert':
		'# Create or update a global plug rule on a channel\nopenquok plugs:upsert <integration-uuid> --func autoPlugPost --fields \'[{"name":"likesAmount","value":"100"},{"name":"post","value":"Thanks!"}]\'',
	'plugs:activate':
		'# Enable or pause a global plug rule\nopenquok plugs:activate <plug-id> --activated true',
	'plugs:delete': '# Delete a global plug rule\nopenquok plugs:delete <plug-id>'
};

export const OPENQUOK_CORE_QUICK_REFERENCE = `# ⚠️ AUTHENTICATE FIRST — required before any other command
openquok auth:status                                             # Check if authenticated
openquok auth:login --json --no-poll                             # Device OAuth step 1 (messaging agents)
openquok auth:login:poll --device-code "<device_code>"           # Device OAuth step 2
openquok auth:login --apiKey "opo_…"                             # Or use programmatic token
openquok auth:logout                                             # Remove stored credentials
export OPENQUOK_API_KEY=opo_…                                    # Env token (disk creds take priority)

# Discovery (only after auth is confirmed)
openquok integrations:list                           # List connected channels (integration UUIDs)
openquok integrations:list --group <group-id>        # Channels in a customer group
openquok integrations:groups                         # List channel groups
openquok integrations:settings <integration-uuid>    # Posting rules, limits, settings schema
openquok integrations:trigger <uuid> <method> -d '{}'  # Fetch dynamic provider data

# Posting (scheduledAt / -s is REQUIRED)
openquok posts:create -c "text" -s "2026-01-01T12:00:00Z" -i "<uuid>"                  # Simple
openquok posts:create -c "text" -s "2026-01-01T12:00:00Z" -t draft -i "<uuid>"        # Draft
openquok posts:create -c "text" -m '<[{id,path}]>' -s "2026-01-01T12:00:00Z" -i "<uuid>"  # With media (upload first — Rule 2)
openquok posts:create -c "main" -c "reply" -s "2026-01-01T12:00:00Z" -d 5000 -i "<uuid>"  # Thread segments (-d ms)
openquok posts:create --json ./post.json                                             # Complex

# Management
openquok posts:list                                  # List posts (default ±30 local days)
openquok posts:delete <post-id>                      # Delete post
openquok posts:status <post-id> --status draft       # Move to draft
openquok posts:status <post-id> -s schedule          # Queue draft for publishing
openquok upload ./image.png                          # Upload media (returns id + path)
openquok upload-from-url "https://…"                 # Upload from URL

# Analytics
openquok analytics:platform <integration-uuid>       # Platform analytics (7 days)
openquok analytics:platform <integration-uuid> -d 30   # Platform analytics (30 days)
openquok analytics:post <post-id>                      # Post analytics (7 days)
openquok analytics:post <post-id> -d 30                # Post analytics (30 days)
# If release_id is missing, resolve before per-post analytics work:
openquok posts:missing <post-id>                     # List provider release candidates
openquok posts:connect <post-id> --release-id "<rid>"  # Link post to provider content

# Global plugs (likes-threshold channel rules)
openquok plugs:catalog                                  # Plug types per provider
openquok plugs:list <integration-uuid>                  # Saved rules on a channel
openquok plugs:upsert <integration-uuid> --func autoPlugPost --fields '[{"name":"likesAmount","value":"100"},{"name":"post","value":"Thanks!"}]'
openquok plugs:activate <plug-id> --activated false     # Pause or resume a rule
openquok plugs:delete <plug-id>                         # Remove a rule

# Help
openquok --help
openquok posts:create --help`;

export function resolveOpenquokCommandTemplate(commandName: string, fallback?: string): string | undefined {
	const trimmed = commandName.trim();
	if (!trimmed) return fallback?.trim() || undefined;
	return OPENQUOK_COMMAND_TEMPLATES[trimmed] ?? fallback?.trim() ?? `openquok ${trimmed}`;
}
