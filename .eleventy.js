import syntaxHighlight from "@11ty/eleventy-plugin-syntaxhighlight";
import rss from "@11ty/eleventy-plugin-rss";
import { createFlickr } from "flickr-sdk";
import markdownIt from "markdown-it";
import footnotes from "markdown-it-footnote";
import anchors from "markdown-it-anchor";
import { execSync } from "child_process";
import dotenv from "dotenv";

// import { getBlogroll } from "./src/blogroll/blogroll.js";

dotenv.config();

const addCollection = (config, name, globs) => {
  config.addCollection(name, (handler) => handler.getFilteredByGlob(globs));
};

const addCopies = (config, formats) => {
  for (const format of formats) {
    config.addPassthroughCopy(`src/**/*.${format}`);
  }
};

export default async function (config) {
  config.setTemplateFormats(["md", "njk", "html"]);
  addCopies(config, [
    "css",
    "domains",
    "gif",
    "jpg",
    "mp4",
    "otf",
    "png",
    "svg",
    "ttf",
    "txt",
    "webm",
    "webmanifest",
    "webp",
    "woff",
    "woff2",
  ]);

  config.addPlugin(rss);
  config.addPlugin(syntaxHighlight, {
    alwaysWrapLineHighlights: true,
  });

  const markdown = markdownIt({
    html: true,
    breaks: true,
    linkify: true,
    typographer: true,
  })
    .use(footnotes)
    .use(anchors, {
      permalink: anchors.permalink.headerLink({
        safariReaderFix: true,
      }),
    });

  markdown.renderer.rules.footnote_caption = (tokens, idx) => {
    let n = Number(tokens[idx].meta.id + 1).toString();

    if (tokens[idx].meta.subId > 0) {
      n += ":" + tokens[idx].meta.subId;
    }

    return n;
  };

  config.setLibrary("md", markdown);

  addCollection(config, "rss", ["src/weeknotes/**/*", "src/posts/**/*", "src/projects/**/*"]);
  addCollection(config, "rssPosts", "src/posts/**/*");
  addCollection(config, "rssWeeknotes", "src/weeknotes/**/*");
  addCollection(config, "posts", "src/posts/**/*");

  config.addCollection("weeknotes", (handler) => {
    const weeknotes = handler.getFilteredByGlob("src/weeknotes/**/*");    
    const years = weeknotes.map((post) => post.date.getFullYear());
    const months = weeknotes.map((post) => post.date.getMonth());

    const uniqueYears = [...new Set(years)];
    const uniqueMonths = [...new Set(months)];

    const byMonth = (group) =>
      uniqueMonths.reduce((prev, month) => {
        const posts = group.filter((post) => post.date.getMonth() === month);

        return [...prev, ...(posts.length ? [{ month, posts }] : [])];
      }, []);

    const byYear = uniqueYears.reduce((prev, year) => {
      const posts = byMonth(weeknotes.filter((post) => post.date.getFullYear() === year));

      return [...prev, ...(posts.length ? [{ year, posts }] : [])];
    }, []);

    return byYear;
  });

  config.addGlobalData("photostream", async () => {
    if (process.env.MODE === "development") {
      return [];
    }

    const size = "c";
    const key = process.env.FLICKR_API_KEY;
    const { flickr } = createFlickr(key);
    const response = await flickr("flickr.people.getPublicPhotos", {
      user_id: process.env.FLICKR_USER_ID,
      per_page: "500",
    });

    return response.photos.photo.map(({ id, title, secret, server }) => ({
      title,
      url: `https://live.staticflickr.com/${server}/${id}_${secret}_${size}.jpg`,
    }));
  });

  // config.addGlobalData("blogroll", async () => {
  //   if (process.env.MODE === "development") {
  //     return [];
  //   }

  //   return await getBlogroll();
  // });

  config.addFilter("now", (_) => new Date());
  config.addFilter("readableDate", (date) => `${date.toLocaleString("en", { month: "long", day: "numeric", year: "numeric" })}`);
  config.addFilter("isoDate", (date) => date.toISOString());

  config.addShortcode("link", function (url, label) {
    const isActive = this.page.url === url;
    return `<a ${
      isActive ? 'aria-current="page"' : ""
    } href="${url.at(-1) === "/" ? url.slice(0, -1) : url}">${label}</a>`;
  });

  config.on("eleventy.after", () => {
    execSync(`npx pagefind --site _site --glob \"**/*.html\"`, { encoding: "utf-8" });
  });

  config.setServerOptions({
    showAllHosts: true,
  });
}
