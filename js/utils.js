export function shuffleArray(array) {
    let i = array.length,  r;

    while (i) {
        r = Math.floor(Math.random() * i--);
        [array[i], array[r]] = [array[r], array[i]];
    }

    return array;
}
export function pickOne(arr) {
    return arr[Math.floor(arr.length * Math.random())];
}
export function pickN(arr, n) {
    return shuffleArray(arr).slice(0, n);
}

export function deepFreeze(obj) {
    Object.getOwnPropertyNames(obj).forEach(propName => {
        const value = obj[propName];
        if (value && typeof value === "object") {
            deepFreeze(value);
        }
    });
}

export function zeroPad(num, width) {
    return String(num).padStart(2, '0');
}
export function formatTime(ms) {
    const SECONDS_PER_HOUR = 60 * 60,
        SECONDS_PER_MINUTE = 60,
        totalSecs = Math.floor(ms / 1000),
        hours = Math.floor(totalSecs / SECONDS_PER_HOUR),
        minutes = Math.floor((totalSecs - hours * SECONDS_PER_HOUR) / 60),
        seconds = totalSecs % SECONDS_PER_MINUTE;

    return `${zeroPad(hours)}:${zeroPad(minutes)}:${zeroPad(seconds)}`;
}