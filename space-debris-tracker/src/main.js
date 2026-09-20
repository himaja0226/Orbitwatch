import * as Cesium from "cesium";
import * as satellite from "satellite.js";

import "cesium/Build/Cesium/Widgets/widgets.css";
import "./style.css";

/* =========================================================
   ORBITWATCH
   Space Traffic & Debris Monitoring System
   ========================================================= */

document.querySelector("#app").innerHTML = `
  <div id="cesiumContainer"></div>

  <!-- TOP BAR -->
  <header class="topbar">

    <div class="brand">
      <div class="brand-icon">◉</div>

      <div>
        <h1>OrbitWatch</h1>
        <span>Explore · Track · Protect</span>
      </div>
    </div>

    <nav class="mode-nav">
      <button id="earthBtn" class="mode-btn active">
        🌍 Earth Tracking
      </button>

      <button id="solarBtn" class="mode-btn">
        🪐 Solar System
      </button>

      <button id="aiBtn" class="mode-btn">
        🤖 AI Assistant
      </button>
    </nav>

    <div class="top-right">

      <div class="live-status">
        <span class="live-dot"></span>
        LIVE
      </div>

      <input
        id="searchBox"
        type="text"
        placeholder="Search satellites, spacecraft, planets..."
      />

      <button id="searchButton">SEARCH</button>

    </div>

  </header>


  <!-- LEFT PANEL -->
  <aside id="leftPanel">

    <section class="panel">

      <div class="panel-title">
        <span>TRACKED OBJECTS</span>
        <span id="objectCount">0</span>
      </div>

      <div id="trackedList"></div>

    </section>


    <section class="panel quick-panel">

      <div class="panel-title">
        QUICK ACTIONS
      </div>

      <button id="trackISS" class="action-btn">
        🛰️ Track ISS
      </button>

      <button id="showOrbits" class="action-btn">
        🌀 Show Orbital Paths
      </button>

      <button id="allSatellites" class="action-btn">
        📡 View Satellites
      </button>

    </section>

  </aside>


  <!-- SEARCH RESULTS -->
  <div id="searchResults"></div>


  <!-- RIGHT PANEL -->
  <aside id="rightPanel">

    <!-- ALERT PANEL -->
    <section class="panel alert-panel">

      <div class="panel-title alert-title">
        <span>⚠ CONJUNCTION ALERTS</span>
        <span id="alertCount">0</span>
      </div>

      <div id="alertList">
        <div class="safe-message">
          Monitoring orbital objects...
        </div>
      </div>

    </section>


    <!-- SELECTED OBJECT -->
    <section class="panel selected-panel">

      <div class="panel-title">
        SELECTED OBJECT
      </div>

      <div id="selectedObject">

        <div class="empty-selection">
          Select an object from the globe.
        </div>

      </div>

    </section>


    <!-- AI PANEL -->
    <section id="aiPanel" class="panel ai-panel">

      <div class="panel-title">
        <span>🤖 AI SPACE ASSISTANT</span>
        <span class="online-text">ONLINE</span>
      </div>

      <div id="chatMessages">

        <div class="bot-message">
          Hi! I'm your space assistant.
          Ask me about satellites, planets,
          spacecraft or orbital alerts.
        </div>

      </div>

      <div class="suggestions">

        <button data-question="What is the ISS?">
          What is the ISS?
        </button>

        <button data-question="Tell me about Voyager 1">
          Voyager 1
        </button>

        <button data-question="What is space debris?">
          Space debris
        </button>

      </div>

      <div class="chat-input-row">

        <input
          id="chatInput"
          placeholder="Ask a space question..."
        />

        <button id="chatSend">
          ➤
        </button>

      </div>

    </section>

  </aside>


  <!-- BOTTOM BAR -->
  <div id="bottomBar">

    <div class="mode-info">
      <span id="modeLabel">
        EARTH TRACKING MODE
      </span>

      <span id="dataStatus">
        Connecting to orbital data...
      </span>
    </div>

    <div class="clock">
      <span id="utcClock">--:--:-- UTC</span>
    </div>

  </div>


  <!-- SEARCH MODE OVERLAY -->
  <div id="solarNotice">
    SOLAR SYSTEM VIEW · VISUAL SCALE COMPRESSED
  </div>

`;


/* =========================================================
   CESIUM VIEWER
   ========================================================= */

const viewer = new Cesium.Viewer(
  "cesiumContainer",
  {
    animation: false,
    timeline: false,

    baseLayerPicker: false,
    geocoder: false,

    homeButton: true,

    sceneModePicker: false,
    navigationHelpButton: false,
    fullscreenButton: false,

    terrainProvider:
      new Cesium.EllipsoidTerrainProvider()
  }
);


