
import { XmlMember } from "./XmlMember";
import { XmlParam } from "./XmlParam";
import { XmlStruct } from "./XmlStruct";

class XmlArray {
    public data: XmlStruct[];
	constructor(data: XmlStruct[]) {
        this.data = data;
    }
	public toString(): string {
        let result = "";
        for (let i = 0; i < this.data.length; i++) {
            result += this.data[i].toString();
        }
        return result;
    }
}
