import type { Result } from "../game/types"

function ResultsPanel({ result, onClose }: { result: Result | null; onClose: () => void }) {
    return ( 
        <div className="panel panel-results">
          <h3>Results</h3>
          {result && (
            <>
              <p style={{ fontSize: "24px", marginBottom: "16px" }}>Score: <b>{result.score}</b></p>
              <div style={{ fontSize: "13px" }}>
                <p style={{ margin: "4px 0" }}>Target coordinates: {result.nearestTarget.centroid_lat.toFixed(3)}, {result.nearestTarget.centroid_lon.toFixed(3)}</p>
                <p style={{ margin: "4px 0" }}>Target data zone code: {result.nearestTarget.data_zone_code}</p>
                <p style={{ margin: "4px 0" }}>Cloud probability: {(result.nearestTarget.cloud_probability.toFixed(2))}</p>
                <p style={{ margin: "4px 0" }}>Number of acquisitions: {result.nearestTarget.num_acquisitions}</p>
                <p style={{ margin: "4px 0" }}>Distance from target: {(result.distance.toFixed(2))} km</p>
              </div>
              <button className="close-button" onClick={onClose}>×</button>
            </>
          )}
        </div>
    )
}

export default ResultsPanel;