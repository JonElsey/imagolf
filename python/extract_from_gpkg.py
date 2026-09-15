import os 
import geopandas as gpd

data_path = "/Users/jonathanelsey/Projects/Imago/Data/SPF/SPF_2.0/gpkg/SPF_LSOA_level_2025.gpkg"

data = gpd.read_file(data_path)
# convert to WGS84 coordinate system
data = data.to_crs(epsg=4326)
# need to get a representative lat/long point for each datazone
data["centroid"] = data.geometry.representative_point()
# convert the centroid to a more usable format
data["centroid_lat"] = data["centroid"].y
data["centroid_lon"] = data["centroid"].x

# drop the geometry and centroid columns, we don't need them anymore
data = data.drop(columns=["geometry", "centroid"])
# rename cloud probability and valid_count columns
data = data.rename(columns={"cloudprob_corrected_mean": "cloud_probability", "valid_count_mean": "num_acquisitions"})
# make directories if they don't exist

dirname = "/Users/jonathanelsey/Projects/Imago/summit-game/apps/client/public/data"

os.makedirs(dirname, exist_ok=True)
data.to_json(f"{dirname}/areas.json", orient="records")