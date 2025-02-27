// src/utils/pollingService.js
export class PollingService {
    constructor() {
      this.pollingTasks = new Map();
    }
  
    addTask(key, task, interval) {
      if (this.pollingTasks.has(key)) {
        this.removeTask(key);
      }
  
      const timerId = setInterval(task, interval);
      this.pollingTasks.set(key, timerId);
    }
  
    removeTask(key) {
      const timerId = this.pollingTasks.get(key);
      if (timerId) {
        clearInterval(timerId);
        this.pollingTasks.delete(key);
      }
    }
  }