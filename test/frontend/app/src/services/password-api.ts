import api from './api';

// Function to request a password reset (forgot password)
export const requestPasswordReset = async (email: string): Promise<unknown> => {
  try {
    const response = await api.post("/forgot-password", { email });
    return response.data;
  } catch (error) {
    console.error("Error requesting password reset:", error);
    throw error;
  }
};

// Function to reset password with token (from email link)
export const resetPassword = async (token: string, password: string): Promise<unknown> => {
  try {
    const response = await api.post("/reset-password", { token, password });
    return response.data;
  } catch (error) {
    console.error("Error resetting password:", error);
    throw error;
  }
};

// Function to change password when logged in
export const changePassword = async (currentPassword: string, newPassword: string): Promise<unknown> => {
  try {
    const response = await api.put("/new-password", {
      current_password: currentPassword,
      new_password: newPassword
    });
    return response.data;
  } catch (error) {
    console.error("Error changing password:", error);
    throw error;
  }
};

// Function to verify password reset token
export const verifyResetToken = async (token: string): Promise<unknown> => {
  try {
    const response = await api.get(`/verify-reset-token?token=${token}`);
    return response.data;
  } catch (error) {
    console.error("Error verifying reset token:", error);
    throw error;
  }
};