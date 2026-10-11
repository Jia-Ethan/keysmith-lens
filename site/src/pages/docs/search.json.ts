import { searchIndex } from "../../lib/search-index";

export async function GET() {
  return new Response(JSON.stringify(await searchIndex("zh")), { headers: { "Content-Type": "application/json" } });
}
