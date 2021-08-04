import { ImageService } from './../image.service';
import { Component, Input, OnInit } from '@angular/core';
import { Cell, CellInfo } from '../types';
import { MinesweeperService } from './../minesweeper.service';

@Component({
	selector: 'app-square-grid-item',
	templateUrl: './square-grid-item.component.html',
	styleUrls: ['./square-grid-item.component.scss']
})
export class SquareGridItemComponent implements OnInit {

	@Input() xPos: number = -1;
	@Input() yPos: number = -1;
	cell: Cell | null = null;
	classes: Record<string, any> = {};
	bombUrl: string = "";
	flagUrl: string = "";
	isLost = false;

	constructor(
		private minesweeper: MinesweeperService,
		private imageService: ImageService
	) {
		minesweeper.mapGenerated$.subscribe(() => this.isLost = false);
		minesweeper.winState$.subscribe(state => (this.isLost = state === "lost") && this.updateCell());
	}

	ngOnInit(): void {
		this.configure();
		this.minesweeper.mapGenerated$.subscribe(() => this.configure());
		this.bombUrl = this.imageService.getUrl("naval-mine");
		this.flagUrl = this.imageService.getUrl("flag");
	}

	configure() {
		this.minesweeper.getCellObservable(this.xPos, this.yPos).subscribe(() => {
			this.updateCell();
		});
	}

	updateCell() {
		const cell = this.minesweeper.getCellAt(this.xPos, this.yPos);
		this.classes = {
			cell: true,
			covered: !cell.isUncovered,
			flagged: cell.isFlagged,
			bomb: cell.value === "bomb",
			[`number-${cell.value}`]: cell.value !== "bomb"
		};
		this.cell = cell;
	}

	onClick() {
		this.minesweeper.triggerUncover(this.xPos, this.yPos);
	}

	onRightClick(ev: Event) {
		ev.preventDefault();
		this.minesweeper.triggerFlag(this.xPos, this.yPos);
	}

}
