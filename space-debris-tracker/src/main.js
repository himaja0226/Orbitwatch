import * as Cesium from "cesium";
import * as satellite from "satellite.js";

import "cesium/Build/Cesium/Widgets/widgets.css";
import "./style.css";

const C = Cesium;

/* =========================================================
   BASIC CONFIGURATION
========================================================= */

const TLE_URLS = [
  "https://celestrak.org/NORAD/elements/gp.php?GROUP=STATIONS&FORMAT=TLE",
  "https://celestrak.org/NORAD/elements/gp.php?GROUP=STARLINK&FORMAT=TLE",
  "https://celestrak.org/NORAD/elements/gp.php?GROUP=GPS-OPS&FORMAT=TLE",
  "https://celestrak.org/NORAD/elements/gp.php?GROUP=NOAA&FORMAT=TLE"
];

const DEMO_TLES = [
  [
    "ISS (ZARYA)",
    "1 25544U 98067A   25240.50000000  .00012345  00000-0  23456-3 0  9990",
    "2 25544  51.6400  20.0000 0004500  90.0000  40.0000 15.50000000123456"
  ],
  [
    "STARLINK-1007",
    "1 44713U 19074A   25240.50000000  .00001000  00000-0  50000-4 0  9999",
    "2 44713  53.0500 120.0000 0001500  10.0000 350.0000 15.06000000300000"
  ],
  [
    "GPS BIIR-2 (PRN 13)",
    "1 24876U 97035A   25240.50000000  .00000020  00000-0  00000+0 0  9998",
    "2 24876  55.5000 220.0000 0100000  40.0000 320.0000  2.00560000100000"
  ],
  [
    "NOAA 19",
    "1 33591U 09005A   25240.50000000  .00000020  00000-0  00000+0  9995",
    "2 33591  99.1900  80.0000 0014000  60.0000 300.0000 14.12000000800000"
  ]
];

/* =========================================================
   SATELLITE ICON
========================================================= */

const SATELLITE_ICON =
  "data:image/svg+xml;charset=UTF-8," +
  encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg"
     width="96"
     height="96"
     viewBox="0 0 96 96">

  <g stroke-linecap="round"
     stroke-linejoin="round">

    <path
      d="M48 8v80M8 48h80"
      stroke="#0b6da8"
      stroke-width="3"
      opacity=".35"/>

    <rect
      x="36"
      y="34"
      width="24"
      height="28"
      rx="4"
      fill="#287fae"
      stroke="#d9f8ff"
      stroke-width="2"/>

    <rect
      x="14"
      y="38"
      width="21"
      height="20"
      fill="#154d70"
      stroke="#78ddff"
      stroke-width="2"/>

    <rect
      x="61"
      y="38"
      width="21"
      height="20"
      fill="#154d70"
      stroke="#78ddff"
      stroke-width="2"/>

    <path
      d="M43 27h10v7H43z"
      fill="#eafcff"
      stroke="#ffffff"/>

    <path
      d="M43 62h10v7H43z"
      fill="#eafcff"
      stroke="#ffffff"/>

    <circle
      cx="48"
      cy="48"
      r="5"
      fill="#ffffff"
      stroke="#69e8ff"
      stroke-width="2"/>
  </g>
</svg>`);

/* =========================================================
   SPACECRAFT SYMBOLS
========================================================= */

const SPACECRAFT_SATELLITE_ICON =
  "data:image/svg+xml;charset=UTF-8," +
  encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg"
     width="120"
     height="120"
     viewBox="0 0 120 120">

  <g stroke-linecap="round"
     stroke-linejoin="round">

    <rect
      x="45"
      y="38"
      width="30"
      height="44"
      rx="6"
      fill="#287fae"
      stroke="#ffffff"
      stroke-width="3"/>

    <rect
      x="10"
      y="45"
      width="32"
      height="30"
      fill="#123f62"
      stroke="#72e5ff"
      stroke-width="3"/>

    <rect
      x="78"
      y="45"
      width="32"
      height="30"
      fill="#123f62"
      stroke="#72e5ff"
      stroke-width="3"/>

    <circle
      cx="60"
      cy="60"
      r="8"
      fill="#ffffff"
      stroke="#72e5ff"
      stroke-width="3"/>

    <path
      d="M60 20v18M60 82v18"
      stroke="#ffffff"
      stroke-width="3"/>

    <circle
      cx="60"
      cy="13"
      r="5"
      fill="#9ee493"
      stroke="#ffffff"
      stroke-width="2"/>
  </g>
</svg>`);

const SPACECRAFT_ROCKET_ICON =
  "data:image/svg+xml;charset=UTF-8," +
  encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg"
     width="120"
     height="120"
     viewBox="0 0 120 120">

  <g stroke-linecap="round"
     stroke-linejoin="round">

    <path
      d="M60 8
         C47 20 39 38 39 61
         L39 78
         L60 98
         L81 78
         L81 61
         C81 38 73 20 60 8Z"
      fill="#e9f7ff"
      stroke="#ffffff"
      stroke-width="3"/>

    <circle
      cx="60"
      cy="45"
      r="9"
      fill="#287fae"
      stroke="#72e5ff"
      stroke-width="3"/>

    <path
      d="M39 62
         L20 76
         L38 81"
      fill="#287fae"
      stroke="#ffffff"
      stroke-width="3"/>

    <path
      d="M81 62
         L100 76
         L82 81"
      fill="#287fae"
      stroke="#ffffff"
      stroke-width="3"/>

    <path
      d="M48 84
         L53 108
         L60 96
         L67 108
         L72 84"
      fill="#ff9f43"
      stroke="#ffd36b"
      stroke-width="3"/>

  </g>
