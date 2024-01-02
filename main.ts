import {
	Notice,
	Plugin,
	TFile,
} from 'obsidian';
import {DEFAULT_SETTINGS, SyncCnblogSettings, SyncCnblogSettingTab} from "./src/Setting";
import {
	findAllImg,
	getAttachmentTFolder,
	getMdContent, getThePost, getThePostByName, replaceImgLocalToNet,
	uploadImgs, uploadPost
} from "./src/utils/MdFile";
import WeblogClient from "./src/utils/WeblogClient";
import CacheUtil from "./src/utils/CacheUtil";

export default class SyncCnblogPlugin extends Plugin {
	private static plugin_this: SyncCnblogPlugin;
	private setting: SyncCnblogSettings;

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
				if (file instanceof TFile) {
					if (file.extension === "md") {
						menu.addItem((item) => {
							item
								.setTitle("同步到博客园")
								.setIcon("upload")
								.onClick(async () => {
									let content = await getMdContent(file)
									const imgPaths = findAllImg(content)
									let attachmentFolder = getAttachmentTFolder(file, CacheUtil.getSettings().location_attachments)
									let urlAndLocalImgs = await uploadImgs(imgPaths, attachmentFolder, this)
									// 网络地址替换本地地址
									let replacedMd = await replaceImgLocalToNet(content, urlAndLocalImgs)
									let post = await getThePost(file, replacedMd)
									// 上传文章
									new Notice(await uploadPost(post))
								});
						});
					}

				}

			}));
		// 创建左侧图标, 点击时可测试插件是否可用
		this.addRibbonIcon('dice', 'Sample Plugin', async (evt: MouseEvent) => {
			try {
				let blogs = await WeblogClient.getUsersBlogs()
				if (blogs[0].blogName === undefined) {
					new Notice("链接异常, 请检查网络及相关参数!")
				}else {
					new Notice("Hello, " + blogs[0].blogName + "!");
				}
			}catch (e) {
				new Notice("链接异常, 请检查网络及相关参数!")
			}

		});

		this.registerEvent(this.app.vault.on('delete', (file) => {
			// fixme 删除时应该告知用户是否同步删除博文, 现版本暂不支持
		}));
		this.registerEvent(this.app.vault.on('rename', async (newFile, oldPath) => {
			if (newFile instanceof TFile ) {
				if (newFile.extension === "md") {
					// @ts-ignore
					let oldFileName = oldPath.split("/").pop().substring(0, oldPath.split("/").pop().lastIndexOf("."))
					let post = await getThePostByName(oldFileName, "",false)
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



