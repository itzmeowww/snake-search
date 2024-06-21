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

export type Pos = {
  row: number;
  col: number;
};

export type AlgoType =
  | "dijkstra"
  | "bfs"
  | "dfs"
  | "best_first_search"
  | "a_star";

export const makeInitialGrid = (
  rowN: number,
  colN: number
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
  // for (let i = 0; i < Math.floor((rowN * colN) / 5); i++) {
  //   const randRow = Math.floor(Math.random() * rowN);
  //   const randCol = Math.floor(Math.random() * colN);
  //   if (initialGrid[randRow][randCol] === GridElement.Empty) {
  //     initialGrid[randRow][randCol] = GridElement.Wall;
  //   }
  // }

  // for (let i = 3; i < colN - 3; i += 3) {
  //   initialGrid[3][i] = GridElement.Wall;
  //   initialGrid[rowN - 3][i - 1] = GridElement.Wall;
  // }

  // for (let i = 3; i < colN - 3; i += 4) {
  //   initialGrid[4][i] = GridElement.Wall;
  //   initialGrid[rowN - 5][i - 1] = GridElement.Wall;
  // }

  // for (let i = 4; i < colN - 2; i += 3) {
  //   initialGrid[5][i] = GridElement.Wall;
  //   initialGrid[rowN - 6][i - 2] = GridElement.Wall;
  // }

  return initialGrid;
};

export const makeInitialGrid2 = (
  rowN: number,
  colN: number
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
  for (let i = 0; i < Math.floor((rowN * colN) / 5); i++) {
    const randRow = Math.floor(Math.random() * rowN);
    const randCol = Math.floor(Math.random() * colN);
    if (initialGrid[randRow][randCol] === GridElement.Empty) {
      initialGrid[randRow][randCol] = GridElement.Wall;
    }
  }

  // for (let i = 3; i < colN - 3; i += 3) {
  //   initialGrid[3][i] = GridElement.Wall;
  //   initialGrid[rowN - 3][i - 1] = GridElement.Wall;
  // }

  // for (let i = 3; i < colN - 3; i += 4) {
  //   initialGrid[4][i] = GridElement.Wall;
  //   initialGrid[rowN - 5][i - 1] = GridElement.Wall;
  // }

  // for (let i = 4; i < colN - 2; i += 3) {
  //   initialGrid[5][i] = GridElement.Wall;
  //   initialGrid[rowN - 6][i - 2] = GridElement.Wall;
  // }

  return initialGrid;
};
export const cloneGrid = (g: GridElement[][]) => g.map((row) => [...row]);

const rr = [-1, 0, 1, 0];
const cc = [0, -1, 0, 1];

