import { loadShapes } from "./load-shapes.js";

export let map;               // cache map between calls
let geojsonData;       // cache shapes between calls

export async function plotMap(data, stat, latest_year, crimeType) {

  document.getElementById("map-title").innerText =
    `Police recorded crime - ${crimeType} by Local Government District, ${latest_year}`;

  const lgds = Object.keys(data.data[stat][latest_year])
        .filter(lgd => lgd !== "Northern Ireland");

  // --- build values array based on selected crime type ---
  const values = lgds.map(lgd => 
      data.data[stat][latest_year][lgd][crimeType]
  );

  // --- ranges & normalized colours ---
  let range_min = Math.floor(Math.min(...values.filter(v => v != null)));
  let range_max = Math.ceil(Math.max(...values.filter(v => v != null)));

  updateLegend(range_min, range_max, "Crimes recorded");

  const range = range_max - range_min || 1;

  let colours = values.map(v => 
      v == null ? -1 : (v - range_min) / range
  );

  // --- load shapes once ---
  if (!geojsonData) geojsonData = await loadShapes();

  // --- prepare styled geojson (same logic as you already had) ---
  const features = geojsonData.features.map((f, idx) => {
      const codeProp = "LGDNAME";
      const code = String(f.properties[codeProp]);
      const geogIndex = lgds.indexOf(code);

      const rawValue = values[geogIndex];
      const label = code;

      const fillHex =
        rawValue == null
          ? "#eeeeee"
          : getColour(colours[geogIndex]);

      return {
        ...f,
        id: idx,
        properties: {
          ...f.properties,
          nisra_code: code,
          nisra_value: rawValue,
          nisra_label: label,
          nisra_year: latest_year,
          nisra_fill: fillHex,
          nisra_hasValue: rawValue !== null && rawValue !== undefined
        }
      };
  });

  const styledGeojson = { ...geojsonData, features };

  // =========================================================
  // If map already exists, just update the source and return
  // =========================================================


  function hasPreserveDrawingBuffer(m) {
  try {
    const c = m.getCanvas();
    const gl = c.getContext("webgl2") || c.getContext("webgl");
    return !!gl?.getContextAttributes()?.preserveDrawingBuffer;
  } catch {
    return false;
  }
}

renderTable(lgds, values);

// If we already have a map but it wasn't created with preserveDrawingBuffer,
// we MUST rebuild it (can't change after creation).
if (map && !hasPreserveDrawingBuffer(map)) {
  map.remove();
  map = null;
}

  
  if (map && map.getSource("shapes")) {
      map.getSource("shapes").setData(styledGeojson);
      return;
  }

  // =========================================================
  // Otherwise, create map once, add layers, events, etc.
  // =========================================================
const XL = 1200;
const initial_zoom = window.innerWidth < XL ? 6 : 7.5;

const centre = [-6.7, 54.7];

if (map) { map.remove(); map = null; }

map = new maplibregl.Map({
  container: 'map-container',
  style: 'public/map/style-omt.json',
  center: centre,
  zoom: initial_zoom,
  attributionControl: false,
  preserveDrawingBuffer: true,
  canvasContextAttributes: { preserveDrawingBuffer: true }
});




  map.addControl(
    new maplibregl.NavigationControl({
        showZoom: true,
        showCompass: false,
        visualizePitch: false
    }),
    'top-right'
  );

map.on('load', () => {
  // --- zoom + bounds locking ---
  map.setMinZoom(initial_zoom - 1);
  map.setMaxZoom(initial_zoom + 4);
  map.setRenderWorldCopies(false);

  // --- source + layers ---
  map.addSource('shapes', {
    type: 'geojson',
    data: styledGeojson,
    generateId: true
  });

  map.addLayer({
    id: 'shapes-fill',
    type: 'fill',
    source: 'shapes',
    paint: {
      'fill-color': [
        'case',
        ['boolean', ['get', 'nisra_hasValue'], false],
        ['get', 'nisra_fill'],
        '#eeeeee'
      ],
      'fill-opacity': [
        'case',
        ['boolean', ['feature-state', 'hover'], false],
        0.8,
        0.7
      ]
    }
  });

  map.addLayer({
    id: 'shapes-outline',
    type: 'line',
    source: 'shapes',
    paint: {
      'line-color': [
        'case',
        ['boolean', ['feature-state', 'hover'], false],
        '#222222',
        '#555555'
      ],
      'line-width': [
        'case',
        ['boolean', ['feature-state', 'hover'], false],
        2,
        1
      ],
      'line-opacity': 0.9
    }
  });

  // --- hover interactivity ---
  let hoveredId = null;
  const popup = new maplibregl.Popup({
    closeButton: false,
    closeOnClick: false,
    offset: [0, -6],
    className: 'nisra-popup'
  });

  map.on('mousemove', 'shapes-fill', (e) => {
    map.getCanvas().style.cursor = 'pointer';
    const f = e.features && e.features[0];
    if (!f) return;

    if (hoveredId !== null) {
      map.setFeatureState({ source: 'shapes', id: hoveredId }, { hover: false });
    }
    hoveredId = f.id;
    map.setFeatureState({ source: 'shapes', id: hoveredId }, { hover: true });

    const p = f.properties;
    const valueStr = (p.nisra_value == null)
      ? 'Not available'
      : Number(p.nisra_value).toLocaleString('en-GB');

    popup
      .setLngLat(e.lngLat)
      .setHTML(`<div><strong>${p.nisra_label}</strong> (${p.nisra_year}): <strong>${valueStr}</strong></div>`)
      .addTo(map);
  });

  map.on('mouseleave', 'shapes-fill', () => {
    map.getCanvas().style.cursor = '';
    if (hoveredId !== null) {
      map.setFeatureState({ source: 'shapes', id: hoveredId }, { hover: false });
      hoveredId = null;
    }
    popup.remove();
  });
});


}

