import {XmlParam} from "./XmlParam";

export class XmlMember {
    private readonly name: string;
    private readonly type: string;
    private readonly value: string;
    constructor(name: string, type: string, value: string) {
        this.name = name;
        this.type = type;
        this.value = value;
    }
    public toString(): string {
        return `<member><name>${this.name}</name><value><${this.type}>${this.value}</${this.type}></value></member>`;
    }
}
