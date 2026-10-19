// 이 캔버스 렌더러는 CSS 변수를 읽지 못하므로 tokens.css의 라이트 테마 값을 RGB로 옮겨 적었다.
// 토큰을 바꾸면 여기도 고친다: --brand-weak #fff2ec, --brand #ff6600, --text #1a1c20, --text-dim #555d6d
import { OGImageRoute } from 'astro-og-canvas';
import { getVisiblePosts } from '../../lib/posts';
import { SITE } from '../../site.config';

const pages: Record<string, { title: string; description: string }> = {};
for (const p of await getVisiblePosts()) {
  pages[p.id] = { title: p.data.title, description: p.data.description };
}
pages['site'] = { title: SITE.title, description: SITE.description };

export const { getStaticPaths, GET } = await OGImageRoute({
  pages,
  getImageOptions: (_path, page) => ({
    title: page.title,
    description: page.description,
    bgGradient: [[255, 242, 236]],
    border: { color: [255, 102, 0], width: 24, side: 'block-end' },
    padding: 72,
    logo: { path: './public/og-logo.png', size: [96] },
    font: {
      title: { size: 60, weight: 'Bold', color: [26, 28, 32], lineHeight: 1.3, families: ['Pretendard'] },
      description: { size: 30, weight: 'Normal', color: [85, 93, 109], lineHeight: 1.5, families: ['Pretendard'] },
    },
    // 빌드 때 satori로 그리므로 웹폰트가 아니라 폰트 파일이 필요하다. pretendard 패키지의 파일을 읽는다
    fonts: [
      './node_modules/pretendard/dist/web/static/woff2/Pretendard-Bold.woff2',
      './node_modules/pretendard/dist/web/static/woff2/Pretendard-Regular.woff2',
    ],
  }),
});
