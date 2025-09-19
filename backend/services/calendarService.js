const { google } = require('googleapis');

const auth = new google.auth.GoogleAuth({
  keyFile: process.env.GOOGLE_CALENDAR_KEY_FILE,
  scopes: ['https://www.googleapis.com/auth/calendar.events'],
});

async function addEvent(title, description, dateTime) {
  const calendar = google.calendar({ version: 'v3', auth });
  await calendar.events.insert({
    calendarId: 'primary',
    requestBody: {
      summary: title,
      description,
      start: { dateTime },
      end: { dateTime },
    },
  });
}

async function getTodaysEvents() {
  const calendar = google.calendar({ version: 'v3', auth });
  const now = new Date();
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59);
  
  const res = await calendar.events.list({
    calendarId: 'primary',
    timeMin: now.toISOString(),
    timeMax: endOfDay.toISOString(),
    singleEvents: true,
    orderBy: 'startTime',
  });

  return res.data.items || [];
}

module.exports = { addEvent, getTodaysEvents };
