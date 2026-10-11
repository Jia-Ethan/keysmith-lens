import { getCollection } from "astro:content";
import { href, type Lang } from "../i18n/ui";

/** Plain text of each chapter for the docs search box: title, lede and body. */
export async function searchIndex(lang: Lang) {
  const docs = (await getCollection("docs", (e) => e.id.startsWith(`${lang}/`))).sort((a, b) => a.data.order - b.data.order);
  return docs.map((e) => ({
    t: e.data.title,
    u: href(lang, `/docs/${e.data.page}/`),
    k: [
      e.data.lede,
      (e.body ?? "")
        .replace(/```[\s\S]*?```/g, " ")
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
        .replace(/[#>*`|_-]+/g, " ")
        .replace(/\s+/g, " "),
    ].join(" "),
  }));
}
