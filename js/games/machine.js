// A machine turns numbers in into numbers out. One rule fits every row.
import { four } from './pack.js';

export const machineMeta = {
  id: 'machine',
  title: 'Guess the rule',
  blurb: 'One rule fits every row.',
  skill: 'l7func',
  levels: [2, 3, 4, 5, 6, 7, 8],
};

export function ruleLabel(rule) {
  if (rule.kind === 'add') return `add ${rule.k}`;
  if (rule.kind === 'mul') return `times ${rule.k}`;
  return `times ${rule.m}, then add ${rule.k}`;
}

export function ruleOut(rule, x) {
  if (rule.kind === 'add') return x + rule.k;
  if (rule.kind === 'mul') return x * rule.k;
  return x * rule.m + rule.k;
}

function pickRule(rng, level) {
  if (level <= 3) return { kind: 'add', k: rng.int(2, 9), m: 0 };
  if (level <= 5) {
    return rng.int(0, 1)
      ? { kind: 'add', k: rng.int(2, 9), m: 0 }
      : { kind: 'mul', k: rng.int(2, 5), m: 0 };
  }
  return { kind: 'muladd', m: rng.int(2, 4), k: rng.int(1, 5) };
}

function others(rule) {
  const list = [
    { kind: 'add', k: rule.kind === 'add' ? rule.k + 1 : 3, m: 0 },
    { kind: 'mul', k: rule.kind === 'mul' ? rule.k + 1 : 2, m: 0 },
    { kind: 'add', k: 1, m: 0 },
    { kind: 'muladd', m: 2, k: 1 },
    { kind: 'muladd', m: rule.m || 2, k: (rule.k || 1) + 1 },
  ];
  return list.filter(r => ruleLabel(r) !== ruleLabel(rule));
}

function table(inputs, rule) {
  const rows = inputs.map(x => `<tr><td>${x}</td><td>${ruleOut(rule, x)}</td></tr>`).join('');
  return `<table class="tbl"><tr><th>In</th><th>Out</th></tr>${rows}</table>`;
}

export function makeMachine(rng, level = 2) {
  const rule = pickRule(rng, level);
  const inputs = rng.shuffle([1, 2, 3, 4, 5, 6, 7, 8]).slice(0, 3).sort((a, b) => a - b);
  const bad = others(rule).filter(r => inputs.some(x => ruleOut(r, x) !== ruleOut(rule, x)));
  const label = ruleLabel(rule);
  const choices = four(rng, [rule, ...bad].map(r => {
    const name = ruleLabel(r);
    return { id: name, label: name, html: `<span class="gnum word">${name}</span>` };
  }));
  const sample = inputs.slice(0, 2).map(x => `${x} becomes ${ruleOut(rule, x)}`).join(', and ');
  const why = `Check every row, not just the first. ${sample}. The rule ${label} fits every row. A rule that fits only one row is not the machine.`;
  return {
    prompt: 'Which rule fits every row?',
    say: `The machine shows ${inputs.map(x => `${x} in, ${ruleOut(rule, x)} out`).join(', ')}. Which rule fits every row?`,
    visual: table(inputs, rule),
    choices,
    answer: label,
    why,
    facts: { kind: rule.kind, k: rule.k, m: rule.m, inputs },
  };
}
