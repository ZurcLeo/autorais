// src/services/GamificationService/index.js
import { BaseService, serviceLocator, serviceEventHub } from '../../core/services/BaseService';
import { LOG_LEVELS } from '../../core/constants/config';

const MODULE_NAME = 'gamification';

export class GamificationService extends BaseService {
  constructor() {
    super(MODULE_NAME);

    this._metadata = {
      name: MODULE_NAME,
      phase: 'ESSENTIAL',
      criticalPath: false,
      dependencies: ['auth'],
      category: 'engagement',
      description: 'Gerencia gamificação: XP, níveis, tarefas, selos e streaks.',
    };

    this.apiService = serviceLocator.get('apiService');
    this.authService = serviceLocator.get('auth');
  }

  async initialize() {
    if (this.isInitialized) return this;
    this._log(MODULE_NAME, LOG_LEVELS.LIFECYCLE, 'GamificationService initializing...');
    this._isInitialized = true;
    return this;
  }

  // ── Estado do usuário ─────────────────────────────

  /** Carrega estado completo: gamification + selos + tarefas */
  async getMe() {
    return this._executeWithRetry(async () => {
      const res = await this.apiService.get('/api/gamification/me');
      return res.data;
    }, 'getMe');
  }

  /** Carrega todas as tarefas do catálogo com progresso do usuário */
  async getTasks() {
    return this._executeWithRetry(async () => {
      const res = await this.apiService.get('/api/gamification/tasks');
      return res.data;
    }, 'getTasks');
  }

  // ── Tarefas ───────────────────────────────────────

  /** Marca uma tarefa como completada */
  async completeTask(taskSlug) {
    const res = await this.apiService.post('/api/gamification/task/complete', { taskSlug });
    this._emitEvent('TASK_COMPLETED', { taskSlug, ...res.data });
    return res.data;
  }

  /** Incrementa progresso de uma tarefa multi-etapa */
  async incrementProgress(taskSlug, amount = 1) {
    const res = await this.apiService.post('/api/gamification/task/progress', { taskSlug, amount });
    return res.data;
  }

  // ── Streak ────────────────────────────────────────

  /** Atualiza streak diário (chamar no login/acesso diário) */
  async updateStreak() {
    const res = await this.apiService.post('/api/gamification/streak', {});
    this._emitEvent('STREAK_UPDATED', res.data);
    return res.data;
  }

  // ── Selos ─────────────────────────────────────────

  /** Altera o pin de um selo no perfil */
  async toggleSeloPin(userSeloId, isPinned) {
    const res = await this.apiService.post('/api/gamification/selo/pin', { userSeloId, isPinned });
    return res.data;
  }

  // ── Leaderboard & Catálogos ───────────────────────

  async getLeaderboard(limit = 20) {
    const res = await this.apiService.get(`/api/gamification/leaderboard?limit=${limit}`);
    return res.data;
  }

  async getLevels() {
    const res = await this.apiService.get('/api/gamification/catalog/levels');
    return res.data;
  }

  async getAllSelos() {
    const res = await this.apiService.get('/api/gamification/catalog/selos');
    return res.data;
  }

  // ── Eventos ───────────────────────────────────────

  /** Dispara um evento de domínio (profile_completed, caixinha_created, etc.) */
  async triggerEvent(event, metadata = {}) {
    const res = await this.apiService.post('/api/gamification/event', { event, metadata });
    return res.data;
  }
}

export default GamificationService;
