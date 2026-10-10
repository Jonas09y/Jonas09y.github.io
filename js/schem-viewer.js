/* =========================================================
   Jonas Builds — 3D Schematic Viewer
   Parses Sponge .schem files (v2 / v3) directly in the browser
   and renders them with Three.js (face-culled voxel mesh with
   Minecraft-style shading + ambient occlusion).
   ========================================================= */

let THREE = null;
let OrbitControls = null;

async function loadThree() {
  if (THREE) return;
  THREE = await import('three');
  ({ OrbitControls } = await import('three/addons/controls/OrbitControls.js'));
}

/* ---------------------------------------------------------
   1. GZIP + NBT
   --------------------------------------------------------- */
async function gunzip(buffer) {
  const u8 = new Uint8Array(buffer);
  if (u8[0] !== 0x1f || u8[1] !== 0x8b) return buffer; // not gzipped
  if ('DecompressionStream' in window) {
    const stream = new Blob([buffer]).stream().pipeThrough(new DecompressionStream('gzip'));
    return await new Response(stream).arrayBuffer();
  }
  const pako = await import('https://cdn.jsdelivr.net/npm/pako@2.1.0/+esm');
  return pako.ungzip(u8).buffer;
}

function parseNBT(buffer) {
  const dv = new DataView(buffer);
  const u8 = new Uint8Array(buffer);
  const td = new TextDecoder();
  let p = 0;
  const str = () => {
    const l = dv.getUint16(p); p += 2;
    const s = td.decode(u8.subarray(p, p + l)); p += l;
    return s;
  };
  function read(t) {
    switch (t) {
      case 1: return dv.getInt8(p++);
      case 2: { const v = dv.getInt16(p); p += 2; return v; }
      case 3: { const v = dv.getInt32(p); p += 4; return v; }
      case 4: { const v = dv.getInt32(p) * 4294967296 + dv.getUint32(p + 4); p += 8; return v; }
      case 5: { const v = dv.getFloat32(p); p += 4; return v; }
      case 6: { const v = dv.getFloat64(p); p += 8; return v; }
      case 7: { const l = dv.getInt32(p); p += 4; const v = u8.subarray(p, p + l); p += l; return v; }
      case 8: return str();
      case 9: {
        const et = dv.getInt8(p++); const l = dv.getInt32(p); p += 4;
        const a = new Array(Math.max(l, 0));
        for (let i = 0; i < l; i++) a[i] = read(et);
        return a;
      }
      case 10: {
        const o = {};
        for (;;) {
          const tt = dv.getInt8(p++);
          if (tt === 0) break;
          const n = str();
          o[n] = read(tt);
        }
        return o;
      }
      case 11: {
        const l = dv.getInt32(p); p += 4;
        const a = new Int32Array(l);
        for (let i = 0; i < l; i++) { a[i] = dv.getInt32(p); p += 4; }
        return a;
      }
      case 12: { const l = dv.getInt32(p); p += 4 + l * 8; return null; }
      default: throw new Error('Unknown NBT tag ' + t);
    }
  }
  const type = dv.getInt8(p++);
  str();
  return read(type);
}

function readSchematic(nbt) {
  const root = nbt.Schematic || nbt;
  const W = root.Width & 0xffff, H = root.Height & 0xffff, L = root.Length & 0xffff;
  const blocks = root.Blocks || root;
  const palette = blocks.Palette;
  const data = blocks.Data || blocks.BlockData;
  if (!palette || !data) throw new Error('Unsupported schematic format');

  const names = [];
  for (const k in palette) names[palette[k]] = k;

  const ids = new Uint16Array(W * H * L);
  let i = 0, j = 0;
  const n = data.length;
  while (i < n && j < ids.length) {
    let v = 0, shift = 0, b;
    do { b = data[i++]; v |= (b & 127) << shift; shift += 7; } while (b & 128);
    ids[j++] = v;
  }
  return { W, H, L, ids, names };
}

/* ---------------------------------------------------------
   2. BLOCK COLORS
   --------------------------------------------------------- */
const DYES = ['light_blue', 'light_gray', 'magenta', 'orange', 'yellow', 'purple', 'white', 'black',
  'brown', 'green', 'lime', 'pink', 'gray', 'cyan', 'blue', 'red'];
const DYE_TABLE = {
  //            concrete   wool       terracotta powder
  white:      ['#cfd5d6', '#e9ecec', '#d1b2a1', '#e1e3e3'],
  orange:     ['#e06101', '#f07613', '#a15325', '#e3831f'],
  magenta:    ['#a9309f', '#bd44b3', '#95576c', '#c053b8'],
  light_blue: ['#2489c7', '#3aafd9', '#716c89', '#4ab4d5'],
  yellow:     ['#f1af15', '#f8c627', '#ba8523', '#e8c736'],
  lime:       ['#5ea918', '#70b919', '#677534', '#7dbd29'],
  pink:       ['#d5658e', '#ed8dac', '#a14e4e', '#e499b5'],
  gray:       ['#36393d', '#3e4447', '#392a23', '#4c5154'],
  light_gray: ['#7d7d73', '#8e8e86', '#876a61', '#9a9a94'],
  cyan:       ['#157788', '#158991', '#575b5b', '#24939d'],
  purple:     ['#64209c', '#792aac', '#764656', '#8337b1'],
  blue:       ['#2c2e8f', '#35399d', '#4a3b5b', '#4649a6'],
  brown:      ['#603c20', '#724728', '#4d3323', '#7d5435'],
  green:      ['#495b24', '#546d1b', '#4c532a', '#61772c'],
  red:        ['#8e2121', '#a12722', '#8f3d2e', '#a83232'],
  black:      ['#080a0f', '#141519', '#251610', '#191a1f'],
};

