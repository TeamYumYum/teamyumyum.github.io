/*
 * 글 썸네일(cover.png, 1280×720)을 만든다. 분류 색 바탕에 짧은 제목과 꾸기 포즈를 얹는다.
 *
 *   node scripts/make-cover.mjs <글 폴더> --cat tech --pose laptop --title "첫 줄\n둘째 줄" --sub "한 줄 설명"
 *
 * 만든 뒤 글 frontmatter에 cover: ./cover.png 를 적는다.
 * 그리는 엔진은 OG 이미지를 만드는 astro-og-canvas가 쓰는 canvaskit-wasm을 그대로 빌려 쓴다.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import CanvasKitInit from 'canvaskit-wasm';

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    cat: { type: 'string' },
    pose: { type: 'string' },
    title: { type: 'string' },
    sub: { type: 'string', default: '' },
  },
});
const [dir] = positionals;
if (!dir || !values.cat || !values.pose || !values.title) {
  console.error('사용법: node scripts/make-cover.mjs <글 폴더> --cat <분류> --pose <포즈> --title "<제목>" [--sub "<설명>"]');
  process.exit(1);
}

// tokens.css의 분류 전경색(--cat-*-fg)을 바탕으로 쓴다. 트러블슈팅은 주황 글씨가 흰 글씨를 가려서 짙은 회색 바탕에 주황 라벨로 둔다
const THEMES = {
  tech: { bg: '#1b64da', label: '#1b64da', name: '기술' },
  troubleshooting: { bg: '#1a1c20', label: '#e14d00', name: '트러블슈팅' },
  culture: { bg: '#067a5f', label: '#067a5f', name: '문화' },
  news: { bg: '#ff6600', label: '#e14d00', name: '소식' },
};
const theme = THEMES[values.cat];
if (!theme) throw new Error(`알 수 없는 분류: ${values.cat}`);

const W = 1280;
const H = 720;
const PAD = 80;

const CK = await CanvasKitInit();
const font = (w) => readFileSync(`node_modules/pretendard/dist/public/static/Pretendard-${w}.otf`);
const fontMgr = CK.FontMgr.FromData(font('Bold'), font('Medium'));
const surface = CK.MakeSurface(W, H);
const canvas = surface.getCanvas();
const paint = new CK.Paint();
paint.setAntiAlias(true);

canvas.clear(CK.parseColorString(theme.bg));

// 꾸기 뒤의 큰 원. 바탕보다 살짝 밝게
paint.setColor(CK.Color(255, 255, 255, 0.1));
canvas.drawCircle(W - 300, H - 220, 330, paint);

// 꾸기: 오른쪽 아래, 아래 가장자리에 살짝 걸친다
const mascot = CK.MakeImageFromEncoded(readFileSync(`src/assets/kkugi/${values.pose}.png`));
const box = { w: 470, h: 520 };
const scale = Math.min(box.w / mascot.width(), box.h / mascot.height());
const mw = mascot.width() * scale;
const mh = mascot.height() * scale;
const mx = W - PAD - mw + 20;
const my = H - mh + 30;
canvas.drawImageRectOptions(mascot, CK.XYWHRect(0, 0, mascot.width(), mascot.height()), CK.XYWHRect(mx, my, mw, mh), CK.FilterMode.Linear, CK.MipmapMode.Linear, new CK.Paint());

const text = (str, size, weight, color, maxWidth) => {
  const style = new CK.ParagraphStyle({
    textStyle: {
      color, fontFamilies: ['Pretendard'], fontSize: size, heightMultiplier: 1.28,
      fontStyle: { weight }, letterSpacing: -size * 0.02,
    },
  });
  const b = CK.ParagraphBuilder.Make(style, fontMgr);
  b.addText(str);
  const p = b.build();
  p.layout(maxWidth);
  return p;
};

// 분류 라벨(흰 알약)
const label = text(theme.name, 28, CK.FontWeight.Bold, CK.parseColorString(theme.label), 400);
const lw = label.getLongestLine();
const lh = label.getHeight();
paint.setColor(CK.WHITE);
canvas.drawRRect(CK.RRectXY(CK.XYWHRect(PAD, PAD, lw + 36, lh + 12), 999, 999), paint);
canvas.drawParagraph(label, PAD + 18, PAD + 6);

// 제목과 설명
const title = text(values.title.replaceAll('\\n', '\n'), 76, CK.FontWeight.Bold, CK.WHITE, 760);
const ty = PAD + lh + 48;
canvas.drawParagraph(title, PAD, ty);
if (values.sub) {
  const sub = text(values.sub, 32, CK.FontWeight.Medium, CK.Color(255, 255, 255, 0.82), 700);
  canvas.drawParagraph(sub, PAD, ty + title.getHeight() + 24);
}

const out = join(dir, 'cover.png');
writeFileSync(out, surface.makeImageSnapshot().encodeToBytes());
console.log(`만들었어요: ${out}`);
