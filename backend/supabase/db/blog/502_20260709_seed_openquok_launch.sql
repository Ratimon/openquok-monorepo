-- ---------------------------
-- MODULE NAME: OpenQuok Launch Blog Post
-- MODULE DATE: 20260709
-- MODULE SCOPE: seed
-- ---------------------------

BEGIN;

INSERT INTO public.blog_posts (
    id,
    user_id,
    topic_id,
    title,
    slug,
    description,
    content,
    hero_image_filename,
    is_sponsored,
    is_admin_approved,
    is_user_published,
    is_featured,
    created_at,
    updated_at,
    published_at
) VALUES (
    'ef95db27-a5f1-41a9-ab59-e01119d24254',
    (
        SELECT id
        FROM public.users
        WHERE id = '252ec36e-c237-4375-abc4-f5769b89afa6'
        LIMIT 1
    ),
    'd5f7a000-0000-4000-a000-000000000301',
    'OpenQuok: Social Content Needs Integrity, Not Only Autopilot',
    'openquok-social-content-needs-integrity-not-only-autopilot',
    'Why we built OpenQuok - an open-source, agent-native social scheduler where AI handles volume and humans protect quality through review, workspace isolation, and analytics.',
    $OPENQUOK_LAUNCH_POST$
<h2>Why we built an agent-native scheduler - and why review is the product.</h2>
<h3>The problem is not posting. It is trust.</h3>
<p>Posting used to be the hard part: five platforms, five formats, five time zones, one wrong account at 2 a.m.</p>
<p>That is getting easier. AI drafts. Tools schedule. Workflows spin up in an afternoon.</p>
<p>But feeds often feel worse - more output, less signal, the same AI rhythm published without a second thought.</p>
<p>We do not have a scheduling problem anymore. We have a trust problem: the gap between what you mean to say and what actually goes live.</p>
<h3>Speed without judgment scales noise</h3>
<p>Your social presence is a public record. Every off-brand draft and every "good enough" thread chips away at the story people believe about you.</p>
<p>AI content fails not only when models slip up. It fails when too much goes out without anyone standing behind it.</p>
<p>OpenQuok helps teams move fast without giving up that judgment - agents handle volume, humans protect what goes public.</p>
<h3>Too much context makes AI worse</h3>
<p>Run one assistant across five clients and twelve channels, and you have probably seen it: mixed voices, wrong accounts, drafts from last week's campaign.</p>
<p>More context is not always better. Dump everything into one pile and details blur while confidence stays high.</p>
<p>OpenQuok uses workspaces - separate spaces per brand or client, each with its own channels, credentials, and agent connection. Scale volume without Client A bleeding into Client B.</p>
<h3>Review is the real job now</h3>
<p>If you work with AI, you likely spend less time making and more time checking. The bottleneck moved upstream. Review became the work.</p>
<p>Most schedulers were not built for that. OpenQuok was.</p>
<p>Agents draft from Claude, Cursor, OpenClaw, Hermes, and others. Drafts land on a kanban board: draft -&gt; review -&gt; scheduled -&gt; published. You approve what goes live. Nothing publishes on autopilot unless you choose it.</p>
<blockquote>
  <p>Let AI agents handle volume. You handle quality.</p>
</blockquote>
<p>We are not against automation. We are against unreviewed automation.</p>
<h3>Automate throughput. Keep the human gate.</h3>
<p>Some loops can run safely on their own. Social publishing usually is not one of them - a bad post can cost trust, publicly and permanently.</p>
<p>OpenQuok automates drafting, scheduling, and analytics. Judgment stays human: review, edit, approve before publish.</p>
<p>Calendar and kanban are not admin screens. They are checkpoints - where "generated" becomes "ours."</p>
<h3>When everything is easy to make, people choose what they trust</h3>
<p>Execution is cheap now. Audiences have endless options. People do not pick tools only because they work - they pick what they trust.</p>
<p>"Our scheduler posts to 12 platforms" is a baseline, not a vision. What matters is whether your audience believes the voice behind the posts - and whether you believe it before you hit publish.</p>
<h3>Tools should make you sharper, not replace thinking</h3>
<p>The best tools make you better at the work - not just faster through it.</p>
<p>Use AI to draft and explore. Still write the brief, edit the line that matters, review before anything goes public. That is the balance OpenQuok supports: agents at scale, humans at the gate.</p>
<h3>What OpenQuok is</h3>
<p>OpenQuok is a 100% open-source, agent-native social media scheduler.</p>
<p>Connect channels. Let agents draft via skills, MCP, or the CLI. Review on calendar or kanban. Customize per network. Track what wins. Scale with workspaces - not one overloaded context.</p>
<p>Built for agentic teams, developers who want API and self-hosting, and scaling teams who need quality approval at volume.</p>
<blockquote>
  <p>Save hours managing AI content at scale - not by removing yourself from the process.</p>
</blockquote>
<h3>Start free. Publish with confidence.</h3>
<p>The next era will not be won by whoever posts the most. It will be won by whoever keeps integrity between what they mean and what they publish.</p>
<ul>
  <li>Start for $0 - 7-day free trial, no credit card required</li>
  <li>Get started with the CLI - connect your first agent</li>
  <li>Self-host for free - run it on your infrastructure</li>
</ul>
<p>We are not here to sell you autopilot. We are here to help you publish with confidence.</p>
$OPENQUOK_LAUNCH_POST$,
    'aa1a6c25-d1dc-43d7-9b13-a3e8ac48caf1-0.09461654243460471.jpg',
    FALSE,
    TRUE,
    TRUE,
    TRUE,
    '2026-07-09 10:45:14.331699+00',
    '2026-07-09 11:27:27.817069+00',
    '2026-07-09 10:45:56.964732+00'
)
ON CONFLICT (slug) DO UPDATE
SET
    user_id = COALESCE(EXCLUDED.user_id, public.blog_posts.user_id),
    topic_id = EXCLUDED.topic_id,
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    content = EXCLUDED.content,
    hero_image_filename = EXCLUDED.hero_image_filename,
    is_sponsored = EXCLUDED.is_sponsored,
    is_admin_approved = EXCLUDED.is_admin_approved,
    is_user_published = EXCLUDED.is_user_published,
    is_featured = EXCLUDED.is_featured,
    updated_at = EXCLUDED.updated_at,
    published_at = COALESCE(public.blog_posts.published_at, EXCLUDED.published_at);

COMMIT;
