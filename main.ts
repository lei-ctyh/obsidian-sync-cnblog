import {
	App,
	arrayBufferToBase64,
	Editor,
	MarkdownView,
	Modal,
	Notice,
	Plugin,
	PluginSettingTab,
	Setting,
	TFile,
	Vault,
} from 'obsidian';
import {DEFAULT_SETTINGS, SyncCnblogSettings, SampleSettingTab} from "./src/Setting";
import {findAllImg, getAttachmentTFolder, getImgFromAttachmentFolder, getMdContent, uploadImgs} from "./src/utils/MdFile";
import WeblogClient from "./src/utils/WeblogClient";
import {XmlParam} from "./src/model/XmlParam";


// Remember to rename these classes and interfaces!


export default class SyncCnblogPlugin extends Plugin {
	settings: SyncCnblogSettings;
	client: WeblogClient

	async onload() {
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
									new XmlParam("struct", "<member>\n" +
										"    <name>url</name>\n" +
										"    <value>\n" +
										"        <string>\n" +
										"            https://img2023.cnblogs.com/blog/2395785/202312/2395785-20231220180856469-304885348.png\n" +
										"        </string>\n" +
										"    </value>\n" +
										"</member>").getValue()
									debugger
									/*const content = await getMdContent(file)
									const imgPaths = findAllImg(content)
									let attachmentFolder = getAttachmentTFolder(file, this.settings.location_attachments)
									let urlImgs =await uploadImgs(imgPaths, attachmentFolder, this)*/
								});
						});
					}

				}

			}));


		await this.loadSettings();

		// 创建左侧图标, 点击时的响应事件
		this.addRibbonIcon('dice', 'Sample Plugin', (evt: MouseEvent) => {
			this.client.getUsersBlogs()
		});

		// 这添加了一个设置选项卡，以便用户可以配置插件的各个方面
		this.addSettingTab(new SampleSettingTab(this.app, this));
	}


	onunload() {
		// 卸载时说再见
		new Notice("Goodbye !")
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
		this.client = new WeblogClient(this.settings);
	}

	async saveSettings() {
		await this.saveData(this.settings);
		this.client = new WeblogClient(this.settings);
	}
}



