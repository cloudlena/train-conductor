'use strict';

const Botkit = require('botkit');
const CronJob = require('cron').CronJob;
const currentWeekNumber = require('current-week-number');

const slackApiToken = process.env.SLACK_API_TOKEN;
const slackWebhookURL = process.env.SLACK_WEBHOOK_URL;
const scheduleWeekDay = process.env.SCHEDULE_WEEK_DAY;
const scheduleTime = process.env.SCHEDULE_TIME;
const scheduleOddWeeks = process.env.SCHEDULE_ODD_WEEKS;

const messageToBot = [
  'direct_message',
  'direct_mention',
  'mention'
];

const controller = Botkit.slackbot({ debug: false });

// connect the bot to a stream of messages
const sendBot = controller.spawn({
  token: slackApiToken,
  incoming_webhook: { url: slackWebhookURL }
}).startRTM();

const oneDayBeforeJob = new CronJob(
  `* ${scheduleTime} * * ${weekDay(scheduleWeekDay) - 1}`,
  sayOneDayBefore
);

oneDayBeforeJob.start();

const leavingJob = new CronJob(
  `* ${scheduleTime} * * ${weekDay(scheduleWeekDay)}`,
  sayLeaving
);

leavingJob.start();

controller.hears(['hi', 'hello'], messageToBot, sayHi);
controller.hears('next', messageToBot, sayNextTrain);
controller.hears('schedule', messageToBot, saySchedule);

/**
 * Returns whether the week is odd/even as desired
 * @returns {boolean} Whether the week number is odd/even to release
 */
function correctOddness() {
  const oddWeek = currentWeekNumber() % 2 === 1;

  return oddWeek === scheduleOddWeeks;
}

/**
 * Returns the CRON weekday
 * @param {string} day The weekday
 * @returns {number} The CRON weekday number
 */
function weekDay(day) {
  switch (day) {
  case 'Sunday':
    return 0;
  case 'Monday':
    return 1;
  case 'Tuesday':
    return 2;
  case 'Wednesday':
    return 3;
  case 'Thursday':
    return 4;
  case 'Friday':
    return 5;
  case 'Saturday':
    return 6;
  default:
    return 0;
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
    'Hi there.'
  );
}

/**
 * Replies when the train is leaving
 * @param {object} bot The slack bot
 * @param {string} message The message to say
 * @returns {void}
 */
function sayNextTrain(bot, message) {
  bot.reply(
    message,
    `The next release train leaves on ${scheduleWeekDay} at ${scheduleTime}:00.`
  );
}

/**
 * Replies with train schedule
 * @param {object} bot The slack bot
 * @param {string} message The message to say
 * @returns {void}
 */
function saySchedule(bot, message) {
  bot.reply(
    message,
    `The release train leaves every ${scheduleWeekDay} at ${scheduleTime}:00.`
  );
}

/**
 * Says that the train will be leaving in one day
 * @returns {void}
 */
function sayOneDayBefore() {
  if (correctOddness()) {
    sendBot.sendWebhook({
      text: 'The release train leaves tomorrow!',
      channel: '#release'
    });
  }
}

/**
 * Says that the train is leaving
 * @returns {void}
 */
function sayLeaving() {
  if (correctOddness()) {
    sendBot.sendWebhook({
      text: 'Choo! Choo! The release train is leaving!',
      channel: '#release'
    });
  }
}
