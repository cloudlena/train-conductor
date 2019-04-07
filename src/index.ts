import { slackbot } from "botkit";
import * as moment from "moment";
import "moment-recur-ts";
import "moment-timezone";
import { sayDefault, sayHi, sayNextTrain, saySchedule } from "./commands";
import { checkForEvents, dropPastOccurrences } from "./recurrence";

const slackApiToken = process.env.SLACK_API_TOKEN;
if (!slackApiToken) {
  throw Error("Please provide SLACK_API_TOKEN");
}
const slackWebhookURL = process.env.SLACK_WEBHOOK_URL;
if (!slackWebhookURL) {
  throw Error("Please provide SLACK_WEBHOOK_URL");
}
const startDate = moment(process.env.START_DATE);
if (!startDate.isValid()) {
  throw Error("Invalid start date. Please provide START_DATE as YYYY-MM-DD");
}
const scheduleTime = moment(process.env.SCHEDULE_TIME, "HH:mm");
if (!scheduleTime.isValid()) {
  throw Error("Invalid schedule time. Please provide SCHEDULE_TIME as HH:mm");
}
let slackChannel = process.env.SLACK_CHANNEL || "";
if (slackChannel === "") {
  slackChannel = "#release";
}
let intervalDays = parseInt(process.env.INTERVAL_DAYS || "", 10);
if (!intervalDays) {
  intervalDays = 7;
}

// Set up recurrence
let recurrence = startDate
  .subtract(intervalDays, "days")
  .recur()
  .every(intervalDays, "days");
recurrence = dropPastOccurrences(recurrence, scheduleTime, moment());
console.log(
  `Recurrence set. Next train scheduled for ${recurrence
    .next(1)[0]
    .format("YYYY-MM-DD")} at ${scheduleTime.format("HH:mm")}`,
);

// Set up Slack bot
const controller = slackbot({
  incoming_webhook: { url: slackWebhookURL }, // eslint-disable-line @typescript-eslint/camelcase
});
const bot = controller.spawn({ token: slackApiToken }).startRTM();

const messageToBot = ["direct_message", "direct_mention", "mention"];
controller.hears(["hi", "hello", "howdy"], messageToBot, sayHi);
controller.hears(
  ["when", "next", "train"],
  messageToBot,
  sayNextTrain(recurrence, scheduleTime),
);
controller.hears(
  ["schedule"],
  messageToBot,
  saySchedule(recurrence, scheduleTime),
);
controller.hears([".*"], messageToBot, sayDefault);

setInterval(
  (): void => checkForEvents(recurrence, scheduleTime, bot, slackChannel),
  60 * 1000,
);
