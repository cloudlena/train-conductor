import {
  HearsCallback,
  SlackBot,
  SlackMessage,
  SlackSpawnConfiguration,
} from "botkit";
import { Moment } from "moment";
import { Recur } from "moment-recur-ts";

type SlackHearsCallback = HearsCallback<
  SlackSpawnConfiguration,
  SlackMessage,
  SlackBot
>;

const numTrainsSchedule = 5;
const dateFormat = "dddd, MMM Do";

// Says hello
export const sayHi: SlackHearsCallback = (bot, message) => {
  bot.reply(message, "Hi there. How can I help you?");
  console.log(`${message.user} says hi`);
};

// Replies saying when the train is leaving
export const sayNextTrain = (recurrence: Recur, scheduleTime: Moment) => (
  bot: SlackBot,
  message: SlackMessage,
) => {
  bot.reply(
    message,
    `The next release train leaves on ${recurrence
      .next(1)[0]
      .format(dateFormat)} at ${scheduleTime.format("HH:mm")}.`,
  );
  console.log(`${message.user} asks for next train`);
};

// Replies with the train schedule
export const saySchedule = (recurrence: Recur, scheduleTime: Moment) => (
  bot: SlackBot,
  message: SlackMessage,
) => {
  const dates = recurrence.next(numTrainsSchedule);
  let text = "The release trains leaves on the following dates: \n";

  for (const d of dates) {
    text += `${d.format(dateFormat)} at ${scheduleTime.format("HH:mm")} \n`;
  }

  bot.reply(message, text);

  console.log(`${message.user} asks for schedule`);
};

// Default message if conductor doesn't understand the question
export const sayDefault: SlackHearsCallback = (bot, message) => {
  bot.reply(message, "Does not compute... I only know about trains :blush:");
};

// Says that the train will be leaving in one day
export const sayOneDayBefore = (
  bot: SlackBot,
  scheduleTime: Moment,
  slackChannel: string,
) => {
  bot.sendWebhook(
    {
      channel: slackChannel,
      text: `The release train leaves tomorrow at ${scheduleTime.format(
        "HH:mm",
      )}!`,
    },
    () => console.log("Announced: Train leaving in one day"),
  );
};

// Says that the train is leaving;
export const sayLeaving = (bot: SlackBot, slackChannel: string) => {
  bot.sendWebhook(
    {
      channel: slackChannel,
      text: "Choo! Choo! The release train is leaving!",
    },
    () => console.log("Announced: Train leaving now"),
  );
};
