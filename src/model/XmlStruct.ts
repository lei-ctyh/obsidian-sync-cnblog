import {XmlMember} from "./XmlMember";

export class XmlStruct {
    public readonly members: XmlMember[];
    constructor(members: XmlMember[]) {
        this.members = members;
    }
    public toString(): string {
        return `${this.members.join('')}`;
    }

}
