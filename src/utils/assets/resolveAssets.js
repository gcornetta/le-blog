// Map all images under src/assets/images → URLs once
const assetsByAlias = import.meta.glob('@/assets/images/**/*.{png,jpg,jpeg,webp,avif,gif,svg}', {
  eager: true,
  import: 'default',
});
const assetsBySrc = import.meta.glob('/src/assets/images/**/*.{png,jpg,jpeg,webp,avif,gif,svg}', {
  eager: true,
  import: 'default',
});
const ASSET_MAP = { ...assetsBySrc, ...assetsByAlias };

/** @param {string|undefined} spec */
export function resolveAsset(spec) {
  if (!spec) return undefined;
  if (/^https?:\/\//.test(spec) || spec.startsWith('/')) return spec;

  if (spec.startsWith('@/')) {
    return ASSET_MAP[spec] ?? ASSET_MAP[spec.replace(/^@/, '/src')] ?? spec;
  }

  // Support legacy "../../assets/..." paths from frontmatter
  const i = spec.indexOf('/assets/');
  if (i !== -1) {
    const keySrc = '/src' + spec.slice(i);  // → /src/assets/…
    const keyAli = '@' + spec.slice(i);     // → @/assets/…
    return ASSET_MAP[keySrc] ?? ASSET_MAP[keyAli] ?? spec;
  }

  // Last guess
  const guess = '/src/' + spec.replace(/^\.?\//, '');
  return ASSET_MAP[guess] ?? spec;
}
