import {SyncCnblogSettings} from "../Setting";
import {Notice, request, RequestUrlParam} from "obsidian";
import {generateReqXml, parseXml} from "./XmlUtil";
import {ApiType} from "../enum/ApiType";
import {XmlParam} from "../model/XmlParam";
import {XmlStruct} from "../model/XmlStruct";
import {XmlMember} from "../model/XmlMember";
import CacheUtil from "./CacheUtil";


export default class WeblogClient {
	private static instance: WeblogClient;
	private constructor() {
	}
	public static getInstance(): WeblogClient {
		if (WeblogClient.instance == null) {
			WeblogClient.instance = new WeblogClient();
		}
		return WeblogClient.instance;
	}



	/**
	 * 获取用户的博客信息
	 * 主要用于检测用户输入的参数是否正确
	 */
	public getUsersBlogs(): void {
		const params = [
			new XmlParam("string", ""),
			new XmlParam("string",CacheUtil.getSettingData().username),
			new XmlParam("string",CacheUtil.getSettingData().password),
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
			new XmlParam("string",CacheUtil.getSettingData().username),
			new XmlParam("string",CacheUtil.getSettingData().password),
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
			new XmlParam("string",CacheUtil.getSettingData().username),
			new XmlParam("string",CacheUtil.getSettingData().password),
			new XmlParam("struct", struct.toString())
		]
		return this.sendRequest(ApiType.NEWMEDIAOBJECT,params);
	}

	private sendRequest(apiType: ApiType, params: XmlParam[]): Promise<string>{
		console.log("请求类型: " + apiType)
		const requestUrlParam: RequestUrlParam = {
			contentType: 'application/xml',
			method: 'POST',
			url: CacheUtil.getSettingData().blog_url,
			body: generateReqXml(apiType, params)
		}
		return request(requestUrlParam)
	}

	public deletePost(postId: string): Promise<string> {
		const params = [
			new XmlParam("string", ""),
			new XmlParam("string",CacheUtil.getSettingData().username),
			new XmlParam("string",CacheUtil.getSettingData().password),
			new XmlParam("string", postId)
		]
		return this.sendRequest(ApiType.DELETEPOST,params);
	}

	public getRecentPosts(): Promise<string> {
		const params = [
			new XmlParam("string", ""),
			new XmlParam("string", CacheUtil.getSettingData().username),
			new XmlParam("string", CacheUtil.getSettingData().password),
			new XmlParam("string", "10"),
			new XmlParam("i4", "1000")
		]
		return new Promise(string => {});
	}

}

