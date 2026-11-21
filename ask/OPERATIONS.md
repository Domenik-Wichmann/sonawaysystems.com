# Sonaway public Q&A

The homepage supports published FAQs, six additional answers based on published service descriptions, source links and open-ended questions. The packing-floor phone remains a separate scripted demo.

## Adding Domenik’s answers

Keep interview questions in the operator’s conversation until answered. Add the approved public wording to `ask/approved.json`, with a stable ID, the buyer’s question, alternate phrasings, a short answer and a public source URL on this site. If a new fact has no public source, publish it on the relevant service page first. Never add private delivery notes, customer material or API keys. Suggested discovery topics are pilot deliverables, time required from staff, turnaround, platform-specific support and ongoing costs.

Run `python3 tools/build-answers.py` whenever a source page or approved answer changes. Commit and deploy the updated index with the matching pages. The scheduled PHP sync stores records in MariaDB and embeds only new or changed content. Removing an entry removes it from retrieval on the next release. Previous answer-cache entries are unreachable after the source release changes.

## Private server settings

The PHP application reads `sonaway-qa.php` one level above public_html. The private file returns an array with db, user, password, salt, cohere_key, openrouter_key, model and daily_calls. Use the hosting file manager to edit the two provider values in place. Keep the file outside source control with owner-only permissions. Use a production Cohere key, and a separate capped OpenRouter key. No admin secrets are accepted by the public question endpoint.

Run `php public_html/ask/sync.php` from the domain directory after deployment or key changes. The scheduled job also retries. It creates the schema, stores published records, refreshes missing Cohere vectors and cleans expired counters and cached answers. The sync is CLI-only. With no provider keys, exact answers and links to related material still work. No embedding will be marked ready until the provider returns a vector.

## Request limits

Saved FAQ matches and current cached answers skip providers. The website reserves one counter per paid visitor API call before making the request. Defaults are five new searches per session per minute, twenty per IP per minute, eighty per IP per UTC day, and a site-wide daily call allowance in private configuration. One new generated answer can use two paid calls. The daily allowance counts calls, not dollars. Set provider credit limits separately. Scheduled indexing is independent of visitor limits and embeds changed content only. If providers are unavailable, the question form returns local source suggestions.

Test a saved answer, an unknown question, invalid input and the chip links after deployment. With both keys present, check a paraphrase, a new grounded answer and an unsupported question. Keep budget ranges illustrative unless Domenik replaces them with approved commercial terms.

## FAQ popularity

The bottom-right chat on every public page and the six homepage accordions share one ranking. Suggested clicks, typed aliases, confident semantic matches and cached saved replies increment the approved FAQ ID. An accordion records an opening only. Other completed questions use broad topic counters (for example pricing or timeline). No visitor wording, conversation transcript or identity is written to the popularity table. Ranked suggestions are refreshed on page load or reopening the chat after 30 seconds. Ties retain the editorial order. The conversation remains in the current page while the panel is closed.

In Hostinger’s phpMyAdmin, select the site Q&A database and run:

```sql
SELECT counter, total FROM qa_popularity ORDER BY total DESC, counter;
```

Keys beginning with `faq:` refer to approved record IDs in the published index. Keys beginning with `topic:` show interest in other topics without promoting visitor wording into a public FAQ. Repeats of the same counter from the same browser signature and network within a ten-minute window count once. The short-lived de-duplication records are removed by the existing sync job. Requests carrying Global Privacy Control or Do Not Track do not contribute to the totals.
