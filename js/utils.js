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

function zeroPad(num, width) {
    return String(num).padStart(2, '0');
}
function formatTime(ms) {
    const SECONDS_PER_HOUR = 60 * 60,
        SECONDS_PER_MINUTE = 60,
        totalSecs = Math.floor(ms / 1000),
        hours = Math.floor(totalSecs / SECONDS_PER_HOUR),
        minutes = Math.floor((totalSecs - hours * SECONDS_PER_HOUR) / 60),
        seconds = totalSecs % SECONDS_PER_MINUTE;

    return `${zeroPad(hours)}:${zeroPad(minutes)}:${zeroPad(seconds)}`;
}