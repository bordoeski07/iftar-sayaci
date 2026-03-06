const fs = require('fs');
const https = require('https');

function fetchMonth(month, year) {
    return new Promise((resolve, reject) => {
        https.get(`https://api.aladhan.com/v1/calendarByCity/${year}/${month}?city=Istanbul&country=Turkey&method=13`, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(JSON.parse(data).data));
        }).on('error', reject);
    });
}

async function main() {
    try {
        const feb = await fetchMonth(2, 2026);
        const mar = await fetchMonth(3, 2026);

        let ramadanDays = [];

        for (let day of [...feb, ...mar]) {
            if (day.date.hijri.month.number === 9) {
                ramadanDays.push({
                    date: day.date.gregorian.date,
                    imsak: day.timings.Imsak.split(' ')[0],
                    iftar: day.timings.Maghrib.split(' ')[0]
                });
            }
        }

        fs.writeFileSync('ramadan_2026.json', JSON.stringify(ramadanDays, null, 2));
        console.log("SUCCESS");
    } catch (e) {
        console.error(e);
    }
}

main();
