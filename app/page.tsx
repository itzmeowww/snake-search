'use client'

import Frame from "@/components/animation/frame";
import { AlgoType, GridElement, Pos, cloneGrid, encodeGrid, encodePos, encodeSnake, encodeWeight, makeInitialGrid, makeInitialGrid2, makeWeight } from "@/lib/search";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { ToastAction } from "@/components/ui/toast";

import { ChevronsLeft, ChevronsRight } from 'lucide-react';

export default function Home() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true);
  const [loadingState, setLoadingState] = useState(0);
  const [showCard, setShowCard] = useState(true);

  const [isRunning, setIsRunning] = useState(false);
  const [frame, setFrame] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout>();


  const startPlay = () => {
    if (!isRunning) {
      setIsRunning(true);
      intervalRef.current = setInterval(() => {
        setFrame(prevTime => prevTime + 1);
      }, 200 / speed);
    }
  };

  const stopPlay = () => {
    if (isRunning) {
      clearInterval(intervalRef.current);
      setIsRunning(false);
    }
  };

  const handleButtonClick = () => {
    if (isRunning) {
      stopPlay();
    } else {
      startPlay();
    }
  };




  const [mousePos, setMousePos] = useState<Pos>({ row: -1, col: -1 })
  const [size, setSize] = useState(11)
  const [speed, setSpeed] = useState(5)
  const [isWeightedGraph, setIsWeightedGraph] = useState(true)
  const [isRandomWall, setIsRandomWall] = useState(true)
  const [isWeightShown, setIsWeightShown] = useState(true)
  const [isIconShown, setIsIconShown] = useState(true)
  const [weight, setWeight] = useState<number[][]>([])

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
    setLoadingState(0)

    setLoading(true)
    let newlog: { [key: string]: { frameN: number; dis: number } } = {};

    const bfsRes = await callAPINextMove('bfs', r, c);
    newlog['bfs'] = bfsRes;
    setLoadingState(10)
    const dfsRes = await callAPINextMove('dfs', r, c);
    newlog['dfs'] = dfsRes;
    setLoadingState(30)
    const dijkstraRes = await callAPINextMove('dijkstra', r, c);
    newlog['dijkstra'] = dijkstraRes;
    setLoadingState(50)
    const bestFirstSearchRes = await callAPINextMove('best_first_search', r, c);
    newlog['best_first_search'] = bestFirstSearchRes;
    setLoadingState(70)
    const aStarRes = await callAPINextMove('a_star', r, c);
    setLoadingState(100)
    newlog['a_star'] = aStarRes;
    setLoading(false)
    setLog((prevLog) => ([...prevLog, newlog]));
    setFrame(0)
    stopPlay()
    toast({
      title: "準備できました",
      description: "「再生」ボタンをクリックしてください", action: <ToastAction altText="play" onClick={() => {
        startPlay()
      }}>再生</ToastAction>,
    })

    setFramesBFS(bfsRes.frames);
    updateGridState(setStateBFS, bfsRes.snake);
    setFramesDFS(dfsRes.frames);
    updateGridState(setStateDFS, dfsRes.snake);
    setFramesDijkstra(dijkstraRes.frames);
    updateGridState(setStateDijkstra, dijkstraRes.snake);
    setFramesBestFirstSearch(bestFirstSearchRes.frames);
    updateGridState(setStateBestFirstSearch, bestFirstSearchRes.snake);
    setFramesAStar(aStarRes.frames);
    updateGridState(setStateAStar, aStarRes.snake);

  };

  const updateGridState = (setState: Dispatch<SetStateAction<{
    snake: Pos[];
    initialGrid: GridElement[][];
  } | undefined>>,
    snake: Pos[]) => {
    setState((prev) => {
      if (prev === undefined) return undefined;
      return { ...prev, snake: snake };
    });
  };

  const callAPINextMove = async (algo: AlgoType, r: number, c: number): Promise<{ frameN: number, dis: number, frames: GridElement[][][], snake: Pos[] }> => {
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

    if (!state) return { frameN: 0, dis: 0, frames: [], snake: [] }

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

    return { dis: data.dis, frameN: data.dis == -1 ? -1 : data.frames.length, frames: data.frames, snake: data.snake }

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

  const algorithms = [
    { title: "BFS", subtitle: "(幅優先探索)", algoKey: "bfs", frames: framesBFS },
    { title: "DFS", subtitle: "(深さ優先探索)", algoKey: "dfs", frames: framesDFS },
    { title: "Best First Search", subtitle: "(最良優先探索)", algoKey: "best_first_search", frames: framesBestFirstSearch },
    { title: "Dijkstra", subtitle: "(最適探索)", algoKey: "dijkstra", frames: framesDijkstra },
    { title: "A Star", subtitle: "(A*)", algoKey: "a_star", frames: framesAStar }
  ];



  if (showCard) {
    return <main className="flex min-h-screen items-center justify-center p-12 w-fit mx-auto gap-4 flex-wrap">
      <Card>
        <CardHeader>
          <CardTitle>シミュレーションの設定</CardTitle>
        </CardHeader>
        <CardContent className="gap-6 flex flex-col w-full">
          <div className="grid w-full max-w-sm items-center gap-3">
            <Label htmlFor="size">ゲームのサイズ (5-25)</Label>
            <Input type="number" min={5} id="size" value={size} onChange={(e) => { setSize(+e.target.value) }} />
          </div>
          <div className="grid w-full max-w-md items-center gap-3">
            <Label htmlFor="speed">アニメションの速さ</Label>
            <div className="flex gap-3 justify-center items-center w-full">
              <span className="w-12 text-xs">遅い</span>
              <Slider id="speed" defaultValue={[5]} max={10} step={1} value={[speed]} onValueChange={((e) => {
                setSpeed(e[0])
              })} />
              <span className="w-12 text-xs">早い</span>
            </div>
          </div>
          <div className="flex w-full max-w-sm items-center gap-3">

            <Checkbox id="weighted" checked={isWeightedGraph} defaultChecked={isWeightedGraph} onCheckedChange={(checked) => {
              if (checked !== 'indeterminate')
                setIsWeightedGraph(checked)
            }}>
            </Checkbox><Label htmlFor="weighted">重み付きグラフ</Label>

          </div>
          <div className="flex w-full max-w-sm items-center gap-3">

            <Checkbox id="walled" checked={isRandomWall} defaultChecked={isRandomWall} onCheckedChange={(checked) => {
              if (checked !== 'indeterminate')
                setIsRandomWall(checked)
            }}>
            </Checkbox><Label htmlFor="walled">ランダムな壁</Label>

          </div>

        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={() => {
            if (size >= 5 && size <= 25) {
              setLoading(true)
              setShowCard(false)
              if(!isWeightedGraph){
                setIsWeightShown(false)
              }
            } else {
              toast({
                title: "設定できません",
                description: "サイズは５以上25以下に設定してください",
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



  return (
    <div className="min-h-screen relative pb-24">
      {loading && <div className="flex flex-col gap-6 justify-center items-center w-full h-screen bg-slate-100/80 fixed z-30">
        <h1>loading...</h1>
        <Progress value={loadingState} className="w-64"></Progress>
      </div>}

      <div className="w-full h-16 border-b flex justify-between px-6 items-center gap-3" >
        <Button variant={'outline'} className="flex gap-2 items-center" onClick={() => {
          location.reload();
        }}>リセット</Button>
        <div className="flex gap-6">
          <div className="flex items-center space-x-2">
            <Switch id="show-weight" checked={isWeightShown} onCheckedChange={(checked) => {
              setIsWeightShown(checked)
            }} />
            <Label htmlFor="show-weight">数値</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch id="show-weight" checked={isIconShown} onCheckedChange={(checked) => {
              setIsIconShown(checked)
            }} />
            <Label htmlFor="show-weight">アイコン</Label>
          </div>
        </div>
      </div>

      <div className="fixed bottom-6 w-full flex justify-center z-20">
        <div className=" py-4 border px-6 rounded-xl w-fit gap-6 flex shadow-lg bg-white">
          {/* <Button variant="outline" onClick={() => {
            location.reload();
          }}>リセット</Button> */}

          <Button variant={'outline'} onClick={() => {
            stopPlay()
            setFrame(0)
          }}>
            <ChevronsLeft />
          </Button>
          <Button onClick={() => {
            handleButtonClick()
          }}>{isRunning ? "再生中" : "再生"}</Button>

          <Button variant={'outline'} onClick={() => {
            stopPlay()
            setFrame(99999)
          }}>
            <ChevronsRight />
          </Button>
        </div>
      </div>


      <main className="relative flex  items-center justify-center p-12 w-fit mx-auto gap-4 flex-wrap">

        {algorithms.map(({ title, subtitle, algoKey, frames }) => (
          <Frame
            key={title}
            showIcon={isIconShown}
            currentFrame={frame}
            log={log.map((x) => x[algoKey])}
            frames={frames}
            title={title}
            subtitle={subtitle}
            onGridClick={handleOnGridClick}
            mousePos={mousePos}
            setMousePos={handleSetMousePos}
            weight={weight}
            showWeight={isWeightShown}
          />
        ))}
      </main>
    </div>
  );
}
