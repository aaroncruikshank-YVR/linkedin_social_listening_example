# LinkedIn Social Listening Pipeline for n8n

An automated LinkedIn social listening workflow built in [n8n](https://n8n.io) that surfaces high-value engagement opportunities from LinkedIn posts daily. It scrapes posts matching your keywords, scores them against your Ideal Customer Profile (ICP) list, filters out noise, qualifies leads using an LLM, and delivers a prioritized engagement queue to a Google Sheet with ClickUp and SMS notifications.

## What It Does

1. **Scrapes LinkedIn posts** daily using [Apify's LinkedIn Post Scraper](https://apify.com/supreme_coder/linkedin-post) across 14 keyword searches with geographic filtering
2. **Normalizes** data into a consistent format
3. **Deduplicates** against previously seen posts
4. **Matches** post authors against your ICP Master List (by LinkedIn profile URL)
5. **Scores and classifies** posts into Tier 1/2/3 using keyword matching, title filtering, engagement thresholds, spam detection, and job posting filters
6. **LLM qualification** via OpenRouter (Gemini 2.5 Flash) rates each post as HOT, WARM, or COLD in batches of 5, and drops COLD posts
7. **Writes results** to a Google Sheet engagement queue with all metadata
8. **Notifies you** via ClickUp Chat and Twilio SMS

## Architecture

```
Schedule Trigger (6 AM daily)
    |
    +-- Apify Trigger Search (14 keywords, 20 results each, geo-filtered)
    |       |
    |   Normalize Results
    |       |
    |   Read Already Seen (Google Sheets)
    |       |
    |   Deduplicate ----+
    |                   |
    +-- Read ICP List --+-- Wait for Both (Merge node)
                                |
                        Score and Classify
                                |
                        LLM Qualify (batched, 5 per call)
                              /   \
          Write Already Seen       Write Engagement Queue
                                         |
                                   ClickUp Chat Notification
                                         |
                                   SMS Notification (Twilio)
```

The Schedule Trigger fires two parallel branches: the Apify scrape (top) and the ICP list read (bottom). A Merge node ("Wait for Both") ensures both branches complete before scoring begins. This prevents the ICP list from being read once per post and avoids Google Sheets quota issues with large ICP lists.

## Geographic Filtering

All Apify search URLs include `geoUrn` parameters that restrict results to posts from authors in:

Canada, United States, United Kingdom, Australia, Germany, France, Netherlands, Ireland, Sweden, Belgium

You can customize these by editing the `geoUrn` parameter in each URL. LinkedIn country IDs are encoded as a URL-encoded JSON array in the search URL.

## Keywords (14 searches)

**Tier 1 (high intent):** market intelligence, competitive intelligence, environmental scan, market sizing, industry analysis, competitive landscape, market expansion, go to market strategy

**Tier 2 (active cycle):** strategic planning, market validation, market entry, market research, business case, due diligence

You can add or remove keywords by editing the `urls` array in the Apify node and updating the corresponding `tier1Keywords`/`tier2Keywords` arrays in the Score and Classify code node.

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

The batched approach prevents token truncation issues and includes JSON recovery logic for partial responses. If a batch fails, those posts are marked UNSCORED while the rest process normally.

## Prerequisites

### Accounts Needed

- **[Apify](https://apify.com)** - LinkedIn Post Scraper actor ($5 free credits/month)
- **[OpenRouter](https://openrouter.ai)** - LLM API for lead qualification
- **[Twilio](https://twilio.com)** - SMS notifications
- **[ClickUp](https://clickup.com)** - Chat notifications (optional)
- **Google Cloud** - Sheets API enabled with OAuth credentials

### n8n Credentials to Configure

- Google Sheets OAuth2 API
- Twilio API (Account SID + Auth Token)

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

Replace these placeholders in the workflow nodes:

| Placeholder | Where | What |
|------------|-------|------|
| `YOUR_APIFY_TOKEN` | Apify - Trigger Search (URL) | Your Apify API token |
| `YOUR_GOOGLE_SHEET_ID` | All Google Sheets nodes | The ID from your Google Sheet URL |
| `YOUR_CREDENTIAL_ID` | All Google Sheets nodes | Your n8n Google Sheets credential ID |
| `YOUR_OPENROUTER_API_KEY` | LLM Qualify (code) | Your OpenRouter API key |
| `YOUR_CLICKUP_API_TOKEN` | ClickUp Chat Notification | Your ClickUp personal API token |
| `YOUR_WORKSPACE_ID` | ClickUp Chat Notification (URL) | Your ClickUp workspace ID |
| `YOUR_CHANNEL_ID` | ClickUp Chat Notification (URL) | Your ClickUp chat channel ID |
| `YOUR_TWILIO_ACCOUNT_SID` | SMS Notification (URL) | Your Twilio Account SID |
| `YOUR_TWILIO_PHONE_NUMBER` | SMS Notification (body) | Your Twilio phone number |
| `YOUR_PHONE_NUMBER` | SMS Notification (body) | Your personal cell number |

### 4. Set Up Credentials in n8n

Create these credentials in n8n (Settings > Credentials):

- **Google Sheets OAuth2 API**: Authenticate against your Google account. Make sure the Google Sheets API is enabled in your Google Cloud project. If your ICP list is large (4,000+ rows), increase your "Read requests per minute per user" quota to 300 in Google Cloud Console.
- **Twilio API**: Enter your Account SID and Auth Token.

### 5. Populate Your ICP List

Export contacts from LinkedIn Sales Navigator, enrich with Snov.io or Apollo.io, and paste into the ICP Master List tab. Clean the `linkedin_profile_url` column so every URL follows the format `https://www.linkedin.com/in/username` (no trailing slashes, no query parameters).

### 6. Customize Keywords

Edit the `urls` array in the Apify node's JSON body to match your target keywords. Also update the `tier1Keywords` and `tier2Keywords` arrays in the Score and Classify code node to match. Keep both in sync.

### 7. Test and Activate

1. Run a manual test to verify data flows through all nodes
2. Check your Engagement Queue sheet for results
3. Toggle the workflow to Active
4. The workflow will run daily at 6 AM (configurable in Schedule Trigger)

## Customization

### Adding/Removing Keywords

- **Search keywords**: Edit the `urls` array in the Apify node JSON body. Each URL follows the format: `https://www.linkedin.com/search/results/content/?datePosted=%22past-24h%22&keywords=YOUR KEYWORD&geoUrn=...&origin=FACETED_SEARCH`
- **Scoring keywords**: Edit `tier1Keywords` and `tier2Keywords` arrays in Score and Classify
- **Negative keywords**: Edit `negativeKeywords` array in Score and Classify

### Adjusting Filters

- **Engagement threshold**: Modify the zero-engagement check in Score and Classify
- **Daily cap**: Change `scored.slice(0, 20)` to your preferred number
- **Title filters**: Edit `goodTitles` and `badTitles` arrays
- **Report spam signals**: Edit `reportSpamSignals` array
- **Job posting filters**: Edit the hiring-related entries in `negativeKeywords`

### Changing the LLM

Edit the `model` field in LLM Qualify. Any OpenRouter-compatible model works. The `BATCH_SIZE` constant controls how many posts are sent per LLM call (default: 5). Adjust the system prompt to match your firm's positioning.

### Geographic Filtering

Each Apify URL contains a `geoUrn` parameter with LinkedIn country IDs. To change the countries:

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

### Notification Channels

- Remove ClickUp/SMS nodes if not needed
- Add Slack, email, or other notification nodes as alternatives
- The ClickUp notification uses the v3 Chat API

## n8n-Specific Notes

- **Merge node for parallel branches**: The "Wait for Both" Merge node is critical. Without it, the Score and Classify code node fires as soon as one branch completes, before the ICP list is loaded. This is a common n8n pattern: always use a Merge node before a Code node that references multiple upstream branches.
- **Retry on Fail**: All Google Sheets nodes have Retry on Fail enabled (3 retries, 5-second wait) to handle API rate limits gracefully.
- **Parallel writes**: Write Already Seen and Write Engagement Queue run in parallel from LLM Qualify. This ensures the Engagement Queue gets the full data (including LLM ratings), since Google Sheets append nodes strip their output to only the fields they wrote.

## Google Sheets Quota Note

If your ICP list is large (4,000+ rows), you may hit Google Sheets API rate limits during testing. In production (one run per day), this is not an issue. To avoid problems during development:

1. Increase your "Read requests per minute per user" quota to 300 in Google Cloud Console (APIs & Services > Google Sheets API > Quotas)
2. Temporarily deactivate other workflows that poll Google Sheets while testing
3. Wait 2-5 minutes between test runs

## Cost Estimates

| Service | Monthly Cost |
|---------|-------------|
| Apify (14 keywords x 20/source) | ~$5-8 |
| OpenRouter (Gemini 2.5 Flash) | < $1 |
| Twilio SMS | < $1 |
| n8n (self-hosted) | Free |
| **Total** | **~$7-10/month** |

## Changelog

### v2 (May 2026)
- Dropped SerpAPI (Google closed Custom Search JSON API to new customers), Apify is now the sole data source
- Added geographic filtering (geoUrn parameter) to limit results to target countries
- Expanded from 8 to 14 keyword searches
- Restructured ICP list reading to run in parallel via Merge node (fixes 700K+ item multiplication bug)
- LLM qualification now processes in batches of 5 with JSON truncation recovery
- Added job posting filters to negative keywords
- Fixed code typos in Score and Classify
- Parallel write branches for Already Seen and Engagement Queue

### v1 (April 2026)
- Initial release with SerpAPI + Apify dual-source architecture
- Single LLM call for all posts
- Sequential ICP list reading

## License

CC0-1.0. Use it, modify it, share it.

## Credits

Built by [CTRS Market Intelligence](https://ctrs.co) with Claude (Anthropic).
