import { defineCollection, reference, z } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { CATEGORIES, CONTEXTS } from './site.config';

const categoryIds = CATEGORIES.map((c) => c.id) as [string, ...string[]];
const contextIds = CONTEXTS.map((c) => c.id) as [string, ...string[]];

const authors = defineCollection({
  loader: file('src/data/authors.json'),
  schema: z.object({
    name: z.string().min(1),
    // 팀원이 아닌 공동 필자(예: 팀 계정)는 팀 페이지에 나오지 않는다
    member: z.boolean().default(true),
    context: z.enum(contextIds).optional(),
    tracks: z.array(z.string()).default([]),
    lead: z.boolean().default(false),
    github: z.string().optional(),
    // 사람 사진 대신 꾸기 얼굴을 아바타로 쓴다(팀 계정용). 값은 Mascot의 포즈 이름
    mascot: z.enum(['f-idle', 'f-smile', 'f-calm', 'f-q']).optional(),
    bio: z.string().optional(),
  }),
});

const posts = defineCollection({
  loader: glob({
    pattern: '**/*.md',
    base: './src/content/posts',
    // 2026-10-19-hello.md → hello, 2026-10-19-review-day/index.md → review-day (URL에 날짜를 넣지 않는다)
    generateId: ({ entry }) =>
      entry
        .replace(/\/index\.md$/, '')
        .replace(/\.md$/, '')
        .replace(/^\d{4}-\d{2}-\d{2}-/, ''),
  }),
  schema: ({ image }) =>
    z.object({
      title: z.string().min(1),
      description: z.string().min(1),
      pubDate: z.coerce.date(),
      category: z.enum(categoryIds),
      authors: z.array(reference('authors')).min(1),
      tags: z.array(z.string()).default([]),
      draft: z.boolean().default(false),
      // 글 폴더 기준 상대 경로. 예: ./cover.jpg
      cover: image().optional(),
      coverAlt: z.string().optional(),
    }),
});

export const collections = { authors, posts };
