import {
	EmbedCache,
	Notice,
	Plugin,
	TFile,
} from 'obsidian';
import {DEFAULT_SETTINGS, SyncCnblogSettingTab} from "./src/Setting";
import {
	findAllEmbeds,
	 findKeywords,
	getAttachmentTFolder,
	getMdContent, getThePost, getThePostByName, replaceImgLocalToNet,
	uploadImgs, uploadPost
} from "./src/utils/MdFile";
import WeblogClient from "./src/utils/WeblogClient";
import CacheUtil from "./src/utils/CacheUtil";

export default class SyncCnblogPlugin extends Plugin {
	private static plugin_this: SyncCnblogPlugin;

	async onload() {
		// 初始化instance
		await this.initPlug()

		// 添加指令到ctrl+p的控制面板
		this.addCommand({
			id: "sync_cnblog",
			name: "sync_cnblog",
			callback: () => {
			},
		});

		// 注册指令到右键的文件菜单
		this.registerEvent(
			this.app.workspace.on("file-menu", (menu, file) => {
				// 判断文件是否在同步目录下
				if (!file.path.startsWith(CacheUtil.getSettings().location_posts)) {
					return;
				}
				if (file instanceof TFile) {
					if (file.extension === "md") {
						menu.addItem((item) => {
							item
								.setTitle("同步到博客园")
								.setIcon("upload")
								.onClick(async () => {
									let content = await getMdContent(file)
									const embeds:EmbedCache[] = findAllEmbeds(file)
									let attachmentFolder = getAttachmentTFolder(file, CacheUtil.getSettings().location_attachments)
									let addUrlEmbeds = await uploadImgs(embeds, attachmentFolder, this)
									// 网络地址替换本地地址
									let replacedMd = await replaceImgLocalToNet(content, addUrlEmbeds)
									let post = await getThePost(file, replacedMd)
									post.mt_keywords = findKeywords(file)
									// 上传文章
									new Notice(await uploadPost(post))
								});
						});
					}

				}

			}));
		// 创建左侧图标, 点击时可测试插件是否可用
		this.addRibbonIcon('rss', '测试与博客园链接', async () => {
			try {
				// 检测网络, 以及博客相关参数
				let blogs = await WeblogClient.getUsersBlogs()
				if (blogs[0].blogName === undefined) {
					new Notice("链接异常, 请检查网络及相关参数!")
					return
				}
				// 检测同步文件夹
				debugger
				let sync_dir = this.app.vault.getAbstractFileByPath(CacheUtil.getSettings().location_posts)
				if (sync_dir == null) {
					new Notice("文章同步目录不存在, 将按照默认设置进行同步!")
					return
				}
				if (sync_dir instanceof TFile) {
					new Notice("文章同步目录不是文件夹, 将按照默认设置进行同步!")
					return
				}
				new Notice("Hello, " + blogs[0].blogName + "!");
			} catch (e) {
				new Notice("链接异常, 请检查网络及相关参数!")
			}

		});

		this.registerEvent(this.app.vault.on('delete', (file) => {
			if (file instanceof TFile) {
				if (file.extension === "md") {
					// fixme 删除时应该告知用户是否同步删除博文, 现版本暂不支持
					new Notice("" + file.name + "文章不会在博客园删除!")
				}
			}

		}));
		this.registerEvent(this.app.vault.on('rename', async (newFile, oldPath) => {
			if (newFile instanceof TFile) {
				if (newFile.extension === "md") {
					// @ts-ignore
					let oldFileName = oldPath.split("/").pop().substring(0, oldPath.split("/").pop().lastIndexOf("."))
					let post = await getThePostByName(oldFileName, "", false)
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
		new Notice("Goodbye !")
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
		// 这添加了一个设置选项卡，以便用户可以配置插件的各个方面
		this.addSettingTab(new SyncCnblogSettingTab(this.app, this));
		CacheUtil.setSettings(Object.assign({}, DEFAULT_SETTINGS, await this.loadData()));
	}
}



