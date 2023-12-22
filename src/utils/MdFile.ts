import SyncCnblogPlugin from "main";
import {arrayBufferToBase64, TAbstractFile, TFile, TFolder} from "obsidian";
import {parseRespXml} from "./XmlUtil";
import WeblogClient from "./WeblogClient";
import {ApiType} from "../enum/ApiType";
import {Post} from "../model/structs/Post";

export async function getMdContent(file: TFile): Promise<string> {
	const {vault} = this.app;
	vault.getMarkdownFiles()
	return await vault.cachedRead(file);
}

export function findAllImg(mdContent: String): string[] {

	// 排除代码块中的图片地址
	let codePattern = /```.*?```/g
	let md = mdContent.replace(codePattern, "")
	// 排除网络图片地址
	// let netImgPattern = /!\[.*?\]\(.*?\)/g
	// md = md.replace(netImgPattern, "")

	// 获取所有本地图片地址 <img src="(.*?)

	let localImgPattern = /(?<=!\[.*]\()(.+)(?=\))/g
	let localImgs = md.match(localImgPattern)
	if (localImgs) {
		return localImgs
	} else {
		return []
	}
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
 */
export function getImgFromAttachmentFolder(filepath: string, abstractFile: TAbstractFile): any {
	if (abstractFile instanceof TFile) {
		if (abstractFile.path.indexOf(filepath) > -1) {
			return abstractFile
		}
	}

	if (abstractFile instanceof TFolder) {
		let children = abstractFile.children
		for (let i = 0; i < children.length; i++) {
			let child = children[i]
			let rtnFile = getImgFromAttachmentFolder(filepath, child);
			if (rtnFile) {
				return rtnFile
			}
		}
	}
	// 查询不到返回空
	return false;
}

export async function uploadImgs(imgPaths: string[], attachmentFolder: TFolder, plugin: SyncCnblogPlugin): Promise<Map<string, string>[]> {
	let rtnImgs: Map<string, string>[] = []
	for (let index in imgPaths) {
		let imgPath = imgPaths[index]
		let map = new Map()
		map.set("imgPath", imgPath)
		let img = getImgFromAttachmentFolder(imgPath, attachmentFolder);
		if (img) {
			// 等 then执行完再往下走
			let imgContent = await plugin.app.vault.readBinary(img)
			// 图片内容进行base64编码
			let respMag = await WeblogClient.newMediaObject(img.name, img.extension, arrayBufferToBase64(imgContent))
			let urlData = parseRespXml(ApiType.NEWMEDIAOBJECT, respMag)
			map.set("urlImgPath", urlData.url)
			rtnImgs.push(map)
			// 对文件内容进行base64编码
		}
	}
	return rtnImgs
}

/**
 * 将本地图片替换为网络图片
 * @param mdContent md内容
 * @param localAndNetImgs 本地图片和网络图片的映射关系
 * @returns 替换后的md内容
 */
export async function replaceImgLocalToNet(mdContent: string, localAndNetImgs: Map<string, string>[]): Promise<string> {
	for (let i = 0; i < localAndNetImgs.length; i++) {
		let map = localAndNetImgs[i]
		let imgPath = map.get("imgPath")
		let urlImgPath = map.get("urlImgPath")
		if (!imgPath || !urlImgPath) {
			continue
		}
		let imgPattern = new RegExp(imgPath, "g")
		mdContent = mdContent.replace(imgPattern, urlImgPath)
	}
	console.log(mdContent)
	return mdContent;
}


/**
 * 获取当前同名文章的postid
 * @param file  当前选中文件
 * @param md md内容
 */
export async function getThePost(file: TFile, md: string): Promise<Post> {
	let respXml = await WeblogClient.getRecentPosts()
	if (respXml) {
		let posts = parseRespXml(ApiType.GETRECENTPOSTS, respXml)
		for (let i = 0; i < posts.length; i++) {
			let post = posts[i]
			if (post.title == file.basename) {
				post.description = md;
				return post
			}
		}

	}
	let newPost = new Post();
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
	newPost.dateCreated =  ""+year + month + date + "T" + hours + minutes + seconds ;
	return newPost;
}

/**
 * 上传文章  新增则新增文章, 修改则编辑文章
 * @param post 文章对象
 * @returns 文章链接
 */
// export async function uploadPost(post: Post): Promise<string> {
// 	let respXml = await WeblogClient.newPost(post)
// 	if (respXml) {
// 		let postId = parseRespXml(ApiType.NEWPOST, respXml)
// 		return postId
// 	}
// 	return ""
// }
