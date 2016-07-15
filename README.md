# Train Conductor

A Slack bot which announces the release train schedule

## Configutation

Train Conductor is configured using environment variables:

* `SLACK_API_TOKEN` - Your Slack API token
* `SLACK_WEBHOOK_URL`- The webhook to use (must be configured to use the `#release` channel)
* `START_DATE` - E.g. 16/03/2016
* `SCHEDULE_TIME` - E.g. '14:00'
* `INTERVAL_DAYS` - How many days until the next departure
