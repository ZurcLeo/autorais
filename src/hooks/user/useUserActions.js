import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService as UserService } from '../../services/user';
import { USER_ACTIONS } from '../../reducers/user/userReducer';
import { showToast } from '../../utils/toastUtils';

export const useUserActions = (dispatch) => {
  const navigate = useNavigate();

  const getUserById = useCallback(async (userId) => {
    try {
      dispatch({ type: USER_ACTIONS.FETCH_START });
      const user = await UserService.getUserById(userId);
      dispatch({ type: USER_ACTIONS.FETCH_SUCCESS, payload: user });
      return user;
    } catch (error) {
      dispatch({ type: USER_ACTIONS.FETCH_FAILURE, payload: error.message });
      showToast('Error fetching user data', { type: 'error' });
      throw error;
    }
  }, [dispatch]);

  const updateUser = useCallback(async (userId, updates) => {
    try {
      dispatch({ type: USER_ACTIONS.FETCH_START });
      const updatedUser = await UserService.updateUser(userId, updates);
      dispatch({ type: USER_ACTIONS.UPDATE_USER, payload: updatedUser });
      showToast('User updated successfully', { type: 'success' });
      return updatedUser;
    } catch (error) {
      dispatch({ type: USER_ACTIONS.FETCH_FAILURE, payload: error.message });
      showToast('Error updating user', { type: 'error' });
      throw error;
    }
  }, [dispatch]);

  const uploadProfilePicture = useCallback(async (userId, file) => {
    try {
      dispatch({ type: USER_ACTIONS.FETCH_START });
      const result = await UserService.uploadProfilePicture(userId, file);
      dispatch({
        type: USER_ACTIONS.UPDATE_USER,
        payload: { profilePicture: result.url }
      });
      showToast('Profile picture updated successfully', { type: 'success' });
      return result;
    } catch (error) {
      dispatch({ type: USER_ACTIONS.FETCH_FAILURE, payload: error.message });
      showToast('Error uploading profile picture', { type: 'error' });
      throw error;
    }
  }, [dispatch]);

  const deleteAccount = useCallback(async (userId) => {
    try {
      await UserService.deleteUser(userId);
      dispatch({ type: USER_ACTIONS.CLEAR_USER });
      navigate('/login');
      showToast('Account deleted successfully', { type: 'success' });
    } catch (error) {
      dispatch({ type: USER_ACTIONS.FETCH_FAILURE, payload: error.message });
      showToast('Error deleting account', { type: 'error' });
      throw error;
    }
  }, [dispatch, navigate]);

  return {
    getUserById,
    updateUser,
    uploadProfilePicture,
    deleteAccount
  };
};