/*
 * RAG 설계기 시리즈 표지. 기존 카테고리 표지와 구분되는 연보라 배경을 쓴다.
 * node scripts/make-rag-series-cover.mjs <글 폴더> --episode 1 --title '검색 모델은\n어떻게 골랐나'
 * 캐릭터는 꾸기 원본 poses/f-q.png를 긴 변 1024px로 줄인 rag-question.png다.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import CanvasKitInit from 'canvaskit-wasm';

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: { episode: { type: 'string' }, title: { type: 'string' } },
});
const [dir] = positionals;
if (!dir || !values.episode || !values.title || !/^\d{1,2}$/.test(values.episode)) {
  throw new Error('사용법: node scripts/make-rag-series-cover.mjs <글 폴더> --episode <1~99> --title <두 줄 제목>');
}
const CK = await CanvasKitInit();
const fontMgr = CK.FontMgr.FromData(...['Bold', 'Medium'].map((weight) => readFileSync(`node_modules/pretendard/dist/public/static/Pretendard-${weight}.otf`)));
const surface = CK.MakeSurface(1280, 720);
const canvas = surface.getCanvas();
const paint = new CK.Paint();
paint.setAntiAlias(true);
const color = (hex) => CK.parseColorString(hex);
const rect = (x, y, w, h, hex, radius = 0) => {
  paint.setColor(color(hex));
  canvas.drawRRect(CK.RRectXY(CK.XYWHRect(x, y, w, h), radius, radius), paint);
};
const text = (str, x, y, size, hex, maxWidth, weight = CK.FontWeight.Bold) => {
  const builder = CK.ParagraphBuilder.Make(new CK.ParagraphStyle({
    textStyle: {
      color: color(hex), fontFamilies: ['Pretendard'], fontSize: size,
      heightMultiplier: 1.2, letterSpacing: -size * 0.025, fontStyle: { weight },
    },
  }), fontMgr);
  builder.addText(str);
  const paragraph = builder.build();
  paragraph.layout(maxWidth);
  canvas.drawParagraph(paragraph, x, y);
  return paragraph;
};

canvas.clear(color('#eee9f7'));
// 오른쪽은 캐릭터 영역, 왼쪽은 제목 영역으로 고정한다.
paint.setColor(color('#e3daef'));
canvas.drawCircle(1085, 570, 340, paint);
paint.setColor(color('#f9dccd'));
canvas.drawCircle(1040, 475, 235, paint);

// 시리즈명과 회차는 모든 편에서 같은 위치를 유지한다.
rect(72, 66, 268, 62, '#ffffff', 31);
text('RAG 설계기', 97, 77, 34, '#47305f', 230);
rect(1094, 62, 112, 112, '#ee673c', 28);
text(values.episode.padStart(2, '0'), 1111, 79, 67, '#ffffff', 90);

const title = text(values.title.replaceAll('\\n', '\n'), 72, 213, 80, '#322342', 700);
if (title.getHeight() > 275) throw new Error('제목이 세 줄 이상입니다. 카드에서 읽히도록 두 줄로 줄여 주세요.');

// 텍스트와 겹치지 않도록 원본 비율을 유지해 배치한다.
const mascot = CK.MakeImageFromEncoded(readFileSync('src/assets/kkugi/rag-question.png'));
const mw = 494;
const mh = mascot.height() * mw / mascot.width();
canvas.drawImageRectOptions(mascot, CK.XYWHRect(0, 0, mascot.width(), mascot.height()), CK.XYWHRect(732, 262, mw, mh), CK.FilterMode.Linear, CK.MipmapMode.Linear, new CK.Paint());

rect(72, 542, 68, 7, '#ee673c', 3.5);
text('꾸기의 RAG를 만드는 선택과 실험', 72, 576, 29, '#655473', 650, CK.FontWeight.Medium);
text('TEAM YUMYUM', 72, 647, 22, '#655473', 500, CK.FontWeight.Medium);

const output = join(dir, 'cover.png');
writeFileSync(output, surface.makeImageSnapshot().encodeToBytes());
console.log(`만들었어요: ${output}`);