const WOODS = ['dark_oak', 'pale_oak', 'oak', 'spruce', 'birch', 'jungle', 'acacia', 'mangrove', 'cherry', 'bamboo', 'crimson', 'warped'];
const PLANKS = { oak: '#a2834f', spruce: '#735531', birch: '#c0af79', jungle: '#a07351', acacia: '#a85a32', dark_oak: '#422b14', mangrove: '#763631', cherry: '#e2b2ac', bamboo: '#c2af51', crimson: '#653147', warped: '#2b6963', pale_oak: '#e4d9d3' };
const BARK = { oak: '#6d5533', spruce: '#3a2510', birch: '#d8d7d2', jungle: '#55441b', acacia: '#676157', dark_oak: '#3c2e1a', mangrove: '#5b3a2a', cherry: '#361b25', bamboo: '#7f9031', crimson: '#5c1919', warped: '#3a3a4d', pale_oak: '#5c5550' };
const STRIPPED = { oak: '#b1904f', spruce: '#745a34', birch: '#c4b07b', jungle: '#ab8454', acacia: '#af5d3c', dark_oak: '#4a3a23', mangrove: '#78362f', cherry: '#d7918c', bamboo: '#c2af51', crimson: '#893b5b', warped: '#3a9690', pale_oak: '#f2e8e4' };
const LEAVES = { oak: '#467a24', spruce: '#3d5e3d', birch: '#5f8a3a', jungle: '#3a8a1c', acacia: '#4a7a1f', dark_oak: '#3b6d1a', mangrove: '#4c7f2a', cherry: '#e6a8c0', azalea: '#5a7a2c', flowering_azalea: '#7a7a4c', pale_oak: '#878d84' };

const COLORS = {
  stone: '#7d7d7d', cobblestone: '#7f7f7f', mossy_cobblestone: '#6e765e', stone_bricks: '#7a7979',
  cracked_stone_bricks: '#767676', mossy_stone_bricks: '#737960', chiseled_stone_bricks: '#777777',
  smooth_stone: '#9e9e9e', andesite: '#888889', polished_andesite: '#848685', diorite: '#bcbcbc',
  polished_diorite: '#c0c1c2', granite: '#956755', polished_granite: '#9a6a59', deepslate: '#505053',
  cobbled_deepslate: '#4d4d51', polished_deepslate: '#484849', deepslate_bricks: '#464647',
  deepslate_tiles: '#363637', cracked_deepslate_tiles: '#353536', cracked_deepslate_bricks: '#404041',
  chiseled_deepslate: '#36363a', tuff: '#6c6d67', polished_tuff: '#626862', tuff_bricks: '#626860',
  calcite: '#dfe0dd', dripstone_block: '#866b5d', basalt: '#50505a', polished_basalt: '#636264',
  smooth_basalt: '#48484e', blackstone: '#2a2329', polished_blackstone: '#35303b',
  polished_blackstone_bricks: '#302a31', cracked_polished_blackstone_bricks: '#2c2629',
  chiseled_polished_blackstone: '#36313b', gilded_blackstone: '#3e2f28', netherrack: '#622626',
  nether_bricks: '#2c1519', cracked_nether_bricks: '#281417', chiseled_nether_bricks: '#2f181c',
  red_nether_bricks: '#450709', nether_wart_block: '#730303', warped_wart_block: '#167879',
  soul_sand: '#513e32', soul_soil: '#4b392e', magma_block: '#8e3f1f', obsidian: '#0f0b19',
  crying_obsidian: '#200a3c', end_stone: '#dbde9e', end_stone_bricks: '#dadfa3', purpur_block: '#a97da9',
  purpur_pillar: '#ab81ab', quartz_block: '#ebe5de', smooth_quartz: '#ece6df', quartz_bricks: '#eae5dd',
  quartz_pillar: '#ebe6e0', chiseled_quartz_block: '#e7e2da', sandstone: '#d8cb9b',
  smooth_sandstone: '#e0d6aa', cut_sandstone: '#d9ce9f', chiseled_sandstone: '#d8ca9b',
  red_sandstone: '#ba631d', smooth_red_sandstone: '#b5621f', cut_red_sandstone: '#bd6a22',
  sand: '#dbcfa3', suspicious_sand: '#d8cba0', red_sand: '#be6621', gravel: '#847f7f',
  suspicious_gravel: '#837d7c', clay: '#a0a6b3', dirt: '#866043', coarse_dirt: '#77553b',
  rooted_dirt: '#90674c', dirt_path: '#94793f', farmland: '#5d3b1f', mud: '#3c393d', packed_mud: '#8e6b50',
  mud_bricks: '#89684f', muddy_mangrove_roots: '#463b2d', mangrove_roots: '#4b3b26', moss_block: '#596e2d',
  grass_block: '#5d9a3a', podzol: '#5b3f18', mycelium: '#6f6365', crimson_nylium: '#831f1f',
  warped_nylium: '#2b7265', bricks: '#976253', bone_block: '#e5e1cf', prismarine: '#63a29a',
  prismarine_bricks: '#63ac9e', dark_prismarine: '#345c4c', sea_lantern: '#acc8be', glowstone: '#ac8354',
  shroomlight: '#f19646', redstone_lamp: '#5f3620', ochre_froglight: '#f6e9a9', verdant_froglight: '#e5f4e4',
  pearlescent_froglight: '#f6f0f0', snow_block: '#f9fefe', snow: '#f9fefe', ice: '#91b7fd',
  packed_ice: '#8db4fa', blue_ice: '#74a8fd', amethyst_block: '#8662bf', budding_amethyst: '#84609f',
  emerald_block: '#2acb57', diamond_block: '#62ede4', gold_block: '#f6d03d', iron_block: '#dcdcdc',
  netherite_block: '#42393a', lapis_block: '#1f438c', redstone_block: '#af1805', coal_block: '#101010',
  copper_block: '#c06c50', exposed_copper: '#a17e68', weathered_copper: '#6c996e', oxidized_copper: '#52a385',
  cut_copper: '#bf6a50', exposed_cut_copper: '#9a7965', weathered_cut_copper: '#6d9167',
  oxidized_cut_copper: '#4f9a7e', chiseled_copper: '#b8644b', copper_grate: '#c06c50',
  raw_copper_block: '#9a6a4f', raw_iron_block: '#a6886b', raw_gold_block: '#dda92f',
  nether_gold_ore: '#73362a', nether_quartz_ore: '#75413e', ancient_debris: '#5f4039',
  tube_coral_block: '#3157cf', brain_coral_block: '#cf5ba0', bubble_coral_block: '#a118a0',
  fire_coral_block: '#a4232f', horn_coral_block: '#d8c842', dead_tube_coral_block: '#827b77',
  dead_brain_coral_block: '#7c7672', dead_bubble_coral_block: '#847c78', dead_fire_coral_block: '#827a76',
  dead_horn_coral_block: '#857e79', red_mushroom_block: '#c82e2d', brown_mushroom_block: '#956f51',
  mushroom_stem: '#cbc4b9', sponge: '#c3c04a', wet_sponge: '#aab446', hay_block: '#a68b0c',
  terracotta: '#985e43', glass: '#c0dcde', tinted_glass: '#2c2630', fletching_table: '#ad9f6e',
  cartography_table: '#6a4d36', smithing_table: '#3a3b45', crafting_table: '#83653d', note_block: '#5a3b28',
  jukebox: '#5a3b28', bookshelf: '#6e5638', barrel: '#86643b', iron_trapdoor: '#c8c8c8', iron_bars: '#6d6e6b',
  player_head: '#6b4e3a', skeleton_skull: '#c8c8c8', lightning_rod: '#c47454', exposed_lightning_rod: '#a17e68',
  weathered_lightning_rod: '#6c996e', oxidized_lightning_rod: '#52a385', end_rod: '#e8e0d4', chain: '#3c4250',
  lantern: '#ffc560', soul_lantern: '#7ce0e8', light_weighted_pressure_plate: '#f6d03d',
  heavy_weighted_pressure_plate: '#dcdcdc', lava: '#d25a12', moss_carpet: '#596e2d', pale_moss_block: '#6b726b',
  bamboo_block: '#7f9031', stripped_bamboo_block: '#c2af51', bamboo_mosaic: '#bea64c',
  // plants
  short_grass: '#5f9a3d', grass: '#5f9a3d', tall_grass: '#5f9a3d', fern: '#557f37', large_fern: '#557f37',
  dead_bush: '#6b4f29', poppy: '#c0262b', dandelion: '#e8d42c', blue_orchid: '#2aa3d6', allium: '#b56fdc',
  azure_bluet: '#d8e3e8', oxeye_daisy: '#e3e6c5', cornflower: '#4a6fd8', lily_of_the_valley: '#e6e9e1',
  red_tulip: '#cc3a2a', orange_tulip: '#e2762a', white_tulip: '#e2e8e0', pink_tulip: '#e5a0c6',
  sunflower: '#f2c52e', lilac: '#c49ad2', rose_bush: '#a32a2a', peony: '#e7b6dc', wither_rose: '#2a2a1e',
  sugar_cane: '#8bc366', seagrass: '#2e8a2e', kelp: '#4a8a2e', cobweb: '#e8e8e8', red_mushroom: '#d33a3a',
  brown_mushroom: '#9a7356', sweet_berry_bush: '#3e6e3a',
};