/* Darker Earth atmosphere/background */

viewer.scene.backgroundColor =
  Cesium.Color.fromCssColorString("#020611");

viewer.scene.globe.enableLighting = true;

viewer.scene.globe.show = true;


/* =========================================================
   GLOBAL DATA
   ========================================================= */

let satellites = [];

let satelliteEntities = [];

let orbitEntities = [];

let solarEntities = [];

let alertPairs = [];

let selectedEntity = null;

let currentMode = "earth";

let orbitsVisible = true;


/* =========================================================
   CELESTRAK
   ========================================================= */

const CELESTRAK_URL =
  "https://celestrak.org/NORAD/elements/gp.php?GROUP=STATIONS&FORMAT=TLE";


/* =========================================================
   PLANET TEXTURES
   ========================================================= */

const TEXTURE_BASE =
  "https://edu.solarsystemscope.com/textures/download/";

const textures = {

  Sun:
    `${TEXTURE_BASE}2k_sun.jpg`,

  Mercury:
    `${TEXTURE_BASE}2k_mercury.jpg`,

  Venus:
    `${TEXTURE_BASE}2k_venus_surface.jpg`,

  Earth:
    `${TEXTURE_BASE}2k_earth_daymap.jpg`,

  Moon:
    `${TEXTURE_BASE}2k_moon.jpg`,

  Mars:
    `${TEXTURE_BASE}2k_mars.jpg`,

  Jupiter:
    `${TEXTURE_BASE}2k_jupiter.jpg`,

  Saturn:
    `${TEXTURE_BASE}2k_saturn.jpg`,

  Uranus:
    `${TEXTURE_BASE}2k_uranus.jpg`,

  Neptune:
    `${TEXTURE_BASE}2k_neptune.jpg`

};


/* =========================================================
   SOLAR SYSTEM DATA
   ========================================================= */

const planets = [

  {
    name: "Mercury",
    distance: 0.39,
    radius: 0.045,
    period: 88
  },

  {
    name: "Venus",
    distance: 0.72,
    radius: 0.065,
    period: 225
  },

  {
    name: "Earth",
    distance: 1,
    radius: 0.075,
    period: 365.25
  },

  {
    name: "Mars",
    distance: 1.52,
    radius: 0.055,
    period: 687
  },

  {
    name: "Jupiter",
    distance: 5.20,
    radius: 0.16,
    period: 4333
  },

  {
    name: "Saturn",
    distance: 9.58,
    radius: 0.14,
    period: 10759
  },

  {
    name: "Uranus",
    distance: 19.2,
    radius: 0.10,
    period: 30687
  },

  {
    name: "Neptune",
    distance: 30.05,
    radius: 0.10,
    period: 60190

  }

];


/* =========================================================
   SPACECRAFT
   ========================================================= */

const spacecraft = [

  {
    name: "Voyager 1",
    distance: 165,
    target: "Interstellar Space",
    jplId: "-31"
  },

  {
    name: "Voyager 2",
    distance: 138,
    target: "Interstellar Space",
    jplId: "-32"
  },

  {
    name: "New Horizons",
    distance: 62,
    target: "Outer Solar System",
    jplId: "-98"
  },

  {
    name: "Juno",
    distance: 5.2,
    target: "Jupiter",
    jplId: "-61"
  },

  {
    name: "Mars Reconnaissance Orbiter",
    distance: 1.52,
    target: "Mars",
    jplId: "-74"
  },

  {
    name: "Mars Express",
    distance: 1.52,
    target: "Mars",
    jplId: "-41"
  },

  {
    name: "BepiColombo",
    distance: 0.39,
    target: "Mercury",
    jplId: "-121"
  }

];


/* =========================================================
   EARTH TRACKING
   ========================================================= */

async function loadSatellites() {

  setDataStatus("Downloading CelesTrak data...");

  try {

    const response =
      await fetch(CELESTRAK_URL);

    if (!response.ok) {

      throw new Error(
        "CelesTrak request failed"
      );

    }

    const text =
      await response.text();

    satellites =
      parseTLE(text);

    document.getElementById(
      "objectCount"
    ).textContent =
      satellites.length;

    setDataStatus(
      `${satellites.length} Earth-orbiting objects`
    );

    createSatelliteObjects();

    updateTrackedList();

    createConjunctionAlerts();

  }

  catch (error) {

    console.error(error);

    setDataStatus(
      "Orbital data unavailable"
    );

    document.getElementById(
      "objectCount"
    ).textContent =
      "ERROR";

  }

}


/* =========================================================
   TLE PARSER
   ========================================================= */

