export class Family {
    constructor(data) {
        this.family_id = data.family_id;
        this.name = data.name;
        this.identifier = data.identifier;
        this.japanese_name = data.japanese_name || '';
        this.bonuses = data.bonuses || {};
    }

}