export function getColour(normOrBin) {
    if (normOrBin == null || normOrBin < 0) return "#d3d3d3";
    const idx = Math.max(0, Math.min(4, Math.round(normOrBin * 4)));
    return palette[idx];
}

export const palette = ["#d6e4f6", "#8db2e0", "#3878c5", "#22589c", "#00205b"];


function updateLegend(range_min, range_max, unitLabel = "") {
  const legendEl = document.getElementById("map-legend");
  if (!legendEl) return;

  const minStr =
    (range_min == null || isNaN(range_min)) ? "n/a"
    : Number(range_min).toLocaleString("en-GB");

  const maxStr =
    (range_max == null || isNaN(range_max)) ? "n/a"
    : Number(range_max).toLocaleString("en-GB");

  legendEl.classList.add("map-legend");

  legendEl.innerHTML = `
    <div class="d-flex w-100">
      <div class="legend-min">${minStr}</div>
      <div class="legend-unit">${unitLabel}</div>
      <div class="legend-max">${maxStr}</div>
    </div>

    <div class="d-flex w-100">
      ${palette.map(c => `
        <div class="colour-block" style="background:${c}"></div>
      `).join("")}
    </div>
  `;

}


function renderTable(lgds, values) {
  const table = document.getElementById("map-data-table");
  if (!table) return;

  // Clear previous content (prevents duplicates + enables updates)
  table.innerHTML = "";

  const thead = document.createElement("thead");
  const trh = document.createElement("tr");

  const th1 = document.createElement("th");
  th1.innerText = "Local Government District";

  const th2 = document.createElement("th");
  th2.style.textAlign = "right";
  th2.innerText = "Crimes recorded";

  trh.appendChild(th1);
  trh.appendChild(th2);
  thead.appendChild(trh);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  for (let i = 0; i < lgds.length; i++) {
    const tr = document.createElement("tr");

    const td1 = document.createElement("td");
    td1.innerText = lgds[i];

    const td2 = document.createElement("td");
    td2.style.textAlign = "right";
    td2.innerText = (values[i] == null) ? "n/a" : Number(values[i]).toLocaleString("en-GB");

    tr.appendChild(td1);
    tr.appendChild(td2);
    tbody.appendChild(tr);
  }
  table.appendChild(tbody);
}