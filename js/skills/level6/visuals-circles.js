// Level 6 figures for shapes with circle parts: a rectangle with a half circle, a track, a square with a round hole, a ring. No labels: sizes are in the question.
const open = label => `<svg class="viz shape" viewBox="0 0 320 170" role="img" aria-label="${label}" style="max-width:320px">`;
const FILL = 'class="body"', HOLE = 'fill="var(--card)" stroke="var(--ink)" stroke-width="2.5"';
const STROKE = 'stroke="var(--ink)" stroke-width="2.5"';
export function circleCompositeFig(kind) {
  if (kind === 'semirect') return `${open('rectangle with a half circle on one end')}<path d="M 60 40 H 190 A 45 45 0 0 1 190 130 H 60 Z" ${FILL} ${STROKE}/></svg>`;
  if (kind === 'window') return `${open('rectangle with a half circle on top')}<path d="M 110 150 V 80 A 50 50 0 0 1 210 80 V 150 Z" ${FILL} ${STROKE}/></svg>`;
  if (kind === 'stadium') return `${open('running track: a rectangle with a half circle at each end')}<path d="M 90 40 H 230 A 45 45 0 0 1 230 130 H 90 A 45 45 0 0 1 90 40 Z" ${FILL} ${STROKE}/></svg>`;
  if (kind === 'hole') return `${open('square with a round hole')}<rect x="95" y="15" width="140" height="140" ${FILL} ${STROKE}/><circle cx="165" cy="85" r="45" ${HOLE}/></svg>`;
  return `${open('ring: a circle with a smaller circle cut out')}<circle cx="160" cy="85" r="70" ${FILL} ${STROKE}/><circle cx="160" cy="85" r="38" ${HOLE}/></svg>`;
}
