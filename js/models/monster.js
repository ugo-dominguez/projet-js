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

    getTotalScore() {

    }

    getImageUrl() {
        return `./assets/images/monsters/${this.identifier}-thumb.png`;
    }

    toggleFavorite() {
        this.favorite = !this.favorite;
        return this;
    }
    
}