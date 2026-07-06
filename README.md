# WhyFi — frontend

Lightweight Vite + React app. No state library, no CSS framework, no chart library —
one `scenarioService.js` handles all backend calls, and every click wires directly
to either a service call or a plain `useState` setter in `App.jsx`.

## Setup

```bash
npm install
npm run dev
```

Runs on http://localhost:5173 by default.

## Backend connection

The app expects the WhyFi Spring Boot backend running at `http://localhost:8080`.
To point at a different backend, create a `.env.local` file:

```
VITE_API_BASE_URL=http://localhost:8080
```

## Structure

```
src/
├── App.jsx                 - all state, wires clicks to services/setters
├── index.css                - every style rule in the app lives here
├── services/
│   ├── scenarioService.js   - the only file that calls the backend
│   └── formatters.js        - currency/year display helpers
└── components/
    ├── PresetGrid.jsx        - clickable preset cards
    ├── ControlPanel.jsx      - sliders + recalculate button
    ├── ToggleBar.jsx         - nominal/real and what/why toggles
    ├── StatRow.jsx           - hero numbers
    ├── LedgerChart.jsx       - custom SVG chart, no dependency
    ├── MilestoneList.jsx     - milestone list from the engine
    └── Explainer.jsx         - live plain-language summary sentence
```
