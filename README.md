# 🛰️ OrbitWatch

### Space Traffic & Debris Monitoring System

OrbitWatch is a 3D space-monitoring web application designed to visualize
Earth-orbiting satellites, space debris, planets and human-made spacecraft.

The project combines real-time orbital data, 3D visualization,
close-approach screening and an AI-powered space assistant.

---

## 🚀 Features

### 🌍 Earth Tracking Mode

- Real-time Earth-orbiting object tracking
- Satellite positions calculated using SGP4
- CelesTrak orbital data
- 3D satellite visualization
- Orbital paths
- Satellite search
- Selected-object information

### 🪐 Solar System Mode

- Sun and planets
- Earth and Moon
- Mars, Jupiter, Saturn, Uranus and Neptune
- Human-made spacecraft
- Voyager 1
- Voyager 2
- New Horizons
- Juno
- Mars spacecraft
- Compressed visualization extending toward the Voyager region

### ⚠️ Conjunction Monitoring

OrbitWatch performs a screening of current separation between
tracked Earth-orbiting objects.

Objects below the screening threshold can generate a:

"Potential close approach"

alert.

This is a screening system and not a replacement for professional
conjunction assessment.

### 🤖 AI Space Assistant

The project includes a space-focused AI assistant for questions about:

- Satellites
- Spacecraft
- Planets
- Space debris
- Orbital tracking
- SGP4
- Conjunction alerts

The planned production architecture uses:

Amazon Bedrock
+
AWS Lambda
+
API Gateway

---

## 🛠️ Technology Stack

### Frontend

- JavaScript
- CesiumJS
- Vite
- HTML
- CSS

### Space Data

- CelesTrak
- Two-Line Element (TLE) data
- SGP4 orbital propagation
- JPL Horizons for Solar System ephemerides

### AWS

- AWS Lambda
- Amazon API Gateway
- Amazon Bedrock

---

## 🧠 How OrbitWatch Works

```text
          CelesTrak
              │
              ▼
        Orbital TLE Data
              │
              ▼
          SGP4 Model
              │
              ▼
       Satellite Position
              │
              ▼
        CesiumJS 3D Globe
              │
              ├───────────────┐
              ▼               ▼
       Orbit Visualization   Alert System
                              │
                              ▼
                    Close-Approach Screening


          User Question
              │
              ▼
        OrbitWatch Frontend
              │
              ▼
          API Gateway
              │
              ▼
          AWS Lambda
              │
              ▼
       Amazon Bedrock
              │
              ▼
        AI Space Assistant
