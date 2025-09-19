import AsyncStorage from "@react-native-async-storage/async-storage";
import { v4 as uuidv4 } from "uuid";

const TASKS_KEY = "tasks";

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
      await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(updated));
      return newTask;
    } catch (err) {
      console.error("Error adding task:", err);
      throw err;
    }
  },

  updateTask: async (id, updates) => {
    try {
      const tasks = await TaskService.getTasks();
      const updated = tasks.map((t) => (t.id === id ? { ...t, ...updates } : t));
      await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(updated));
      return updated;
    } catch (err) {
      console.error("Error updating task:", err);
      throw err;
    }
  },

  deleteTask: async (id) => {
    try {
      const tasks = await TaskService.getTasks();
      const filtered = tasks.filter((t) => t.id !== id);
      await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(filtered));
      return filtered;
    } catch (err) {
      console.error("Error deleting task:", err);
      throw err;
    }
  },
};

export default TaskService;
