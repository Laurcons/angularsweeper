import { Injectable } from '@angular/core';
import { Cell, CellInfo, MapInfo } from './types';
import { create as createRandom } from "random-seed";
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
	providedIn: 'root'
})
export class MinesweeperService {

	private _map: Cell[];
	private _mapWidth: number;
	private _mapLength: number;
	private _mapHeight: number;
	private _bombs: number;
	private _seed: string | undefined;
	private _firstCell = false;

	private _status: "won" | "lost" | "notGenerated" | "playing" = "notGenerated";

	private _mapGeneratedSource = new Subject();
	public mapGenerated$ = this._mapGeneratedSource.asObservable();
	private _winStateSource = new Subject<"won" | "lost">();
	public winState$ = this._winStateSource.asObservable();
	private _flagCountSource = new BehaviorSubject<number>(0);
	public flagCount$ = this._flagCountSource.asObservable();

	private _cellSources: BehaviorSubject<Cell>[] = [];

	getCellObservable(x: number, y: number) {
		let pos = y * this._mapWidth + x;
		return this._cellSources[pos].asObservable();
	}

	constructor() {
		this._map = [];
		this._mapWidth = 0;
		this._mapLength = 0;
		this._mapHeight = 0;
		this._bombs = 0;
		this._seed = "";
		this._status = "notGenerated";
	}

	private generateMapInternal(options: {
		mapSize: { width: number; height: number; };
		bombs: number;
		seed?: string;
	}) {
		const arrayLength = options.mapSize.width * options.mapSize.height;
		this._map = Array(arrayLength).fill(0).map(() => ({
			value: 0,
			isFlagged: false,
			isUncovered: false
		}));
		// place bombs
		for (let i = 0; i < options.bombs; i++) {
			this._map[i].value = "bomb";
		}
		// shuffle map
		const rand = createRandom(options.seed);
		for (let i = 0; i < this._mapLength; i++) {
			const randomPos = Math.floor(rand.random() * this._mapLength);
			const temp = this._map[i];
			this._map[i] = this._map[randomPos];
			this._map[randomPos] = temp;
		}
		// place numbers
		for (let y = 0; y < this._mapLength / this._mapWidth; y++) {
			for (let x = 0; x < this._mapWidth; x++) {
				const cell = this.getCellAt(x, y);
				if (cell.value === "bomb")
					continue;
				let count = 0;
				const countBomb = (x: number, y: number) => {
					count += (this._map[y * this._mapWidth + x].value === "bomb") ? 1 : 0;
				};
				if (y > 0) {
					// if below top row
					countBomb(x, y - 1);
					if (x > 0) {
						// if away from left wall
						countBomb(x - 1, y - 1);
					}
					if (x < this._mapWidth - 1) {
						// if away from right wall
						countBomb(x + 1, y - 1);
					}
				}
				if (x > 0) {
					// if away from left wall
					countBomb(x - 1, y);
				}
				if (x < this._mapWidth - 1) {
					// if away from right wall
					countBomb(x + 1, y);
				}
				if (y < this._mapHeight - 1) {
					// if above bottom row
					countBomb(x, y + 1);
					if (x > 0) {
						// if away from left wall
						countBomb(x - 1, y + 1);
					}
					if (x < this._mapWidth - 1) {
						// if away from right wall
						countBomb(x + 1, y + 1);
					}
				}
				cell.value = count;
			}
		}
	}

	generateMap(options: {
		mapSize: { width: number; height: number; };
		bombs: number;
		seed?: string;
	}) {
		// initialize the array
		const arrayLength = options.mapSize.width * options.mapSize.height;
		this._map = Array(arrayLength).fill(0).map(() => ({
			value: 0,
			isFlagged: false,
			isUncovered: false
		}));
		this._mapWidth = options.mapSize.width;
		this._mapHeight = options.mapSize.height;
		this._mapLength = arrayLength;
		this._bombs = options.bombs;
		this._firstCell = true;
		this._seed = options.seed;
		this._status = "playing";
		this._flagCountSource.next(0);
		// generate cell observables
		this._cellSources = Array(arrayLength).fill(0).map((_, idx) => new BehaviorSubject(this._map[idx]));
		// done!
		this._mapGeneratedSource.next();
		// console.table(this._map);
	}

