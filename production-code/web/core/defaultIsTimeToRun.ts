export const defaultCheckInterval = 5_000;

export function defaultIsTimeToRun(checkInterval: number) {
    const now = Date.now();

    // Convert the time to minutes
    const totalSeconds = Math.floor(now / 1000);
    const totalMinutes = Math.floor(totalSeconds / 60);

    const currentSecond = totalSeconds % 60;
    const currentMinute = totalMinutes % 60;

    // Runs in the following intervals (with a 5s checkInterval)
    // <hour>:00:00 <--> <hour>:00:05
    // <hour>:05:00 <--> <hour>:05:05
    // <hour>:10:00 <--> <hour>:10:05
    // <hour>:15:00 <--> <hour>:15:05
    // <hour>:20:00 <--> <hour>:20:05
    // <hour>:25:00 <--> <hour>:25:05
    // <hour>:30:00 <--> <hour>:30:05
    // <hour>:35:00 <--> <hour>:35:05
    // <hour>:40:00 <--> <hour>:40:05
    // <hour>:45:00 <--> <hour>:45:05
    // <hour>:50:00 <--> <hour>:50:05
    // <hour>:55:00 <--> <hour>:55:05
    if (currentMinute % 5 === 0 && currentSecond < checkInterval / 1000) return true;

    return false;
}
