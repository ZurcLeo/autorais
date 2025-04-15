// src/utils/pollingService.js
import { coreLogger } from '../core/logging';

/**
 * Serviço para gerenciar tarefas de polling
 */
class PollingService {
  constructor() {
    this.pollingTasks = new Map();
    this.taskIdCounter = 0;
    this.isInitialized = false;
    
    coreLogger.logEvent(
      'polling-service',
      'INITIALIZATION',
      'Serviço de polling inicializado'
    );
    
    this.isInitialized = true;
  }

  /**
   * Adiciona uma tarefa de polling
   * @param {Function} task - Função a ser executada periodicamente
   * @param {number} interval - Intervalo em milissegundos
   * @param {string} [key] - Chave opcional para identificar a tarefa
   * @returns {string} ID da tarefa
   */
  addTask(task, interval, key = null) {
    if (!this.isInitialized) {
      throw new Error('PollingService não inicializado');
    }
    
    if (typeof task !== 'function') {
      throw new Error('A tarefa deve ser uma função');
    }
    
    if (!interval || isNaN(parseInt(interval))) {
      throw new Error('Intervalo deve ser um número válido');
    }
    
    const taskId = key || `task-${++this.taskIdCounter}`;
    
    // Se já existir uma tarefa com esta chave, remova-a primeiro
    if (this.pollingTasks.has(taskId)) {
      this.removeTask(taskId);
    }

    const timerId = setInterval(async () => {
      try {
        await task();
      } catch (error) {
        coreLogger.logEvent(
          'polling-service',
          'ERROR',
          `Erro na tarefa de polling '${taskId}'`,
          { error: error.message }
        );
      }
    }, interval);
    
    this.pollingTasks.set(taskId, timerId);
    
    coreLogger.logEvent(
      'polling-service',
      'TASK_ADDED',
      `Tarefa de polling adicionada: ${taskId}`,
      { interval }
    );
    
    return taskId;
  }

  /**
   * Remove uma tarefa de polling
   * @param {string} taskId - ID da tarefa a ser removida
   * @returns {boolean} true se a tarefa foi removida, false caso contrário
   */
  removeTask(taskId) {
    if (!this.isInitialized) {
      throw new Error('PollingService não inicializado');
    }
    
    const timerId = this.pollingTasks.get(taskId);
    
    if (timerId) {
      clearInterval(timerId);
      this.pollingTasks.delete(taskId);
      
      coreLogger.logEvent(
        'polling-service',
        'TASK_REMOVED',
        `Tarefa de polling removida: ${taskId}`
      );
      
      return true;
    }
    
    return false;
  }

  /**
   * Remove todas as tarefas de polling
   */
  clearAllTasks() {
    if (!this.isInitialized) {
      throw new Error('PollingService não inicializado');
    }
    
    const taskCount = this.pollingTasks.size;
    
    for (const [taskId, timerId] of this.pollingTasks.entries()) {
      clearInterval(timerId);
      coreLogger.logEvent(
        'polling-service',
        'TASK_REMOVED',
        `Tarefa de polling removida: ${taskId}`
      );
    }
    
    this.pollingTasks.clear();
    
    coreLogger.logEvent(
      'polling-service',
      'ALL_TASKS_CLEARED',
      `Todas as tarefas de polling foram removidas`,
      { count: taskCount }
    );
  }

  /**
   * Retorna o número de tarefas ativas
   * @returns {number} Número de tarefas
   */
  getTaskCount() {
    return this.pollingTasks.size;
  }

  /**
   * Verifica se uma tarefa existe
   * @param {string} taskId - ID da tarefa
   * @returns {boolean} true se a tarefa existe
   */
  hasTask(taskId) {
    return this.pollingTasks.has(taskId);
  }
}

// Exportar a instância como singleton
export const pollingService = new PollingService();