// // src/hooks/useUserActions.js
// import { useCallback } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { userService as UserService } from '../../services/UserService';
// import { USER_ACTIONS } from '../../core/constants/actions';
// import { showToast } from '../../utils/toastUtils';
// import { useUser } from '../../providers/UserProvider';

// export const useUserActions = (dispatch) => {
//     const { dispatch } = useUser();
//     const navigate = useNavigate();

//     const getUserById = useCallback(async (userId) => {
//         try {
//             dispatch({ type: USER_ACTIONS.FETCH_START });
//             const user = await UserService.getUserProfile(userId); // Usa getUserProfile atualizado
//             dispatch({ type: USER_ACTIONS.FETCH_SUCCESS, payload: user });
//             return user;
//         } catch (error) {
//             dispatch({ type: USER_ACTIONS.FETCH_FAILURE, payload: error.message });
//             showToast('Error fetching user data', { type: 'error' });
//             throw error;
//         }
//     }, [dispatch]);

//     const updateUser = useCallback(async (userId, updates) => {
//         try {
//             dispatch({ type: USER_ACTIONS.FETCH_START });
//             const updatedUser = await UserService.updateUserProfile(userId, updates); // Usa updateUserProfile atualizado
//             dispatch({ type: USER_ACTIONS.UPDATE_USER, payload: updatedUser });
//             showToast('User updated successfully', { type: 'success' });
//             return updatedUser;
//         } catch (error) {
//             dispatch({ type: USER_ACTIONS.FETCH_FAILURE, payload: error.message });
//             showToast('Error updating user', { type: 'error' });
//             throw error;
//         }
//     }, [dispatch]);

//     const uploadProfilePicture = useCallback(async (userId, file) => {
//         try {
//             dispatch({ type: USER_ACTIONS.FETCH_START });
//             const result = await UserService.uploadProfilePicture(userId, file); // Usa uploadProfilePicture atualizado
//             dispatch({
//                 type: USER_ACTIONS.UPDATE_USER,
//                 payload: { profilePicture: result.publicUrl } // Backend retorna publicUrl
//             });
//             showToast('Profile picture updated successfully', { type: 'success' });
//             return result;
//         } catch (error) {
//             dispatch({ type: USER_ACTIONS.FETCH_FAILURE, payload: error.message });
//             showToast('Error uploading profile picture', { type: 'error' });
//             throw error;
//         }
//     }, [dispatch]);

//     const deleteAccount = useCallback(async (userId) => { // Mantido como deleteAccount ou pode renomear para deleteUser para consistência.
//         try {
//             await UserService.deleteUser(userId); // Usa deleteUser atualizado
//             dispatch({ type: USER_ACTIONS.CLEAR_USER });
//             navigate('/login');
//             showToast('Account deleted successfully', { type: 'success' });
//         } catch (error) {
//             dispatch({ type: USER_ACTIONS.FETCH_FAILURE, payload: error.message });
//             showToast('Error deleting account', { type: 'error' });
//             throw error;
//         }
//     }, [dispatch, navigate]);

//     const addUserAction = useCallback(async (userData) => { // Adicionada action para addUser
//         try {
//             dispatch({ type: USER_ACTIONS.FETCH_START });
//             const newUser = await UserService.addUser(userData); // Usa addUser atualizado
//             dispatch({ type: USER_ACTIONS.FETCH_SUCCESS, payload: newUser }); // Ou pode despachar outra action dependendo do caso.
//             showToast('User added successfully', { type: 'success' });
//             return newUser;
//         } catch (error) {
//             dispatch({ type: USER_ACTIONS.FETCH_FAILURE, payload: error.message });
//             showToast('Error adding user', { type: 'error' });
//             throw error;
//         }
//     }, [dispatch]);

//     const getUsersAction = useCallback(async () => { // Adicionada action para getUsers
//         try {
//             dispatch({ type: USER_ACTIONS.FETCH_START });
//             const users = await UserService.getUsers(); // Usa getUsers atualizado
//             // dispatch para atualizar a lista de usuários no estado, se necessário.
//             // Exemplo: dispatch({ type: USER_ACTIONS.SET_USERS_LIST, payload: users }); // Supondo que haja tal action e state.
//             return users;
//         } catch (error) {
//             dispatch({ type: USER_ACTIONS.FETCH_FAILURE, payload: error.message });
//             showToast('Error fetching users', { type: 'error' });
//             throw error;
//         }
//     }, [dispatch]);


//     return {
//         getUserById,
//         updateUser,
//         uploadProfilePicture,
//         deleteAccount,
//         addUser: addUserAction, // Exportando addUserAction como addUser
//         getUsers: getUsersAction // Exportando getUsersAction como getUsers
//     };
// };