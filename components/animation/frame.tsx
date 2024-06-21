'use client'
import { GridElement, Pos } from "@/lib/search";
import { useEffect, useState } from "react";


const Frame = ({ log, frames,speed = 5, title, onGridClick, mousePos, setMousePos, weight }: { speed:number,log: { frameN: number, dis: number }[], frames: GridElement[][][], title: string, onGridClick: (row: number, col: number) => void, mousePos: Pos, setMousePos: (r: number, c: number) => void, weight: number[][] }) => {
  const [frame, setFrame] = useState<number>(0)
  useEffect(() => {
    if (frames.length == 0) return

    const frame_interval = setInterval(() => {
      setFrame((res) => {
        if (res + 1 < frames.length) {

          return res + 1
        }
        else { return res }
      })

    }, 200)
    return () => {
      clearInterval(frame_interval)
      setFrame(0)
    }
  }, [frames])


  return (
    <div className="flex flex-col justify-center" onMouseLeave={() => {
      setMousePos(-1, -1)
    }}>
      {frames.length > 0 && frame < frames.length &&
        <>
          <h1 className="font-bold text-center text-base">{title}</h1>
          <div className="text-sm text-center">
            ステップ：
            {log.map((x, idx) => {
              return <span key={`fn${-idx}`}>
                {x.frameN}, </span>
            })}
          </div>
          <div className="text-sm text-center">
            距離：
            {log.map((x, idx) => {
              return <span key={`dis${-idx}`}>
                {x.dis}, </span>
            })}
          </div>
          <div className="flex text-xs mt-6 text-gray-500 text-center">
            {frames[frame].map((row, idxRow) => {
              return <div className="" key={idxRow}>
                {
                  row.map((elem, idxCol) => {
                    if ([GridElement.SnakeHead].includes(elem)) return <div className="size-5 bg-blue-600 text-white border hover:cursor-pointer" key={`${idxRow}-${idxCol}`}>
                      {/* {elem == GridElement.SnakeHead && '🕶️'} */}
                      {weight[idxRow][idxCol]}
                    </div>
                    else if ([GridElement.Snake].includes(elem)) return <div className="size-5 bg-green-600 text-white border hover:cursor-pointer" key={`${idxRow}-${idxCol}`}>
                      {/* {elem == GridElement.SnakeHead && '🕶️'} */}
                      {weight[idxRow][idxCol]}
                    </div>
                    else if (elem == GridElement.Apple) return <div className="size-5 bg-red-600" key={`${idxRow}-${idxCol}`}>
                    </div>
                    else if (elem == GridElement.Past) return <div className="size-5 bg-orange-200 border hover:cursor-pointer" key={`${idxRow}-${idxCol}`}>
                      {weight[idxRow][idxCol]}
                    </div>
                    else if ([GridElement.Path, GridElement.PathL, GridElement.PathU, GridElement.PathD, GridElement.PathR].includes(elem)) return <div className="size-5 border bg-gray-300 text-center self-center hover:cursor-pointer" key={`${idxRow}-${idxCol}`}>
                      {
                        elem === GridElement.PathU ? (
                          <>
                            ⬆️
                          </>
                        ) : elem === GridElement.PathD ? (
                          <>
                            ⬇️
                          </>
                        ) : elem === GridElement.PathL ? (
                          <>
                            ⬅️
                          </>
                        ) : elem === GridElement.PathR ? (
                          <>
                            ➡️
                          </>
                        ) : (
                          <>{weight[idxRow][idxCol]}</>
                        )
                      }

                    </div>
                    else if (elem == GridElement.Visited) return <div className={`size-5 border bg-gray-300 hover:bg-yellow-200 hover:cursor-pointer ${mousePos.row == idxRow && mousePos.col == idxCol && 'bg-yellow-200'}`} key={`${idxRow}-${idxCol}`} onMouseOver={() => {
                      setMousePos(idxRow, idxCol)
                    }} onClick={() => {
                      onGridClick(idxRow, idxCol)
                    }}>
                      {weight[idxRow][idxCol]}
                    </div>
                    else if (elem == GridElement.OldSnake) return <div className={`size-5 border bg-green-800 hover:bg-yellow-200 hover:cursor-pointer ${mousePos.row == idxRow && mousePos.col == idxCol && 'bg-yellow-200'}`} key={`${idxRow}-${idxCol}`} onMouseOver={() => {
                      setMousePos(idxRow, idxCol)
                    }} onClick={() => {
                      onGridClick(idxRow, idxCol)
                    }}>

                    </div>
                    else if (elem == GridElement.Wall) return <div className="size-5 border bg-gray-600" key={`${idxRow}-${idxCol}`}>
                    </div>
                    else return <div className={`size-5 border hover:bg-yellow-200 hover:cursor-pointer ${mousePos.row == idxRow && mousePos.col == idxCol && 'bg-yellow-200'}`} key={`${idxRow}-${idxCol}`} onMouseOver={() => {
                      setMousePos(idxRow, idxCol)
                    }} onClick={() => {
                      onGridClick(idxRow, idxCol)
                    }}>
                      {weight[idxRow][idxCol]}
                    </div>
                  })
                }
              </div>
            })}
          </div>
        </>
      }

    </div>
  );
}

export default Frame;