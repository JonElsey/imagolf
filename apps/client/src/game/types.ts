export type Area = {
  data_zone_code: string
  centroid_lat: number
  centroid_lon: number
  cloud_probability: number
  num_acquisitions: number
}

export type Result = {
  score: number
  distance: number
  nearestTarget: Area
}

/* Question type for the game - a string shown to the user that will give them info on what the 
target is. The question itself is a string, but we also need to store information on what variable,
and what the statistic of interest is (maximum/minimum/mean) so that we can check the answer against the target.
 For example, the question might be "Where is the area with the highest cloud probability?"
*/
export type Question = {
    question: string
    file: string
    variable: string
    statistic: "max" | "min" 
    top_n: number /* number of top areas to consider, in case there is huge geographic variability, we want to reward being close to the top areas, not just the single best area */
    story: string /* a short story about the question, to be displayed after the user has answered */
    time_limit: number | null /* time limit in seconds for the user to answer the question, or null if no time limit */
}

export type Coords = {
    lat: number
    lon: number
}
