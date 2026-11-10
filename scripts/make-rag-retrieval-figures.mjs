// 본문의 고정 실험값과 개념 예시로 SVG를 생성한다. 저장소 루트에서 실행한다.
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

const dir = 'src/content/posts/2026-11-10-rag-retrieval-model-selection';
const C = { ink: '#172b46', muted: '#52647a', line: '#d9e2ed', blue: '#175ac8', pale: '#e4edff', green: '#06755b', mint: '#d9f1e8', orange: '#99450b', cream: '#ffe8ce', bg: '#f7f9fc' };
const esc = (s) => String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const t = (x, y, str, size = 26, fill = C.ink, weight = 600, anchor = 'start') => `<text x="${x}" y="${y}" font-size="${size}" fill="${fill}" font-weight="${weight}" text-anchor="${anchor}">${esc(str)}</text>`;
const r = (x, y, w, h, fill, stroke = 'none', radius = 10, strokeWidth = 1) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${radius}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"/>`;
const line = (x1, y1, x2, y2, color = C.line) => `<path d="M${x1} ${y1}L${x2} ${y2}" stroke="${color}"/>`;
function save(name, height, title, desc, body) {
  writeFileSync(join(dir, name), `<svg xmlns="http://www.w3.org/2000/svg" width="720" height="${height}" viewBox="0 0 720 ${height}" role="img" aria-labelledby="title desc">
<title id="title">${esc(title)}</title><desc id="desc">${esc(desc)}</desc>
${r(0, 0, 720, height, C.bg, 'none', 20)}
<g font-family="Pretendard, 'Malgun Gothic', sans-serif">${body}</g></svg>\n`);
  console.log(`생성: ${name}`);
}

// 개념 예시. A/B의 정의와 측정 설명은 이미지 밖 본문에 둔다.
{
  let body = t(32, 43, '상위 5개') + t(516, 43, 'Recall@5');
  for (let i = 0; i < 5; i++) body += t(66 + i * 80, 79, String(i + 1), 22, C.muted, 500, 'middle');
  for (let row = 0; row < 2; row++) {
    const y = 95 + row * 121;
    for (let i = 0; i < 5; i++) {
      const isA = i === 0, isB = row === 1 && i === 1;
      body += r(32 + i * 80, y, 68, 64, isA ? C.blue : isB ? C.green : '#e4e9f0');
      body += t(66 + i * 80, y + 44, isA ? 'A' : isB ? 'B' : '–', 37, isA || isB ? '#ffffff' : '#7b899b', 700, 'middle');
    }
    body += t(516, y + 43, row ? '100%' : '50%', 42, C.ink, 700);
    body += t(516, y + 80, row ? '전체 확보' : '전체 미확보', 24, row ? C.green : C.orange);
  }
  save('evidence-coverage.svg', 325, '필수 근거 A와 B의 확보 비교', '한 문항의 개념 예시. 위쪽은 상위 5개에서 A만 찾아 Recall 50%, 전체 근거 미확보. 아래쪽은 A와 B를 찾아 Recall 100%, 전체 근거 확보. 첫 근거는 모두 1위다.', body);
}

// 같은 원문 좌표에 검색 조각을 정렬한다. 1자당 같은 너비를 쓴다.
{
  const x = (offset) => 200 + offset * 480 / 315;
  const overlap = '#b44c0b';
  let body = t(28, 39, '같은 원문 · 315자', 27);
  for (const [offset, label] of [[0, '1'], [135, '136'], [180, '181'], [315, '315자']]) {
    body += t(x(offset), 77, label, 22, C.muted, 500, 'middle');
  }
  body += r(x(0), 91, 480, 21, '#cbd5e2', 'none', 3);
  for (const offset of [135, 180]) {
    body += `<path d="M${x(offset)} 114V510" stroke="${C.line}" stroke-dasharray="5 5"/>`;
  }
  const chunk = (start, end, y, label) => r(x(start), y, x(end) - x(start), 48, C.blue, 'none', 5) + t((x(start) + x(end)) / 2, y + 33, label, 26, '#ffffff', 700, 'middle');
  body += t(28, 151, 'R0 · 겹침 없음', 27);
  body += t(28, 205, '첫 조각', 25) + t(28, 271, '다음 조각', 25);
  body += chunk(0, 180, 172, '1~180자');
  body += chunk(180, 315, 238, '181~315자');
  body += line(28, 317, 692, 317);
  body += t(28, 351, 'O1 · 45자 겹침', 27);
  body += t(28, 405, '첫 조각', 25) + t(28, 471, '다음 조각', 25);
  body += chunk(0, 180, 372, '');
  body += chunk(135, 315, 438, '');
  // 두 조각 모두 원문의 136~180자 구간을 포함한다.
  body += r(x(135), 372, x(180) - x(135), 48, overlap, 'none', 0);
  body += r(x(135), 438, x(180) - x(135), 48, overlap, 'none', 0);
  // 겹침 강조 위로 조각 범위를 다시 적어 가독성을 유지한다.
  body += t((x(0) + x(180)) / 2, 405, '1~180자', 26, '#ffffff', 700, 'middle');
  body += t((x(135) + x(315)) / 2, 471, '136~315자', 26, '#ffffff', 700, 'middle');
  body += `<path d="M${x(135)} 500V516H${x(180)}V500" fill="none" stroke="${overlap}" stroke-width="2"/>`;
  body += t((x(135) + x(180)) / 2, 553, '136~180자 = 45자', 25, overlap, 700, 'middle');
  save('chunking-policies.svg', 580, '고정 180자 청킹의 겹침 유무', '315자 원문에서 R0는 첫 조각 1~180자, 다음 조각 181~315자를 만든다. O1은 첫 조각 1~180자, 다음 조각 136~315자를 만든다. O1의 두 조각은 원문의 136~180자 45개를 공통으로 담는다. 원문의 같은 위치를 가로 좌표로 정렬했으며 상자 길이는 문자 수에 비례한다. R0의 마지막 조각은 남은 135자다.', body);
}

