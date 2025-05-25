import axios from 'axios';

const API_URL = 'http://localhost:3000'; // Thay đổi URL này thành URL của backend của bạn

export const register = async (userData) => {
    try {
        const response = await axios.post(`${API_URL}/user/register`, userData);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Có lỗi xảy ra khi đăng ký' };
    }
};

export const login = async (credentials) => {
    try {
        const response = await axios.post(`${API_URL}/user/login`, credentials);
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data.user;
    } catch (error) {
        throw error.response?.data || { message: 'Có lỗi xảy ra khi đăng nhập' };
    }
};

const isAuthenticated = () => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            return false;
        }
        
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            return false;
        }
        
        return true; // Nếu có token và user trong localStorage, coi như đã xác thực
    } catch (error) {
        console.error('Error checking authentication:', error);
        return false;
    }
}; 