const hexCache = new Map();
function hexToRgb(hex) {
  let c = hexCache.get(hex);
  if (!c) {
    const v = parseInt(hex.slice(1), 16);
    c = [(v >> 16) & 255, (v >> 8) & 255, v & 255];
    hexCache.set(hex, c);
  }
  return c;
}

function dyeOf(name) {
  for (const d of DYES) if (name.startsWith(d + '_')) return d;
  return null;
}

function colorFor(name, depth = 0) {
  if (COLORS[name]) return COLORS[name];

  const dye = dyeOf(name);
  if (dye) {
    const t = DYE_TABLE[dye];
    if (/_concrete_powder$/.test(name)) return t[3];
    if (/_concrete$/.test(name)) return t[0];
    if (/_glazed_terracotta$/.test(name)) return t[1];
    if (/_terracotta$/.test(name)) return t[2];
    if (/_(wool|carpet|bed|banner|stained_glass|stained_glass_pane|candle|shulker_box)$/.test(name)) return t[1];
  }

  let m = name.match(/^stripped_(.+?)_(log|wood|stem|hyphae)$/);
  if (m && STRIPPED[m[1]]) return STRIPPED[m[1]];
  m = name.match(/^(.+?)_(log|wood|stem|hyphae)$/);
  if (m && BARK[m[1]]) return BARK[m[1]];
  m = name.match(/^(.+?)_leaves$/);
  if (m) return LEAVES[m[1]] || LEAVES.oak;
  for (const w of WOODS) if (name.startsWith(w + '_')) return PLANKS[w];

  if (depth < 2) {
    const base = name
      .replace(/^(waxed_|infested_)/, '')
      .replace(/_(stairs|slab|wall|fence_gate|fence|trapdoor|door|button|pressure_plate|carpet|pane|wall_hanging_sign|hanging_sign|wall_sign|sign)$/, '');
    if (base !== name) {
      for (const c of [base, base + 's', base + '_block', base + '_planks']) {
        if (COLORS[c]) return COLORS[c];
      }
      return colorFor(base, depth + 1);
    }
  }

  if (name.includes('copper')) return COLORS.copper_block;
  if (name.includes('deepslate')) return COLORS.deepslate;
  if (name.includes('blackstone')) return COLORS.blackstone;
  if (name.includes('quartz')) return COLORS.quartz_block;
  if (name.includes('sandstone')) return COLORS.sandstone;
  if (name.includes('brick')) return COLORS.bricks;
  if (name.includes('stone')) return COLORS.stone;
  if (dye) return DYE_TABLE[dye][1];
  return '#8a8a8a';
}

