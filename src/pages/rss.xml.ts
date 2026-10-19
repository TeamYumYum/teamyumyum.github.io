import rss from '@astrojs/rss';
import { getVisiblePosts } from '../lib/posts';
import { SITE, getCategory } from '../site.config';

export async function GET() {
  const posts = await getVisiblePosts();
  return rss({
    title: SITE.title,
    description: SITE.description,
    site: SITE.url,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: `/posts/${post.id}`,
      categories: [getCategory(post.data.category).name, ...post.data.tags],
    })),
    customData: '<language>ko</language>',
  });
}
