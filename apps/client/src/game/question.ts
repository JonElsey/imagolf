import type { Question } from "./types"

export const Questions: Question[] = [
    { 
        question: "Where is the LSOA most likely to be cloudy according to SPF?",
        file: "/data/areas.json",
        variable: "cloud_probability",
        statistic: "max",
        top_n: 1,
        story: "SPF is based on Sentinel-2; a satellite which takes images across the UK several times a day. These images are combined together and " +
        "processed to estimate cloudiness. While we are limited to the times when Sentinel-2 is overhead, we get enough images per day " + 
        "to get a reasonable estimate!\n\n" + 
        "As you can see from the map, the cloudiest parts of the UK tend to be in the North West, specifically Scotland and Northern Ireland; mostly " +
        "due to weather systems coming in from the East Atlantic, and the orography of these areas.",
        time_limit: 5
    },
    {
        question: "Where is the LSOA least likely to be cloudy according to SPF?", 
        file: "/data/areas.json",
        variable: "cloud_probability",
        statistic: "min",
        top_n: 1,
        story: "SPF doesn't rely on the images on their own; there is processing that determines whether a pixel is cloudy or not, and " +
        "processing to mitigate the effects of reflective surfaces in the images - these show up as clouds in the images, but aren't *actually* clouds!\n\n" +
        "This mostly affects urban areas like London, where there are a lot of buildings with white roofs. London is actually one of the least cloudy areas " +
        "in the UK!\n\n" +
        "Some areas get more acquisitions than others, so they have more samples => better estimate of the mean cloudiness. " +
         "We apply a quantile mapping correction to account for biases in acquisition counts across the UK, ensuring that " +
         "areas with fewer acquisitions get more representative values.\n\n",
        time_limit: 5

    },
    {
        question: "Where in the UK has the most Sentinel-2 acquisitions?",
        file: "/data/areas.json",
        variable: "num_acquisitions",
        statistic: "max",
        top_n: 2000,
        story: "The number of acquisitions is a measure of how many times the area has been imaged by satellites. " +
         "This is important because it affects the quality of the data we can use to estimate cloudiness. " +

         "As we can see from the map, the pattern is quite variable across the UK, with some small areas getting many more acquisitions! This is due to the " +
         "orbit of the satellite - some areas are imaged more frequently than others, and the satellite's orbit is not perfectly uniform across the UK. \n\n"+
         "You may notice that the acquisition pattern looks strange in some parts of the UK - this is due to the fact that we are aggregating down to LSOA level. " +
         "The pattern on this map looks closer to the actual acquisition pattern where we have more densely packed LSOAs, and stranger where we have larger ones. " +
         "This also explains why some LSOAs have a decimal number of acquisitions - since we are averaging the acquisition count per pixel across the LSOA!",
        time_limit: 5
        }
]