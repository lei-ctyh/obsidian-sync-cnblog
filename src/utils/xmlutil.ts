export function parseXml(xmlDoc: Document): any {
	const result = {};
	const structElement = xmlDoc.querySelector("struct");
	if (structElement) {
		const members = structElement.querySelectorAll("member");
		members.forEach(member => {
			if (member) {
				// @ts-ignore
				const name = member.querySelector("name").textContent;
				const valueElement = member.querySelector("value");
				// @ts-ignore
				const value = valueElement.querySelector("*").textContent; // assuming there is only one child element
				// @ts-ignore
				result[name] = value;
			}
		});
	}

	return result;
}
