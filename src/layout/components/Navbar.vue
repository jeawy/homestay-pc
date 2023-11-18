<template>
  <div class="navbar">
    <div>
      <hamburger
        id="hamburger-container"
        :is-active="sidebar.opened"
        class="hamburger-container"
        @toggleClick="toggleSideBar"
      />
      <breadcrumb id="breadcrumb-container" class="breadcrumb-container" />
    </div>
    <div class="right-menu">
      <template v-if="device !== 'mobile'"> 
        <notice id="notice" class="right-menu-item" />
      </template>
      <el-dropdown
        class="avatar-container right-menu-item hover-effect"
        trigger="click"
      >
        <div class="avatar-wrapper">
          <img :src="require('@/assets/img/logo.png')" class="user-avatar" />
          <i class="el-icon-caret-bottom" />
        </div>
        <el-dropdown-menu slot="dropdown">
          <router-link to="/">
            <el-dropdown-item
              ><i class="el-icon-s-home"></i> 主页</el-dropdown-item
            >
          </router-link>
          <el-dropdown-item>
            <span style="display:block;" @click="logout"
              ><i class="el-icon-switch-button"></i> 注销</span
            >
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
  </div>
</template>

<script>
import Settings from "./Settings";
import { mapGetters } from "vuex";
import Breadcrumb from "@/components/Breadcrumb";
import Hamburger from "@/components/Hamburger";
import Screenfull from "@/components/Screenfull";
import Notice from "@/components/Notice"; 
import { mapState } from "vuex";
import userInfoVue from "../../components/Notice/components/user-info.vue";

export default {
  data() {
    return {
      isDShow: false,
      options: [],
      communityuuid: ""
    };
  },
  components: {
    Breadcrumb,
    Hamburger,
    Screenfull,
    Settings,
    Notice
  },
  watch: {},
  computed: {
    ...mapGetters(["sidebar", "avatar", "device"])
  }, 
  methods: {
    CommunityChanged(communityuuid) {
      // 存 store
      localStorage.setItem("communityuuid", communityuuid);
      // reload
      this.$router.go(0);
    },
     
    toggleSideBar() {
      this.$store.dispatch("app/toggleSideBar");
    },
    async logout() {
      await this.$store.dispatch("login/logout");
      this.$router.push(`/`);
    }
  }
};
</script>

<style lang="scss" scoped>
.navbar {
  display: flex;
  justify-content: space-between;

  & > * {
    display: flex;
    align-items: center;
  }

  height: 50px;
  overflow: hidden;
  position: relative;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);

  .hamburger-container {
    line-height: 46px;
    height: 100%;
    cursor: pointer;
    transition: background 0.3s;
    -webkit-tap-highlight-color: transparent;

    &:hover {
      background: rgba(0, 0, 0, 0.025);
    }
  }

  .errLog-container {
    display: inline-block;
    vertical-align: top;
  }

  .right-menu {
    height: 100%;
    line-height: 50px;

    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: inline-block;
      padding: 0 8px;
      height: 100%;
      font-size: 18px;
      color: #5a5e66;
      vertical-align: text-bottom;

      &.hover-effect {
        cursor: pointer;
        transition: background 0.3s;

        &:hover {
          background: rgba(0, 0, 0, 0.025);
        }
      }
    }

    .avatar-container {
      margin-right: 30px;

      .avatar-wrapper {
        margin-top: 5px;
        position: relative;

        .user-avatar {
          cursor: pointer;
          width: 40px;
          height: 40px;
          border-radius: 10px;
        }

        .el-icon-caret-bottom {
          cursor: pointer;
          position: absolute;
          right: -20px;
          top: 25px;
          font-size: 12px;
        }
      }
    }
  }
}
</style>
