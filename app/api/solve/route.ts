import { AlgoType, make_frames } from "@/lib/search"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const size = parseInt(searchParams.get('size') || "15")
  const appleN = parseInt(searchParams.get('appleN') || "10")
  const algo = searchParams.get('algo') as AlgoType
  
  const startTime = new Date().getTime();

  const frames = make_frames(algo, size,appleN)
  const endTime = new Date().getTime();
  return Response.json({ frames, time: endTime-startTime })
}