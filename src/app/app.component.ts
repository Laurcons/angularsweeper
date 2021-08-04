import { ImageService } from './image.service';
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MinesweeperService } from './minesweeper.service';
import { NbDialogService, NbToastrService } from '@nebular/theme';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

	isMapGenerated = false;
	mapSize: { width: number; height: number; } | null = null;
	@ViewChild('loseDialog', { read: TemplateRef }) loseDialogTemplate!: TemplateRef<any>;
	@ViewChild('winDialog', { read: TemplateRef }) winDialogTemplate!: TemplateRef<any>;
	generateForm = new FormGroup({
		width: new FormControl(10),
		height: new FormControl(10),
		bombs: new FormControl(12)
	});
	flagCount = 0;

	constructor(
		private minesweeper: MinesweeperService,
		private imageService: ImageService,
		private dialog: NbDialogService,
		private toastr: NbToastrService
	) {
		minesweeper.mapGenerated$.subscribe(() => {
			this.isMapGenerated = true;
			const mapInfo = minesweeper.mapInfo;
			this.mapSize = {
				width: mapInfo.width,
				height: mapInfo.height
			};
			this.toastr.info("Map was generated", "Notification");
		});
		minesweeper.winState$.subscribe(status => {
			if (status === "lost")
				this.onLose();
			if (status === "won")
				this.onWin();
		});
		minesweeper.flagCount$.subscribe(val => this.flagCount = val);
		const changeHandler = () => {
			this.generateForm.get('bombs')?.setValue(
				Math.floor(
					(this.generateForm.get('width')?.value *
					this.generateForm.get('height')?.value) / 6
				)
			);
		};
		this.generateForm.get('width')?.valueChanges.subscribe(changeHandler);
		this.generateForm.get('height')?.valueChanges.subscribe(changeHandler);
	}

	generateMapClick() {
		this.minesweeper.generateMap({
			mapSize: {
				height: parseInt(this.generateForm.get('height')?.value ?? "10"),
				width: parseInt(this.generateForm.get('width')?.value ?? "10")
			},
			bombs: parseInt(this.generateForm.get('bombs')?.value ?? "10")
		});
	}

	ngOnInit() {
		this.generateMapClick();
		// load images
		this.imageService.register("naval-mine", "https://img.icons8.com/windows/24/000000/naval-mine.png");
		this.imageService.register("flag", "https://img.icons8.com/material-outlined/24/000000/flag.png");
	}

	onWin() {
		this.dialog.open(this.winDialogTemplate);
	}

	onLose() {
		this.dialog.open(this.loseDialogTemplate);
	}
}
