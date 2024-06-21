'use client'
import { GridElement, Pos } from "@/lib/search";
import { useEffect, useState } from "react";


const Frame = ({ log, frames, speed, title, subtitle, onGridClick, mousePos, setMousePos, weight, showWeight }:
  { speed: number, log: { frameN: number, dis: number }[], frames: GridElement[][][], title: string, subtitle: string, onGridClick: (row: number, col: number) => void, mousePos: Pos, setMousePos: (r: number, c: number) => void, weight: number[][], showWeight: boolean }) => {
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

    }, Math.floor(200 / speed))
    return () => {
      clearInterval(frame_interval)
      setFrame(0)
    }
  }, [frames])

  const canPlaceHoverStyle = "hover:bg-yellow-400 hover:border-red-600 hover:border-2 hover:cursor-pointer "
  const canPlaceStyle = "bg-yellow-400 border-red-600 border-2 "
  return (
    <div className="flex flex-col justify-center w-fit items-center" onMouseLeave={() => {
      setMousePos(-1, -1)
    }}>
      {frames.length > 0 && frame < frames.length &&
        <>
          <h1 className="font-bold text-center text-base">{title}</h1>
          <h1 className="text-center text-base">{subtitle}</h1>
          {/* <hr className="my-4"/> */}

          <div className="flex text-xs mt-6 text-gray-500 text-center">
            {frames[frame].map((row, idxRow) => {
              return <div className="" key={idxRow}>
                {
                  row.map((elem, idxCol) => {
                    if ([GridElement.SnakeHead].includes(elem)) return <div className="relative size-5 bg-green-600 text-white border hover:cursor-pointer" key={`${idxRow}-${idxCol}`}>
                      <span className="z-10 absolute w-full h-full flex items-center justify-center opacity-80">
                        {elem == GridElement.SnakeHead && '🕶️'}</span>
                      {showWeight && weight[idxRow][idxCol]}
                    </div>
                    else if ([GridElement.Snake].includes(elem)) return <div className="size-5 bg-green-600 text-white border hover:cursor-pointer" key={`${idxRow}-${idxCol}`}>
                      {/* {elem == GridElement.SnakeHead && '🕶️'} */}
                      {showWeight && weight[idxRow][idxCol]}
                    </div>
                    else if (elem == GridElement.OldSnake) return <div className={`size-5 border  text-white 
                        ${mousePos.row == idxRow && mousePos.col == idxCol ? canPlaceStyle: 'bg-green-900'}`} key={`${idxRow}-${idxCol}`}
                      onMouseOver={() => {
                        setMousePos(idxRow, idxCol)
                      }} onClick={() => {
                        onGridClick(idxRow, idxCol)
                      }}>
                      {/* {showWeight && weight[idxRow][idxCol]} */}
                    </div>
                    else if (elem == GridElement.Apple) return <div className="size-5 bg-red-600" key={`${idxRow}-${idxCol}`}>
                    </div>
                    else if (elem == GridElement.Past) return <div className={`size-5 border bg-orange-300 ${canPlaceHoverStyle}
                       ${mousePos.row == idxRow && mousePos.col == idxCol ? canPlaceStyle : ''}`} key={`${idxRow}-${idxCol}`} onMouseOver={() => {
                      setMousePos(idxRow, idxCol)
                    }} onClick={() => {
                      onGridClick(idxRow, idxCol)
                    }}>
                      {showWeight && weight[idxRow][idxCol]}
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
                          <>{showWeight && weight[idxRow][idxCol]}</>
                        )
                      }

                    </div>
                    else if (elem == GridElement.Visited) return <div className={`size-5 border bg-gray-300 ${canPlaceHoverStyle} ${mousePos.row == idxRow && mousePos.col == idxCol && canPlaceStyle}`} key={`${idxRow}-${idxCol}`} onMouseOver={() => {
                      setMousePos(idxRow, idxCol)
                    }} onClick={() => {
                      onGridClick(idxRow, idxCol)
                    }}>
                      {showWeight && weight[idxRow][idxCol]}
                    </div>

                    else if (elem == GridElement.Wall) return <div className="size-5 border bg-gray-600" key={`${idxRow}-${idxCol}`}>
                    </div>
                    else return <div className={`size-5 border ${canPlaceHoverStyle} ${mousePos.row == idxRow && mousePos.col == idxCol ? canPlaceStyle : ''}`} key={`${idxRow}-${idxCol}`} onMouseOver={() => {
                      setMousePos(idxRow, idxCol)
                    }} onClick={() => {
                      onGridClick(idxRow, idxCol)
                    }}>
                      {showWeight && weight[idxRow][idxCol]}
                    </div>
                  })
                }
              </div>
            })}
          </div>
          <div className="grid grid-cols-2 mt-5">
            <div className="text-sm  text-center flex flex-col">
              <span className="border px-3 bg-gray-100 font-bold">ステップ</span>

              {log.map((x, idx) => {
                return <span key={`fn${-idx}`} className="border">
                  {x.frameN} </span>
              })}
            </div>
            <div className="text-sm text-center flex flex-col">
              <span className="border px-3 bg-gray-100  font-bold">距離</span>
              {log.map((x, idx) => {
                return <span key={`dis${-idx}`} className="border">
                  {x.dis} </span>
              })}
            </div>
          </div>
        </>
      }

    </div>
  );
}

export default Frame;