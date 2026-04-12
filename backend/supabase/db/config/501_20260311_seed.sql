-- ---------------------------
-- MODULE NAME: config
-- MODULE DATE: 20260311
-- MODULE SCOPE: Seed
-- ---------------------------

BEGIN;

-- ---------------------------
-- Company Information Config
-- ---------------------------

INSERT INTO public.module_configs (module_name, config) VALUES
('company_information', '{
  "NAME": "Openquok",
  "LEGAL_NAME": "Openquok",
  "VAT_ID": "",
  "COMPANY_ADDRESS": "",
  "URL": "https://www.openquok.com/",
  "SUPPORT_EMAIL": "support@openquok.com",
  "SUPPORT_PHONE": "",
  "FOUNDING_YEAR": "",
  "RESPONSIBLE_PERSON": ""
}'::jsonb)
ON CONFLICT (module_name) DO NOTHING;

-- ---------------------------
-- Marketing Information Config
-- ---------------------------

INSERT INTO public.module_configs (module_name, config) VALUES
('marketing_information', '{
  "META_TITLE": "Openquok",
  "META_DESCRIPTION": "A content platform.",
  "META_KEYWORDS": "content, platform",
  "SOCIAL_LINKS_X": "",
  "SOCIAL_LINKS_FACEBOOK": "",
  "SOCIAL_LINKS_INSTAGRAM": "",
  "SOCIAL_LINKS_YOUTUBE": ""
}'::jsonb)
ON CONFLICT (module_name) DO NOTHING;

-- ---------------------------
-- Landing Page Config
-- ---------------------------

INSERT INTO public.module_configs (module_name, config) VALUES
('landing_page', '{
  "HERO_TITLE": "Welcome",
  "HERO_SLOGAN": "Your platform. Your content.",
  "ACTIVE_TOP_BANNER": "false",
  "SOLUTION_SUBTITLE": "SOLUTIONS",
  "SOLUTION_TITLE": "What We Offer",
  "SOLUTION_DESCRIPTION": "Explore the tools and features that power your experience.",
  "HOW_IT_WORKS_1_SUBTITLE": "HOW IT WORKS",
  "HOW_IT_WORKS_1_TITLE": "Get Started",
  "HOW_IT_WORKS_2_SUBTITLE": "HOW IT WORKS",
  "HOW_IT_WORKS_2_TITLE": "Create and Manage",
  "HOW_IT_WORKS_3_SUBTITLE": "HOW IT WORKS",
  "HOW_IT_WORKS_3_TITLE": "Share and Grow",
  "HOW_IT_WORKS_1_DESCRIPTION": "Sign up and set up your account in a few steps.",
  "HOW_IT_WORKS_2_DESCRIPTION": "Create content, manage settings, and customize your experience.",
  "HOW_IT_WORKS_3_DESCRIPTION": "Share with your audience and grow your presence.",
  "FEATURES_SUBTITLE": "FEATURES",
  "FEATURES_TITLE": "Features",
  "FEATURES_DESCRIPTION": "Discover what you can do with the platform.",
  "COMPARISON_SUBTITLE": "COMPARISONS",
  "COMPARISON_TITLE": "Why Choose Us",
  "COMPARISON_DESCRIPTION": "A platform built for clarity and ease of use.",
  "COMPARISON_WITHOUT_TITLE": "Without a platform",
  "COMPARISON_WITH_TITLE": "With us",
  "CTA_BANNER_WITH_IMAGE_SUBTITLE": "CONTRIBUTE",
  "CTA_BANNER_WITH_IMAGE_TITLE": "Join Us",
  "CTA_BANNER_WITH_IMAGE_DESCRIPTION": "Create an account and start using the platform.",
  "PRICING_SUBTITLE": "PRICING",
  "PRICING_TITLE": "Choose Your Plan",
  "PRICING_DESCRIPTION": "Select a plan that fits your needs.",
  "FAQ_SUBTITLE": "FAQs",
  "FAQ_TITLE": "Frequently Asked Questions",
  "FAQ_DESCRIPTION": "Common questions and answers. Contact us if you need more help.",
  "PLANS_SUBTITLE": "PLANS",
  "PLANS_TITLE": "Choose Your Plan",
  "PLANS_DESCRIPTION": "Select a plan that fits your needs.",
  "CREDIT_PACKS_SUBTITLE": "CREDIT PACKS",
  "CREDIT_PACKS_TITLE": "Credit Packs",
  "CREDIT_PACKS_DESCRIPTION": "One-time purchase, use anytime.",
  "PAGE_PACK_SUBTITLE": "PAGE PACK",
  "PAGE_PACK_TITLE": "Page Pack",
  "PAGE_PACK_DESCRIPTION": "Get your space with custom options.",
  "FAQ_PRICING_DESCRIPTION": "Find answers about pricing and plans.",
  "CTA_BANNER_BIG_SUBTITLE": "GETTING STARTED",
  "CTA_BANNER_BIG_TITLE": "Get Started",
  "CTA_BANNER_BIG_DESCRIPTION": "Create your account and get started today."
}'::jsonb)
ON CONFLICT (module_name) DO NOTHING;

-- ---------------------------
-- END OF FILE
-- ---------------------------

COMMIT;