/* ---------------------------------------------------------
   3. BLOCK SHAPES
   --------------------------------------------------------- */
const K_AIR = 0, K_CUBE = 1, K_BOXES = 2, K_CROSS = 3, K_WATER = 4, K_GLASS = 5;

const AIR_RE = /^(air|cave_air|void_air|barrier|light|structure_void|moving_piston)$/;
const SKIP_RE = /(_sign|_button|torch|^lever|redstone_wire|rail|^ladder|^vine|_banner|tripwire|^fire$|^soul_fire$|_wall_head|_wall_skull|item_frame|^scaffolding|lichen|sculk_vein|^string|^comparator|^repeater)$/;
const CROSS_RE = /^(short_grass|grass|fern|dead_bush|.+_sapling|dandelion|poppy|blue_orchid|allium|azure_bluet|.+_tulip|oxeye_daisy|cornflower|lily_of_the_valley|wither_rose|torchflower|sunflower|lilac|rose_bush|peony|tall_grass|large_fern|sweet_berry_bush|red_mushroom|brown_mushroom|crimson_fungus|warped_fungus|crimson_roots|warped_roots|nether_sprouts|seagrass|tall_seagrass|kelp|kelp_plant|sugar_cane|cobweb|.+_coral|.+_coral_fan|hanging_roots|wheat|carrots|potatoes|beetroots|pitcher_plant|small_dripleaf|spore_blossom|twisting_vines(_plant)?|weeping_vines(_plant)?|cave_vines(_plant)?|bamboo)$/;
const GLASS_RE = /^(glass|tinted_glass|.+_stained_glass|ice)$/;

const px = (v) => v / 16;
const box = (a, b, c, d, e, f) => [px(a), px(b), px(c), px(d), px(e), px(f)];

const DIR = { north: [0, -1], south: [0, 1], east: [1, 0], west: [-1, 0] };
const LEFT_OF = { north: 'west', east: 'north', south: 'east', west: 'south' };
const OPPOSITE = { north: 'south', south: 'north', east: 'west', west: 'east' };

function quadrantMatches(qx, qz, dirName) {
  const [dx, dz] = DIR[dirName];
  return dx !== 0 ? qx === dx : qz === dz;
}

function stairBoxes(props) {
  const top = props.half === 'top';
  const facing = props.facing || 'north';
  const shape = props.shape || 'straight';
  const boxes = [top ? [0, 0.5, 0, 1, 1, 1] : [0, 0, 0, 1, 0.5, 1]];
  const y0 = top ? 0 : 0.5, y1 = top ? 0.5 : 1;
  const left = LEFT_OF[facing], right = OPPOSITE[left], back = OPPOSITE[facing];
  for (const qx of [-1, 1]) for (const qz of [-1, 1]) {
    const inFront = quadrantMatches(qx, qz, facing);
    let on;
    switch (shape) {
      case 'outer_left': on = inFront && quadrantMatches(qx, qz, left); break;
      case 'outer_right': on = inFront && quadrantMatches(qx, qz, right); break;
      case 'inner_left': on = inFront || (quadrantMatches(qx, qz, back) && quadrantMatches(qx, qz, left)); break;
      case 'inner_right': on = inFront || (quadrantMatches(qx, qz, back) && quadrantMatches(qx, qz, right)); break;
      default: on = inFront;
    }
    if (on) {
      const x0 = qx < 0 ? 0 : 0.5, z0 = qz < 0 ? 0 : 0.5;
      boxes.push([x0, y0, z0, x0 + 0.5, y1, z0 + 0.5]);
    }
  }
  return boxes;
}

function trapdoorBoxes(props) {
  if (props.open === 'true') {
    switch (props.facing) {
      case 'south': return [box(0, 0, 0, 16, 16, 3)];
      case 'east': return [box(0, 0, 0, 3, 16, 16)];
      case 'west': return [box(13, 0, 0, 16, 16, 16)];
      default: return [box(0, 0, 13, 16, 16, 16)];
    }
  }
  return props.half === 'top' ? [box(0, 13, 0, 16, 16, 16)] : [box(0, 0, 0, 16, 3, 16)];
}

function connectedBoxes(props, post, arms) {
  const out = [post];
  for (const d of ['north', 'south', 'east', 'west']) {
    const v = props[d];
    if (v && v !== 'false' && v !== 'none') out.push(arms[d]);
  }
  return out;
}

