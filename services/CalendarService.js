import * as Calendar from "expo-calendar";
import AsyncStorage from "@react-native-async-storage/async-storage";

const CalendarService = {
  requestPermission: async () => {
    const { status } = await Calendar.requestCalendarPermissionsAsync();
    if (status !== "granted") {
      throw new Error("Calendar permission denied");
    }
    return status;
  },

  addEvent: async (title, description, dateTime) => {
    await CalendarService.requestPermission();

    const defaultCalendar = await Calendar.getDefaultCalendarAsync();

    const eventId = await Calendar.createEventAsync(defaultCalendar.id, {
      title,
      notes: description,
      startDate: new Date(dateTime),
      endDate: new Date(new Date(dateTime).getTime() + 60 * 60 * 1000),
      timeZone: "GMT",
    });

    await AsyncStorage.setItem(`event-${eventId}`, JSON.stringify({ title, description, dateTime }));

    return eventId;
  },

  getEvents: async (start, end) => {
    await CalendarService.requestPermission();

    const defaultCalendar = await Calendar.getDefaultCalendarAsync();

    const events = await Calendar.getEventsAsync(
      [defaultCalendar.id],
      new Date(start),
      new Date(end)
    );

    return events;
  },
};

export default CalendarService;