function parseTLE(text) {

  const lines =
    text
      .split("\n")
      .map(line => line.trim())
      .filter(Boolean);

  const result = [];

  for (
    let i = 0;
    i < lines.length - 2;
    i++
  ) {

    const name =
      lines[i];

    const line1 =
      lines[i + 1];

    const line2 =
      lines[i + 2];

    if (
      !line1.startsWith("1 ") ||
      !line2.startsWith("2 ")
    ) {

      continue;

    }

    try {

      const satrec =
        satellite.twoline2satrec(
          line1,
          line2
        );

      result.push({

        name,

        satrec,

        entity: null,

        line1,

        line2

      });

      i += 2;

    }

    catch (error) {

      console.warn(
        "TLE error:",
        name
      );

    }

  }

  return result;

}


/* =========================================================
   POSITION FROM SGP4
   ========================================================= */

function getPosition(
  satrec,
  date
) {

  const result =
    satellite.propagate(
      satrec,
      date
    );

  if (
    !result ||
    !result.position
  ) {

    return null;

  }

  const gmst =
    satellite.gstime(date);

  const geo =
    satellite.eciToGeodetic(
      result.position,
      gmst
    );

  return Cesium.Cartesian3.fromDegrees(

    satellite.degreesLong(
      geo.longitude
    ),

    satellite.degreesLat(
      geo.latitude
    ),

    geo.height * 1000

  );

}


/* =========================================================
   SATELLITE 3D MODEL
   ========================================================= */

function createSatelliteObjects() {

  clearEarthObjects();

  satellites.forEach(
    (sat, index) => {

      const entity =
        viewer.entities.add({

          name:
            sat.name,

          position:
            new Cesium.CallbackPositionProperty(

              () => {

                return (
                  getPosition(
                    sat.satrec,
                    new Date()
                  ) ||
                  Cesium.Cartesian3.ZERO
                );

              },

              false

            ),

          model: {

            uri:
              "/models/generic-satellite.glb",

            scale: 0.8,

            minimumPixelSize: 24,

            maximumScale: 5000,

            show:
              true

          },

          label: {

            text:
              sat.name,

            font:
              "12px Arial",

            fillColor:
              Cesium.Color.WHITE,

            showBackground:
              true,

            backgroundColor:
              Cesium.Color.BLACK
                .withAlpha(0.75),

            pixelOffset:
              new Cesium.Cartesian2(
                16,
                0
              ),

            show:
              false,

            disableDepthTestDistance:
              Number.POSITIVE_INFINITY

          },

          description: `

            <h2>🛰️ ${escapeHTML(
              sat.name
            )}</h2>

            <p>
              <b>Tracking:</b> LIVE
            </p>

            <p>
              <b>Source:</b> CelesTrak
            </p>

            <p>
              <b>Propagation:</b> SGP4
            </p>

            <p>
              Position is calculated from
              current Two-Line Element data.
            </p>

          `

        });

      sat.entity =
        entity;

      satelliteEntities.push(
        entity
      );

      createOrbit(sat);

    }
  );

}


/* =========================================================
   ORBIT PATH
   ========================================================= */

function createOrbit(sat) {

  const positions = [];

  const now =
    new Date();

  for (
    let minutes = 0;
    minutes <= 100;
    minutes += 4
  ) {

    const time =
      new Date(
        now.getTime() +
        minutes *
        60 *
        1000
      );

    const position =
      getPosition(
        sat.satrec,
        time
      );

    if (position) {

      positions.push(
        position
      );

    }

  }

  if (
    positions.length < 2
  ) {

    return;

  }

  const orbit =
    viewer.entities.add({

      polyline: {

        positions,

        width: 1.3,

        material:
          Cesium.Color.CYAN
            .withAlpha(0.35),

        arcType:
          Cesium.ArcType.NONE

      }

    });

  orbitEntities.push(
    orbit
  );

}


/* =========================================================
   CLOSE APPROACH SCREENING
   ========================================================= */

function createConjunctionAlerts() {

  alertPairs = [];

  const now =
    new Date();

  for (
    let i = 0;
    i < satellites.length;
    i++
  ) {

    const pos1 =
      getPosition(
        satellites[i].satrec,
        now
      );

    if (!pos1) continue;

    for (
      let j = i + 1;
      j < satellites.length;
      j++
    ) {

      const pos2 =
        getPosition(
          satellites[j].satrec,
          now
        );

      if (!pos2) continue;

      const distance =
        Cesium.Cartesian3.distance(
          pos1,
          pos2
        );

      if (
        distance < 100000
      ) {

        alertPairs.push({

          first:
            satellites[i],

          second:
            satellites[j],

          distance

        });

      }

    }

  }

  document.getElementById(
    "alertCount"
  ).textContent =
    alertPairs.length;

  updateAlertPanel();

}


/* =========================================================
   ALERT UI
   ========================================================= */

