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
}
