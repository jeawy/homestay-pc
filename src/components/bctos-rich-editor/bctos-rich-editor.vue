<template>
	<div :class="{ fullscreen: fullscreen }" class="tinymce-container" :style="{ width: containerWidth }"><textarea :id="tinymceId" class="tinymce-textarea" /></div>
</template>

<script>
import load from './dynamicLoadScript';

// const tinymceCDN = 'https://cdn.jsdelivr.net/npm/tinymce@5.10.2/tinymce.min.js';
//只能使用自己的SCDN了，因为上面的CDN没有中文语言包

const tinymceCDN = 'https://hedi.bctos.cn/tinymce/tinymce.min.js';

export default {
	name: 'bctos-rich-editor',
	props: {
		id: {
			type: String,
			default() {
				return 'vue-tinymce-' + +new Date() + ((Math.random() * 1000).toFixed(0) + '');
			}
		},
		value: {
			type: String,
			default: ''
		},
		height: {
			type: [Number, String],
			required: false,
			default: 360
		},
		width: {
			type: [Number, String],
			required: false,
			default: 'auto'
		}
	},
	data() {
		return {
			hasChange: false,
			tinymceId: this.id,
			fullscreen: false
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
			if (!this.hasChange) {
				this.$nextTick(() => window.tinymce.get(this.tinymceId).setContent(val || ''));
			}
		}
	},
	mounted() {
		this.init();
	},
	activated() {
		if (window.tinymce) {
			this.initTinymce();
		}
	},
	deactivated() {
		this.destroyTinymce();
	},
	destroyed() {
		this.destroyTinymce();
	},
	methods: {
		init() {
			load(tinymceCDN, err => {
				if (err) {
					this.$message.error(err.message);
					return;
				}
				this.initTinymce();
			});
		},
		initTinymce() {
			const _this = this;
			window.tinymce.init({
				selector: `#${this.tinymceId}`,
				file_picker_types: 'media',
				file_picker_callback: function(callback, value, meta) {
					uniCloud
						.chooseAndUploadFile({
							type: 'video',
							onChooseFile(res) {
								uni.showLoading({
									title: '上传中'
								});
							}
						})
						.then(res => {
							uni.hideLoading();
							let url = res.tempFiles[0].url;
							callback(url, { poster: url + '?x-oss-process=video/snapshot,t_1000,f_jpg,w_800,h_600,m_fast' });
						});
				},
				images_upload_handler: async (blobInfo, succFun, failFun, progress) => {
					progress(0);
					let fileName = +new Date() + ('000000' + Math.floor(Math.random() * 999999)).slice(-6);
					fileName += blobInfo.blob().type === 'image/jpeg' ? '.jpg' : '.png';
					const result = await uniCloud.uploadFile({
						filePath: blobInfo.blobUri(),
						cloudPath: fileName,
						onUploadProgress: progressEvent => {
							progress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
						}
					});
					console.log(result);
					if (result.fileID.startsWith('http')) {
						succFun(result.fileID);
						return;
					}
					const tempFiles = await uniCloud.getTempFileURL({
						fileList: [result.fileID]
					});
					const tempFile = tempFiles.fileList[0];
					if (tempFile.code === 'SUCCESS') {
						succFun(tempFile.download_url);
					} else {
						failFun('上传失败');
					}
				},
				language: 'zh_CN',
				height: this.height,
				body_class: 'panel-body ',
				object_resizing: false,
				toolbar: [
					'bold italic underline strikethrough | fontselect fontsizeselect formatselect | alignleft aligncenter alignright alignjustify | outdent indent |  numlist bullist | forecolor backcolor removeformat | pagebreak | charmap emoticons | fullscreen  preview save print | insertfile image media template link anchor codesample | a11ycheck ltr rtl | showcomments addcomment | undo redo | '
				],
				menubar: false,
				plugins:
					'print preview importcss searchreplace autolink autosave save directionality visualblocks visualchars fullscreen image link media template codesample table charmap hr pagebreak nonbreaking anchor toc insertdatetime advlist lists wordcount imagetools textpattern noneditable help charmap quickbars emoticons',
				end_container_on_empty_block: true,
				powerpaste_word_import: 'clean',
				code_dialog_height: 450,
				code_dialog_width: 1000,
				advlist_bullet_styles: 'square',
				advlist_number_styles: 'default',
				imagetools_cors_hosts: ['www.tinymce.com', 'codepen.io'],
				default_link_target: '_blank',
				link_title: false,
				nonbreaking_force_tab: true, // inserting nonbreaking space &nbsp; need Nonbreaking Space Plugin
				init_instance_callback: editor => {
					editor.setContent(_this.value || '');
					editor.on('keyup', res => {
							this.hasChange = true;
							this.$emit('input', editor.getContent());
					});
				},
				setup(editor) {
					editor.on('FullscreenStateChanged', e => {
						_this.fullscreen = e.state;
					});
				},
			});
		},
		destroyTinymce() {
			const tinymce = window.tinymce.get(this.tinymceId);
			if (this.fullscreen) {
				tinymce.execCommand('mceFullScreen');
			}

			if (tinymce) {
				tinymce.destroy();
			}
		},
		setContent(value) {
			window.tinymce.get(this.tinymceId).setContent(value);
		},
		getContent() {
			window.tinymce.get(this.tinymceId).getContent();
		},
		imageSuccessCBK(arr) {
			const _this = this;
			arr.forEach(v => {
				window.tinymce.get(_this.tinymceId).insertContent(`<img class="wscnph" src="${v.url}" >`);
			});
		}
	}
};
</script>

<style scoped lang="scss">
/deep/ {
	.tinymce-container {
		position: relative;
		line-height: normal;
	}
	.tinymce-container >>> .mce-fullscreen {
		z-index: 10000;
	}
	.tinymce-textarea {
		visibility: hidden;
		z-index: -1;
	}
	.editor-custom-btn-container {
		position: absolute;
		right: 4px;
		top: 4px;
		/*z-index: 2005;*/
	}
	.fullscreen .editor-custom-btn-container {
		z-index: 10000;
		position: fixed;
	}
	.editor-upload-btn {
		display: inline-block;
	}
	.mce-tinymce {
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0) !important;
		border-color: #dcdfe6 !important;
	}
	.mce-top-part::before {
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0) !important;
	}
	.mce-edit-area {
		border-color: #dcdfe6 !important;

		iframe {
			opacity: 0;
		}
	}
	.mce-statusbar {
		border-color: #dcdfe6 !important;
	}
	#mceu_27 {
		border-radius: 5px;
		overflow: hidden;
	}
	/* 菜单图标字体颜色 */
	.mce-ico {
		color: #7e8086 !important;
	}
	/* 选中项图标为白色 */
	.mce-btn.mce-active i {
		color: #fff !important;
	}
	/* 背景颜色图标 */
	i.mce-i-backcolor {
		color: #fff !important;
		background-color: #ff944c !important;
	}
	/* 字体颜色图标 */
	i.mce-i-forecolor {
		color: #ff944c !important;
		transform: scale(1.1);
	}
}
</style>
