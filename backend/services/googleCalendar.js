import { google } from 'googleapis';
import fs from 'fs';

// Load credentials from service account JSON
const auth = new google.auth.GoogleAuth({
  keyFile: 'service-account.json', // path to your JSON
  scopes: ['https://www.googleapis.com/auth/calendar.readonly'],
});

const calendar = google.calendar({ version: 'v3', auth });

async function getTodaysEvents() {
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

// Example usage
getTodaysEvents().then(events => {
  console.log('Today’s Events:', events.map(e => e.summary));
});
