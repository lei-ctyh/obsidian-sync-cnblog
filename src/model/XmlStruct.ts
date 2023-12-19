import {XmlMember} from "./XmlMember";

export class XmlStruct {
    private readonly members: XmlMember[];
    constructor(members: XmlMember[]) {
        this.members = members;
    }
    public toString(): string {
        return `<struct>${this.members.join('')}</struct>`;
    }

}