function updateAlertPanel() {

  const container =
    document.getElementById(
      "alertList"
    );

  if (
    alertPairs.length === 0
  ) {

    container.innerHTML = `

      <div class="safe-message">

        ✓ No current close approaches
        detected by the screening threshold.

      </div>

      <div class="alert-note">

        Screening threshold:
        100 km current separation.

      </div>

    `;

    return;

  }

  container.innerHTML = "";

  alertPairs
    .slice(0, 5)
    .forEach(
      alert => {

        const div =
          document.createElement(
            "div"
          );

        div.className =
          "alert-card";

        div.innerHTML = `

          <div class="alert-card-title">
            ⚠ POTENTIAL CLOSE APPROACH
          </div>

          <div class="alert-objects">

            ${escapeHTML(
              alert.first.name
            )}

            ↔

            ${escapeHTML(
              alert.second.name
            )}

          </div>

          <div class="alert-distance">

            Separation:
            <b>
              ${(alert.distance / 1000)
                .toFixed(1)} km
            </b>

          </div>

          <div class="alert-warning">

            Further conjunction assessment
            required.

          </div>

          <button class="alert-view">

            VIEW OBJECT

          </button>

        `;

        div
          .querySelector(
            ".alert-view"
          )
          .onclick = () => {

            focusSatellite(
              alert.first
            );

          };

        container.appendChild(
          div
        );

      }
    );

}


/* =========================================================
   TRACKED OBJECT LIST
   ========================================================= */

function updateTrackedList() {

  const list =
    document.getElementById(
      "trackedList"
    );

  list.innerHTML = "";

  const importantNames = [

    "ISS (ZARYA)",
    "ISS",

    "CSS (TIANHE)",

    "TIANHE"

  ];

  let shown = [];

  importantNames.forEach(
    wanted => {

      const found =
        satellites.find(
          sat =>
            sat.name
              .toUpperCase()
              .includes(
                wanted
              )
        );

      if (
        found &&
        !shown.includes(found)
      ) {

        shown.push(
          found
        );

      }

    }
  );

  satellites
    .filter(
      sat =>
        !shown.includes(sat)
    )
    .slice(
      0,
      6
    )
    .forEach(
      sat =>
        shown.push(sat)
    );

  shown
    .slice(0, 8)
    .forEach(
      sat => {

        const button =
          document.createElement(
            "button"
          );

        button.className =
          "tracked-item";

        button.innerHTML = `

          <span class="object-icon">
            🛰️
          </span>

          <span class="object-name">
            ${escapeHTML(
              sat.name
            )}
          </span>

          <span class="object-arrow">
            ›
          </span>

        `;

        button.onclick = () => {

          focusSatellite(
            sat
          );

        };

        list.appendChild(
          button
        );

      }
    );

}


/* =========================================================
   FOCUS SATELLITE
   ========================================================= */

function focusSatellite(
  sat
) {

  switchToEarth();

  if (!sat.entity) {

    return;

  }

  selectedEntity =
    sat.entity;

  sat.entity.label.show =
    true;

  viewer.flyTo(
    sat.entity,
    {

      duration:
        2,

      offset:
        new Cesium.HeadingPitchRange(
          0,
          -0.35,
          5000000
        )

    }
  );

  showSelected(

    sat.name,

    "Earth-orbiting satellite",

    "CelesTrak",

    "SGP4"

  );

}


/* =========================================================
   CESIUM CLICK
   ========================================================= */

const handler =
  new Cesium.ScreenSpaceEventHandler(
    viewer.scene.canvas
  );

handler.setInputAction(

  movement => {

    const picked =
      viewer.scene.pick(
        movement.position
      );

    if (
      Cesium.defined(picked) &&
      picked.id
    ) {

      const entity =
        picked.id;

      const sat =
        satellites.find(
          s =>
            s.entity === entity
        );

      if (sat) {

        showSelected(

          sat.name,

          "Earth-orbiting satellite",

          "CelesTrak",

          "SGP4"

        );

        entity.label.show =
          true;

      }

      else if (
        entity.properties &&
        entity.properties.type
      ) {

        showSelected(

          entity.name,

          entity.properties
            .type
            .getValue(),

          entity.properties
            .source
            .getValue(),

          "Solar System"

        );

      }

    }

  },

  Cesium.ScreenSpaceEventType.LEFT_CLICK

);


/* =========================================================
   SELECTED OBJECT PANEL
   ========================================================= */

