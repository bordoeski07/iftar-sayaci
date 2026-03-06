const imsakiye2026 = {
    "2026-02-19": { imsak: "06:22", iftar: "18:49" },
    "2026-02-20": { imsak: "06:20", iftar: "18:51" },
    "2026-02-21": { imsak: "06:19", iftar: "18:52" },
    "2026-02-22": { imsak: "06:18", iftar: "18:53" },
    "2026-02-23": { imsak: "06:16", iftar: "18:54" },
    "2026-02-24": { imsak: "06:15", iftar: "18:55" },
    "2026-02-25": { imsak: "06:13", iftar: "18:56" },
    "2026-02-26": { imsak: "06:12", iftar: "18:58" },
    "2026-02-27": { imsak: "06:11", iftar: "18:59" },
    "2026-02-28": { imsak: "06:09", iftar: "19:00" },
    "2026-03-01": { imsak: "06:08", iftar: "19:01" },
    "2026-03-02": { imsak: "06:06", iftar: "19:02" },
    "2026-03-03": { imsak: "06:05", iftar: "19:03" },
    "2026-03-04": { imsak: "06:03", iftar: "19:04" },
    "2026-03-05": { imsak: "06:01", iftar: "19:06" },
    "2026-03-06": { imsak: "06:00", iftar: "19:07" },
    "2026-03-07": { imsak: "05:58", iftar: "19:08" },
    "2026-03-08": { imsak: "05:57", iftar: "19:09" },
    "2026-03-09": { imsak: "05:55", iftar: "19:10" },
    "2026-03-10": { imsak: "05:53", iftar: "19:11" },
    "2026-03-11": { imsak: "05:52", iftar: "19:12" },
    "2026-03-12": { imsak: "05:50", iftar: "19:14" },
    "2026-03-13": { imsak: "05:48", iftar: "19:15" },
    "2026-03-14": { imsak: "05:47", iftar: "19:16" },
    "2026-03-15": { imsak: "05:45", iftar: "19:17" },
    "2026-03-16": { imsak: "05:43", iftar: "19:18" },
    "2026-03-17": { imsak: "05:41", iftar: "19:19" },
    "2026-03-18": { imsak: "05:40", iftar: "19:20" },
    "2026-03-19": { imsak: "05:38", iftar: "19:21" }
};

document.addEventListener('DOMContentLoaded', initApp);

let countdownInterval = null;

function initApp() {
    document.getElementById('loader').classList.add('hidden');
    document.getElementById('app').classList.remove('hidden');

    buildCalendarList();
    setupAccordion();
    startCountdown();
}

function getTodayStr(date) {
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    return `${y}-${m}-${d}`;
}

function parseTime(dateStr, timeStr) {
    const [year, month, day] = dateStr.split('-').map(Number);
    const [hours, minutes] = timeStr.split(':').map(Number);
    return new Date(year, month - 1, day, hours, minutes, 0, 0);
}

