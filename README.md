# Train Conductor

[![Build Status](https://travis-ci.org/mastertinner/train-conductor.svg?branch=master)](https://travis-ci.org/mastertinner/train-conductor)

A Slack bot which announces the schedule of a [software release train](https://en.wikipedia.org/wiki/Software_release_train). Can be deployed to Cloud Foundry or any other server/platform.

## Features

* Announces one day before the release train leaves that people should get their releases ready
* Announces on time that the release train is leaving
* Can be asked for the next scheduled departure of the release train
* Can be asked for the current schedule of release trains

## Configutation

Train Conductor is configured using environment variables:

* `SLACK_API_TOKEN` - Your Slack API token
* `SLACK_WEBHOOK_URL`- The webhook to use (must be configured to use the correct channel)
* `START_DATE` - When the release train leaves for the first time (e.g. `"16/03/2016"`)
* `SCHEDULE_TIME` - The time of day on which the train leaves (e.g. `"14:00"`)
* `INTERVAL_DAYS` - How many days between departures
* `SLACK_CHANNEL`- Optional. The slack channel to use (defaults to `"#release"`)
