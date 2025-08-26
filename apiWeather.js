const apiKey = '76773275211747af92b45559242611';
const city = 'Bangkok';
const apiUrl = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city}&aqi=no`;

fetch(apiUrl)
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        // Insert weather data into the page
        const weatherDiv = document.getElementById('apiWeather');
        weatherDiv.innerHTML = `
            <h3>${data.location.name}, ${data.location.country}</h3>
            <h4>อุณหภูมิ: ${data.current.temp_c}°C &nbsp; ความชื้น: ${data.current.humidity}%</h4>
            <h4>ข้อมูลสภาพอากาศ: ${data.current.condition.text}</h4>
            <img src="https:${data.current.condition.icon}" alt="${data.current.condition.text}" />
        `;
    })
    .catch(error => {
        console.error('Error fetching weather data:', error);
        document.getElementById('weather').innerHTML = '<p>ไม่สามารถโหลดข้อมูลสภาพอากาศได้ กรุณาลองใหม่อีกครั้ง</p>';
    });