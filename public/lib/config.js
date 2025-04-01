export const ENDPOINT = 'http://localhost:3000';
export const ITEMS_PER_PAGE = 10;
export const MONSTERS_THUMB_PATH = './assets/images/monsters_thumb';
export const MONSTERS_MODELS_PATH = './assets/images/monsters_models';
export const FAMILIES_ICONS_PATH = './assets/images/families_icons';
export const STATS_ICONS_PATH = './assets/images/stats_icons';
export const BOXES_IMG_PATH = './assets/images/boxes';
export const ACCESSORY_IMG_PATH = './assets/images/accessory.png';
export const MAX_IN_PARTY = 4;
export const STATS_MAP = {
  hp: 'HP',
  mp: 'MP',
  att: 'Attaque',
  def: 'Défense',
  agi: 'Agilité',
  wis: 'Sagesse'
};
export const BOXES = {
  mimic: { 
    ranks: [1, 2, 3], 
    probabilities: [0.5, 0.3, 0.2] 
  },
  canni: { 
    ranks: [4, 5, 6], 
    probabilities: [0.5, 0.3, 0.2]
  },
  pandora: { 
    ranks: [7, 8, 9],
     probabilities: [0.5, 0.3, 0.2]
  }
};