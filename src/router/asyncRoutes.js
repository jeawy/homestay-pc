/**
 *
 *@file 动态路由
 *
 */

import Layout from "@/layout";

export default function asyncRoutes(params) {
  return [
    {
      path: "/",
      component: Layout,
      redirect: {
        name: "home-page"
      },
      meta: {
        breadcrumb: false,
        title: "",
        icon: "gailan"
      },
      children: [
        {
          path: "home-page",
          name: "home-page",
          component: () => import("@/views/home-page/dashboard"),
          meta: {
            title: "工作台",
            icon: "home"
          }
        }
      ]
    },
    {
      path: "/order-manage",
      component: Layout,
      redirect: "noRedirect",
      alwaysShow: true,
      meta: {
        title: "订单管理",
        icon: "dingdan"
      },
      children: [
        {
          path: "order-msg",
          name: "order-msg",
          component: () => import("@/views/order-manage/order-msg"),
          meta: {
            title: "订单列表",
            icon: "duanxin"
          }
        },
        {
          path: "order-detail",
          name: "order-detail",
          component: () => import("@/views/order-manage/order-detail"),
          meta: {
            title: "订单详情",
            icon: "duanxin"
          }
        }
      ]
    },
    {
      path: "/card",
      component: Layout,
      redirect: "noRedirect",
      hidden:true,
      meta: {
        title: "购物卡管理",
        icon: "content"
      },
      children: [
        {
          path: "card-manage",
          name: "card-manage",
          component: () => import("@/views/card/"),
          meta: {
            title: "购物卡激活",
            icon: "qianbao"
          }
        },
        {
          path:"card-add",
          name:"card-add",
          component:()=> import("@/views/card/add"),
          meta:{
            title:"实体购物卡",
            icon:"tianjia"
          }
        },
        {
          path:"card-import",
          name:"card-import",
          hidden:true,
          component:()=> import ("@/views/card/importcard"),
          meta:{
            title:"批量导入购物卡",
            icon:"tianjia"
          }
        }
      ]
    },
    {
      path: "/room-manage",
      component: Layout,
      redirect: "noRedirect",
      meta: {
        title: "民宿",
        icon: "gift"
      },
      children: [
        {
          path: "product-rooms",
          name: "product-rooms",
          component: () => import("@/views/product-manage/rooms"),
          meta: {
            title: "民宿",
            icon: "gift"
          }
        },
        
        {
          path: "add-room",
          name: "add-room",
          component: () => import("@/views/product-manage/addroom?minsu"),
          meta: {
            title: "添加民宿",
            icon: "gift"
          }
        },
        {
          path: "add-room-pic",
          name: "add-room-pic",
          hidden: true,
          component: () => import("@/views/product-manage/addroompic"),
          meta: {
            title: "添加民宿图片",
            icon: "gift"
          }
        }, 
      ]
    }, 
    {
      path: "/product-manage",
      component: Layout,
      redirect: "noRedirect",
      meta: {
        title: "商品管理",
        icon: "gift"
      },
      children: [ 
        {
          path: "product-manage",
          name: "product-manage",
          component: () => import("@/views/product-manage"),
          meta: {
            title: "商品展示",
            icon: "gift"
          }
        }, 
        
        {
          path: "add-product",
          name: "add-product",
          component: () => import("@/views/product-manage/add"),
          meta: {
            title: "添加其他商品",
            icon: "gift"
          }
        }, 
        {
          path: "product-detail",
          name: "product-detail",
          hidden: true,

          component: () => import("@/views/product-manage/product-detail"),
          meta: {
            title: "详情",
            icon: "content"
          }
        },
        {
          path: "commodity-detail",
          name: "commodity-detail",
          hidden: true,
          component: () => import("@/views/product-manage/commodity-detail"),
          meta: {
            title: "商品详情",
            icon: "product"
          }
        }
      ]
    }, 
    {
      path: "/category",
      component: Layout,
      redirect: "noRedirect",
      alwaysShow: true,
      meta: {
        title: "商品类别",
        icon: "fuwu"
      },
      children: [
        {
          path: "category-list",
          name: "category-list",
          hidden: false,

          component: () => import("@/views/category/list"),
          meta: {
            title: "列表",
            icon: "liebiao"
          }
        }
      ]
    },
    {
      path: "/coupon",
      component: Layout,
      redirect: "noRedirect",
      alwaysShow: true,
      meta: {
        title: "优惠券",
        icon: "wenzhang"
      },
      children: [
        {
          path: "coupon-list",
          name: "coupon-list",
          hidden: false,

          component: () => import("@/views/coupon/list"),
          meta: {
            title: "列表",
            icon: "liebiao"
          }
        }
      ]
    },
    {
      path: "/content",
      component: Layout,
      redirect: "noRedirect",
      alwaysShow: true,
      meta: {
        title: "内容管理",
        icon: "wenzhang"
      },
      children: [
        {
          path: "content",
          name: "content",
          component: () => import("@/views/content/info"),
          meta: {
            title: "列表",
            icon: "liebiao"
          }
        },
        {
          path: "edit-info",
          name: "edit-info",
          hidden: false,

          component: () => import("@/views/content/edit-info"),
          meta: {
            title: "发布",
            icon: "tianjia"
          }
        },
        {
          path: "content-detail",
          name: "content-detail",
          hidden: true,

          component: () => import("@/views/content/content-detail"),
          meta: {
            title: "详情",
            icon: "content"
          }
        }
      ]
    },

    {
      path: "/coinManage",
      component: Layout,
      redirect: "Redirect",
      alwaysShow: true,
      meta: {
        title: "积分管理",
        icon: "settings"
      },
      children: [
        {
          path: "coinInfo",
          name: "coinInfo",
          component: () => import("@/views/coinManage/coinInfo"),
          meta: {
            title: "积分信息",
            icon: "group"
          }
        },
        {
          path: "coinDetail",
          name: "coinDetail",
          hidden: true,
          component: () => import("@/views/coinManage/coinDetail"),
          meta: {
            title: "积分详细信息",
            icon: "group"
          }
        }
      ]
    },
    {
      path: "/activityManage",
      component: Layout,
      redirect: "Redirect",
      alwaysShow: true,
      meta: {
        title: "活动管理",
        icon: "activity"
      },
      children: [
        {
          path: "activityList",
          name: "activityList",
          component: () => import("@/views/activityManage/activityList"),
          meta: {
            title: "活动列表",
            icon: "liebiao"
          }
        }
      ]
    },
    {
      path: "/admin",
      component: Layout,
      redirect: "noRedirect",
      meta: {
        title: "系统设置",
        icon: "settings"
      },
      children: [
        {
          path: "userGroup",
          name: "userGroup",
          component: () => import("@/views/admin/userGroup"),
          meta: {
            title: "注册用户",
            icon: "group"
          }
        },
        {
          path: "roles",
          name: "UserGqqqroup",
          component: () => import("@/views/admin/roles"),
          meta: {
            title: "角色管理",
            icon: "role"
          }
        },
        {
          path: "attrs",
          name: "customAttrs",
          component: () => import("@/views/admin/customAttrs"),
          meta: {
            title: "自定义属性",
            icon: "custom-attrs"
          }
        },
        {
          path: "user-import",
          name: "user-import",
          hidden: true,
          component: () => import("@/views/admin/user-import"),
          meta: {
            title: "用户导入",
            icon: "custom-attrs"
          }
        }
      ]
    },
    {
      // 404必须在最后面
      path: "*",
      redirect: "/404",
      hidden: true
    }
  ];
}
