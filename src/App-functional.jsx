import { useState, useEffect } from 'react';

function getWeatherIcon(wmoCode) {
  const icons = new Map([
    [[0], '☀️'],
    [[1], '🌤️'],
    [[2], '⛅'],
    [[3], '☁️'],
    [[45, 48], '🌫️'],
    [[51, 56, 61, 66, 80], '🌦️'],
    [[53, 55, 63, 65, 57, 67, 81, 82], '🌧️'],
    [[71, 73, 75, 77, 85, 86], '🌨️'],
    [[95], '🌩️'],
    [[96, 99], '⛈️']
  ]);

  const arr = [...icons.keys()].find(key => key.includes(wmoCode));
  if (!arr) return 'NOT FOUND';
  return icons.get(arr);
}

// function convertToFlag(countryCode) {
//   const codePoints = countryCode
//     .toUpperCase()
//     .split('')
//     .map(char => 127397 + char.charCodeAt());
//   return String.fromCodePoint(...codePoints);
// }

function formatDay(dateStr) {
  return new Intl.DateTimeFormat('en', {
    weekday: 'short'
  }).format(new Date(dateStr));
}

export default function App() {
  const [location, setLocation] = useState(() => localStorage.getItem('location') || '');
  const [isLoading, setIsLoading] = useState(false);
  const [displayLocation, setDisplayLocation] = useState({ city: '', flag: '' });
  const [weather, setWeather] = useState({});

  function handleChangeLocation(val) {
    setLocation(val);
    localStorage.setItem('location', location);
  }

  useEffect(
    function () {
      async function fetchWeather() {
        if (location.length < 2) return setWeather({});

        try {
          setIsLoading(true);
          // 1) Getting location (geocoding)
          const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${location}`);
          const geoData = await geoRes.json();

          if (!geoData.results) throw new Error('Location not found');

          const { latitude, longitude, timezone, name, country_code } = geoData.results.at(0);
          setDisplayLocation({ city: name, flag: country_code.toLowerCase() });

          // 2) Getting actual weather
          const weatherRes = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&timezone=${timezone}&daily=weathercode,temperature_2m_max,temperature_2m_min`
          );
          const weatherData = await weatherRes.json();
          setWeather(weatherData.daily);
        } catch (err) {
          console.error(err);
        } finally {
          setIsLoading(false);
        }
      }

      fetchWeather();
    },
    [location]
  );

  return (
    <div className="app">
      <h1>Class Weather</h1>
      <div>
        <Input location={location} onChangeLocation={handleChangeLocation} />
      </div>

      {isLoading && <p className="loader">Loading...</p>}
      {weather.weathercode && !isLoading && (
        <Weather weather={weather} city={displayLocation.city} flag={displayLocation.flag} />
      )}
    </div>
  );
}

function Input({ location, onChangeLocation }) {
  return (
    <input
      type="text"
      placeholder="Search for location..."
      value={location}
      onChange={e => onChangeLocation(e.target.value)}
    />
  );
}

function Weather({
  weather: { temperature_2m_max: max, temperature_2m_min: min, time: dates, weathercode: codes },
  city,
  flag
}) {
  return (
    <div>
      <h2>
        Weather for {city}
        <img src={`https://flagcdn.com/24x18/${flag}.png`} alt="country flag" />
      </h2>
      <ul className="weather">
        {dates.map((date, idx) => (
          <Day key={date} code={codes.at(idx)} max={max.at(idx)} min={min.at(idx)} date={date} isToday={idx === 0} />
        ))}
      </ul>
    </div>
  );
}

function Day({ max, min, date, code, isToday }) {
  return (
    <li className={`day ${isToday ? 'important' : ''}`}>
      <span>{getWeatherIcon(code)}</span>
      <p>{isToday ? 'Today' : formatDay(date)}</p>
      <p>
        {Math.floor(min)}&deg; &mdash; {Math.ceil(max)}&deg;
      </p>
    </li>
  );
}
