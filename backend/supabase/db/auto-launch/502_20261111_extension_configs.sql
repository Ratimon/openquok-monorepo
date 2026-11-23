-- ---------------------------
-- MODULE NAME: Auto Launch
-- MODULE DATE: 20261111
-- MODULE SCOPE: Seed (synced extension_config from destination-configs/*.ts)
-- GENERATED — do not edit; run pnpm sync:auto-launch-configs
-- ---------------------------

BEGIN;

UPDATE public.auto_launch_destinations
SET extension_config = $json${
    "version": 1,
    "startUrlPatterns": [
        "https://devhunt.org/*"
    ],
    "readyUrlHint": "account/tools/new",
    "readyStatusHint": "Sign in on DevHunt, then open the new-tool form. Skip or review any AI draft from your website URL, then use OpenQuok on the tool form. Launch week and $49 checkout stay manual on DevHunt.",
    "steps": [
        {
            "id": "submit_tool",
            "label": "Submit tool",
            "fields": [
                {
                    "key": "logo",
                    "label": "Tool logo",
                    "labelAliases": [
                        "Logo"
                    ],
                    "profilePath": "logo_url",
                    "fillMode": "file",
                    "fileInputIndex": 0,
                    "required": true,
                    "selectorHint": "input[type='file'][accept*='image'], input[type='file'][accept*='png' i]"
                },
                {
                    "key": "gallery",
                    "label": "Tool screenshots",
                    "labelAliases": [
                        "Screenshots",
                        "Gallery"
                    ],
                    "profilePath": "profile_data.gallery_urls",
                    "fillMode": "files",
                    "fileInputIndex": 0,
                    "maxItems": 3,
                    "required": true,
                    "selectorHint": "#tool-screenshots-container input[type='file']"
                },
                {
                    "key": "name",
                    "label": "Tool name",
                    "profilePath": "name",
                    "fillMode": "text",
                    "required": true,
                    "selectorHint": "input[placeholder*='My Awesome Dev Tool' i], input[name*='tool_name' i], input[aria-label*='tool name' i]"
                },
                {
                    "key": "tagline",
                    "label": "Catchy slogan",
                    "labelAliases": [
                        "Slogan",
                        "Tagline"
                    ],
                    "profilePath": "tagline",
                    "fillMode": "text",
                    "required": true,
                    "selectorHint": "input[placeholder*='Supercharge Your Development Workflow' i], input[name*='slogan' i], textarea[name*='slogan' i]"
                },
                {
                    "key": "website",
                    "label": "Tool website URL",
                    "labelAliases": [
                        "Website URL",
                        "Website"
                    ],
                    "profilePath": "website_url",
                    "fillMode": "text",
                    "required": true,
                    "selectorHint": "input[placeholder*='myawesomedevtool' i], input[type='url'], input[name*='tool_website' i], input[name*='website' i]"
                },
                {
                    "key": "description",
                    "label": "Quick Description",
                    "labelAliases": [
                        "Description"
                    ],
                    "profilePath": "description",
                    "fillMode": "rich_html",
                    "required": true,
                    "selectorHint": "textarea[placeholder*='Briefly explain what your tool does' i], [contenteditable='true'], .ProseMirror, .tiptap, textarea[name*='tool_description' i]"
                },
                {
                    "key": "social_github",
                    "label": "GitHub repo URL",
                    "labelAliases": [
                        "GitHub repo URL (optional)",
                        "GitHub"
                    ],
                    "profilePath": "profile_data.social_github",
                    "fillMode": "text",
                    "selectorHint": "input[placeholder*='github.com/username' i], input[name*='github' i], input[name*='github_repo' i]",
                    "profileSourcePaths": [
                        "profile_data.repository_url"
                    ]
                },
                {
                    "key": "pricing_type",
                    "label": "Tool pricing type",
                    "labelAliases": [
                        "Pricing type",
                        "Pricing"
                    ],
                    "profilePath": "profile_data.pricing_type",
                    "fillMode": "select",
                    "selectCatalog": "devhunt_pricing",
                    "selectorHint": "#pricing-container input[type='radio'][name='pricing_type'], input[type='radio'][name='pricing_type'], input[type='radio'][name*='pricing_type' i]"
                },
                {
                    "key": "categories",
                    "label": "Tool categories",
                    "labelAliases": [
                        "Categories"
                    ],
                    "profilePath": "profile_data.categories",
                    "fillMode": "tags",
                    "selectorHint": "input[name*='categor' i], input[placeholder*='categor' i], [aria-label*='categor' i]"
                },
                {
                    "key": "demo_video",
                    "label": "Demo video",
                    "labelAliases": [
                        "Demo video (optional)"
                    ],
                    "profilePath": "profile_data.launch_video_url",
                    "fillMode": "text",
                    "selectorHint": "input[placeholder*='Demo video (optional)' i], input[name*='demo_video' i], input[type='url'][placeholder*='video' i]"
                }
            ]
        }
    ],
    "proof": {
        "successPathRegex": "/tool/|/account/tools",
        "listingUrlSelector": "a[href*='devhunt.org/tool/']"
    }
}$json$::jsonb
WHERE provider_slug = 'devhunt-paid-launch';

UPDATE public.auto_launch_destinations
SET extension_config = $json${
    "version": 1,
    "startUrlPatterns": [
        "https://devhunt.org/*"
    ],
    "readyUrlHint": "account/tools/new",
    "readyStatusHint": "Sign in on DevHunt and open the new-tool form for a free listing. Skip or review any AI draft from your website URL, then use OpenQuok on the tool form. Free listings use a nofollow link on the tool page.",
    "steps": [
        {
            "id": "submit_tool",
            "label": "Submit tool",
            "fields": [
                {
                    "key": "logo",
                    "label": "Tool logo",
                    "labelAliases": [
                        "Logo"
                    ],
                    "profilePath": "logo_url",
                    "fillMode": "file",
                    "fileInputIndex": 0,
                    "required": true,
                    "selectorHint": "input[type='file'][accept*='image'], input[type='file'][accept*='png' i]"
                },
                {
                    "key": "gallery",
                    "label": "Tool screenshots",
                    "labelAliases": [
                        "Screenshots",
                        "Gallery"
                    ],
                    "profilePath": "profile_data.gallery_urls",
                    "fillMode": "files",
                    "fileInputIndex": 0,
                    "maxItems": 3,
                    "required": true,
                    "selectorHint": "#tool-screenshots-container input[type='file']"
                },
                {
                    "key": "name",
                    "label": "Tool name",
                    "profilePath": "name",
                    "fillMode": "text",
                    "required": true,
                    "selectorHint": "input[placeholder*='My Awesome Dev Tool' i], input[name*='tool_name' i], input[aria-label*='tool name' i]"
                },
                {
                    "key": "tagline",
                    "label": "Catchy slogan",
                    "labelAliases": [
                        "Slogan",
                        "Tagline"
                    ],
                    "profilePath": "tagline",
                    "fillMode": "text",
                    "required": true,
                    "selectorHint": "input[placeholder*='Supercharge Your Development Workflow' i], input[name*='slogan' i], textarea[name*='slogan' i]"
                },
                {
                    "key": "website",
                    "label": "Tool website URL",
                    "labelAliases": [
                        "Website URL",
                        "Website"
                    ],
                    "profilePath": "website_url",
                    "fillMode": "text",
                    "required": true,
                    "selectorHint": "input[placeholder*='myawesomedevtool' i], input[type='url'], input[name*='tool_website' i], input[name*='website' i]"
                },
                {
                    "key": "description",
                    "label": "Quick Description",
                    "labelAliases": [
                        "Description"
                    ],
                    "profilePath": "description",
                    "fillMode": "rich_html",
                    "required": true,
                    "selectorHint": "textarea[placeholder*='Briefly explain what your tool does' i], [contenteditable='true'], .ProseMirror, .tiptap, textarea[name*='tool_description' i]"
                },
                {
                    "key": "social_github",
                    "label": "GitHub repo URL",
                    "labelAliases": [
                        "GitHub repo URL (optional)",
                        "GitHub"
                    ],
                    "profilePath": "profile_data.social_github",
                    "fillMode": "text",
                    "selectorHint": "input[placeholder*='github.com/username' i], input[name*='github' i], input[name*='github_repo' i]",
                    "profileSourcePaths": [
                        "profile_data.repository_url"
                    ]
                },
                {
                    "key": "pricing_type",
                    "label": "Tool pricing type",
                    "labelAliases": [
                        "Pricing type",
                        "Pricing"
                    ],
                    "profilePath": "profile_data.pricing_type",
                    "fillMode": "select",
                    "selectCatalog": "devhunt_pricing",
                    "selectorHint": "#pricing-container input[type='radio'][name='pricing_type'], input[type='radio'][name='pricing_type'], input[type='radio'][name*='pricing_type' i]"
                },
                {
                    "key": "categories",
                    "label": "Tool categories",
                    "labelAliases": [
                        "Categories"
                    ],
                    "profilePath": "profile_data.categories",
                    "fillMode": "tags",
                    "selectorHint": "input[name*='categor' i], input[placeholder*='categor' i], [aria-label*='categor' i]"
                },
                {
                    "key": "demo_video",
                    "label": "Demo video",
                    "labelAliases": [
                        "Demo video (optional)"
                    ],
                    "profilePath": "profile_data.launch_video_url",
                    "fillMode": "text",
                    "selectorHint": "input[placeholder*='Demo video (optional)' i], input[name*='demo_video' i], input[type='url'][placeholder*='video' i]"
                }
            ]
        }
    ],
    "proof": {
        "successPathRegex": "/tool/|/account/tools",
        "listingUrlSelector": "a[href*='devhunt.org/tool/']"
    }
}$json$::jsonb
WHERE provider_slug = 'devhunt-standard-launch';

UPDATE public.auto_launch_destinations
SET extension_config = $json${
    "version": 1,
    "startUrlPatterns": [
        "https://fazier.com/*",
        "https://www.fazier.com/*"
    ],
    "readyUrlHint": "submit",
    "steps": [
        {
            "id": "product_info",
            "label": "Product info",
            "fields": [
                {
                    "key": "name",
                    "label": "Product name",
                    "labelAliases": [
                        "Name"
                    ],
                    "profilePath": "name",
                    "fillMode": "text",
                    "selectorHint": "input[name='name']",
                    "required": true
                },
                {
                    "key": "tagline",
                    "label": "Tagline",
                    "labelAliases": [
                        "Describe your product in few words only"
                    ],
                    "profilePath": "tagline",
                    "fillMode": "text",
                    "selectorHint": "input[name='tagline'], textarea[name='tagline']",
                    "maxScalarLength": 80,
                    "required": true
                },
                {
                    "key": "website",
                    "label": "Website",
                    "profilePath": "website_url",
                    "fillMode": "text",
                    "selectorHint": "input[name='website'], input[type='url'][placeholder*='https' i]",
                    "required": true
                },
                {
                    "key": "description",
                    "label": "Description",
                    "labelAliases": [
                        "Brief description of the product"
                    ],
                    "profilePath": "description",
                    "fillMode": "text",
                    "selectorHint": "textarea[name='description'], textarea[placeholder*='description' i]"
                },
                {
                    "key": "features",
                    "label": "Features",
                    "profilePath": "profile_data.use_cases",
                    "fillMode": "text",
                    "selectorHint": "textarea[name='features'], input[name='features']"
                },
                {
                    "key": "use_cases",
                    "label": "Use cases",
                    "profilePath": "profile_data.use_cases",
                    "fillMode": "text",
                    "selectorHint": "textarea[name='useCases'], input[name='useCases']"
                },
                {
                    "key": "logo",
                    "label": "Square logo",
                    "profilePath": "logo_url",
                    "fillMode": "file",
                    "fileInputIndex": 0,
                    "selectorHint": "input[type='file'][name='logo'], input[type='file'][accept*='image']"
                },
                {
                    "key": "gallery",
                    "label": "Product images",
                    "profilePath": "profile_data.gallery_urls",
                    "fillMode": "files",
                    "fileInputIndex": 1,
                    "maxItems": 5,
                    "selectorHint": "input[type='file'][accept*='image']:not([name='logo']):not(:first-of-type)"
                }
            ]
        },
        {
            "id": "classification",
            "label": "Classification",
            "fields": [
                {
                    "key": "category",
                    "label": "Category",
                    "profilePath": "profile_data.categories",
                    "fillMode": "select",
                    "selectorHint": "select[name='category'], [role='combobox'][aria-label*='categor' i]"
                },
                {
                    "key": "pricing_type",
                    "label": "Pricing",
                    "profilePath": "profile_data.pricing_type",
                    "fillMode": "select",
                    "selectorHint": "input[type='radio'][name='planType'], input[name='planType'], input[type='radio'][name='paymentPlan'], input[name='paymentPlan']"
                }
            ]
        },
        {
            "id": "socials",
            "label": "Social links",
            "fields": [
                {
                    "key": "social_linkedin",
                    "label": "LinkedIn",
                    "profilePath": "profile_data.social_linkedin",
                    "fillMode": "text",
                    "selectorHint": "input[name='linkdinUrl'], input[name='linkedin']"
                },
                {
                    "key": "social_x",
                    "label": "Twitter",
                    "labelAliases": [
                        "X (Twitter)"
                    ],
                    "profilePath": "profile_data.social_x",
                    "fillMode": "text",
                    "selectorHint": "input[name='twitterUrl'], input[name='twitter']"
                }
            ]
        }
    ],
    "proof": {
        "successPathRegex": "/launches/|/p/",
        "listingUrlSelector": "a[href*='fazier.com/launches/'], a[href*='fazier.com/p/']"
    },
    "readyStatusHint": "On fazier.com/submit, choose Product launch (not Company page). Pick Basic (free) when Fazier shows plan tiers. When product fields are visible, use Fill all steps or Fill on each row—then complete badge, comments, and moderation on Fazier."
}$json$::jsonb
WHERE provider_slug = 'fazier-free-product-listing';

UPDATE public.auto_launch_destinations
SET extension_config = $json${
    "version": 1,
    "startUrlPatterns": [
        "https://fazier.com/*",
        "https://www.fazier.com/*"
    ],
    "readyUrlHint": "page/new",
    "readyStatusHint": "On fazier.com/page/new, complete any listing-type or sign-in gate Fazier shows, then open the company wizard (Basic info → Overview → Social links). Use Fill all steps or Fill on each row—review every field before you submit on Fazier.",
    "steps": [
        {
            "id": "basic",
            "label": "Basic info",
            "fields": [
                {
                    "key": "name",
                    "label": "Name",
                    "labelAliases": [
                        "Organization name"
                    ],
                    "profilePath": "name",
                    "fillMode": "text",
                    "selectorHint": "input[name='name']",
                    "required": true
                },
                {
                    "key": "company_slug",
                    "label": "Page URL",
                    "labelAliases": [
                        "company-slug"
                    ],
                    "profilePath": "profile_data.slug",
                    "fillMode": "text",
                    "selectorHint": "input[name='company']"
                },
                {
                    "key": "website",
                    "label": "Website",
                    "profilePath": "website_url",
                    "fillMode": "text",
                    "selectorHint": "input[name='website'], input[type='url'][placeholder*='https' i]",
                    "required": true
                },
                {
                    "key": "logo",
                    "label": "Logo",
                    "profilePath": "logo_url",
                    "fillMode": "file",
                    "fileInputIndex": 0,
                    "selectorHint": "input[type='file'][name='logo'], input[type='file'][accept*='image']",
                    "required": true
                },
                {
                    "key": "tagline",
                    "label": "Tagline",
                    "labelAliases": [
                        "One-line description of your organization"
                    ],
                    "profilePath": "tagline",
                    "fillMode": "text",
                    "selectorHint": "input[name='tagline'], textarea[name='tagline']",
                    "maxScalarLength": 120,
                    "required": true
                }
            ]
        },
        {
            "id": "overview",
            "label": "Overview",
            "fields": [
                {
                    "key": "industry",
                    "label": "Industry",
                    "profilePath": "profile_data.categories",
                    "fillMode": "text",
                    "selectorHint": "input[name='industry']"
                },
                {
                    "key": "company_size",
                    "label": "Company size",
                    "profilePath": "profile_data.target_audiences",
                    "fillMode": "select",
                    "selectorHint": "select[name='companySize'], [role='combobox'][aria-label*='size' i]"
                },
                {
                    "key": "company_type",
                    "label": "Organization type",
                    "profilePath": "profile_data.use_cases",
                    "fillMode": "select",
                    "selectorHint": "select[name='companyType'], [role='combobox'][aria-label*='type' i]"
                },
                {
                    "key": "country",
                    "label": "Country",
                    "profilePath": "profile_data.platforms",
                    "fillMode": "select",
                    "selectorHint": "select[name='country'], [role='combobox'][aria-label*='country' i]"
                },
                {
                    "key": "city",
                    "label": "City",
                    "profilePath": "profile_data.tech_stack",
                    "fillMode": "text",
                    "selectorHint": "input[name='city']"
                },
                {
                    "key": "founded_month",
                    "label": "Founded month",
                    "profilePath": "profile_data.launch_date",
                    "fillMode": "select",
                    "selectorHint": "select[name='month'], [role='combobox'][aria-label*='month' i]"
                },
                {
                    "key": "founded_year",
                    "label": "Founded year",
                    "profilePath": "profile_data.launch_date",
                    "fillMode": "select",
                    "selectorHint": "select[name='year'], [role='combobox'][aria-label*='year' i]"
                },
                {
                    "key": "about",
                    "label": "About",
                    "profilePath": "description",
                    "fillMode": "text",
                    "selectorHint": "textarea[name='about']"
                }
            ]
        },
        {
            "id": "social_links",
            "label": "Social links",
            "fields": [
                {
                    "key": "social_linkedin",
                    "label": "LinkedIn",
                    "profilePath": "profile_data.social_linkedin",
                    "fillMode": "text",
                    "selectorHint": "input[name='linkedin']"
                },
                {
                    "key": "social_x",
                    "label": "Twitter",
                    "labelAliases": [
                        "X (Twitter)"
                    ],
                    "profilePath": "profile_data.social_x",
                    "fillMode": "text",
                    "selectorHint": "input[name='twitter']"
                }
            ]
        }
    ],
    "proof": {
        "successPathRegex": "/company/",
        "listingUrlSelector": "a[href*='fazier.com/company/']"
    }
}$json$::jsonb
WHERE provider_slug = 'fazier-page';

UPDATE public.auto_launch_destinations
SET extension_config = $json${
    "version": 1,
    "startUrlPatterns": [
        "https://fazier.com/*",
        "https://www.fazier.com/*"
    ],
    "readyUrlHint": "submit",
    "steps": [
        {
            "id": "product_info",
            "label": "Product info",
            "fields": [
                {
                    "key": "name",
                    "label": "Product name",
                    "labelAliases": [
                        "Name"
                    ],
                    "profilePath": "name",
                    "fillMode": "text",
                    "selectorHint": "input[name='name']",
                    "required": true
                },
                {
                    "key": "tagline",
                    "label": "Tagline",
                    "labelAliases": [
                        "Describe your product in few words only"
                    ],
                    "profilePath": "tagline",
                    "fillMode": "text",
                    "selectorHint": "input[name='tagline'], textarea[name='tagline']",
                    "maxScalarLength": 80,
                    "required": true
                },
                {
                    "key": "website",
                    "label": "Website",
                    "profilePath": "website_url",
                    "fillMode": "text",
                    "selectorHint": "input[name='website'], input[type='url'][placeholder*='https' i]",
                    "required": true
                },
                {
                    "key": "description",
                    "label": "Description",
                    "labelAliases": [
                        "Brief description of the product"
                    ],
                    "profilePath": "description",
                    "fillMode": "text",
                    "selectorHint": "textarea[name='description'], textarea[placeholder*='description' i]"
                },
                {
                    "key": "features",
                    "label": "Features",
                    "profilePath": "profile_data.use_cases",
                    "fillMode": "text",
                    "selectorHint": "textarea[name='features'], input[name='features']"
                },
                {
                    "key": "use_cases",
                    "label": "Use cases",
                    "profilePath": "profile_data.use_cases",
                    "fillMode": "text",
                    "selectorHint": "textarea[name='useCases'], input[name='useCases']"
                },
                {
                    "key": "logo",
                    "label": "Square logo",
                    "profilePath": "logo_url",
                    "fillMode": "file",
                    "fileInputIndex": 0,
                    "selectorHint": "input[type='file'][name='logo'], input[type='file'][accept*='image']"
                },
                {
                    "key": "gallery",
                    "label": "Product images",
                    "profilePath": "profile_data.gallery_urls",
                    "fillMode": "files",
                    "fileInputIndex": 1,
                    "maxItems": 5,
                    "selectorHint": "input[type='file'][accept*='image']:not([name='logo']):not(:first-of-type)"
                }
            ]
        },
        {
            "id": "classification",
            "label": "Classification",
            "fields": [
                {
                    "key": "category",
                    "label": "Category",
                    "profilePath": "profile_data.categories",
                    "fillMode": "select",
                    "selectorHint": "select[name='category'], [role='combobox'][aria-label*='categor' i]"
                },
                {
                    "key": "pricing_type",
                    "label": "Pricing",
                    "profilePath": "profile_data.pricing_type",
                    "fillMode": "select",
                    "selectorHint": "input[type='radio'][name='planType'], input[name='planType'], input[type='radio'][name='paymentPlan'], input[name='paymentPlan']"
                }
            ]
        },
        {
            "id": "socials",
            "label": "Social links",
            "fields": [
                {
                    "key": "social_linkedin",
                    "label": "LinkedIn",
                    "profilePath": "profile_data.social_linkedin",
                    "fillMode": "text",
                    "selectorHint": "input[name='linkdinUrl'], input[name='linkedin']"
                },
                {
                    "key": "social_x",
                    "label": "Twitter",
                    "labelAliases": [
                        "X (Twitter)"
                    ],
                    "profilePath": "profile_data.social_x",
                    "fillMode": "text",
                    "selectorHint": "input[name='twitterUrl'], input[name='twitter']"
                }
            ]
        }
    ],
    "proof": {
        "successPathRegex": "/launches/|/p/",
        "listingUrlSelector": "a[href*='fazier.com/launches/'], a[href*='fazier.com/p/']"
    },
    "readyStatusHint": "On fazier.com/submit, choose Product launch (not Company page). Pick Lite Plan or higher when Fazier shows plan tiers. When product fields are visible, use Fill all steps or Fill on each row—then finish checkout on Fazier."
}$json$::jsonb
WHERE provider_slug = 'fazier-paid-product-listing';

UPDATE public.auto_launch_destinations
SET extension_config = $json${
    "version": 1,
    "startUrlPatterns": [
        "https://open-launch.com/*",
        "https://www.open-launch.com/*"
    ],
    "readyUrlHint": "pricing",
    "steps": [
        {
            "id": "project_info",
            "label": "Project Info",
            "fields": [
                {
                    "key": "name",
                    "label": "Project name",
                    "profilePath": "name",
                    "fillMode": "text",
                    "selectorHint": "input[name*='name' i], input[placeholder*='project name' i], input[aria-label*='name' i]"
                },
                {
                    "key": "website",
                    "label": "Website URL",
                    "profilePath": "website_url",
                    "fillMode": "text",
                    "selectorHint": "input[type='url'], input[name*='website' i], input[name*='url' i], input[placeholder*='website' i]"
                },
                {
                    "key": "description",
                    "label": "Short description",
                    "profilePath": "description",
                    "fillMode": "rich_html",
                    "selectorHint": "[contenteditable='true'], .ProseMirror, .tiptap, textarea[name*='description' i], textarea[placeholder*='description' i]"
                },
                {
                    "key": "logo",
                    "label": "Logo",
                    "profilePath": "logo_url",
                    "fillMode": "file",
                    "fileInputIndex": 0,
                    "selectorHint": "input[type='file'][accept*='image']"
                },
                {
                    "key": "product_image",
                    "label": "Product image",
                    "profilePath": "profile_data.gallery_urls",
                    "fillMode": "files",
                    "fileInputIndex": 1,
                    "maxItems": 1,
                    "selectorHint": "input[type='file'][accept*='image']"
                }
            ]
        },
        {
            "id": "details",
            "label": "Details",
            "fields": [
                {
                    "key": "categories",
                    "label": "Categories",
                    "profilePath": "profile_data.categories",
                    "fillMode": "checkbox_group",
                    "checkboxCatalog": "open_launch_categories",
                    "labelMatch": "section",
                    "maxItems": 3
                },
                {
                    "key": "tech_stack",
                    "label": "Tech stack",
                    "profilePath": "profile_data.tech_stack",
                    "fillMode": "tags",
                    "maxItems": 5,
                    "selectorHint": "input[name*='tech' i], input[placeholder*='technology' i], [placeholder*='tech' i], [aria-label*='tech stack' i], [aria-label*='stack' i]"
                },
                {
                    "key": "platforms",
                    "label": "Platforms",
                    "profilePath": "profile_data.platforms",
                    "fillMode": "checkbox_group",
                    "checkboxCatalog": "open_launch_platforms",
                    "labelMatch": "section"
                },
                {
                    "key": "pricing_type",
                    "label": "Pricing model",
                    "profilePath": "profile_data.pricing_type",
                    "fillMode": "select",
                    "selectCatalog": "open_launch_pricing",
                    "selectorHint": "input[type='radio'][name*='pricing' i], input[type='radio'][id*='pricing' i], select[name*='pricing' i], [role='combobox'][aria-label*='pricing' i]"
                },
                {
                    "key": "social_github",
                    "label": "GitHub",
                    "profilePath": "profile_data.social_github",
                    "fillMode": "text",
                    "selectorHint": "input[name*='github' i], input[placeholder*='github' i], input[aria-label*='github' i]",
                    "profileSourcePaths": [
                        "profile_data.repository_url"
                    ]
                },
                {
                    "key": "social_x",
                    "label": "X (Twitter)",
                    "profilePath": "profile_data.social_x",
                    "fillMode": "text",
                    "selectorHint": "input[name*='twitter' i], input[name*='x.com' i], input[placeholder*='twitter' i], input[aria-label*='twitter' i]"
                }
            ]
        }
    ],
    "proof": {
        "successPathRegex": "/projects/|/submit",
        "listingUrlSelector": "a[href*='open-launch.com/projects/']"
    }
}$json$::jsonb
WHERE provider_slug = 'open-launch-free-launch';

UPDATE public.auto_launch_destinations
SET extension_config = $json${
    "version": 1,
    "startUrlPatterns": [
        "https://open-launch.com/*",
        "https://www.open-launch.com/*"
    ],
    "readyUrlHint": "submit",
    "steps": [
        {
            "id": "project_info",
            "label": "Project Info",
            "fields": [
                {
                    "key": "name",
                    "label": "Project name",
                    "profilePath": "name",
                    "fillMode": "text",
                    "selectorHint": "input[name*='name' i], input[placeholder*='project name' i], input[aria-label*='name' i]"
                },
                {
                    "key": "website",
                    "label": "Website URL",
                    "profilePath": "website_url",
                    "fillMode": "text",
                    "selectorHint": "input[type='url'], input[name*='website' i], input[name*='url' i], input[placeholder*='website' i]"
                },
                {
                    "key": "description",
                    "label": "Short description",
                    "profilePath": "description",
                    "fillMode": "rich_html",
                    "selectorHint": "[contenteditable='true'], .ProseMirror, .tiptap, textarea[name*='description' i], textarea[placeholder*='description' i]"
                },
                {
                    "key": "logo",
                    "label": "Logo",
                    "profilePath": "logo_url",
                    "fillMode": "file",
                    "fileInputIndex": 0,
                    "selectorHint": "input[type='file'][accept*='image']"
                },
                {
                    "key": "product_image",
                    "label": "Product image",
                    "profilePath": "profile_data.gallery_urls",
                    "fillMode": "files",
                    "fileInputIndex": 1,
                    "maxItems": 1,
                    "selectorHint": "input[type='file'][accept*='image']"
                }
            ]
        },
        {
            "id": "details",
            "label": "Details",
            "fields": [
                {
                    "key": "categories",
                    "label": "Categories",
                    "profilePath": "profile_data.categories",
                    "fillMode": "checkbox_group",
                    "checkboxCatalog": "open_launch_categories",
                    "labelMatch": "section",
                    "maxItems": 3
                },
                {
                    "key": "tech_stack",
                    "label": "Tech stack",
                    "profilePath": "profile_data.tech_stack",
                    "fillMode": "tags",
                    "maxItems": 5,
                    "selectorHint": "input[name*='tech' i], input[placeholder*='technology' i], [placeholder*='tech' i], [aria-label*='tech stack' i], [aria-label*='stack' i]"
                },
                {
                    "key": "platforms",
                    "label": "Platforms",
                    "profilePath": "profile_data.platforms",
                    "fillMode": "checkbox_group",
                    "checkboxCatalog": "open_launch_platforms",
                    "labelMatch": "section"
                },
                {
                    "key": "pricing_type",
                    "label": "Pricing model",
                    "profilePath": "profile_data.pricing_type",
                    "fillMode": "select",
                    "selectCatalog": "open_launch_pricing",
                    "selectorHint": "input[type='radio'][name*='pricing' i], input[type='radio'][id*='pricing' i], select[name*='pricing' i], [role='combobox'][aria-label*='pricing' i]"
                },
                {
                    "key": "social_github",
                    "label": "GitHub",
                    "profilePath": "profile_data.social_github",
                    "fillMode": "text",
                    "selectorHint": "input[name*='github' i], input[placeholder*='github' i], input[aria-label*='github' i]",
                    "profileSourcePaths": [
                        "profile_data.repository_url"
                    ]
                },
                {
                    "key": "social_x",
                    "label": "X (Twitter)",
                    "profilePath": "profile_data.social_x",
                    "fillMode": "text",
                    "selectorHint": "input[name*='twitter' i], input[name*='x.com' i], input[placeholder*='twitter' i], input[aria-label*='twitter' i]"
                }
            ]
        }
    ],
    "proof": {
        "successPathRegex": "/projects/|/submit",
        "listingUrlSelector": "a[href*='open-launch.com/projects/']"
    }
}$json$::jsonb
WHERE provider_slug = 'open-launch-premium-launch';

UPDATE public.auto_launch_destinations
SET extension_config = $json${
    "version": 1,
    "startUrlPatterns": [
        "https://peerpush.com/*",
        "https://www.peerpush.com/*"
    ],
    "readyUrlHint": "pricing",
    "steps": [
        {
            "id": "basic",
            "label": "Basic",
            "fields": [
                {
                    "key": "name",
                    "label": "Product name",
                    "profilePath": "name",
                    "fillMode": "text",
                    "selectorHint": "#name, input#name"
                },
                {
                    "key": "tagline",
                    "label": "Tagline",
                    "labelAliases": [
                        "One-line tagline"
                    ],
                    "profilePath": "tagline",
                    "fillMode": "text",
                    "selectorHint": "#tagline, input#tagline"
                },
                {
                    "key": "description",
                    "label": "Product description",
                    "labelAliases": [
                        "Description"
                    ],
                    "profilePath": "description",
                    "fillMode": "text",
                    "selectorHint": "#description, textarea#description"
                },
                {
                    "key": "website",
                    "label": "Website",
                    "profilePath": "website_url",
                    "fillMode": "text",
                    "selectorHint": "#websiteUrl, input#websiteUrl, input[type='url'][id*='website' i]"
                },
                {
                    "key": "logo",
                    "label": "Logo",
                    "profilePath": "logo_url",
                    "fillMode": "file",
                    "fileInputIndex": 0,
                    "selectorHint": "[data-field='logo'] input[type='file'], input[type='file'][accept*='image']"
                }
            ]
        },
        {
            "id": "discovery",
            "label": "Discovery",
            "fields": [
                {
                    "key": "categories",
                    "label": "Categories",
                    "profilePath": "profile_data.categories",
                    "fillMode": "tags",
                    "labelMatch": "section",
                    "tagsScope": "section",
                    "maxItems": 3,
                    "selectorHint": "[data-field='categories'] input[role='combobox'], [data-field='categories'] input[placeholder*='categor' i]"
                },
                {
                    "key": "use_cases",
                    "label": "Use Cases",
                    "labelAliases": [
                        "Use cases"
                    ],
                    "profilePath": "profile_data.use_cases",
                    "fillMode": "tags",
                    "labelMatch": "section",
                    "tagsScope": "section",
                    "selectorHint": "[data-field='useCases'] input[role='combobox'], [data-field='useCases'] input[placeholder*='use case' i]"
                },
                {
                    "key": "target_audiences",
                    "label": "Target Audience",
                    "labelAliases": [
                        "Target audience",
                        "Audiences"
                    ],
                    "profilePath": "profile_data.target_audiences",
                    "fillMode": "tags",
                    "labelMatch": "section",
                    "tagsScope": "section",
                    "selectorHint": "[data-field='audiences'] input[role='combobox'], [data-field='audiences'] input[placeholder*='audience' i]"
                },
                {
                    "key": "pricing_type",
                    "label": "Pricing",
                    "profilePath": "profile_data.pricing_type",
                    "fillMode": "select",
                    "selectorHint": "[data-field='pricingType'] select, select[aria-label='Pricing type']"
                },
                {
                    "key": "platforms",
                    "label": "Platforms",
                    "profilePath": "profile_data.platforms",
                    "fillMode": "tags",
                    "labelMatch": "section",
                    "tagsScope": "section",
                    "maxItems": 5,
                    "selectorHint": "[data-field='platforms'] input[role='combobox'], [data-field='platforms'] input[placeholder*='platform' i]"
                }
            ]
        },
        {
            "id": "media",
            "label": "Media",
            "fields": [
                {
                    "key": "gallery",
                    "label": "Screenshots",
                    "profilePath": "profile_data.gallery_urls",
                    "fillMode": "files",
                    "fileInputIndex": 0,
                    "maxItems": 10,
                    "selectorHint": "[data-field='screenshots'] input[type='file'], input[type='file'][accept*='image']"
                }
            ]
        },
        {
            "id": "additional",
            "label": "Additional Info",
            "fields": [
                {
                    "key": "monthly_revenue_usd",
                    "label": "Monthly recurring revenue (optional)",
                    "labelAliases": [
                        "MRR",
                        "MRR - Monthly Recurring Revenue (optional)"
                    ],
                    "profilePath": "profile_data.monthly_revenue_usd",
                    "fillMode": "text",
                    "selectorHint": "#mrr, input#mrr, input[name='mrr'], input[placeholder='1000']"
                },
                {
                    "key": "social_x",
                    "label": "Twitter username",
                    "labelAliases": [
                        "X (Twitter)",
                        "X username"
                    ],
                    "profilePath": "profile_data.social_x",
                    "socialXScalar": "username",
                    "fillMode": "text",
                    "selectorHint": "#twitterUsername, input#twitterUsername, input[aria-label='X username']"
                },
                {
                    "key": "social_linkedin",
                    "label": "LinkedIn URL",
                    "profilePath": "profile_data.social_linkedin",
                    "fillMode": "text",
                    "selectorHint": "#linkedinUrl, input#linkedinUrl, input[aria-label='LinkedIn URL'], input[type='url'][placeholder*='linkedin.com' i]"
                }
            ]
        }
    ],
    "proof": {
        "successPathRegex": "/p/|/submit",
        "listingUrlSelector": "a[href*='peerpush.com/p/']"
    }
}$json$::jsonb
WHERE provider_slug = 'peerpush-free-queue';

UPDATE public.auto_launch_destinations
SET extension_config = $json${
    "version": 1,
    "startUrlPatterns": [
        "https://peerpush.com/*",
        "https://www.peerpush.com/*"
    ],
    "readyUrlHint": "submit",
    "steps": [
        {
            "id": "basic",
            "label": "Basic",
            "fields": [
                {
                    "key": "name",
                    "label": "Product name",
                    "profilePath": "name",
                    "fillMode": "text",
                    "selectorHint": "#name, input#name"
                },
                {
                    "key": "tagline",
                    "label": "Tagline",
                    "labelAliases": [
                        "One-line tagline"
                    ],
                    "profilePath": "tagline",
                    "fillMode": "text",
                    "selectorHint": "#tagline, input#tagline"
                },
                {
                    "key": "description",
                    "label": "Product description",
                    "labelAliases": [
                        "Description"
                    ],
                    "profilePath": "description",
                    "fillMode": "text",
                    "selectorHint": "#description, textarea#description"
                },
                {
                    "key": "website",
                    "label": "Website",
                    "profilePath": "website_url",
                    "fillMode": "text",
                    "selectorHint": "#websiteUrl, input#websiteUrl, input[type='url'][id*='website' i]"
                },
                {
                    "key": "logo",
                    "label": "Logo",
                    "profilePath": "logo_url",
                    "fillMode": "file",
                    "fileInputIndex": 0,
                    "selectorHint": "[data-field='logo'] input[type='file'], input[type='file'][accept*='image']"
                }
            ]
        },
        {
            "id": "discovery",
            "label": "Discovery",
            "fields": [
                {
                    "key": "categories",
                    "label": "Categories",
                    "profilePath": "profile_data.categories",
                    "fillMode": "tags",
                    "labelMatch": "section",
                    "tagsScope": "section",
                    "maxItems": 3,
                    "selectorHint": "[data-field='categories'] input[role='combobox'], [data-field='categories'] input[placeholder*='categor' i]"
                },
                {
                    "key": "use_cases",
                    "label": "Use Cases",
                    "labelAliases": [
                        "Use cases"
                    ],
                    "profilePath": "profile_data.use_cases",
                    "fillMode": "tags",
                    "labelMatch": "section",
                    "tagsScope": "section",
                    "selectorHint": "[data-field='useCases'] input[role='combobox'], [data-field='useCases'] input[placeholder*='use case' i]"
                },
                {
                    "key": "target_audiences",
                    "label": "Target Audience",
                    "labelAliases": [
                        "Target audience",
                        "Audiences"
                    ],
                    "profilePath": "profile_data.target_audiences",
                    "fillMode": "tags",
                    "labelMatch": "section",
                    "tagsScope": "section",
                    "selectorHint": "[data-field='audiences'] input[role='combobox'], [data-field='audiences'] input[placeholder*='audience' i]"
                },
                {
                    "key": "pricing_type",
                    "label": "Pricing",
                    "profilePath": "profile_data.pricing_type",
                    "fillMode": "select",
                    "selectorHint": "[data-field='pricingType'] select, select[aria-label='Pricing type']"
                },
                {
                    "key": "platforms",
                    "label": "Platforms",
                    "profilePath": "profile_data.platforms",
                    "fillMode": "tags",
                    "labelMatch": "section",
                    "tagsScope": "section",
                    "maxItems": 5,
                    "selectorHint": "[data-field='platforms'] input[role='combobox'], [data-field='platforms'] input[placeholder*='platform' i]"
                }
            ]
        },
        {
            "id": "media",
            "label": "Media",
            "fields": [
                {
                    "key": "gallery",
                    "label": "Screenshots",
                    "profilePath": "profile_data.gallery_urls",
                    "fillMode": "files",
                    "fileInputIndex": 0,
                    "maxItems": 10,
                    "selectorHint": "[data-field='screenshots'] input[type='file'], input[type='file'][accept*='image']"
                }
            ]
        },
        {
            "id": "additional",
            "label": "Additional Info",
            "fields": [
                {
                    "key": "monthly_revenue_usd",
                    "label": "Monthly recurring revenue (optional)",
                    "labelAliases": [
                        "MRR",
                        "MRR - Monthly Recurring Revenue (optional)"
                    ],
                    "profilePath": "profile_data.monthly_revenue_usd",
                    "fillMode": "text",
                    "selectorHint": "#mrr, input#mrr, input[name='mrr'], input[placeholder='1000']"
                },
                {
                    "key": "social_x",
                    "label": "Twitter username",
                    "labelAliases": [
                        "X (Twitter)",
                        "X username"
                    ],
                    "profilePath": "profile_data.social_x",
                    "socialXScalar": "username",
                    "fillMode": "text",
                    "selectorHint": "#twitterUsername, input#twitterUsername, input[aria-label='X username']"
                },
                {
                    "key": "social_linkedin",
                    "label": "LinkedIn URL",
                    "profilePath": "profile_data.social_linkedin",
                    "fillMode": "text",
                    "selectorHint": "#linkedinUrl, input#linkedinUrl, input[aria-label='LinkedIn URL'], input[type='url'][placeholder*='linkedin.com' i]"
                }
            ]
        }
    ],
    "proof": {
        "successPathRegex": "/p/|/submit",
        "listingUrlSelector": "a[href*='peerpush.com/p/']"
    }
}$json$::jsonb
WHERE provider_slug = 'peerpush-standard-launch';

UPDATE public.auto_launch_destinations
SET extension_config = $json${
    "version": 1,
    "startUrlPatterns": [
        "https://tinylaunch.com/*",
        "https://www.tinylaunch.com/*"
    ],
    "readyUrlHint": "dashboard/startups",
    "steps": [
        {
            "id": "create_startup",
            "label": "Create startup",
            "fields": [
                {
                    "key": "name",
                    "label": "Startup Name",
                    "labelAliases": [
                        "Name"
                    ],
                    "profilePath": "name",
                    "fillMode": "text",
                    "maxScalarLength": 30,
                    "required": true,
                    "selectorHint": "input[name*='name' i], input[placeholder*='startup name' i], input[aria-label*='startup name' i]"
                },
                {
                    "key": "tagline",
                    "label": "Tagline",
                    "profilePath": "tagline",
                    "fillMode": "text",
                    "maxScalarLength": 60,
                    "required": true,
                    "selectorHint": "input[name*='tagline' i], textarea[name*='tagline' i], input[placeholder*='tagline' i], textarea[placeholder*='tagline' i]"
                },
                {
                    "key": "logo",
                    "label": "Logo",
                    "profilePath": "logo_url",
                    "fillMode": "file",
                    "fileInputIndex": 0,
                    "required": true,
                    "selectorHint": "input[type='file'][accept*='image']"
                },
                {
                    "key": "gallery",
                    "label": "Images",
                    "labelAliases": [
                        "Screenshots",
                        "Gallery"
                    ],
                    "profilePath": "profile_data.gallery_urls",
                    "fillMode": "files",
                    "fileInputIndex": 1,
                    "maxItems": 3,
                    "selectorHint": "input[type='file'][accept*='image']"
                },
                {
                    "key": "website",
                    "label": "Website URL",
                    "labelAliases": [
                        "Website"
                    ],
                    "profilePath": "website_url",
                    "fillMode": "text",
                    "required": true,
                    "selectorHint": "input[type='url'], input[name*='website' i], input[name*='url' i], input[placeholder*='website' i]"
                },
                {
                    "key": "description",
                    "label": "Description",
                    "profilePath": "description",
                    "fillMode": "rich_html",
                    "required": true,
                    "selectorHint": "[contenteditable='true'], .ProseMirror, .tiptap, textarea[name*='description' i], textarea[placeholder*='description' i]"
                },
                {
                    "key": "category",
                    "label": "Category",
                    "profilePath": "profile_data.category",
                    "fillMode": "select",
                    "selectCatalog": "tinylaunch",
                    "required": true,
                    "selectorHint": "select[name*='categor' i], [role='combobox'][aria-label*='categor' i], button[aria-label*='categor' i]"
                }
            ]
        }
    ],
    "proof": {
        "successPathRegex": "/dashboard/startups/",
        "listingUrlSelector": "a[href*='tinylaunch.com'][href*='/startups/']"
    }
}$json$::jsonb
WHERE provider_slug = 'tinylaunch-premium-launch';

UPDATE public.auto_launch_destinations
SET extension_config = $json${
    "version": 1,
    "startUrlPatterns": [
        "https://tinylaunch.com/*",
        "https://www.tinylaunch.com/*"
    ],
    "readyUrlHint": "pricing",
    "steps": [
        {
            "id": "create_startup",
            "label": "Create startup",
            "fields": [
                {
                    "key": "name",
                    "label": "Startup Name",
                    "labelAliases": [
                        "Name"
                    ],
                    "profilePath": "name",
                    "fillMode": "text",
                    "maxScalarLength": 30,
                    "required": true,
                    "selectorHint": "input[name*='name' i], input[placeholder*='startup name' i], input[aria-label*='startup name' i]"
                },
                {
                    "key": "tagline",
                    "label": "Tagline",
                    "profilePath": "tagline",
                    "fillMode": "text",
                    "maxScalarLength": 60,
                    "required": true,
                    "selectorHint": "input[name*='tagline' i], textarea[name*='tagline' i], input[placeholder*='tagline' i], textarea[placeholder*='tagline' i]"
                },
                {
                    "key": "logo",
                    "label": "Logo",
                    "profilePath": "logo_url",
                    "fillMode": "file",
                    "fileInputIndex": 0,
                    "required": true,
                    "selectorHint": "input[type='file'][accept*='image']"
                },
                {
                    "key": "gallery",
                    "label": "Images",
                    "labelAliases": [
                        "Screenshots",
                        "Gallery"
                    ],
                    "profilePath": "profile_data.gallery_urls",
                    "fillMode": "files",
                    "fileInputIndex": 1,
                    "maxItems": 3,
                    "selectorHint": "input[type='file'][accept*='image']"
                },
                {
                    "key": "website",
                    "label": "Website URL",
                    "labelAliases": [
                        "Website"
                    ],
                    "profilePath": "website_url",
                    "fillMode": "text",
                    "required": true,
                    "selectorHint": "input[type='url'], input[name*='website' i], input[name*='url' i], input[placeholder*='website' i]"
                },
                {
                    "key": "description",
                    "label": "Description",
                    "profilePath": "description",
                    "fillMode": "rich_html",
                    "required": true,
                    "selectorHint": "[contenteditable='true'], .ProseMirror, .tiptap, textarea[name*='description' i], textarea[placeholder*='description' i]"
                },
                {
                    "key": "category",
                    "label": "Category",
                    "profilePath": "profile_data.category",
                    "fillMode": "select",
                    "selectCatalog": "tinylaunch",
                    "required": true,
                    "selectorHint": "select[name*='categor' i], [role='combobox'][aria-label*='categor' i], button[aria-label*='categor' i]"
                }
            ]
        }
    ],
    "proof": {
        "successPathRegex": "/dashboard/startups/",
        "listingUrlSelector": "a[href*='tinylaunch.com'][href*='/startups/']"
    }
}$json$::jsonb
WHERE provider_slug = 'tinylaunch-standard-launch';

UPDATE public.auto_launch_destinations
SET extension_config = $json${
    "version": 1,
    "startUrlPatterns": [
        "https://uneed.best/*",
        "https://www.uneed.best/*"
    ],
    "readyUrlHint": "your-tools",
    "steps": [
        {
            "id": "general",
            "label": "General",
            "fields": [
                {
                    "key": "name",
                    "label": "Product name",
                    "labelAliases": [
                        "Name"
                    ],
                    "profilePath": "name",
                    "fillMode": "text",
                    "selectorHint": "input[name=\"name\"]"
                },
                {
                    "key": "slug",
                    "label": "Slug",
                    "profilePath": "profile_data.slug",
                    "fillMode": "text",
                    "selectorHint": "input[name=\"slug\"]"
                },
                {
                    "key": "website",
                    "label": "Website",
                    "labelAliases": [
                        "Url"
                    ],
                    "profilePath": "website_url",
                    "fillMode": "text",
                    "selectorHint": "input[name=\"url\"]"
                },
                {
                    "key": "tagline",
                    "label": "Tagline",
                    "profilePath": "tagline",
                    "fillMode": "text",
                    "selectorHint": "textarea[name=\"description\"], input[name='tagline'], textarea[name='tagline'], textarea[maxlength='80'], input[maxlength='80'], input[aria-label*='tagline' i], textarea[aria-label*='tagline' i], input[placeholder*='tagline' i], textarea[placeholder*='tagline' i], input[id*='tagline' i], textarea[id*='tagline' i], input[name*='tagLine' i]",
                    "maxScalarLength": 80,
                    "required": true
                },
                {
                    "key": "category",
                    "label": "Category",
                    "profilePath": "profile_data.category",
                    "fillMode": "select",
                    "selectCatalog": "uneed",
                    "selectorHint": "select[name*='categor' i], [role='combobox'][aria-label*='categor' i], input[name*='categor' i]"
                },
                {
                    "key": "pricing_type",
                    "label": "Pricing",
                    "profilePath": "profile_data.pricing_type",
                    "fillMode": "select",
                    "selectorHint": "select[name*='pricing' i], [role='combobox'][aria-label*='pricing' i]"
                },
                {
                    "key": "tags",
                    "label": "Tags",
                    "labelAliases": [
                        "Select tags"
                    ],
                    "profilePath": "profile_data.tags",
                    "fillMode": "tags",
                    "selectorHint": "button[aria-haspopup='listbox'][aria-label='Show popup'], button[aria-haspopup='listbox'][aria-label*='popup' i], input[name*='tags' i]:not([name*='tagline' i]), input[aria-label*='tags' i]:not([aria-label*='tagline' i]), [data-testid*='tag-input' i], [data-testid*='tags-input' i]",
                    "required": true,
                    "maxItems": 3,
                    "tagsCatalog": "uneed",
                    "profileSourcePaths": [
                        "profile_data.use_cases",
                        "profile_data.platforms",
                        "profile_data.tech_stack",
                        "profile_data.categories"
                    ]
                },
                {
                    "key": "is_open_source",
                    "label": "Open source",
                    "profilePath": "profile_data.is_open_source",
                    "fillMode": "boolean",
                    "selectorHint": "input[type='checkbox'][name*='open' i], [role='switch'][aria-label*='open source' i]"
                },
                {
                    "key": "repository_url",
                    "label": "Repository URL",
                    "profilePath": "profile_data.repository_url",
                    "fillMode": "text",
                    "selectorHint": "input[name=\"repo_url\"], input[placeholder*=\"github.com\" i]"
                },
                {
                    "key": "description",
                    "label": "Rich description",
                    "profilePath": "description",
                    "fillMode": "rich_html",
                    "selectorHint": "label:has(+ .tiptap) + .tiptap .ProseMirror, label:has(+ div .tiptap) + div .tiptap .ProseMirror, .tiptap .ProseMirror[contenteditable='true'], [aria-label*='rich description' i] .ProseMirror"
                }
            ]
        },
        {
            "id": "media",
            "label": "Media",
            "fields": [
                {
                    "key": "logo",
                    "label": "Logo",
                    "profilePath": "logo_url",
                    "fillMode": "file",
                    "fileInputIndex": 0,
                    "selectorHint": "input#single[type='file']"
                },
                {
                    "key": "launch_video_url",
                    "label": "Launch video URL",
                    "profilePath": "profile_data.launch_video_url",
                    "fillMode": "text",
                    "selectorHint": "input[type='url'][aria-label*='launch video' i], input[type='url'][aria-label*='video url' i], input[type='url'][name*='launch_video' i], input[type='url'][name*='launchVideo' i], input[type='url'][name*='video_url' i]:not([name*='repo' i]):not([name*='repository' i]), input[type='url'][placeholder*='youtube' i], input[type='url'][placeholder*='vimeo' i]"
                },
                {
                    "key": "gallery",
                    "label": "Gallery images",
                    "labelAliases": [
                        "Images",
                        "Product images"
                    ],
                    "profilePath": "profile_data.gallery_urls",
                    "fillMode": "files",
                    "fileInputIndex": 0,
                    "maxItems": 3,
                    "selectorHint": "div:has(> h3:first-child), input[type='file'][accept*='image']"
                }
            ]
        },
        {
            "id": "socials",
            "label": "Socials",
            "fields": [
                {
                    "key": "social_x",
                    "label": "X (Twitter)",
                    "labelAliases": [
                        "Twitter"
                    ],
                    "profilePath": "profile_data.social_x",
                    "fillMode": "text",
                    "selectorHint": "input[name*='twitter' i]:not([name='name']):not([name='repo_url']), input[name*='x.com' i], input[placeholder*='twitter' i]:not([name='repo_url'])"
                },
                {
                    "key": "social_github",
                    "label": "GitHub",
                    "profilePath": "profile_data.social_github",
                    "profileSourcePaths": [
                        "profile_data.repository_url"
                    ],
                    "fillMode": "text",
                    "selectorHint": "input[name*='github' i]:not([name='repo_url']):not([name='name']), input[aria-label*='github' i]"
                },
                {
                    "key": "social_instagram",
                    "label": "Instagram",
                    "profilePath": "profile_data.social_instagram",
                    "fillMode": "text",
                    "selectorHint": "input[name*='instagram' i]:not([name='name']), input[placeholder*='instagram' i]"
                },
                {
                    "key": "social_linkedin",
                    "label": "LinkedIn",
                    "profilePath": "profile_data.social_linkedin",
                    "fillMode": "text",
                    "selectorHint": "input[name*='linkedin' i]:not([name='name']), input[placeholder*='linkedin' i]"
                },
                {
                    "key": "social_tiktok",
                    "label": "TikTok",
                    "profilePath": "profile_data.social_tiktok",
                    "fillMode": "text",
                    "selectorHint": "input[name*='tiktok' i]:not([name='name']), input[placeholder*='tiktok' i]"
                },
                {
                    "key": "social_facebook",
                    "label": "Facebook",
                    "profilePath": "profile_data.social_facebook",
                    "fillMode": "text",
                    "selectorHint": "input[name*='facebook' i]:not([name='name']), input[placeholder*='facebook' i]"
                },
                {
                    "key": "social_youtube",
                    "label": "YouTube",
                    "profilePath": "profile_data.social_youtube",
                    "fillMode": "text",
                    "selectorHint": "input[name*='youtube' i]:not([name='name']):not([name='description']):not([name='repo_url']), input[type='url'][name*='youtube' i], input[type='url'][placeholder*='youtube' i]:not([name='name'])"
                },
                {
                    "key": "social_bluesky",
                    "label": "Bluesky",
                    "profilePath": "profile_data.social_bluesky",
                    "fillMode": "text",
                    "selectorHint": "input[name*='bluesky' i]:not([name='name']), input[name*='bsky' i]:not([name='name']), input[placeholder*='bluesky' i]"
                }
            ]
        },
        {
            "id": "sell",
            "label": "Sell",
            "fields": [
                {
                    "key": "acquisition_listed",
                    "label": "Listed for acquisition",
                    "profilePath": "profile_data.acquisition_listed",
                    "fillMode": "boolean",
                    "selectorHint": "input[type='checkbox'][name*='acquisition' i], input[type='checkbox'][name*='sell' i], [role='switch'][aria-label*='acquisition' i]"
                },
                {
                    "key": "asking_price_usd",
                    "label": "Asking price (USD)",
                    "profilePath": "profile_data.asking_price_usd",
                    "fillMode": "text",
                    "selectorHint": "input[name*='asking' i], input[name*='price' i][type='number'], input[placeholder*='asking' i]"
                },
                {
                    "key": "ttm_revenue_usd",
                    "label": "TTM revenue (USD)",
                    "profilePath": "profile_data.ttm_revenue_usd",
                    "fillMode": "text",
                    "selectorHint": "input[name*='ttm' i][name*='revenue' i], input[name*='ttm_revenue' i], input[placeholder*='TTM revenue' i]"
                },
                {
                    "key": "monthly_revenue_usd",
                    "label": "Monthly revenue (USD)",
                    "profilePath": "profile_data.monthly_revenue_usd",
                    "fillMode": "text",
                    "selectorHint": "input[name*='monthly' i][name*='revenue' i], input[name*='monthly_revenue' i]"
                },
                {
                    "key": "ttm_profit_usd",
                    "label": "TTM profit (USD)",
                    "profilePath": "profile_data.ttm_profit_usd",
                    "fillMode": "text",
                    "selectorHint": "input[name*='ttm' i][name*='profit' i], input[name*='ttm_profit' i]"
                },
                {
                    "key": "monthly_profit_usd",
                    "label": "Monthly profit (USD)",
                    "profilePath": "profile_data.monthly_profit_usd",
                    "fillMode": "text",
                    "selectorHint": "input[name*='monthly' i][name*='profit' i], input[name*='monthly_profit' i]"
                },
                {
                    "key": "selling_reason",
                    "label": "Selling reason",
                    "profilePath": "profile_data.selling_reason",
                    "fillMode": "text",
                    "selectorHint": "textarea[name*='reason' i], textarea[name*='selling' i], textarea[placeholder*='reason' i]"
                },
                {
                    "key": "included_assets",
                    "label": "Included assets",
                    "profilePath": "profile_data.included_assets",
                    "fillMode": "tags",
                    "selectorHint": "input[type='checkbox'][name*='asset' i], fieldset[name*='included' i] input[type='checkbox']"
                }
            ]
        }
    ],
    "proof": {
        "successPathRegex": "/product/|/launch/",
        "listingUrlSelector": "a[href*='uneed.best'][href*='/product']"
    }
}$json$::jsonb
WHERE provider_slug = 'uneed-join-line';

UPDATE public.auto_launch_destinations
SET extension_config = $json${
    "version": 1,
    "startUrlPatterns": [
        "https://uneed.best/*",
        "https://www.uneed.best/*"
    ],
    "readyUrlHint": "profile",
    "steps": [
        {
            "id": "profile_info",
            "label": "Profile",
            "fields": [
                {
                    "key": "name",
                    "label": "Display name",
                    "profilePath": "name",
                    "fillMode": "text",
                    "selectorHint": "input[name=\"name\"]"
                },
                {
                    "key": "website",
                    "label": "Website",
                    "profilePath": "website_url",
                    "fillMode": "text",
                    "selectorHint": "input[name=\"url\"]"
                },
                {
                    "key": "tagline",
                    "label": "Bio or tagline",
                    "profilePath": "tagline",
                    "fillMode": "text",
                    "selectorHint": "textarea[name*='bio' i], textarea[name*='about' i], textarea[name*='tagline' i]"
                }
            ]
        },
        {
            "id": "socials",
            "label": "Socials",
            "fields": [
                {
                    "key": "social_x",
                    "label": "X (Twitter)",
                    "labelAliases": [
                        "Twitter"
                    ],
                    "profilePath": "profile_data.social_x",
                    "fillMode": "text",
                    "selectorHint": "input[name*='twitter' i]:not([name='name']):not([name='repo_url']), input[name*='x.com' i], input[placeholder*='twitter' i]:not([name='repo_url'])"
                },
                {
                    "key": "social_github",
                    "label": "GitHub",
                    "profilePath": "profile_data.social_github",
                    "profileSourcePaths": [
                        "profile_data.repository_url"
                    ],
                    "fillMode": "text",
                    "selectorHint": "input[name*='github' i]:not([name='repo_url']):not([name='name']), input[aria-label*='github' i]"
                },
                {
                    "key": "social_instagram",
                    "label": "Instagram",
                    "profilePath": "profile_data.social_instagram",
                    "fillMode": "text",
                    "selectorHint": "input[name*='instagram' i]:not([name='name']), input[placeholder*='instagram' i]"
                },
                {
                    "key": "social_linkedin",
                    "label": "LinkedIn",
                    "profilePath": "profile_data.social_linkedin",
                    "fillMode": "text",
                    "selectorHint": "input[name*='linkedin' i]:not([name='name']), input[placeholder*='linkedin' i]"
                },
                {
                    "key": "social_tiktok",
                    "label": "TikTok",
                    "profilePath": "profile_data.social_tiktok",
                    "fillMode": "text",
                    "selectorHint": "input[name*='tiktok' i]:not([name='name']), input[placeholder*='tiktok' i]"
                },
                {
                    "key": "social_facebook",
                    "label": "Facebook",
                    "profilePath": "profile_data.social_facebook",
                    "fillMode": "text",
                    "selectorHint": "input[name*='facebook' i]:not([name='name']), input[placeholder*='facebook' i]"
                },
                {
                    "key": "social_youtube",
                    "label": "YouTube",
                    "profilePath": "profile_data.social_youtube",
                    "fillMode": "text",
                    "selectorHint": "input[name*='youtube' i]:not([name='name']):not([name='description']):not([name='repo_url']), input[type='url'][name*='youtube' i], input[type='url'][placeholder*='youtube' i]:not([name='name'])"
                },
                {
                    "key": "social_bluesky",
                    "label": "Bluesky",
                    "profilePath": "profile_data.social_bluesky",
                    "fillMode": "text",
                    "selectorHint": "input[name*='bluesky' i]:not([name='name']), input[name*='bsky' i]:not([name='name']), input[placeholder*='bluesky' i]"
                }
            ]
        }
    ],
    "proof": {
        "successPathRegex": "/profile/",
        "listingUrlSelector": "a[href*='uneed.best/profile']"
    }
}$json$::jsonb
WHERE provider_slug = 'uneed-maker-profile';

UPDATE public.auto_launch_destinations
SET extension_config = $json${
    "version": 1,
    "startUrlPatterns": [
        "https://uneed.best/*",
        "https://www.uneed.best/*"
    ],
    "readyUrlHint": "your-tools",
    "steps": [
        {
            "id": "general",
            "label": "General",
            "fields": [
                {
                    "key": "name",
                    "label": "Product name",
                    "labelAliases": [
                        "Name"
                    ],
                    "profilePath": "name",
                    "fillMode": "text",
                    "selectorHint": "input[name=\"name\"]"
                },
                {
                    "key": "slug",
                    "label": "Slug",
                    "profilePath": "profile_data.slug",
                    "fillMode": "text",
                    "selectorHint": "input[name=\"slug\"]"
                },
                {
                    "key": "website",
                    "label": "Website",
                    "labelAliases": [
                        "Url"
                    ],
                    "profilePath": "website_url",
                    "fillMode": "text",
                    "selectorHint": "input[name=\"url\"]"
                },
                {
                    "key": "tagline",
                    "label": "Tagline",
                    "profilePath": "tagline",
                    "fillMode": "text",
                    "selectorHint": "textarea[name=\"description\"], input[name='tagline'], textarea[name='tagline'], textarea[maxlength='80'], input[maxlength='80'], input[aria-label*='tagline' i], textarea[aria-label*='tagline' i], input[placeholder*='tagline' i], textarea[placeholder*='tagline' i], input[id*='tagline' i], textarea[id*='tagline' i], input[name*='tagLine' i]",
                    "maxScalarLength": 80,
                    "required": true
                },
                {
                    "key": "category",
                    "label": "Category",
                    "profilePath": "profile_data.category",
                    "fillMode": "select",
                    "selectCatalog": "uneed",
                    "selectorHint": "select[name*='categor' i], [role='combobox'][aria-label*='categor' i], input[name*='categor' i]"
                },
                {
                    "key": "pricing_type",
                    "label": "Pricing",
                    "profilePath": "profile_data.pricing_type",
                    "fillMode": "select",
                    "selectorHint": "select[name*='pricing' i], [role='combobox'][aria-label*='pricing' i]"
                },
                {
                    "key": "tags",
                    "label": "Tags",
                    "labelAliases": [
                        "Select tags"
                    ],
                    "profilePath": "profile_data.tags",
                    "fillMode": "tags",
                    "selectorHint": "button[aria-haspopup='listbox'][aria-label='Show popup'], button[aria-haspopup='listbox'][aria-label*='popup' i], input[name*='tags' i]:not([name*='tagline' i]), input[aria-label*='tags' i]:not([aria-label*='tagline' i]), [data-testid*='tag-input' i], [data-testid*='tags-input' i]",
                    "required": true,
                    "maxItems": 3,
                    "tagsCatalog": "uneed",
                    "profileSourcePaths": [
                        "profile_data.use_cases",
                        "profile_data.platforms",
                        "profile_data.tech_stack",
                        "profile_data.categories"
                    ]
                },
                {
                    "key": "is_open_source",
                    "label": "Open source",
                    "profilePath": "profile_data.is_open_source",
                    "fillMode": "boolean",
                    "selectorHint": "input[type='checkbox'][name*='open' i], [role='switch'][aria-label*='open source' i]"
                },
                {
                    "key": "repository_url",
                    "label": "Repository URL",
                    "profilePath": "profile_data.repository_url",
                    "fillMode": "text",
                    "selectorHint": "input[name=\"repo_url\"], input[placeholder*=\"github.com\" i]"
                },
                {
                    "key": "description",
                    "label": "Rich description",
                    "profilePath": "description",
                    "fillMode": "rich_html",
                    "selectorHint": "label:has(+ .tiptap) + .tiptap .ProseMirror, label:has(+ div .tiptap) + div .tiptap .ProseMirror, .tiptap .ProseMirror[contenteditable='true'], [aria-label*='rich description' i] .ProseMirror"
                }
            ]
        },
        {
            "id": "media",
            "label": "Media",
            "fields": [
                {
                    "key": "logo",
                    "label": "Logo",
                    "profilePath": "logo_url",
                    "fillMode": "file",
                    "fileInputIndex": 0,
                    "selectorHint": "input#single[type='file']"
                },
                {
                    "key": "launch_video_url",
                    "label": "Launch video URL",
                    "profilePath": "profile_data.launch_video_url",
                    "fillMode": "text",
                    "selectorHint": "input[type='url'][aria-label*='launch video' i], input[type='url'][aria-label*='video url' i], input[type='url'][name*='launch_video' i], input[type='url'][name*='launchVideo' i], input[type='url'][name*='video_url' i]:not([name*='repo' i]):not([name*='repository' i]), input[type='url'][placeholder*='youtube' i], input[type='url'][placeholder*='vimeo' i]"
                },
                {
                    "key": "gallery",
                    "label": "Gallery images",
                    "labelAliases": [
                        "Images",
                        "Product images"
                    ],
                    "profilePath": "profile_data.gallery_urls",
                    "fillMode": "files",
                    "fileInputIndex": 0,
                    "maxItems": 3,
                    "selectorHint": "div:has(> h3:first-child), input[type='file'][accept*='image']"
                }
            ]
        },
        {
            "id": "socials",
            "label": "Socials",
            "fields": [
                {
                    "key": "social_x",
                    "label": "X (Twitter)",
                    "labelAliases": [
                        "Twitter"
                    ],
                    "profilePath": "profile_data.social_x",
                    "fillMode": "text",
                    "selectorHint": "input[name*='twitter' i]:not([name='name']):not([name='repo_url']), input[name*='x.com' i], input[placeholder*='twitter' i]:not([name='repo_url'])"
                },
                {
                    "key": "social_github",
                    "label": "GitHub",
                    "profilePath": "profile_data.social_github",
                    "profileSourcePaths": [
                        "profile_data.repository_url"
                    ],
                    "fillMode": "text",
                    "selectorHint": "input[name*='github' i]:not([name='repo_url']):not([name='name']), input[aria-label*='github' i]"
                },
                {
                    "key": "social_instagram",
                    "label": "Instagram",
                    "profilePath": "profile_data.social_instagram",
                    "fillMode": "text",
                    "selectorHint": "input[name*='instagram' i]:not([name='name']), input[placeholder*='instagram' i]"
                },
                {
                    "key": "social_linkedin",
                    "label": "LinkedIn",
                    "profilePath": "profile_data.social_linkedin",
                    "fillMode": "text",
                    "selectorHint": "input[name*='linkedin' i]:not([name='name']), input[placeholder*='linkedin' i]"
                },
                {
                    "key": "social_tiktok",
                    "label": "TikTok",
                    "profilePath": "profile_data.social_tiktok",
                    "fillMode": "text",
                    "selectorHint": "input[name*='tiktok' i]:not([name='name']), input[placeholder*='tiktok' i]"
                },
                {
                    "key": "social_facebook",
                    "label": "Facebook",
                    "profilePath": "profile_data.social_facebook",
                    "fillMode": "text",
                    "selectorHint": "input[name*='facebook' i]:not([name='name']), input[placeholder*='facebook' i]"
                },
                {
                    "key": "social_youtube",
                    "label": "YouTube",
                    "profilePath": "profile_data.social_youtube",
                    "fillMode": "text",
                    "selectorHint": "input[name*='youtube' i]:not([name='name']):not([name='description']):not([name='repo_url']), input[type='url'][name*='youtube' i], input[type='url'][placeholder*='youtube' i]:not([name='name'])"
                },
                {
                    "key": "social_bluesky",
                    "label": "Bluesky",
                    "profilePath": "profile_data.social_bluesky",
                    "fillMode": "text",
                    "selectorHint": "input[name*='bluesky' i]:not([name='name']), input[name*='bsky' i]:not([name='name']), input[placeholder*='bluesky' i]"
                }
            ]
        },
        {
            "id": "sell",
            "label": "Sell",
            "fields": [
                {
                    "key": "acquisition_listed",
                    "label": "Listed for acquisition",
                    "profilePath": "profile_data.acquisition_listed",
                    "fillMode": "boolean",
                    "selectorHint": "input[type='checkbox'][name*='acquisition' i], input[type='checkbox'][name*='sell' i], [role='switch'][aria-label*='acquisition' i]"
                },
                {
                    "key": "asking_price_usd",
                    "label": "Asking price (USD)",
                    "profilePath": "profile_data.asking_price_usd",
                    "fillMode": "text",
                    "selectorHint": "input[name*='asking' i], input[name*='price' i][type='number'], input[placeholder*='asking' i]"
                },
                {
                    "key": "ttm_revenue_usd",
                    "label": "TTM revenue (USD)",
                    "profilePath": "profile_data.ttm_revenue_usd",
                    "fillMode": "text",
                    "selectorHint": "input[name*='ttm' i][name*='revenue' i], input[name*='ttm_revenue' i], input[placeholder*='TTM revenue' i]"
                },
                {
                    "key": "monthly_revenue_usd",
                    "label": "Monthly revenue (USD)",
                    "profilePath": "profile_data.monthly_revenue_usd",
                    "fillMode": "text",
                    "selectorHint": "input[name*='monthly' i][name*='revenue' i], input[name*='monthly_revenue' i]"
                },
                {
                    "key": "ttm_profit_usd",
                    "label": "TTM profit (USD)",
                    "profilePath": "profile_data.ttm_profit_usd",
                    "fillMode": "text",
                    "selectorHint": "input[name*='ttm' i][name*='profit' i], input[name*='ttm_profit' i]"
                },
                {
                    "key": "monthly_profit_usd",
                    "label": "Monthly profit (USD)",
                    "profilePath": "profile_data.monthly_profit_usd",
                    "fillMode": "text",
                    "selectorHint": "input[name*='monthly' i][name*='profit' i], input[name*='monthly_profit' i]"
                },
                {
                    "key": "selling_reason",
                    "label": "Selling reason",
                    "profilePath": "profile_data.selling_reason",
                    "fillMode": "text",
                    "selectorHint": "textarea[name*='reason' i], textarea[name*='selling' i], textarea[placeholder*='reason' i]"
                },
                {
                    "key": "included_assets",
                    "label": "Included assets",
                    "profilePath": "profile_data.included_assets",
                    "fillMode": "tags",
                    "selectorHint": "input[type='checkbox'][name*='asset' i], fieldset[name*='included' i] input[type='checkbox']"
                }
            ]
        },
        {
            "id": "launch_notes",
            "label": "Launch details",
            "fields": [
                {
                    "key": "launch_date",
                    "label": "Preferred launch date",
                    "profilePath": "profile_data.launch_date",
                    "fillMode": "text",
                    "selectorHint": "input[type='date'], [data-test*='date' i]"
                },
                {
                    "key": "tier_note",
                    "label": "Tier or promo code",
                    "profilePath": "profile_data.paid_tier_note",
                    "fillMode": "text",
                    "selectorHint": "input[name*='promo' i], input[name*='code' i]"
                }
            ]
        }
    ],
    "proof": {
        "successPathRegex": "/product/|/launch/",
        "listingUrlSelector": "a[href*='uneed.best'][href*='/product']"
    }
}$json$::jsonb
WHERE provider_slug = 'uneed-paid-launch';

COMMIT;
