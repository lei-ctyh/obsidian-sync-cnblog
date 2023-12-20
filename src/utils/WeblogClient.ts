import {SyncCnblogSettings} from "../Setting";
import {Notice, request, RequestUrlParam} from "obsidian";
import {generateReqXml, parseXml} from "./XmlUtil";
import {ApiType} from "../enum/ApiType";
import {XmlParam} from "../model/XmlParam";
import {XmlStruct} from "../model/XmlStruct";
import {XmlMember} from "../model/XmlMember";


export default class WeblogClient {
	private settings: SyncCnblogSettings;

	constructor(settings: SyncCnblogSettings) {
		this.settings = settings;
	}

	/**
	 * 获取用户的博客信息
	 * 主要用于检测用户输入的参数是否正确
	 */
	public getUsersBlogs(): void {
		const params = [
			new XmlParam("string", ""),
			new XmlParam("string",this.settings.username),
			new XmlParam("string",this.settings.password),
		]
		this.sendRequest(ApiType.GETUSERSBLOGS,params).then(res => {
			console.log("响应结果: " + res )
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

	public getCategories(): void {
		const params = [
			new XmlParam("string", ""),
			new XmlParam("string",this.settings.username),
			new XmlParam("string",this.settings.password),
		]
		this.sendRequest(ApiType.GETCATEGORIES,params).then(res => {
			const xml = new DOMParser().parseFromString(res, 'text/xml');
			console.log(xml)

		})
	}

	public newMediaObject(name: string,type: string,base64Img: string): Promise<string> {

		let struct = new XmlStruct([
			new XmlMember("name", "string", name),
			new XmlMember("type", "string", type),
			new XmlMember("bits", "base64", base64Img),
		]);
		const params = [
			new XmlParam("string", ""),
			new XmlParam("string",this.settings.username),
			new XmlParam("string",this.settings.password),
			new XmlParam("struct", struct.toString())
		]
		return this.sendRequest(ApiType.NEWMEDIAOBJECT,params);
	}



	private sendRequest(apiType: ApiType, params: XmlParam[]): Promise<string>{
		console.log("请求类型: " + apiType)
		const requestUrlParam: RequestUrlParam = {
			contentType: 'application/xml',
			method: 'POST',
			url: this.settings.blog_url,
			body: generateReqXml(apiType, params)
		}
		return request(requestUrlParam)
	}
}