// 모든 셀은 같은 개발 C 32문항의 전체 근거 확보 수다.
{
  const rows = [['BM25', [22, 24, 23, 25]], ['E5-small', [20, 21, 18, 22]], ['BGE-M3', [20, 23, 24, 24]], ['KURE-v1', [22, 24, 26, 23]]];
  const colors = ['#f0f4fa', '#e6eef9', '#dbe7f8', '#cadcf5', '#b6cff2', '#a1c0ee', '#3069bc', '#2059ac', '#11468f'];
  let body = t(28, 43, '전체 근거 확보 · 32문항', 27);
  ['R0', 'S1', 'O1', 'SO'].forEach((label, j) => { body += t(239 + 126 * j, 92, label, 27, C.ink, 700, 'middle'); });
  rows.forEach(([label, values], i) => {
    const y = 113 + 74 * i;
    body += t(28, y + 42, label, 26);
    values.forEach((v, j) => {
      const selected = (i === 0 && j === 3) || (i === 3 && j === 2);
      const x = 182 + 126 * j;
      body += r(x, y, 114, 62, colors[v - 18], selected ? C.ink : 'none', 8, selected ? 4 : 1);
      body += t(x + 57, y + 44, v, 35, v >= 24 ? '#ffffff' : C.ink, 700, 'middle');
    });
  });
  save('model-chunking-heatmap.svg', 426, '검색 방식과 청킹별 전체 근거 확보 수', '신규 개발 C 답변 가능 32문항. R0, S1, O1, SO 순으로 BM25 22,24,23,25; E5-small 20,21,18,22; BGE-M3 20,23,24,24; KURE-v1 22,24,26,23개. 색은 18부터 26까지 진해진다. 테두리는 BM25+SO와 KURE+O1이다.', body);
}

// 서로 다른 단위는 독립 패널로 나눈다. 측정 조건은 본문에 둔다.
{
  let body = '';
  const panels = [
    { y: 0, title: '검색 p95 (ms)', max: 350, ticks: [0, 100, 200, 300], values: [27.29, 301.75] },
    { y: 240, title: '최대 프로세스 메모리 (MiB)', max: 3200, ticks: [0, 1000, 2000, 3000], values: [57.07, 2798.45] },
  ];
  for (const p of panels) {
    body += t(28, p.y + 44, p.title, 28, C.ink, 700);
    const axisX = 216, axisW = 330;
    for (const tick of p.ticks) {
      const x = axisX + tick / p.max * axisW;
      body += line(x, p.y + 65, x, p.y + 178);
      body += t(x, p.y + 207, tick, 22, C.muted, 500, 'middle');
    }
    p.values.forEach((v, i) => {
      const y = p.y + 83 + i * 63;
      const w = v / p.max * axisW;
      body += t(195, y + 25, i === 0 ? 'BM25 + SO' : 'KURE + O1', 26, C.ink, 600, 'end');
      body += r(axisX, y - 4, w, 38, i === 0 ? C.blue : C.green, 'none', 4);
      body += t(axisX + w + 13, y + 25, v.toFixed(2), 28, C.ink, 700);
    });
  }
  body += line(28, 229, 692, 229);
  save('cpu-retrieval-cost.svg', 470, '최종 검색 조합의 지연과 메모리', '검색 p95는 BM25+SO 27.29ms, KURE+O1 301.75ms. 프로세스 최대 메모리는 각각 57.07MiB와 2798.45MiB. 각 패널은 서로 다른 단위이며 0에서 시작한다. 측정 조건과 한계는 본문을 따른다.', body);
}
