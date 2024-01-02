import {App, PluginSettingTab, Setting} from "obsidian";
import SyncCnblogPlugin from "../main";
import CacheUtil from "./utils/CacheUtil";

export interface SyncCnblogSettings {
	blog_url: string;
	blog_id: string;
	username: string;
	password: string;
	location_attachments: string;

}

export const DEFAULT_SETTINGS: SyncCnblogSettings = {
	blog_url: "",
	// blog_id 这个参数暂时没有用到
	blog_id: "",
	username: "",
	password: "",
	location_attachments: "./assets/${filename}"
}
export class SyncCnblogSettingTab extends PluginSettingTab {
	plugin: SyncCnblogPlugin;

	constructor(app: App, plugin: SyncCnblogPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('blog_url')
			.setDesc('博客园MetaWeblog访问地址')
			.addText(text => text
				.setPlaceholder('请输入你的参数')
				.setValue(CacheUtil.getSettings().blog_url)
				.onChange(async (value) => {
					CacheUtil.getSettings().blog_url = value;
					await CacheUtil.saveSettings();
				}));

		/*new Setting(containerEl)
			.setName('blog_id')
			.setDesc('博客园MetaWeblog访问地址后缀')
			.addText(text => text
				.setPlaceholder('请输入你的参数')
				.setValue(CacheUtil.getSettings().blog_id)
				.onChange(async (value) => {
					CacheUtil.getSettings().blog_id = value;
					await CacheUtil.saveSettings();
				}));*/

		new Setting(containerEl)
			.setName('username')
			.setDesc('MetaWeblog登录名')
			.addText(text => text
				.setPlaceholder('请输入你的参数')
				.setValue(CacheUtil.getSettings().username)
				.onChange(async (value) => {
					CacheUtil.getSettings().username = value;
					await CacheUtil.saveSettings();
				}));
		new Setting(containerEl)
			.setName('password')
			.setDesc('MetaWeblog访问令牌')
			.addText(text => text
				.setPlaceholder('请输入你的参数')
				.setValue(CacheUtil.getSettings().password)
				.onChange(async (value) => {
					CacheUtil.getSettings().password = value;
					await CacheUtil.saveSettings();
				}));
	}
}
