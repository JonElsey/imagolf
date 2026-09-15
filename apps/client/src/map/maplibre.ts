
import { setWorkerUrl } from "maplibre-gl"
/* have to import worker url from a specific location */ 
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url"
setWorkerUrl(workerUrl)