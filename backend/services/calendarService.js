const { google } = require('googleapis');
const db = require('../db');

async function getOAuthClientForUser(userId) {
  const { rows } = await db.query('SELECT access_token, refresh_token FROM users WHERE id=$1', [userId]);
  const tokens = rows[0];
  const oAuth2Client = new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET);
  oAuth2Client.setCredentials({
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token
  });
  return oAuth2Client;
}

exports.createEventForUser = async (userId, task) => {
  const auth = await getOAuthClientForUser(userId);
  const calendar = google.calendar({ version: 'v3', auth });

  const event = {
    summary: task.title,
    description: task.description,
    start: { dateTime: new Date(task.scheduled_at).toISOString() },
    end: { dateTime: new Date(new Date(task.scheduled_at).getTime() + 30*60*1000).toISOString() },
    reminders: { useDefault: false, overrides: [{method:'popup', minutes:10}] }
  };

  const res = await calendar.events.insert({ calendarId: 'primary', resource: event });
  return res.data; // contains id
};
