import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';


// Remember to rename these classes and interfaces!

interface SyncCnblogSettings {
	blog_url: string;
	blog_id: string;
	username: string;
	password: string;

}

const DEFAULT_SETTINGS: SyncCnblogSettings = {
	blog_url: "https:/ /rpc.cnblogs.com/metaweblog/aaalei",
	blog_id: "aaalei",
	username: "2468341590@qq.com",
	password: "5529D103516E0289554BD76D87CBABC72811A92F37AEA3ABE3B8266D3A1B5F9"
}

export default class SyncCnblogPlugin extends Plugin {
	settings: SyncCnblogSettings;

	async onload() {
		// 添加指令到ctrl+p的控制面板
		this.addCommand({
			id: "sync_cnblog",
			name: "sync_cnblog",
			callback: () => {
				console.log("嗨你好!!");
			},
		});

		// 注册指令到右键的文件菜单
		this.registerEvent(
			this.app.workspace.on("file-menu", (menu, file) => {
				menu.addItem((item) => {
					item
						.setTitle("同步到博客园")
						.setIcon("upload")
						.onClick(async () => {
							
							
							ajax(
								{
									method: 'GET',
									url: file.vault.adapter.getBasePath()+"/" +file.path,
									success: function(data){
										//请求成功后执行该函数
										console.log(data)//tom
									}
									
								}
							)
							new Notice( file.vault.adapter.getBasePath()+"/" +file.path);
							console.log(file.vault.adapter.getBasePath()+"/" +file.path)
						});
				});
			}))

		await this.loadSettings();

		// 创建左侧图标, 点击时的响应事件
		const ribbonIconEl = this.addRibbonIcon('dice', 'Sample Plugin', (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			new Notice('Hello World!');
		});



		// 这添加了一个设置选项卡，以便用户可以配置插件的各个方面
		this.addSettingTab(new SampleSettingTab(this.app, this));
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}


class SampleSettingTab extends PluginSettingTab {
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
