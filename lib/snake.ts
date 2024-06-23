export enum GridElement {
  Wall,
  Empty,
  Snake,
  SnakeHead,
  Apple,
  Path,
  PathL,
  PathR,
  PathU,
  PathD,
  Searched,
  Visited,
  OldSnake,
  Past,
}

export const makeInitialGrid = (
  rowN: number,
  colN: number,
  randomWall = false
): GridElement[][] => {
  let initialGrid: GridElement[][] = [];
  for (let i = 0; i < rowN; i++) {
    initialGrid.push(Array(colN).fill(GridElement.Empty));
  }

  for (let i = 0; i < rowN; i++) {
    initialGrid[i][0] = GridElement.Wall;
    initialGrid[i][colN - 1] = GridElement.Wall;
  }

  for (let i = 0; i < colN; i++) {
    initialGrid[0][i] = GridElement.Wall;
    initialGrid[rowN - 1][i] = GridElement.Wall;
  }
  if (randomWall) {
    for (let i = 0; i < Math.floor((rowN * colN) / 5); i++) {
      const randRow = Math.floor(Math.random() * rowN);
      const randCol = Math.floor(Math.random() * colN);

      if (initialGrid[randRow][randCol] === GridElement.Empty) {
        initialGrid[randRow][randCol] = GridElement.Wall;
      }
    }

    initialGrid[Math.floor(rowN / 2)][Math.floor(colN / 2)] = GridElement.Empty;
  }
  return initialGrid;
};
export const makeWeight = (
  rowN: number,
  colN: number,
  random = false
): number[][] => {
  let ret: number[][] = [];

  for (let i = 0; i < rowN; i++) {
    let row: number[] = [];
    for (let j = 0; j < colN; j++) {
      if (random) row.push(Math.floor(Math.random() * 9));
      else row.push(0);
    }
    ret.push(row);
  }

  return ret;
};
export const cloneGrid = (g: GridElement[][]) => g.map((row) => [...row]);