function describe(state) {
  const br = state.indexOf('[');
  const full = br < 0 ? state : state.slice(0, br);
  const name = full.includes(':') ? full.slice(full.indexOf(':') + 1) : full;
  const props = {};
  if (br >= 0) {
    state.slice(br + 1, -1).split(',').forEach((kv) => {
      const [k, v] = kv.split('=');
      props[k] = v;
    });
  }

  const d = { kind: K_CUBE, boxes: null, color: [0, 0, 0], alpha: 255, occ: 0 };
  if (AIR_RE.test(name)) { d.kind = K_AIR; return d; }
  if (name === 'water' || name === 'bubble_column') {
    d.kind = K_WATER; d.color = [52, 104, 214]; d.alpha = 150; return d;
  }
  if (SKIP_RE.test(name)) { d.kind = K_AIR; return d; }

  d.color = hexToRgb(colorFor(name));

  if (CROSS_RE.test(name)) { d.kind = K_CROSS; return d; }

  let boxes = null;
  if (/_slab$/.test(name)) {
    if (props.type === 'double') boxes = null;
    else boxes = [props.type === 'top' ? [0, 0.5, 0, 1, 1, 1] : [0, 0, 0, 1, 0.5, 1]];
  } else if (/_stairs$/.test(name)) {
    boxes = stairBoxes(props);
  } else if (/_trapdoor$/.test(name)) {
    boxes = trapdoorBoxes(props);
  } else if (/_carpet$/.test(name)) {
    boxes = [box(0, 0, 0, 16, 1, 16)];
  } else if (name === 'snow') {
    const layers = parseInt(props.layers || '1', 10);
    boxes = layers >= 8 ? null : [[0, 0, 0, 1, layers / 8, 1]];
  } else if (/pressure_plate$/.test(name)) {
    boxes = [box(1, 0, 1, 15, 1, 15)];
  } else if (/(_pane|^iron_bars)$/.test(name) || name === 'glass_pane') {
    boxes = connectedBoxes(props, box(7, 0, 7, 9, 16, 9), {
      north: box(7, 0, 0, 9, 16, 7), south: box(7, 0, 9, 9, 16, 16),
      west: box(0, 0, 7, 7, 16, 9), east: box(9, 0, 7, 16, 16, 9),
    });
    if (name.includes('glass')) {
      d.kind = K_BOXES; d.boxes = boxes; d.alpha = 140; d.translucent = true; return d;
    }
  } else if (/_fence$/.test(name)) {
    boxes = connectedBoxes(props, box(6, 0, 6, 10, 16, 10), {
      north: box(7, 6, 0, 9, 15, 6), south: box(7, 6, 10, 9, 15, 16),
      west: box(0, 6, 7, 6, 15, 9), east: box(10, 6, 7, 16, 15, 9),
    });
  } else if (/_fence_gate$/.test(name)) {
    const ns = props.facing === 'north' || props.facing === 'south';
    boxes = [ns ? box(0, 5, 7, 16, 16, 9) : box(7, 5, 0, 9, 16, 16)];
  } else if (/_wall$/.test(name)) {
    boxes = connectedBoxes(props, box(4, 0, 4, 12, 16, 12), {
      north: box(5, 0, 0, 11, 14, 4), south: box(5, 0, 12, 11, 14, 16),
      west: box(0, 0, 5, 4, 14, 11), east: box(12, 0, 5, 16, 14, 11),
    });
  } else if (/(lightning_rod|end_rod)$/.test(name)) {
    const ax = props.facing === 'east' || props.facing === 'west' ? 'x'
      : props.facing === 'north' || props.facing === 'south' ? 'z' : 'y';
    boxes = [ax === 'x' ? box(0, 7, 7, 16, 9, 9) : ax === 'z' ? box(7, 7, 0, 9, 9, 16) : box(7, 0, 7, 9, 16, 9)];
  } else if (name === 'chain') {
    boxes = [box(7, 0, 7, 9, 16, 9)];
  } else if (/(_head|_skull)$/.test(name)) {
    boxes = [box(4, 0, 4, 12, 8, 12)];
  } else if (/lantern$/.test(name) && name !== 'sea_lantern') {
    boxes = [box(5, 0, 5, 11, 7, 11)];
  } else if (/_door$/.test(name)) {
    const f = props.facing || 'north';
    boxes = [f === 'north' ? box(0, 0, 13, 16, 16, 16) : f === 'south' ? box(0, 0, 0, 16, 16, 3)
      : f === 'east' ? box(0, 0, 0, 3, 16, 16) : box(13, 0, 0, 16, 16, 16)];
  } else if (GLASS_RE.test(name)) {
    d.kind = K_GLASS; d.alpha = name === 'tinted_glass' ? 200 : 120; return d;
  }

  if (boxes) { d.kind = K_BOXES; d.boxes = boxes; return d; }
  d.kind = K_CUBE; d.occ = 1;
  return d;
}

/* ---------------------------------------------------------
   4. MESH BUILDER
   --------------------------------------------------------- */
class GeoBuffer {
  constructor(vCap) {
    this.pos = new Float32Array(vCap * 3);
    this.col = new Uint8Array(vCap * 4);
    this.idx = new Uint32Array(vCap * 1.5);
    this.v = 0; this.i = 0;
  }
  reserve(nv, ni) {
    if ((this.v + nv) * 3 > this.pos.length) {
      const np = new Float32Array(this.pos.length * 2); np.set(this.pos); this.pos = np;
      const nc = new Uint8Array(this.col.length * 2); nc.set(this.col); this.col = nc;
    }
    if (this.i + ni > this.idx.length) {
      const ni2 = new Uint32Array(this.idx.length * 2); ni2.set(this.idx); this.idx = ni2;
    }
  }
  vert(x, y, z, r, g, b, a) {
    const v = this.v++;
    this.pos[v * 3] = x; this.pos[v * 3 + 1] = y; this.pos[v * 3 + 2] = z;
    this.col[v * 4] = r; this.col[v * 4 + 1] = g; this.col[v * 4 + 2] = b; this.col[v * 4 + 3] = a;
    return v;
  }
  quad(a, b, c, d, flip) {
    const I = this.idx; let i = this.i;
    if (flip) { I[i++] = b; I[i++] = c; I[i++] = d; I[i++] = b; I[i++] = d; I[i++] = a; }
    else { I[i++] = a; I[i++] = b; I[i++] = c; I[i++] = a; I[i++] = c; I[i++] = d; }
    this.i = i;
  }
}

