import { useState } from "react"
import Map, { Marker as Pin } from "react-map-gl/maplibre"
import "maplibre-gl/dist/maplibre-gl.css"
import "./map/maplibre"
import { haversineDistance, calculateScore, target_coords } from "./game/scoring"

type Result = {
  score: number
  distance: number
}

function App() { 
  /* variable to hold pin location. either a point object or null. */ 
  // useState is a react hook that lets us store state in an object. 
  // first value is the state variable, second is a function that updates it 
  const [pin, setPin] = useState<{ longitude: number; latitude: number } | null>(null)
  const [locked, setLocked] = useState(false); // locking in the pin calculates the score
  const [result, setResult] = useState<Result | null>(null);

  function handleReset() { 
    // need to set a bunch of things to null
    setPin(null);
    setLocked(false);
    setResult(null);
  }

  function handleLockIn() {
    // store pin location in local storage and calculate score 
    if (!pin) return; // if no pin, do nothing
    const distance =haversineDistance(target_coords, { lat: pin.latitude, lon: pin.longitude });
    const score = calculateScore(distance);
    setResult({ score, distance });
    setLocked(true);
  }

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <Map 
        initialViewState={{
          bounds: [-8.7, 49.8, 1.8, 60.9],
        }}
        maxBounds={[-12, 48, 4, 62]}
        style={{ width: "100%", height: "100%" }}
        mapStyle="https://tiles.openfreemap.org/styles/positron"
        onClick={(e) => setPin({ longitude: e.lngLat.lng , latitude: e.lngLat.lat })}
        >
          {pin && <Pin longitude={pin.longitude} latitude={pin.latitude} color="red" />}
      </Map>

      {result && locked && (
        <div
          style={{
            position: "absolute",
            top: 20,
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "white",
            padding: "10px",
            borderRadius: "5px",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
            fontFamily: "Arial, sans-serif",
          }}
        >
          <h3>Results</h3>
          <p>Target coordinates: {target_coords.lat}, {target_coords.lon}</p>
          <p>Distance from target: {Math.round(result.distance)} km</p>
          <p>Score: {result.score}</p>
        </div>
      )}
      {pin && !locked && (
        <button 
        onClick={handleLockIn}
        style={{ position: "absolute", 
          bottom: 500, 
          left: "20%", 
          transform: "translateX(-50%)",
          fontSize: "24px" }}
        >
        Lock in!
        </button>
      )}

      {result && locked && (
        <button
        onClick={handleReset} 
        style={{ position: "absolute", 
          bottom: 500, 
          left: "20%", 
          transform: "translateX(-50%)",
          fontSize: "24px" }}
        >
        Reset
        </button>
      )}
    </div>
  )
}

export default App