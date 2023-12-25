import {XmlMember} from "../XmlMember";

export class FileData {
	public bits: string;
	public name: string;
	public type: string;

	public toReqXml(): string {
		let members: XmlMember[] = [];
		if (this.bits) {
			members.push(new XmlMember('bits','base64', this.bits));
		}
		if (this.name) {
			members.push(new XmlMember('name','string', this.name));
		}
		if (this.type) {
			members.push(new XmlMember('type','string', this.type));
		}
		return `${members.join('')}`;
	}
}
