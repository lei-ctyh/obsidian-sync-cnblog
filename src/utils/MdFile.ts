import SyncCnblogPlugin from "main";
import {arrayBufferToBase64, TAbstractFile, TFile, TFolder} from "obsidian";
import {parseRespXml} from "./XmlUtil";

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
            let respMag = await plugin.client.newMediaObject(img.name, img.extension, arrayBufferToBase64(imgContent))
            let params = parseRespXml(respMag)
            map.set("urlImgPath", params[0].getValue().members[0].value)
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
    debugger
    for (let i = 0; i < localAndNetImgs.length; i++) {
        let map = localAndNetImgs[i]
        let imgPath = map.get("imgPath")
        let urlImgPath = map.get("urlImgPath")
        if (!imgPath ||!urlImgPath) {
            continue
        }
        let imgPattern = new RegExp(imgPath, "g")
        mdContent = mdContent.replace(imgPattern, urlImgPath)
    }
    console.log(mdContent)
    return mdContent;
}
