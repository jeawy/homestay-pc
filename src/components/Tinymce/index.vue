<template>
  <div class="tinymce-container" :style="{ width: containerWidth }">
    <textarea :id="tinymceId" class="tinymce-textarea" />
  </div>
</template>

<script>
/**
 * docs:
 * https://panjiachen.github.io/vue-element-admin-site/feature/component/rich-editor.html#tinymce
 */

import plugins from "./plugins";
import toolbar from "./toolbar";
import { uploadImage } from "@/api/content";

export default {
  name: "Tinymce",
  props: {
    id: {
      type: String,
      default: function() {
        return (
          "vue-tinymce-" +
          +new Date() +
          ((Math.random() * 1000).toFixed(0) + "")
        );
      }
    },
    value: {
      type: String,
      default: ""
    },
    toolbar: {
      type: Array,
      required: false,
      default() {
        return [];
      }
    },
    menubar: {
      type: [String, Boolean],
      default: false //  'file edit insert view format table'
    },
    height: {
      type: [Number, String],
      required: false,
      default: 360
    },
    width: {
      type: [Number, String],
      required: false,
      default: "auto"
    },
    placeholder: {
      type: String,
      required: false,
      default: ""
    },
    beforeUpload: {
      type: Function,
      required: false,
      default: () => {}
    }
  },
  data() {
    return {
      hasChange: false,
      tinymceId: this.id,
      hasInit: false
    };
  },
  computed: {
    containerWidth() {
      const width = this.width;
      if (/^[\d]+(\.[\d]+)?$/.test(width)) {
        // matches `100`, `'100'`
        return `${width}px`;
      }
      return width;
    }
  },
  watch: {
    value(val) { 
      if(!this.hasInit) return
      if (!this.hasChange && val) {
        window.tinymce.get(this.tinymceId).setContent(val)
      }
    }
  },
  mounted() {
    this.initTinymce();
  },
  activated() {
    this.initTinymce();
  },
  deactivated() {
    this.destroyTinymce();
  },
  destroyed() {
    this.destroyTinymce();
  },
  methods: {
    initTinymce() {
      const _self = this;
      //  skin: 'oxide-dark',  深色皮肤
      window.tinymce.init({
        selector: `#${this.tinymceId}`,
        language: "zh_CN", // 'en'
        height: this.height,
        body_class: "panel-body",
        image_advtab: true,
        object_resizing: false,
        toolbar: this.toolbar.length > 0 ? this.toolbar : toolbar,
        menubar: this.menubar,
        plugins,
        placeholder: this.placeholder,
        image_dimensions: true,
        end_container_on_empty_block: true,
        powerpaste_word_import: "clean",
        advlist_bullet_styles: "square",
        advlist_number_styles: "default",
        default_link_target: "_blank",
        link_title: false,
        nonbreaking_force_tab: true, // inserting nonbreaking space &nbsp; need Nonbreaking Space Plugin
        init_instance_callback: editor => {
          _self.value && editor.setContent(_self.value);
          _self.hasInit = true;
          editor.on("NodeChange Change KeyUp", () => {
            _self.hasChange = editor.getContent() && _self.hasInit;
            _self.$emit("input", editor.getContent());
            
            
          });
        },
        image_uploadtab: true,
        images_upload_handler(blobInfo, success, failure, progress) {
          const file = blobInfo.blob();
          const { type } = file;
          const isAllowType =
            "image/jpeg,image/jpg,image/png".split(",").indexOf(type) != -1;
          if (!isAllowType) {
            return failure("请上传jpeg、jpg、png格式的图片!");
          }
          progress(0);
          const formData = new FormData();
          formData.append("file", file);
          uploadImage(formData, progress)
            .then(({ msg }) => {
              success(process.env.VUE_APP_BASE_IMAGE + "/" + msg);
            })
            .catch(failure);
        },
        branding: false, // 隐藏技术支持
        convert_urls: false
      });
    },
    destroyTinymce() {
      const tinymce = window.tinymce.get(this.tinymceId);
      tinymce && tinymce.destroy();
    },
    setContent(value) {
      window.tinymce.get(this.tinymceId).setContent(value);
    },
    getContent() {
      window.tinymce.get(this.tinymceId).getContent();
    }
  }
};
</script>

<style lang="scss" scoped>
.tinymce-textarea {
  visibility: hidden;
  z-index: -1;
}
</style>