	private xyToLinear(x: number, y: number) {
		return y * this._mapWidth + x;
	}
	private linearToXy(pos: number) {
		return {
			x: Math.floor(pos / this._mapWidth),
			y: pos % this._mapWidth
		};
	}

	private checkWonLost() {
		// check if all nonbomb squares are uncovered
		const won = this._map.every(cell =>
			cell.value !== "bomb" ?
				(cell.isUncovered) :
				// cell.isFlagged
				true // do not require flagging of bombs
		);
		// check if any bomb is uncovered
		const lost = this._map.some(cell =>
			cell.value === "bomb" && cell.isUncovered
		);
		if (won) {
			this._winStateSource.next("won");
			this._status = "won";
		}
		if (lost) {
			this._winStateSource.next("lost");
			this._status = "lost";
		}
		return { won, lost };
	}

	getCellAt(x: number, y: number) {
		return this._map[this.xyToLinear(x, y)];
	}

	setCellAt(x: number, y: number, cell: Cell) {
		this._map[this.xyToLinear(x, y)] = cell;
	}

	mapAs2D() {
		let outMap: (CellInfo[])[] = [];
		let srcMap = this.mapAs1D();
		for (let y = 0; y < this._mapHeight; y++) {
			outMap.push(
				srcMap.slice(y * this._mapWidth, this._mapWidth)
			);
		}
		return outMap;
	}

	mapAs1D() {
		return [...this._map.map<CellInfo>((cell, index) => ({
			status: cell,
			y: Math.floor(index / this._mapWidth),
			x: index % this._mapWidth
		}))];
	}

	get mapInfo(): MapInfo {
		return {
			map2D: this.mapAs2D(),
			map1D: this.mapAs1D(),
			length: this._mapLength,
			height: this._mapHeight,
			width: this._mapWidth
		};
	}

	triggerFlag(x: number, y: number) {
		if (this._status !== "playing")
			return;
		const cell = this.getCellAt(x, y);
		cell.isFlagged = !cell.isFlagged;
		this._cellSources[this.xyToLinear(x, y)].next(cell);
		this._flagCountSource.next(
			this._map.reduce<number>((cnt, cell) => (cell.isFlagged ? cnt+1 : cnt), 0)
		);
	}

	triggerUncover(x: number, y: number) {
		if (this._status !== "playing")
			return;
		const cell = this.getCellAt(x, y);
		if (cell.isFlagged)
			return;
		if (this._firstCell) {
			this._firstCell = !this._firstCell;
			let count = 0;
			// generate map until the cell at xy is empty
			do {
				count++;
				this.generateMapInternal({
					bombs: this._bombs,
					mapSize: {
						width: this._mapWidth,
						height: this._mapHeight
					},
					seed: this._seed
				});
				if (count >= 5000) {
					alert("Couldn't generate a map after 2000 tries. Please review your settings.");
					return;
				}
			} while (
				count < 2500 ?
				this.getCellAt(x, y).value !== 0 :
				this.getCellAt(x, y).value === "bomb"
			);
		}
		this.expandRecursively(x, y);
		// check win status
		this.checkWonLost();
	}

	private expandRecursively(x: number, y: number) {
		// check if out of bounds
		if (x < 0 || x >= this._mapWidth)
			return;
		if (y < 0 || y >= this._mapHeight)
			return;
		const cell = this.getCellAt(x, y);
		// if already uncovered, return
		if (cell.isUncovered)
			return;
		// uncover cell and send event
		cell.isUncovered = true;
		this._cellSources[this.xyToLinear(x, y)].next(cell);
		// if on number, return
		if (cell.value !== 0)
			return;
		// call recursively
		this.expandRecursively(x-1, y-1);
		this.expandRecursively(x, y-1);
		this.expandRecursively(x+1, y-1);
		this.expandRecursively(x-1, y);
		this.expandRecursively(x+1, y);
		this.expandRecursively(x-1, y+1);
		this.expandRecursively(x, y+1);
		this.expandRecursively(x+1, y+1);
	}
}
