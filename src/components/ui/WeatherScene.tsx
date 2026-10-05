import type { WeatherId } from '@/data/world';

/** Deterministic pseudo-random so particles are stable between renders. */
const rnd = (i: number, salt: number) => {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

const CLOUDS = [0, 1, 2, 3];
const FLAKES = Array.from({ length: 40 }, (_, i) => i);
const STARS = Array.from({ length: 60 }, (_, i) => i);
const METEORS = Array.from({ length: 6 }, (_, i) => i);

export default function WeatherScene({ weather }: { weather: WeatherId }) {
  const night = weather === 'fullmoon' || weather === 'meteor';
  const cloudy = weather === 'sunny' || weather === 'rain' || weather === 'thunderstorm' || weather === 'snow';
  const cloudCount = weather === 'sunny' ? 3 : 4;

  return (
    <div className="scene" data-weather={weather} aria-hidden>
      {night && (
        <>
          <div className="night-tint" />
          {STARS.map((i) => (
            <span
              key={i}
              className="star"
              style={{
                left: `${rnd(i, 1) * 100}%`,
                top: `${rnd(i, 2) * 65}%`,
                width: 1.5 + rnd(i, 3) * 2.5,
                height: 1.5 + rnd(i, 3) * 2.5,
                animationDuration: `${2 + rnd(i, 4) * 3}s`,
                animationDelay: `${rnd(i, 5) * 3}s`,
              }}
            />
          ))}
        </>
      )}

      {weather === 'sunny' && <div className="scene__orb" />}
      {weather === 'heatwave' && (
        <>
          <div className="scene__orb scene__orb--heat" />
          <div className="heat-haze" />
        </>
      )}
      {night && <div className="scene__orb scene__orb--moon" />}

      {weather === 'meteor' &&
        METEORS.map((i) => (
          <span
            key={i}
            className="meteor"
            style={{
              left: `${40 + rnd(i, 6) * 60}%`,
              top: `${rnd(i, 7) * 35}%`,
              animationDelay: `${i * 0.9 + rnd(i, 8)}s`,
              animationDuration: `${4 + rnd(i, 9) * 3}s`,
            }}
          />
        ))}

      {cloudy &&
        CLOUDS.slice(0, cloudCount).map((i) => (
          <span
            key={i}
            className="cloud"
            style={{
              top: `${6 + rnd(i, 10) * 26}%`,
              scale: `${0.6 + rnd(i, 11) * 0.7}`,
              animationDuration: `${60 + rnd(i, 12) * 50}s`,
              animationDelay: `${-rnd(i, 13) * 90}s`,
              opacity: 0.85,
            }}
          />
        ))}

      <div className="hills" />

      {(weather === 'rain' || weather === 'thunderstorm') && (
        <div className={`rain ${weather === 'thunderstorm' ? 'rain--heavy' : ''}`} />
      )}
      {weather === 'thunderstorm' && <div className="flash" />}

      {weather === 'snow' &&
        FLAKES.map((i) => (
          <span
            key={i}
            className="flake"
            style={{
              left: `${rnd(i, 14) * 100}%`,
              width: 3 + rnd(i, 15) * 6,
              height: 3 + rnd(i, 15) * 6,
              opacity: 0.6 + rnd(i, 16) * 0.4,
              animationDuration: `${8 + rnd(i, 17) * 10}s`,
              animationDelay: `${-rnd(i, 18) * 18}s`,
            }}
          />
        ))}
    </div>
  );
}
