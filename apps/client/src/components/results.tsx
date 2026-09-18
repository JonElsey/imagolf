import type { Result } from "../game/types"

function ResultsPanel({ result, onClose }: { result: Result | null; onClose: () => void }) {
    return ( 
        <div className="panel panel-results">
          <h3>Results</h3>
          {result && (
            <>
              <p>Target coordinates: {result.nearestTarget.centroid_lat.toFixed(3)}, {result.nearestTarget.centroid_lon.toFixed(3)}</p>
              <p>Target data zone code: {result.nearestTarget.data_zone_code}</p>
              <p>Cloud probability: {(result.nearestTarget.cloud_probability.toFixed(2))}</p>
              <p>Number of acquisitions: {result.nearestTarget.num_acquisitions}</p>
              <p>Distance from target: {(result.distance.toFixed(2))} km</p>
              <p>Score: {result.score}</p>
              <button className="close-button" onClick={onClose}>×</button>
            </>
          )}
        </div>
    )
}

export default ResultsPanel;