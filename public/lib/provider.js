import { ENDPOINT, MAX_IN_PARTY } from './config.js';


export async function getMonsters() {
    const response = await fetch(`${ENDPOINT}/monsters`);
    return response.json();
}

export async function getMonster(id) {
    const response = await fetch(`${ENDPOINT}/monsters?id=${id}`);
    const data = await response.json();
    return data[0];
}

export async function getFamilies() {
    const response = await fetch(`${ENDPOINT}/families`);
    return response.json();
}

export async function getFamily(id) {
    const response = await fetch(`${ENDPOINT}/families?id=${id}`);
    const data = await response.json();
    return data[0];
}

export async function getRanks() {
    const response = await fetch(`${ENDPOINT}/ranks`);
    return response.json();
}

export async function getRank(id) {
    const response = await fetch(`${ENDPOINT}/ranks?id=${id}`);
    const data = await response.json();
    return data[0];
}

export async function getAccessories() {
    const response = await fetch(`${ENDPOINT}/accessories`);
    return response.json();
}

export async function getAccessory(id) {
    const response = await fetch(`${ENDPOINT}/accessories?id=${id}`);
    const data = await response.json();
    return data[0];
}

export async function getBoxes() {
    const response = await fetch(`${ENDPOINT}/boxes`);
    return response.json();
}

export async function getBox(name) {
    const response = await fetch(`${ENDPOINT}/boxes`);
    const data = await response.json();
    return data[name.toLowerCase()];
}

export async function getMonstersbyFamily(familyId) {
    const response = await fetch(`${ENDPOINT}/monsters?id=${familyId}`);
    return response.json();
}

export async function getMonstersbyRank(rankId) {
    const response = await fetch(`${ENDPOINT}/monsters?id=${rankId}`);
    return response.json();
}

export async function getAccessoriesByRank(rankiId) {
    const response = await fetch(`${ENDPOINT}/accessories?rankId=${rankiId}`);
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

export async function getMonsterFromParty(monsterId) {
    const response = await fetch(`${ENDPOINT}/party?id=${monsterId}`);
    const data = await response.json();
    return data[0];
}

export async function getBackpack() {
    const response = await fetch(`${ENDPOINT}/backpack`);
    return response.json();
}

export async function addMonsterToParty(monsterId) {
    const currentParty = await getParty() || [];
    
    if (currentParty.some(monster => monster.id === String(monsterId))) {
        return alert("Ce monstre est déjà présent dans l'équipe !");
    }
    
    if (currentParty.length >= MAX_IN_PARTY) {
        return alert("L'équipe est complète !");
    }
    
    const response = await fetch(`${ENDPOINT}/party`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: String(monsterId) }),
    });

    alert("Le monstre a été ajouté à l'équipe !");
    return response.json();
}

export async function removeMonsterFromParty(monsterId) {
    const response = await fetch(`${ENDPOINT}/party/${monsterId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    return response.json();
}

export async function getFavorites() {
    const response = await fetch(`${ENDPOINT}/favorites`);
    return response.json();
}

export async function addToFavorites(monsterId) {
    const response = await fetch(`${ENDPOINT}/favorites`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: String(monsterId) }),
    });
    return response.json();
}

export async function removeFromFavorites(monsterId) {
    const response = await fetch(`${ENDPOINT}/favorites/${monsterId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    return response.json();
}

export async function isFavorite(monsterId) {
    const favorites = await getFavorites();
    return favorites.some(fav => fav.id === String(monsterId));
}

export async function addAccessoryToMonster(monsterId, accessoryId) {
    const currentParty = await getParty() || [];
    const monster = currentParty.find(monster => String(monster.id) === String(monsterId));

    if (monster.accessory) {
        return alert("Ce monstre a déjà un accessoire !");
    }

    monster.accessory = accessoryId;

    const response = await fetch(`${ENDPOINT}/party/${monsterId}`, {
        method: 'PUT', 
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accessory: String(monster.accessory) }),
    });

    alert("L'accessoire a été ajouté au monstre !");
    return response.json();
}

export async function getAccessoryFromBackpack(accessoryId) {
    const response = await fetch(`${ENDPOINT}/backpack`);
    const backpack = await response.json();
    return backpack.find(item => String(item.id) === String(accessoryId));
}

export async function addAccessoryToBackpack(accessoryId, quantity = 1) {
    const accessory = await getAccessory(accessoryId);
    const existingItem = await getAccessoryFromBackpack(accessoryId);

    let response;
    if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        response = await fetch(`${ENDPOINT}/backpack/${accessoryId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quantity: newQuantity }),
        });
    } else {
        response = await fetch(`${ENDPOINT}/backpack`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: accessoryId, quantity }),
        });
    }

    const result = await response.json();
    alert(`Vous obtenez : ${accessory.name} (x${quantity})`);
    return result;
}

export async function removeAccessoryFromBackpack(accessoryId, quantityToRemove = 1) {
    const existingItem = await getAccessoryFromBackpack(accessoryId);
    const newQuantity = existingItem.quantity - quantityToRemove;
    let response;

    if (newQuantity <= 0) {
        response = await fetch(`${ENDPOINT}/backpack/${accessoryId}`, {
            method: 'DELETE'
        });
    } else {
        response = await fetch(`${ENDPOINT}/backpack/${accessoryId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quantity: newQuantity }),
        });
    }
}

export async function getMoney() {
    const response = await fetch(`${ENDPOINT}/money`);
    const moneyData = await response.json();
    return moneyData.amount;
}

export async function addMoney(amountToAdd) {
    const currentMoney = await getMoney();
    const newAmount = currentMoney + amountToAdd;
  
    const response = await fetch(`${ENDPOINT}/money`, {
      method: "PATCH", 
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: newAmount }),
    });
  
    return response.json(); 
}

export async function removeMoney(amountToRemove) {
    const currentMoney = await getMoney();
    const newAmount = Math.max(0, currentMoney - amountToRemove);
  
    const response = await fetch(`${ENDPOINT}/money`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: newAmount }),
    });
  
    return response.json(); 
}