// Face descriptors: Minecraft-style directional shading
const FACES = [];
for (let d = 0; d < 3; d++) {
  for (const s of [1, -1]) {
    const u = (d + 1) % 3, v = (d + 2) % 3;
    const corners = s > 0 ? [[0, 0], [1, 0], [1, 1], [0, 1]] : [[0, 0], [0, 1], [1, 1], [1, 0]];
    const n = [0, 0, 0]; n[d] = s;
    const shade = d === 1 ? (s > 0 ? 1.0 : 0.5) : d === 0 ? 0.62 : 0.8;
    const ao = corners.map(([cu, cv]) => {
      const U = [0, 0, 0]; U[u] = cu ? 1 : -1;
      const V = [0, 0, 0]; V[v] = cv ? 1 : -1;
      return {
        s1: [n[0] + U[0], n[1] + U[1], n[2] + U[2]],
        s2: [n[0] + V[0], n[1] + V[1], n[2] + V[2]],
        c: [n[0] + U[0] + V[0], n[1] + U[1] + V[1], n[2] + U[2] + V[2]],
      };
    });
    FACES.push({ d, s, u, v, n, corners, shade, ao });
  }
}
const AO_F = [0.42, 0.62, 0.8, 1.0];

async function buildMeshes(schem, onProgress) {
  const { W, H, L, ids, names } = schem;
  const descs = names.map((n) => (n ? describe(n) : describe('air')));
  const SY = W * L;
  const total = W * H * L;

  const occ = new Uint8Array(total);
  const occT = new Uint8Array(descs.map((d) => d.occ));
  for (let i = 0; i < total; i++) occ[i] = occT[ids[i]];

  const solid = (x, y, z) => x >= 0 && y >= 0 && z >= 0 && x < W && y < H && z < L && occ[x + z * W + y * SY] === 1;
  const idAt = (x, y, z) => (x >= 0 && y >= 0 && z >= 0 && x < W && y < H && z < L) ? ids[x + z * W + y * SY] : 0;

  const opq = new GeoBuffer(1 << 18);
  const trn = new GeoBuffer(1 << 14);

  let minX = Infinity, minY = Infinity, minZ = Infinity, maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
  let blockCount = 0;

  const aoLevel = (x, y, z, a) => {
    const s1 = solid(x + a.s1[0], y + a.s1[1], z + a.s1[2]) ? 1 : 0;
    const s2 = solid(x + a.s2[0], y + a.s2[1], z + a.s2[2]) ? 1 : 0;
    if (s1 && s2) return 0;
    const c = solid(x + a.c[0], y + a.c[1], z + a.c[2]) ? 1 : 0;
    return 3 - (s1 + s2 + c);
  };

  const clamp = (v) => (v > 255 ? 255 : v < 0 ? 0 : v) | 0;
  const P = [0, 0, 0];
  const lv = [0, 0, 0, 0];
  const vi = [0, 0, 0, 0];

  function emitCube(B, x, y, z, col, jit, alpha, cullFn) {
    for (let f = 0; f < 6; f++) {
      const F = FACES[f];
      const nx = x + F.n[0], ny = y + F.n[1], nz = z + F.n[2];
      if (cullFn(nx, ny, nz)) continue;
      B.reserve(4, 6);
      for (let k = 0; k < 4; k++) lv[k] = aoLevel(x, y, z, F.ao[k]);
      for (let k = 0; k < 4; k++) {
        const [cu, cv] = F.corners[k];
        P[0] = x; P[1] = y; P[2] = z;
        P[F.d] += F.s > 0 ? 1 : 0; P[F.u] += cu; P[F.v] += cv;
        const m = F.shade * AO_F[lv[k]] * jit;
        vi[k] = B.vert(P[0], P[1], P[2], clamp(col[0] * m), clamp(col[1] * m), clamp(col[2] * m), alpha);
      }
      B.quad(vi[0], vi[1], vi[2], vi[3], lv[0] + lv[2] < lv[1] + lv[3]);
    }
  }

  function emitBoxes(B, x, y, z, boxes, col, jit, alpha, cullFn) {
    for (const bx of boxes) {
      for (let f = 0; f < 6; f++) {
        const F = FACES[f];
        const plane = F.s > 0 ? bx[F.d + 3] : bx[F.d];
        const onEdge = F.s > 0 ? plane >= 1 : plane <= 0;
        if (onEdge && cullFn(x + F.n[0], y + F.n[1], z + F.n[2])) continue;
        B.reserve(4, 6);
        for (let k = 0; k < 4; k++) lv[k] = onEdge ? aoLevel(x, y, z, F.ao[k]) : 3;
        for (let k = 0; k < 4; k++) {
          const [cu, cv] = F.corners[k];
          P[F.d] = plane;
          P[F.u] = cu ? bx[F.u + 3] : bx[F.u];
          P[F.v] = cv ? bx[F.v + 3] : bx[F.v];
          const m = F.shade * AO_F[lv[k]] * jit;
          vi[k] = B.vert(x + P[0], y + P[1], z + P[2], clamp(col[0] * m), clamp(col[1] * m), clamp(col[2] * m), alpha);
        }
        B.quad(vi[0], vi[1], vi[2], vi[3], lv[0] + lv[2] < lv[1] + lv[3]);
      }
    }
  }

  function emitCross(B, x, y, z, col, jit) {
    const i0 = 0.15, i1 = 0.85;
    const planes = [
      [[i0, 0, i0], [i1, 0, i1], [i1, 1, i1], [i0, 1, i0]],
      [[i1, 0, i0], [i0, 0, i1], [i0, 1, i1], [i1, 1, i0]],
    ];
    for (const pl of planes) {
      B.reserve(8, 12);
      for (let side = 0; side < 2; side++) {
        const m = (side ? 0.78 : 0.9) * jit;
        const r = clamp(col[0] * m), g = clamp(col[1] * m), b = clamp(col[2] * m);
        const q = pl.map((c, k) => B.vert(x + c[0], y + c[1], z + c[2], r, g, b, 255));
        if (side) B.quad(q[3], q[2], q[1], q[0], false);
        else B.quad(q[0], q[1], q[2], q[3], false);
      }
    }
  }

  const cullSolid = (x, y, z) => solid(x, y, z);
  let curId = 0;
  const cullSame = (x, y, z) => solid(x, y, z) || idAt(x, y, z) === curId;
  const waterIds = new Set(descs.map((d, i) => (d.kind === K_WATER ? i : -1)).filter((i) => i >= 0));
  const cullWater = (x, y, z) => solid(x, y, z) || waterIds.has(idAt(x, y, z));

  const yieldEvery = 6;
  for (let y = 0; y < H; y++) {
    for (let z = 0; z < L; z++) {
      let i = z * W + y * SY;
      for (let x = 0; x < W; x++, i++) {
        const id = ids[i];
        const D = descs[id];
        if (D.kind === K_AIR) continue;

        blockCount++;
        if (x < minX) minX = x; if (x > maxX) maxX = x;
        if (y < minY) minY = y; if (y > maxY) maxY = y;
        if (z < minZ) minZ = z; if (z > maxZ) maxZ = z;

        let h = (Math.imul(x, 73856093) ^ Math.imul(y, 19349663) ^ Math.imul(z, 83492791)) >>> 0;
        h = Math.imul(h ^ (h >>> 13), 0x5bd1e995) >>> 0;
        const jit = 1 + (((h >>> 8) & 255) / 255 - 0.5) * 0.09;

        switch (D.kind) {
          case K_CUBE:
            emitCube(opq, x, y, z, D.color, jit, 255, cullSolid);
            break;
          case K_BOXES:
            if (D.translucent) { curId = id; emitBoxes(trn, x, y, z, D.boxes, D.color, 1, D.alpha, cullSame); }
            else emitBoxes(opq, x, y, z, D.boxes, D.color, jit, 255, cullSolid);
            break;
          case K_CROSS:
            emitCross(opq, x, y, z, D.color, jit);
            break;
          case K_GLASS:
            curId = id;
            emitBoxes(trn, x, y, z, [[0, 0, 0, 1, 1, 1]], D.color, 1, D.alpha, cullSame);
            break;
          case K_WATER: {
            const top = waterIds.has(idAt(x, y + 1, z)) ? 1 : 0.875;
            emitBoxes(trn, x, y, z, [[0, 0, 0, 1, top, 1]], D.color, 1, D.alpha, cullWater);
            break;
          }
        }
      }
    }
    if (y % yieldEvery === 0) {
      onProgress && onProgress(y / H);
      await new Promise((r) => setTimeout(r, 0));
    }
  }

  return {
    opq, trn, blockCount,
    bounds: { minX, minY, minZ, maxX: maxX + 1, maxY: maxY + 1, maxZ: maxZ + 1 },
    size: { W, H, L },
  };
}

