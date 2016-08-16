'use strict';

const Botkit = require('botkit');
const moment = require('moment');
const winston = require('winston');

require('moment-recur');

const slackApiToken = process.env.SLACK_API_TOKEN;
const slackWebhookURL = process.env.SLACK_WEBHOOK_URL;
const startDate = moment(process.env.START_DATE, 'DD/MM/YYYY');
const scheduleTime = moment(process.env.SCHEDULE_TIME, 'HH:mm');
const intervalDays = process.env.INTERVAL_DAYS;

const timeFormat = 'dddd, MMM Do [at] hh:mm';
const messageToBot = [
  'direct_message',
  'direct_mention',
  'mention'
];

// check if start date is valid
if (!startDate.isValid()) {
  throw Error('Invalid start date. Please use DD/MM/YYYY');
}
// check if schedule time is valid
if (!scheduleTime.isValid()) {
  throw Error('Invalid schedule time. Please use HH:mm');
}

// set up recurrence
const trainRecurrence = startDate
  .subtract(intervalDays, 'days')
  .recur()
  .every(intervalDays, 'days');

dropPastOccurrences(trainRecurrence);

winston.info(`Recurrence set. Next train scheduled for ${trainRecurrence.next(1)[0].format('DD/MM/YYYY')} at ${scheduleTime.format('HH:mm')}`);

// set up slack bot controller
const controller = Botkit.slackbot({ debug: false });

// connect the bot to a stream of messages
const announcer = controller.spawn({
  token: slackApiToken,
  incoming_webhook: { url: slackWebhookURL },
  retry: true
}).startRTM();

controller.hears(['hi', 'hello', 'howdy'], messageToBot, sayHi);
controller.hears(['when', 'next', 'train'], messageToBot, sayNextTrain);
controller.hears(['schedule'], messageToBot, saySchedule);
controller.hears(['.*'], messageToBot, sayDefault);

setInterval(() => checkForEvents(trainRecurrence), 60 * 1000);

/**
 * Updates a recurrence so that it only contains occurrences in the future
 * @param {object} recurrence The recurrence to work on
 * @returns {void}
 */
function dropPastOccurrences(recurrence) {
  let found = false;

  while (!found) {
    const now = moment();
    const nextDate = recurrence.next(1)[0];

    nextDate.hours(scheduleTime.hours());
    nextDate.minutes(scheduleTime.minutes());

    if (nextDate.isBefore(now)) {
      recurrence.fromDate(nextDate);
    } else {
      found = true;
    }
  }
}

/**
 * Checks if a recurring event occurs in that minute
 * @param {object} recurrence The recurrence to check
 * @returns {void}
 */
function checkForEvents(recurrence) {
  const now = moment();

  if (recurrence.matches(now) && scheduleTime.minutes() === now.minutes()) {
    winston.info('Train about to leave.');
    sayLeaving();
    recurrence.fromDate(recurrence.next(1)[0]);
  }

  if (recurrence.matches(now.subtract(1, 'day')) && scheduleTime.minutes() === now.minutes()) {
    winston.info('Train leaving in one day.');
    sayOneDayBefore();
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

  winston.info(`${message.user} says hi`);
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
    `The next release train leaves on ${trainRecurrence.next(1)[0].format(timeFormat)}.`
  );

  winston.info(`${message.user} asks for next train`);
}

/**
 * Replies with the train schedule
 * @param {object} bot The slack bot
 * @param {string} message The message to say
 * @returns {void}
 */
function saySchedule(bot, message) {
  const dates = trainRecurrence.next(5);
  let text = 'The release trains leaves on the following dates: \n';

  for (let i = 0; i < dates.length; i++) {
    text += `${dates[i].format(timeFormat)} \n`;
  }

  bot.reply(
    message,
    text
  );

  winston.log('info', `${message.user} asks for schedule`);
}

/**
 * Says that the train will be leaving in one day
 * @returns {void}
 */
function sayOneDayBefore() {
  announcer.sendWebhook({
    text: `The release train leaves tomorrow at ${trainRecurrence.next(1).format('hh:mm')}!`,
    channel: '#release'
  });

  winston.log('info', 'Announced: Train leaving in one day');
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

  winston.log('info', 'Announced: Train leaving now');
}

/**
 * Default message if conductor doesn't understand the question
 * @param {object} bot The slack bot
 * @param {string} message The message to say
 * @returns {void}
 */
function sayDefault(bot, message) {
  bot.reply(
    message,
    'Does not compute... I only know about trains ;-)'
  );
}
