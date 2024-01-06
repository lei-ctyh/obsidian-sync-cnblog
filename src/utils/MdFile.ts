import SyncCnblogPlugin from "main";
import {arrayBufferToBase64, CachedMetadata, EmbedCache, getAllTags, TAbstractFile, TFile, TFolder} from "obsidian";
import {parseRespXml} from "./XmlUtil";
import WeblogClient from "./WeblogClient";
import {ApiType} from "../enum/ApiType";
import {Post} from "../model/structs/Post";

export async function getMdContent(file: TFile): Promise<string> {
	const {vault} = this.app;
	vault.getMarkdownFiles()
	return await vault.cachedRead(file);
}

export function findAllEmbeds(file: TFile): EmbedCache[] {
	const {metadataCache} = this.app;
	let {embeds}: CachedMetadata = metadataCache.getFileCache(file)
	if (embeds == undefined) {
		return [];
	}
	return embeds
}


/**
 * 查询文章涉及的所有标签
 * @param file md文件
 */
export function findKeywords(file: TFile): string {
	let tags: string[] | null;
	const {metadataCache} = this.app;
	const metadata: CachedMetadata = metadataCache.getFileCache(file)
	if (metadata == null) {
		tags = [];
	} else {
		tags = getAllTags(metadata);
	}
	let mt_keywords = "";
	if (tags) {
		tags.forEach(tag => {
			if (mt_keywords === "") {
				mt_keywords = tag.substring(1, tag.length)
			} else {
				mt_keywords = mt_keywords + "," + tag.substring(1, tag.length)
			}
		})
	}
	return mt_keywords
}

/**
 * 获取附件存储文件夹
 * @param file TFile 当前文件
 * @param location_attachments 参数设置中的存储路径格式
 * @returns TFolder 存储文件夹
 */
export function getAttachmentTFolder(file: TFile, location_attachments: string): TFolder {
	// 当前文件路径
	let parentFile = file.parent
	let folderPath = "/"
	if (parentFile) {
		// 父级文件夹路径
		let parentPath = parentFile.path
		let path = location_attachments.replace(".", parentPath)
		folderPath = path.replace("${filename}", file.basename)
	}
	return this.app.vault.getAbstractFileByPath(folderPath)
}

/**
 * 获取附件中的图片TFile对象
 * @param filepath 图片地址
 * @param abstractFile 附件TFolder对象
 * @returns TFile 图片TFile对象 | null 说明图片不存在
 */
export function getImgFromAttachmentFolder(filepath: string, abstractFile: TAbstractFile): TFile | null {
	// 图片地址需要进行URL解码
	filepath = decodeURIComponent(filepath);
	if (abstractFile instanceof TFile) {
		if (abstractFile.path.indexOf(filepath) > -1) {
			return abstractFile;
		}
	}

	if (abstractFile instanceof TFolder) {
		for (const child of abstractFile.children) {
			const rtnFile = getImgFromAttachmentFolder(filepath, child);
			if (rtnFile) {
				return rtnFile;
			}
		}
	}
	// 查询不到返回空
	return null;
}

export async function uploadImgs(embeds: EmbedCache[], attachmentFolder: TFolder, plugin: SyncCnblogPlugin): Promise<Map<string, string>[]> {
	let rtnImgs: Map<string, string>[] = [];

	// 批量处理
	const imgBatchPromises = embeds.map(async (embed) => {
		let img = getImgFromAttachmentFolder(embed.link, attachmentFolder);
		if (img != null) {
			let imgContent = await plugin.app.vault.readBinary(img);
			let respMag = await WeblogClient.newMediaObject(img.name, img.extension, arrayBufferToBase64(imgContent));
			if (respMag.indexOf("上传失败, Response status code does not indicate success: 403 (Forbidden).") > -1) {
				return;
			}
			let urlData = parseRespXml(ApiType.NEWMEDIAOBJECT, respMag);

			let map = new Map();
			map.set("link", embed.link);
			map.set("displayText", embed.displayText);
			map.set("original", embed.original);
			map.set("start_line", embed.position.start.line);
			map.set("start_col", embed.position.start.col);
			map.set("start_offset", embed.position.start.offset);
			map.set("end_line", embed.position.end.line);
			map.set("end_col", embed.position.end.col);
			map.set("end_offset", embed.position.end.offset);
			map.set("url", urlData.url);
			rtnImgs.push(map);
		}
	});
	// 使用 Promise.all 进行并行处理
	await Promise.all(imgBatchPromises);
	return rtnImgs;
}

