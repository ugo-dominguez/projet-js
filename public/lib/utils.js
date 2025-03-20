export function getHashAndParams() {
    let [hashPart, paramString] = window.location.hash.split('?');
    let hash = hashPart.replace('#', '');
    let params = new URLSearchParams(paramString || '');
    return { hash, params };
}

export function setHashParam(key, value) {
    let { hash, params } = getHashAndParams();
    params.set(key, value);

    let newHash = hash + (params.toString() ? `?${params.toString()}` : '');

    window.location.hash = newHash;
}

export function getHashParam(key) {
    let { params } = getHashAndParams();
    return params.get(key);
}

export function removeHashParam(key) {
    let { hash, params } = getHashAndParams();
    params.delete(key);

    let newHash = hash + (params.toString() ? `?${params.toString()}` : '');

    window.location.hash = newHash;
}

window.getHashAndParams = getHashAndParams;
window.setHashParam = setHashParam;
window.getHashParam = getHashParam;
window.removeHashParam = removeHashParam;
