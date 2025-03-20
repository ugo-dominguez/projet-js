import { ENDPOINT } from './config.js';


export async function getMonsters() {
    const response = await fetch(`${ENDPOINT}/monsters`);
    return response.json();
}

export async function getMonster(id) {
    const response = await fetch(`${ENDPOINT}/monsters/${id}`);
    return response.json();
}

export async function getFamilies() {
    const response = await fetch(`${ENDPOINT}/families`);
    return response.json();
}

export async function getFamily(id) {
    const response = await fetch(`${ENDPOINT}/families/${id}`);
    return response.json();
}

export async function getMonstersbyFamily(familyId) {
    const response = await fetch(`${ENDPOINT}/monsters?family_id=${familyId}`);
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