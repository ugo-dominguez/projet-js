import { Stats } from './stats.js';


export class Monster {
    constructor(data) {
        this.monster_id = data.monster_id;
        this.family_id = data.family_id;
        this.rank = data.rank;
        this.name = data.name;
        this.japanese_name = data.japanese_name;
        this.identifier = data.identifier;
        this.stats = new Stats(data.stats);
        this.trivia = data.trivia;
        this.favorite = false;
        this.rating = 0;
    }

    getThumbUrl() {
        return `./assets/images/monsters_thumb/${this.identifier}-thumb.png`;
    }

    getImageUrl() {
        return `./assets/images/monsters_models/${this.monster_id}.jpg`;
    }

    toggleFavorite() {
        this.favorite = !this.favorite;
        return this;
    }
    
}