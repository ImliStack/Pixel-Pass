// Original pixel-art sprites as string grids. '.' = transparent.
// Same data is meant to be reused by the Flutter CustomPainter port.

export type Palette = Record<string, string>;
export type Grid = string[];

export const heroPalette: Palette = {
  R: '#e8452c', // cap
  r: '#a92d1a', // cap brim
  H: '#4a2b1a', // hair
  S: '#f6c59c', // skin
  s: '#d58f62', // skin shade
  K: '#1d1a17', // eye
  T: '#1fa39a', // shirt
  N: '#2d3f94', // overalls
  Y: '#ffd34d', // buttons
  B: '#6b3a1f', // boots
};

export const hero: Record<'stand' | 'runA' | 'runB' | 'jump', Grid> = {
  stand: [
    '...RRRRR....',
    '..RRRRRRRRR.',
    '..HHHSSKS...',
    '.HSHSSSKSSS.',
    '.HSHHSSSSSSs',
    '.HHSSSSssss.',
    '...SSSSSSS..',
    '..TTNTTT....',
    '.TTTNTTNTTT.',
    'TTTTNNNNTTTT',
    'SSTNYNNYNTSS',
    'SSSNNNNNNSSS',
    'SSNNNNNNNNSS',
    '..NNN..NNN..',
    '.BBB....BBB.',
    'BBBB....BBBB',
  ],
  runA: [
    '...RRRRR....',
    '..RRRRRRRRR.',
    '..HHHSSKS...',
    '.HSHSSSKSSS.',
    '.HSHHSSSSSSs',
    '.HHSSSSssss.',
    '...SSSSSSS..',
    '..TTTTNTT...',
    'SSTTTTNNTTSS',
    'SSTTTNNNNTSS',
    '..TTNYNNYN..',
    '...NNNNNNN..',
    '..NNNNNNNNN.',
    '.NNNN...NNN.',
    'BBB......BBB',
    'BBBB.....BBB',
  ],
  runB: [
    '...RRRRR....',
    '..RRRRRRRRR.',
    '..HHHSSKS...',
    '.HSHSSSKSSS.',
    '.HSHHSSSSSSs',
    '.HHSSSSssss.',
    '...SSSSSSS..',
    '...TTNTT....',
    '..TTTNNTTS..',
    '..TTNNNNTS..',
    '..SNYNNYN...',
    '...NNNNNN...',
    '...NNNNNN...',
    '....NNNN....',
    '....BBBB....',
    '...BBBBB....',
  ],
  jump: [
    '...RRRRR..SS',
    '..RRRRRRRRSS',
    '..HHHSSKS.TT',
    '.HSHSSSKSSTT',
    '.HSHHSSSSSTs',
    '.HHSSSSsssT.',
    '...SSSSSSTT.',
    '..TTNTTTTT..',
    '.TTTNTTNTT..',
    'TTTTNNNNT...',
    'SSTNYNNYN...',
    'SSSNNNNNNN..',
    'SSNNNNNNNNN.',
    '.NNNN..NNNN.',
    'BBB.....BBBB',
    'BB.......BBB',
  ],
};

export const royalPalette: Palette = {
  G: '#ffcf33', // crown
  J: '#e5484d', // jewel
  H: '#5a3320', // hair
  S: '#f6c59c',
  s: '#e08f7a', // cheek / mouth
  K: '#1d1a17',
  P: '#a98be0', // dress
  p: '#7d5fc0',
  L: '#d9cbf7',
  Y: '#ffcf33',
};

export const royal: Grid = [
  '...G.G.G....',
  '...GGJGG....',
  '..HHHHHHH...',
  '.HHSSSSSHH..',
  '.HSKSSSKSH..',
  '.HsSSSSSsH..',
  '.HSSSssSSH..',
  '.HHSSSSSHH..',
  '..HHPLLPHH..',
  '..SPPPPPPS..',
  '.SSPPYYPPSS.',
  '...PPPPPP...',
  '..PPLPPLPP..',
  '..PPPPPPPP..',
  '.PPPLPPLPPP.',
  '.PpPPPPPPpP.',
  'PPpPPPPPPpPP',
  'ppppppppppPp',
];

export const castlePalette: Palette = {
  C: '#c6582c',
  c: '#7c2f12',
  D: '#1d1a17',
};

