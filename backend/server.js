const express = require('express');
const bodyParser = require('body-parser');
const tasksRouter = require('./routes/tasks');
const authRouter = require('./routes/auth');
const calendarRouter = require('./routes/calendar');
const callsRouter = require('./routes/calls');

const app = express();
app.use(bodyParser.json());

app.use('/v1/auth', authRouter);
app.use('/v1/tasks', tasksRouter);
app.use('/v1/calendar', calendarRouter);
app.use('/v1/calls', callsRouter);

// error handling...
app.listen(process.env.PORT || 4000, ()=> console.log('API started'));
