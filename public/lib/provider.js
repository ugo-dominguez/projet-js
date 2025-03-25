import { ENDPOINT } from './config.js';


export async function getMonsters() {
    const response = await fetch(`${ENDPOINT}/monsters`);
    return response.json();
}

export async function getMonster(id) {
    const response = await fetch(`${ENDPOINT}/monsters?monster_id=${id}`);
    const data = await response.json();
    return data[0];
}

export async function getFamilies() {
    const response = await fetch(`${ENDPOINT}/families`);
    return response.json();
}

export async function getFamily(id) {
    const response = await fetch(`${ENDPOINT}/families?family_id=${id}`);
    const data = await response.json();
    return data[0];
}

export async function getRanks() {
    const response = await fetch(`${ENDPOINT}/ranks`);
    return response.json();
}

export async function getRank(id) {
    const response = await fetch(`${ENDPOINT}/ranks?rank_id=${id}`);
    const data = await response.json();
    return data[0];
}

export async function getMonstersbyFamily(familyId) {
    const response = await fetch(`${ENDPOINT}/monsters?family_id=${familyId}`);
    return response.json();
}

export async function getMonstersbyRank(rankId) {
    const response = await fetch(`${ENDPOINT}/monsters?rank_id=${rankId}`);
    return response.json();
}

export let NUMBER_OF_MONSTERS = null;
export async function getNumberOfMonsters() {
    if (NUMBER_OF_MONSTERS) return NUMBER_OF_MONSTERS;

    const response = await fetch(`${ENDPOINT}/monsters`);
    const monsters = await response.json();
    NUMBER_OF_MONSTERS = monsters.length;
    return NUMBER_OF_MONSTERS;
}

export async function getParty() {
    const response = await fetch(`${ENDPOINT}/party`);
    return response.json();
}

export async function addMonsterToParty(monsterId) {
    const response = await fetch(`${ENDPOINT}/party`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ monsterId }),
    });
    
    if (!response.ok) {
        throw new Error('ERR');
    }
    
    return response.json();
}