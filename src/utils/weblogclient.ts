import {SyncCnblogSettings} from "../setting";
import {Notice, request, RequestUrlParam} from "obsidian";
import {parseXml} from "./xmlutil";


export default class WeblogClient {
	private settings: SyncCnblogSettings;

	constructor(settings: SyncCnblogSettings) {
		this.settings = settings;
	}

	public getUsersBlogs(): void {
		const requestUrlParam: RequestUrlParam = {
			contentType: 'application/xml',
			method: 'POST',
			url: 'https://rpc.cnblogs.com/metaweblog/aaalei',
			body: '<?xml version="1.0"?>\r\n<methodCall>\r\n  <methodName>blogger.getUsersBlogs</methodName>\r\n  <params>\r\n    <param>\r\n        <value><string></string></value>\r\n    </param>\r\n    <param>\r\n        <value><string>2468341590@qq.com</string></value>\r\n    </param>\r\n    <param>\r\n        <value><string>95529D103516E0289554BD76D87CBABC72811A92F37AEA3ABE3B8266D3A1B5F9</string></value>\r\n    </param>\r\n  </params>\r\n</methodCall>\r\n'
		}
		request(requestUrlParam).then(res => {
			const xml = new DOMParser().parseFromString(res, 'text/xml');
			const result = parseXml(xml)
			if (result.faultString != undefined) {
				new Notice("链接博客园失败, 请检查用户名与访问令牌是否正确")
			} else {
				new Notice(`链接博客园成功，博客id:${result.blogid}，博客名:${result.blogName}，博客地址:${result.url};`)
			}
		}).catch(err => {
			new Notice("链接博客园异常: " + err)
		})
	}

	// blogger.deletePost
	// blogger.getUsersBlogs
	// metaWeblog.editPost
	// metaWeblog.getCategories
	// metaWeblog.getPost
	// metaWeblog.getRecentPosts
	// metaWeblog.newMediaObject
	// metaWeblog.newPost
	// wp.newCategory

}

