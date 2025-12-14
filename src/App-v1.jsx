import React from 'react';

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

function convertToFlag(countryCode) {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
}

function formatDay(dateStr) {
  return new Intl.DateTimeFormat('en', {
    weekday: 'short'
  }).format(new Date(dateStr));
}

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      location: 'lisbon',
      isLoading: false,
      displayLocation: {
        city: '',
        flag: ''
      },
      weather: {}
    };

    this.fetchWeather = this.fetchWeather.bind(this);
  }

  async fetchWeather() {
    try {
      this.setState({ isLoading: true });
      // 1) Getting location (geocoding)
      const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${this.state.location}`);
      const geoData = await geoRes.json();
      // console.log(geoData);

      if (!geoData.results) throw new Error('Location not found');

      const { latitude, longitude, timezone, name, country_code } = geoData.results.at(0);
      this.setState({
        displayLocation: {
          city: name,
          flag: country_code.toLowerCase()
        }
      });

      // 2) Getting actual weather
      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&timezone=${timezone}&daily=weathercode,temperature_2m_max,temperature_2m_min`
      );
      const weatherData = await weatherRes.json();
      this.setState({ weather: weatherData.daily });
    } catch (err) {
      console.err(err);
    } finally {
      this.setState({ isLoading: false });
    }
  }

  render() {
    return (
      <div className="app">
        <h1>Class Weather</h1>
        <div>
          <input
            type="text"
            placeholder="Search for location..."
            value={this.state.location}
            onChange={e => this.setState({ location: e.target.value })}
          />
        </div>
        <button onClick={this.fetchWeather}>Get weather</button>

        {this.state.isLoading && <p className="loader">Loading...</p>}
        {this.state.weather.weathercode && !this.state.isLoading && (
          <Weather
            weather={this.state.weather}
            city={this.state.displayLocation.city}
            flag={this.state.displayLocation.flag}
          />
        )}
      </div>
    );
  }
}

export default App;

class Weather extends React.Component {
  render() {
    const { temperature_2m_max: max, temperature_2m_min: min, time: dates, weathercode: codes } = this.props.weather;

    return (
      <div>
        <h2>
          Weather for {this.props.city}
          <img src={`https://flagcdn.com/24x18/${this.props.flag}.png`} alt="country flag" />
        </h2>
        <ul className="weather">
          {dates.map((date, idx) => (
            <Day key={date} code={codes.at(idx)} max={max.at(idx)} min={min.at(idx)} date={date} isToday={idx === 0} />
          ))}
        </ul>
      </div>
    );
  }
}

class Day extends React.Component {
  render() {
    const { max, min, date, code, isToday } = this.props;

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
}
