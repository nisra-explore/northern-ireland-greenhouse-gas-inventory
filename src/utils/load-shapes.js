export async function loadShapes() {
  

  const url = "public/map/LGD2014.geo.json";
  if (!url) throw new Error(`No shape URL for LGD shapes`);

  const res = await fetch(url, { cache: "force-cache" });
  if (!res.ok) throw new Error(`Failed to load ${url}`);
  const data = await res.json();

  // If you ever switch to .topo.json, this still works:
  const geojson = (data.type === "Topology" && window.topojson)
    ? topojson.feature(data, Object.values(data.objects)[0])
    : data;
  
  return geojson;
}
