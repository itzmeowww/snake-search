import { GridElement, cloneGrid } from "./snake";

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

type PosWithWeight = {
  pos: Pos;
  weight: number;
};

const rr = [-1, 0, 1, 0];
const cc = [0, -1, 0, 1];

const searchByAlgo = (
  g: GridElement[][],
  s: Pos,
  t: Pos,
  rowN: number,
  colN: number,
  algo: AlgoType,
  weight: number[][]
): { path: Pos[]; frames: GridElement[][][]; dis: number } => {
  let openList: PosWithWeight[] = [
    {
      pos: s,
      weight: 0,
    },
  ];
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
    let currentState = openList[0];
    closedList.push(currentState);
    let newGrid: GridElement[][] = cloneGrid(g);
    closedList.forEach((x) => {
      newGrid[x.pos.row][x.pos.col] = GridElement.Visited;
    });
    frames.push(newGrid);

    if (currentState.pos.row === t.row && currentState.pos.col === t.col) {
      let temp: Pos | undefined = currentState.pos;
      let path: Pos[] = [];
      while (temp) {
        path.push(temp);
        temp = cameFrom.get(`${temp.row},${temp.col}`);
      }
      return { path: path.reverse(), frames: frames, dis: currentState.weight };
    }
    openList = openList.slice(1);
    for (let k = 0; k < 4; k++) {
      const new_pos: Pos = {
        row: rr[k] + currentState.pos.row,
        col: cc[k] + currentState.pos.col,
      };
      const cost = Math.abs(
        weight[new_pos.row][new_pos.col] -
          weight[currentState.pos.row][currentState.pos.col]
      )+1;

      if (
        0 <= new_pos.row &&
        new_pos.row < rowN &&
        0 <= new_pos.col &&
        new_pos.col < colN
      ) {
        const indexInClosedList = closedList.findIndex(
          (x) => x.pos.col === new_pos.col && x.pos.row === new_pos.row
        );

        const indexInOpenList = openList.findIndex(
          (x) => x.pos.col === new_pos.col && x.pos.row === new_pos.row
        );

        if (
          [GridElement.Empty, GridElement.Apple].includes(
            g[new_pos.row][new_pos.col]
          )
        ) {
          if (algo == "dijkstra" && indexInClosedList === -1) {
            if (indexInOpenList !== -1) {
              if (
                openList[indexInOpenList].weight >
                currentState.weight + cost
              ) {
                openList.splice(indexInOpenList, 1);
                openList.push({
                  pos: new_pos,
                  weight: currentState.weight + cost,
                });
                cameFrom.set(`${new_pos.row},${new_pos.col}`, currentState.pos);
              }
            } else {
              openList.push({
                pos: new_pos,
                weight: currentState.weight + cost,
              });
              cameFrom.set(`${new_pos.row},${new_pos.col}`, currentState.pos);
            }
          } else if (indexInClosedList === -1 && indexInOpenList === -1) {
            if (algo == "dfs") {
              openList.unshift({
                pos: new_pos,
                weight: currentState.weight + cost,
              });
            } else if (
              algo == "bfs" ||
              algo == "best_first_search" ||
              algo == "a_star"
            ) {
              openList.push({
                pos: new_pos,
                weight: currentState.weight + cost,
              });
            }
            cameFrom.set(`${new_pos.row},${new_pos.col}`, currentState.pos);
          } else if (algo == "a_star") {
            let should_add = false;
            if (indexInOpenList != -1) {
              const elemInOpenList = openList[indexInOpenList];
              if (
                elemInOpenList.weight + heuristic(elemInOpenList.pos, t) >
                currentState.weight + cost + heuristic(new_pos, t)
              ) {
                openList.splice(indexInOpenList, 1);
                should_add = true;
              }
            }

            if (indexInClosedList != -1) {
              const elemInClosedList = closedList[indexInClosedList];
              if (
                elemInClosedList.weight + heuristic(elemInClosedList.pos, t) >
                currentState.weight + cost + heuristic(new_pos, t)
              ) {
                closedList.splice(indexInClosedList, 1);
                should_add = true;
              }
            }

            if (should_add) {
              openList.push({
                pos: new_pos,
                weight: currentState.weight + cost,
              });
              cameFrom.set(`${new_pos.row},${new_pos.col}`, currentState.pos);
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
    gridForSearch[pos.row][pos.col] = GridElement.Snake;
  });
  gridForSearch[snake[0].row][snake[0].col] = GridElement.SnakeHead;
  gridForSearch[applePos.row][applePos.col] = GridElement.Apple;

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
    snake.forEach((pos) => {
      frame[pos.row][pos.col] = GridElement.OldSnake;
    });

    frame[applePos.row][applePos.col] = GridElement.Apple;
    return frame;
  });
  frames.push(...searchFrames);

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
  frames.shift();
  frames.unshift(gridForSearch);
  return { frames: frames, snake: snake, dis: searchRes.dis };
};