function showSelected(
  name,
  type,
  source,
  propagation
) {

  document.getElementById(
    "selectedObject"
  ).innerHTML = `

    <div class="selected-name">

      ${escapeHTML(name)}

    </div>

    <div class="info-row">

      <span>TYPE</span>

      <b>
        ${escapeHTML(type)}
      </b>

    </div>

    <div class="info-row">

      <span>SOURCE</span>

      <b>
        ${escapeHTML(source)}
      </b>

    </div>

    <div class="info-row">

      <span>POSITION</span>

      <b>
        REAL-TIME
      </b>

    </div>

    <div class="info-row">

      <span>PROPAGATION</span>

      <b>
        ${escapeHTML(
          propagation
        )}
      </b>

    </div>

    <div class="selected-live">

      ● LIVE TRACKING

    </div>

  `;

}


/* =========================================================
   EARTH MODE
   ========================================================= */

function switchToEarth() {

  currentMode =
    "earth";

  document.getElementById(
    "modeLabel"
  ).textContent =
    "EARTH TRACKING MODE";

  document.getElementById(
    "solarNotice"
  ).style.display =
    "none";

  viewer.scene.globe.show =
    true;

  satelliteEntities.forEach(
    entity =>
      entity.show = true
  );

  orbitEntities.forEach(
    entity =>
      entity.show =
        orbitsVisible
  );

  solarEntities.forEach(
    entity =>
      entity.show = false
  );

  viewer.camera.flyHome(
    1.5
  );

  updateModeButtons(
    "earth"
  );

}


/* =========================================================
   SOLAR SYSTEM MODE
   ========================================================= */

function switchToSolarSystem() {

  currentMode =
    "solar";

  document.getElementById(
    "modeLabel"
  ).textContent =
    "SOLAR SYSTEM MODE";

  document.getElementById(
    "solarNotice"
  ).style.display =
    "block";

  viewer.scene.globe.show =
    false;

  satelliteEntities.forEach(
    entity =>
      entity.show = false
  );

  orbitEntities.forEach(
    entity =>
      entity.show = false
  );

  createSolarSystem();

  updateModeButtons(
    "solar"
  );

}


/* =========================================================
   COMPRESSED SOLAR DISTANCE
   ========================================================= */

function compressedDistance(
  astronomicalUnits
) {

  /*
    Logarithmic compression lets us display
    Mercury through Voyager 1 together.
  */

  return (
    Math.log10(
      astronomicalUnits + 1
    ) *
    3.2e9
  );

}


/* =========================================================
   CREATE SOLAR SYSTEM
   ========================================================= */

