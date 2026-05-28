# LinkedIn Social Listening Pipeline - Make.com Setup Guide

A step-by-step guide to building an automated LinkedIn social listening pipeline in Make.com (formerly Integromat). This guide is written for any consulting or professional services business that wants to surface LinkedIn engagement opportunities from their target market daily.

---

## What You're Building

An automation that runs once a day and:

1. Searches LinkedIn for posts matching your keywords
2. Filters out spam, irrelevant posts, and low-quality noise
3. Scores each post based on author relevance and keyword intent
4. Uses AI to qualify whether the author looks like a potential buyer
5. Delivers a prioritized list of posts to engage with

By the end, you'll have a Google Sheet that populates every morning with 5-20 high-quality LinkedIn posts to comment on, sorted by priority.

---

## Prerequisites

You'll need accounts with these services before you start building.

### Apify (LinkedIn Scraper)

Apify is a web scraping platform. You'll use the "LinkedIn Post Scraper" actor by Supreme Coder.

1. Sign up at https://apify.com (free tier includes $5/month in credits)
2. Find the actor: go to Apify Store, search "LinkedIn Post Scraper" by supreme_coder
3. Get your API token: Settings > Integrations
4. Note the actor ID: `supreme_coder~linkedin-post`

Cost: approximately $3-5/month at daily usage.

### OpenRouter (AI Qualification)

OpenRouter gives you access to multiple LLM providers through a single API. You'll use it to qualify leads.

1. Sign up at https://openrouter.ai
2. Add credits (even $5 will last months for this use case)
3. Get your API key from the dashboard

Recommended model: `google/gemini-2.5-flash` (fast, cheap, good at classification).

Cost: less than $1/month.

### Google Sheets

You'll use one Google Sheets workbook with three tabs as your data layer. No paid plan needed.

### Notification Channel (Optional)

