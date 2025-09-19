import * as Calendar from "expo-calendar";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BACKEND_URL = "http://localhost:5000/calendar-events"; // replace with your backend

const CalendarService = {
  requestPermission: async () => {
    const { status } = await Calendar.requestCalendarPermissionsAsync();
    if (status !== "granted") {
      throw new Error("Calendar permission denied");
    }
    return status;
  },

  addEvent: async (title: string, description: string, dateTime: string) => {
    await CalendarService.requestPermission();

    const defaultCalendar = await Calendar.getDefaultCalendarAsync();

    const eventId = await Calendar.createEventAsync(defaultCalendar.id, {
      title,
      notes: description,
      startDate: new Date(dateTime),
      endDate: new Date(new Date(dateTime).getTime() + 60 * 60 * 1000), // 1 hour
      timeZone: "GMT",
    });

    const eventData = { id: eventId, title, description, dateTime };
    await AsyncStorage.setItem(`event-${eventId}`, JSON.stringify(eventData));

    // Sync with backend
    try {
      await fetch(BACKEND_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventData),
      });
    } catch (err) {
      console.warn("Backend sync failed for addEvent", err);
    }

    return eventId;
  },

  getEvents: async (start: Date, end: Date) => {
    await CalendarService.requestPermission();

    const defaultCalendar = await Calendar.getDefaultCalendarAsync();

    const events = await Calendar.getEventsAsync(
      [defaultCalendar.id],
      new Date(start),
      new Date(end)
    );

    return events;
  },

  deleteEvent: async (eventId: string) => {
    await CalendarService.requestPermission();

    try {
      await Calendar.deleteEventAsync(eventId);
      await AsyncStorage.removeItem(`event-${eventId}`);

      // Delete on backend
      try {
        await fetch(`${BACKEND_URL}/${eventId}`, { method: "DELETE" });
      } catch (err) {
        console.warn("Backend sync failed for deleteEvent", err);
      }
    } catch (err) {
      console.error("Failed to delete calendar event", err);
      throw err;
    }
  },
};

export default CalendarService;
