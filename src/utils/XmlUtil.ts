import {ApiType} from "src/enum/ApiType";
import {XmlParam} from "../model/XmlParam";
import BlogInfo from "../model/structs/BlogInfo";
import {UrlData} from "../model/structs/UrlData";
import {Post} from "../model/structs/Post";

export function parseXml(xmlDoc: Document): any {
    const result = {};
    const structElement = xmlDoc.querySelector("struct");
    if (structElement) {
        const members = structElement.querySelectorAll("member");
        members.forEach(member => {
            if (member) {
                // @ts-ignore
                const name = member.querySelector("name").textContent;
                const valueElement = member.querySelector("value");
                // @ts-ignore
                result[name] = valueElement.querySelector("*").textContent;
            }
        });
    }

    return result;
}

export function generateReqXml(apiType: ApiType, params: XmlParam[]): string {
    let xml = "" +
        "<?xml version=\"1.0\"?>\n" +
        "<methodCall>\n" +
        "    <methodName>" + apiType + "</methodName>\n" +
        "    <params>\n";
    for (let i = 0; i < params.length; i++) {
        xml += params[i].toString();
    }

    xml += "    </params>\n" +
        "</methodCall>";
    // console.log("请求报文：" + xml );
    return xml;
}

export function parseRespXml(apiType: ApiType, respXml: string): any {
    const xmlDoc = new DOMParser().parseFromString(respXml, 'text/xml');
    let rtnData;
    if (apiType === ApiType.GETUSERSBLOGS) {
        rtnData = []
        let structs = xmlDoc.querySelectorAll("struct")
        if (structs) {
            structs.forEach(struct => {
                let members = struct.querySelectorAll("member");
                let blogInfo = new BlogInfo()
                members.forEach(member => {
                    // @ts-ignore
                    let name = member.querySelector("name").textContent.trim();
                    // @ts-ignore
                    let value = member.querySelector("value").textContent.trim();
                    // @ts-ignore
                    blogInfo[name] = value;
                })

                rtnData.push(blogInfo)
            })
        }
    } else if (apiType === ApiType.NEWMEDIAOBJECT) {
        rtnData = new UrlData();
        // @ts-ignore
        let url = xmlDoc.querySelector("string").textContent;
        // @ts-ignore
        rtnData.url = url;
    } else if (apiType === ApiType.GETRECENTPOSTS) {
        rtnData = []
        let structs = xmlDoc.querySelectorAll("struct")
        if (structs) {
            structs.forEach(struct => {
                let members = struct.querySelectorAll("member");
                let post = new Post()
                members.forEach(member => {
                    // @ts-ignore
                    let name = member.querySelector("name").textContent.trim();
                    // @ts-ignore
                    let value = member.querySelector("value").textContent.trim();
                    // @ts-ignore
                    post[name] = value;
                })
                rtnData.push(post)
            })
        }
    } else if (apiType === ApiType.NEWPOST) {
        // 成功是文章ID,失败是错误信息
		// @ts-ignore
		rtnData = xmlDoc.querySelector("string").textContent.trim()
    }
    return rtnData;


}