function buildCalendarList() {
    const listEl = document.getElementById('calendar-list');
    listEl.innerHTML = '';

    const today = new Date();
    const todayStr = getTodayStr(today);

    // Sort dates 
    const sortedDates = Object.keys(imsakiye2026).sort();

    sortedDates.forEach((dateStr) => {
        const timings = imsakiye2026[dateStr];
        const row = document.createElement('div');

        const isToday = dateStr === todayStr;
        row.className = 'calendar-row' + (isToday ? ' today' : '');

        const dObj = new Date(dateStr);
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        const displayDate = dObj.toLocaleDateString('tr-TR', options);

        row.innerHTML = `
            <div class="calendar-date">${displayDate}</div>
            <div class="calendar-imsak">İmsak: ${timings.imsak}</div>
            <div class="calendar-iftar">İftar: ${timings.iftar}</div>
        `;
        listEl.appendChild(row);

        if (isToday) {
            setTimeout(() => {
                row.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 500);
        }
    });
}

function setupAccordion() {
    const btn = document.getElementById('calendar-btn');
    const content = document.getElementById('calendar-content');
    const arrow = btn.querySelector('.arrow');

    btn.addEventListener('click', () => {
        const isOpen = content.style.maxHeight;
        if (isOpen && isOpen !== "0px") {
            content.style.maxHeight = "0px";
            arrow.classList.remove('open');
        } else {
            content.style.maxHeight = content.scrollHeight + "px";
            arrow.classList.add('open');
        }
    });
}

function startCountdown() {
    if (countdownInterval) clearInterval(countdownInterval);
    updateTimer();
    countdownInterval = setInterval(updateTimer, 1000);
}

function updateTimer() {
    const now = new Date();
    const todayStr = getTodayStr(now);

    const sortedDates = Object.keys(imsakiye2026).sort();
    const lastDateStr = sortedDates[sortedDates.length - 1];

    // Check if Ramadan is completely over
    if (now > parseTime(lastDateStr, imsakiye2026[lastDateStr].iftar)) {
        document.getElementById('title').textContent = "HAYIRLI BAYRAMLAR";
        document.getElementById('target-info').textContent = "Ramazan tamamlandı.";
        updateDisplay(0, 0, 0);
        return;
    }

    // Check if we are before Ramadan
    if (now < parseTime(sortedDates[0], imsakiye2026[sortedDates[0]].imsak)) {
        const firstDay = sortedDates[0];
        const targetTime = parseTime(firstDay, imsakiye2026[firstDay].imsak);

        const diff = targetTime - now;
        updateDisplayParts(diff);
        document.getElementById('title').textContent = "RAMAZANA KALAN SÜRE";
        document.getElementById('target-info').innerHTML = `Hedef Vakit: <span id="target-time">${imsakiye2026[firstDay].imsak} (${firstDay})</span>`;
        return;
    }

    // Normal Ramadan Flow
    let activeDateStr = todayStr;

    // If today is not in the calendar but we are inside the start-end bounds, fallback logic
    if (!imsakiye2026[activeDateStr]) {
        // Find the next available date
        activeDateStr = sortedDates.find(d => parseTime(d, imsakiye2026[d].imsak) > now) || lastDateStr;
    }

    const timings = imsakiye2026[activeDateStr];

    const imsakTime = parseTime(activeDateStr, timings.imsak);
    const iftarTime = parseTime(activeDateStr, timings.iftar);

    let targetTime = null;
    let targetName = "";
    let targetDisplayStr = "";

    if (now < imsakTime) {
        // Counting to today's imsak
        targetTime = imsakTime;
        targetName = "SAHURA KALAN SÜRE";
        targetDisplayStr = timings.imsak;
    } else if (now >= imsakTime && now < iftarTime) {
        // Counting to today's iftar
        targetTime = iftarTime;
        targetName = "İFTARA KALAN SÜRE";
        targetDisplayStr = timings.iftar;
    } else {
        // After today's iftar -> Counting to tomorrow's imsak
        const nextDateIndex = sortedDates.indexOf(activeDateStr) + 1;
        if (nextDateIndex < sortedDates.length) {
            const nextDateStr = sortedDates[nextDateIndex];
            const nextTimings = imsakiye2026[nextDateStr];

            targetTime = parseTime(nextDateStr, nextTimings.imsak);
            targetName = "SAHURA KALAN SÜRE";
            targetDisplayStr = nextTimings.imsak;
        } else {
            document.getElementById('title').textContent = "HAYIRLI BAYRAMLAR";
            document.getElementById('target-info').textContent = "Ramazan tamamlandı.";
            updateDisplay(0, 0, 0);
            return;
        }
    }

    const diff = targetTime - now;

    if (diff <= 0 && diff > -2000) {
        updateDisplay(0, 0, 0);
        setTimeout(() => window.location.reload(), 2000);
        return;
    }

    if (diff < 0) {
        window.location.reload();
        return;
    }

    updateDisplayParts(diff);
    document.getElementById('title').textContent = targetName;
    document.getElementById('target-info').innerHTML = `Hedef Vakit: <span id="target-time">${targetDisplayStr}</span>`;
}

function updateDisplayParts(diffMs) {
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
    updateDisplay(hours, minutes, seconds);
}

function updateDisplay(h, m, s) {
    document.getElementById('hours').textContent = h.toString().padStart(2, '0');
    document.getElementById('minutes').textContent = m.toString().padStart(2, '0');
    document.getElementById('seconds').textContent = s.toString().padStart(2, '0');
}
