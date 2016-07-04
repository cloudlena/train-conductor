# Train Conductor

A Slack bot which announces the release train schedule

## Configutation

Train Conductor is configured using environment variables:

* `SLACK_API_TOKEN` - Your Slack API token
* `SLACK_WEBHOOK_URL`- The webhook to use (must be configured to use the `#release` channel)
* `SCHEDULE_WEEK_DAY` - E.g. Tuesday
* `SCHEDULE_TIME` - E.g. 12 (24h format)
* `SCHEDULE_ODDWEEKS` - Whether to release on odd week numbers or not
