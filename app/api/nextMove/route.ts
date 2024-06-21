import {
  AlgoType,
  decodeGrid,
  decodePos,
  decodeSnake,
  decodeWeight,
  encodeGrid,
  next_move,
} from "@/lib/search";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const size = parseInt(searchParams.get("size") || "15");
  const applePos = searchParams.get("applePos");
  const algo = searchParams.get("algo") as AlgoType;
  const initialGrid = searchParams.get("initialGrid");
  const weight = searchParams.get("weight");
  const snake = searchParams.get("snake");

  if(algo === null || applePos === null || initialGrid === null || snake === null || weight === null){
    return
  }
  const startTime = new Date().getTime();

  const res = next_move(
    algo,
    size,
    decodeGrid(initialGrid, size, size),
    decodeWeight(weight, size, size),
    decodeSnake(snake),
    decodePos(applePos)
  );

  const endTime = new Date().getTime();
  return Response.json({ frames:res.frames, time: endTime - startTime , snake : res.snake, dis:res.dis});
}
