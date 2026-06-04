# LinkedIn Social Listening Pipeline for n8n

An automated LinkedIn social listening workflow built in [n8n](https://n8n.io) that surfaces high-value engagement opportunities from LinkedIn posts daily. It scrapes posts matching your keywords, scores them against your Ideal Customer Profile (ICP) list, filters out noise, qualifies leads using an LLM, and delivers a prioritized engagement queue to a Google Sheet with ClickUp and SMS notifications.

## What It Does

1. **Scrapes LinkedIn posts** daily using [Apify's LinkedIn Post Scraper](https://apify.com/supreme_coder/linkedin-post) across 14 keyword searches with geographic filtering (async approach for resilience)
2. **Normalizes** data into a consistent format
3. **Deduplicates** against previously seen posts (fetched via Sheets API inside the Code node)
4. **Matches** post authors against your ICP Master List (fetched via Sheets API inside the Code node)
5. **Scores and classifies** posts into Tier 1/2/3 using keyword matching, title filtering, engagement thresholds, spam detection, and job posting filters
6. **LLM qualification** via OpenRouter (Gemini 2.5 Flash) rates each post as HOT, WARM, or COLD in batches of 5, and drops COLD posts
7. **Writes results** to a Google Sheet engagement queue with all metadata
8. **Notifies you** via ClickUp Chat and Twilio SMS

## Architecture

```
Schedule Trigger (6 AM daily)
    |
Apify - Trigger Search (POST async /runs endpoint)
    |
Wait for Apify (5 minutes)
    |
Apify - Get Results (GET /runs/last/dataset/items)
    |
Normalize Results (Code - $input.all() only)
    |
Deduplicate (Code - fetches Already Seen via Sheets API internally)
    |
Score and Classify (Code - fetches ICP list via Sheets API internally)
    |
LLM Qualify (Code - batched 5 per call via OpenRouter)
    |
    +-- Write Already Seen (Google Sheets append)
    |
    +-- Write Engagement Queue (Google Sheets append)
            |
        ClickUp Chat Notification
            |
        SMS Notification (Twilio)
```

### Why Self-Contained Code Nodes?

The n8n Wait node breaks the execution context, making `$('NodeName')` references unreliable for any node in the workflow. This causes intermittent "Node hasn't been executed" errors that are difficult to debug because they don't fail consistently.

The solution: every Code node uses only `$input.all()` for data flowing through the pipeline and fetches any reference data (Already Seen URLs, ICP Master List) via direct Google Sheets API calls using `this.helpers.requestWithAuthentication()`. This eliminates all named node references and makes the pipeline immune to execution context issues.

### Why Async Apify?

The async approach (trigger, wait, fetch results) is more resilient than the sync endpoint. If Apify encounters infrastructure issues (exhausted proxy pools, partial scraping failures), the sync endpoint returns nothing. The async approach returns whatever was successfully scraped before the errors occurred.

## Geographic Filtering

All Apify search URLs include `geoUrn` parameters that restrict results to posts from authors in:

Canada, United States, United Kingdom, Australia, Germany, France, Netherlands, Ireland, Sweden, Belgium

You can customize these by editing the `geoUrn` parameter in each URL. LinkedIn country IDs are encoded as a URL-encoded JSON array in the search URL.

## Keywords (14 searches)

**Tier 1 (high intent):** market intelligence, competitive intelligence, environmental scan, market sizing, industry analysis, competitive landscape, market expansion, go to market strategy

**Tier 2 (active cycle):** strategic planning, market validation, market entry, market research, business case, due diligence

## Scoring Logic

### Filters (posts that get dropped)

- **Report spam**: Posts containing "billion"/"usd" alongside CAGR, "sample copy", "forecast period", etc.
- **Zero engagement**: Posts with no likes or comments (unless the author is on your ICP list)
- **Negative keywords**: Survey tools, UX research, Qualtrics, SurveyMonkey, etc.
- **Job postings**: Posts containing "we are hiring", "now hiring", "job opening", "#hiring", "join our team", etc.
- **Bad titles**: Students, interns, recruiters, developers, freelancers, job seekers

### Scoring

| Signal | Points |
|--------|--------|
| ICP list match | +5 |
| Good title (VP, Director, Head of, Strategy, etc.) | +2 |
| Tier 1 keyword match (high intent) | +3 |
| Tier 2 keyword match (active cycle) | +2 |
| Engagement > 50 | +1 |
| Engagement > 200 | +1 |

Minimum score threshold: 2. Daily cap: 20 posts. ICP matches auto-bump to Tier 1.

### LLM Qualification

Posts that pass scoring are sent to Gemini 2.5 Flash via OpenRouter in batches of 5:

- **HOT**: Active buying intent or pain point
- **WARM**: Relevant role, worth engaging for relationship building
- **COLD**: Vendor, student, generic thought leadership (dropped)

The batched approach prevents token truncation issues and includes JSON recovery logic for partial responses.

## Prerequisites

### Accounts Needed

- **[Apify](https://apify.com)** - LinkedIn Post Scraper actor ($5 free credits/month)
- **[OpenRouter](https://openrouter.ai)** - LLM API for lead qualification
- **[Twilio](https://twilio.com)** - SMS notifications
- **[ClickUp](https://clickup.com)** - Chat notifications (optional)
- **Google Cloud** - Sheets API enabled with OAuth credentials

### n8n Credentials to Configure

- **Google Sheets OAuth2 API** - used by both the Google Sheets append nodes AND the Code nodes (Deduplicate and Score and Classify fetch data via `this.helpers.requestWithAuthentication()`)
- **Twilio API** (Account SID + Auth Token)

## Setup

### 1. Create Google Sheet

Create a Google Sheets workbook with three tabs:

**ICP Master List** (headers in Row 1):
`linkedin_profile_url`, `first_name`, `last_name`, `title`, `company`, `company_size`, `industry`, `geography`, `email`, `snov_enrichment_date`, `account_tier`, `notes`

**Already Seen** (headers in Row 1):
`post_url`, `date_first_seen`, `author_linkedin_url`, `author_name`

**Engagement Queue** (headers in Row 1):
`date_found`, `tier`, `relevance_score`, `post_url`, `author_name`, `author_headline`, `author_linkedin_url`, `company`, `post_snippet`, `keyword_matched`, `icp_list_match`, `engagement_status`, `engagement_notes`, `follow_up_action`, `llm_rating`, `llm_reason`

### 2. Import the Workflow

1. Open n8n
2. Create a new workflow
3. Click the three-dot menu > Import from File
4. Select `linkedin-social-listening-workflow.json`

### 3. Configure Placeholders

Replace these placeholders in the workflow:

| Placeholder | Where | What |
|------------|-------|------|
| `YOUR_APIFY_TOKEN` | Apify Trigger + Get Results (URL) | Your Apify API token |
| `YOUR_GOOGLE_SHEET_ID` | Deduplicate code, Score and Classify code, Write nodes | The ID from your Google Sheet URL |
| `YOUR_CREDENTIAL_ID` | Write Already Seen, Write Engagement Queue | Your n8n Google Sheets credential ID |
| `YOUR_OPENROUTER_API_KEY` | LLM Qualify (code) | Your OpenRouter API key |
| `YOUR_CLICKUP_API_TOKEN` | ClickUp Chat Notification | Your ClickUp personal API token |
| `YOUR_WORKSPACE_ID` | ClickUp Chat Notification (URL) | Your ClickUp workspace ID |
| `YOUR_CHANNEL_ID` | ClickUp Chat Notification (URL) | Your ClickUp chat channel ID |
| `YOUR_TWILIO_ACCOUNT_SID` | SMS Notification (URL) | Your Twilio Account SID |
| `YOUR_TWILIO_PHONE_NUMBER` | SMS Notification (body) | Your Twilio phone number |
| `YOUR_PHONE_NUMBER` | SMS Notification (body) | Your personal cell number |

**Important**: The `YOUR_GOOGLE_SHEET_ID` placeholder appears in **two Code nodes** (Deduplicate and Score and Classify) in addition to the Google Sheets write nodes. Make sure you update all four locations.

### 4. Set Up Credentials in n8n

- **Google Sheets OAuth2 API**: Authenticate against your Google account. Make sure the Google Sheets API is enabled in your Google Cloud project. If your ICP list is large (4,000+ rows), increase your "Read requests per minute per user" quota to 300 in Google Cloud Console.
- **Twilio API**: Enter your Account SID and Auth Token.

### 5. Populate Your ICP List

Export contacts from LinkedIn Sales Navigator, enrich with Snov.io or Apollo.io, and paste into the ICP Master List tab. Clean the `linkedin_profile_url` column so every URL follows the format `https://www.linkedin.com/in/username` (no trailing slashes, no query parameters).

### 6. Test and Activate

1. Run a manual test (note: the Wait node will pause execution for 5 minutes)
2. Check your Engagement Queue sheet for results
3. Toggle the workflow to Active
4. The workflow will run daily at 6 AM (configurable in Schedule Trigger)

## Customization

### Adding/Removing Keywords

- **Search keywords**: Edit the `urls` array in the Apify Trigger node's JSON body
- **Scoring keywords**: Edit `tier1Keywords` and `tier2Keywords` arrays in Score and Classify
- **Negative keywords**: Edit `negativeKeywords` array in Score and Classify

### Geographic Filtering

Each Apify URL contains a `geoUrn` parameter with LinkedIn country IDs:

| Country | LinkedIn ID |
|---------|-------------|
| Canada | 101174742 |
| United States | 103644278 |
| United Kingdom | 101165590 |
| Australia | 101452733 |
| Germany | 101282230 |
| France | 105015875 |
| Netherlands | 102890719 |
| Ireland | 104738515 |
| Sweden | 105117694 |
| Belgium | 100565514 |

### Changing the LLM

Edit the `model` field in LLM Qualify. Any OpenRouter-compatible model works. The `BATCH_SIZE` constant controls how many posts are sent per LLM call (default: 5).

### Notification Channels

- Remove ClickUp/SMS nodes if not needed
- Add Slack, email, or other notification nodes as alternatives

## n8n-Specific Notes

- **Wait node breaks ALL `$('NodeName')` references**: This is an n8n bug. After a Wait node, the execution context is unreliable for named node references, even for nodes that execute after the Wait. The only safe pattern is `$input.all()` combined with internal API calls for reference data.
- **Self-contained Code nodes**: Deduplicate and Score and Classify fetch their reference data (Already Seen sheet, ICP Master List) via `this.helpers.requestWithAuthentication()` inside the Code node. This uses your configured Google Sheets OAuth2 credential and calls the Sheets API v4 directly.
- **Async Apify**: The trigger/wait/get-results pattern is more resilient to Apify infrastructure issues than the sync endpoint.
- **Parallel writes**: Write Already Seen and Write Engagement Queue run in parallel from LLM Qualify.
- **Retry on Fail**: All Google Sheets write nodes have Retry on Fail enabled (3 retries, 5-second wait).

## Cost Estimates

| Service | Monthly Cost |
|---------|-------------|
| Apify (14 keywords x 20/source) | ~$5-8 |
| OpenRouter (Gemini 2.5 Flash) | < $1 |
| Twilio SMS | < $1 |
| n8n (self-hosted) | Free |
| **Total** | **~$7-10/month** |

## Changelog

### v3 (June 2026)
- Eliminated ALL `$('NodeName')` references from Code nodes
- Removed Read Already Seen and Read ICP List as separate nodes
- Deduplicate and Score and Classify now fetch reference data via Google Sheets API internally using `this.helpers.requestWithAuthentication()`
- Switched to async Apify (trigger, wait 5 min, get results) for resilience to partial scraping failures
- Removed Merge ("Wait for Both") node
- Workflow simplified from 15 nodes to 11
- Added job posting filters to negative keywords

### v2 (May 2026)
- Dropped SerpAPI, Apify is sole data source
- Added geographic filtering (geoUrn parameter)
- Expanded from 8 to 14 keyword searches
- LLM qualification batched (5 per call) with JSON truncation recovery
- Parallel write branches for Already Seen and Engagement Queue

### v1 (April 2026)
- Initial release with SerpAPI + Apify dual-source architecture
- Single LLM call for all posts
- Sequential ICP list reading

## License

CC0-1.0. Use it, modify it, share it.

## Credits

Built by [CTRS Market Intelligence](https://ctrs.co) with Claude (Anthropic).
