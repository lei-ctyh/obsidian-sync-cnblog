import {XmlStruct} from "./XmlStruct";
import {XmlMember} from "./XmlMember";

export class XmlParam {
    public readonly type: string;
    public readonly value: string
    constructor(type: string, value: string) {
        this.type = type;
        this.value = value;
    }
    public toString(): string {
        return `<param><value><${this.type}>${this.value}</${this.type}></value></param>`;
    }

	public getType(): string {
		return this.type;
	}
	public getValue(): any {
		if (this.type ==='struct') {
			let members: XmlMember[] = [];
			const xmlDoc = new DOMParser().parseFromString(this.value, 'text/xml');
			let memberEl = xmlDoc.getElementsByTagName('member')
			if (memberEl) {
				for (let i = 0; i < memberEl.length; i++) {
					const name =   memberEl[i].getElementsByTagName("name")[0].textContent
					const type =   memberEl[i].getElementsByTagName("value")[0].children[0].tagName
					const value = memberEl[i].getElementsByTagName("value")[0].children[0].textContent
					members.push(new XmlMember(name ?name:'', type?type:'', (value?value:'').trim()));
				}
				return new XmlStruct(members);
			}
		}else {
			return this.value;
		}
	}
}
