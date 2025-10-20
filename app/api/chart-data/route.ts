import type { NextRequest } from "next/server";
import { GET as getByRange, revalidate } from "./[range]/route";

export { revalidate };

export async function GET(request: NextRequest) {
  return getByRange(request, { params: Promise.resolve({ range: "24H" }) });
}


