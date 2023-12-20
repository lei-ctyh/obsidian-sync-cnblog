import {XmlStruct} from "./XmlStruct";
import {XmlMember} from "./XmlMember";

export class XmlParam {
    private readonly type: string;
    private readonly value: string
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
			const xmlDoc = new DOMParser().parseFromString(this.value, 'text/xml');
			let memberEl = xmlDoc.getElementsByTagName('member')
			if (memberEl) {
				for (let i = 0; i < memberEl.length; i++) {
					const name = memberEl[i].getAttribute('name');
					const type = memberEl[i].getAttribute('type');
					const value = memberEl[i].getElementsByTagName('value')[0].innerHTML;
					this.value = new XmlMember(name, type, value);
				}
			}
		}else {
			return this.value;
		}
	}
}
