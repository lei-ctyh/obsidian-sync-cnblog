import {Enclosure} from "./Enclosure";
import {Source} from "./Source";
import {XmlMember} from "../XmlMember";

export class Post {
    public dateCreated: string
    /**
     * 文章内容
     */
    public description: string
    public title: string
    public categories: string[]
    public enclosure: Enclosure
    public link: string
    public permalink: string
    public postid: string
    public source: Source
    public userid: string
    public mt_allow_comments: string
    public mt_allow_pings: string
    public mt_convert_breaks: string
    public mt_text_more: string
    public mt_excerpt: string
    // 标签  不同标签逗号分割
    public mt_keywords: string
    public wp_slug: string

    public toReqXml(): string {
        let rtnXml = "";
        let members: XmlMember[] = [];
        if (this.description) {
            members.push(new XmlMember('description', 'string', "<![CDATA[" + this.description + "]]>"));
        }
        if (this.title) {
            members.push(new XmlMember('title', 'string', this.title));
        }
        if (this.mt_keywords) {
            members.push(new XmlMember('mt_keywords', 'string', this.mt_keywords));
        }
        if (this.dateCreated) {
            members.push(new XmlMember('dateCreated', 'dateTime.iso8601', this.dateCreated));
        }
        rtnXml += `${members.join('')}`;
        // 文章分类默认markdown暂时, todo 后期可优化
        // if (this.categories) {
        rtnXml += "<member><name>categories</name><value><array><data><value><string>[Markdown]</string></value></data></array></value></member>"
        // }
        return rtnXml

    }


}
