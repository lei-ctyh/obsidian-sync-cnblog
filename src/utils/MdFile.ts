import SyncCnblogPlugin from "src/main";
import {arrayBufferToBase64, CachedMetadata, EmbedCache, getAllTags, normalizePath, TFile} from "obsidian";
import {parseRespXml} from "./XmlUtil";
import WeblogClient from "./WeblogClient";
import {ApiType} from "../enum/ApiType";
import {Post} from "../model/structs/Post";
import CacheUtil from "./CacheUtil";

export async function getMdContent(file: TFile): Promise<string> {
	const {vault} = this.app;
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
 * 获取附件中的图片TFile对象
 * @param embed embed.link是md文件中的图片链接
 * @param file md文件
 * @returns TFile 图片TFile对象 | null 说明图片不存在
 */
export function getImg(embed: EmbedCache, file: TFile): TFile | null {
	// 当前路径
	let currentPath = file.parent
	let imgLink = embed.link;
	while (imgLink.startsWith("../")) {
		if (currentPath != null) {
			currentPath = currentPath.parent;
			imgLink = imgLink.substring(3);
		}
	}
	// 去掉./
	if (imgLink.startsWith("./")) {
		imgLink = imgLink.substring(2);
	}
	// 父级路径找
	if (currentPath != null) {
		let searchFile = file.vault.getAbstractFileByPath(normalizePath(currentPath.path + "/" + imgLink));
		if (searchFile != null && searchFile instanceof TFile) {
			return searchFile;
		}
	}
	// 找不到开启全局搜索
	let allFiles = file.vault.getAllLoadedFiles();
	for (let i = 0; i < allFiles.length; i++) {
		let searchFile = allFiles[i];
		if (searchFile instanceof TFile) {
			if (searchFile.path.endsWith(imgLink)) {
				return searchFile;
			}
		}

	}
	return null;
}

export async function uploadImgs(embeds: EmbedCache[], uploadImgs: [string, string] [], file: TFile, plugin: SyncCnblogPlugin): Promise<Map<string, string>[]> {
	let rtnImgs: Map<string, string>[] = [];
	// 批量处理
	const imgBatchPromises = embeds.map(async (embed) => {
		let img = getImg(embed, file);

		if (img != null) {
			/**
			 * 逻辑解释
			 * 如果 网络的图片描述中存在当前嵌入图片的实际连接,
			 * 则直接使用网络图片地址作为本图片的链接
			 */
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
			if (embed.link.endsWith(".jpg") || embed.link.endsWith(".png")
				|| embed.link.endsWith(".svg") || embed.link.endsWith(".gif")
				|| embed.link.endsWith(".webp")) {

				let isUpload = false
				uploadImgs.forEach((img) => {
					let netAltText = img[0]
					let netImgUrl = img[1]
					if (netAltText == embed.link) {
						map.set("url", netImgUrl);
						isUpload = true
					}
				})

				if (!isUpload) {
					let imgContent = await plugin.app.vault.readBinary(img);
					let respMag = await WeblogClient.newMediaObject(img.name, img.extension, arrayBufferToBase64(imgContent));
					if (respMag.indexOf("失败") > -1) {
						return;
					}
					let urlData = parseRespXml(ApiType.NEWMEDIAOBJECT, respMag);
					map.set("url", urlData.url);
				}
			} else {
				// 不支持展示的附件
				map.set("url", "不支持展示的附件");
			}

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
		let link = String(embed.get("link"));
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
			if (url != "不支持展示的附件") {
				// 替换描述
				selectedContent = selectedContent.replace(/!\[.*?]/g, "![" + link + "]");
				selectedContent = selectedContent.replace(/\((.*?)\)/g, '(' + url + ')');
			} else {
				selectedContent = "";
			}
		}
		mdContent = mdContent.substring(0, start_offset) + selectedContent + mdContent.substring(end_offset);


	}
	return mdContent;
}


/**
 * 获取当前同名文章的postid
 * @param file  当前选中文件
 */
export async function getThePost(file: TFile): Promise<Post> {
	let newPost = await getThePostByName(file.basename)
	newPost.title = file.basename;
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

export async function getThePostByName(fileName: string): Promise<Post> {
	let respXml = await WeblogClient.getRecentPosts()
	if (respXml) {
		let posts = parseRespXml(ApiType.GETRECENTPOSTS, respXml)
		for (let i = 0; i < posts.length; i++) {
			let post = posts[i]
			if (post.title == fileName) {
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
	let userId = CacheUtil.getSettings().blog_url.substring(CacheUtil.getSettings().blog_url.lastIndexOf("/"));

	if (post.postid === undefined) {
		resp = await WeblogClient.newPost(post)
		let respStr = parseRespXml(ApiType.NEWPOST, resp)
		if (resp.indexOf("faultString") <= 0) {
			await navigator.clipboard.writeText(normalizePath("https://www.cnblogs.com/" + userId + "/p/" + respStr));
			return post.title + "上传文章成功, 博文链接已复制到剪切板"
		} else {
			return "上传文章失败, 错误原因为" + respStr
		}
	} else {
		resp = await WeblogClient.editPost(post)
		if (resp.indexOf("faultString") <= 0) {
			await navigator.clipboard.writeText(normalizePath("https://www.cnblogs.com/" + userId + "/p/" + post.postid));
			return post.title + "文章更新成功, 博文链接已复制到剪切板"
		}
	}
	return "上传文章失败"
}


/**
 * 获取上传的图片,
 * 当前操作仅在节流模式下执行
 * @param post 文章对象
 */
export function getUploadedImgs(post: Post): [string, string] [] {
	let md = post.description;
	let rtnImgs: [string, string][] = [];
	if (md && CacheUtil.getSettings().throttling_mode) {
		let imgs = md.match(/!\[(.*?)\]\((.*?)\)/g);
		if (imgs) {
			for (let i = 0; i < imgs.length; i++) {
				let img = imgs[i];
				// 获取第一个捕获组
				let matchArray = img.match(/!\[(.*?)\]\((.*?)\)/);
				if (matchArray && matchArray.length > 0) {
					let netAltText = matchArray[1];
					let netImgUrl = matchArray[2];
					rtnImgs.push([netAltText, netImgUrl]);
				}
			}
		}
	}
	return rtnImgs;
}