export const castle: Grid = [
  '....CC.CC.CC....',
  '....CCCCCCCC....',
  '....CcCCcCCc....',
  '....CCCDDCCC....',
  '....CcCDDCcC....',
  '....CCCCCCCC....',
  'CC.CC.CCCC.CC.CC',
  'CCCCCCCCCCCCCCCC',
  'CcCCCcCCCcCCCcCC',
  'CCCCCCCCCCCCCCCC',
  'CCcCCCcDDCcCCCcC',
  'CCCCCCDDDDCCCCCC',
  'CcCCCCDDDDCCCcCC',
  'CCCCCCDDDDCCCCCC',
  'CCcCCCDDDDCcCCCC',
  'CCCCCCDDDDCCCCCC',
];

export const heartPalette: Palette = { R: '#e5484d', W: '#ff9a9e' };
export const heart: Grid = [
  '.RR.RR.',
  'RWRRRRR',
  'RRRRRRR',
  '.RRRRR.',
  '..RRR..',
  '...R...',
];

// ---------- scenery (soft colours so it stays behind the action) ----------
export const sceneryPalette: Palette = {
  W: '#ffffff',
  w: '#e6e1d6', // cloud shade
  G: '#cfe3b4', // hill
  g: '#b5d197', // hill shade / outline
  D: '#9cc27c', // hill spots
  B: '#a8d08a', // bush
  b: '#8dbd6e', // bush shade
};

export const cloud: Grid = [
  '......WWWW......',
  '....WWWWWWWW....',
  '..WWWWWWWWWWWW..',
  '.WWWWWWWWWWWWWW.',
  'WWWWWWWWWWWWWWWW',
  'WWWWWWWWWWWWWWWW',
  '.wwwwwwwwwwwwww.',
];

export const hill: Grid = [
  '..........gggggggg..........',
  '.......gggGGGGGGGGggg.......',
  '.....ggGGGGGGGGGGGGGGgg.....',
  '....gGGGGGDGGGGGGGGGGGGg....',
  '...gGGGGGGGGGGGGGDGGGGGGg...',
  '..gGGGGGGGGGGGGGGGGGGGGGGg..',
  '.gGGGGDGGGGGGGGGGGGGGGGGGGg.',
  '.gGGGGGGGGGGGGDGGGGGGGGGGGg.',
  'gGGGGGGGGGGGGGGGGGGGGGDGGGGg',
  'gGGGGGGGGGGGGGGGGGGGGGGGGGGg',
];

export const bush: Grid = [
  '...bBBb....bBBb.....',
  '..bBBBBb..bBBBBb.bb.',
  '.bBBBBBBbbBBBBBBbBBb',
  'bBBBBBBBBBBBBBBBBBBB',
  'bbbbbbbbbbbbbbbbbbbb',
];

// ---------- finish flag ----------
export const flagPalette: Palette = { F: '#1fa25c', f: '#158249', W: '#ffffff' };
export const flag: Grid = [
  'FFFFFFFFFFF.',
  'FFFFFFWFFF..',
  'FFFFFWWWFF..',
  'FFFFFFWFFF..',
  'fFFFFFFFF...',
  'ffffffff....',
];

// ---------- login: castle guard ----------
export const guardPalette: Palette = {
  h: '#6b7682', // helmet outline
  H: '#a7b2bd', // helmet steel
  S: '#f6c59c',
  K: '#1d1a17',
  G: '#1fa25c', // tunic (ImliStack green)
  g: '#158249',
  y: '#ffd34d', // belt
  B: '#5a3a22', // boots
};

const guardBody = [
  '...GGGGGG...',
  '..GGGgGGGG..',
  '.SGGGgGGGGS.',
  '.SGGGgGGGGS.',
  '..GGGgGGGG..',
  '..yyyyyyyy..',
  '..GGG..GGG..',
  '..hhh..hhh..',
  '.BBBB..BBBB.',
];
const guardHead = (face: [string, string, string]) => ['....hhhh....', '...hHHHHh...', '..hHHHHHHh..', ...face, '..hhSSSShh..'];

/** Eyes follow the email caret (left / centre / right); the visor drops for the password. */
export const guard = {
  left: [...guardHead(['..hSSSSSSh..', '..hKSSKSSh..', '..hSSSSSSh..']), ...guardBody],
  center: [...guardHead(['..hSSSSSSh..', '..hSKSSKSh..', '..hSSSSSSh..']), ...guardBody],
  right: [...guardHead(['..hSSSSSSh..', '..hSSKSSKh..', '..hSSSSSSh..']), ...guardBody],
  visor: [...guardHead(['..hHHHHHHh..', '..hKKKKKKh..', '..hHHHHHHh..']), ...guardBody],
  happy: [...guardHead(['..hSSSSSSh..', '..hSKSSKSh..', '..hSSKKSSh..']), ...guardBody],
};
