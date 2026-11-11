// RAG 설계기 ②의 역할 분담·평가 범위·전달 단위를 그린다.
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

const dir = 'src/content/posts/2026-11-10-rag-generation-model-design';
const C = { ink: '#282239', muted: '#625b71', line: '#ddd7e8', bg: '#f7f5fb', purple: '#62409f', pale: '#eae2f8', green: '#08745a', mint: '#dcefe8', orange: '#a3480d' };
const esc = (s) => String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const t = (x, y, text, size = 27, color = C.ink, weight = 600, anchor = 'start') => `<text x="${x}" y="${y}" font-size="${size}" fill="${color}" font-weight="${weight}" text-anchor="${anchor}">${esc(text)}</text>`;
const r = (x, y, w, h, fill, stroke = 'none', radius = 10) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${radius}" fill="${fill}" stroke="${stroke}"/>`;
const arrow = (x1, y1, x2, y2) => `<path d="M${x1} ${y1}L${x2} ${y2}" fill="none" stroke="${C.muted}" stroke-width="2.5" marker-end="url(#arrow)"/>`;
function save(name, height, title, desc, body) {
  writeFileSync(join(dir, name), `<svg xmlns="http://www.w3.org/2000/svg" width="720" height="${height}" viewBox="0 0 720 ${height}" role="img" aria-labelledby="title desc">
<title id="title">${esc(title)}</title><desc id="desc">${esc(desc)}</desc>
<defs><marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 1L8 5L0 9" fill="none" stroke="${C.muted}" stroke-width="1.5"/></marker></defs>
${r(0, 0, 720, height, C.bg, 'none', 20)}
<g font-family="Pretendard, 'Malgun Gothic', sans-serif">${body}</g></svg>\n`);
  console.log(`생성: ${name}`);
}

// 초기 내부 출력의 책임 구분. 자동 ID 검사와 의미 검토를 같은 것으로 그리지 않는다.
{
  let body = r(28, 28, 294, 281, '#ffffff', C.line) + r(398, 28, 294, 281, '#ffffff', C.line);
  body += t(175, 77, '모델', 32, C.purple, 700, 'middle');
  body += t(545, 77, '코드', 32, C.green, 700, 'middle');
  ['상태', '주장', '근거 ID'].forEach((label, i) => {
    body += r(51, 104 + i * 61, 248, 48, C.pale);
    body += t(175, 137 + i * 61, label, 28, C.purple, 700, 'middle');
  });
  ['필드 관계 검사', '허용 ID 검사', '출처 정보 구성'].forEach((label, i) => {
    body += t(545, 137 + i * 61, label, 27, C.green, 600, 'middle');
  });
  body += arrow(336, 184, 382, 184);
  body += t(360, 358, '의미 검토: 주장 ↔ 인용 발췌', 28, C.ink, 700, 'middle');
  save('generation-responsibilities.svg', 392, '생성 모델과 코드의 역할 분담', '모델은 상태, 주장, 근거 ID를 반환한다. 코드는 필드 관계와 허용 ID를 검사하고 출처 정보를 구성한다. 주장과 인용 발췌가 의미상 연결되는지는 별도 검토한다.', body);
}

// 막대는 각각 다른 평가군 내부의 처리 경로다. 통과율이나 모델 간 품질 비교가 아니다.
{
  let body = '';
  const groups = [
    { y: 42, title: '11/06 · API 평가 40문항', total: 40, parts: [[27, '모델 27', C.purple], [13, '규칙 13', C.green]] },
    { y: 192, title: '11/09 · 새 평가 24문항', total: 24, parts: [[24, '새 추론 24', C.purple]] },
    { y: 342, title: '11/09 · 회귀·준비 확인 80문항', total: 80, parts: [[11, '재생 11', C.orange], [69, '규칙 69', C.green]] },
  ];
  for (const g of groups) {
    body += t(28, g.y, g.title, 27);
    let x = 28;
    for (const [count, label, fill] of g.parts) {
      const width = 664 * count / g.total;
      body += r(x, g.y + 20, width, 67, fill, 'none', 0);
      body += t(x + width / 2, g.y + 64, label, count === 11 ? 22 : 31, '#ffffff', 700, 'middle');
      x += width;
    }
  }
  save('evaluation-paths.svg', 455, '평가군별 실제 처리 경로', '11월 6일 API 평가 40문항은 모델 응답 27개와 로컬 규칙 13개다. 11월 9일 새 평가 24문항은 모두 새로 추론했다. 회귀와 준비 확인 80문항은 기존 모델 응답 11개를 재생하고 69개를 기존 로컬 경로로 처리했다. 각 막대는 서로 다른 평가군의 구성 비율이며 품질 점수가 아니다.', body);
}

// 초기 비스트리밍 평가는 본문에서 별도로 설명한다. 이 그림은 후속 서비스 경로의 비교다.
{
  let body = t(28, 44, '검토된 의도 경로', 29, C.ink, 700);
  const step = (x, y, label, out = false) => r(x, y, 190, 65, out ? C.green : C.pale) + t(x + 95, y + 43, label, 26, out ? '#ffffff' : C.purple, 700, 'middle');
  const row = (y, labels) => step(28, y, labels[0]) + arrow(228, y + 32, 254, y + 32) + step(265, y, labels[1]) + arrow(465, y + 32, 491, y + 32) + step(502, y, labels[2], true);
  body += row(74, ['주장 하나 완성', '해당 주장 검사', 'claim']);
  body += row(164, ['응답 끝', '전체 검사', 'done']);
  body += `<path d="M28 264H692" stroke="${C.line}"/>`;
  body += t(28, 310, '로컬 후보 경로', 29, C.ink, 700);
  body += row(340, ['전체 응답', '전체 검사', 'claim들 · done']);
  save('verified-delivery.svg', 439, '검증한 주장을 전달하는 시점', '검토된 의도 경로는 주장 하나가 완성되면 해당 주장을 검사한 뒤 claim 이벤트를 전달한다. 응답이 끝나면 전체 검사를 거쳐 done을 보낸다. 로컬 후보 경로는 전체 응답을 검사한 후 claim들과 done을 전달한다. 초기 API 평가는 이 그림의 서비스 경로와 별도의 비스트리밍 평가다.', body);
}
