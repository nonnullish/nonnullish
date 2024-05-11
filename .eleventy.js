const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const pluginDate = require("eleventy-plugin-date");
const pluginRss = require("@11ty/eleventy-plugin-rss");
const markdownIt = require("markdown-it");
const markdownItFootnote = require("markdown-it-footnote");
const fs = require("fs");
const path = require("path");
const { createCanvas, loadImage, registerFont } = require("canvas");
const CanvasTextBlock = require("canvas-text-block");
const inspect = require("node:util").inspect;
const dayjs = require("dayjs");
const { getBlogroll } = require("./blogroll/blogroll.js");
const { execSync } = require('child_process')

module.exports = (eleventyConfig) => {
  // collections
  eleventyConfig.addCollection("rss", (collectionApi) => collectionApi.getFilteredByGlob(["weeknotes/**/*", "posts/**/*", "projects/**/*"]));
  eleventyConfig.addCollection("projects", (collectionApi) => collectionApi.getFilteredByGlob("projects/**/*"));
  eleventyConfig.addCollection("posts", (collectionApi) => collectionApi.getFilteredByGlob("posts/**/*"));
  eleventyConfig.addCollection("weeknotes", (collectionApi) => {
    const weeknotes = collectionApi.getFilteredByGlob("weeknotes/**/*");
    const years = weeknotes.map(post => post.date.getFullYear());
    const months = weeknotes.map(post => post.date.getMonth());

    const uniqueYears = [...new Set(years)];
    const uniqueMonths = [...new Set(months)];

    const byMonth = (group) => uniqueMonths.reduce((prev, month) => {
      const posts = group.filter(post => post.date.getMonth() === month);

      return [
        ...prev,
        ...posts.length ? [{ month, posts }] : []
      ]
    }, []);

    const byYear = uniqueYears.reduce((prev, year) => {
      const posts = byMonth(weeknotes.filter(post => post.date.getFullYear() === year));

      return [
        ...prev,
        ...posts.length ? [{ year, posts }] : []
      ]
    }, []);

    return byYear;
  });

  // plugins
  eleventyConfig.addPlugin(syntaxHighlight, {
    alwaysWrapLineHighlights: true,
  });

  const markdownLibrary = markdownIt({
    html: true,
    breaks: true,
    linkify: true,
    typographer: true,
  })
    .use(markdownItFootnote);

  markdownLibrary.renderer.rules.footnote_caption = (tokens, idx) => {
    let n = Number(tokens[idx].meta.id + 1).toString();

    if (tokens[idx].meta.subId > 0) {
      n += ":" + tokens[idx].meta.subId;
    }

    return n;
  };

  eleventyConfig.setLibrary("md", markdownLibrary);

  eleventyConfig.addPlugin(pluginDate);
  eleventyConfig.addPlugin(pluginRss);

  // filters
  eleventyConfig.addFilter("inspect", (object = {}) => inspect(object, { sorted: true }));
  eleventyConfig.addFilter("MMM-YYYY", (date) => dayjs(date).format('MMM YYYY'));
  eleventyConfig.addFilter("dateNow", (_) => dayjs().toISOString());

  eleventyConfig.addFilter("smartquotes", (post) => {
    const hawaii = new RegExp(/(?<=<(h|l|p[^r]).*)Hawai'i/g);
    const slang = new RegExp(/'(cause|em|til|twas)/g);
    const apostrophes = new RegExp(/(?<=<(h|l|p[^r]).*)\b'\b/g);
    const years = new RegExp(/(?<=\s)'(?=\d)/g);
    const openDoubles = new RegExp(/(?<=<(h|l|p[^r]).*)(?<=\s|>)&quot;/g);
    const closeDoubles = new RegExp(
      /(?<=<(h|l|p[^r]).*“.*)&quot;(?=(\s|\p{P}|<))/gu
    );
    const openSingles = new RegExp(/(?<=<(h|l|p[^r]).*)(?<=\s|>)'/g);
    const closeSingles = new RegExp(
      /(?<=<(h|l|p[^r]).*‘.*)'(?=(\s|\p{P}|<))/gu
    );

    return post
      .replace(hawaii, "Hawaiʻi")
      .replace(slang, "’$1")
      .replace(apostrophes, "’")
      .replace(years, "’")
      .replace(openDoubles, "“")
      .replace(closeDoubles, "”")
      .replace(openSingles, "‘")
      .replace(closeSingles, "’");
  });

  eleventyConfig.addFilter("previews", async function (title) {
    if (!title) {
      return;
    }

    registerFont("./assets/fonts/inter.ttf", { family: "Inter" });

    const width = 1200;
    const height = 630;
    const margin = 100;
    const canvas = createCanvas(width, height);
    const context = canvas.getContext("2d", { alpha: false });
    const output = path.dirname(this.page.outputPath);
    const filename = this.page.fileSlug.trim() || "preview";
    const ext = "png";
    const filepath = path.join(output, `${filename}.${ext}`);

    if (fs.existsSync(filepath)) {
      return `${filename}.${ext}`;
    }

    context.fillStyle = "#f4f4f4";
    context.fillRect(0, 0, width, height);

    if (!this.page.fileSlug) {
      const flower = await loadImage("./assets/images/favicon.png");
      const flowerSize = 48;
      const flowerPosition = {
        w: flowerSize,
        h: flowerSize,
        x: (width - flowerSize) / 2,
        y: (height - flowerSize) / 2 - 48,
      };

      let { w, h, x, y } = flowerPosition;
      context.drawImage(flower, x, y, w, h);

      const name = new CanvasTextBlock(
        canvas,
        width / 2 - 67,
        height / 2,
        width - 2 * margin,
        24 + margin,
        {
          color: "#222222",
          fontFamily: "Inter",
          fontSize: 28,
        }
      );
      name.setText('nonnullish');

      const domain = new CanvasTextBlock(
        canvas,
        width / 2 - 100,
        height / 2 + 48,
        width - 2 * margin,
        24 + margin,
        {
          color: "#222222",
          fontFamily: "Inter",
          fontSize: 24,
        }
      );
      domain.setText('sometimes.digital');

      const buffer = canvas.toBuffer("image/png");

      if (!fs.existsSync(output)) {
        fs.mkdirSync(output, { recursive: true });
      }

      fs.writeFileSync(filepath, buffer);

      return `${filename}.${ext}`;
    }

    const domain = new CanvasTextBlock(
      canvas,
      margin,
      margin,
      width - 2 * margin,
      24 + margin,
      {
        color: "#222222",
        fontFamily: "Inter",
        fontSize: 24,
      }
    );
    domain.setText('sometimes.digital');

    const date = new CanvasTextBlock(
      canvas,
      margin,
      height - 48 / 2 - 24 / 2 - margin,
      width - 2 * margin,
      24 + margin,
      {
        color: "#222222",
        fontFamily: "Inter",
        fontSize: 24,
      }
    );
    date.setText(this.ctx.date ? dayjs(this.page.date).format('dddd, MMMM D, YYYY') : '');

    const header = new CanvasTextBlock(
      canvas,
      margin,
      24 + margin + 32,
      width - 2 * margin,
      height - 3 * margin - 24,
      {
        color: "#222222",
        fontFamily: "Inter",
        fontSize: 32,
        lineHeight: 48,
      }
    );

    header.setText(title);

    const flower = await loadImage("./assets/images/favicon.png");
    const flowerSize = 48;
    const flowerPosition = {
      w: flowerSize,
      h: flowerSize,
      x: width - flowerSize - margin,
      y: height - flowerSize - margin,
    };

    let { w, h, x, y } = flowerPosition;
    context.drawImage(flower, x, y, w, h);

    const buffer = canvas.toBuffer("image/png");

    if (!fs.existsSync(output)) {
      fs.mkdirSync(output, { recursive: true });
    }

    fs.writeFileSync(filepath, buffer);

    return `${filename}.${ext}`;
  });

  // blogroll
  eleventyConfig.addGlobalData(
  "blogroll",
  async () => await getBlogroll(),
  )

  // settings
  eleventyConfig.setServerOptions({
    showAllHosts: true,
  });

  // pagefind
  eleventyConfig.on('eleventy.after', () => {
    execSync(`npx pagefind --source _site --glob \"**/*.html\"`, { encoding: 'utf-8' })
  })
};