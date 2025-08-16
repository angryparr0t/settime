<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <h1 class="title">日程管理系统</h1>
        <p class="subtitle">欢迎回来，请登录您的账号</p>
      </div>

      <Form @submit="handleLogin" v-slot="{ errors }" class="login-form">
        <div class="form-item">
          <label class="form-label">用户名</label>
          <Field
            v-model="username"
            name="username"
            type="text"
            class="form-input"
            :class="{ 'is-invalid': errors.username }"
            placeholder="请输入用户名"
            rules="required|min:3"
          />
          <span class="error-message">{{ errors.username }}</span>
        </div>

        <div class="form-item">
          <label class="form-label">密码</label>
          <Field
            v-model="password"
            name="password"
            type="password"
            class="form-input"
            :class="{ 'is-invalid': errors.password }"
            placeholder="请输入密码"
            rules="required|min:6"
          />
          <span class="error-message">{{ errors.password }}</span>
        </div>

        <div class="form-options">
          <label class="remember-me">
            <input type="checkbox" v-model="rememberMe" />
            <span>记住我</span>
          </label>
          <a href="#" class="forgot-password">忘记密码？</a>
        </div>

        <button type="submit" class="login-btn" :disabled="isLoading">
          {{ isLoading ? "登录中..." : "登录" }}
        </button>
      </Form>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { Form, Field, defineRule } from "vee-validate";
// import { login } from "@/api/auth";
import { ElMessage } from "element-plus";

// 定义验证规则
defineRule("required", (value) => {
  if (!value || !value.length) {
    return "此字段不能为空";
  }
  return true;
});

defineRule("min", (value, [length]) => {
  if (!value || !value.length) {
    return true;
  }
  if (value.length < length) {
    return `此字段至少需要 ${length} 个字符`;
  }
  return true;
});

const router = useRouter();
const username = ref("");
const password = ref("");
const rememberMe = ref(false);
const isLoading = ref(false);

const handleLogin = async (values) => {
  isLoading.value = true;
  try {
    if (values.username === "admin" && values.password === "123456") {
      localStorage.setItem("token", "admin");
      localStorage.setItem("isLoggedIn", "true");
      ElMessage({
        message: "登录成功",
        type: "success",
      });
      router.push("/home");
    } else {
      ElMessage({
        message: "登录失败",
        type: "error",
      });
    }
  } catch (error) {
    console.error("登录失败：", error);
    ElMessage({
      message: "登录失败",
      type: "error",
    });
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%);
  padding: 20px;
}

.login-box {
  background: white;
  border-radius: 16px;
  padding: 40px;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.title {
  font-size: 28px;
  color: #222;
  margin: 0 0 12px 0;
  font-weight: 600;
}

.subtitle {
  font-size: 16px;
  color: #666;
  margin: 0;
}

.form-item {
  margin-bottom: 24px;
}

.form-label {
  display: block;
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 15px;
  transition: all 0.2s;
  box-sizing: border-box;
}

.form-input:focus {
  border-color: #2979ff;
  outline: none;
  box-shadow: 0 0 0 3px rgba(41, 121, 255, 0.1);
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.remember-me {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #666;
  cursor: pointer;
}

.remember-me input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.forgot-password {
  font-size: 14px;
  color: #2979ff;
  text-decoration: none;
}

.forgot-password:hover {
  text-decoration: underline;
}

.login-btn {
  width: 100%;
  padding: 12px;
  background: #2979ff;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s;
}

.login-btn:hover {
  background: #1565c0;
}

.login-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

@media (max-width: 480px) {
  .login-box {
    padding: 30px 20px;
  }

  .title {
    font-size: 24px;
  }

  .subtitle {
    font-size: 14px;
  }
}

.error-message {
  color: #ff4d4f;
  font-size: 12px;
  margin-top: 4px;
  display: block;
}

.form-input.is-invalid {
  border-color: #ff4d4f;
}

.form-input.is-invalid:focus {
  box-shadow: 0 0 0 3px rgba(255, 77, 79, 0.1);
}
</style>
