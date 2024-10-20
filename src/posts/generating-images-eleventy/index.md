---
title: Generating Open Graph images in Eleventy
description: Autogenerating image previews with Eleventy filter functions and node-canvas
date: 2023-12-17T13:17:00+01:00
tags: eleventy
---

I added the `og:media` image tags yesterday, and the approach seems to work, so I'm going to share it in this post.

I am using the [filter functions](https://www.11ty.dev/docs/filters/) and generating the raster images directly inside of the filter with `canvas-text-block` and `node-canvas`, as described [in this article](https://blog.logrocket.com/creating-saving-images-node-canvas/).

First I added the meta tags to my default layout. I called the filter `previews`, and I will be using the `title` variable as the argument.

```plain
<meta property="og:image" content="{% raw %}{{ title | previews }}{% endraw %}" />
```

Then I wrote the filter.

```js
const fs = require('fs');
const path = require('path');
const { createCanvas, registerFont } = require("canvas");
const CanvasTextBlock = require("canvas-text-block");

...

eleventyConfig.addFilter("previews", async function (title) {
  // register custom fonts, if you want to use any
  // this step has to be done before creating the canvas
  registerFont('./custom-font.ttf', { family: 'Custom Font' });

  // set layout variables
  const width = 1200;
  const height = 630;
  const margin = 100;
  const fontSize = 20;

  // create the canvas
  const canvas = createCanvas(width, height);

  // get the output path
  const output = path.dirname(this.page.outputPath);

  // set the filename to the slug of the page, or "preview" as a backup
  const filename = this.page.fileSlug.trim() || 'preview';

  // set the extension
  const ext = "png";

  // create the full output path
  const filepath = path.join(output, `${filename}.${ext}`);

  // maybe the file already exists - in that case, just return the relative path
  if (fs.existsSync(filepath)) {
    return `${filename}.${ext}`;
  }

  // use CanvasTextBlock for line wrapping
  const header = new CanvasTextBlock(
    canvas,
    margin, // the x position
    height / 2 - fontSize, // the y position
    width - 2 * margin, // the width
    height - 2 * margin, // the height
    {
      color: "#000000",
      fontFamily: "Custom Font",
      fontSize,
      
    }
  );

  header.setText(title);

  // create the image
  const buffer = canvas.toBuffer("image/png");

  // create the output directory if it doesn't already exist
  if (!fs.existsSync(output)) {
    fs.mkdirSync(output, { recursive: true });
  }

  // write the file
  fs.writeFileSync(filepath, buffer);

  // return the relative file path
  return `${filename}.${ext}`;
});
```

This is the bare-bones set-up, without any decorations, or the name of the author, or anything like that, but [this article](https://blog.logrocket.com/creating-saving-images-node-canvas/) and the [node-canvas](https://github.com/Automattic/node-canvas) documentation describe how to add more things.