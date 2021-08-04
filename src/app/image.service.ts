import { Injectable } from '@angular/core';

@Injectable({
	providedIn: 'root'
})
export class ImageService {
	private _images: Record<string, HTMLImageElement> = {};

	constructor() { }

	register(name: string, url: string) {
		const img = new Image();
		img.src = url;
		this._images[name] = img;
	}

	getUrl(name: string) {
		return this._images[name].src;
	}
}
