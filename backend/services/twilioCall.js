const Twilio = require('twilio');
const cron = require('node-cron');
const { getRemainingTasks } = require('./taskService');
const { getTodaysEvents } = require('./calendarService');
const { generateScript } = require('./mcpService');

const client = Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

function scheduleMorningCall() {
  // Every day at 9 AM
  cron.schedule('0 9 * * *', async () => {
    console.log('Starting morning call...');
    
    const events = await getTodaysEvents();
    const tasks = getRemainingTasks();

    let script = 'Good morning! Here is your schedule for today:\n';

    if (events.length) {
      events.forEach(e => {
        const start = new Date(e.start.dateTime || e.start.date);
        script += `Event: ${e.summary} at ${start.toLocaleTimeString()}\n`;
      });
    }

    if (tasks.length) {
      tasks.forEach(t => script += `Task: ${t.title}\n`);
    }

    // Optionally generate AI-friendly speech using MCP
    const finalScript = await generateScript(script);

    await client.calls.create({
      twiml: `<Response><Say voice="alice">${finalScript}</Say></Response>`,
      to: process.env.TARGET_PHONE_NUMBER,
      from: process.env.TWILIO_PHONE_NUMBER,
    });

    console.log('Morning call sent');
  });
}

module.exports = { scheduleMorningCall };
