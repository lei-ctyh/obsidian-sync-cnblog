import {TFile} from "obsidian";

export async function getMdContent(file: TFile): Promise<String> {
	const {vault} = this.app;
	vault.getMarkdownFiles()
	let mdContent = await vault.cachedRead(file).then()
	return mdContent;
}

export function findAllImg(mdContent: String): String[] {

	// 排除代码块中的图片地址
	let codePattern = /```.*?```/g
	let md = mdContent.replace(codePattern, "")
	// 排除网络图片地址
	// let netImgPattern = /!\[.*?\]\(.*?\)/g
	// md = md.replace(netImgPattern, "")

	// 获取所有本地图片地址 <img src="(.*?)

	let localImgPattern = /!\[.*?\]\(.*?\)/g
	let localImgs = md.match(localImgPattern)
	debugger
	if (localImgs) {
		return localImgs
	} else {
		return []
	}
}