import { MinesweeperService } from './../minesweeper.service';
import { Component, Input, OnInit } from '@angular/core';
import { MapInfo } from './../types';

@Component({
	selector: 'app-square-grid',
	templateUrl: './square-grid.component.html',
	styleUrls: ['./square-grid.component.scss']
})
export class SquareGridComponent implements OnInit {

	private _mapSize: { width: number; height: number; } | null = null;
	positions: {x: number, y: number}[] | null = null;
	style: Record<string, any> = {};

	@Input()
	set mapSize(val: any) {
		this._mapSize = val;
		if (!this.mapSize) {
			throw new Error("mapSize not set");
		}
		this.style = {
			"grid-template-columns": `repeat(${this.mapSize?.width}, 1fr)`
		};
		// fill with numbers from 0 to mapSize
		this.positions =
			Array(this.mapSize.height).fill(0).map((_, y) => (
				Array(this.mapSize?.width).fill(0).map((_, x) => ({
					x, y
				}))
				// substitute for .flat(), because it doesn't exist, i guess
			)).reduce((acc, item) => acc.concat(item), []);
	}

	get mapSize() { return this._mapSize; }

	constructor(
	) {
	}

	ngOnInit(): void {
	}

}
