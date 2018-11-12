import { SlackBot } from "botkit";
import * as moment from "moment";
import { Recur } from "moment-recur-ts";
import { sayLeaving, sayOneDayBefore } from "./commands";

// Updates a recurrence so that it only contains occurrences in the future
export const dropPastOccurrences = (
  recurrence: Recur,
  scheduleTime: moment.Moment,
  now: moment.Moment,
) => {
  const newRecurrence = recurrence;
  let found = false;

  while (!found) {
    const nextDate = newRecurrence.next(1)[0];

    nextDate.hours(scheduleTime.hours());
    nextDate.minutes(scheduleTime.minutes());

    if (nextDate.isBefore(now)) {
      newRecurrence.fromDate(nextDate);
    } else {
      found = true;
    }
  }

  return newRecurrence;
};

// Checks if a recurring event occurs in that minute
export const checkForEvents = (
  recurrence: Recur,
  scheduleTime: moment.Moment,
  bot: SlackBot,
  slackChannel: string,
) => {
  const now = moment.tz("Europe/Zurich");

  console.log(`Checking for events at ${now.format("HH:mm:ss")}`);

  if (
    recurrence.matches(now.add(1, "day")) &&
    scheduleTime.hours() === now.hours() &&
    scheduleTime.minutes() === now.minutes()
  ) {
    console.log("Train leaving in one day.");
    sayOneDayBefore(bot, scheduleTime, slackChannel);
    return;
  }

  if (
    recurrence.matches(now) &&
    scheduleTime.hours() === now.hours() &&
    scheduleTime.minutes() === now.minutes()
  ) {
    console.log("Train about to leave.");
    sayLeaving(bot, slackChannel);
    recurrence.fromDate(recurrence.next(1)[0]);
  }
};