</svg>`);

/* =========================================================
   SPACECRAFT MODEL
========================================================= */

/*
   Kept in the project configuration.
   The spacecraft are displayed using clear symbols
   so they remain visible in the compressed solar view.
*/

const SPACECRAFT_MODEL_URL =
  "/models/generic-satellite.glb";

/* =========================================================
   SOLAR SYSTEM DATA
========================================================= */

const solarObjects = [
  {
    name: "Mercury",
    au: 0.39,
    period: 87.97,
    radius: 2.44e6,
    color: "#9d9d9d",
    phase: 0.2
  },
  {
    name: "Venus",
    au: 0.72,
    period: 224.7,
    radius: 6.05e6,
    color: "#d8a05a",
    phase: 1.1
  },
  {
    name: "Earth",
    au: 1.0,
    period: 365.25,
    radius: 6.37e6,
    color: "#2874c6",
    phase: 2.0
  },
  {
    name: "Moon",
    au: 1.025,
    period: 27.32,
    radius: 1.74e6,
    color: "#bdbdbd",
    phase: 2.35
  },
  {
    name: "Mars",
    au: 1.52,
    period: 686.98,
    radius: 3.39e6,
    color: "#b7533f",
    phase: 2.8
  },
  {
    name: "Jupiter",
    au: 5.2,
    period: 4332.6,
    radius: 6.99e7,
    color: "#c99c70",
    phase: 3.7
  },
  {
    name: "Saturn",
    au: 9.58,
    period: 10759,
    radius: 5.82e7,
    color: "#cdb47f",
    phase: 4.4,
    rings: true
  },
  {
    name: "Uranus",
    au: 19.2,
    period: 30687,
    radius: 2.54e7,
    color: "#70c6d2",
    phase: 5.2
  },
  {
    name: "Neptune",
    au: 30.05,
    period: 60190,
    radius: 2.46e7,
    color: "#4a72ce",
    phase: 5.8
  }
];

const spacecraft = [
  {
    name: "Voyager 1",
    distanceAu: 165,
    phase: 0.35,
    speed: 0.00018,
    color: "#72e5ff",
    icon: "rocket"
  },
  {
    name: "Voyager 2",
    distanceAu: 139,
    phase: 2.6,
    speed: 0.00016,
    color: "#72e5ff",
    icon: "rocket"
  },
  {
    name: "New Horizons",
    distanceAu: 62,
    phase: 4.0,
    speed: 0.00026,
    color: "#f3b35f",
    icon: "rocket"
  },
  {
    name: "Juno",
    distanceAu: 5.1,
    phase: 1.7,
    speed: 0.0012,
    color: "#9ee493",
    icon: "satellite"
  },
  {
    name: "Mars Reconnaissance Orbiter",
    distanceAu: 1.52,
    phase: 2.9,
    speed: 0.0025,
    color: "#ff7b72",
    icon: "satellite"
  },
  {
    name: "BepiColombo",
    distanceAu: 0.55,
    phase: 5.1,
    speed: 0.0032,
    color: "#c9a7ff",
    icon: "satellite"
  }
];

/* =========================================================
   CESIUM VIEWER
========================================================= */

const viewer = new C.Viewer("cesiumContainer", {
  animation: false,
  timeline: false,
  baseLayerPicker: false,
  geocoder: false,
  homeButton: false,
  sceneModePicker: false,
  navigationHelpButton: false,
  fullscreenButton: false,
  infoBox: false,
  selectionIndicator: false,
  shouldAnimate: true,

  baseLayer: new C.ImageryLayer(
    new C.OpenStreetMapImageryProvider({
      url: "https://tile.openstreetmap.org/"
    })
  )
});

viewer.scene.backgroundColor =
  C.Color.fromCssColorString("#020816");

viewer.scene.globe.enableLighting = true;
viewer.scene.globe.showGroundAtmosphere = true;

viewer.scene.fog.enabled = true;
viewer.scene.fog.density = 0.0000015;

viewer.clock.multiplier = 20;
viewer.clock.shouldAnimate = true;

/* =========================================================
   APPLICATION STATE
========================================================= */

let mode = "earth";

let satellites = [];
let satEntities = [];
let orbitEntities = [];

let solarEntities = [];

let selectedSatellite = null;
let selectedSolarName = null;

let alertPairs = [];

/* =========================================================
   UI REFERENCES
========================================================= */

const ui = {
  modeEarth: document.getElementById("modeEarth"),
  modeSolar: document.getElementById("modeSolar"),

  search: document.getElementById("search"),
  searchResults: document.getElementById("searchResults"),

  quickList: document.getElementById("quickList"),

  objectCount: document.getElementById("objectCount"),
  activeCount: document.getElementById("activeCount"),
  orbitCount: document.getElementById("orbitCount"),

  source: document.getElementById("source"),

  alerts: document.getElementById("alerts"),
  alertCount: document.getElementById("alertCount"),

  selected: document.getElementById("selected"),

  assistantMessages:
    document.getElementById("assistantMessages"),

  assistantInput:
    document.getElementById("assistantInput"),

  assistantSend:
    document.getElementById("assistantSend"),

  systemStatus:
    document.getElementById("systemStatus"),

  dataClock:
    document.getElementById("dataClock"),

  sceneTitle:
    document.getElementById("sceneTitle"),

  sceneSubtitle:
    document.getElementById("sceneSubtitle"),

  bottomStats:
    document.getElementById("bottomStats"),

  earthControls:
    document.getElementById("earthControls"),

  solarControls:
    document.getElementById("solarControls")
};

/* =========================================================
   HELPERS
========================================================= */

function htmlEscape(value) {
  return String(value).replace(
    /[&<>"']/g,
    char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    })[char]
  );
}

/* =========================================================
   CAMERA CONTROLS
========================================================= */

window.__zoom = factor => {
  const cartographic =
    viewer.camera.positionCartographic;

  const height = Math.max(
    100000,
    cartographic.height || 1000000
  );

  if (factor < 1) {
    viewer.camera.zoomIn(
      height * (1 - factor)
    );
  } else {
    viewer.camera.zoomOut(
      height * (factor - 1)
    );
  }
};

window.__resetView = () => {
  setMode(mode);
};

/* =========================================================
   MODE SWITCHING
========================================================= */

function setMode(nextMode) {
  mode = nextMode;

  ui.modeEarth.classList.toggle(
    "active",
    mode === "earth"
  );

  ui.modeSolar.classList.toggle(
    "active",
    mode === "solar"
  );

  ui.earthControls.hidden =
    mode !== "earth";

  ui.solarControls.hidden =
    mode !== "solar";

  if (mode === "earth") {
    showEarthMode();
  } else {
    showSolarMode();
  }
}

function showEarthMode() {
  ui.sceneTitle.textContent =
    "EARTH TRACKING";

  ui.sceneSubtitle.textContent =
    "Live Earth-orbiting objects • SGP4 propagation • orbital paths";

  viewer.scene.globe.show = true;

  solarEntities.forEach(entity => {
    entity.show = false;
  });

  satEntities.forEach(entity => {
    entity.show = true;
  });

  orbitEntities.forEach(entity => {
    entity.show = true;
  });

  viewer.camera.flyTo({
    destination:
      C.Cartesian3.fromDegrees(
        20,
        15,
        24000000
      ),
    duration: 1.4
  });

  renderBottomStats();
}

function showSolarMode() {
  ui.sceneTitle.textContent =
    "SOLAR SYSTEM";

  ui.sceneSubtitle.textContent =
    "Planets • moons • spacecraft • compressed visualization";

  viewer.scene.globe.show = false;

  satEntities.forEach(entity => {
    entity.show = false;
  });

  orbitEntities.forEach(entity => {
    entity.show = false;
  });

  solarEntities.forEach(entity => {
    entity.show = true;
  });

  viewer.camera.flyToBoundingSphere(
    new C.BoundingSphere(
      C.Cartesian3.ZERO,
      1.7e10
    ),
    {
      duration: 1.5,

      offset:
        new C.HeadingPitchRange(
          0,
          C.Math.toRadians(-42),
          3.9e10
        )
    }
  );

  renderSolarBottom();
}

/* =========================================================
   TLE PARSING
========================================================= */

function parseTLEText(text) {
  const lines = text
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean);

  const result = [];

  for (
    let i = 0;
    i < lines.length;
    i++
  ) {
    if (
      lines[i].startsWith("1 ") &&
      lines[i + 1]?.startsWith("2 ")
    ) {
      result.push({
        name:
          "NORAD " +
          lines[i].slice(2, 7).trim(),

        line1: lines[i],
        line2: lines[i + 1]
      });

      i++;
    } else if (
      lines[i + 1]?.startsWith("1 ") &&
      lines[i + 2]?.startsWith("2 ")
    ) {
      result.push({
        name: lines[i],
        line1: lines[i + 1],
        line2: lines[i + 2]
      });

      i += 2;
    }
  }

  return result;
}

/* =========================================================
   NETWORK
========================================================= */

async function fetchWithTimeout(url) {
  const controller =
    new AbortController();

  const timer = setTimeout(
    () => controller.abort(),
    12000
  );

  try {
    const response =
      await fetch(url, {
        signal: controller.signal,
        cache: "no-store"
      });

    if (!response.ok) {
      throw new Error(
        `HTTP ${response.status}`
      );
    }

    return await response.text();
  } finally {
    clearTimeout(timer);
  }
}

/* =========================================================
   LOAD SATELLITES
========================================================= */

async function loadSatellites() {
  ui.systemStatus.textContent =
    "LOADING";

  ui.systemStatus.classList.add(
    "loading"
  );

  const all = new Map();

  await Promise.allSettled(
    TLE_URLS.map(
      async url => {
        const text =
          await fetchWithTimeout(url);

        const records =
          parseTLEText(text);

        for (const record of records) {
          const key =
            record.line1.slice(2, 7);

          if (!all.has(key)) {
            all.set(key, record);
          }
        }
      }
    )
  );

  let records =
    [...all.values()];

  if (records.length === 0) {
    records =
      DEMO_TLES.map(
        ([name, line1, line2]) => ({
          name,
          line1,
          line2
        })
      );

    ui.source.textContent =
      "Demo TLE fallback";
  } else {
    ui.source.textContent =
      "CelesTrak";
  }

  records =
    records.slice(0, 280);

  satellites =
    records
      .map(record => {
        try {
          return {
            ...record,

            satrec:
              satellite.twoline2satrec(
                record.line1,
                record.line2
              )
          };
        } catch {
          return null;
        }
      })
      .filter(Boolean);

  buildEarthScene();

  ui.systemStatus.textContent =
    "ONLINE";

  ui.systemStatus.classList.remove(
    "loading"
  );

  ui.objectCount.textContent =
    satellites.length.toLocaleString();

  ui.activeCount.textContent =
    satellites.length.toLocaleString();

  ui.orbitCount.textContent =
    orbitEntities.length.toLocaleString();

  renderQuickList();

  updateAlerts();

  renderBottomStats();
}

/* =========================================================
   PROPAGATION
========================================================= */

function propagate(record, date) {
  try {
    const result =
      satellite.propagate(
        record.satrec,
        date
      );

    if (
      !result?.position ||
      !Number.isFinite(result.position.x) ||
      !Number.isFinite(result.position.y) ||
      !Number.isFinite(result.position.z)
    ) {
      return null;
    }

    const gmst =
      satellite.gstime(date);

    const geodetic =
      satellite.eciToGeodetic(
        result.position,
        gmst
      );

    const heightMeters =
      geodetic.height * 1000;

    if (
      !Number.isFinite(heightMeters) ||
      !Number.isFinite(geodetic.latitude) ||
      !Number.isFinite(geodetic.longitude)
    ) {
      return null;
    }

    const position =
      C.Cartesian3.fromRadians(
        geodetic.longitude,
        geodetic.latitude,
        heightMeters
      );

    return {
      eci: result.position,

      velocity:
        result.velocity,

      latitude:
        satellite.degreesLat(
          geodetic.latitude
        ),

      longitude:
        satellite.degreesLong(
          geodetic.longitude
        ),

      height:
        heightMeters,

      cartesian:
        position
    };
  } catch {
    return null;
  }
}

/* =========================================================
   EARTH ORBIT PATH
========================================================= */

function orbitPoints(
  record,
  centerDate,
  minutes = 55
) {
  const points = [];

  for (
    let minute = -minutes;
    minute <= minutes;
    minute += 4
  ) {
    const date =
      new Date(
        centerDate.getTime() +
        minute * 60000
      );

    const position =
      propagate(
        record,
        date
      );

    if (position) {
      points.push(
        position.cartesian
      );
    }
  }

  return points;
}

/* =========================================================
   SATELLITE ENTITY
========================================================= */

function makeSatelliteEntity(
  record,
  index
) {
  return viewer.entities.add({
    name:
      record.name,

    position:
      new C.CallbackProperty(
        time => {
          const date =
            C.JulianDate.toDate(
              time
            );

          const position =
            propagate(
              record,
              date
            );

          return (
            position?.cartesian ||
            C.Cartesian3.ZERO
          );
        },
        false
      ),

    billboard: {
      image:
        SATELLITE_ICON,

      width: 30,
      height: 30,

      verticalOrigin:
        C.VerticalOrigin.CENTER,

      horizontalOrigin:
        C.HorizontalOrigin.CENTER,

      disableDepthTestDistance:
        Number.POSITIVE_INFINITY,

      distanceDisplayCondition:
        new C.DistanceDisplayCondition(
          0,
          50000000
        ),

      show: true
    },

    label: {
      text:
        record.name,

      font:
        "12px sans-serif",

      fillColor:
        C.Color.WHITE,

      showBackground:
        true,

      backgroundColor:
        C.Color.fromCssColorString(
          "#061529"
        ).withAlpha(0.88),

      pixelOffset:
        new C.Cartesian2(
          14,
          -12
        ),

      scale:
        0.85,

      distanceDisplayCondition:
        new C.DistanceDisplayCondition(
          0,
          12000000
        ),

      disableDepthTestDistance:
        Number.POSITIVE_INFINITY,

      show:
        index < 12
    },

    properties: {
      objectType:
        "earth-satellite",

      line1:
        record.line1,

      line2:
        record.line2
    }
  });
}

/* =========================================================
   ORBIT ENTITY
========================================================= */

function makeOrbitEntity(record) {
  const points =
    orbitPoints(
      record,
      new Date(),
      55
    );

  if (points.length < 2) {
    return null;
  }

  return viewer.entities.add({
    name:
      `${record.name} orbit`,

    polyline: {
      positions:
        points,

      width: 1.2,

      material:
        C.Color.fromCssColorString(
          "#1bc8ff"
        ).withAlpha(0.38),

      arcType:
        C.ArcType.NONE,

      clampToGround:
        false
    },

    properties: {
      objectType:
        "orbit-path"
    }
  });
}

/* =========================================================
   BUILD EARTH
========================================================= */

function buildEarthScene() {
  satEntities.forEach(
    entity =>
      viewer.entities.remove(
        entity
      )
  );

  orbitEntities.forEach(
    entity =>
      viewer.entities.remove(
        entity
      )
  );

  satEntities = [];
  orbitEntities = [];

  satellites.forEach(
    (record, index) => {
      const entity =
        makeSatelliteEntity(
          record,
          index
        );

      satEntities.push(
        entity
      );

      if (index < 90) {
        const orbit =
          makeOrbitEntity(
            record
          );

        if (orbit) {
          orbitEntities.push(
            orbit
          );
        }
      }
    }
  );

  ui.orbitCount.textContent =
    orbitEntities.length.toLocaleString();
}

/* =========================================================
   VISIBILITY
========================================================= */

function updateSatelliteVisibility() {
  const query =
    ui.search.value
      .trim()
      .toLowerCase();

  satEntities.forEach(
    (entity, index) => {
      const name =
        entity.name
          ?.toLowerCase() || "";

      const visible =
        !query ||
        name.includes(query);

      entity.show =
        visible;

      if (entity.billboard) {
        entity.billboard.show =
          visible;
      }

      if (entity.label) {
        entity.label.show =
          visible &&
          (
            index < 25 ||
            name.includes(query)
          );
      }
    }
  );

  orbitEntities.forEach(
    orbit => {
      orbit.show = true;
    }
  );
}

/* =========================================================
   QUICK LIST
========================================================= */

function renderQuickList() {
  const groups = [
    "ISS (ZARYA)",
    "STARLINK",
    "GPS",
    "NOAA"
  ];

  ui.quickList.innerHTML =
    groups
      .map(
        group => `
          <button
            class="quick-btn"
            data-key="${group}">

            <span>🛰</span>

            ${group}

            <b>›</b>

          </button>
        `
      )
      .join("");

  ui.quickList
    .querySelectorAll(
      ".quick-btn"
    )
    .forEach(
      button => {
        button.addEventListener(
          "click",
          () => {
            const key =
              button.dataset.key
                .toLowerCase();

            const record =
              satellites.find(
                sat =>
                  sat.name
                    .toLowerCase()
                    .includes(key)
              );

            if (record) {
              ui.search.value =
                record.name;

              ui.searchResults.hidden =
                true;

              updateSatelliteVisibility();

              selectSatellite(
                record
              );
            } else {
              ui.search.value =
                button.dataset.key;

              searchAll(
                button.dataset.key
              );
            }
          }
        );
      }
    );
}

/* =========================================================
   SELECT EARTH SATELLITE
========================================================= */

function selectSatellite(record) {
  selectedSatellite =
    record;

  const position =
    propagate(
      record,
      new Date()
    );

  const altitude =
    position
      ? `${Math.round(
          position.height / 1000
        ).toLocaleString()} km`
      : "—";

  let speed = "—";

  if (position?.velocity) {
    const v =
      Math.sqrt(
        position.velocity.x ** 2 +
        position.velocity.y ** 2 +
        position.velocity.z ** 2
      );

    speed =
      `${v.toFixed(2)} km/s`;
  }

  ui.selected.innerHTML = `
    <div class="selected-head">

      <div>
        <div class="eyebrow">
          SELECTED OBJECT
        </div>

        <h3>
          ${htmlEscape(
            record.name
          )}
        </h3>
      </div>

      <span class="status-pill">
        ● ACTIVE
      </span>

    </div>

    <div class="selected-grid">

      <div class="sat-preview">

        <img
          src="${SATELLITE_ICON}"
          alt="Satellite"
        />

      </div>

      <div>

        <p>
          <span>Altitude</span>
          ${altitude}
        </p>

        <p>
          <span>Velocity</span>
          ${speed}
        </p>

        <p>
          <span>Source</span>
          ${htmlEscape(
            ui.source.textContent
          )}
        </p>

        <p>
          <span>Propagator</span>
          SGP4
        </p>

      </div>

    </div>

    <div class="selected-actions">

      <button
        class="outline-btn"
        id="viewObjectBtn">
        View Object
      </button>

      <button
        class="outline-btn"
        id="viewOrbitBtn">
        View Orbit
      </button>

    </div>
  `;

  document
    .getElementById(
      "viewObjectBtn"
    )
    ?.addEventListener(
      "click",
      () => {
        const entity =
          satEntities.find(
            e =>
              e.name ===
              record.name
          );

        if (!entity) {
          return;
        }

        viewer.flyTo(
          entity,
          {
            duration: 1.2,

            offset:
              new C.HeadingPitchRange(
                0,
                C.Math.toRadians(-25),
                1800000
              )
          }
        );
      }
    );

  document
    .getElementById(
      "viewOrbitBtn"
    )
    ?.addEventListener(
      "click",
      () => {
        const orbit =
          orbitEntities.find(
            e =>
              e.name ===
              `${record.name} orbit`
          );

        if (orbit) {
          orbit.polyline.width =
            4;

          orbit.polyline.material =
            C.Color.WHITE.withAlpha(
              0.95
            );

          setTimeout(
            () => {
              if (orbit.polyline) {
                orbit.polyline.width =
                  1.2;

                orbit.polyline.material =
                  C.Color
                    .fromCssColorString(
                      "#1bc8ff"
                    )
                    .withAlpha(
                      0.38
                    );
              }
            },
            3000
          );
        }

        const entity =
          satEntities.find(
            e =>
              e.name ===
              record.name
          );

        if (entity) {
          viewer.flyTo(
            entity,
            {
              duration: 1.2,

              offset:
                new C.HeadingPitchRange(
                  0,
                  C.Math.toRadians(-25),
                  2500000
                )
            }
          );
        }
      }
    );
}

/* =========================================================
   SOLAR POSITION
========================================================= */

const SOLAR_DISTANCE_SCALE =
  2.0e9;

function solarRadius(au) {
  return (
    Math.sqrt(au) *
    SOLAR_DISTANCE_SCALE
  );
}

function solarPosition(
  object,
  date
) {
  const days =
    date.getTime() /
    86400000;

  const angle =
    object.phase +
    days *
      (
        2 *
        Math.PI /
        object.period
      );

  const radius =
    solarRadius(
      object.au
    );

  return new C.Cartesian3(
    Math.cos(angle) *
      radius,

    Math.sin(angle) *
      radius *
      0.92,

    Math.sin(
      angle * 0.7
    ) *
      radius *
      0.08
  );
}

/* =========================================================
   SPACECRAFT POSITION
========================================================= */

function spacecraftPosition(
  object,
  date
) {
  const days =
    date.getTime() /
    86400000;

  const angle =
    object.phase +
    days *
      object.speed;

  let radius;

  if (
    object.distanceAu <= 10
  ) {
    radius =
      solarRadius(
        object.distanceAu
      );
  } else {
    radius =
      object.distanceAu *
      2.0e9 *
      0.28;
  }

  return new C.Cartesian3(
    Math.cos(angle) *
      radius,

    Math.sin(angle) *
      radius *
      0.70,

    Math.sin(
      angle * 0.35
    ) *
      radius *
      0.25
  );
}

/* =========================================================
   PLANET VISUAL SIZE
========================================================= */

function visualPlanetRadius(name) {
  switch (name) {
    case "Mercury":
      return 2.2e7;

    case "Venus":
      return 3.0e7;

    case "Earth":
      return 3.2e7;

    case "Moon":
      return 1.7e7;

    case "Mars":
      return 2.4e7;

    case "Jupiter":
      return 6.5e7;

    case "Saturn":
      return 5.8e7;

    case "Uranus":
      return 4.0e7;

    case "Neptune":
      return 4.0e7;

    default:
      return 2.5e7;
  }
}

/* =========================================================
   ADD SOLAR BODY
========================================================= */

function addSolarBody(object) {
  const radius =
    visualPlanetRadius(
      object.name
    );

  const entity =
    viewer.entities.add({
      name:
        object.name,

      position:
        new C.CallbackProperty(
          time =>
            solarPosition(
              object,
              C.JulianDate.toDate(
                time
              )
            ),
          false
        ),

      ellipsoid: {
        radii:
          new C.Cartesian3(
            radius,
            radius,
            radius
          ),

        material:
          C.Color.fromCssColorString(
            object.color
          ),

        outline: true,

        outlineColor:
          C.Color.WHITE.withAlpha(
            0.45
          ),

        subdivisions:
          12,

        stackPartitions:
          8,

        slicePartitions:
          8
      },

      label: {
        text:
          object.name,

        font:
          "13px sans-serif",

        fillColor:
          C.Color.WHITE,

        showBackground:
          true,

        backgroundColor:
          C.Color.fromCssColorString(
            "#061529"
          ).withAlpha(0.85),

        pixelOffset:
          new C.Cartesian2(
            0,
            -(radius / 900000)
          ),

        disableDepthTestDistance:
          Number.POSITIVE_INFINITY
      },

      properties: {
        objectType:
          "planet"
      }
    });

  solarEntities.push(
    entity
  );

  if (object.rings) {
    const ring =
      viewer.entities.add({
        name:
          "Saturn rings",

        position:
          new C.CallbackProperty(
            time =>
              solarPosition(
                object,
                C.JulianDate.toDate(
                  time
                )
              ),
            false
          ),

        ellipse: {
          semiMajorAxis:
            radius * 1.8,

          semiMinorAxis:
            radius * 0.58,

          height:
            radius * 0.04,

          material:
            C.Color.fromCssColorString(
              "#cbb98d"
            ).withAlpha(0.48),

          outline: true,

          outlineColor:
            C.Color.fromCssColorString(
              "#f5dfad"
            ).withAlpha(0.6)
        }
      });

    solarEntities.push(
      ring
    );
  }

  const orbitPointsSolar =
    Array.from(
      {
        length: 73
      },
      (_, index) => {
        const angle =
          object.phase +
          (index / 72) *
            Math.PI *
            2;

        const orbitRadius =
          solarRadius(
            object.au
          );

        return new C.Cartesian3(
          Math.cos(angle) *
            orbitRadius,

          Math.sin(angle) *
            orbitRadius *
            0.92,

          0
        );
      }
    );

  const orbit =
    viewer.entities.add({
      name:
        `${object.name} solar orbit`,

      polyline: {
        positions:
          orbitPointsSolar,

        width: 1.1,

        material:
          C.Color.fromCssColorString(
            "#4fcfff"
          ).withAlpha(0.30),

        arcType:
          C.ArcType.NONE
      }
    });

  solarEntities.push(
    orbit
  );
}

/* =========================================================
   ADD SPACECRAFT
========================================================= */

function addSpacecraft(object) {
  const icon =
    object.icon === "rocket"
      ? SPACECRAFT_ROCKET_ICON
      : SPACECRAFT_SATELLITE_ICON;

  const entity =
    viewer.entities.add({
      name:
        object.name,

      position:
        new C.CallbackProperty(
          time =>
            spacecraftPosition(
              object,
              C.JulianDate.toDate(
                time
              )
            ),
          false
        ),

      /*
         Use a large billboard symbol instead
         of a round point or text-only marker.
      */

      billboard: {
        image:
          icon,

        width: 54,
        height: 54,

        verticalOrigin:
          C.VerticalOrigin.CENTER,

        horizontalOrigin:
          C.HorizontalOrigin.CENTER,

        disableDepthTestDistance:
          Number.POSITIVE_INFINITY,

        scaleByDistance:
          new C.NearFarScalar(
            1.0e8,
            1.25,
            4.0e10,
            0.75
          )
      },

      label: {
        text:
          object.name,

        font:
          "12px sans-serif",

        fillColor:
          C.Color.fromCssColorString(
            object.color
          ),

        showBackground:
          true,

        backgroundColor:
          C.Color.fromCssColorString(
            "#061529"
          ).withAlpha(0.88),

        pixelOffset:
          new C.Cartesian2(
            30,
            -18
          ),

        disableDepthTestDistance:
          Number.POSITIVE_INFINITY
      },

      properties: {
        objectType:
          "spacecraft"
      }
    });

  solarEntities.push(
    entity
  );

  /* =====================================================
     SPACECRAFT TRAJECTORY
  ===================================================== */

  const trajectoryPoints =
    Array.from(
      {
        length: 73
      },
      (_, index) => {
        const angle =
          object.phase +
          (index / 72) *
            Math.PI *
            0.75;

        let radius;

        if (
          object.distanceAu <= 10
        ) {
          radius =
            solarRadius(
              object.distanceAu
            );
        } else {
          radius =
            object.distanceAu *
            2.0e9 *
            0.28;
        }

        return new C.Cartesian3(
          Math.cos(angle) *
            radius,

          Math.sin(angle) *
            radius *
            0.70,

          Math.sin(
            angle * 0.35
          ) *
            radius *
            0.25
        );
      }
    );

  const trajectory =
    viewer.entities.add({
      name:
        `${object.name} trajectory`,

      polyline: {
        positions:
          trajectoryPoints,

        width: 1.5,

        material:
          C.Color.fromCssColorString(
            object.color
          ).withAlpha(0.55),

        arcType:
          C.ArcType.NONE
      }
    });

  solarEntities.push(
    trajectory
  );
}

/* =========================================================
   BUILD SOLAR SYSTEM
========================================================= */

function buildSolarSystem() {
  solarEntities.forEach(
    entity =>
      viewer.entities.remove(
        entity
      )
  );

  solarEntities = [];

  const sun =
    viewer.entities.add({
      name:
        "Sun",

      position:
        C.Cartesian3.ZERO,

      ellipsoid: {
        radii:
          new C.Cartesian3(
            8.0e7,
            8.0e7,
            8.0e7
          ),

        material:
          C.Color.fromCssColorString(
            "#ffb52e"
          ),

        outline: true,

        outlineColor:
          C.Color.fromCssColorString(
            "#ffd978"
          ),

        subdivisions:
          12,

        stackPartitions:
          8,

        slicePartitions:
          8
      },

      label: {
        text:
          "Sun",

        font:
          "14px sans-serif",

        fillColor:
          C.Color.fromCssColorString(
            "#ffd36b"
          ),

        pixelOffset:
          new C.Cartesian2(
            0,
            -100
          ),

        disableDepthTestDistance:
          Number.POSITIVE_INFINITY
      },

      properties: {
        objectType:
          "planet"
      }
    });

  solarEntities.push(
    sun
  );

  solarObjects.forEach(
    addSolarBody
  );

  spacecraft.forEach(
    addSpacecraft
  );
}

/* =========================================================
   SELECT SOLAR OBJECT
========================================================= */

function selectSolarObject(name) {
  selectedSolarName =
    name;

  const entity =
    solarEntities.find(
      e =>
        e.name ===
        name
    );

  if (!entity) {
    return;
  }

  let icon = "●";

  if (name === "Sun") {
    icon = "☀";
  } else if (name === "Earth") {
    icon = "🌍";
  } else if (name === "Moon") {
    icon = "🌕";
  } else {
    const spacecraftItem =
      spacecraft.find(
        item =>
          item.name ===
          name
      );

    if (spacecraftItem) {
      icon =
        spacecraftItem.icon ===
        "rocket"
          ? "🚀"
          : "🛰";
    }
  }

  ui.selected.innerHTML = `
    <div class="selected-head">

      <div>
        <div class="eyebrow">
          SELECTED OBJECT
        </div>

        <h3>
          ${htmlEscape(name)}
        </h3>
      </div>

      <span class="status-pill">
        ● TRACKED
      </span>

    </div>

    <div class="selected-grid solar-selected-grid">

      <div class="sat-preview solar-preview">
        ${icon}
      </div>

      <div>

        <p>
          <span>Mode</span>
          Solar System
        </p>

        <p>
          <span>Status</span>
          Tracked
        </p>

        <p>
          <span>Scale</span>
          Compressed
        </p>

        <p>
          <span>Position</span>
          Live simulation
        </p>

      </div>

    </div>

    <div class="selected-actions">

      <button
        class="outline-btn"
        id="viewSolarObjectBtn">
        View Object
      </button>

      <button
        class="outline-btn"
        id="viewSolarOrbitBtn">
        View Orbit
      </button>

    </div>
  `;

  document
    .getElementById(
      "viewSolarObjectBtn"
    )
    ?.addEventListener(
      "click",
      () => {
        const current =
          solarEntities.find(
            e =>
              e.name ===
              name
          );

        if (!current) {
          return;
        }

        viewer.flyTo(
          current,
          {
            duration: 1.1,

            offset:
              new C.HeadingPitchRange(
                0,
                C.Math.toRadians(-25),
                name === "Sun"
                  ? 7e8
                  : 2.5e8
              )
          }
        );
      }
    );

  document
    .getElementById(
      "viewSolarOrbitBtn"
    )
    ?.addEventListener(
      "click",
      () => {
        const orbit =
          solarEntities.find(
            e =>
              e.name ===
                `${name} solar orbit` ||
              e.name ===
                `${name} trajectory`
          );

        if (orbit?.polyline) {
          orbit.polyline.width =
            4;

          orbit.polyline.material =
            C.Color.WHITE.withAlpha(
              0.95
            );

          setTimeout(
            () => {
              if (orbit.polyline) {
                orbit.polyline.width =
                  1.5;
              }
            },
            3000
          );
        }

        const current =
          solarEntities.find(
            e =>
              e.name ===
              name
          );

        if (current) {
          viewer.flyTo(
            current,
            {
              duration: 1.1,

              offset:
                new C.HeadingPitchRange(
                  0,
                  C.Math.toRadians(-25),
                  3.5e8
                )
            }
          );
        }
      }
    );
}

/* =========================================================
   SEARCH
========================================================= */

function searchAll(query) {
  const q =
    query
      .trim()
      .toLowerCase();

  if (!q) {
    ui.searchResults.hidden =
      true;

    return;
  }

  const earthResults =
    satellites
      .filter(
        item =>
          item.name
            .toLowerCase()
            .includes(q)
      )
      .slice(0, 8)
      .map(
        item => ({
          name:
            item.name,

          type:
            "Satellite",

          item
        })
      );

  const planetResults =
    solarObjects
      .filter(
        item =>
          item.name
            .toLowerCase()
            .includes(q)
      )
      .map(
        item => ({
          name:
            item.name,

          type:
            "Planet",

          item
        })
      );

  const spacecraftResults =
    spacecraft
      .filter(
        item =>
          item.name
            .toLowerCase()
            .includes(q)
      )
      .map(
        item => ({
          name:
            item.name,

          type:
            "Spacecraft",

          item
        })
      );

  const results =
    [
      ...earthResults,
      ...planetResults,
      ...spacecraftResults
    ].slice(0, 10);

  if (!results.length) {
    ui.searchResults.innerHTML =
      `
        <div class="empty-search">
          No matching object.
        </div>
      `;
  } else {
    ui.searchResults.innerHTML =
      results
        .map(
          (
            result,
            index
          ) => {
            let symbol = "●";

            if (
              result.type ===
              "Satellite"
            ) {
              symbol = "🛰";
            } else if (
              result.type ===
              "Spacecraft"
            ) {
              symbol =
                result.item?.icon ===
                "rocket"
                  ? "🚀"
                  : "🛰";
            }

            return `
            <button
              class="search-result"
              data-index="${index}">

              <span>
                ${symbol}
              </span>

              <strong>
                ${htmlEscape(
                  result.name
                )}
              </strong>

              <small>
                ${result.type}
              </small>

            </button>
          `;
          }
        )
        .join("");
  }

  ui.searchResults.hidden =
    false;

  ui.searchResults
    .querySelectorAll(
      ".search-result"
    )
    .forEach(
      (
        button,
        index
      ) => {
        button.addEventListener(
          "click",
          () => {
            const result =
              results[index];

            ui.searchResults.hidden =
              true;

            if (
              result.type ===
              "Satellite"
            ) {
              setMode("earth");

              selectSatellite(
                result.item
              );
            } else {
              setMode("solar");

              selectSolarObject(
                result.name
              );
            }
          }
        );
      }
    );
}

/* =========================================================
   CONJUNCTION SCREENING
========================================================= */

function screenConjunctions() {
  const now =
    new Date();

  const active =
    satellites.slice(
      0,
      160
    );

  const positions =
    active
      .map(
        record => ({
          record,

          position:
            propagate(
              record,
              now
            )
        })
      )
      .filter(
        item =>
          item.position
      );

  const pairs = [];

  for (
    let i = 0;
    i < positions.length;
    i++
  ) {
    for (
      let j = i + 1;
      j < positions.length;
      j++
    ) {
      const a =
        positions[i];

      const b =
        positions[j];

      /*
         Prevent identical/duplicate objects
         from becoming false 0 km conjunctions.
      */

      const noradA =
        a.record.line1?.slice(
          2,
          7
        );

      const noradB =
        b.record.line1?.slice(
          2,
          7
        );

      if (
        noradA &&
        noradB &&
        noradA === noradB
      ) {
        continue;
      }

      const distanceMeters =
        C.Cartesian3.distance(
          a.position.cartesian,
          b.position.cartesian
        );

      /*
         Ignore invalid or effectively zero
         separations. A 0 km result here is
         not a useful conjunction measurement.
      */

      if (
        !Number.isFinite(
          distanceMeters
        ) ||
        distanceMeters <= 100
      ) {
        continue;
      }

      const distance =
        distanceMeters / 1000;

      pairs.push({
        a:
          a.record.name,

        b:
          b.record.name,

        distance,

        alert:
          distance < 100
      });
    }
  }

  pairs.sort(
    (a, b) =>
      a.distance -
      b.distance
  );

  const close =
    pairs
      .filter(
        pair =>
          pair.alert
      )
      .slice(0, 3);

  if (close.length) {
    return close;
  }

  return pairs
    .slice(0, 3)
    .map(
      pair => ({
        ...pair,
        nearest:
          true
      })
    );
}

/* =========================================================
   ALERTS
========================================================= */

function updateAlerts() {
  alertPairs =
    screenConjunctions();

  ui.alertCount.textContent =
    alertPairs.filter(
      pair =>
        pair.alert
    ).length;

  if (!alertPairs.length) {
    ui.alerts.innerHTML =
      `
        <div class="alert-card info">

          <div class="alert-title">
            SCREENING ACTIVE
          </div>

          <strong>
            No valid pair distance is available yet
          </strong>

          <small>
            Waiting for valid tracked positions.
          </small>

        </div>
      `;

    return;
  }

  ui.alerts.innerHTML =
    alertPairs
      .map(
        pair =>
          pair.alert
            ? `
              <div class="alert-card">

                <div class="alert-title">
                  ⚠ POTENTIAL CLOSE APPROACH
                </div>

                <strong>
                  ${htmlEscape(pair.a)}
                  ↔
                  ${htmlEscape(pair.b)}
                </strong>

                <div class="alert-meta">
                  Current separation:
                  <b>
                    ${pair.distance.toFixed(1)} km
                  </b>
                </div>

                <small>
                  Further conjunction assessment required
                </small>

              </div>
            `
            : `
              <div class="alert-card info">

                <div class="alert-title">
                  NEAREST MONITORED SEPARATION
                </div>

                <strong>
                  ${htmlEscape(pair.a)}
                  ↔
                  ${htmlEscape(pair.b)}
                </strong>

                <div class="alert-meta">
                  Current separation:
                  <b>
                    ${pair.distance.toFixed(1)} km
                  </b>
                </div>

                <small>
                  No sub-100 km pair in this screening sample.
                  This is not a collision prediction.
                </small>

              </div>
            `
      )
      .join("");
}

/* =========================================================
   BOTTOM STATS
========================================================= */

function renderBottomStats() {
  ui.bottomStats.innerHTML = `
    <div>
      <span>◷</span>

      <section>
        <small>
          UTC TIME
        </small>

        <b id="utcBottom">
          —
        </b>
      </section>
    </div>

    <div>
      <span>✣</span>

      <section>
        <small>
          VISIBLE SATELLITES
        </small>

        <b>
          ${satellites.length.toLocaleString()}
        </b>
      </section>
    </div>

    <div>
      <span>⌁</span>

      <section>
        <small>
          ORBITAL PATHS
        </small>

        <b>
          ${orbitEntities.length.toLocaleString()}
        </b>
      </section>
    </div>

    <div>
      <span class="green-dot"></span>

      <section>
        <small>
          SCREENING STATUS
        </small>

        <b class="green">
          ACTIVE
        </b>
      </section>
    </div>
  `;
}

function renderSolarBottom() {
  ui.bottomStats.innerHTML = `
    <div>
      <span>☀</span>

      <section>
        <small>
          SUN
        </small>

        <b>
          Heliocentric reference
        </b>
      </section>
    </div>

    <div>
      <span>🌍</span>

      <section>
        <small>
          EARTH
        </small>

        <b>
          1.00 AU
        </b>
      </section>
    </div>

    <div>
      <span>🚀</span>

      <section>
        <small>
          SPACECRAFT
        </small>

        <b>
          ${spacecraft.length}
          tracked
        </b>
      </section>
    </div>

    <div>
      <span class="green-dot"></span>

      <section>
        <small>
          SOLAR SYSTEM
        </small>

        <b class="green">
          ACTIVE
        </b>
      </section>
    </div>
  `;
}

/* =========================================================
   AI ASSISTANT
========================================================= */

function addAssistantMessage(
  role,
  message
) {
  const element =
    document.createElement(
      "div"
    );

  element.className =
    `assistant-msg ${role}`;

  element.textContent =
    message;

  ui.assistantMessages.appendChild(
    element
  );

  ui.assistantMessages.scrollTop =
    ui.assistantMessages.scrollHeight;

  return element;
}

async function askAssistant() {
  const question =
    ui.assistantInput.value.trim();

  if (!question) {
    return;
  }

  addAssistantMessage(
    "user",
    question
  );

  ui.assistantInput.value =
    "";

  const responseElement =
    addAssistantMessage(
      "assistant",
      "Thinking…"
    );

  const apiUrl =
    import.meta.env
      .VITE_AI_API_URL;

  if (apiUrl) {
    try {
      const response =
        await fetch(
          apiUrl,
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json"
            },

            body:
              JSON.stringify({
                question
              })
          }
        );

      if (!response.ok) {
        throw new Error(
          "AI API error"
        );
      }

      const data =
        await response.json();

      responseElement.textContent =
        data.answer ||
        "No answer returned.";

      return;
    } catch {
      /* Local fallback */
    }
  }

  responseElement.textContent =
    localAssistant(
      question
    );
}

function localAssistant(question) {
  const q =
    question.toLowerCase();

  if (q.includes("tle")) {
    return (
      "A TLE is a two-line orbital element set. " +
      "OrbitWatch uses TLE data with SGP4 to estimate satellite positions."
    );
  }

  if (q.includes("sgp4")) {
    return (
      "SGP4 is an orbit propagation algorithm commonly used with TLE data. " +
      "OrbitWatch uses it in Earth Tracking mode."
    );
  }

  if (q.includes("starlink")) {
    return (
      "Starlink is a large low-Earth-orbit satellite constellation. " +
      "OrbitWatch can load current Starlink TLE data from CelesTrak."
    );
  }

  if (
    q.includes("collision") ||
    q.includes("risk")
  ) {
    return (
      "A current-distance screen does not prove a collision. " +
      "Real conjunction assessment requires future trajectories and uncertainty information."
    );
  }

  if (q.includes("voyager")) {
    return (
      "Voyager 1 and Voyager 2 are deep-space spacecraft. " +
      "OrbitWatch displays their trajectories using a compressed solar-system visualization."
    );
  }

  if (q.includes("planet")) {
    return (
      "Solar System mode displays the Sun, planets, orbital paths, " +
      "and selected human-made spacecraft."
    );
  }

  return (
    "I can explain satellites, TLEs, SGP4, debris, " +
    "conjunction screening, planets, spacecraft, or how OrbitWatch works."
  );
}

window.__ask = text => {
  ui.assistantInput.value =
    text;

  askAssistant();
};

/* =========================================================
   CLOCK
========================================================= */

function updateClock() {
  const now =
    new Date();

  const text =
    now
      .toISOString()
      .slice(11, 19) +
    " UTC";

  ui.dataClock.textContent =
    text;

  const bottom =
    document.getElementById(
      "utcBottom"
    );

  if (bottom) {
    bottom.textContent =
      text;
  }
}

/* =========================================================
   SOLAR QUICK BUTTONS
========================================================= */

function setupSolarButtons() {
  document
    .querySelectorAll(
      "#solarControls .quick-btn"
    )
    .forEach(
      button => {
        button.addEventListener(
          "click",
          () => {
            let target =
              button.dataset.solar;

            if (!target) {
              target =
                button.textContent
                  .replace("›", "")
                  .replace("🚀", "")
                  .trim();
            }

            if (
              target
                .toLowerCase()
                .includes(
                  "major spacecraft"
                )
            ) {
              target =
                "Juno";
            }

            setMode("solar");

            selectSolarObject(
              target
            );
          }
        );
      }
    );
}

/* =========================================================
   EVENTS
========================================================= */

ui.modeEarth.addEventListener(
  "click",
  () =>
    setMode("earth")
);

ui.modeSolar.addEventListener(
  "click",
  () =>
    setMode("solar")
);

ui.search.addEventListener(
  "input",
  () => {
    searchAll(
      ui.search.value
    );

    if (mode === "earth") {
      updateSatelliteVisibility();
    }
  }
);

ui.search.addEventListener(
  "keydown",
  event => {
    if (event.key === "Enter") {
      const first =
        ui.searchResults.querySelector(
          ".search-result"
        );

      if (first) {
        first.click();
      }
    }
  }
);

document.addEventListener(
  "click",
  event => {
    if (
      !ui.searchResults.contains(
        event.target
      ) &&
      event.target !==
        ui.search
    ) {
      ui.searchResults.hidden =
        true;
    }
  }
);

ui.assistantSend.addEventListener(
  "click",
  askAssistant
);

ui.assistantInput.addEventListener(
  "keydown",
  event => {
    if (event.key === "Enter") {
      askAssistant();
    }
  }
);

/* =========================================================
   CESIUM SELECTION
========================================================= */

viewer.selectedEntityChanged.addEventListener(
  entity => {
    if (!entity) {
      return;
    }

    const objectType =
      entity.properties
        ?.objectType
        ?.getValue?.();

    if (
      objectType ===
      "earth-satellite"
    ) {
      const record =
        satellites.find(
          item =>
            item.name ===
            entity.name
        );

      if (record) {
        selectSatellite(
          record
        );
      }
    }

    if (
      objectType === "planet" ||
      objectType === "spacecraft"
    ) {
      selectSolarObject(
        entity.name
      );
    }
  }
);

/* =========================================================
   PERIODIC UPDATES
========================================================= */

setInterval(
  updateClock,
  1000
);

setInterval(
  updateAlerts,
  30000
);

/* =========================================================
   START APPLICATION
========================================================= */

buildSolarSystem();

setupSolarButtons();

setMode("earth");

updateClock();

addAssistantMessage(
  "assistant",
  "Hello! I'm the OrbitWatch Space Assistant. Ask me about satellites, TLEs, SGP4, debris, conjunctions, planets, or spacecraft."
);

loadSatellites();