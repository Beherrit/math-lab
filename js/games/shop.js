// Pay more than the price. The change is what you get back.
import { four } from './pack.js';

export const shopMeta = {
  id: 'shop',
  title: 'The shop',
  blurb: 'Pay, then count the change.',
  skill: 'l1money',
  levels: [1, 2, 3],
};

const INK = '#241c16';

export function money(cents) {
  if (cents < 100) return `${cents} cents`;
  const dollars = Math.floor(cents / 100);
  const rest = cents % 100;
  if (!rest) return `${dollars} dollars`;
  return `${dollars} dollars and ${rest} cents`;
}

function tag(price, paid) {
  return `<svg class="grow" viewBox="0 0 260 90" role="img" aria-label="price ${money(price)}, paid ${money(paid)}"><rect x="8" y="12" width="116" height="64" rx="12" fill="#fffdf9" stroke="${INK}" stroke-width="3"/><text x="66" y="38" text-anchor="middle" font-size="14" fill="#5c5146">price</text><text x="66" y="60" text-anchor="middle" font-size="16" font-weight="700" fill="${INK}">${money(price)}</text><rect x="136" y="12" width="116" height="64" rx="12" fill="#f8edd4" stroke="${INK}" stroke-width="3"/><text x="194" y="38" text-anchor="middle" font-size="14" fill="#5c5146">paid</text><text x="194" y="60" text-anchor="middle" font-size="16" font-weight="700" fill="${INK}">${money(paid)}</text></svg>`;
}

function deal(rng, level) {
  if (level <= 1) {
    const price = rng.pick([10, 15, 20, 25, 30, 35, 40]);
    return { price, paid: price <= 25 && rng.int(0, 1) ? 50 : 100 };
  }
  if (level === 2) {
    const price = rng.int(3, 18) * 5;
    return { price, paid: 100 };
  }
  const price = rng.int(125, 875);
  const paid = Math.ceil(price / 100) * 100;
  return { price, paid: paid === price ? paid + 100 : paid };
}

export function makeShop(rng, level = 1) {
  const { price, paid } = deal(rng, level);
  const change = paid - price;
  const slips = [change + 5, change + 10, Math.abs(change - 5), price, paid].filter(n => n > 0 && n !== change);
  const amounts = [change, ...slips];
  const choices = four(rng, amounts.map(n => ({
    id: String(n),
    label: money(n),
    html: `<span class="gnum word">${money(n)}</span>`,
  })));
  const why = `The price is ${money(price)} and you paid ${money(paid)}. Change is what you paid minus the price: ${paid} cents minus ${price} cents is ${change} cents, which is ${money(change)}.`;
  return {
    prompt: 'How much change do you get?',
    say: `The price is ${money(price)}. You paid ${money(paid)}. How much change do you get?`,
    visual: tag(price, paid),
    choices,
    answer: String(change),
    why,
    facts: { price, paid },
  };
}
