<template>
  <div>
    <quill-editor
      v-model="currentValue"
      ref="quillEditor"
      v-bind="$props"
      v-on="$listeners"
      :options="latestOptions"
    >
    </quill-editor>
    <el-upload
      :accept="accept"
      action="prx/api/appfile/appfile/"
      :headers="headers"
      :on-success="handlePicSuccessRich"
      :before-upload="beforepicUploadRich"
      :show-file-list="false"
      id="avatar-uploader"
    />
  </div>
</template>

<script>
import { quillEditor } from "vue-quill-editor";
import "quill/dist/quill.core.css";
import "quill/dist/quill.snow.css";
import "quill/dist/quill.bubble.css";
import { getToken } from "@/utils/auth";

const container = [
  ["bold", "italic", "underline", "strike"],
  ["blockquote", "code-block"],
  [{ header: 1 }, { header: 2 }],
  [{ list: "ordered" }, { list: "bullet" }],
  [{ script: "sub" }, { script: "super" }],
  [{ indent: "-1" }, { indent: "+1" }],
  [{ direction: "rtl" }],
  [{ size: ["small", false, "large", "huge"] }],
  [{ header: [1, 2, 3, 4, 5, 6, false] }],
  [{ color: [] }, { background: [] }],
  [{ font: [] }],
  [{ align: [] }],
  ["link", "image", "video"],
  ["clean"] // remove formatting button
];
export default {
  name: "RichBox",
  components: {
    quillEditor
  },
  /**
   * options.modules里不要配置toolbar!!!
   * options.modules里不要配置toolbar!!!
   * options.modules里不要配置toolbar!!!
   * options.modules里不要配置toolbar!!!
   */
  props: {
    ...quillEditor.props,
    value: [String, Array, Object, Number]
  },
  data() {
    return {
      headers: {
        Authorization: `JWT ${getToken()}`
      },
      accept: "image/jpeg, image/jpg, image/png",
      baseImage: process.env.VUE_APP_BASE_IMAGE
    };
  },
  computed: {
    currentValue: {
      get() {
        return this.value;
      },
      set(newVal) {
        this.$emit("input", newVal);
      }
    },
    latestOptions: {
      get() {
        const options = { ...this.options };
        options.modules = options || toolbar;
        options.modules.toolbar = {
          container, // 工具栏
          handlers: {
            image(value) {
              if (value) {
                document.querySelector("#avatar-uploader input").click();
              } else {
                this.quill.format("image", false);
              }
            }
          }
        };
        return options;
      }
    }
  },
  methods: {
    beforepicUploadRich(file) {
      const fileType = file.type;
      const isAllowType = this.accept.split().indexOf(fileType) != -1;
      if (!isAllowType) {
        this.$message.error("请上传jpeg、jpg、png格式的图片!");
        return false;
      }
    },
    handlePicSuccessRich(response, file, fileList) {
      if (response.status == 0) {
        // 富文本组件实例
        const { quill } = this.$refs.quillEditor;
        // 如果上传成功
        if (response.msg) {
          // 获取光标所在位置
          let length = quill.getSelection().index;
          // 插入图片  res.info为服务器返回的图片地址
          quill.insertEmbed(
            length,
            "image",
            this.baseImage + "/" + response.msg
          );
          // 调整光标到最后
          quill.setSelection(length + 1);
        } else {
          this.$message.error("图片插入失败");
        }
      } else {
        this.$notify({
          type: "error",
          message: response.msg,
          duration: 2000
        });
      }
    }
  }
};
</script>
