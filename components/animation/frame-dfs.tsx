'use client'
import { GridElement, make_frames } from "@/lib/search";
import { useEffect, useState } from "react";
let frames : GridElement[][][] = make_frames('DFS', 11)

const FrameDFS = () => {
    

    const [frame, setFrame] = useState<number>(0)
    useEffect(() => {
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
        }
      }, [])
    return (
        <div className="flex">
        {frames[frame].map((row, idxRow) => {
          return <div className="" key={idxRow}>
            {
              row.map((elem, idxCol) => {
                if (elem == GridElement.Snake) return <div className="size-8 bg-green-600 border" key={`${idxRow}-${idxCol}`}>
                </div>
                else if (elem == GridElement.Apple) return <div className="size-8 bg-red-600" key={`${idxRow}-${idxCol}`}>
                </div>
                else if (elem == GridElement.Path) return <div className="size-8 border bg-gray-300" key={`${idxRow}-${idxCol}`}>
                </div>
                else if (elem == GridElement.Wall) return <div className="size-8 border bg-gray-600" key={`${idxRow}-${idxCol}`}>
                </div>
                else return <div className="size-8 border" key={`${idxRow}-${idxCol}`}>
                </div>
              })
            }
          </div>
        })}
      </div>
    );
}

export default FrameDFS;