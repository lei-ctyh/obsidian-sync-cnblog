import {EmbedCache, Notice, Plugin, TFile,} from 'obsidian';
import {DEFAULT_SETTINGS, SyncCnblogSettingTab} from "./src/Setting";
import {
	findAllEmbeds,
	findKeywords,
	getMdContent,
	getThePost,
	getThePostByName,
	getUploadedImgs,
	replaceImgLocalToNet,
	uploadImgs,
	uploadPost
} from "./src/utils/MdFile";
import CacheUtil from "./src/utils/CacheUtil";

export default class SyncCnblogPlugin extends Plugin {
	private static plugin_this: SyncCnblogPlugin;

	async onload() {
		// 初始化instance
		await this.initPlug()

		// 注册指令到右键的文件菜单
		this.registerEvent(
			this.app.workspace.on("file-menu", (menu, file) => {
				// 判断文件是否在同步目录下
				let locationPosts = CacheUtil.getSettings().locationPosts
				if (!file.path.startsWith(locationPosts) && locationPosts != "/" && locationPosts != "" && locationPosts != undefined) {
					return;
				}
				if (file instanceof TFile) {
					if (file.extension === "md") {
						menu.addItem((item) => {
							item
								.setTitle("同步到博客园")
								.setIcon("upload")
								.onClick(async () => {
									await this.rightClickToUpload(file)
								});
						});
					}

				}

			}));

		this.registerEvent(this.app.vault.on('delete', (file) => {
			if (file instanceof TFile) {
				if (file.extension === "md") {
					// TODO 删除时应该告知用户是否同步删除博文, 现版本暂不支持
					new Notice("" + file.name + "文章不会在博客园删除!")
				}
			}

		}));
		this.registerEvent(this.app.vault.on('rename', async (newFile, oldPath) => {
			if (newFile instanceof TFile) {
				if (newFile.extension === "md") {
					// @ts-ignore
					let oldFileName = oldPath.split("/").pop().substring(0, oldPath.split("/").pop().lastIndexOf("."))
					let post = await getThePostByName(oldFileName)
					// 上传文章
					if (post.postid !== undefined) {
						post.title = newFile.basename
						new Notice(await uploadPost(post))
					}
				}
			}


		}));
	}


	onunload() {
		// 卸载时说再见
		// new Notice("Goodbye !")
	}


	public static getPluginThis(): SyncCnblogPlugin {
		return SyncCnblogPlugin.plugin_this;
	}

	/**
	 * 初始化插件, 加载必要数据
	 */
	private async initPlug() {
		if (!SyncCnblogPlugin.plugin_this) {
			SyncCnblogPlugin.plugin_this = this;
		}
		// 添加选项设置面板
		this.addSettingTab(new SyncCnblogSettingTab(this.app, this));
		CacheUtil.setSettings(Object.assign({}, DEFAULT_SETTINGS, await this.loadData()));
	}

	private async rightClickToUpload(file: TFile) {
		let content = await getMdContent(file)
		const embeds: EmbedCache[] = findAllEmbeds(file)
		let post = await getThePost(file)
		// 获取已上传的所有图片
		let uploadedImgs: [string, string] [] = getUploadedImgs(post)
		let addUrlEmbeds = await uploadImgs(embeds, uploadedImgs,file, this)
		// 网络地址替换本地地址
		post.description = await replaceImgLocalToNet(content, addUrlEmbeds)
		post.title = file.basename
		post.mt_keywords = findKeywords(file)
		// 上传文章
		new Notice(await uploadPost(post))
	}
}



