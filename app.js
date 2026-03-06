document.addEventListener('DOMContentLoaded', initApp);

let prayerTimes = null;
let countdownInterval = null;

async function initApp() {
    try {
        const times = await fetchPrayerTimes();
        prayerTimes = times;

        document.getElementById('loader').classList.add('hidden');
        document.getElementById('app').classList.remove('hidden');

        startCountdown();
    } catch (error) {
        console.error("Error initializing app:", error);
        document.getElementById('loader').classList.add('hidden');
        document.getElementById('error').classList.remove('hidden');
    }
}

async function fetchPrayerTimes() {
    // Aladhan API - method 13 is Diyanet for Turkey
    try {
        const res = await fetch('https://api.aladhan.com/v1/timingsByCity?city=Istanbul&country=Turkey&method=13');
        if (!res.ok) throw new Error("Network response was not ok");
        const data = await res.json();
        return data.data.timings;
    } catch (error) {
        console.warn("API'ye ulaşılamadı. Yedek vakitler kullanılıyor.", error);
        return {
            Imsak: "05:40",
            Maghrib: "19:10"
        };
    }
}

function startCountdown() {
    if (countdownInterval) clearInterval(countdownInterval);
    updateTimer();
    countdownInterval = setInterval(updateTimer, 1000);
}

function updateTimer() {
    const now = new Date();

    // Parse times for today
    const { Imsak, Maghrib } = prayerTimes;

    const imsakTime = parseTimeToday(Imsak);
    const iftarTime = parseTimeToday(Maghrib);

    let targetTime = null;
    let targetName = "";

    if (now >= imsakTime && now < iftarTime) {
        // Fasting - Counting down to Iftar
        targetTime = iftarTime;
        targetName = "İFTARA KALAN SÜRE";
        document.getElementById('target-time').textContent = Maghrib;
    } else {
        // Not fasting - Counting down to Sahur (Imsak)
        targetName = "SAHURA KALAN SÜRE";
        if (now < imsakTime) {
            // Before today's Imsak
            targetTime = imsakTime;
            document.getElementById('target-time').textContent = Imsak;
        } else {
            // After today's Iftar, waiting for tomorrow's Imsak
            if (prayerTimes.tomorrowImsak) {
                // Use actual tomorrow's imsak if fetched
                const [h, m] = prayerTimes.tomorrowImsak.split(':').map(Number);
                targetTime = new Date();
                targetTime.setDate(targetTime.getDate() + 1);
                targetTime.setHours(h, m, 0, 0);
                document.getElementById('target-time').textContent = prayerTimes.tomorrowImsak;
            } else {
                // Fallback: Add 24 hours to today's imsak
                targetTime = new Date(imsakTime.getTime() + 24 * 60 * 60 * 1000);
                document.getElementById('target-time').textContent = Imsak;

                if (!prayerTimes.fetchingTomorrow) {
                    prayerTimes.fetchingTomorrow = true;
                    fetchTomorrowImsak();
                }
            }
        }
    }

    const diff = targetTime - now;

    // When time is up, refresh the page automatically after 2 seconds
    // to cleanly load the new cycle and fresh times.
    if (diff <= 0 && diff > -2000) {
        updateDisplay(0, 0, 0);
        if (!prayerTimes.reloading) {
            prayerTimes.reloading = true;
            setTimeout(() => window.location.reload(), 2000);
        }
        return;
    }

    if (diff < 0) return; // Waiting for reload

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    // Update UI
    document.getElementById('title').textContent = targetName;
    updateDisplay(hours, minutes, seconds);
}

function parseTimeToday(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
}

function updateDisplay(h, m, s) {
    document.getElementById('hours').textContent = h.toString().padStart(2, '0');
    document.getElementById('minutes').textContent = m.toString().padStart(2, '0');
    document.getElementById('seconds').textContent = s.toString().padStart(2, '0');
}

async function fetchTomorrowImsak() {
    try {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const day = String(tomorrow.getDate()).padStart(2, '0');
        const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
        const year = tomorrow.getFullYear();

        const dateStr = `${day}-${month}-${year}`;
        const res = await fetch(`https://api.aladhan.com/v1/timingsByCity/${dateStr}?city=Istanbul&country=Turkey&method=13`);
        if (!res.ok) throw new Error("API error");
        const data = await res.json();

        prayerTimes.tomorrowImsak = data.data.timings.Imsak;
    } catch (e) {
        console.warn("Yarının imsak vakti alınamadı, yedek değer kullanılıyor.", e);
        prayerTimes.fetchingTomorrow = false;
        prayerTimes.tomorrowImsak = "05:39"; // Basic fallback
    }
}
