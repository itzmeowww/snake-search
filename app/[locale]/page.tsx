'use client'

import Frame from "@/components/animation/frame";
import { AlgoType, Pos, next_move } from "@/lib/search";
import { useEffect, useRef, useState } from "react";
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
import { GridElement, cloneGrid, makeInitialGrid, makeWeight } from "@/lib/snake";

import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation'
import { Link } from "@/navigation";

export default function Home() {

  const t = useTranslations('HomePage');
  const params = useParams();
  const { locale } = params
  const algorithms: { title: string, subtitle: string, algoKey: AlgoType }[] = [
    { title: t("BFS"), subtitle: "(幅優先探索)", algoKey: "bfs" },
    { title: t("DFS"), subtitle: "(深さ優先探索)", algoKey: "dfs" },
    { title: t("Best First Search"), subtitle: "(最良優先探索)", algoKey: "best_first_search" },
    { title: t("Dijkstra"), subtitle: "(最適探索)", algoKey: "dijkstra" },
    { title: t("A*"), subtitle: "(A*)", algoKey: "a_star" }
  ];
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
        setFrame(prevTime => {
          return prevTime + 1
        });



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

  const initialSelect: { [key: string]: boolean } = {}
  algorithms.forEach((algorithm) => { initialSelect[algorithm.algoKey] = true })
  const [selected, setSelected] = useState<{ [key: string]: boolean }>(initialSelect)
  const [log, setLog] = useState<{ [key: string]: { frameN: number, dis: number } }[]>([])
  const [states, setStates] = useState<{ [key: string]: { snake: Pos[], frames: GridElement[][][] } }>({});
  const [initialGrid, setInitialGird] = useState<GridElement[][]>()


  const handleSetMousePos = (r: number, c: number) => { setMousePos({ row: r, col: c }) }
  const handleOnGridClick = async (r: number, c: number) => {
    let cantPlace = false;

    Object.keys(states).map((key) => {
      if (selected[key]) {
        const state = states[key];
        if ((initialGrid && initialGrid[r][c] === GridElement.Wall) || state.snake.some(({ row, col }) => row === r && col === c)) {
          if (!cantPlace) toast({ title: t("Cant Place"), description: t("Cant Place Desc"), variant: 'destructive' })
          cantPlace = true
        }
      }
    });
    if (cantPlace) return

    stopPlay()
    setLoadingState(0)
    setLoading(true)
    let new_log: { [key: string]: { frameN: number; dis: number } } = {};
    let new_states: { [key: string]: { frames: GridElement[][][], snake: Pos[] } } = {}

    algorithms.forEach((algorithm, idx) => {
      if (selected[algorithm.algoKey]) {
        const res = callNextMove(algorithm.algoKey, r, c);
        new_log[algorithm.algoKey] = res;
        new_states[algorithm.algoKey] = res;
      }
      setLoadingState(idx * 100 / algorithms.length)
    })

    setLog((prevLog) => ([...prevLog, new_log]));
    setStates(new_states)
    setFrame(0)
    setLoading(false)

    toast({
      title: t("Ready"),
      description: t("Ready Desc"), action: <ToastAction altText="play" onClick={() => {
        startPlay()
      }}>{t("Play")}</ToastAction>,
    })
  };

  const callNextMove = (algo: AlgoType, r: number, c: number): { frameN: number, dis: number, frames: GridElement[][][], snake: Pos[] } => {
    let state = states[algo]
    if (!state || !initialGrid) return { frameN: -1, dis: -1, frames: [], snake: [] }
    const data = next_move(algo, size, cloneGrid(initialGrid), weight, [...state.snake], { row: r, col: c })
    return { dis: data.dis, frameN: data.dis == -1 ? -1 : data.frames.length, frames: data.frames, snake: data.snake }

  }
  const initialize = () => {

    const weight = makeWeight(size, size, isWeightedGraph)
    setWeight(weight)
    const initialGrid = makeInitialGrid(size, size, isRandomWall)
    setInitialGird(initialGrid)

    const snake: Pos[] = [{ row: Math.floor(size / 2), col: Math.floor(size / 2) }]

    const initialGridFrame = cloneGrid(initialGrid)
    initialGridFrame[snake[0].row][snake[0].col] = GridElement.SnakeHead
    const initialState = { frames: [initialGridFrame], snake: snake }

    let new_states: { [key: string]: { frames: GridElement[][][], snake: Pos[] } } = {}

    algorithms.forEach((algorithm, idx) => {
      if (selected[algorithm.algoKey]) {
        new_states[algorithm.algoKey] = initialState;
        setLoadingState((idx + 1) * 100 / algorithms.length)
      }
    })
    setStates(new_states)
    setLoading(false)
  }
  useEffect(() => {
    if (showCard) return
    initialize()
  }, [showCard])
  useEffect(() => {
    let done = true
    algorithms.forEach((algorithm) => {
      if (states[algorithm.algoKey] && states[algorithm.algoKey].frames.length > frame && selected[algorithm.algoKey]) {
        done = false
      }
    })
    if (done) {
      stopPlay()
    }
  }, [frame, states])


  if (showCard) {
    return <main className="flex min-h-screen flex-col items-center justify-center p-12 w-fit mx-auto gap-4 flex-wrap">
      
      <div className=" w-fit flex gap-2 fixed top-4 right-6">
        <Link href={'/'} locale="en">
          <Button size={'sm'} variant={locale == 'en' ? 'default' : 'outline'}>EN</Button>
        </Link>
        <Link href={'/'} locale="ja">
          <Button size={'sm'} variant={locale == 'ja' ? 'default' : 'outline'}>JA</Button>
        </Link>
      </div>

      
      <Link href={`/about`}><Button>{t("What is this")}</Button></Link>
      <Card className="">
        <CardHeader>
          <CardTitle><h1>{t('Simulation Settings')}</h1></CardTitle>
        </CardHeader>
        <CardContent className="gap-6 flex flex-col w-full min-w-80">
          <div className="grid w-full max-w-sm items-center gap-3">
            <Label htmlFor="size">{t("Game Size")} (5-45)</Label>
            <Input type="number" min={5} id="size" value={size} onChange={(e) => { setSize(+e.target.value) }} />
          </div>
          <div className="grid w-full max-w-md items-center gap-3">
            <Label htmlFor="speed">{t("Animation Speed")}</Label>
            <div className="flex gap-3 justify-center items-center w-full">
              <span className="w-12 text-xs text-right">{t("Slow")}</span>
              <Slider id="speed" defaultValue={[5]} max={10} step={1} value={[speed]} onValueChange={((e) => {
                setSpeed(e[0])
              })} />
              <span className="w-12 text-xs">{t("Fast")}</span>
            </div>
          </div>
          <div className="grid grid-cols-2">
            <div className="flex w-full max-w-sm items-center gap-3">

              <Checkbox id="weighted" checked={isWeightedGraph} defaultChecked={isWeightedGraph} onCheckedChange={(checked) => {
                if (checked !== 'indeterminate')
                  setIsWeightedGraph(checked)
              }}>
              </Checkbox><Label htmlFor="weighted">{t("With Cost")}</Label>

            </div>
            <div className="flex w-full max-w-sm items-center gap-3">

              <Checkbox id="walled" checked={isRandomWall} defaultChecked={isRandomWall} onCheckedChange={(checked) => {
                if (checked !== 'indeterminate')
                  setIsRandomWall(checked)
              }}>
              </Checkbox><Label htmlFor="walled">{t("Randomized Wall")}</Label>

            </div>
          </div>

          <Label>{t("Algorithm")}</Label>

          <div className="grid grid-cols-2 gap-3">
            {algorithms.map((algorithm) => {
              return <div className="flex w-full max-w-sm items-center gap-3" key={`algo-${algorithm.algoKey}`}>

                <Checkbox id={`cb-algo-${algorithm.algoKey}`} checked={selected[algorithm.algoKey]} defaultChecked={true} onCheckedChange={(checked) => {
                  if (checked !== 'indeterminate')
                    setSelected((prev) => {
                      const temp = { ...prev }
                      temp[algorithm.algoKey] = checked
                      return temp;
                    })
                }}>
                </Checkbox><Label htmlFor={`cb-algo-${algorithm.algoKey}`}>{algorithm.title}</Label>

              </div>
            })}
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={() => {
            if (size >= 5 && size <= 45) {
              setLoading(true)
              setShowCard(false)
              if (!isWeightedGraph) {
                setIsWeightShown(false)
              }
            } else {
              toast({
                title: t("Cant Set"),
                description: t("Cant Set Desc"),
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
        }}>{t('Reset')}</Button>



        <div className="flex gap-6">

          {isWeightedGraph && <div className="flex items-center space-x-2">
            <Switch id="show-weight" checked={isWeightShown} onCheckedChange={(checked) => {
              setIsWeightShown(checked)
            }} />
            <Label htmlFor="show-weight">{t("Number")}</Label>
          </div>}
          <div className="flex items-center space-x-2">
            <Switch id="show-weight" checked={isIconShown} onCheckedChange={(checked) => {
              setIsIconShown(checked)
            }} />
            <Label htmlFor="show-weight">{t("Icon")}</Label>
          </div>
          {/* <div className="flex gap-2">
            <Link href={'/en'} locale="en">
              <Button size={'sm'} variant={locale == 'en' ? 'default' : 'outline'}>EN</Button>
            </Link>
            <Link href={'/ja'} locale="ja">
              <Button size={'sm'} variant={locale == 'ja' ? 'default' : 'outline'}>JA</Button>
            </Link>
          </div> */}
        </div>

      </div>

      <div className="fixed bottom-6 w-full flex justify-center z-20">
        <div className=" py-4 border px-6 rounded-xl w-fit gap-6 flex shadow-lg bg-white">
          <Button variant={'outline'} onClick={() => {
            stopPlay()
            setFrame(0)
          }}>
            <ChevronsLeft />
          </Button>
          <Button onClick={() => {
            handleButtonClick()
          }}>{isRunning ? t("Playing") : t("Play")}</Button>

          <Button variant={'outline'} onClick={() => {
            stopPlay()
            setFrame(99999999)
          }}>
            <ChevronsRight />
          </Button>
        </div>
      </div>


      <main className="relative flex  items-center justify-center p-12 w-fit mx-auto gap-4 flex-wrap">

        {algorithms.map(({ title, subtitle, algoKey }) => (
          states[algoKey] && selected[algoKey] && (
            <Frame
              key={title}
              showIcon={isIconShown}
              currentFrame={frame}
              log={log.map((x) => x[algoKey])}
              frames={states[algoKey].frames}
              title={title}
              subtitle={subtitle}
              onGridClick={handleOnGridClick}
              mousePos={mousePos}
              setMousePos={handleSetMousePos}
              weight={weight}
              isWeightedGraph={isWeightedGraph}
              showWeight={isWeightShown}
            />
          )
        ))}

      </main>
    </div>
  );
}