function createSolarSystem() {

  solarEntities.forEach(
    entity => {

      viewer.entities.remove(
        entity
      );

    }
  );

  solarEntities = [];


  /* SUN */

  const sun =
    viewer.entities.add({

      name:
        "Sun",

      position:
        Cesium.Cartesian3.ZERO,

      ellipsoid: {

        radii:
          new Cesium.Cartesian3(
            150000000,
            150000000,
            150000000
          ),

        material:
          new Cesium.ImageMaterialProperty({

            image:
              textures.Sun,

            repeat:
              new Cesium.Cartesian2(
                1,
                1
              )

          })

      },

      label: {

        text:
          "☀ SUN",

        show:
          true,

        font:
          "13px Arial",

        fillColor:
          Cesium.Color.WHITE,

        disableDepthTestDistance:
          Number.POSITIVE_INFINITY

      }

    });

  solarEntities.push(
    sun
  );


  /* PLANETS */

  planets.forEach(
    planet => {

      const distance =
        compressedDistance(
          planet.distance
        );

      const angle =
        (
          Date.now() /
          86400000 /
          planet.period
        ) *
        Math.PI *
        2;

      const x =
        Math.cos(angle) *
        distance;

      const y =
        Math.sin(angle) *
        distance;

      const radius =
        planet.radius *
        1e9;


      /* ORBIT */

      const orbitPositions = [];

      for (
        let a = 0;
        a <= 360;
        a += 3
      ) {

        const rad =
          Cesium.Math.toRadians(
            a
          );

        orbitPositions.push(

          new Cesium.Cartesian3(

            Math.cos(rad) *
              distance,

            Math.sin(rad) *
              distance,

            0

          )

        );

      }

      const orbit =
        viewer.entities.add({

          polyline: {

            positions:
              orbitPositions,

            width:
              1.5,

            material:
              Cesium.Color.CYAN
                .withAlpha(
                  0.20
                ),

            arcType:
              Cesium.ArcType.NONE

          }

        });

      solarEntities.push(
        orbit
      );


      /* PLANET */

      const entity =
        viewer.entities.add({

          name:
            planet.name,

          position:
            new Cesium.Cartesian3(
              x,
              y,
              0
            ),

          ellipsoid: {

            radii:
              new Cesium.Cartesian3(
                radius,
                radius,
                radius
              ),

            material:
              new Cesium.ImageMaterialProperty({

                image:
                  textures[
                    planet.name
                  ],

                repeat:
                  new Cesium.Cartesian2(
                    1,
                    1
                  )

              })

          },

          properties: {

            type:
              planet.name === "Earth"
                ? new Cesium.ConstantProperty(
                    "Planet"
                  )
                : new Cesium.ConstantProperty(
                    "Planet"
                  ),

            source:
              new Cesium.ConstantProperty(
                "Solar System Scope / NASA-derived texture"
              )

          },

          label: {

            text:
              planet.name,

            show:
              true,

            font:
              "12px Arial",

            fillColor:
              Cesium.Color.WHITE,

            showBackground:
              true,

            backgroundColor:
              Cesium.Color.BLACK
                .withAlpha(
                  0.65
                ),

            pixelOffset:
              new Cesium.Cartesian2(
                0,
                20
              ),

            disableDepthTestDistance:
              Number.POSITIVE_INFINITY

          }

        });

      solarEntities.push(
        entity
      );


      /* SATURN RINGS */

      if (
        planet.name ===
        "Saturn"
      ) {

        const ring =
          viewer.entities.add({

            name:
              "Saturn Rings",

            position:
              new Cesium.Cartesian3(
                x,
                y,
                0
              ),

            ellipse: {

              semiMajorAxis:
                radius * 1.8,

              semiMinorAxis:
                radius * 1.8,

              height:
                0,

              material:
                Cesium.Color.LIGHTGRAY
                  .withAlpha(
                    0.65
                  )

            }

          });

        solarEntities.push(
          ring
        );

      }

    }
  );


  /* MOON */

  const earthDistance =
    compressedDistance(
      1
    );

  const moonDistance =
    earthDistance +
    180000000;

  const moon =
    viewer.entities.add({

      name:
        "Moon",

      position:
        new Cesium.Cartesian3(
          moonDistance,
          0,
          0
        ),

      ellipsoid: {

        radii:
          new Cesium.Cartesian3(
            55000000,
            55000000,
            55000000
          ),

        material:
          new Cesium.ImageMaterialProperty({

            image:
              textures.Moon

          })

      },

      label: {

        text:
          "Moon",

        show:
          true,

        font:
          "11px Arial",

        fillColor:
          Cesium.Color.WHITE,

        disableDepthTestDistance:
          Number.POSITIVE_INFINITY

      }

    });

  solarEntities.push(
    moon
  );


  /* SPACECRAFT */

  spacecraft.forEach(
    (craft, index) => {

      const distance =
        compressedDistance(
          craft.distance
        );

      const angle =
        index *
        0.9;

      const position =
        new Cesium.Cartesian3(

          Math.cos(angle) *
            distance,

          Math.sin(angle) *
            distance,

          0

        );


      const entity =
        viewer.entities.add({

          name:
            craft.name,

          position,

          model: {

            uri:
              "/models/generic-satellite.glb",

            scale:
              0.7,

            minimumPixelSize:
              28,

            maximumScale:
              5000

          },

          properties: {

            type:
              new Cesium.ConstantProperty(
                "Human-made spacecraft"
              ),

            source:
              new Cesium.ConstantProperty(
                "JPL Horizons / mission data"
              )

          },

          label: {

            text:
              craft.name,

            show:
              true,

            font:
              "11px Arial",

            fillColor:
              Cesium.Color.ORANGE,

            showBackground:
              true,

            backgroundColor:
              Cesium.Color.BLACK
                .withAlpha(
                  0.7
                ),

            pixelOffset:
              new Cesium.Cartesian2(
                14,
                0
              ),

            disableDepthTestDistance:
              Number.POSITIVE_INFINITY

          }

        });

      solarEntities.push(
        entity
      );

    }
  );


  /* STARS */

  createStars();


  /* CAMERA */

  const sphere =
    new Cesium.BoundingSphere(

      Cesium.Cartesian3.ZERO,

      8.5e9

    );

  viewer.camera.flyToBoundingSphere(

    sphere,

    {

      duration:
        2

    }

  );

}


/* =========================================================
   STAR FIELD
   ========================================================= */

function createStars() {

  for (
    let i = 0;
    i < 350;
    i++
  ) {

    const theta =
      Math.random() *
      Math.PI *
      2;

    const phi =
      Math.acos(
        2 *
        Math.random() -
        1
      );

    const radius =
      9e9;

    const x =
      radius *
      Math.sin(phi) *
      Math.cos(theta);

    const y =
      radius *
      Math.sin(phi) *
      Math.sin(theta);

    const z =
      radius *
      Math.cos(phi);

    const star =
      viewer.entities.add({

        position:
          new Cesium.Cartesian3(
            x,
            y,
            z
          ),

        point: {

          pixelSize:
            Math.random() *
              2 +
            1,

          color:
            Cesium.Color.WHITE
              .withAlpha(
                Math.random() *
                  0.6 +
                0.4
              ),

          disableDepthTestDistance:
            Number.POSITIVE_INFINITY

        }

      });

    solarEntities.push(
      star
    );

  }

}