Pick one or more:
- Slack (via Make.com's built-in Slack module)
- Email (via Gmail or SMTP module)
- SMS (via Twilio -- free trial available at https://twilio.com)
- Microsoft Teams, Discord, or any other messaging platform Make.com supports

### Make.com Account

Sign up at https://make.com. The free plan includes 1,000 operations per month. This pipeline uses approximately 200-400 operations per run depending on volume, so you may need a paid plan ($9/month) if running daily.

---

## Step 1: Define Your Keywords

Before building anything, decide what you're listening for. Your keywords should reflect the language your ideal clients use when they're in a buying cycle or discussing problems you solve.

### How to Choose Keywords

Think about three categories:

**High-intent keywords** -- phrases someone uses when they're actively looking for help. These are your most valuable signals.

Examples for different consulting specialties:

| If You Sell... | High-Intent Keywords |
|---------------|---------------------|
| Strategy consulting | "strategic planning process", "need a strategy consultant", "starting our strategic plan" |
| Market research | "looking for market data", "need industry data", "market sizing" |
| IT consulting | "looking for an IT partner", "need to modernize our systems", "digital transformation help" |
| HR consulting | "need to improve retention", "looking for an HR consultant", "compensation benchmarking" |
| Financial advisory | "need financial modeling", "looking for a CFO", "fundraising strategy" |

**Active-cycle keywords** -- phrases people use when they're in the middle of a relevant process but haven't explicitly asked for help.

Examples: "strategic planning", "competitive analysis", "market validation", "due diligence", "business case", "board presentation"

**Thought leadership keywords** -- broader terms that indicate someone is in your world, even if they're not buying right now.

Examples: "competitive intelligence", "data-driven strategy", "insights-driven", "evidence-based decision making"

### How Many Keywords

Start with 5-8 keyword phrases. You can always add more later. Too many keywords early on means more noise to filter through.

### Build Your Keyword URLs

For each keyword, create a LinkedIn search URL in this format:

```
https://www.linkedin.com/search/results/content/?datePosted=%22past-24h%22&keywords=YOUR KEYWORD HERE&origin=FACETED_SEARCH
```

Replace `YOUR KEYWORD HERE` with your actual keyword (spaces are fine -- the URL will encode them).

Example for "strategic planning":
```
https://www.linkedin.com/search/results/content/?datePosted=%22past-24h%22&keywords=strategic planning&origin=FACETED_SEARCH
```

---

## Step 2: Build Your ICP (Ideal Customer Profile) List

The ICP list is a spreadsheet of LinkedIn profiles for people you'd love to have as clients. When the pipeline finds a post by someone on this list, it gets a massive score boost and jumps to the top of your queue.

### Where to Get Contacts

**LinkedIn Sales Navigator** is the best source. Build saved searches with these filters:

- **Seniority**: Manager, Director, VP, CXO, Partner
- **Function**: Pick the functions relevant to your business (Marketing, Strategy, Operations, Finance, HR, IT, etc.)
- **Geography**: Your target market
- **Company size**: Your sweet spot (e.g., 500+ employees)
- **Industry**: Your target industries (or leave broad and exclude the ones you don't serve)

Export contacts using a tool like Snov.io, Apollo.io, or PhantomBuster.

**If you don't have Sales Navigator**, you can build a smaller list manually:

- Export your LinkedIn connections
- Add prospects you've been following
- Add people who've attended industry events
- Add people from target companies whose profiles you've visited

### Required Fields

At minimum, your ICP list needs one column:

- `linkedin_profile_url` -- the full LinkedIn profile URL (e.g., `https://www.linkedin.com/in/janedoe`)

The more fields you add, the more useful your list becomes:

- `first_name`, `last_name`
- `title`, `company`
- `company_size`, `industry`
- `geography`
- `email` (for future outreach)
- `account_tier` (e.g., "Target Account" vs "General ICP")

### Critical: Clean Your URLs

Every `linkedin_profile_url` must follow the same format. Inconsistent formatting will prevent matches.

Good: `https://www.linkedin.com/in/janedoe`
Bad: `https://linkedin.com/in/janedoe/` (missing www, trailing slash)
Bad: `https://www.linkedin.com/in/janedoe?originalSubdomain=ca` (query parameters)

Strip all trailing slashes and query parameters. Make sure every URL starts with `https://www.linkedin.com/in/`.

---

## Step 3: Set Up Your Google Sheet

Create a new Google Sheets workbook. Create three tabs.

### Tab 1: ICP Master List

Paste your ICP data here. Headers in Row 1:

`linkedin_profile_url`, `first_name`, `last_name`, `title`, `company`, `company_size`, `industry`, `geography`, `email`, `account_tier`, `notes`

### Tab 2: Already Seen

This is used for deduplication. The automation writes to it. You never touch it. Headers in Row 1:

`post_url`, `date_first_seen`, `author_linkedin_url`, `author_name`

### Tab 3: Engagement Queue

This is your daily working sheet. The automation adds rows. You update the status as you engage. Headers in Row 1:

`date_found`, `tier`, `relevance_score`, `post_url`, `author_name`, `author_headline`, `author_linkedin_url`, `company`, `post_snippet`, `keyword_matched`, `icp_list_match`, `llm_rating`, `llm_reason`, `engagement_status`, `engagement_notes`, `follow_up_action`

The last three columns (engagement_status, engagement_notes, follow_up_action) are for you to fill in manually as you work through the queue.

---

## Step 4: Build the Make.com Scenario

In Make.com, create a new Scenario. You'll add modules in sequence.

### Module 1: Schedule

- Add a "Schedule" trigger module
- Set it to run once per day at your preferred time (e.g., 6:00 AM)

### Module 2: HTTP Request (Apify Search)

This module triggers the LinkedIn scrape.

- Module type: HTTP > Make a request
- Method: POST
- URL: `https://api.apify.com/v2/acts/supreme_coder~linkedin-post/run-sync-get-dataset-items?token=YOUR_APIFY_TOKEN`
- Body type: JSON
- Body content:

```json
{
  "deepScrape": true,
  "limitPerSource": 20,
  "rawData": false,
  "urls": [
    "https://www.linkedin.com/search/results/content/?datePosted=%22past-24h%22&keywords=YOUR KEYWORD 1&origin=FACETED_SEARCH",
    "https://www.linkedin.com/search/results/content/?datePosted=%22past-24h%22&keywords=YOUR KEYWORD 2&origin=FACETED_SEARCH",
    "https://www.linkedin.com/search/results/content/?datePosted=%22past-24h%22&keywords=YOUR KEYWORD 3&origin=FACETED_SEARCH"
  ]
}
```

- Under Advanced Settings, set Timeout to 300 seconds (5 minutes). Apify needs time to complete the scrape.

Replace `YOUR_APIFY_TOKEN` with your actual Apify API token and add your keyword URLs.

### Module 3: Iterator

Apify returns an array of results. You need to iterate over them.

- Add an Iterator module
- Set the array to the body of the HTTP response from Module 2

### Module 4: Set Variable (Normalize)

For each item from the iterator, normalize the data into a consistent format.

- Add a "Set multiple variables" module (Tools > Set multiple variables)
- Create these variables:

| Variable | Value |
|----------|-------|
| post_url | `{{item.url}}` |
| author_name | `{{item.authorName}}` |
| author_headline | `{{item.authorHeadline}}` |
| author_linkedin_url | `{{replace(first(split(item.authorProfileUrl; "?")); "/$/"; "")}}` |
| post_snippet | `{{substring(item.text; 0; 300)}}` |
| numLikes | `{{item.numLikes}}` |
| numComments | `{{item.numComments}}` |
| numShares | `{{item.numShares}}` |
| engagement_score | `{{item.numLikes + (item.numComments * 3) + (item.numShares * 2)}}` |
| author_type | `{{item.authorType}}` |

### Module 5: Filter (Skip Company Posts)

- Add a Filter between Module 4 and the next module
- Condition: `author_type` does not equal `Company`

### Module 6: Google Sheets - Read Already Seen

- Add a Google Sheets > Search Rows module
- Select your workbook and "Already Seen" tab
- Search for rows where `post_url` equals the current `post_url` variable

### Module 7: Filter (Skip Already Seen)

- Add a Filter
- Condition: Number of results from Module 6 equals 0

This skips any post that's already been processed.

### Module 8: Google Sheets - Read ICP List

- Add a Google Sheets > Search Rows module
- Select your workbook and "ICP Master List" tab
- Search for rows where `linkedin_profile_url` equals the current `author_linkedin_url` variable

Note: If your ICP list is very large (3,000+ rows), this per-row search approach in Make.com is more quota-friendly than reading the entire sheet at once. Make.com handles this differently than n8n.

### Module 9: Set Variable (Score)

This is where you apply your scoring logic. Add a "Set multiple variables" module.

You'll need to use Make.com's formula system to replicate the scoring. Here's the simplified version:

| Variable | Logic |
|----------|-------|
| icp_match | If Module 8 returned results, "Yes", otherwise "No" |
| title_score | If author_headline contains relevant titles (VP, Director, etc.), 2, otherwise 0 |
| keyword_score | Based on which keywords the post matched, 2 or 3 |
| engagement_bonus | If engagement_score > 50, 1. If > 200, 2. Otherwise 0. |
| total_score | Sum of icp_match score (5 if yes) + title_score + keyword_score + engagement_bonus |
| tier | 1 if high-intent keyword matched or ICP match, 2 if active-cycle keyword, 3 otherwise |

### Module 10: Filter (Minimum Score)

- Add a Filter
- Condition: `total_score` is greater than or equal to 2

### Module 11: Filter (Spam Detection)

- Add a Filter
- Condition: `post_snippet` does not contain "cagr" AND does not contain "sample copy" AND does not contain "forecast period"

Add any other spam patterns you notice after running for a week.

### Module 12: HTTP Request (LLM Qualification)

- Module type: HTTP > Make a request
- Method: POST
- URL: `https://openrouter.ai/api/v1/chat/completions`
- Headers: `Authorization: Bearer YOUR_OPENROUTER_API_KEY` and `Content-Type: application/json`
- Body type: JSON
- Body:

```json
{
  "model": "google/gemini-2.5-flash",
  "messages": [
    {
      "role": "system",
      "content": "You are a lead qualification assistant for a consulting firm. Evaluate this LinkedIn post and determine if the author is likely a potential buyer. Rate as HOT (active buying intent), WARM (relevant role, worth engaging), or COLD (vendor, student, or generic content). Respond with ONLY a JSON object: {\"rating\": \"HOT\", \"reason\": \"one sentence\"}"
    },
    {
      "role": "user",
      "content": "Author: {{author_name}}\nHeadline: {{author_headline}}\nPost: {{post_snippet}}"
    }
  ],
  "temperature": 0.1,
  "max_tokens": 200
}
```

Note: In Make.com, you send one LLM call per post (unlike the batch approach in n8n). This is slightly more expensive but simpler to build.

### Module 13: Parse JSON

- Add a "Parse JSON" module (Tools > Parse JSON)
- Parse the LLM response body to extract the rating and reason

### Module 14: Filter (Drop Cold)

- Add a Filter
- Condition: `rating` does not equal `COLD`

### Module 15: Google Sheets - Write Already Seen

- Add a Google Sheets > Add a Row module
- Select your workbook and "Already Seen" tab
- Map: post_url, date_first_seen (use `now` function), author_linkedin_url, author_name

### Module 16: Google Sheets - Write Engagement Queue

- Add a Google Sheets > Add a Row module
- Select your workbook and "Engagement Queue" tab
- Map all fields: date_found, tier, relevance_score, post_url, author_name, author_headline, author_linkedin_url, company, post_snippet, keyword_matched, icp_list_match, llm_rating, llm_reason

### Module 17: Notification (Optional)

Add your preferred notification module:

**Slack**: Slack > Send a Message -- post a summary to a channel
**Email**: Gmail > Send an Email -- send yourself a morning summary
**SMS**: Twilio > Send an SMS -- text yourself that the queue is ready

---

## Step 5: Test

1. Turn off the schedule temporarily
2. Run the scenario manually
3. Check your Engagement Queue sheet -- are posts appearing with all fields populated?
4. Check the LLM ratings -- do HOT and WARM assignments make sense?
5. Check Already Seen -- are post URLs being recorded?

If the Apify module times out, increase the timeout setting. If Google Sheets throws rate limit errors, add a "Sleep" module (1-2 seconds) before each Google Sheets module.

---

## Step 6: Go Live

1. Turn the schedule back on
2. Set it to run daily at your preferred time
3. Check the Engagement Queue each morning
4. Work through the posts: open each URL, leave a thoughtful comment, and update the engagement_status column

---

## Tuning After Your First Week

After 5-7 days of data, review your Engagement Queue and ask:

**Are you getting enough posts?** If fewer than 5 per day, add more keywords or increase `limitPerSource` in the Apify body.

**Are you getting too many irrelevant posts?** Add more negative keywords to your spam filters. Tighten the title filters.

**Is the AI rating correctly?** If WARM posts should be COLD (or vice versa), adjust the system prompt in the LLM module to better describe your ideal buyer.

**Are any ICP contacts showing up?** If not after two weeks, your ICP contacts may not be posting about your keywords. This is normal. The value compounds over time.

---

## Cost Summary

| Service | Monthly Cost |
|---------|-------------|
| Apify (LinkedIn scraper) | $3-5 |
| OpenRouter (Gemini 2.5 Flash) | < $1 |
| Make.com (paid plan) | $9 |
| Twilio SMS (optional) | < $1 |
| **Total** | **$13-16/month** |

---

## Differences from the n8n Version

If you've seen the n8n version of this pipeline on GitHub, here are the key differences in the Make.com implementation:

| Feature | n8n | Make.com |
|---------|-----|---------|
| Hosting | Self-hosted (free) | Cloud-hosted ($9/month) |
| LLM calls | Batch (all posts in one call) | Per-post (one call each) |
| Scoring logic | JavaScript Code node | Make.com formulas and filters |
| ICP matching | Reads entire sheet, matches in code | Per-row search query |
| Complexity | More flexible, steeper learning curve | More visual, easier for beginners |

Both approaches produce the same output: a prioritized Google Sheet of LinkedIn posts to engage with every morning.

---

## Resources

- n8n version (open source): [GitHub repository link]
- Apify LinkedIn Post Scraper: https://apify.com/supreme_coder/linkedin-post
- OpenRouter: https://openrouter.ai
- Make.com: https://make.com

---

*Built by CTRS Market Intelligence (https://ctrs.co) with Claude (Anthropic).*
