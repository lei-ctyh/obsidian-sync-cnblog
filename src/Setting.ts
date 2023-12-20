import {App, PluginSettingTab, Setting} from "obsidian";
import SyncCnblogPlugin from "../main";

export interface SyncCnblogSettings {
	blog_url: string;
	blog_id: string;
	username: string;
	password: string;
	location_attachments: string;

}

export const DEFAULT_SETTINGS: SyncCnblogSettings = {
	blog_url: "https:/ /rpc.cnblogs.com/metaweblog/aaalei",
	blog_id: "aaalei",
	username: "2468341590@qq.com",
	password: "5529D103516E0289554BD76D87CBABC72811A92F37AEA3ABE3B8266D3A1B5F9",
	location_attachments: "./assets/${filename}"
}
export class SampleSettingTab extends PluginSettingTab {
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
				.setValue(this.plugin.settings.blog_url)
				.onChange(async (value) => {
					this.plugin.settings.blog_url = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('blog_id')
			.setDesc('博客园MetaWeblog访问地址后缀')
			.addText(text => text
				.setPlaceholder('请输入你的参数')
				.setValue(this.plugin.settings.blog_id)
				.onChange(async (value) => {
					this.plugin.settings.blog_id = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('username')
			.setDesc('MetaWeblog登录名')
			.addText(text => text
				.setPlaceholder('请输入你的参数')
				.setValue(this.plugin.settings.username)
				.onChange(async (value) => {
					this.plugin.settings.username = value;
					await this.plugin.saveSettings();
				}));
		new Setting(containerEl)
			.setName('password')
			.setDesc('MetaWeblog访问令牌')
			.addText(text => text
				.setPlaceholder('请输入你的参数')
				.setValue(this.plugin.settings.password)
				.onChange(async (value) => {
					this.plugin.settings.password = value;
					await this.plugin.saveSettings();
				}));
	}
}
