import request from '@/utils/request';

// 登录
export function login(data) {
    return request.post('/auth/login', data);
}

// 登出
export function logout() {
    return request.post('/auth/logout');
}

// 获取用户信息
export function getUserInfo() {
    return request.get('/auth/user-info');
}

// 修改密码
export function changePassword(data) {
    return request.put('/auth/change-password', data);
}

// 重置密码
export function resetPassword(data) {
    return request.post('/auth/reset-password', data);
}