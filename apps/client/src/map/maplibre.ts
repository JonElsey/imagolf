import { setWorkerUrl } from "maplibre-gl";
import { Protocol } from "pmtiles";
import { addProtocol } from "maplibre-gl";

/* have to import worker url from a specific location */ 
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url"
import { useEffect } from "react";
setWorkerUrl(workerUrl)

/* maplibre-gl PMtiles support */
const protocol = new Protocol();
addProtocol("pmtiles", protocol.tile);
    
