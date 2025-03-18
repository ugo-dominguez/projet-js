import { Monster } from '../models/monster.js';
import { Family } from '../models/family.js';


export class Provider {
    constructor() {
        this.monsters = [];
        this.families = [];
    }

    async loadMonstersData(url) {
        try {
            const response = await fetch(url);
            const data = await response.json();
            this.monsters = data.map(monsterData => new Monster(monsterData));
        } catch (error) {
            console.error('Erreur lors du chargement des monstres :', error);
        }
    }

    async loadFamiliesData(url) {
        try {
            const response = await fetch(url);
            const data = await response.json();
            this.families = data.map(familyData => new Family(familyData));
        } catch (error) {
            console.error('Erreur lors du chargement des familles :', error);
        }
    }

    getMonsters() {
        return this.monsters;
    }

    getFamilies() {
        return this.families;
    }

    getMonsterById(monsterId) {
        return this.monsters.find(monster => monster.monster_id === monsterId);
    }

    getFamilyById(familyId) {
        return this.families.find(family => family.family_id === familyId);
    }

}