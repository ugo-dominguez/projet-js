export function getHashAndParams() {
    // Get the full hash, remove the initial '#'
    let fullHash = window.location.hash.replace(/^#/, '');
    
    // Split the hash into path and params
    const [path, paramString] = fullHash.split('?');
    
    // Create clean parameters
    const params = new URLSearchParams(paramString || '');
    
    return { 
        hash: path, 
        params 
    };
}

export function setHashParam(key, value) {
    let { hash, params } = getHashAndParams();
    
    // Remove existing parameters with the same key
    params.delete(key);
    
    // Add new parameter
    params.append(key, value);
    
    // Construct clean hash
    const newHash = params.toString() 
        ? `#${hash}?${params.toString()}` 
        : `#${hash}`;
    
    window.location.hash = newHash;
}

export function getHashParam(key) {
    let { params } = getHashAndParams();
    return params.get(key);
}

export function removeHashParam(key) {
    let { hash, params } = getHashAndParams();
    
    // Remove the specific parameter
    params.delete(key);
    
    // Construct clean hash
    const newHash = params.toString() 
        ? `#${hash}?${params.toString()}` 
        : `#${hash}`;
    
    window.location.hash = newHash;
}

// Safely assign to window to maintain existing functionality
if (typeof window !== 'undefined') {
    window.getHashAndParams = getHashAndParams;
    window.setHashParam = setHashParam;
    window.getHashParam = getHashParam;
    window.removeHashParam = removeHashParam;
}