export class Stats {
    constructor(stats) {
        this.hp = stats?.hp || 0;
        this.mp = stats?.mp || 0;
        this.att = stats?.att || 0;
        this.def = stats?.def || 0;
        this.agi = stats?.agi || 0;
        this.wis = stats?.wis || 0;
        this.max_hp = stats?.max_hp || 0;
        this.max_mp = stats?.max_mp || 0;
        this.max_att = stats?.max_att || 0;
        this.max_def = stats?.max_def || 0;
        this.max_agi = stats?.max_agi || 0;
        this.max_wis = stats?.max_wis || 0;
    }
    
}