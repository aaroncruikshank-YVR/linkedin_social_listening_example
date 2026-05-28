const fs = require('fs');

const workflow = {
  "name": "LinkedIn Social Listening Pipeline",
  "nodes": [
    {
      "id": "schedule-trigger",
      "name": "Schedule Trigger",
      "parameters": { "rule": { "interval": [{ "triggerAtHour": 6 }] } },
      "position": [0, 0],
      "type": "n8n-nodes-base.scheduleTrigger",
      "typeVersion": 1.3
    },
    {
      "id": "apify-trigger",
      "name": "Apify - Trigger Search",
      "parameters": {
        "method": "POST",
        "url": "https://api.apify.com/v2/acts/supreme_coder~linkedin-post/run-sync-get-dataset-items?token=YOUR_APIFY_TOKEN",
        "sendBody": true,
        "specifyBody": "json",
        "jsonBody": JSON.stringify({
          deepScrape: true,
          limitPerSource: 20,
          rawData: false,
          urls: [
            "https://www.linkedin.com/search/results/content/?datePosted=%22past-24h%22&keywords=market intelligence&geoUrn=%5B%22101174742%22%2C%22103644278%22%2C%22101165590%22%2C%22101452733%22%2C%22101282230%22%2C%22105015875%22%2C%22102890719%22%2C%22104738515%22%2C%22105117694%22%2C%22100565514%22%5D&origin=FACETED_SEARCH",
            "https://www.linkedin.com/search/results/content/?datePosted=%22past-24h%22&keywords=strategic planning&geoUrn=%5B%22101174742%22%2C%22103644278%22%2C%22101165590%22%2C%22101452733%22%2C%22101282230%22%2C%22105015875%22%2C%22102890719%22%2C%22104738515%22%2C%22105117694%22%2C%22100565514%22%5D&origin=FACETED_SEARCH",
            "https://www.linkedin.com/search/results/content/?datePosted=%22past-24h%22&keywords=industry analysis&geoUrn=%5B%22101174742%22%2C%22103644278%22%2C%22101165590%22%2C%22101452733%22%2C%22101282230%22%2C%22105015875%22%2C%22102890719%22%2C%22104738515%22%2C%22105117694%22%2C%22100565514%22%5D&origin=FACETED_SEARCH",
            "https://www.linkedin.com/search/results/content/?datePosted=%22past-24h%22&keywords=competitive landscape&geoUrn=%5B%22101174742%22%2C%22103644278%22%2C%22101165590%22%2C%22101452733%22%2C%22101282230%22%2C%22105015875%22%2C%22102890719%22%2C%22104738515%22%2C%22105117694%22%2C%22100565514%22%5D&origin=FACETED_SEARCH",
            "https://www.linkedin.com/search/results/content/?datePosted=%22past-24h%22&keywords=market sizing&geoUrn=%5B%22101174742%22%2C%22103644278%22%2C%22101165590%22%2C%22101452733%22%2C%22101282230%22%2C%22105015875%22%2C%22102890719%22%2C%22104738515%22%2C%22105117694%22%2C%22100565514%22%5D&origin=FACETED_SEARCH",
            "https://www.linkedin.com/search/results/content/?datePosted=%22past-24h%22&keywords=go to market strategy&geoUrn=%5B%22101174742%22%2C%22103644278%22%2C%22101165590%22%2C%22101452733%22%2C%22101282230%22%2C%22105015875%22%2C%22102890719%22%2C%22104738515%22%2C%22105117694%22%2C%22100565514%22%5D&origin=FACETED_SEARCH",
            "https://www.linkedin.com/search/results/content/?datePosted=%22past-24h%22&keywords=market validation&geoUrn=%5B%22101174742%22%2C%22103644278%22%2C%22101165590%22%2C%22101452733%22%2C%22101282230%22%2C%22105015875%22%2C%22102890719%22%2C%22104738515%22%2C%22105117694%22%2C%22100565514%22%5D&origin=FACETED_SEARCH",
            "https://www.linkedin.com/search/results/content/?datePosted=%22past-24h%22&keywords=market expansion&geoUrn=%5B%22101174742%22%2C%22103644278%22%2C%22101165590%22%2C%22101452733%22%2C%22101282230%22%2C%22105015875%22%2C%22102890719%22%2C%22104738515%22%2C%22105117694%22%2C%22100565514%22%5D&origin=FACETED_SEARCH",
            "https://www.linkedin.com/search/results/content/?datePosted=%22past-24h%22&keywords=environmental scan&geoUrn=%5B%22101174742%22%2C%22103644278%22%2C%22101165590%22%2C%22101452733%22%2C%22101282230%22%2C%22105015875%22%2C%22102890719%22%2C%22104738515%22%2C%22105117694%22%2C%22100565514%22%5D&origin=FACETED_SEARCH",
            "https://www.linkedin.com/search/results/content/?datePosted=%22past-24h%22&keywords=competitive intelligence&geoUrn=%5B%22101174742%22%2C%22103644278%22%2C%22101165590%22%2C%22101452733%22%2C%22101282230%22%2C%22105015875%22%2C%22102890719%22%2C%22104738515%22%2C%22105117694%22%2C%22100565514%22%5D&origin=FACETED_SEARCH",
            "https://www.linkedin.com/search/results/content/?datePosted=%22past-24h%22&keywords=market entry&geoUrn=%5B%22101174742%22%2C%22103644278%22%2C%22101165590%22%2C%22101452733%22%2C%22101282230%22%2C%22105015875%22%2C%22102890719%22%2C%22104738515%22%2C%22105117694%22%2C%22100565514%22%5D&origin=FACETED_SEARCH",
            "https://www.linkedin.com/search/results/content/?datePosted=%22past-24h%22&keywords=market research&geoUrn=%5B%22101174742%22%2C%22103644278%22%2C%22101165590%22%2C%22101452733%22%2C%22101282230%22%2C%22105015875%22%2C%22102890719%22%2C%22104738515%22%2C%22105117694%22%2C%22100565514%22%5D&origin=FACETED_SEARCH",
            "https://www.linkedin.com/search/results/content/?datePosted=%22past-24h%22&keywords=business case&geoUrn=%5B%22101174742%22%2C%22103644278%22%2C%22101165590%22%2C%22101452733%22%2C%22101282230%22%2C%22105015875%22%2C%22102890719%22%2C%22104738515%22%2C%22105117694%22%2C%22100565514%22%5D&origin=FACETED_SEARCH",
            "https://www.linkedin.com/search/results/content/?datePosted=%22past-24h%22&keywords=due diligence&geoUrn=%5B%22101174742%22%2C%22103644278%22%2C%22101165590%22%2C%22101452733%22%2C%22101282230%22%2C%22105015875%22%2C%22102890719%22%2C%22104738515%22%2C%22105117694%22%2C%22100565514%22%5D&origin=FACETED_SEARCH"
          ]
        }, null, 2),
        "options": { "timeout": 300000 }
      },
      "position": [304, -100],
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.4
    },
    {
      "id": "normalize",
      "name": "Normalize Results",
      "parameters": {
        "jsCode": "const results = [];\n\nfor (const item of $input.all()) {\n  const data = item.json;\n\n  if (data.url && data.url.includes('linkedin.com')) {\n    let profileUrl = data.authorProfileUrl || '';\n    if (profileUrl.includes('?')) {\n      profileUrl = profileUrl.split('?')[0];\n    }\n    profileUrl = profileUrl.replace(/\\/$/, '').toLowerCase();\n\n    if (data.authorType === 'Company') continue;\n\n    const likes = parseInt(data.numLikes) || 0;\n    const comments = parseInt(data.numComments) || 0;\n    const shares = parseInt(data.numShares) || 0;\n\n    results.push({\n      post_url: data.url,\n      author_name: data.authorName || 'Unknown',\n      author_headline: data.authorHeadline || data.author?.occupation || '',\n      author_linkedin_url: profileUrl,\n      company: '',\n      post_snippet: (data.text || '').substring(0, 300),\n      source: 'apify',\n      keyword_matched: data.inputUrl ?\n        decodeURIComponent(data.inputUrl).match(/keywords=([^&]*)/)?.[1] || 'apify_search'\n        : 'apify_search',\n      author_type: data.authorType || 'Unknown',\n      numLikes: likes,\n      numComments: comments,\n      numShares: shares,\n      engagement_score: likes + (comments * 3) + (shares * 2)\n    });\n  }\n}\n\nreturn results.map(r => ({ json: r }));"
      },
      "position": [608, -100],
      "type": "n8n-nodes-base.code",
      "typeVersion": 2
    },
    {
      "id": "read-already-seen",
      "name": "Read Already Seen",
      "parameters": {
        "documentId": { "__rl": true, "mode": "list", "value": "YOUR_GOOGLE_SHEET_ID" },
        "sheetName": { "__rl": true, "mode": "name", "value": "Already Seen" },
        "options": {}
      },
      "alwaysOutputData": true,
      "retryOnFail": true,
      "waitBetweenTries": 5000,
      "maxTries": 3,
      "position": [864, -100],
      "type": "n8n-nodes-base.googleSheets",
      "typeVersion": 4.7,
      "credentials": { "googleSheetsOAuth2Api": { "id": "YOUR_CREDENTIAL_ID", "name": "Google Sheets account" } }
    },
    {
      "id": "deduplicate",
      "name": "Deduplicate",
      "parameters": {
        "jsCode": "const newPosts = $('Normalize Results').all().map(i => i.json);\nconst seenPosts = $('Read Already Seen').all().map(i => i.json);\nconst seenUrls = new Set(seenPosts.map(p => p.post_url));\n\nconst unseen = newPosts.filter(p => !seenUrls.has(p.post_url));\n\nreturn unseen.map(r => ({ json: r }));"
      },
      "position": [1120, -100],
      "type": "n8n-nodes-base.code",
      "typeVersion": 2
    },
    {
      "id": "read-icp-list",
      "name": "Read ICP List",
      "parameters": {
        "documentId": { "__rl": true, "mode": "list", "value": "YOUR_GOOGLE_SHEET_ID" },
        "sheetName": { "__rl": true, "mode": "name", "value": "ICP Master List" },
        "options": {}
      },
      "alwaysOutputData": true,
      "retryOnFail": true,
      "waitBetweenTries": 5000,
      "maxTries": 3,
      "position": [304, 200],
      "type": "n8n-nodes-base.googleSheets",
      "typeVersion": 4.7,
      "credentials": { "googleSheetsOAuth2Api": { "id": "YOUR_CREDENTIAL_ID", "name": "Google Sheets account" } }
    },
    {
      "id": "wait-for-both",
      "name": "Wait for Both",
      "parameters": {},
      "position": [1376, 50],
      "type": "n8n-nodes-base.merge",
      "typeVersion": 3.2
    },
    {
      "id": "score-and-classify",
      "name": "Score and Classify",
      "parameters": {
        "jsCode": "const posts = $('Deduplicate').all().map(i => i.json);\nconst icpList = $('Read ICP List').all().map(i => i.json);\n\nconst icpUrls = new Set(\n  icpList.map(c => c.linkedin_profile_url?.toLowerCase().replace(/\\/$/, ''))\n);\n\nconst goodTitles = [\n  'vp', 'svp', 'vice president', 'director', 'senior manager',\n  'head of', 'chief', 'cmo', 'cso', 'strategy', 'strategic planning',\n  'market research', 'market intelligence', 'consumer insights',\n  'competitive intelligence', 'business intelligence', 'corporate development',\n  'marketing', 'business development', 'product development', 'product strategy',\n  'policy', 'growth', 'innovation', 'commercial', 'insights', 'research'\n];\n\nconst badTitles = [\n  'student', 'intern', 'coordinator', 'ux research', 'user research',\n  'recruiter', 'talent', 'hr ', 'human resources', 'software engineer',\n  'developer', 'looking for opportunities', 'seeking', 'aspiring',\n  'freelancer', 'looking for work', 'open to work'\n];\n\nconst negativeKeywords = [\n  'survey tool', 'survey platform', 'survey software', 'focus group recruitment',\n  'nps score', 'a/b test', 'a/b testing', 'ux research', 'user testing',\n  'qualtrics', 'surveymonkey', 'typeform', 'customer satisfaction survey',\n  'influencer marketing', 'content creator',\n  'we are hiring', \"we're hiring\", 'now hiring', 'job opening',\n  'job opportunity', 'open position', 'open role', 'join our team',\n  'apply now', 'apply here', '#hiring', '#opentowork', '#jobopening',\n  'looking to hire', 'we have an opening'\n];\n\nconst reportSpamSignals = [\n  'cagr', 'sample copy', 'forecast period', 'market size was valued',\n  'request a sample', 'limited-time special discount',\n  'market reached a valuation', 'market report',\n  'well-research report', 'get well-research report'\n];\n\nconst tier1Keywords = [\n  'looking for market data', 'environmental scan', 'need industry data', 'market sizing',\n  'competitive intelligence', 'go to market', 'go-to-market', 'entering a new market', 'market expansion',\n  'competitive landscape', 'industry analysis', 'does anyone know',\n  'recommendations for', 'strategic planning process', 'starting our strategic plan',\n  'evidence-based', 'data to support', 'market intelligence', 'marketing intelligence'\n];\n\nconst tier2Keywords = [\n  'strategic planning', 'market entry', 'market research', 'business case', 'due diligence',\n  'pestle', 'pestel', 'sector analysis', 'market scan', 'market landscape', 'competitive analysis',\n  'new market opportunity', 'diversification strategy', 'capital investment',\n  'board presentation', 'voice of the customer', 'product-market fit',\n  'market validation', 'market feasibility'\n];\n\nconst scored = [];\n\nfor (const post of posts) {\n  const headline = (post.author_headline || '').toLowerCase();\n  const snippet = (post.post_snippet || '').toLowerCase();\n  const authorUrl = (post.author_linkedin_url || '').toLowerCase().replace(/\\/$/, '');\n\n  const icpMatch = icpUrls.has(authorUrl);\n\n  const hasBillionOrUsd = snippet.includes('billion') || snippet.includes('usd ');\n  const hasReportSpam = reportSpamSignals.some(s => snippet.includes(s));\n  if (hasBillionOrUsd && hasReportSpam) continue;\n  const reportSpamCount = reportSpamSignals.filter(s => snippet.includes(s)).length;\n  if (reportSpamCount >= 2) continue;\n\n  const totalEngagement = (post.engagement_score || 0);\n  const numLikes = parseInt(post.numLikes) || 0;\n  const numComments = parseInt(post.numComments) || 0;\n  const rawEngagement = numLikes + numComments;\n  if (!icpMatch && rawEngagement === 0 && totalEngagement === 0) continue;\n\n  const negHits = negativeKeywords.filter(k => snippet.includes(k));\n  if (negHits.length > 0) continue;\n\n  const hasBadTitle = badTitles.some(t => headline.includes(t));\n  if (hasBadTitle) continue;\n\n  let score = 0;\n  let tier = 3;\n  let matchedKeywords = [];\n\n  if (icpMatch) score += 5;\n\n  const hasGoodTitle = goodTitles.some(t => headline.includes(t));\n  if (hasGoodTitle) score += 2;\n\n  const t1Hits = tier1Keywords.filter(k => snippet.includes(k));\n  if (t1Hits.length > 0) {\n    score += 3;\n    tier = 1;\n    matchedKeywords.push(...t1Hits);\n  }\n\n  const t2Hits = tier2Keywords.filter(k => snippet.includes(k));\n  if (t2Hits.length > 0 && tier > 2) {\n    score += 2;\n    tier = 2;\n    matchedKeywords.push(...t2Hits);\n  }\n\n  if (icpMatch && tier > 1) tier = 1;\n\n  if (rawEngagement > 50) score += 1;\n  if (rawEngagement > 200) score += 1;\n\n  if (score < 2) continue;\n\n  scored.push({\n    ...post,\n    relevance_score: score,\n    tier: tier,\n    icp_list_match: icpMatch ? 'Yes' : 'No',\n    keyword_matched: matchedKeywords.join(', ') || post.keyword_matched,\n    date_found: new Date().toISOString().split('T')[0]\n  });\n}\n\nscored.sort((a, b) => a.tier - b.tier || b.relevance_score - a.relevance_score);\nconst capped = scored.slice(0, 20);\n\nreturn capped.map(r => ({ json: r }));"
      },
      "position": [1632, 50],
      "type": "n8n-nodes-base.code",
      "typeVersion": 2
    },
    {
      "id": "llm-qualify",
      "name": "LLM Qualify",
      "parameters": {
        "jsCode": "const posts = $input.all().map(i => i.json);\n\nif (posts.length === 0) return [];\n\nconst systemPrompt = `You are a lead qualification assistant for a boutique consulting firm that helps organizations with strategic planning, market sizing, competitive analysis, industry research, and market validation.\n\nEvaluate each LinkedIn post and determine if the author is likely a potential buyer.\n\nRate each post as:\n- HOT: Active buying intent or pain point the firm could solve.\n- WARM: Relevant role, worth engaging for relationship building.\n- COLD: Vendor/competitor, student, generic thought leadership, or syndicated content.\n\nRespond ONLY with a JSON array. No markdown, no backticks, no preamble. Each element must have:\n- \"index\": the post number (1-based)\n- \"rating\": \"HOT\", \"WARM\", or \"COLD\"\n- \"reason\": one sentence explaining your rating`;\n\nconst BATCH_SIZE = 5;\nconst allRatings = [];\n\nfor (let i = 0; i < posts.length; i += BATCH_SIZE) {\n  const batch = posts.slice(i, i + BATCH_SIZE);\n  \n  const postSummaries = batch.map((p, idx) => \n    `Post ${idx + 1}:\\nAuthor: ${p.author_name}\\nHeadline: ${p.author_headline}\\nSnippet: ${p.post_snippet}\\nKeywords matched: ${p.keyword_matched}\\nICP match: ${p.icp_list_match}`\n  ).join('\\n\\n---\\n\\n');\n\n  try {\n    const response = await this.helpers.httpRequest({\n      method: 'POST',\n      url: 'https://openrouter.ai/api/v1/chat/completions',\n      headers: {\n        'Authorization': 'Bearer YOUR_OPENROUTER_API_KEY',\n        'Content-Type': 'application/json'\n      },\n      body: {\n        model: 'google/gemini-2.5-flash',\n        messages: [\n          { role: 'system', content: systemPrompt },\n          { role: 'user', content: `Evaluate these ${batch.length} LinkedIn posts:\\n\\n${postSummaries}` }\n        ],\n        temperature: 0.1,\n        max_tokens: 4000\n      },\n      json: true\n    });\n\n    const content = response.choices[0].message.content.trim();\n    let cleaned = content.replace(/```json|```/g, '').trim();\n\n    if (!cleaned.endsWith(']')) {\n      const lastBrace = cleaned.lastIndexOf('}');\n      if (lastBrace > 0) {\n        cleaned = cleaned.substring(0, lastBrace + 1) + ']';\n      }\n    }\n\n    const ratings = JSON.parse(cleaned);\n    \n    for (const rating of ratings) {\n      const batchIdx = rating.index - 1;\n      const globalIdx = i + batchIdx;\n      if (batchIdx < 0 || batchIdx >= batch.length) continue;\n      \n      allRatings.push({ globalIdx, rating: rating.rating, reason: rating.reason });\n    }\n  } catch (err) {\n    for (let j = 0; j < batch.length; j++) {\n      allRatings.push({ globalIdx: i + j, rating: 'UNSCORED', reason: 'LLM batch failed: ' + err.message });\n    }\n  }\n}\n\nconst qualified = [];\nfor (const r of allRatings) {\n  if (r.rating === 'COLD') continue;\n  qualified.push({ ...posts[r.globalIdx], llm_rating: r.rating, llm_reason: r.reason });\n}\n\nqualified.sort((a, b) => {\n  if (a.llm_rating === 'HOT' && b.llm_rating !== 'HOT') return -1;\n  if (a.llm_rating !== 'HOT' && b.llm_rating === 'HOT') return 1;\n  return b.relevance_score - a.relevance_score;\n});\n\nreturn qualified.map(r => ({ json: r }));"
      },
      "position": [1888, 50],
      "type": "n8n-nodes-base.code",
      "typeVersion": 2
    },
    {
      "id": "write-already-seen",
      "name": "Write Already Seen",
      "parameters": {
        "operation": "append",
        "documentId": { "__rl": true, "mode": "list", "value": "YOUR_GOOGLE_SHEET_ID" },
        "sheetName": { "__rl": true, "mode": "name", "value": "Already Seen" },
        "columns": { "mappingMode": "defineBelow", "value": { "post_url": "={{ $json.post_url }}", "date_first_seen": "={{ $json.date_found }}", "author_linkedin_url": "={{ $json.author_linkedin_url }}", "author_name": "={{ $json.author_name }}" } },
        "options": {}
      },
      "retryOnFail": true, "waitBetweenTries": 5000, "maxTries": 3,
      "position": [2144, -150],
      "type": "n8n-nodes-base.googleSheets",
      "typeVersion": 4.7,
      "credentials": { "googleSheetsOAuth2Api": { "id": "YOUR_CREDENTIAL_ID", "name": "Google Sheets account" } }
    },
    {
      "id": "write-engagement-queue",
      "name": "Write Engagement Queue",
      "parameters": {
        "operation": "append",
        "documentId": { "__rl": true, "mode": "list", "value": "YOUR_GOOGLE_SHEET_ID" },
        "sheetName": { "__rl": true, "mode": "name", "value": "Engagement Queue" },
        "columns": { "mappingMode": "defineBelow", "value": {
          "date_found": "={{ $json.date_found }}", "tier": "={{ $json.tier }}", "relevance_score": "={{ $json.relevance_score }}",
          "post_url": "={{ $json.post_url }}", "author_name": "={{ $json.author_name }}", "author_headline": "={{ $json.author_headline }}",
          "author_linkedin_url": "={{ $json.author_linkedin_url }}", "company": "={{ $json.company }}", "post_snippet": "={{ $json.post_snippet }}",
          "keyword_matched": "={{ $json.keyword_matched }}", "icp_list_match": "={{ $json.icp_list_match }}",
          "llm_rating": "={{ $json.llm_rating }}", "llm_reason": "={{ $json.llm_reason }}"
        } },
        "options": {}
      },
      "retryOnFail": true, "waitBetweenTries": 5000, "maxTries": 3,
      "position": [2144, 250],
      "type": "n8n-nodes-base.googleSheets",
      "typeVersion": 4.7,
      "credentials": { "googleSheetsOAuth2Api": { "id": "YOUR_CREDENTIAL_ID", "name": "Google Sheets account" } }
    },
    {
      "id": "clickup-notification",
      "name": "ClickUp Chat Notification",
      "parameters": {
        "method": "POST",
        "url": "https://api.clickup.com/api/v3/workspaces/YOUR_WORKSPACE_ID/chat/channels/YOUR_CHANNEL_ID/messages",
        "sendHeaders": true,
        "headerParameters": { "parameters": [{ "name": "Authorization", "value": "YOUR_CLICKUP_API_TOKEN" }, { "name": "Content-Type", "value": "application/json" }] },
        "sendBody": true,
        "specifyBody": "json",
        "jsonBody": "={\"content\":\"LinkedIn Social Listening: {{ $('LLM Qualify').all().length }} new posts in your engagement queue today.\"}",
        "options": {}
      },
      "position": [2400, 250],
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.4
    },
    {
      "id": "sms-notification",
      "name": "SMS Notification",
      "parameters": {
        "method": "POST",
        "url": "https://api.twilio.com/2010-04-01/Accounts/YOUR_TWILIO_ACCOUNT_SID/Messages.json",
        "authentication": "predefinedCredentialType",
        "nodeCredentialType": "twilioApi",
        "sendHeaders": true,
        "headerParameters": { "parameters": [{ "name": "Content-Type", "value": "application/x-www-form-urlencoded" }] },
        "sendBody": true,
        "contentType": "form-urlencoded",
        "bodyParameters": { "parameters": [{ "name": "To", "value": "YOUR_PHONE_NUMBER" }, { "name": "From", "value": "YOUR_TWILIO_PHONE_NUMBER" }, { "name": "Body", "value": "LinkedIn Listening: New posts ready in your engagement queue." }] },
        "options": {}
      },
      "position": [2656, 250],
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.4,
      "credentials": { "twilioApi": { "id": "YOUR_CREDENTIAL_ID", "name": "Twilio" } }
    }
  ],
  "connections": {
    "Schedule Trigger": { "main": [[{ "node": "Apify - Trigger Search", "type": "main", "index": 0 }, { "node": "Read ICP List", "type": "main", "index": 0 }]] },
    "Apify - Trigger Search": { "main": [[{ "node": "Normalize Results", "type": "main", "index": 0 }]] },
    "Normalize Results": { "main": [[{ "node": "Read Already Seen", "type": "main", "index": 0 }]] },
    "Read Already Seen": { "main": [[{ "node": "Deduplicate", "type": "main", "index": 0 }]] },
    "Deduplicate": { "main": [[{ "node": "Wait for Both", "type": "main", "index": 0 }]] },
    "Read ICP List": { "main": [[{ "node": "Wait for Both", "type": "main", "index": 1 }]] },
    "Wait for Both": { "main": [[{ "node": "Score and Classify", "type": "main", "index": 0 }]] },
    "Score and Classify": { "main": [[{ "node": "LLM Qualify", "type": "main", "index": 0 }]] },
    "LLM Qualify": { "main": [[{ "node": "Write Already Seen", "type": "main", "index": 0 }, { "node": "Write Engagement Queue", "type": "main", "index": 0 }]] },
    "Write Engagement Queue": { "main": [[{ "node": "ClickUp Chat Notification", "type": "main", "index": 0 }]] },
    "ClickUp Chat Notification": { "main": [[{ "node": "SMS Notification", "type": "main", "index": 0 }]] }
  },
  "settings": { "executionOrder": "v1", "timezone": "America/Vancouver" }
};

fs.writeFileSync('/home/claude/github-update/linkedin-social-listening-workflow.json', JSON.stringify(workflow, null, 2));
console.log('Workflow JSON created');
