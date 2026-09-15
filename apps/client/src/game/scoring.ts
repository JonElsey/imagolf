
/* scoring is based on the haversine distance between the pin and the target */
export type Coords = {
    lat: number
    lon: number
}


export function haversineDistance(target_coords: Coords, pin_coords: Coords): number {

    // unit conversions
    const toRad = (x: number) => (x * Math.PI) / 180
    const R = 6371e3; // Radius of the Earth in meters
    const lat1_rads = toRad(pin_coords.lat);
    const lat2_rads = toRad(target_coords.lat);
    const lon1_rads = toRad(pin_coords.lon);
    const lon2_rads = toRad(target_coords.lon);

    const deltaLat = lat2_rads - lat1_rads;
    const deltaLon = lon2_rads - lon1_rads;

    const a = Math.sin(deltaLat/2) ** 2 + Math.cos(lat1_rads) * Math.cos(lat2_rads) * Math.sin(deltaLon/2) ** 2;
    const c = 2 * Math.asin(Math.sqrt(a))
    const distance = R * c; // Distance in metres
    return distance / 1000; // convert to km
}
/* scoring falls off exponentially, max score 1000, 100 km away gives a score of 500 */
export function calculateScore(distance: number): number { 
    const maxScore = 1000; 
    const maxBreakpoint = 50; // distance in kilometres where score starts to decay
    const halvingScore = 100 // distance in km such that score is halved
    const k = (halvingScore - maxBreakpoint) / Math.LN2; // decay constant
    // score is determined such that it doesnt penalise being within 100m of the target, then 
    // exponentially decays with distance after that, such that being 100 +  m away gives half the score. 
    const score = Math.round(maxScore * Math.exp(-Math.max(0, distance - maxBreakpoint) / k));
    return score;
}
