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
}

export const Questions: Question[] = [
    { 
        question: "Where is the LSOA most likely to be cloudy according to SPF?",
        file: "/data/areas.json",
        variable: "cloud_probability",
        statistic: "max",
        top_n: 1,
        story: "SPF is based on Sentinel-2; a satellite which takes images across the UK several times a day. These images are combined together and " +
        "processed to estimate cloudiness. While we are limited to the times when Sentinel-2 is overhead, we get enough images per day" + 
        " to get a reasonable estimate!"
    },
    {
        question: "Where is LSOA least likely to be cloudy according to SPF?", 
        file: "/data/areas.json",
        variable: "cloud_probability",
        statistic: "min",
        top_n: 1,
        story: "SPF doesn't rely on the images on their own; there is processing that determines whether a pixel is cloudy or not, and " +
        "processing to mitigate the effects of reflective surfaces in the images - these show up as clouds in the images, but aren't *actually* clouds!"
    },
    {
        question: "Where in the UK has the most satellite acquisitions?",
        file: "/data/areas.json",
        variable: "num_acquisitions",
        statistic: "max",
        top_n: 400,
        story: "The number of acquisitions is a measure of how many times the area has been imaged by satellites. " +
         "This is important because it affects the quality of the data we can use to estimate cloudiness. " +
         "Some areas get more acquisitions than others, so they have more samples => better estimate of the mean cloudiness. " +
         "We apply a quantile mapping correction to account for biases in acquisition counts across the UK, ensuring that " +
         "areas with fewer acquisitions get more representative values."
        }
]