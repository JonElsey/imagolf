import { useEffect, useState } from "react"
import "maplibre-gl/dist/maplibre-gl.css"
import "./maplibre"
import "./map.css"
import Map, { Layer, Source, useMap } from "react-map-gl/maplibre"
import type { Result, Area } from "../game/types"

// children is a special React property that gets filled in with whatever is between
// the opening and closing tags of this component when it is used

function ColourScale({ areas, variable, variableLabel }: { areas: Area[], variable: string, variableLabel: string | null }) {
    if (areas.length === 0) return null

    const values = areas.map(a => (a as any)[variable])
    const min = Math.min(...values)
    const max = Math.max(...values)
    
    return (
        <div className="colour-scale">
            {/* use either the variable label if provided, or the variable name if not */}
            <h3 style={{ textAlign: "center", color: "white", textShadow: "0 1px 3px rgba(0, 0, 0, 0.8)" }}>{variableLabel || variable}</h3>
            <div className="colour-scale-bar" />
            <div className="colour-scale-labels">
                <span>{min.toFixed(1)}</span>
                <span>{max.toFixed(1)}</span>
            </div>
        </div>
    )
}

function ChoroplethLayer({areas, variable}: {areas: Area[], variable: string}) {
    const { current: map } = useMap()

    // Area[] as this then gives it a length property as it is an array
    useEffect(() => {
        if (!map || areas.length == 0) return
            const values = areas.map(a => (a as any)[variable])
            const min = Math.min(...values)
            const max = Math.max(...values)

            for (const area of areas) { 
                const raw = (area as any)[variable]
                const normalised = (raw - min) / (max - min) * 100 // normalise to 0-100
                map.setFeatureState(
                    { source: "lsoa-boundaries", sourceLayer: "lsoa", id: area.data_zone_code },
                    { value: normalised }
                )
            }
            // Clean-up when we move to the next question
            return () => {
                    for (const area of areas) {
                        map.removeFeatureState(
                            { source: "lsoa-boundaries", sourceLayer: "lsoa", id: area.data_zone_code }
                        )
                    }
                }
            }, [map, areas, variable])
            return null
}   


// main map component, restricted to the UK, with a click handler that sets the pin location if the map is not locked
export function UKMap({locked, setPin, areas, variable, variableLabel, children}: {
    locked: boolean, 
    setPin: (pin: { longitude: number, latitude: number }) => void, 
    areas: Area[],
    variable: string,
    children: React.ReactNode
    variableLabel: string | null
  }) {

    const [hoveredCode, setHoveredCode] = useState<string | null>(null)
    const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null)
    return (
    <>
    <Map 
        initialViewState={{ bounds: [-8.7, 49.8, 1.8, 60.9] }}
        maxBounds={[-12, 48, 4, 62]}
        style={{ width: "100%", height: "100%", flex: 1, minHeight: 0 }}
        mapStyle="https://tiles.openfreemap.org/styles/fiord"
        interactiveLayerIds={["lsoa-solid", "lsoa-highlight"]} 
        // highlight LSOAs under the cursor, and show a tooltip with the data zone code
        onMouseMove={(e) => {
            const feature = e.features?.[0]
            const map = e.target
            // clear previous highlight
            if (hoveredCode) {
                map.setFeatureState(
                    { source: "lsoa-boundaries", sourceLayer: "lsoa", id: hoveredCode },
                    { hover: false }
                )
            }
            if (feature) {
                const code = feature.properties.data_zone_code
                map.setFeatureState(
                    { source: "lsoa-boundaries", sourceLayer: "lsoa", id: code },
                    { hover: true }
                )
                setHoveredCode(code)
                setCursorPos(e.point)
            }
        }}
        onMouseLeave={() => {
            setHoveredCode(null)
            setCursorPos(null)
        }}
        onClick={(e) => {if (!locked) setPin({ longitude: e.lngLat.lng , latitude: e.lngLat.lat })} }
    >
        {children}
        <Source
            id="lsoa-boundaries"
            type="vector"
            url={"pmtiles://" + window.location.origin + import.meta.env.BASE_URL + "data/lsoa.pmtiles"}            
            promoteId="data_zone_code"
        >
            {/* Outlines - always visible. z-order to make them below place names, town is the lowest place name type */}
            <Layer
                id="lsoa-outline"
                type="line"
                source-layer="lsoa"
                beforeId="place_town"
                paint={{
                    "line-color": "#03CEA3", // imago teal
                    "line-width": 0.2,
                }}
            />
            {/* Highlight LSOA being hovered over */}
            <Layer
                id="lsoa-highlight"
                type="line"
                source-layer="lsoa"
                paint={{
                    "line-color": "#FF8F42",
                    "line-width": ["case", ["boolean", ["feature-state", "hover"], false], 2, 0],
                }}
            />
            {/* Fill - visible before lock-in, intended to make the LSOAs distinct on the map and show the "play area" */} 
            <Layer
                id="lsoa-solid"
                type="fill"
                beforeId="place_town"
                source-layer="lsoa"
                paint={{
                    "fill-color": "#1877CF",
                    "fill-opacity": 0.2,
                }}
            />
            {/* Fill - only visible when the feature state has a value (set in the parent component) */}
            <Layer
                id="lsoa-fill"
                type="fill"
                source-layer="lsoa"
                beforeId="place_town"
                paint={{
                "fill-color": [
                    "case",
                    ["!=", ["feature-state", "value"], null],
                    ["interpolate", ["linear"], ["feature-state", "value"],
                        0, "#1877CF",
                        100, "#03CEA3",
                    ],
                    "transparent"
                    ],
                    
                }}
        />
        </Source>
        {/* Render the choropleth map */}
        <ChoroplethLayer areas={areas} variable={variable} />
        </Map>
        {/* Colour scale - only renders after areas passed in */}
        <ColourScale areas={areas} variable={variable} variableLabel={variableLabel} />
        {hoveredCode && cursorPos && (
            <div className="tooltip" style={{ left: cursorPos.x + 10, top: cursorPos.y + 10
            }}>
            {hoveredCode}
        </div>
    )}
    </>
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
            "line-color": "#03CEA3",  // imago teal
            "line-width": 2,
            "line-dasharray": [4, 4],
          }}
          />
        </Source>   
    )
}

