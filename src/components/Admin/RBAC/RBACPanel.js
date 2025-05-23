// RBACPanel.jsx - Interface administrativa simplificada para RBAC
import React, { useState, useEffect } from 'react';
import { serviceLocator } from '../../../core/services/BaseService';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Autocomplete,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  CircularProgress,
  Alert,
  Stepper,
  Step,
  StepLabel,
  List,
  ListItem,
  ListItemText,
  Divider,
  Checkbox,
  FormControlLabel,
  Chip,
  Tabs,
  Tab,
  Grid
} from '@mui/material';

// URL base da API
const API_URL = process.env.REACT_APP_BACKEND_URL;

const RBACPanel = () => {
  const apiService = serviceLocator.get('apiService');

  // Estados para dados
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [users, setUsers] = useState([]);
  const [userRoles, setUserRoles] = useState([]);
  
  // Estados para seleção
  const [activeTab, setActiveTab] = useState(0);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  
  // Estados para UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  
  // Estados para formulários
  const [newRole, setNewRole] = useState({ name: '', description: '', isSystemRole: false });
  const [newPermission, setNewPermission] = useState({ resource: '', action: '', description: '' });
  const [newUserRole, setNewUserRole] = useState({
    roleId: '',
    context: { type: 'global', resourceId: '' },
    options: { validationStatus: 'pending' }
  });

  // Carregar dados iniciais
  useEffect(() => {
    fetchRoles();
    fetchPermissions();
    fetchUsers();
  }, []);

  // Carregar roles do usuário quando selecionar um usuário
  useEffect(() => {
    if (selectedUser) {
      fetchUserRoles(selectedUser.id);
    }
  }, [selectedUser]);

  // Funções para buscar dados
  async function fetchRoles() {
    try {
      setLoading(true);
      const response = await apiService.get(`${API_URL}/api/rbac/roles`);
      console.log("Roles response:", response);
      
      // Extrair o array de roles da estrutura aninhada
      let rolesData = [];
      
      if (response && response.data) {
        // Verificar se temos um objeto data.data (formato da API atual)
        if (response.data.data && Array.isArray(response.data.data)) {
          rolesData = response.data.data;
        } 
        // Verificar outros formatos possíveis
        else if (Array.isArray(response.data)) {
          rolesData = response.data;
        } 
        else if (typeof response.data === 'object') {
          // Tentar extrair valores se for um objeto
          rolesData = Object.values(response.data);
        }
      }
      
      console.log("Roles data after processing:", rolesData);
      setRoles(rolesData);
    } catch (err) {
      console.error("Error fetching roles:", err);
      setError(err.message || 'Erro ao carregar roles');
    } finally {
      setLoading(false);
    }
  }

  async function fetchPermissions() {
    try {
      setLoading(true);
      const response = await apiService.get(`${API_URL}/api/rbac/permissions`);
      console.log("Permissions response:", response);
      
      let permissionsData = [];
      
      if (response && response.data) {
        if (response.data.data && Array.isArray(response.data.data)) {
          permissionsData = response.data.data;
        } 
        else if (Array.isArray(response.data)) {
          permissionsData = response.data;
        } 
        else if (typeof response.data === 'object') {
          permissionsData = Object.values(response.data);
        }
      }
      
      setPermissions(permissionsData);
    } catch (err) {
      setError(err.message || 'Erro ao carregar permissões');
    } finally {
      setLoading(false);
    }
  }
  
  async function fetchUserRoles(userId) {
    if (!userId) return;
    try {
      setLoading(true);
      const response = await apiService.get(`${API_URL}/api/rbac/users/${userId}/roles`);
      console.log("User roles response:", response.data.data);
      
      let userRolesData = [];
      
      if (response && response.data) {
        if (response.data.data && Array.isArray(response.data.data)) {
          userRolesData = response.data.data;
        } 
        else if (Array.isArray(response.data)) {
          userRolesData = response.data;
        } 
        else if (typeof response.data === 'object') {
          userRolesData = Object.values(response.data);
        }
      }
      
      console.log("Processed user roles data:", userRolesData);
      
      // Se ainda não temos roles e o usuário tem flag isOwnerOrAdmin,
      // adicionar uma role "admin" virtual para representação visual
      if (userRolesData.length === 0 && selectedUser?.isOwnerOrAdmin) {
        userRolesData = [{
          id: `virtual_admin_${userId}`,
          roleId: 'admin',
          roleName: 'Admin (Legacy)',
          context: { type: 'global', resourceId: null },
          validationStatus: 'validated',
          isLegacyAdmin: true
        }];
      }
      
      setUserRoles(userRolesData);
    } catch (err) {
      console.error("Error fetching user roles:", err);
      setError(err.message || 'Erro ao carregar roles do usuário');
    } finally {
      setLoading(false);
    }
  }

  async function fetchUsers() {
    try {
      setLoading(true);
      const data = await apiService.get(`${API_URL}/api/users`);
      console.log('usuarios resgatados: ', data)
      setUsers(data.data || []);
    } catch (err) {
      setError(err.message || 'Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  }

  // Funções para manipular formulários
  async function handleCreateRole(e) {
    e.preventDefault();
    try {
      setLoading(true);
      const data = await apiService.post(`${API_URL}/api/rbac/roles`, {
        method: 'POST',
        body: JSON.stringify(newRole)
      });
      
      setRoles([...roles, data.data]);
      setNewRole({ name: '', description: '', isSystemRole: false });
      showMessage('Role criada com sucesso');
    } catch (err) {
      setError(err.message || 'Erro ao criar role');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreatePermission(e) {
    e.preventDefault();
    try {
      setLoading(true);
      const permissionData = {
        ...newPermission,
        name: `${newPermission.resource}:${newPermission.action}`
      };
      
      const data = await apiService.post(`${API_URL}/api/rbac/permissions`, {
        method: 'POST',
        body: JSON.stringify(permissionData)
      });
      
      setPermissions([...permissions, data.data]);
      setNewPermission({ resource: '', action: '', description: '' });
      showMessage('Permissão criada com sucesso');
    } catch (err) {
      setError(err.message || 'Erro ao criar permissão');
    } finally {
      setLoading(false);
    }
  }

  async function handleAssignRoleToUser(e) {
    e.preventDefault();
    if (!selectedUser) {
      setError('Selecione um usuário');
      return;
    }

    try {
      setLoading(true);
      const data = await apiService.post(`${API_URL}/api/rbac/users/${selectedUser.id}/roles`, {
        method: 'POST',
        body: JSON.stringify(newUserRole)
      });
      
      setUserRoles([...userRoles, data.data]);
      setNewUserRole({
        roleId: '',
        context: { type: 'global', resourceId: '' },
        options: { validationStatus: 'pending' }
      });
      showMessage('Role atribuída com sucesso');
    } catch (err) {
      setError(err.message || 'Erro ao atribuir role');
    } finally {
      setLoading(false);
    }
  }

  async function handleRemoveRoleFromUser(userRoleId) {
    if (!selectedUser || !userRoleId) return;

    try {
      setLoading(true);
      await apiService.delete(`${API_URL}/api/users/${selectedUser.id}/roles/${userRoleId}`, {
        method: 'DELETE'
      });
      
      setUserRoles(userRoles.filter(ur => ur.id !== userRoleId));
      showMessage('Role removida com sucesso');
    } catch (err) {
      setError(err.message || 'Erro ao remover role');
    } finally {
      setLoading(false);
    }
  }

  async function handleAssignPermissionToRole(roleId, permissionId) {
    if (!roleId || !permissionId) return;

    try {
      setLoading(true);
      await apiService.post(`${API_URL}/api/rbac/roles/${roleId}/permissions/${permissionId}`, {
        method: 'POST',
        body: JSON.stringify({})
      });

      const rolePermissionsData = await apiService.get(`${API_URL}/api/rbac/roles/${roleId}/permissions`);
      
      showMessage('Permissão atribuída com sucesso', rolePermissionsData);
    } catch (err) {
      setError(err.message || 'Erro ao atribuir permissão');
    } finally {
      setLoading(false);
    }
  }

  async function handleRemovePermissionFromRole(roleId, permissionId) {
    if (!roleId || !permissionId) return;

    try {
      setLoading(true);
      await apiService.delete(`${API_URL}/api/rbac/roles/${roleId}/permissions/${permissionId}`, {
        method: 'DELETE'
      });
      
      showMessage('Permissão removida com sucesso');
    } catch (err) {
      setError(err.message || 'Erro ao remover permissão');
    } finally {
      setLoading(false);
    }
  }

  async function handleInitializeSystem() {
    try {
      setLoading(true);
      await apiService.post(`${API_URL}/api/rbac/initialize`, {
        method: 'POST',
        body: JSON.stringify({})
      });
      
      showMessage('Sistema RBAC inicializado com sucesso');
      // Recarregar dados
      fetchRoles();
      fetchPermissions();
    } catch (err) {
      setError(err.message || 'Erro ao inicializar sistema');
    } finally {
      setLoading(false);
    }
  }

  async function handleMigrateAdminUsers() {
    try {
      setLoading(true);
      await apiService.post(`${API_URL}/api/rbac/migrate-admin-users`, {
        method: 'POST',
        body: JSON.stringify({})
      });
      
      showMessage('Migração de usuários admin concluída com sucesso');
    } catch (err) {
      setError(err.message || 'Erro ao migrar usuários admin');
    } finally {
      setLoading(false);
    }
  }

  // Função auxiliar para mostrar mensagens
  function showMessage(text) {
    setMessage(text);
    setTimeout(() => setMessage(null), 3000);
  }

  function isInitialDataRole(roleId) {
    // Lista de IDs de roles do sistema
    const systemRoleIds = ['admin', 'client', 'support', 'seller', 'caixinhaManager', 'caixinhaMember', 'caixinhaModerator'];
    return systemRoleIds.includes(roleId);
  }

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 2.5 }}>
      <Typography variant="h4" sx={{ mb: 2.5 }}>Painel Administrativo RBAC</Typography>
      
      {/* Área de alertas */}
      {loading && <Alert severity="info" sx={{ mb: 2 }}>Carregando...</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
      
      {/* Botões de inicialização */}
      <Box sx={{ mb: 2.5, display: 'flex', gap: 1 }}>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleInitializeSystem}
        >
          Inicializar Sistema RBAC
        </Button>
        <Button 
          variant="outlined" 
          color="secondary" 
          onClick={handleMigrateAdminUsers}
        >
          Migrar Usuários Admin
        </Button>
      </Box>

      {/* Abas de navegação */}
      <Paper sx={{ mb: 3, overflow: 'hidden', borderRadius: 1 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          sx={{ 
            borderBottom: 1, 
            borderColor: 'divider',
            bgcolor: 'background.paper'
          }}
        >
          <Tab label="Roles" />
          <Tab label="Permissões" />
          <Tab label="Usuários" />
        </Tabs>

        {/* Conteúdo de Roles */}
        {activeTab === 0 && (
          <Box sx={{ p: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Roles Disponíveis</Typography>
                <Paper variant="outlined" sx={{ mb: 3, borderRadius: 1 }}>
                  <List disablePadding>
                    {Array.isArray(roles) ? (
                      roles.length > 0 ? (
                        roles.map((role, index) => (
                          <React.Fragment key={role.id || index}>
                            <ListItem 
                              button
                              selected={selectedRole?.id === role.id}
                              onClick={() => setSelectedRole(role)}
                              sx={{ 
                                p: 2,
                                '&.Mui-selected': {
                                  bgcolor: 'action.selected'
                                },
                                '&:hover': {
                                  bgcolor: 'action.hover'
                                }
                              }}
                            >
                              <ListItemText 
                                primary={
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                                      {role.name}
                                    </Typography>
                                    {role.isSystemRole && (
                                      <Chip 
                                        size="small" 
                                        label="Sistema" 
                                        color="info" 
                                        sx={{ ml: 1 }}
                                      />
                                    )}
                                  </Box>
                                }
                                secondary={role.description}
                              />
                            </ListItem>
                            {index < roles.length - 1 && <Divider />}
                          </React.Fragment>
                        ))
                      ) : (
                        <ListItem>
                          <ListItemText primary="Nenhuma role encontrada." />
                        </ListItem>
                      )
                    ) : (
                      <ListItem>
                        <ListItemText primary="Carregando roles..." />
                      </ListItem>
                    )}
                  </List>
                </Paper>

                <Typography variant="h6" gutterBottom>Nova Role</Typography>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 1 }}>
                  <Box component="form" onSubmit={handleCreateRole} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                      label="Nome"
                      value={newRole.name}
                      onChange={e => setNewRole({...newRole, name: e.target.value})}
                      required
                      fullWidth
                    />
                    <TextField
                      label="Descrição"
                      value={newRole.description}
                      onChange={e => setNewRole({...newRole, description: e.target.value})}
                      required
                      fullWidth
                      multiline
                      rows={3}
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={newRole.isSystemRole}
                          onChange={e => setNewRole({...newRole, isSystemRole: e.target.checked})}
                        />
                      }
                      label="Role de Sistema"
                    />
                    <Button type="submit" variant="contained" color="primary">
                      Criar Role
                    </Button>
                  </Box>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                {selectedRole && (
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Permissões da Role: {selectedRole.name}
                    </Typography>
                    <Paper variant="outlined" sx={{ borderRadius: 1 }}>
                      <List disablePadding>
                        {Array.isArray(permissions) ? (
                          permissions.length > 0 ? (
                            permissions.map((permission, index) => (
                              <React.Fragment key={permission.id || index}>
                                <ListItem sx={{ 
                                  p: 2,
                                  flexDirection: 'column', 
                                  alignItems: 'flex-start'
                                }}>
                                  <Box sx={{ 
                                    width: '100%', 
                                    display: 'flex',
                                    justifyContent: 'space-between', 
                                    alignItems: 'flex-start',
                                    mb: 1
                                  }}>
                                    <Box>
                                      <Typography variant="subtitle1" sx={{ fontWeight: 'medium', display: 'flex', alignItems: 'center' }}>
                                        {permission.name}
                                        {permission.isInitialData && (
                                          <Chip 
                                            size="small" 
                                            label="S" 
                                            color="info" 
                                            sx={{ ml: 1 }}
                                            title="Definida no sistema"
                                          />
                                        )}
                                      </Typography>
                                      <Typography variant="body2" color="text.secondary">
                                        Recurso: {permission.resource}, Ação: {permission.action}
                                      </Typography>
                                      <Typography variant="body2" color="text.secondary">
                                        {permission.description}
                                      </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                      <Button 
                                        size="small" 
                                        variant="contained" 
                                        color="primary"
                                        onClick={() => handleAssignPermissionToRole(selectedRole.id, permission.id)}
                                      >
                                        Atribuir
                                      </Button>
                                      <Button 
                                        size="small" 
                                        variant="contained" 
                                        color="error"
                                        onClick={() => handleRemovePermissionFromRole(selectedRole.id, permission.id)}
                                      >
                                        Remover
                                      </Button>
                                    </Box>
                                  </Box>
                                </ListItem>
                                {index < permissions.length - 1 && <Divider />}
                              </React.Fragment>
                            ))
                          ) : (
                            <ListItem>
                              <ListItemText primary="Nenhuma permissão encontrada." />
                            </ListItem>
                          )
                        ) : (
                          <ListItem>
                            <ListItemText primary="Carregando permissões..." />
                          </ListItem>
                        )}
                      </List>
                    </Paper>
                  </Box>
                )}
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Conteúdo de Permissões */}
        {activeTab === 1 && (
          <Box sx={{ p: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>Permissões Disponíveis</Typography>
                <Paper variant="outlined" sx={{ mb: 3, borderRadius: 1 }}>
                  <List disablePadding>
                    {Array.isArray(permissions) ? (
                      permissions.length > 0 ? (
                        permissions.map((permission, index) => (
                          <React.Fragment key={permission.id || index}>
                            <ListItem sx={{ p: 2 }}>
                              <ListItemText 
                                primary={
                                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                                      {permission.name}
                                    </Typography>
                                    {permission.isInitialData && (
                                      <Chip 
                                        size="small" 
                                        label="S" 
                                        color="info" 
                                        sx={{ ml: 1 }}
                                        title="Definida no sistema"
                                      />
                                    )}
                                  </Box>
                                }
                                secondary={
                                  <>
                                    <Typography variant="body2" color="text.secondary">
                                      Recurso: {permission.resource}, Ação: {permission.action}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      {permission.description}
                                    </Typography>
                                  </>
                                }
                              />
                            </ListItem>
                            {index < permissions.length - 1 && <Divider />}
                          </React.Fragment>
                        ))
                      ) : (
                        <ListItem>
                          <ListItemText primary="Nenhuma permissão encontrada." />
                        </ListItem>
                      )
                    ) : (
                      <ListItem>
                        <ListItemText primary="Carregando permissões..." />
                      </ListItem>
                    )}
                  </List>
                </Paper>

                <Typography variant="h6" gutterBottom>Nova Permissão</Typography>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 1 }}>
                  <Box component="form" onSubmit={handleCreatePermission} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                      label="Recurso"
                      value={newPermission.resource}
                      onChange={e => setNewPermission({...newPermission, resource: e.target.value})}
                      required
                      fullWidth
                    />
                    <TextField
                      label="Ação"
                      value={newPermission.action}
                      onChange={e => setNewPermission({...newPermission, action: e.target.value})}
                      required
                      fullWidth
                    />
                    <TextField
                      label="Descrição"
                      value={newPermission.description}
                      onChange={e => setNewPermission({...newPermission, description: e.target.value})}
                      required
                      fullWidth
                      multiline
                      rows={3}
                    />
                    <Button type="submit" variant="contained" color="primary">
                      Criar Permissão
                    </Button>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Conteúdo de Usuários */}
        {activeTab === 2 && (
          <Box sx={{ p: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={5}>
                <Typography variant="h6" gutterBottom>Usuários</Typography>
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    borderRadius: 1, 
                    maxHeight: 500, 
                    overflow: 'auto' 
                  }}
                >
                  <List disablePadding>
                    {Array.isArray(users) ? (
                      users.length > 0 ? (
                        users.map((user, index) => (
                          <React.Fragment key={user.id || index}>
                            <ListItem 
                              button
                              selected={selectedUser?.id === user.id}
                              onClick={() => setSelectedUser(user)}
                              sx={{ 
                                p: 2,
                                '&.Mui-selected': {
                                  bgcolor: 'action.selected'
                                },
                                '&:hover': {
                                  bgcolor: 'action.hover'
                                }
                              }}
                            >
                              <ListItemText 
                                primary={user.nome || user.email}
                                secondary={
                                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                    <Typography variant="body2" color="text.secondary">
                                      {user.email}
                                    </Typography>
                                    {user.isOwnerOrAdmin && (
                                      <Chip 
                                        size="small" 
                                        label="Admin Legacy" 
                                        color="warning" 
                                        sx={{ ml: 1 }}
                                      />
                                    )}
                                  </Box>
                                }
                              />
                            </ListItem>
                            {index < users.length - 1 && <Divider />}
                          </React.Fragment>
                        ))
                      ) : (
                        <ListItem>
                          <ListItemText primary="Nenhum usuário encontrado." />
                        </ListItem>
                      )
                    ) : (
                      <ListItem>
                        <ListItemText primary="Carregando usuários..." />
                      </ListItem>
                    )}
                  </List>
                </Paper>
              </Grid>

              <Grid item xs={12} md={7}>
                {selectedUser && (
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Roles do Usuário: {selectedUser.nome || selectedUser.email}
                    </Typography>
                    <Paper variant="outlined" sx={{ mb: 3, borderRadius: 1 }}>
                      <List disablePadding>
                        {Array.isArray(userRoles) ? (
                          userRoles.length > 0 ? (
                            userRoles.map((userRole, index) => (
                              <React.Fragment key={userRole.id || index}>
<ListItem sx={{ p: 2 }}>
  <ListItemText 
    primary={
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center' 
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
            {userRole.roleName || userRole.roleId}
          </Typography>
          {isInitialDataRole(userRole.roleId) && (
            <Chip 
              size="small" 
              label="S" 
              color="info" 
              sx={{ ml: 1 }}
              title="Role de Sistema"
            />
          )}
        </Box>
        <Button 
          size="small" 
          variant="contained" 
          color="error"
          onClick={() => handleRemoveRoleFromUser(userRole.id)}
          disabled={isInitialDataRole(userRole.roleId)}
        >
          Remover
        </Button>
      </Box>
    }
    secondary={
      <Box sx={{ mt: 1 }}>
        <Typography variant="body2" color="text.secondary">
          <strong>Contexto:</strong> {userRole.context.type}
          {userRole.context.resourceId && ` (${userRole.context.resourceId})`}
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Chip 
              size="small" 
              label={userRole.validationStatus} 
              color={
                userRole.validationStatus === 'validated' ? 'success' :
                userRole.validationStatus === 'rejected' ? 'error' : 'warning'
              }
            />
            
            {userRole.validatedAt && (
              <Typography variant="caption" sx={{ ml: 1 }}>
                Validado em: {new Date(userRole.validatedAt).toLocaleString()}
              </Typography>
            )}
          </Box>
          
          {userRole.metadata && Object.keys(userRole.metadata).length > 0 && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="caption" color="text.secondary">
                <strong>Metadados:</strong>
              </Typography>
              <Box component="ul" sx={{ m: 0, pl: 2 }}>
                {Object.entries(userRole.metadata).map(([key, value]) => (
                  <Typography component="li" variant="caption" key={key}>
                    {key}: {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                  </Typography>
                ))}
              </Box>
            </Box>
          )}
          
          {userRole.createdAt && (
            <Typography variant="caption" color="text.secondary">
              Atribuída em: {new Date(userRole.createdAt).toLocaleString()}
            </Typography>
          )}
          
          {userRole.createdBy && (
            <Typography variant="caption" color="text.secondary">
              Atribuída por: {userRole.createdBy}
            </Typography>
          )}
        </Box>
      </Box>
    }
  />
</ListItem>
                                {index < userRoles.length - 1 && <Divider />}
                              </React.Fragment>
                            ))
                          ) : (
                            <ListItem>
                              <ListItemText primary="Nenhuma role atribuída a este usuário." />
                            </ListItem>
                          )
                        ) : (
                          <ListItem>
                            <ListItemText primary="Carregando roles do usuário..." />
                          </ListItem>
                        )}
                      </List>
                    </Paper>

                    <Typography variant="h6" gutterBottom>Atribuir Nova Role</Typography>
                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 1 }}>
                      <Box component="form" onSubmit={handleAssignRoleToUser} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <FormControl fullWidth required>
                          <InputLabel>Role</InputLabel>
                          <Select
                            value={newUserRole.roleId}
                            onChange={e => setNewUserRole({...newUserRole, roleId: e.target.value})}
                          >
                            <MenuItem value="">Selecione uma role</MenuItem>
                            {Array.isArray(roles) && roles.map(role => (
                              <MenuItem key={role.id} value={role.id}>{role.name}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>

                        <FormControl fullWidth>
                          <InputLabel>Tipo de Contexto</InputLabel>
                          <Select
                            value={newUserRole.context.type}
                            onChange={e => setNewUserRole({
                              ...newUserRole,
                              context: {...newUserRole.context, type: e.target.value}
                            })}
                          >
                            <MenuItem value="global">Global</MenuItem>
                            <MenuItem value="caixinha">Caixinha</MenuItem>
                            <MenuItem value="marketplace">Marketplace</MenuItem>
                          </Select>
                        </FormControl>

                        {newUserRole.context.type !== 'global' && (
                          <TextField
                            label="ID do Recurso"
                            value={newUserRole.context.resourceId}
                            onChange={e => setNewUserRole({
                              ...newUserRole,
                              context: {...newUserRole.context, resourceId: e.target.value}
                            })}
                            required
                            fullWidth
                          />
                        )}

                        <FormControl fullWidth>
                          <InputLabel>Status de Validação</InputLabel>
                          <Select
                            value={newUserRole.options.validationStatus}
                            onChange={e => setNewUserRole({
                              ...newUserRole,
                              options: {...newUserRole.options, validationStatus: e.target.value}
                            })}
                          >
                            <MenuItem value="pending">Pendente</MenuItem>
                            <MenuItem value="validated">Validado</MenuItem>
                            <MenuItem value="rejected">Rejeitado</MenuItem>
                          </Select>
                        </FormControl>

                        <Button 
                          type="submit" 
                          variant="contained" 
                          color="primary"
                        >
                          Atribuir Role
                        </Button>
                      </Box>
                    </Paper>
                  </Box>
                )}
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default RBACPanel;