/* =========================================================
   SEARCH
   ========================================================= */

const searchBox =
  document.getElementById(
    "searchBox"
  );

const searchResults =
  document.getElementById(
    "searchResults"
  );


function performSearch() {

  const query =
    searchBox.value
      .trim()
      .toLowerCase();

  searchResults.innerHTML = "";

  if (!query) {

    return;

  }


  const earthMatches =
    satellites
      .filter(
        sat =>
          sat.name
            .toLowerCase()
            .includes(
              query
            )
      )
      .slice(
        0,
        6
      );


  const spacecraftMatches =
    spacecraft
      .filter(
        craft =>
          craft.name
            .toLowerCase()
            .includes(
              query
            )
      );


  const planetMatches =
    planets
      .filter(
        planet =>
          planet.name
            .toLowerCase()
            .includes(
              query
            )
      );


  const matches = [

    ...earthMatches,

    ...spacecraftMatches,

    ...planetMatches

  ];


  if (
    matches.length === 0
  ) {

    searchResults.innerHTML = `

      <div class="no-results">
        No matching object found.
      </div>

    `;

    return;

  }


  matches
    .slice(0, 10)
    .forEach(
      item => {

        const button =
          document.createElement(
            "button"
          );

        button.className =
          "search-result";

        button.textContent =
          item.name;

        button.onclick = () => {

          searchResults.innerHTML = "";

          if (
            item.satrec
          ) {

            focusSatellite(
              item
            );

          }

          else {

            switchToSolarSystem();

            setTimeout(
              () => {

                focusSolarObject(
                  item.name
                );

              },
              600
            );

          }

        };

        searchResults.appendChild(
          button
        );

      }
    );

}


/* Search button */

document.getElementById(
  "searchButton"
).onclick =
  performSearch;


/* ENTER SEARCH */

searchBox.addEventListener(
  "keydown",
  event => {

    if (
      event.key ===
      "Enter"
    ) {

      performSearch();

    }

  }
);


/* =========================================================
   FOCUS SOLAR OBJECT
   ========================================================= */

function focusSolarObject(
  name
) {

  const entity =
    solarEntities.find(
      e =>
        e.name ===
        name
    );

  if (!entity) {

    return;

  }

  viewer.flyTo(
    entity,
    {

      duration:
        2

    }
  );

  showSelected(

    name,

    name === "Moon"
      ? "Natural satellite"
      : "Solar System object",

    "Solar System data",

    "Ephemeris visualization"

  );

}


/* =========================================================
   ORBIT BUTTON
   ========================================================= */

document.getElementById(
  "showOrbits"
).onclick =
  () => {

    orbitsVisible =
      !orbitsVisible;

    orbitEntities.forEach(
      entity =>
        entity.show =
          orbitsVisible
    );

  };


/* =========================================================
   ALL SATELLITES
   ========================================================= */

document.getElementById(
  "allSatellites"
).onclick =
  () => {

    switchToEarth();

    satelliteEntities.forEach(
      entity =>
        entity.show =
          true
    );

    orbitEntities.forEach(
      entity =>
        entity.show =
          orbitsVisible
    );

    viewer.camera.flyHome(
      1.5
    );

  };


/* =========================================================
   ISS BUTTON
   ========================================================= */

document.getElementById(
  "trackISS"
).onclick =
  () => {

    const iss =
      satellites.find(
        sat =>
          sat.name
            .toUpperCase()
            .includes(
              "ISS"
            )
      );

    if (iss) {

      focusSatellite(
        iss
      );

    }

  };


/* =========================================================
   MODE BUTTONS
   ========================================================= */

document.getElementById(
  "earthBtn"
).onclick =
  switchToEarth;


document.getElementById(
  "solarBtn"
).onclick =
  switchToSolarSystem;


function updateModeButtons(
  mode
) {

  document
    .querySelectorAll(
      ".mode-btn"
    )
    .forEach(
      button =>
        button.classList
          .remove(
            "active"
          )
    );

  if (
    mode ===
    "earth"
  ) {

    document.getElementById(
      "earthBtn"
    ).classList.add(
      "active"
    );

  }

  if (
    mode ===
    "solar"
  ) {

    document.getElementById(
      "solarBtn"
    ).classList.add(
      "active"
    );

  }

}


/* =========================================================
   AI ASSISTANT
   ========================================================= */

