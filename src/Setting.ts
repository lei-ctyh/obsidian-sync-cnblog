import {App, Notice, PluginSettingTab, Setting, TFolder} from "obsidian";
import SyncCnblogPlugin from "../main";
import CacheUtil from "./utils/CacheUtil";
import WeblogClient from "./utils/WeblogClient";

export interface SyncCnblogSettings {
	blogUrl: string;
	blog_id: string;
	username: string;
	password: string;
	// 需要同步的文章目录, 默认是所有文章
	locationPosts: string;
	throttlingMode: boolean;
}

export const DEFAULT_SETTINGS: SyncCnblogSettings = {
	blogUrl: "",
	// blog_id 链接成功可以回写，暂时没用到
	blog_id: "",
	username: "",
	password: "",
	// 需要同步的文章目录, 默认是所有文章, 路径/子路径
	locationPosts: "/",
	throttlingMode: true,
}

export class SyncCnblogSettingTab extends PluginSettingTab {
	plugin: SyncCnblogPlugin;

	constructor(app: App, plugin: SyncCnblogPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl: contentEl} = this;
		contentEl.empty();

		new Setting(contentEl)
			.setName('blogUrl')
			.setDesc('MetaWeblog访问地址')
			.addText(text => text
				.setPlaceholder('MetaWeblog访问地址')
				.setValue(CacheUtil.getSettings().blogUrl)
				.onChange(async (value) => {
					CacheUtil.getSettings().blogUrl = value;
					await CacheUtil.saveSettings();
				}));
		new Setting(contentEl)
			.setName('username')
			.setDesc('MetaWeblog登录名')
			.addText(text => text
				.setPlaceholder('MetaWeblog登录名')
				.setValue(CacheUtil.getSettings().username)
				.onChange(async (value) => {
					CacheUtil.getSettings().username = value;
					await CacheUtil.saveSettings();
				}));
		new Setting(contentEl)
			.setName('password')
			.setDesc('MetaWeblog访问令牌')
			.addText(text => {
					text.setPlaceholder('MetaWeblog访问令牌')
						.setValue(CacheUtil.getSettings().password)
						.onChange(async (value) => {
							CacheUtil.getSettings().password = value;
							await CacheUtil.saveSettings();
						});

					text.inputEl.setAttribute('type', 'password')
				}
			);

		// 获取所有文章目录
		let all_dir = this.plugin.app.vault.getAllLoadedFiles().filter((file) => file instanceof TFolder);
		new Setting(contentEl)
			.setName('locationPosts')
			.setDesc('选择文章目录，同步文章时将只上传该目录下的文章')
			.setTooltip('同步文章目录, 默认是所有文章')
			.addDropdown(dropdown => {
				all_dir.forEach((dir) => {
					dropdown.addOption(dir.path, dir.path);
				})
				if (CacheUtil.getSettings().locationPosts === "" || CacheUtil.getSettings().locationPosts === undefined) {
					dropdown.setValue("/");
				} else {
					dropdown.setValue(CacheUtil.getSettings().locationPosts)

				}
				dropdown.onChange(async (value) => {
					CacheUtil.getSettings().locationPosts = value;
					await CacheUtil.saveSettings();
				})
			});

		new Setting(contentEl)
			.setName('throttlingMode')
			.setDesc('启用节流模式后，已上传的同名图片不会再上传，节省接口调用次数')
			.addToggle(toggle => toggle
				.setTooltip('启用节流模式后，已上传的同名图片不会再上传，节省接口调用次数')
				.setValue(CacheUtil.getSettings().throttlingMode)
				.onChange(async (value) => {
					CacheUtil.getSettings().throttlingMode = value;
					await CacheUtil.saveSettings();
				}));

		new Setting(contentEl)
			.setName('testLink')
			.setDesc('测试博客园MetaWeblog的链接是否可用')
			.addButton(button => button
				.setButtonText('测试')
				.onClick(async () => {
					if (!CacheUtil.getSettings().blogUrl || !CacheUtil.getSettings().username || !CacheUtil.getSettings().password) {
						new Notice('请先配置博客园MetaWeblog的链接、登录名、密码');
					} else {
						try {
							// 检测网络, 以及博客相关参数
							let blogs = await WeblogClient.getUsersBlogs()
							if (blogs[0].blogName === undefined) {
								new Notice("链接异常, 请检查网络及相关参数填写是否正确!")
								return
							}
							// 检测同步文件夹
							let sync_dir = this.app.vault.getAbstractFileByPath(CacheUtil.getSettings().locationPosts)
							if (sync_dir == null && CacheUtil.getSettings().locationPosts != "") {
								new Notice("文章同步目录不存在, 将按照默认设置进行同步!")
								return
							}
							new Notice("Hello, " + blogs[0].blogName + "!");
						} catch (e) {
							new Notice("链接异常, 请检查网络及相关参数填写是否正确!")
						}
					}
				})
			);

	}


}
