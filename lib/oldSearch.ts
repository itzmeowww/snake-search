// import { AlgoType, GridElement, Pos, makeInitialGrid, placeApple, searchByAlgo } from "./search";

// export const make_frames = (
//   algo: AlgoType,
//   size: number,
//   appleN: number
// ): GridElement[][][] => {
//   console.log("MAKING..." + algo);
//   const gridColN = size;
//   const gridRowN = size;
//   let frames: GridElement[][][] = [];
//   let initialGrid = makeInitialGrid(gridRowN, gridColN);
//   let snake: Pos[] = [
//     { row: Math.floor(gridRowN / 2), col: Math.floor(gridColN / 2) },
//   ];
//   let length = 1;
//   frames.push(initialGrid);

//   for (let i = 0; i < appleN; i++) {
//     console.log(`${i + 1}/${appleN} apples`);
//     let applePos = placeApple(frames[frames.length - 1], gridRowN, gridColN);
//     let path: Pos[] = [];

//     const res = searchByAlgo(
//       frames[frames.length - 1],
//       snake[0],
//       applePos,
//       gridRowN,
//       gridColN,
//       algo
//     );

//     path = res.path;

//     while (path.length > 0 && path[0] == snake[0]) path.shift();
//     while (path.length > 0) {
//       let currentFrame = cloneGrid(initialGrid);
//       snake.unshift(path[0]);
//       while (snake.length > length) snake.pop();
//       path.shift();

//       for (let i = 0; i < path.length; i++) {
//         let pos = path[i];
//         if (i + 1 < path.length) {
//           let n_pos = path[i + 1];
//           if (pos.col - n_pos.col == 0) {
//             if (pos.row - n_pos.row == 1) {
//               currentFrame[pos.row][pos.col] = GridElement.PathL;
//             } else {
//               currentFrame[pos.row][pos.col] = GridElement.PathR;
//             }
//           }
//           if (pos.row - n_pos.row == 0) {
//             if (pos.col - n_pos.col == 1) {
//               currentFrame[pos.row][pos.col] = GridElement.PathU;
//             } else {
//               currentFrame[pos.row][pos.col] = GridElement.PathD;
//             }
//           }
//         } else {
//           currentFrame[pos.row][pos.col] = GridElement.Path;
//         }
//       }
//       currentFrame[applePos.row][applePos.col] = GridElement.Apple;
//       snake.forEach((pos) => {
//         currentFrame[pos.row][pos.col] = GridElement.Snake;
//       });
//       currentFrame[snake[0].row][snake[0].col] = GridElement.SnakeHead;

//       frames.push(currentFrame);
//     }
//     length++;
//   }
//   return frames;
// };

// const placeApple = (grid: GridElement[][], rowN: number, colN: number): Pos => {
//   let possible: Pos[] = [];
//   for (let i = 0; i < rowN; i++) {
//     for (let j = 0; j < colN; j++) {
//       if (grid[i][j] == GridElement.Empty) {
//         possible.push({ row: i, col: j });
//       }
//     }
//   }
//   let idx = Math.floor(Math.random() * possible.length);
//   return possible[idx];
// };

