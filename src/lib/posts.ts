import { getCollection, getEntries, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'posts'>;
export type Author = CollectionEntry<'authors'>;

/** draft를 제외하고(프로덕션 빌드에서만) 최신순으로 정렬한 글 목록 */
export async function getVisiblePosts(): Promise<Post[]> {
  const posts = await getCollection('posts', ({ data }) =>
    import.meta.env.PROD ? data.draft === false : true,
  );
  return posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

export async function getPostAuthors(post: Post): Promise<Author[]> {
  return getEntries(post.data.authors);
}

/**
 * 읽는 시간(분). 코드블록과 마크다운 기호를 걷어낸 뒤 글자 수로 계산한다.
 * 한국어는 어절이 길어 단어 수로 세면 빗나가므로 분당 500자를 기준으로 한다.
 */
export function readingMinutes(body: string | undefined): number {
  if (!body) return 1;
  const text = body
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]*`/g, '')
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/[*_>|-]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return Math.max(1, Math.round(text.length / 500));
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Asia/Seoul' });
}

/** 같은 카테고리의 다른 글을 최신순으로 limit개 */
export async function getRelatedPosts(current: Post, limit = 3): Promise<Post[]> {
  const posts = await getVisiblePosts();
  return posts
    .filter((p) => p.id !== current.id && p.data.category === current.data.category)
    .slice(0, limit);
}

export function tagSlug(tag: string): string {
  return tag.trim().toLowerCase().replace(/\s+/g, '-');
}
