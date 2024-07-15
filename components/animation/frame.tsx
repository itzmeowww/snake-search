'use client'
import { Pos } from "@/lib/search";
import { GridElement } from "@/lib/snake";
import { useTranslations } from "next-intl";

const Frame = ({ log, frames, currentFrame, title, subtitle, onGridClick, mousePos, setMousePos, weight, showWeight, isWeightedGraph, showIcon }: { currentFrame: number, log: { frameN: number, dis: number }[], frames: GridElement[][][], title: string, subtitle: string, onGridClick: (row: number, col: number) => void, mousePos: Pos, setMousePos: (r: number, c: number) => void, weight: number[][], showWeight: boolean, isWeightedGraph: boolean, showIcon: boolean }) => {
  const canPlaceHoverStyle = "hover:bg-yellow-400 hover:border-red-600 hover:border-2 hover:cursor-pointer ";
  const canPlaceStyle = "bg-yellow-400 border-red-600 border-2 ";
  const t = useTranslations('Frame')
  return (
    <div className="flex flex-col justify-center w-fit items-center" onMouseLeave={() => { setMousePos(-1, -1) }}>
      {frames.length > 0 &&
        <>
          <h1 className="font-bold text-center text-base">{title}</h1>
          {/* <h1 className="text-center text-base">{subtitle}</h1> */}

          <div className="flex text-xs mt-6 text-gray-500 text-center">
            {frames[Math.min(currentFrame, frames.length - 1)].map((row, idxRow) => {
              return <div className="" key={idxRow}>
                {
                  row.map((elem, idxCol) => {
                    let content;
                    let bgColor;
                    let canPlace = true;
                    if (elem == GridElement.SnakeHead) {
                      content = showIcon ? '🕶️' : showWeight ? weight[idxRow][idxCol] : '';

                      bgColor = 'bg-green-600 text-white'
                      canPlace = false
                    }
                    else if ([GridElement.Snake].includes(elem)) {
                      content = showWeight ? weight[idxRow][idxCol] : '';
                      bgColor = 'bg-green-600 text-white'
                      canPlace = false
                    }
                    else if (elem == GridElement.OldSnake) {
                      content = showWeight ? weight[idxRow][idxCol] : '';
                      bgColor = 'bg-green-800 text-white'
                    }
                    else if (elem == GridElement.Apple) {
                      bgColor = 'bg-red-200'
                      content = showIcon ? '🍎' : showWeight ? weight[idxRow][idxCol] : '';
                      canPlace = false
                    }
                    else if (elem == GridElement.Past) {
                      bgColor = 'bg-orange-300'
                      content = showWeight ? weight[idxRow][idxCol] : '';

                    }
                    else if ([GridElement.Path, GridElement.PathL, GridElement.PathU, GridElement.PathD, GridElement.PathR].includes(elem)) {
                      bgColor = 'bg-gray-300'
                      switch (elem) {
                        case GridElement.PathU:
                          content = '⬆️';
                          break;
                        case GridElement.PathD:
                          content = '⬇️';
                          break;
                        case GridElement.PathL:
                          content = '⬅️';
                          break;
                        case GridElement.PathR:
                          content = '➡️';
                          break;
                      }
                    } else if (elem == GridElement.Visited) {
                      bgColor = 'bg-gray-300'
                      content = showWeight ? weight[idxRow][idxCol] : '';
                    }
                    else if (elem == GridElement.Wall) {
                      bgColor = 'bg-gray-800'
                      canPlace = false
                      content = '';
                    }
                    else content = showWeight ? weight[idxRow][idxCol] : '';
                    const gridStyles = `size-5 border ${bgColor} ${canPlace ? canPlaceHoverStyle : ''} ${mousePos.row == idxRow && mousePos.col == idxCol && canPlace ? canPlaceStyle : ''}`;

                    return (
                      <div
                        className={gridStyles}
                        key={`${idxRow}-${idxCol}`}
                        onMouseOver={() => {
                          setMousePos(idxRow, idxCol)
                        }}
                        onClick={() => { if (canPlace) onGridClick(idxRow, idxCol) }}
                      >
                        {content}
                      </div>
                    );
                  })
                }
              </div>
            })}
          </div>
          <div className={`grid ${isWeightedGraph ? 'grid-cols-5' : 'grid-cols-3'} mt-5 `}>
            <div className="text-sm  text-center flex flex-col">
              <span className="border px-3 bg-gray-100 font-bold">#</span>
              {log.map((x, idx) => (
                <span key={`fn${-idx}`} className={`border ${x.frameN == -1 && 'text-red-500'}`}>{idx + 1}</span>
              ))}
              <span className="border px-3 bg-gray-100 font-bold">{t("Total")}</span>

            </div>

            <div className="text-sm  text-center flex flex-col col-span-2">
              <span className="border px-3 bg-gray-100 font-bold">{t("Step")}</span>
              {log.map((x, idx) => (
                <span key={`fn${-idx}`} className={`border ${x.frameN == -1 && 'text-red-500'}`}>{x.frameN}</span>
              ))}
              <span className="border px-3 bg-gray-100 font-bold">{log.reduce((total, x) => x.dis == -1 ? total : total + x.frameN, 0)}</span>

            </div>
            {isWeightedGraph && <div className="text-sm text-center flex flex-col col-span-2">
              <span className="border px-3 bg-gray-100 font-bold">{t("Cost")}</span>
              {log.map((x, idx) => (
                <span key={`dis${-idx}`} className={`border ${x.dis == -1 && 'text-red-500'}`}>{x.dis}</span>

              ))}
              <span className="border px-3 bg-gray-100 font-bold">{log.reduce((total, x) => x.dis == -1 ?total: total + x.dis, 0)}</span>
            </div>}
          </div>
        </>
      }
    </div >
  );
}

export default Frame;
