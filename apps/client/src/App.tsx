import { useState, useEffect } from "react"
import Map, { Layer, Marker as Pin, Source } from "react-map-gl/maplibre"
import "maplibre-gl/dist/maplibre-gl.css"
import "./map/maplibre"
import { haversineDistance, calculateScore } from "./game/scoring"

type Area = {
  data_zone_code: string
  centroid_lat: number
  centroid_lon: number
  cloud_probability: number
  num_acquisitions: number
}

type Result = {
  score: number
  distance: number
  nearestTarget: Area
}

// lots of inline styling - later this will become css 

function App() { 
  /* variable to hold pin location. either a point object or null. */ 
  // useState is a react hook that lets us store state in an object. 
  // first value is the state variable, second is a function that updates it 
  const [pin, setPin] = useState<{ longitude: number; latitude: number } | null>(null)
  const [targetPin, setTargetPin] = useState<{ longitude: number; latitude: number } | null>(null)
  const [locked, setLocked] = useState(false); // locking in the pin calculates the score
  const [result, setResult] = useState<Result | null>(null);
  const [areas, setAreas] = useState<Area[]>([]); // array of areas loaded from JSON
  const [targets, setTargets] = useState<Area[]>([]); // array of targets loaded from JSON


  function handleReset() { 
    // need to set a bunch of things to null
    setPin(null);
    setTargetPin(null);
    setLocked(false);
    setResult(null);
  }

  function handleLockIn() {
    // store pin location in local storage and calculate score 
    if (!pin) return; // if no pin, do nothing

      let nearestDistance = Infinity;
      let nearestTarget: Area | null = null;

      // loop through all targets - find the closest one and log the distance to it
      for (const target of targets) { 
        const targetDistance = haversineDistance(
          { lat: target.centroid_lat, lon: target.centroid_lon },  // target coordinates
          { lat: pin.latitude, lon: pin.longitude }  // pin coordinates
        ); 

        if (targetDistance < nearestDistance) {
          nearestDistance = targetDistance;
          nearestTarget = target;
        }
        console.log(`Distance to target ${target.data_zone_code}: ${targetDistance} km`);
      }
      // then calculate the score based on the distance to the closest target
      const score = calculateScore(nearestDistance);
      if (!nearestTarget) {
        console.error("No nearest target found");
        return;
      }
      setTargetPin({ longitude: nearestTarget.centroid_lon, latitude: nearestTarget.centroid_lat });
      setResult({ score, distance: nearestDistance, nearestTarget });
      setLocked(true);
  }

  useEffect(() => {
    // Load saved data
    fetch("/data/areas.json")
    .then(res => res.json())
    .then(data => {console.log("Loaded areas data", data[0])
      setAreas(data)
    })
  }, []);

  /* sort areas by cloud probability and log the top 5 */
  useEffect(() => {
    if (areas.length > 0) {
      const sortedAreas = [...areas].sort((a, b) => b.cloud_probability - a.cloud_probability);
      console.log("Top 1 areas with highest cloud probability:", sortedAreas.slice(0, 1));
      setTargets(sortedAreas.slice(0, 1)); // store top 25 targets in state
    }
  }, [areas]);  

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <Map 
        initialViewState={{
          bounds: [-8.7, 49.8, 1.8, 60.9],
        }}
        maxBounds={[-12, 48, 4, 62]}
        style={{ width: "100%", height: "100%" }}
        mapStyle="https://tiles.openfreemap.org/styles/positron"
        onClick={(e) => {if (!locked) setPin({ longitude: e.lngLat.lng , latitude: e.lngLat.lat })} }
        > {/* end of map component */}

          {pin && <Pin longitude={pin.longitude} latitude={pin.latitude} color="red" />}
          {targetPin && <Pin longitude={targetPin.longitude} latitude={targetPin.latitude} color="blue" />}

      {/* Line between the pin and the target */}
      {result && locked && pin && targetPin && (
        <Source 
        type="geojson"
        data={{
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: [
              [pin.longitude, pin.latitude],
              [result.nearestTarget.centroid_lon,
              result.nearestTarget.centroid_lat]
            ]   
          }
        }}
        >
          <Layer 
          type="line"
          paint={{
            "line-color": "blue",
            "line-width": 2,
            "line-dasharray": [4, 4],
          }}
          />
        </Source>
      )}
      </Map>

      {/* Display results */}
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
          <p>Target coordinates: {result.nearestTarget.centroid_lat}, {result.nearestTarget.centroid_lon}</p>
          <p>Target data zone code: {result.nearestTarget.data_zone_code}</p>
          <p>Cloud probability: {result.nearestTarget.cloud_probability}</p>
          <p>Distance from target: {Math.round(result.distance)} km</p>
          <p>Score: {result.score}</p>
        </div>
      )}
      {/* Story */}
      { result && locked &&
      <div
        style={{
          position: "absolute",
          top: "80%",
          left: "50%",
          transform: "translateX(-50%)",
          backgroundColor: "white",
          padding: "10px",
          borderRadius: "5px",
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <p>Something interesting to say about the game or the results.</p>
      </div>
    }

      {/* Lock in button */}
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

      {/* Reset button - restores game to initial state */}
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