/**
 * 将本地图片替换为网络图片
 * @param mdContent md内容
 * @param embeds 嵌入附件信息
 * @returns embeds
 */
export async function replaceImgLocalToNet(mdContent: string, embeds: Map<string, string>[]): Promise<string> {
	embeds.sort((a, b) => {
		return Number(b.get("start_offset")) - Number(a.get("start_offset"))
	})
	for (const embed of embeds) {
		let link = embed.get("link");
		let displayText = embed.get("displayText");
		let original = embed.get("original");
		let url = embed.get("url");
		let start_line = Number(embed.get("start_line"));
		let start_col = Number(embed.get("start_col"));
		let start_offset = Number(embed.get("start_offset"));
		let end_line = Number(embed.get("end_line"));
		let end_col = Number(embed.get("end_col"));
		let end_offset = Number(embed.get("end_offset"));
		// 文章倒叙替换图片地址
		let selectedContent = mdContent.substring(Number(start_offset), Number(end_offset));
		if (url != undefined) {
			selectedContent = selectedContent.replace(/\((.*?)\)/g, '(' + url + ')');
		}
		mdContent = mdContent.substring(0, start_offset) + selectedContent + mdContent.substring(end_offset);


	}
	return mdContent;
}


/**
 * 获取当前同名文章的postid
 * @param file  当前选中文件
 * @param md md内容
 * @param replaceMd 是否替换md内容
 */
export async function getThePost(file: TFile, md: string, replaceMd: boolean = true): Promise<Post> {
	let newPost = await getThePostByName(file.basename, md)
	newPost.title = file.basename;
	newPost.description = md;
	// 时间戳转日期 20231219T22:55:00
	let dateCreated = new Date(file.stat.ctime)
	let year = dateCreated.getFullYear();
	let month = dateCreated.getMonth() + 1;
	let date = dateCreated.getDate();
	let hours = dateCreated.getHours();
	let minutes = dateCreated.getMinutes();
	let seconds = dateCreated.getSeconds();
	//  时间格式 20240103T11:35:00  不足两位补0
	newPost.dateCreated = "" + year + (month < 10 ? "0" + month : month) + (date < 10 ? "0" + date : date) + "T" + (hours < 10 ? "0" + hours : hours) + ":" + (minutes < 10 ? "0" + minutes : minutes) + ":" + (seconds < 10 ? "0" + seconds : seconds);
	return newPost;
}

export async function getThePostByName(fileName: string, md: string, replaceMd: boolean = true): Promise<Post> {
	let respXml = await WeblogClient.getRecentPosts()
	if (respXml) {
		let posts = parseRespXml(ApiType.GETRECENTPOSTS, respXml)
		for (let i = 0; i < posts.length; i++) {
			let post = posts[i]
			if (post.title == fileName) {
				if (replaceMd) {
					post.description = md;
				}
				return post
			}
		}
	}
	return new Post();
}

/**
 * 上传文章  新增则新增文章, 修改则编辑文章
 * @param post 文章对象
 * @returns 文章链接
 */
export async function uploadPost(post: Post): Promise<string> {
	let resp: string;
	if (post.postid === undefined) {
		resp = await WeblogClient.newPost(post)
		if (resp.indexOf("faultString") <= 0) {
			return post.title + "上传文章成功"
		}
	} else {
		resp = await WeblogClient.editPost(post)
		if (resp.indexOf("faultString") <= 0) {
			return post.title + "上传文章成功"
		}
	}
	return "上传文章失败"
}


/**
 * 获取上传的图片
 * @param post 文章对象
 */
export function getUploadedImgs(post: Post): [string, string] [] {
	let md = post.description;
	if (md) {
		let imgs = md.match(/!\[.*?]\((.*?)\)/g);
		if (imgs) {
			let rtnImgs: [string, string][] = [];
			for (let i = 0; i < imgs.length; i++) {
				let img = imgs[i];
				// 获取第一个捕获组
				let matchArray = img.match(/\((.*?)\)/);
				if (matchArray && matchArray.length > 0) {
					let url = matchArray[1];
					let desc = matchArray[0];
					rtnImgs.push([desc, url]);
					return rtnImgs;
				}
			}
		}
	}
	return [["1", "1"], ["2", "2"]];
}
