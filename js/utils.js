function pickOne(arr) {
    return arr[Math.floor(arr.length * Math.random())];
}

function deepFreeze(obj) {
    Object.getOwnPropertyNames(obj).forEach(propName => {
        const value = obj[propName];
        if (value && typeof value === "object") {
            deepFreeze(value);
        }
    });
}
