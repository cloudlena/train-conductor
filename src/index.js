'use strict';

const Botkit = require('botkit');
const moment = require('moment');

require('moment-recur');

const slackApiToken = process.env.SLACK_API_TOKEN;
const slackWebhookURL = process.env.SLACK_WEBHOOK_URL;
const startDate = moment(process.env.START_DATE, 'DD/MM/YYYY');
const intervalDays = process.env.INTERVAL_DAYS;
const scheduleTime = process.env.SCHEDULE_TIME;

const timeFormat = 'dddd, MMM Do [at] hh:mm';
const messageToBot = [
  'direct_message',
  'direct_mention',
  'mention'
];

// set up recurrence
const recurrence = startDate.recur().every(intervalDays, 'days');

console.log(recurrence.next(1)[0].format(timeFormat));

// set up slack bot controller
const controller = Botkit.slackbot({ debug: false });

// connect the bot to a stream of messages
const announcer = controller.spawn({
  token: slackApiToken,
  incoming_webhook: { url: slackWebhookURL }
}).startRTM();

controller.hears(['hi', 'hello'], messageToBot, sayHi);
controller.hears(['when', 'next', 'train'], messageToBot, sayNextTrain);
controller.hears(['schedule', 'trains'], messageToBot, saySchedule);

setInterval(checkForEvents, 1000);

/**
 * Checks if a reocurring event occurs in that second
 * @returns {void}
 */
function checkForEvents() {
  const now = moment();

  if (
    recurrence.matches(now.subtract(1, 'day')) &&
    now.hours() === scheduleTime &&
    now.minutes() === 0 &&
    now.seconds() === 0
  ) {
    sayOneDayBefore();
  }

  if (
    recurrence.matches(now) &&
    now.hours() === scheduleTime &&
    now.minutes() === 0 &&
    now.seconds() === 0
  ) {
    sayLeaving();
  }
}

/**
 * Says hello
 * @param {object} bot The slack bot
 * @param {string} message The message to say
 * @returns {void}
 */
function sayHi(bot, message) {
  bot.reply(
    message,
    'Hi there. How can I help you?'
  );
}

/**
 * Replies saying when the train is leaving
 * @param {object} bot The slack bot
 * @param {string} message The message to say
 * @returns {void}
 */
function sayNextTrain(bot, message) {
  bot.reply(
    message,
    `The next release train leaves on ${recurrence.next(1)[0].format(timeFormat)}.`
  );
}

/**
 * Replies with the train schedule
 * @param {object} bot The slack bot
 * @param {string} message The message to say
 * @returns {void}
 */
function saySchedule(bot, message) {
  const dates = recurrence.next(5);
  let text = 'The release trains leaves on the following dates: \n';

  for (let i = 0; i < dates.length; i++) {
    text += `${dates[i].format(timeFormat)} \n`;
  }

  bot.reply(
    message,
    text
  );
}

/**
 * Says that the train will be leaving in one day
 * @returns {void}
 */
function sayOneDayBefore() {
  announcer.sendWebhook({
    text: `The release train leaves tomorrow at ${recurrence.next(1).format('hh:mm')}!`,
    channel: '#release'
  });
}

/**
 * Says that the train is leaving
 * @returns {void}
 */
function sayLeaving() {
  announcer.sendWebhook({
    text: 'Choo! Choo! The release train is leaving!',
    channel: '#release'
  });
}
