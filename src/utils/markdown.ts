import { marked } from "marked";

marked.use({
  async: false,
  gfm: true,
});

export const markedToHTML = (text: string) =>
  marked.parse(text, {
    async: false,
  });
