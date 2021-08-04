
export type CellValue = number | "bomb";

export interface Cell {
	value: CellValue;
	isFlagged: boolean;
	isUncovered: boolean;
}

export interface MapInfo {
	map2D: CellInfo[][];
	map1D: CellInfo[];
	width: number;
	height: number;
	length: number;
}

export interface CellInfo {
	status: Cell;
	x: number;
	y: number;
}
