'use client'

import Frame from "@/components/animation/frame";
import { AlgoType, GridElement, Pos, cloneGrid, decodeGrid, encodeGrid, encodePos, encodeSnake, encodeWeight, makeInitialGrid, makeInitialGrid2, makeWeight } from "@/lib/search";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";




export default function Home() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true);
  const [loadingState, setLoadingState] = useState(0);
  const [showCard, setShowCard] = useState(true);


  const [mousePos, setMousePos] = useState<Pos>({ row: -1, col: -1 })
  const [size, setSize] = useState(11)
  const [speed, setSpeed] = useState(5)
  const [isWeightedGraph, setIsWeightedGraph] = useState(true)
  const [isRandomWall, setIsRandomWall] = useState(true)
  const [isWeightShown, setIsWeightShown] = useState(true)
  const [weight, setWeight] = useState<number[][]>([])
  // const [appleN, setAppleN] = useState(10)

  const [framesBFS, setFramesBFS] = useState<GridElement[][][]>([]);
  const [framesDFS, setFramesDFS] = useState<GridElement[][][]>([]);
  const [framesDijkstra, setFramesDijkstra] = useState<GridElement[][][]>([]);
  const [framesBestFirstSearch, setFramesBestFirstSearch] = useState<GridElement[][][]>([]);
  const [framesAStar, setFramesAStar] = useState<GridElement[][][]>([]);

  const [log, setLog] = useState<{ [key: string]: { frameN: number, dis: number } }[]>([])

  const [stateBFS, setStateBFS] = useState<{ snake: Pos[], initialGrid: GridElement[][] }>();
  const [stateDFS, setStateDFS] = useState<{ snake: Pos[], initialGrid: GridElement[][] }>();
  const [stateDijkstra, setStateDijkstra] = useState<{ snake: Pos[], initialGrid: GridElement[][] }>();
  const [stateBestFirstSearch, setStateBestFirstSearch] = useState<{ snake: Pos[], initialGrid: GridElement[][] }>();
  const [stateAStar, setStateAStar] = useState<{ snake: Pos[], initialGrid: GridElement[][] }>();


  const handleSetMousePos = (r: number, c: number) => { setMousePos({ row: r, col: c }) }

  const handleOnGridClick = async (r: number, c: number) => {

    let newlog: { [key: string]: { frameN: number; dis: number } } = {};

    const bfsRes = await callAPINextMove('bfs', r, c);
    newlog['bfs'] = bfsRes;

    const dfsRes = await callAPINextMove('dfs', r, c);
    newlog['dfs'] = dfsRes;

    const dijkstraRes = await callAPINextMove('dijkstra', r, c);
    newlog['dijkstra'] = dijkstraRes;

    const bestFirstSearchRes = await callAPINextMove('best_first_search', r, c);
    newlog['best_first_search'] = bestFirstSearchRes;

    const aStarRes = await callAPINextMove('a_star', r, c);
    newlog['a_star'] = aStarRes;

    setLog((prevLog) => ([...prevLog, newlog]));
  };

  const callAPINextMove = async (algo: AlgoType, r: number, c: number): Promise<{ frameN: number, dis: number }> => {
    let state: { snake: Pos[], initialGrid: GridElement[][] } | undefined;
    switch (algo) {
      case "bfs":
        state = stateBFS;
        break;
      case "dfs":
        state = stateDFS;
        break;
      case "dijkstra":
        state = stateDijkstra;
        break;
      case "best_first_search":
        state = stateBestFirstSearch;
        break;
      case "a_star":
        state = stateAStar;
        break;
    }

    if (!state) return { frameN: 0, dis: 0 }

    const apiUrl = '/api/nextMove';

    const queryParams: Record<string, string> = {
      algo,
      size: size.toString(),
      applePos: encodePos({ row: r, col: c }),
      snake: encodeSnake(state.snake),
      initialGrid: encodeGrid(state.initialGrid),
      weight: encodeWeight(weight)
    };

    const response = await fetch(`${apiUrl}?${new URLSearchParams(queryParams).toString()}`);


    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    const updateState = (setState: Dispatch<SetStateAction<{
      snake: Pos[];
      initialGrid: GridElement[][];
    } | undefined>>, data: {
      snake: Pos[];
      initialGrid: GridElement[][];
    }) => {
      setState((prev) => {
        if (prev === undefined) return undefined;
        return { ...prev, snake: data.snake };
      });
    };

    if (data.dis != -1)
      switch (algo) {
        case 'bfs':
          setFramesBFS(data.frames);
          updateState(setStateBFS, data);
          break;
        case 'dfs':
          setFramesDFS(data.frames);
          updateState(setStateDFS, data);
          break;
        case 'dijkstra':
          setFramesDijkstra(data.frames);
          updateState(setStateDijkstra, data);
          break;
        case 'best_first_search':
          setFramesBestFirstSearch(data.frames);
          updateState(setStateBestFirstSearch, data);
          break;
        case 'a_star':
          setFramesAStar(data.frames);
          updateState(setStateAStar, data);
          break;
      }

    return { dis: data.dis, frameN: data.dis == -1 ? -1 : data.frames.length }

  }
  const initialize = () => {

    const weight = makeWeight(size, size, isWeightedGraph)
    setWeight(weight)
    const initialGrid = isRandomWall ? makeInitialGrid2(size, size) : makeInitialGrid(size, size)
    let initialState = { initialGrid: initialGrid, snake: [{ row: Math.floor(size / 2), col: Math.floor(size / 2) }] }
    setStateBFS(initialState)
    setStateDFS(initialState)
    setStateDijkstra(initialState)
    setStateBestFirstSearch(initialState)
    setStateAStar(initialState)

    const initialGridFrame = cloneGrid(initialGrid)
    initialGridFrame[initialState.snake[0].row][initialState.snake[0].col] = GridElement.SnakeHead

    setFramesBFS([initialGridFrame]);
    setFramesDFS([initialGridFrame]);
    setFramesDijkstra([initialGridFrame]);
    setFramesBestFirstSearch([initialGridFrame]);
    setFramesAStar([initialGridFrame]);

    setLoading(false)
  }
  useEffect(() => {
    if (showCard) return
    initialize()
  }, [showCard])


  if (showCard) {
    return <main className="flex min-h-screen items-center justify-center p-12 w-fit mx-auto gap-4 flex-wrap">
      <Card>
        <CardHeader>
          <CardTitle>シミュレーションの設定</CardTitle>
          <CardDescription>ゲームのサイズ</CardDescription>
        </CardHeader>
        <CardContent className="gap-6 flex flex-col">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="size">ゲームのサイズ</Label>
            <Input type="number" min={5} id="size" value={size} onChange={(e) => { setSize(+e.target.value) }} />
          </div>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="speed">速さ</Label>
            <Slider id="speed" defaultValue={[5]} max={10} step={1} value={[speed]} onValueChange={((e) => {
              setSpeed(e[0])
            })} />
          </div>
          <div className="flex w-full max-w-sm items-center gap-1.5">

            <Checkbox id="weighted" checked={isWeightedGraph} defaultChecked={isWeightedGraph} onCheckedChange={(checked) => {
              if (checked !== 'indeterminate')
                setIsWeightedGraph(checked)
            }}>
            </Checkbox><Label htmlFor="weighted">重み付きグラフ</Label>

          </div>
          <div className="flex w-full max-w-sm items-center gap-1.5">

            <Checkbox id="walled" checked={isRandomWall} defaultChecked={isRandomWall} onCheckedChange={(checked) => {
              if (checked !== 'indeterminate')
                setIsRandomWall(checked)
            }}>
            </Checkbox><Label htmlFor="walled">ランダムな壁</Label>

          </div>

        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={() => {
            if (size >= 5) {
              setLoading(true)
              setShowCard(false)
            } else {
              toast({
                title: "設定できません",
                description: "サイズは５以上に設定してください",
                variant: 'destructive'
              })
            }
          }}>
            OK
          </Button>
        </CardFooter>
      </Card>
    </main>
  }

  if (loading)
    return <main className="flex flex-col min-h-screen items-center justify-center p-12 w-fit mx-auto gap-4 flex-wrap">
      <h1 className="font-mono">loading...</h1>
      <Progress value={loadingState} className="w-[60%] min-w-48" ></Progress>
    </main>
  return (
    <div className="min-h-screen">
      <div className="w-full h-16 border-b flex justify-end px-6 items-center gap-6" >
        <div className="flex items-center space-x-2">
          <Switch id="show-weight" checked={isWeightShown} onCheckedChange={(checked) => {
            setIsWeightShown(checked)
          }} />
          <Label htmlFor="show-weight">グラフの数値を表示</Label>
        </div>
        <Button variant="outline" onClick={() => {
          location.reload();
        }}>リセット</Button>
      </div>
      <main className="relative flex  items-center justify-center p-12 w-fit mx-auto gap-4 flex-wrap">

        <Frame
          speed={speed}
          log={log.map((x) => x["bfs"])}
          frames={framesBFS}
          title="BFS"
          subtitle="(幅優先探索)"
          onGridClick={handleOnGridClick}
          mousePos={mousePos}
          setMousePos={handleSetMousePos}
          weight={weight}
          showWeight={isWeightShown}
        />
        <Frame
          speed={speed}
          log={log.map((x) => x["dfs"])}
          frames={framesDFS}
          title="DFS"
          subtitle="(深さ優先探索)"
          onGridClick={handleOnGridClick}
          mousePos={mousePos}
          setMousePos={handleSetMousePos}
          weight={weight}
          showWeight={isWeightShown}
        />
        <Frame
          speed={speed}
          log={log.map((x) => x["best_first_search"])}
          frames={framesBestFirstSearch}
          title="Best First Search"
          subtitle="(最良優先探索)"
          onGridClick={handleOnGridClick}
          mousePos={mousePos}
          setMousePos={handleSetMousePos}
          weight={weight}
          showWeight={isWeightShown}
        />

        <Frame
          speed={speed}
          log={log.map((x) => x["dijkstra"])}
          frames={framesDijkstra}
          title="Dijkstra"
          subtitle="(最適探索)"
          onGridClick={handleOnGridClick}
          mousePos={mousePos}
          setMousePos={handleSetMousePos}
          weight={weight}
          showWeight={isWeightShown}
        />
        <Frame
          speed={speed}
          log={log.map((x) => x["a_star"])}
          frames={framesAStar}
          title="A Star"
          subtitle="(A*)"
          onGridClick={handleOnGridClick}
          mousePos={mousePos}
          setMousePos={handleSetMousePos}
          weight={weight}
          showWeight={isWeightShown}
        />

      </main>
    </div>
  );
}
