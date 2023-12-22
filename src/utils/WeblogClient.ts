import {request, RequestUrlParam} from "obsidian";
import {generateReqXml, parseRespXml} from "./XmlUtil";
import {ApiType} from "../enum/ApiType";
import {XmlParam} from "../model/XmlParam";
import {XmlStruct} from "../model/XmlStruct";
import {XmlMember} from "../model/XmlMember";
import CacheUtil from "./CacheUtil";
import BlogInfo from "../model/structs/BlogInfo";
import {FileData} from "../model/structs/FileData";
import {Post} from "../model/structs/Post";


export default class WeblogClient {
	/**
	 * 获取用户的博客信息
	 * 主要用于检测用户输入的参数是否正确
	 */
	public static async getUsersBlogs(): Promise<BlogInfo[]> {
		const params = [
			new XmlParam("string", ""),
			new XmlParam("string", CacheUtil.getSettings().username),
			new XmlParam("string", CacheUtil.getSettings().password),
		]
		let respXml = await this.sendRequest(ApiType.GETUSERSBLOGS, params)
		return parseRespXml(ApiType.GETUSERSBLOGS, respXml);
	}

	public static getCategories(): void {
		const params = [
			new XmlParam("string", ""),
			new XmlParam("string", CacheUtil.getSettings().username),
			new XmlParam("string", CacheUtil.getSettings().password),
		]
		this.sendRequest(ApiType.GETCATEGORIES, params).then(res => {
			const xml = new DOMParser().parseFromString(res, 'text/xml');
			console.log(xml)

		})
	}

	public static newMediaObject(name: string, type: string, base64Img: string): Promise<string> {
		let fileData = new FileData();
		fileData.bits = base64Img;
		fileData.name = name;
		fileData.type = type;

		const params = [
			new XmlParam("string", ""),
			new XmlParam("string", CacheUtil.getSettings().username),
			new XmlParam("string", CacheUtil.getSettings().password),
			new XmlParam("struct", fileData.toReqXml())
		]
		return this.sendRequest(ApiType.NEWMEDIAOBJECT, params);
	}


	public static getRecentPosts(): Promise<string> {
		const params = [
			new XmlParam("string", ""),
			new XmlParam("string", CacheUtil.getSettings().username),
			new XmlParam("string", CacheUtil.getSettings().password),
			new XmlParam("i4", "1000")
		]
		return this.sendRequest(ApiType.GETRECENTPOSTS, params);
	}

	public static async getPost(postId: string): Promise<Post> {
		const params = [
			new XmlParam("string", ""),
			new XmlParam("string", CacheUtil.getSettings().username),
			new XmlParam("string", CacheUtil.getSettings().password),
			new XmlParam("string", postId)
		]
		let respXml = await this.sendRequest(ApiType.GETPOST, params)
		return parseRespXml(ApiType.GETPOST, respXml);
	}


	private static sendRequest(apiType: ApiType, params: XmlParam[]): Promise<string> {
		console.log("请求类型: " + apiType)
		const requestUrlParam: RequestUrlParam = {
			contentType: 'application/xml',
			method: 'POST',
			url: CacheUtil.getSettings().blog_url,
			body: generateReqXml(apiType, params)
		}
		return request(requestUrlParam)
	}

}

