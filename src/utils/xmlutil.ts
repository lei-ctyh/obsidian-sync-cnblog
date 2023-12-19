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
    console.log(xml);
    return xml;
}


