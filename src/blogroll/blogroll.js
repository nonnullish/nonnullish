import Parser from 'rss-parser';
import blogroll from "./blogroll.json" with { "type": "json" };

const parser = new Parser({ timeout: 5000 });

export const getBlogroll = async () => {
  const feeds = [];

  for await (const { url } of blogroll) {
    let feed;

    try {
      feed = await parser.parseURL(url);
    } catch(e) {
      continue;
    }

    const post = feed.items.sort((a, b) => new Date(b.isoDate) - new Date(a.isoDate))?.at(0);

    const entry = {
      title: feed.title.trim(),
      link: feed.link.trim(),
      post: {
        title: post.title.trim(),
        link: post.link.trim(),
        isoDate: post.isoDate,
      }
    };
    console.log(entry)
    feeds.push(entry);
  }

  return feeds.sort((a, b) => new Date(a.post.isoDate) - new Date(b.post.isoDate));
}
