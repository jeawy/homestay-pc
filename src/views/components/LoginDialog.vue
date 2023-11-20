<template>
  <el-dialog
    :visible="$store.state.isLoginVisible"
    @update:visible="$store.commit('SET_LOGIN_VISIBLE', $event)"
    width="440px"
  >
    <div class="login-dialog__title">
      <el-image
        class="login-logo"
        :src="require('@/assets/img/logo.png')"
        fit="cover"
      ></el-image>
      民宿数据管理平台
    </div>
    <el-form
      ref="signinForm"
      :model="signinForm"
      :rules="loginRules"
      class="dialog-login-form"
      size="medium"
      auto-complete="on"
      label-position="left"
    >
      <el-form-item prop="phone">
        <el-input
          ref="phone"
          v-model.lazy="signinForm.phone"
          placeholder="电话号码"
          prefix-icon="el-icon-user"
          name="phone"
          type="text"
          tabindex="1"
          auto-complete="on"
        >
          <!-- <svg-icon icon-class="user" slot="prefix" /> -->
        </el-input>
      </el-form-item>

      <el-form-item prop="password">
        <el-input
          prefix-icon="el-icon-lock"
          v-model="signinForm.password"
          type="password"
          placeholder="密码"
          tabindex="2"
          auto-complete="on"
          show-password
          @keyup.enter.native="handleLogin"
        >
          <!-- <svg-icon icon-class="password" slot="prefix" /> -->
        </el-input>
      </el-form-item>

      <el-button
        class="login-bth"
        :loading="loading"
        type="primary"
        @click="handleLogin"
        >登录</el-button
      >
      <div class="login-footer">
        <!-- <router-link class="login-footer__link" to="/signup"
          >申请账号</router-link
        > -->
        <router-link class="login-footer__link" to="/forgot"
          >找回密码</router-link
        >
      </div>
    </el-form>
  </el-dialog>
</template>

<script>
export default {
  props: ["loginSuccess"],
  data() {
    const checkPhone = (rule, value, callback) => {
      const reg = /^1[3|4|5|7|8][0-9]\d{8}$/;
      if (reg.test(value)) {
        callback();
      } else {
        return callback(new Error("请输入正确的手机号"));
      }
    };
    return {
      signinForm: {
        phone: "", //18888888888
        password: ""
      },
      loginRules: {
        phone: [
          {
            required: true,
            trigger: "blur",
            message: "请输入密码"
          },
          {
            validator: checkPhone,
            trigger: "change"
          }
        ],
        password: [
          {
            required: true,
            trigger: "blur",
            message: "请输入密码"
          }
        ]
      },
      loading: false
    };
  },
  watch: {
    $route() {
      this.$store.commit("SET_LOGIN_VISIBLE", false);
    }
  },
  methods: {
    handleLogin() {
      this.$refs.signinForm.validate(valid => {
        if (valid) {
          this.loading = true;
          this.$store
            .dispatch("login/login", this.signinForm)
            .then(() => {
              this.$message.success("登录成功");
              this.$store.commit("SET_LOGIN_VISIBLE", false);
              this.$emit("login-success");
            })
            .catch(err => {
              this.$notify({
                type: "error",
                title: "登录失败",
                message: err.msg,
                duration: 2000
              });
            })
            .finally(() => {
              this.loading = false;
            });
        } else {
          return false;
        }
      });
    }
  }
};
</script>

<style lang="scss">
.login-dialog__title {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
  font-size: 18px;
  .login-logo {
    border-radius: 10px;;
    height: 78px;
    margin-right: 16px;
  }
}
.dialog-login-form {
  padding: 0 40px;
  .el-input {
    height: 40px;
    line-height: 38px;
    .el-input__inner {
      height: 100%;
    }
  }
  .login-bth {
    width: 100%;
    height: 40px;
    box-shadow: 0px 5px 20px 0px rgba(45, 140, 240, 0.4);
    font-size: 14px;
    letter-spacing: 4px;
    margin-bottom: 22px;
  }
  .login-footer {
    display: flex;
    justify-content: center;
    .login-footer__link {
      display: inline-block;
      & + .login-footer__link {
        margin-left: 16px;
      }
    }
  }
}
</style>