function toGeometry(B) {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(B.pos.slice(0, B.v * 3), 3));
  g.setAttribute('color', new THREE.BufferAttribute(B.col.slice(0, B.v * 4), 4, true));
  g.setIndex(new THREE.BufferAttribute(B.idx.slice(0, B.i), 1));
  g.computeBoundingSphere();
  return g;
}

/* ---------------------------------------------------------
   5. VIEWER (modal + Three.js scene)
   --------------------------------------------------------- */
const viewer = {
  renderer: null, scene: null, camera: null, controls: null,
  group: null, raf: 0, open: false, current: null,
  cache: new Map(), home: null, resizeObs: null,
};

const $ = (id) => document.getElementById(id);

function setLoader(visible, pct, text) {
  const loader = $('viewerLoader');
  if (!loader) return;
  loader.classList.toggle('is-hidden', !visible);
  if (pct != null) $('viewerProgressBar').style.width = Math.round(pct * 100) + '%';
  if (text) $('viewerLoaderText').textContent = text;
}

function initRenderer() {
  if (viewer.renderer) return;
  const canvas = $('viewerCanvas');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.LinearSRGBColorSpace; // vertex colors are already display-ready
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.5, 5000);
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.7;
  controls.screenSpacePanning = true;
  controls.maxPolarAngle = Math.PI * 0.95;
  controls.addEventListener('start', () => setAutoRotate(false));

  Object.assign(viewer, { renderer, scene, camera, controls });

  const stage = $('viewerStage');
  viewer.resizeObs = new ResizeObserver(resize);
  viewer.resizeObs.observe(stage);
}

function resize() {
  const stage = $('viewerStage');
  if (!viewer.renderer || !stage) return;
  const w = stage.clientWidth, h = stage.clientHeight;
  if (!w || !h) return;
  viewer.renderer.setSize(w, h, false);
  viewer.camera.aspect = w / h;
  viewer.camera.updateProjectionMatrix();
}

function loop() {
  if (!viewer.open) return;
  viewer.raf = requestAnimationFrame(loop);
  viewer.controls.update();
  viewer.renderer.render(viewer.scene, viewer.camera);
}

function setAutoRotate(on) {
  if (!viewer.controls) return;
  viewer.controls.autoRotate = on;
  $('viewerRotateBtn')?.classList.toggle('active', on);
}

