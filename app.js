const ramadanCalendar = [
    { "date": "18-02-2026", "imsak": "06:13", "iftar": "18:49" },
    { "date": "19-02-2026", "imsak": "06:12", "iftar": "18:50" },
    { "date": "20-02-2026", "imsak": "06:10", "iftar": "18:51" },
    { "date": "21-02-2026", "imsak": "06:09", "iftar": "18:53" },
    { "date": "22-02-2026", "imsak": "06:08", "iftar": "18:54" },
    { "date": "23-02-2026", "imsak": "06:06", "iftar": "18:55" },
    { "date": "24-02-2026", "imsak": "06:05", "iftar": "18:56" },
    { "date": "25-02-2026", "imsak": "06:03", "iftar": "18:57" },
    { "date": "26-02-2026", "imsak": "06:02", "iftar": "18:58" },
    { "date": "27-02-2026", "imsak": "06:00", "iftar": "19:00" },
    { "date": "28-02-2026", "imsak": "05:59", "iftar": "19:01" },
    { "date": "01-03-2026", "imsak": "05:57", "iftar": "19:02" },
    { "date": "02-03-2026", "imsak": "05:56", "iftar": "19:03" },
    { "date": "03-03-2026", "imsak": "05:54", "iftar": "19:04" },
    { "date": "04-03-2026", "imsak": "05:53", "iftar": "19:05" },
    { "date": "05-03-2026", "imsak": "05:51", "iftar": "19:06" },
    { "date": "06-03-2026", "imsak": "05:50", "iftar": "19:08" },
    { "date": "07-03-2026", "imsak": "05:48", "iftar": "19:09" },
    { "date": "08-03-2026", "imsak": "05:46", "iftar": "19:10" },
    { "date": "09-03-2026", "imsak": "05:45", "iftar": "19:11" },
    { "date": "10-03-2026", "imsak": "05:43", "iftar": "19:12" },
    { "date": "11-03-2026", "imsak": "05:41", "iftar": "19:13" },
    { "date": "12-03-2026", "imsak": "05:40", "iftar": "19:14" },
    { "date": "13-03-2026", "imsak": "05:38", "iftar": "19:15" },
    { "date": "14-03-2026", "imsak": "05:36", "iftar": "19:16" },
    { "date": "15-03-2026", "imsak": "05:35", "iftar": "19:18" },
    { "date": "16-03-2026", "imsak": "05:33", "iftar": "19:19" },
    { "date": "17-03-2026", "imsak": "05:31", "iftar": "19:20" },
    { "date": "18-03-2026", "imsak": "05:29", "iftar": "19:21" },
    { "date": "19-03-2026", "imsak": "05:28", "iftar": "19:22" }
];

document.addEventListener('DOMContentLoaded', initApp);

let countdownInterval = null;
let currentDayIndex = -1;
let todayDateStr = "";

function initApp() {
    const today = new Date();
    const dayStr = String(today.getDate()).padStart(2, '0');
    const monthStr = String(today.getMonth() + 1).padStart(2, '0');
    const yearStr = today.getFullYear();
    todayDateStr = `${dayStr}-${monthStr}-${yearStr}`;

    // Find today in calendar, or default to the first day if before Ramadan
    currentDayIndex = ramadanCalendar.findIndex(d => d.date === todayDateStr);

    if (currentDayIndex === -1 && today < parseDateStr(ramadanCalendar[0].date)) {
        currentDayIndex = 0; // We are before Ramadan
    }

    document.getElementById('loader').classList.add('hidden');
    document.getElementById('app').classList.remove('hidden');

    buildCalendarList();
    setupAccordion();
    startCountdown();
}

function parseDateStr(dateStr) {
    const [d, m, y] = dateStr.split('-');
    return new Date(`${y}-${m}-${d}T00:00:00`);
}

function parseTime(timeStr, dateContext) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const d = new Date(dateContext.getTime());
    d.setHours(hours, minutes, 0, 0);
    return d;
}

function buildCalendarList() {
    const listEl = document.getElementById('calendar-list');
    listEl.innerHTML = '';

    ramadanCalendar.forEach((day, index) => {
        const row = document.createElement('div');
        row.className = 'calendar-row' + (day.date === todayDateStr ? ' today' : '');

        // Format date string beautifully (e.g. 18 Şubat 2026)
        const dObj = parseDateStr(day.date);
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        const displayDate = dObj.toLocaleDateString('tr-TR', options);

        row.innerHTML = `
            <div class="calendar-date">${displayDate}</div>
            <div class="calendar-imsak">İmsak: ${day.imsak}</div>
            <div class="calendar-iftar">İftar: ${day.iftar}</div>
        `;
        listEl.appendChild(row);

        // Auto scroll to today
        if (day.date === todayDateStr) {
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

    if (currentDayIndex === -1 || currentDayIndex >= ramadanCalendar.length) {
        document.getElementById('title').textContent = "RAMAZAN BİTTİ";
        document.getElementById('target-info').textContent = "Allah kabul etsin.";
        updateDisplay(0, 0, 0);
        return;
    }

    let activeDay = ramadanCalendar[currentDayIndex];
    let dateContext = parseDateStr(activeDay.date);

    // If we're actually on a different day than dateContext, we use 'now' as context generally
    // but the json date format is meant to match the days.
    if (activeDay.date === todayDateStr) {
        dateContext = now;
    }

    const imsakTime = parseTime(activeDay.imsak, dateContext);
    const iftarTime = parseTime(activeDay.iftar, dateContext);

    let targetTime = null;
    let targetName = "";
    let targetDisplayStr = "";

    if (now < imsakTime) {
        // Counting to today's imsak
        targetTime = imsakTime;
        targetName = "SAHURA KALAN SÜRE";
        targetDisplayStr = activeDay.imsak;
    } else if (now >= imsakTime && now < iftarTime) {
        // Counting to today's iftar
        targetTime = iftarTime;
        targetName = "İFTARA KALAN SÜRE";
        targetDisplayStr = activeDay.iftar;
    } else {
        // Counting to tomorrow's imsak
        if (currentDayIndex + 1 < ramadanCalendar.length) {
            const nextDay = ramadanCalendar[currentDayIndex + 1];
            let nextDateContext = new Date(dateContext.getTime());
            nextDateContext.setDate(nextDateContext.getDate() + 1);

            targetTime = parseTime(nextDay.imsak, nextDateContext);
            targetName = "SAHURA KALAN SÜRE";
            targetDisplayStr = nextDay.imsak;
        } else {
            // End of Ramadan!
            document.getElementById('title').textContent = "BAYRAM YAKLAŞTI";
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
        // Just reload to recalculate boundaries if we missed the transition somehow
        window.location.reload();
        return;
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    document.getElementById('title').textContent = targetName;
    document.getElementById('target-time').textContent = targetDisplayStr;
    updateDisplay(hours, minutes, seconds);
}

function updateDisplay(h, m, s) {
    document.getElementById('hours').textContent = h.toString().padStart(2, '0');
    document.getElementById('minutes').textContent = m.toString().padStart(2, '0');
    document.getElementById('seconds').textContent = s.toString().padStart(2, '0');
}
