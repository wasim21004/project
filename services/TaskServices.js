import AsyncStorage from "@react-native-async-storage/async-storage";
import { v4 as uuidv4 } from "uuid";

const TASKS_KEY = "tasks";
const BACKEND_URL = "http://localhost:5000/tasks"; // replace with your API

const TaskService = {
  getTasks: async () => {
    try {
      const data = await AsyncStorage.getItem(TASKS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (err) {
      console.error("Error loading tasks:", err);
      return [];
    }
  },

  addTask: async (task) => {
    try {
      const tasks = await TaskService.getTasks();
      const newTask = { id: uuidv4(), completed: false, ...task };
      const updated = [...tasks, newTask];

      // Save locally
      await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(updated));

      // Sync with backend
      try {
        await fetch(BACKEND_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newTask),
        });
      } catch (err) {
        console.warn("Backend sync failed for addTask", err);
      }

      return newTask;
    } catch (err) {
      console.error("Error adding task:", err);
      throw err;
    }
  },

  updateTask: async (id, updates) => {
    try {
      const tasks = await TaskService.getTasks();
      const updatedTasks = tasks.map((t) => (t.id === id ? { ...t, ...updates } : t));

      // Save locally
      await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(updatedTasks));

      // Sync with backend
      try {
        await fetch(`${BACKEND_URL}/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        });
      } catch (err) {
        console.warn("Backend sync failed for updateTask", err);
      }

      return updatedTasks;
    } catch (err) {
      console.error("Error updating task:", err);
      throw err;
    }
  },

  deleteTask: async (id) => {
    try {
      const tasks = await TaskService.getTasks();
      const filtered = tasks.filter((t) => t.id !== id);

      // Save locally
      await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(filtered));

      // Sync with backend
      try {
        await fetch(`${BACKEND_URL}/${id}`, {
          method: "DELETE",
        });
      } catch (err) {
        console.warn("Backend sync failed for deleteTask", err);
      }

      return filtered;
    } catch (err) {
      console.error("Error deleting task:", err);
      throw err;
    }
  },
};

export default TaskService;