function frameModel(info, animate = false) {
  const { camera, controls } = viewer;
  const b = info.bounds;
  const sx = b.maxX - b.minX, sy = b.maxY - b.minY, sz = b.maxZ - b.minZ;
  const radius = 0.5 * Math.sqrt(sx * sx + sy * sy + sz * sz);
  const fov = (camera.fov * Math.PI) / 180;
  const fit = Math.max(1, 1 / Math.min(1, camera.aspect));
  const dist = (radius / Math.sin(fov / 2)) * 0.82 * fit;
  const dir = new THREE.Vector3(1, 0.62, 1.15).normalize();
  const target = new THREE.Vector3(0, 0, 0);
  const pos = dir.multiplyScalar(dist);

  camera.near = Math.max(0.1, dist / 200);
  camera.far = dist * 12;
  camera.updateProjectionMatrix();
  controls.minDistance = radius * 0.08;
  controls.maxDistance = dist * 3;

  viewer.home = { pos: pos.clone(), target };
  if (!animate) {
    camera.position.copy(pos);
    controls.target.copy(target);
    controls.update();
    return;
  }
  const fromP = camera.position.clone(), fromT = controls.target.clone();
  const t0 = performance.now(), dur = 700;
  const step = (now) => {
    const t = Math.min(1, (now - t0) / dur);
    const e = 1 - Math.pow(1 - t, 3);
    camera.position.lerpVectors(fromP, pos, e);
    controls.target.lerpVectors(fromT, target, e);
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

async function loadModel(url, onProgress) {
  if (viewer.cache.has(url)) return viewer.cache.get(url);

  onProgress(0.03, 'loadingDownload');
  const res = await fetch(url);
  if (!res.ok) throw new Error('HTTP ' + res.status);
  const raw = await res.arrayBuffer();

  onProgress(0.12, 'loadingDecompress');
  const unzipped = await gunzip(raw);

  onProgress(0.2, 'loadingParse');
  await new Promise((r) => setTimeout(r, 0));
  const schem = readSchematic(parseNBT(unzipped));

  onProgress(0.28, 'loadingBuild');
  const info = await buildMeshes(schem, (p) => onProgress(0.28 + p * 0.7, 'loadingBuild'));

  const group = new THREE.Group();
  const opaque = new THREE.Mesh(toGeometry(info.opq), new THREE.MeshBasicMaterial({ vertexColors: true }));
  group.add(opaque);
  if (info.trn.v > 0) {
    const transparent = new THREE.Mesh(
      toGeometry(info.trn),
      new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, depthWrite: false })
    );
    transparent.renderOrder = 1;
    group.add(transparent);
  }
  const b = info.bounds;
  group.position.set(-(b.minX + b.maxX) / 2, -(b.minY + b.maxY) / 2, -(b.minZ + b.maxZ) / 2);

  const model = { group, info };
  viewer.cache.set(url, model);
  return model;
}

const LOADER_TEXT = {
  en: {
    loadingDownload: 'Downloading schematic…', loadingDecompress: 'Decompressing…',
    loadingParse: 'Reading blocks…', loadingBuild: 'Building 3D model…',
    loadingError: 'Could not load the 3D model.', blocks: 'blocks',
  },
  es: {
    loadingDownload: 'Descargando schematic…', loadingDecompress: 'Descomprimiendo…',
    loadingParse: 'Leyendo bloques…', loadingBuild: 'Construyendo modelo 3D…',
    loadingError: 'No se pudo cargar el modelo 3D.', blocks: 'bloques',
  },
};
const tr = (key) => {
  const lang = document.documentElement.lang === 'es' ? 'es' : 'en';
  return LOADER_TEXT[lang][key] || key;
};

async function openViewer({ src, title, kicker }) {
  const modal = $('viewerModal');
  $('viewerTitle').textContent = title;
  if (kicker) $('viewerKickerType').textContent = kicker;
  $('viewerStats').textContent = '';
  modal.classList.add('is-open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('viewer-lock');
  viewer.open = true;
  setLoader(true, 0, tr('loadingDownload'));

  try {
    await loadThree();
    initRenderer();
    resize();

    if (viewer.group) viewer.scene.remove(viewer.group);
    viewer.current = src;
    const model = await loadModel(src, (p, key) => setLoader(true, p, tr(key)));
    if (viewer.current !== src || !viewer.open) return;

    viewer.group = model.group;
    viewer.scene.add(model.group);
    resize();
    frameModel(model.info);
    setAutoRotate(true);

    const b = model.info.bounds;
    const fmt = new Intl.NumberFormat(document.documentElement.lang || 'en');
    $('viewerStats').textContent =
      `${b.maxX - b.minX} × ${b.maxY - b.minY} × ${b.maxZ - b.minZ} · ${fmt.format(model.info.blockCount)} ${tr('blocks')}`;

    setLoader(true, 1);
    setTimeout(() => setLoader(false), 250);
    cancelAnimationFrame(viewer.raf);
    loop();
  } catch (err) {
    console.error('[schem-viewer]', err);
    setLoader(true, null, tr('loadingError'));
    $('viewerLoader').classList.add('is-error');
  }
}

function closeViewer() {
  const modal = $('viewerModal');
  modal.classList.remove('is-open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('viewer-lock');
  viewer.open = false;
  viewer.current = null;
  cancelAnimationFrame(viewer.raf);
  $('viewerLoader')?.classList.remove('is-error');
  if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
}

function init() {
  const modal = $('viewerModal');
  if (!modal) return;

  document.querySelectorAll('.portfolio-card[data-schem]').forEach((card) => {
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    const open = () => openViewer({
      src: card.dataset.schem,
      title: card.dataset.schemTitle || card.querySelector('h4')?.textContent || '3D',
      kicker: card.querySelector('.portfolio-overlay span')?.textContent,
    });
    card.addEventListener('click', open);
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
    });
  });

  modal.querySelectorAll('[data-viewer-close]').forEach((el) => el.addEventListener('click', closeViewer));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && viewer.open) closeViewer();
  });

  $('viewerRotateBtn').addEventListener('click', () => setAutoRotate(!viewer.controls?.autoRotate));
  $('viewerResetBtn').addEventListener('click', () => {
    const m = viewer.cache.get(viewer.current);
    if (m) frameModel(m.info, true);
  });
  $('viewerFullscreenBtn').addEventListener('click', () => {
    const panel = modal.querySelector('.viewer-panel');
    if (document.fullscreenElement) document.exitFullscreen();
    else panel.requestFullscreen?.().catch(() => {});
  });
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
