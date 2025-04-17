// src/components/Admin/InterestsPanel/MigrationTools.js
import React, { useState } from 'react';
import { serviceLocator } from '../../../core/services/BaseService';
import { toast } from 'react-toastify';

const MigrationTools = ({ onDataUpdated }) => {
  const [migrationInProgress, setMigrationInProgress] = useState(false);
  const interestsService = serviceLocator('interestsService')

  const startUserInterestsMigration = async () => {
    if (!window.confirm('Esta operação vai migrar os interesses de todos os usuários para o novo formato. Continuar?')) {
      return;
    }
    try {
      setMigrationInProgress(true);
      const result = await interestsService.migrateUserInterests();
      toast.success(`Migração concluída! ${result.migrated} usuários migrados, ${result.errors} erros.`);
    } catch (error) {
      console.error('Erro na migração de interesses:', error);
      toast.error('Erro na migração de interesses. Tente novamente.');
    } finally {
      setMigrationInProgress(false);
    }
  };

  const migrateStaticInterests = async () => {
    const staticData = prompt('Cole o objeto de interesses estáticos no formato JSON:', '{}');
    if (!staticData) return;
    try {
      const staticInterests = JSON.parse(staticData);
      setMigrationInProgress(true);
      const result = await interestsService.migrateStaticInterests(staticInterests);
      toast.success(
        `Migração concluída! ${result.categoriesCreated} categorias e ${result.interestsCreated} interesses criados.`
      );
      await onDataUpdated();
    } catch (error) {
      console.error('Erro na migração de interesses estáticos:', error);
      toast.error('Erro na migração. Verifique o formato JSON e tente novamente.');
    } finally {
      setMigrationInProgress(false);
    }
  };

  return (
    <div className="migration-tools">
      <div className="migration-card">
        <h4>Migrar Interesses de Formato Antigo para Novo</h4>
        <p>
          Esta ferramenta converte interesses de usuários do formato antigo para o novo formato.
        </p>
        <button
          onClick={startUserInterestsMigration}
          className="primary-button"
          disabled={migrationInProgress}
        >
          {migrationInProgress ? 'Migrando...' : 'Iniciar Migração de Usuários'}
        </button>
      </div>

      <div className="migration-card">
        <h4>Migrar Interesses Estáticos para Firestore</h4>
        <p>
          Esta ferramenta migra interesses definidos estaticamente para coleções no Firestore.
        </p>
        <button
          onClick={migrateStaticInterests}
          className="primary-button"
          disabled={migrationInProgress}
        >
          {migrationInProgress ? 'Migrando...' : 'Migrar Interesses Estáticos'}
        </button>
      </div>

      <div className="migration-warning">
        <p>
          <strong>Atenção:</strong> As operações de migração são irreversíveis e podem afetar dados
          existentes. Certifique-se de fazer backup antes de prosseguir.
        </p>
      </div>
    </div>
  );
};

export default MigrationTools;