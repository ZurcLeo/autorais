// // src/services/userService.js
// import apiService from './apiService';

// export const getAllUsers = async () => {
//   console.debug('Iniciando busca de usuários...');
//   console.time(`getUsers-${Date.now()}`); // Timer único para getUsers
//   try {
//     const response = await apiService.api.get(`/api/users`);
//     console.info('Usuários buscados com sucesso:', response.data.length, 'usuários encontrados.');
//     return response.data;
//   } catch (error) {
//     console.error('Erro ao buscar usuários:', error.message, error.stack);
//     throw new Error('Falha ao buscar usuários: ' + error.message);
//   } finally {
//     console.timeEnd(`getUsers-${Date.now()}`);
//   }
// };

// export const getUserById = async (userId) => {
//   console.debug(`Iniciando busca do usuário com ID: ${userId}...`);
//   console.time(`getUserById-${Date.now()}`); // Timer único para getUserById
//   try {
//     const response = await apiService.api.get(`/api/users/${userId}`);
//     console.info(`Usuário com ID ${userId} encontrado com sucesso.`);
//     return response.data;
//   } catch (error) {
//     console.error(`Erro ao buscar usuário com ID ${userId}:`, error.message, error.stack);
//     throw new Error(`Falha ao buscar usuário com ID ${userId}: ` + error.message);
//   } finally {
//     console.timeEnd(`getUserById-${userId}`);
//   }
// };

// export const addUser = async (user) => {
//   console.debug('Iniciando adição de novo usuário...');
//   console.time('addUser');
//   try {
//     const response = await apiService.api.post('/api/users/add-user', user);
//     console.info('Usuário adicionado com sucesso:', response.data);
//     return response.data;
//   } catch (error) {
//     console.error('Erro ao adicionar usuário:', error.message, error.stack);
//     throw new Error('Falha ao adicionar usuário: ' + error.message);
//   } finally {
//     console.timeEnd('addUser');
//   }
// };

// export const updateUser = async (userId, updatedUser) => {
//   console.debug(`Iniciando atualização do usuário com ID: ${userId}...`);
//   console.time('updateUser');
//   try {
//     const response = await apiService.api.put(`/api/users/update-user/${userId}`, updatedUser);
//     console.info(`Usuário com ID ${userId} atualizado com sucesso.`);
//     return response.data;
//   } catch (error) {
//     console.error(`Erro ao atualizar usuário com ID ${userId}:`, error.message, error.stack);
//     throw new Error(`Falha ao atualizar usuário com ID ${userId}: ` + error.message);
//   } finally {
//     console.timeEnd('updateUser');
//   }
// };

// export const uploadProfilePicture = async (userId, file) => {
//   console.debug(`Iniciando upload da foto de perfil para o usuário com ID: ${userId}...`);
//   console.time('uploadProfilePicture');
//   try {
//     const formData = new FormData();
//     formData.append('profilePicture', file);
//     const response = await apiService.apiUpload.put(`/api/users/upload-profile-picture/${userId}`, formData);
//     console.info(`Foto de perfil do usuário com ID ${userId} atualizada com sucesso.`);
//     return response.data;
//   } catch (error) {
//     console.error(`Erro ao fazer upload da foto de perfil para o usuário com ID ${userId}:`, error.message, error.stack);
//     throw new Error(`Falha ao fazer upload da foto de perfil para o usuário com ID ${userId}: ` + error.message);
//   } finally {
//     console.timeEnd('uploadProfilePicture');
//   }
// };

// export const deleteUser = async (id) => {
//   console.debug(`Iniciando exclusão do usuário com ID: ${id}...`);
//   console.time('deleteUser');
//   try {
//     const response = await apiService.api.delete(`/api/users/delete-user/${id}`);
//     console.info(`Usuário com ID ${id} excluído com sucesso.`);
//     return response.data;
//   } catch (error) {
//     console.error(`Erro ao excluir usuário com ID ${id}:`, error.message, error.stack);
//     throw new Error(`Falha ao excluir usuário com ID ${id}: ` + error.message);
//   } finally {
//     console.timeEnd('deleteUser');
//   }
// };

// export default {
//   getAllUsers,
//   getUserById,
//   addUser,
//   updateUser,
//   uploadProfilePicture,
//   deleteUser,
// };