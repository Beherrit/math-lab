// One challenge item: the question, the answer, then the reason.
import { readAloudOn } from '../../core/say.js';
import { S } from '../../core/store.js';
import { itemLabel, itemTitle } from '../../core/challenge.js';
import { isEarlyProblem } from '../../skills/registry.js';
import { mount, esc } from '../dom.js';
import { problemHTML } from '../fragments.js';
import { I } from '../icons.js';

const hear = () => (S && readAloudOn(S) ? '<button class="btn sm hear-btn" data-act="chhear">Hear it</button>' : '');

function pad(signed, digitsOnly) {
  const row = ['1', '2', '3', '4', '5', '6', '7', '8', '9', digitsOnly ? 'gap' : '.', '0', 'del'];
  const face = k => (k === 'del' ? I.del : k);
  const aria = k => (k === 'del' ? 'Delete' : k === '.' ? 'Decimal point' : k);
  const keys = row.map(k => (k === 'gap'
    ? '<span class="key-gap" aria-hidden="true"></span>'
    : `<button class="key ${k === 'del' ? 'fn' : ''}" data-act="chkey" data-k="${k}" aria-label="${aria(k)}">${face(k)}</button>`)).join('');
  const sign = signed ? '<button class="key fn sign" data-act="chkey" data-k="sign" aria-label="Plus or minus">+/−</button>' : '';
  return `<div class="keypad ${signed ? 'signed' : ''}">${keys}${sign}<button class="key check" data-act="chcheck">Check</button></div>`;
}

function whyCard(ok, html) {
  return `<div class="why-card paper-card ${ok ? 'yes' : 'no'}" role="status"><h2>${ok ? 'Yes' : 'Not yet'}</h2><p>${html}</p>
  <button class="btn primary big" data-act="chnext">Next</button></div>`;
}

function choices(options, answered, correct) {
  return `<div class="choices two early">${options.map((o, i) => {
    const mark = answered ? (i === correct ? 'ok' : i === answered.pick ? 'nope' : '') : '';
    return `<button class="choice ${mark}" data-act="chchoice" data-i="${i}" ${answered ? 'disabled' : ''}>${o}</button>`;
  }).join('')}</div>`;
}

function typed(problem, input) {
  const kind = problem.answer.kind;
  const shown = kind === 'num' ? String(input || '').replace('-', '−') : '';
  const value = kind === 'num' ? `<div class="ans num ${shown ? '' : 'empty'}"><span class="val">${shown || '?'}</span></div>` : fields(kind, input);
  return `${value}${pad(!!problem.answer.signed, kind === 'num' && isEarlyProblem(problem))}`;
}

function fields(kind, input) {
  const box = (f, label) => `<button class="box ${input.f === f ? 'on' : ''}" data-act="chfield" data-f="${f}" aria-label="${label}">${esc(input[f] || '')}</button>`;
  if (kind === 'point') return `<div class="ans">${box('x', 'x')}${box('y', 'y')}</div>`;
  const neg = problemSign(input);
  return `<div class="ans frac">${neg}${box('w', 'whole number')}<div class="fstack">${box('n', 'top')}<span class="fline"></span>${box('d', 'bottom')}</div></div>`;
}

const problemSign = input => (input.neg ? '<span class="fneg on">−</span>' : '');

function skillBody(run, why) {
  const p = run.problem;
  const body = p ? problemHTML(p) : '<p class="ask">This one can wait.</p>';
  const answered = run.answered;
  let controls = '';
  if (p?.answer.kind === 'choice') controls = choices(p.answer.options, answered, p.answer.correct);
  else if (p && !answered) controls = typed(p, run.input);
  const reason = answered ? whyCard(answered.ok, why) : '';
  return `<div class="paper-card">${body}${hear()}</div>${controls}${reason}`;
}

function puzzleBody(run, why) {
  const round = run.round;
  const answered = run.answered;
  const buttons = round.choices.map(c => {
    const mark = answered ? (c.id === round.answer ? 'ok' : c.id === answered.pick ? 'nope' : '') : '';
    return `<button class="choice game-choice ${mark}" data-act="chchoice" data-id="${esc(c.id)}" aria-label="${esc(c.label)}" ${answered ? 'disabled' : ''}>${c.html}</button>`;
  }).join('');
  const reason = answered ? whyCard(answered.ok, esc(why)) : '';
  return `<div class="paper-card gq"><p class="ask">${esc(round.prompt)}</p>${hear()}<div class="gvisual">${round.visual}</div></div>
  <div class="choices game-choices">${buttons}</div>${reason}`;
}

export function challengePlayHTML(run, why) {
  const head = `<header class="top"><button class="iconbtn" data-go="challenge" aria-label="Back">${I.back}</button>
  <div><p class="small muted">${esc(itemLabel(run.item))}</p><h1>${esc(itemTitle(run.item))}</h1></div></header>`;
  const body = run.round ? puzzleBody(run, why) : skillBody(run, why);
  return `<div class="page challenge-play">${head}${body}</div>`;
}
