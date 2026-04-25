# LinkedIn Social Listening Pipeline for n8n

An automated LinkedIn social listening workflow built in [n8n](https://n8n.io) that surfaces high-value engagement opportunities from LinkedIn posts daily. It scrapes posts matching your keywords, scores them against your Ideal Customer Profile (ICP) list, filters out noise, qualifies leads using an LLM, and delivers a prioritized engagement queue to a Google Sheet with ClickUp and SMS notifications.

## What It Does

1. **Scrapes LinkedIn posts** daily using [Apify's LinkedIn Post Scraper](https://apify.com/supreme_coder/linkedin-post) across 8 keyword searches
2. **Normalizes** data into a consistent format (handles Apify's field structure)
3. **Deduplicates** against previously seen posts
4. **Matches** post authors against your ICP Master List (by LinkedIn profile URL)
5. **Scores and classifies** posts into Tier 1/2/3 using keyword matching, title filtering, engagement thresholds, and report spam detection
6. **LLM qualification** via OpenRouter (Gemini 2.5 Flash) rates each post as HOT, WARM, or COLD and drops COLD posts
7. **Writes results** to a Google Sheet engagement queue with all metadata
8. **Notifies you** via ClickUp Chat and Twilio SMS

## Architecture

```
Schedule Trigger (6 AM daily)
    |
Apify - Trigger Search (8 keyword URLs, 20 results each)
    |
Normalize Results (Code node)
    |
Read Already Seen (Google Sheets)
    |
Deduplicate (Code node)
    |
Read ICP List (Google Sheets)
    |
Score and Classify (Code node)
    |
LLM Qualify (Code node - OpenRouter API)
    |
    +-- Write Already Seen (Google Sheets) [parallel branch]
    |
    +-- Write Engagement Queue (Google Sheets)
            |
        ClickUp Chat Notification
            |
        SMS Notification (Twilio)
```

## Scoring Logic

### Filters (posts that get dropped)
- **Report spam**: Posts containing "billion"/"usd" alongside CAGR, "sample copy", "forecast period", etc.
- **Zero engagement**: Posts with no likes or comments (unless the author is on your ICP list)
- **Negative keywords**: Survey tools, UX research, Qualtrics, SurveyMonkey, etc.
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
Posts that pass scoring are evaluated by Gemini 2.5 Flash via OpenRouter:
- **HOT**: Active buying intent or pain point
- **WARM**: Relevant role, worth engaging for relationship building
- **COLD**: Vendor, student, generic thought leadership (dropped)

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

### 4. Set Up Google Sheets Credentials

In n8n, create a Google Sheets OAuth2 credential authenticated against your Google account. Make sure the Google Sheets API is enabled in your Google Cloud project.

### 5. Populate Your ICP List

Export contacts from LinkedIn Sales Navigator, enrich with Snov.io, and paste into the ICP Master List tab. Clean the `linkedin_profile_url` column so every URL follows the format `https://www.linkedin.com/in/username` (no trailing slashes, no query parameters).

### 6. Customize Keywords

Edit the `urls` array in the Apify node's JSON body to match your target keywords. Also update the `tier1Keywords` and `tier2Keywords` arrays in the Score and Classify code node to match.

### 7. Test and Activate

1. Run a manual test to verify data flows through all nodes
2. Check your Engagement Queue sheet for results
3. Toggle the workflow to Active
4. The workflow will run daily at 6 AM (configurable in Schedule Trigger)

## Customization

### Adding/Removing Keywords
- **Search keywords**: Edit the `urls` array in the Apify node JSON body
- **Scoring keywords**: Edit `tier1Keywords` and `tier2Keywords` arrays in Score and Classify
- **Negative keywords**: Edit `negativeKeywords` array in Score and Classify

### Adjusting Filters
- **Engagement threshold**: Modify the zero-engagement check in Score and Classify
- **Daily cap**: Change `scored.slice(0, 20)` to your preferred number
- **Title filters**: Edit `goodTitles` and `badTitles` arrays
- **Report spam signals**: Edit `reportSpamSignals` array

### Changing the LLM
Edit the `model` field in LLM Qualify. Any OpenRouter-compatible model works. Adjust the system prompt to match your firm's positioning.

### Notification Channels
- Remove ClickUp/SMS nodes if not needed
- Add Slack, email, or other notification nodes as alternatives
- The ClickUp notification uses the v3 Chat API (experimental)

## Google Sheets Quota Note

If your ICP list is large (4,000+ rows), you may hit Google Sheets API rate limits during testing. All Google Sheets nodes have Retry on Fail enabled with 5-second waits. In production (one run per day), this is not an issue. If you hit limits during development, increase your "Read requests per minute per user" quota in Google Cloud Console under APIs & Services > Google Sheets API > Quotas.

## Cost Estimates

| Service | Monthly Cost |
|---------|-------------|
| Apify | ~$3-5 (or free tier) |
| OpenRouter (Gemini 2.5 Flash) | < $1 |
| Twilio SMS | < $1 |
| n8n (self-hosted) | Free |
| **Total** | **~$5/month** |

## License

MIT License. Use it, modify it, share it.

## Credits

Built by [CTRS Market Intelligence](https://ctrs.co) with Claude (Anthropic).