type PosWithWeight = {
  pos: Pos;
  weight: number;
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

const searchByAlgo = (
  g: GridElement[][],
  s: Pos,
  t: Pos,
  rowN: number,
  colN: number,
  algo: AlgoType,
  weight: number[][]
): { path: Pos[]; frames: GridElement[][][]; dis: number } => {
  let openList: PosWithWeight[] = [{ pos: s, weight: 0 }];
  let closedList: PosWithWeight[] = [];
  let cameFrom: Map<string, Pos> = new Map();
  let frames: GridElement[][][] = [];
  while (openList.length > 0) {
    if (algo == "dijkstra") {
      openList.sort((a, b) => a.weight - b.weight);
    } else if (algo == "best_first_search") {
      openList.sort((a, b) => heuristic(a.pos, t) - heuristic(b.pos, t));
    } else if (algo == "a_star") {
      openList.sort(
        (a, b) =>
          a.weight + heuristic(a.pos, t) - (b.weight + heuristic(b.pos, t))
      );
    }
    let f = openList[0];
    closedList.push(f);
    let newGrid: GridElement[][] = cloneGrid(g);
    closedList.forEach((x) => {
      newGrid[x.pos.row][x.pos.col] = GridElement.Visited;
    });
    frames.push(newGrid);

    if (f.pos.row === t.row && f.pos.col === t.col) {
      let temp: Pos | undefined = f.pos;
      let path: Pos[] = [];
      while (temp) {
        path.push(temp);
        temp = cameFrom.get(`${temp.row},${temp.col}`);
      }
      return { path: path.reverse(), frames: frames, dis: f.weight };
    }
    openList = openList.slice(1);
    for (let k = 0; k < 4; k++) {
      const new_r = rr[k] + f.pos.row;
      const new_c = cc[k] + f.pos.col;

      const cost = Math.abs(
        weight[new_r][new_c] - weight[f.pos.row][f.pos.col]
      );

      if (0 <= new_r && new_r < rowN && 0 <= new_c && new_c < colN) {
        if (
          g[new_r][new_c] === GridElement.Empty ||
          g[new_r][new_c] === GridElement.Apple
        ) {
          if (algo == "dijkstra") {
            if (
              closedList.findIndex(
                (x) => x.pos.col === new_c && x.pos.row === new_r
              ) === -1 &&
              openList.findIndex(
                (x) => x.pos.col === new_c && x.pos.row === new_r
              ) === -1
            ) {
              openList.push({
                pos: { row: new_r, col: new_c },
                weight: f.weight + cost,
              });
              cameFrom.set(`${new_r},${new_c}`, f.pos);
            } else {
              const elemInOpenListIdx = openList.findIndex(
                (x) => x.pos.col === new_c && x.pos.row === new_r
              );
              if (elemInOpenListIdx != -1) {
                const elemInOpenList = openList[elemInOpenListIdx];
                if (elemInOpenList.weight > f.weight + cost) {
                  openList.splice(elemInOpenListIdx, 1);
                  openList.push({
                    pos: { row: new_r, col: new_c },
                    weight: f.weight + cost,
                  });
                  cameFrom.set(`${new_r},${new_c}`, f.pos);
                }
              }
            }
          } else if (
            closedList.findIndex(
              (x) => x.pos.col === new_c && x.pos.row === new_r
            ) === -1 &&
            openList.findIndex(
              (x) => x.pos.col === new_c && x.pos.row === new_r
            ) === -1
          ) {
            if (algo == "dfs") {
              openList.unshift({
                pos: { row: new_r, col: new_c },
                weight: f.weight + cost,
              });
            } else if (
              algo == "bfs" ||
              algo == "best_first_search" ||
              algo == "a_star"
            ) {
              openList.push({
                pos: { row: new_r, col: new_c },
                weight: f.weight + cost,
              });
            }
            cameFrom.set(`${new_r},${new_c}`, f.pos);
          } else if (algo == "a_star") {
            const elemInOpenListIdx = openList.findIndex(
              (x) => x.pos.col === new_c && x.pos.row === new_r
            );
            if (elemInOpenListIdx != -1) {
              const elemInOpenList = openList[elemInOpenListIdx];
              if (
                elemInOpenList.weight + heuristic(elemInOpenList.pos, t) >
                f.weight + cost + heuristic({ row: new_r, col: new_c }, t)
              ) {
                openList.splice(elemInOpenListIdx, 1);
                openList.push({
                  pos: { row: new_r, col: new_c },
                  weight: f.weight + cost,
                });
                cameFrom.set(`${new_r},${new_c}`, f.pos);
              }
            }
            const elemInClosedListIdx = closedList.findIndex(
              (x) => x.pos.col === new_c && x.pos.row === new_r
            );
            if (elemInClosedListIdx != -1) {
              const elemInClosedList = closedList[elemInClosedListIdx];
              if (
                elemInClosedList.weight + heuristic(elemInClosedList.pos, t) >
                f.weight + cost + heuristic({ row: new_r, col: new_c }, t)
              ) {
                closedList.splice(elemInClosedListIdx, 1);
                openList.push({
                  pos: { row: new_r, col: new_c },
                  weight: f.weight + cost,
                });
                cameFrom.set(`${new_r},${new_c}`, f.pos);
              }
            }
          }
        }
      }
    }
  }

  return { path: [], frames: [], dis: -1 };
};

const heuristic = (a: Pos, b: Pos) => {
  return Math.abs(a.col - b.col) + Math.abs(a.row - b.row);
};

export const next_move = (
  algo: AlgoType,
  size: number,
  grid: GridElement[][],
  weight: number[][],
  snake: Pos[],
  applePos: Pos
): { frames: GridElement[][][]; snake: Pos[]; dis: number } => {
  const gridColN = size;
  const gridRowN = size;
  let frames: GridElement[][][] = [];
  let length = snake.length;
  frames.push(grid);

  let gridForSearch = cloneGrid(grid);
  snake.forEach((pos) => {
    gridForSearch[pos.row][pos.col] = GridElement.OldSnake;
  });

  let path: Pos[] = [];

  const searchRes = searchByAlgo(
    gridForSearch,
    snake[0],
    applePos,
    gridRowN,
    gridColN,
    algo,
    weight
  );
  path = searchRes.path;
  let searchFrames = searchRes.frames;
  searchFrames = searchFrames.map((frame) => {
    frame[snake[0].row][snake[0].col] = GridElement.OldSnake;
    frame[applePos.row][applePos.col] = GridElement.Apple;
    return frame;
  });
  frames.push(...searchFrames);

  // while (path.length > 0 && path[0] == snake[0]) path.shift();
  let pastPath: Pos[] = [];
  while (path.length > 0) {
    let currentFrame = cloneGrid(searchRes.frames[searchRes.frames.length - 1]);
    snake.unshift(path[0]);
    if (path.length == 1) length++;
    while (snake.length > length) snake.pop();
    let shiftedPath = path.shift();
    if (shiftedPath) pastPath.push(shiftedPath);

    pastPath.forEach((p) => {
      currentFrame[p.row][p.col] = GridElement.Past;
    });
    for (let i = 0; i < path.length; i++) {
      let pos = path[i];
      if (i + 1 < path.length) {
        let n_pos = path[i + 1];
        if (pos.col - n_pos.col == 0) {
          if (pos.row - n_pos.row == 1) {
            currentFrame[pos.row][pos.col] = GridElement.PathL;
          } else {
            currentFrame[pos.row][pos.col] = GridElement.PathR;
          }
        }
        if (pos.row - n_pos.row == 0) {
          if (pos.col - n_pos.col == 1) {
            currentFrame[pos.row][pos.col] = GridElement.PathU;
          } else {
            currentFrame[pos.row][pos.col] = GridElement.PathD;
          }
        }
      } else {
        currentFrame[pos.row][pos.col] = GridElement.Path;
      }
    }

    currentFrame[applePos.row][applePos.col] = GridElement.Apple;

    snake.forEach((pos) => {
      currentFrame[pos.row][pos.col] = GridElement.Snake;
    });
    currentFrame[snake[0].row][snake[0].col] = GridElement.SnakeHead;

    frames.push(currentFrame);
  }
  return { frames: frames, snake: snake, dis: searchRes.dis };
};

export const encodeGrid = (grid: GridElement[][]): string => {
  return grid
    .flatMap((row) => row) // Flatten the 2D grid into a 1D array
    .map((element) => element.toString()) // Convert each element to its string representation
    .join(","); // Join all elements into a single string
};

export const decodeGrid = (
  encodedString: string,
  rowN: number,
  colN: number
): GridElement[][] => {
  let grid: GridElement[][] = [];
  let index = 0;

  for (let i = 0; i < rowN; i++) {
    let row: GridElement[] = [];
    for (let j = 0; j < colN; j++) {
      row.push(parseInt(encodedString.split(",")[index]) as GridElement);
      index++;
    }
    grid.push(row);
  }

  return grid;
};

export const encodeWeight = (grid: GridElement[][]): string => {
  return grid
    .flatMap((row) => row)
    .map((element) => element.toString())
    .join("");
};

export const decodeWeight = (
  encodedString: string,
  rowN: number,
  colN: number
): number[][] => {
  let grid: GridElement[][] = [];
  let index = 0;

  for (let i = 0; i < rowN; i++) {
    let row: GridElement[] = [];
    for (let j = 0; j < colN; j++) {
      row.push(parseInt(encodedString[index]) as number);
      index++;
    }
    grid.push(row);
  }

  return grid;
};

export const encodePos = (pos: Pos): string => {
  return `${pos.row},${pos.col}`;
};
export const decodePos = (pos: string): Pos => {
  return {
    row: parseInt(pos.split(",")[0]),
    col: parseInt(pos.split(",")[1]),
  } as Pos;
};

export const encodeSnake = (pos: Pos[]): string => {
  return pos.map((p) => `${p.row},${p.col}`).join(";");
};

export const decodeSnake = (pos: string): Pos[] => {
  return pos.split(";").map((p) => {
    const [row, col] = p.split(",").map(Number);
    return { row, col };
  });
};
