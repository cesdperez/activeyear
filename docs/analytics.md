# Anonymous usage events

ActiveYear records one data point per event in the Cloudflare Analytics Engine dataset `activeyear_events`. The `EVENTS` binding is configured in `wrangler.toml`. The app writes events through `POST /api/event` (`src/routes/api/event/+server.ts`).

The columns are `blob1` = event, `blob2` = value, `blob3` = Cloudflare's country, `double1` = 1, and `index1` = event. We do not record an IP address, user agent, ID, or our own timestamp. Event names and allowed values are in `src/lib/constants/events.ts`; any other value gets a 400 response. The client does nothing in development and E2E.

Events and values:

- `upload_success`: activity count bucket (`1-10`, `11-50`, `51-200`, `200+`)
- `upload_error`: error type
- `theme_selected`: theme
- `export`: theme
- `more_stats_opened`
- `sports_count`: bucket (`1`, `2`, `3-5`, `6+`)
- `support_clicked`: placement (`export`, `footer`, `faq`, `floating`)

## Weekly summary

This Analytics Engine SQL API query accounts for sampling:

```sql
SELECT
  toStartOfInterval(timestamp, INTERVAL '7' DAY) AS week,
  blob1 AS event,
  blob2 AS value,
  SUM(_sample_interval) AS events
FROM activeyear_events
WHERE timestamp > NOW() - INTERVAL '90' DAY
GROUP BY week, event, value
ORDER BY week DESC, event, events DESC
```

Save the query as `query.sql`, then run:

```sh
curl "https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/analytics_engine/sql" -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" --data-binary @query.sql
```

The token needs Account Analytics Read.
