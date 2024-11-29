import {App, Notice, PluginSettingTab, Setting, TFolder} from "obsidian";
import SyncCnblogPlugin from "../main";
import CacheUtil from "./utils/CacheUtil";
import WeblogClient from "./utils/WeblogClient";

export interface SyncCnblogSettings {
	blog_url: string;
	blog_id: string;
	username: string;
	password: string;
	// 需要同步的文章目录, 默认是所有文章
	location_posts: string;
	throttling_mode: boolean;
}

export const DEFAULT_SETTINGS: SyncCnblogSettings = {
	blog_url: "",
	// blog_id 链接成功可以回写，暂时没用到
	blog_id: "",
	username: "",
	password: "",
	// 需要同步的文章目录, 默认是所有文章, 路径/子路径
	location_posts: "/",
	throttling_mode: true,
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
			.setName('blog_url')
			.setDesc('MetaWeblog访问地址')
			.addText(text => text
				.setPlaceholder('MetaWeblog访问地址')
				.setValue(CacheUtil.getSettings().blog_url)
				.onChange(async (value) => {
					CacheUtil.getSettings().blog_url = value;
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
			.setName('location_posts')
			.setDesc('选择文章目录，同步文章时将只上传该目录下的文章')
			.setTooltip('同步文章目录, 默认是所有文章')
			.addDropdown(dropdown => {
				dropdown.selectEl.style.width = "165px";
				all_dir.forEach((dir) => {
					dropdown.addOption(dir.path, dir.path);
				})
				if (CacheUtil.getSettings().location_posts === "" || CacheUtil.getSettings().location_posts === undefined) {
					dropdown.setValue("/");
				} else {
					dropdown.setValue(CacheUtil.getSettings().location_posts)

				}
				dropdown.onChange(async (value) => {
					CacheUtil.getSettings().location_posts = value;
					await CacheUtil.saveSettings();
				})
			});

		new Setting(contentEl)
			.setName('throttling_mode')
			.setDesc('启用节流模式后，已上传的同名图片不会再上传，节省接口调用次数')
			.addToggle(toggle => toggle
				.setTooltip('启用节流模式后，已上传的同名图片不会再上传，节省接口调用次数')
				.setValue(CacheUtil.getSettings().throttling_mode)
				.onChange(async (value) => {
					CacheUtil.getSettings().throttling_mode = value;
					await CacheUtil.saveSettings();
				}));

		new Setting(contentEl)
			.setName('测试链接')
			.setDesc('测试博客园MetaWeblog的链接是否可用')
			.addButton(button => button
				.setButtonText('测试')
				.onClick(async () => {
					if (!CacheUtil.getSettings().blog_url || !CacheUtil.getSettings().username || !CacheUtil.getSettings().password) {
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
							let sync_dir = this.app.vault.getAbstractFileByPath(CacheUtil.getSettings().location_posts)
							if (sync_dir == null && CacheUtil.getSettings().location_posts != "") {
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
