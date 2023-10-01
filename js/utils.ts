export class CommentaryUtils {
	public createElementFromHTML(htmlString: string): HTMLElement {
		let div = document.createElement("div");
		div.innerHTML = htmlString.trim();

		// Change this to div.childNodes to support multiple top-level nodes.
		return <HTMLElement>div.firstChild;
	}

	public makeString(length: number) {
		let result = "";
		const characters =
			"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
		const charactersLength = characters.length;

		let counter = 0;
		while (counter < length) {
			result += characters.charAt(Math.floor(Math.random() * charactersLength));
			counter += 1;
		}

		return result;
	}

	public twoDigitDatePart(value: string | number) {
		return ("0" + value).slice(-2);
	}
}
