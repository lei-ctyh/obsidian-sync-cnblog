import {XmlStruct} from "../XmlStruct";
import {Enclosure} from "./Enclosure";
import {Source} from "./Source";

export class Post  {
	public dateCreated : string
	/**
	 * 文章内容
	 */
	public description : string
	public title : string
	public categories : string[]
	public enclosure : Enclosure
	public link : string
	public permalink : string
	public postid : string
	public source : Source
	public userid : string
	public mt_allow_comments : string
	public mt_allow_pings : string
	public mt_convert_breaks : string
	public mt_text_more : string
	public mt_excerpt : string
	public mt_keywords : string
	public wp_slug : string


}
