const fs = require('fs');
const path = require('path');
const tasksFile = path.join(__dirname, '../data/tasks.json');

function readTasks() {
  if (!fs.existsSync(tasksFile)) return [];
  return JSON.parse(fs.readFileSync(tasksFile));
}

function saveTasks(tasks) {
  fs.writeFileSync(tasksFile, JSON.stringify(tasks, null, 2));
}

function addTask(task) {
  const tasks = readTasks();
  task.id = Date.now().toString();
  tasks.push(task);
  saveTasks(tasks);
  return task;
}

function getAllTasks() {
  return readTasks();
}

function getRemainingTasks() {
  return readTasks().filter(task => !task.completed);
}

function updateTask(id, data) {
  const tasks = readTasks();
  const index = tasks.findIndex(t => t.id === id);
  if (index !== -1) {
    tasks[index] = { ...tasks[index], ...data };
    saveTasks(tasks);
    return tasks[index];
  }
  return null;
}

module.exports = { addTask, getAllTasks, getRemainingTasks, updateTask };
