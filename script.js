document.addEventListener('DOMContentLoaded', function () {
    function updateTime() {
        const now = new Date();
        const localHours = String(now.getHours()).padStart(2, '0');
        const localMinutes = String(now.getMinutes()).padStart(2, '0');
        const localSeconds = String(now.getSeconds()).padStart(2, '0');
        document.getElementById('clock').textContent = `${localHours}:${localMinutes}:${localSeconds}`;
    }
    updateTime();
    setInterval(updateTime, 1000);

    const today = new Date();
    const dayName = today.toLocaleDateString('th-TH', { weekday: 'long' });
    const dayMonth = today.toLocaleDateString('th-TH', { day: 'numeric', month: 'long' });
    const thaiDate = `${dayName}, ${dayMonth}`;
    const dateElement = document.getElementById('thai-date');
    if (dateElement) dateElement.textContent = thaiDate;
});

// ตรวจสอบ GPS
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(success, error);
} else {
    document.getElementById("location").textContent = "📍 ไม่รองรับ GPS";
}

async function success(pos) {
    const { latitude, longitude } = pos.coords;

    // 📍 ที่อยู่
    const nominatimURL = `https://nominatim.openstreetmap.org/reverse?format=json&accept-language=th&lat=${latitude}&lon=${longitude}`;
    const nomiRes = await fetch(nominatimURL);
    const nomiData = await nomiRes.json();
    const a = nomiData.address;
    const area = a.suburb || a.town || a.village || a.city_district || a.city || "-";
    let province = a.state || a.region || a.city || a.county || "-";
    if (province === "กรุงเทพมหานคร") province = "กรุงเทพฯ";
    document.getElementById("location").textContent = `📍 ${area}, ${province}`;

    try {
        // 🌤 Weather info
        const weatherRes = await axios.get("https://api.openweathermap.org/data/2.5/weather", {
            params: {
                lat: latitude,
                lon: longitude,
                appid: "c125eee6cba494a329341c56fcfbb227",
                units: "metric",
                lang: "th",
            },
        });

        const weather = weatherRes.data;
        const temp = Math.round(weather.main.temp);
        const feels = Math.round(weather.main.feels_like);
        const desc = weather.weather[0].description;
        const icon = weather.weather[0].icon;
        const humidity = weather.main.humidity;
        const wind = weather.wind.speed;
        const visibility = weather.visibility / 1000;
        const sunrise = new Date(weather.sys.sunrise * 1000).toLocaleTimeString("th-TH", { hour: '2-digit', minute: '2-digit' });
        const sunset = new Date(weather.sys.sunset * 1000).toLocaleTimeString("th-TH", { hour: '2-digit', minute: '2-digit' });
        const iconUrl = `https://openweathermap.org/img/wn/${icon}@4x.png`;

        document.getElementById("weather-icon").src = iconUrl;
        document.getElementById("temp").textContent = `${temp}°C`;
        document.getElementById("desc").textContent = `${desc}`;
        document.getElementById("feels").textContent = `รู้สึก: ${feels}°C`;
        document.getElementById("humidity").textContent = `ความชื้น: ${humidity}%`;
        document.getElementById("wind").textContent = `ลม: ${wind} m/s`;
        document.getElementById("sunrise").textContent = `ขึ้น: ${sunrise}`;
        document.getElementById("sunset").textContent = `ตก: ${sunset}`;
        document.getElementById("sunrise-time").textContent = `พระอาทิตย์ขึ้น: ${sunrise}`;
        document.getElementById("sunset-time").textContent = `พระอาทิตย์ตก: ${sunset}`;

        const dewPoint = temp - ((100 - humidity) / 5);
        const windTime = new Date().toLocaleTimeString("th-TH", {
            hour: "2-digit",
            minute: "2-digit"
        });
        document.getElementById("wind-speed").textContent = `${wind.toFixed(1)} m/s`;
        document.getElementById("wind-time").textContent = windTime;
        document.getElementById("humidity-val").textContent = `${humidity}%`;
        document.getElementById("dew-point").textContent = `Dew point is ${dewPoint.toFixed(1)}°`;
        document.getElementById("visibility").textContent = `${visibility.toFixed(1)} km`;
        document.getElementById("visibility-note").textContent = visibility < 1 ? "Haze is affecting" : "Clear view";

        // ☀ UV Index
        const uvRes = await fetch(`https://api.openweathermap.org/data/2.5/uvi?lat=${latitude}&lon=${longitude}&appid=c125eee6cba494a329341c56fcfbb227`);
        const uvData = await uvRes.json();
        document.getElementById("uv-index").textContent = `${uvData.value.toFixed(1)} UV`;

        //รายชั่วโมง
        const res = await axios.get("https://api.openweathermap.org/data/3.0/onecall", {
            params: {
                lat: latitude,
                lon: longitude,
                exclude: "current,minutely,daily,alerts",
                appid: "c125eee6cba494a329341c56fcfbb227",
                units: "metric",
                lang: "th"
            }
        });

        const hourly = res.data.hourly.slice(1, 7); // แสดงแค่ 12 ชั่วโมง
        const container = document.getElementById("hourly-forecast");
        container.innerHTML = "";

        hourly.forEach(hour => {
            const time = new Date(hour.dt * 1000).toLocaleTimeString("th-TH", {
                hour: '2-digit', minute: '2-digit'
            });
            const temp = `${Math.round(hour.temp)}°`;
            const icon = hour.weather[0].icon;
            const iconUrl = `https://openweathermap.org/img/wn/${icon}@2x.png`;

            const card = document.createElement("div");
            card.className = "hour-card";
            card.innerHTML = `
              <h3>${time}</h3>
              <img src="${iconUrl}" alt="icon">
              <p>${temp}</p>
            `;

            container.appendChild(card);
        });



    } catch (err) {
        document.getElementById("weather").textContent = "❌ โหลดข้อมูลอากาศไม่ได้";
    }


    // city weather
    const cities = [
        "Bangkok",
        "Chiang Khong",
        "Pattani",
        "Kuala Lumpur, Malaysia"

      ];
      
      const apiKey = "c125eee6cba494a329341c56fcfbb227";
      const cityCardsContainer = document.getElementById("cities-weather");
      
      cities.forEach(async (city) => {
        try {
          const res = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city},TH&appid=${apiKey}&units=metric&lang=th`
          );
          const data = await res.json();
      
          const icon = data.weather[0].icon;
          const desc = data.weather[0].description;
          const temp = Math.round(data.main.temp);
      
          const card = document.createElement("div");
          card.className = "city-card";
          card.innerHTML = `
            <div>
              <div class="city-name">${city}</div>
              <div class="temp">${temp}°C</div>
              <div class="desc">${desc}</div>
            </div>
            <img
              class="city-icon"
              src="https://openweathermap.org/img/wn/${icon}@2x.png"
              alt="${desc}"
            />
          `;
      
          cityCardsContainer.appendChild(card);
        } catch (err) {
          const card = document.createElement("div");
          card.className = "city-card";
          card.innerHTML = `<strong>${city}</strong><br>❌ โหลดไม่ได้`;
          cityCardsContainer.appendChild(card);
        }
      });
      


}

function error() {
    document.getElementById("location").textContent = "📍 คุณปฏิเสธการระบุตำแหน่ง";
    document.getElementById("weather").textContent = "❌ ไม่มีข้อมูลอากาศ";
}

