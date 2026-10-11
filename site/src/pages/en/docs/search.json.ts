import { searchIndex } from "../../../lib/search-index";

export async function GET() {
  return new Response(JSON.stringify(await searchIndex("en")), { headers: { "Content-Type": "application/json" } });
}
