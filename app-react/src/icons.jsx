/* Every icon in the app, in one place. They are inline SVG because the app ships
   as a single HTML file: there is nowhere to fetch an icon font from. They take
   currentColor, so the container decides their colour. */

const line = {
  fill: "none", stroke: "currentColor", strokeLinecap: "round",
  strokeLinejoin: "round", "aria-hidden": "true",
};

export const DocIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" strokeWidth="1.8" {...line}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" />
    <path d="M8 13h8M8 17h8M8 9h2" />
  </svg>
);

export const BoxIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" strokeWidth="1.8" {...line}>
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <path d="m3.3 7 8.7 5 8.7-5M12 22V12" />
  </svg>
);

export const EventIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" strokeWidth="1.8" {...line}>
    <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
  </svg>
);

export const ScissorsIcon = () => (
  <svg viewBox="0 0 24 24" width="17" height="17" strokeWidth="2" {...line}>
    <circle cx="6" cy="6" r="3" /><circle cx="6" cy="18" r="3" />
    <path d="M20 4 8.12 15.88M14.47 14.48 20 20M8.12 8.12 12 12" />
  </svg>
);

export const RobotIcon = () => (
  <svg viewBox="0 0 24 24" width="17" height="17" strokeWidth="1.9" {...line}>
    <path d="M12 2v3" /><circle cx="12" cy="2" r="1" fill="currentColor" stroke="none" />
    <rect x="4" y="7" width="16" height="12" rx="3" />
    <circle cx="9" cy="12.5" r="1.2" fill="currentColor" stroke="none" />
    <circle cx="15" cy="12.5" r="1.2" fill="currentColor" stroke="none" />
    <path d="M9.5 16h5M2 12v3M22 12v3" />
  </svg>
);

export const ResetIcon = () => (
  <svg viewBox="0 0 24 24" width="17" height="17" strokeWidth="2" {...line}>
    <path d="M3 12a9 9 0 1 0 3-6.7" /><path d="M3 4v5h5" />
  </svg>
);

export const FlagIcon = () => (
  <svg viewBox="0 0 24 24" width="17" height="17" strokeWidth="2" {...line}>
    <path d="M4 21V4" /><path d="M4 4h13l-2.2 3.5L17 11H4z" />
  </svg>
);

export const UndoIcon = () => (
  <svg viewBox="0 0 24 24" width="17" height="17" strokeWidth="2" {...line}>
    <path d="M3 7v6h6" /><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6.36 2.64L3 13" />
  </svg>
);

export const InfoIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" strokeWidth="2" {...line}>
    <circle cx="12" cy="12" r="9" /><path d="M12 11v5" /><path d="M12 7.6h.01" />
  </svg>
);

export const GlobeIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" strokeWidth="1.8" {...line}>
    <circle cx="12" cy="12" r="9" /><path d="M3 12h18" />
    <path d="M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18z" />
  </svg>
);

export const HelpIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" strokeWidth="2" {...line}>
    <circle cx="12" cy="12" r="9" />
    <path d="M9.2 9.3a2.9 2.9 0 0 1 5.6 1c0 1.9-2.8 2.4-2.8 4" />
    <path d="M12 17.4h.01" />
  </svg>
);

export const GearIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" strokeWidth="2" {...line}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

/* The fold arrow. It points down and turns half a turn when the card opens. */
export const ChevronIcon = ({ up = false }) => (
  <svg viewBox="0 0 24 24" width="14" height="14" strokeWidth="2.2" {...line}
       className={"transition-transform motion-reduce:transition-none " + (up ? "rotate-180" : "")}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);