document.getElementById(
  "aiBtn"
).onclick =
  () => {

    const panel =
      document.getElementById(
        "aiPanel"
      );

    panel.scrollIntoView({
      behavior:
        "smooth"
    });

    document.getElementById(
      "chatInput"
    ).focus();

  };


const chatInput =
  document.getElementById(
    "chatInput"
  );

const chatSend =
  document.getElementById(
    "chatSend"
  );

const chatMessages =
  document.getElementById(
    "chatMessages"
  );


function addChatMessage(
  text,
  sender
) {

  const message =
    document.createElement(
      "div"
    );

  message.className =
    sender === "user"
      ? "user-message"
      : "bot-message";

  message.textContent =
    text;

  chatMessages.appendChild(
    message
  );

  chatMessages.scrollTop =
    chatMessages.scrollHeight;

}


function getAIAnswer(
  question
) {

  const q =
    question.toLowerCase();


  if (
    q.includes(
      "iss"
    )
  ) {

    return (
      "The ISS is the International Space Station. " +
      "It is a large crewed laboratory in low Earth orbit. " +
      "OrbitWatch can track its position using orbital elements."
    );

  }


  if (
    q.includes(
      "voyager"
    )
  ) {

    return (
      "Voyager 1 is a NASA spacecraft launched in 1977. " +
      "It is traveling in interstellar space and is much farther " +
      "from the Sun than the planets."
    );

  }


  if (
    q.includes(
      "debris"
    )
  ) {

    return (
      "Space debris means human-made objects or fragments " +
      "left in space. OrbitWatch screens Earth-orbiting objects " +
      "for potentially hazardous close approaches."
    );

  }


  if (
    q.includes(
      "sgp4"
    )
  ) {

    return (
      "SGP4 is an orbital propagation model commonly used " +
      "with Two-Line Element data to estimate the position " +
      "of Earth-orbiting objects."
    );

  }


  if (
    q.includes(
      "mars"
    )
  ) {

    return (
      "Mars is the fourth planet from the Sun. " +
      "OrbitWatch displays Mars in Solar System mode " +
      "together with spacecraft associated with Mars."
    );

  }


  if (
    q.includes(
      "jupiter"
    )
  ) {

    return (
      "Jupiter is the largest planet in the Solar System. " +
      "Juno is a spacecraft associated with Jupiter."
    );

  }


  if (
    q.includes(
      "alert"
    ) ||
    q.includes(
      "collision"
    )
  ) {

    return (
      "An OrbitWatch alert indicates a current-distance screening " +
      "result. It is not by itself a confirmed collision prediction. " +
      "A proper conjunction assessment requires future trajectory " +
      "and uncertainty information."
    );

  }


  if (
    q.includes(
      "earth"
    )
  ) {

    return (
      "Earth Tracking Mode focuses on objects orbiting Earth. " +
      "Solar System Mode expands the view from the Sun " +
      "out toward the Voyager spacecraft."
    );

  }


  return (
    "I can explain satellites, planets, spacecraft, SGP4, " +
    "space debris, orbital alerts and the Solar System. " +
    "Try asking me about Voyager 1, the ISS or space debris."
  );

}


function sendChat() {

  const text =
    chatInput.value.trim();

  if (!text) {

    return;

  }

  addChatMessage(
    text,
    "user"
  );

  chatInput.value = "";

  setTimeout(
    () => {

      addChatMessage(
        getAIAnswer(
          text
        ),
        "bot"
      );

    },
    300
  );

}


chatSend.onclick =
  sendChat;


chatInput.addEventListener(
  "keydown",
  event => {

    if (
      event.key ===
      "Enter"
    ) {

      sendChat();

    }

  }
);


/* Suggestion buttons */

document
  .querySelectorAll(
    ".suggestions button"
  )
  .forEach(
    button => {

      button.onclick =
        () => {

          chatInput.value =
            button.dataset.question;

          sendChat();

        };

    }
  );


/* =========================================================
   UTILITIES
   ========================================================= */

function setDataStatus(
  text
) {

  document.getElementById(
    "dataStatus"
  ).textContent =
    text;

}


function escapeHTML(
  text
) {

  return String(text)
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );

}


function clearEarthObjects() {

  satelliteEntities.forEach(
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

  satelliteEntities = [];

  orbitEntities = [];

}


/* =========================================================
   UTC CLOCK
   ========================================================= */

function updateClock() {

  const now =
    new Date();

  document.getElementById(
    "utcClock"
  ).textContent =

    now
      .toISOString()
      .substring(
        11,
        19
      ) +

    " UTC";

}

setInterval(
  updateClock,
  1000
);

updateClock();


/* =========================================================
   START
   ========================================================= */

loadSatellites();

setInterval(
  createConjunctionAlerts,
  30000
);