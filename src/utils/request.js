import axios from 'axios';
import {
    ElMessage
} from 'element-plus';

// 创建 axios 实例
const service = axios.create({
    baseURL: process.env.VUE_APP_BASE_API || '/api', // url = base url + request url
    timeout: 15000, // 请求超时时间
    headers: {
        'Content-Type': 'application/json;charset=utf-8'
    }
});

// 请求拦截器
service.interceptors.request.use(
    config => {
        // 在发送请求之前做些什么
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    error => {
        // 对请求错误做些什么
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

// 响应拦截器
service.interceptors.response.use(
    response => {
        const res = response.data;

        // 如果返回的状态码不是200，说明接口请求有误
        if (res.code !== 200) {
            ElMessage({
                message: res.message || 'Error',
                type: 'error',
                duration: 5 * 1000
            });

            // 401: 未登录或token过期
            if (res.code === 401) {
                // 清除本地token
                localStorage.removeItem('token');
                localStorage.removeItem('isLoggedIn');
                // 跳转到登录页
                window.location.href = '/login';
            }
            return Promise.reject(new Error(res.message || 'Error'));
        } else {
            return res;
        }
    },
    error => {
        console.error('Response error:', error);
        ElMessage({
            message: error.message || 'Request failed',
            type: 'error',
            duration: 5 * 1000
        });
        return Promise.reject(error);
    }
);

// 封装请求方法
const request = {
    get(url, params) {
        return service.get(url, {
            params
        });
    },

    post(url, data) {
        return service.post(url, data);
    },

    put(url, data) {
        return service.put(url, data);
    },

    delete(url, params) {
        return service.delete(url, {
            params
        });
    },

    // 上传文件
    upload(url, file) {
        const formData = new FormData();
        formData.append('file', file);
        return service.post(url, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    }
};

export default request;