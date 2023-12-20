import {ApiType} from "src/enum/ApiType";
import {XmlParam} from "../model/XmlParam";

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

export function parseRespXml(respXml: string): XmlParam[] {
	const xmlDoc = new DOMParser().parseFromString(respXml, 'text/xml');
	// 根据generateReqXml生成逆向解析
	if (xmlDoc) {
		if (xmlDoc.querySelector("methodResponse")) {
			// @ts-ignore
			const params = xmlDoc.querySelector("methodResponse").querySelector("params");
			if (params) {
				const paramElements = params.querySelectorAll("param");
				const result: XmlParam[] = [];
				paramElements.forEach(paramElement => {
					// xmlDoc.querySelector("methodResponse").querySelector("params").querySelectorAll("param")[0]
					// @ts-ignore
					const type = paramElement.querySelector("value").children[0].tagName
					// @ts-ignore
					const value = paramElement.querySelector("value").children[0].innerHTML
					result.push(new XmlParam(type, value));
				});
				return result;
			}
		}
	}
	return []
}


