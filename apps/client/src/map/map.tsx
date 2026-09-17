import "maplibre-gl/dist/maplibre-gl.css"
import "./maplibre"
import Map, { Layer, Source } from "react-map-gl/maplibre"
import type { Result } from "../game/types"

// children is a special React property that gets filled in with whatever is between
// the opening and closing tags of this component when it is used

// main map component, restricted to the UK, with a click handler that sets the pin location if the map is not locked
export function UKMap({locked, setPin, children}: {
    locked: boolean, 
    setPin: (pin: { longitude: number, latitude: number }) => void, 
    children: React.ReactNode
  }) {
    return (
    <Map 
        initialViewState={{ bounds: [-8.7, 49.8, 1.8, 60.9] }}
        maxBounds={[-12, 48, 4, 62]}
        style={{ width: "100%", height: "100%" }}
        mapStyle="https://tiles.openfreemap.org/styles/positron"
        onClick={(e) => {if (!locked) setPin({ longitude: e.lngLat.lng , latitude: e.lngLat.lat })} }
    >
        {children}
        </Map>
        )
    }

// Draws a line between the pin and the target, to quickly visualise how far away the guess was
export function LineBetweenPins({pin, result}: {pin: { longitude: number, latitude: number }, result: Result}) {
    return (
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
    )
}
