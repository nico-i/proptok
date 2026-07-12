import type { SVGProps } from "react";
import styles from "./Icon.module.css";

type Props = SVGProps<SVGSVGElement>;

function base(props: Props) {
  return {
    viewBox: "0 0 24 24",
    className: styles.icon,
    "aria-hidden": true,
    ...props,
  } as const;
}

export function RecordIcon(props: Props) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="8" />
    </svg>
  );
}

export function SaveIcon(props: Props) {
  return (
    <svg {...base(props)}>
      <path d="M5 3h11l3 3v15a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm3 1v5h7V4H8zm4 8a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" />
    </svg>
  );
}

export function EditIcon(props: Props) {
  return (
    <svg {...base(props)}>
      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
    </svg>
  );
}

export function PostIcon(props: Props) {
  return (
    <svg {...base(props)}>
      <path d="M3 3l18 9-18 9 4-9-4-9zm4.5 9L5.6 6.3 15.9 12 5.6 17.7 7.5 12z" />
    </svg>
  );
}

export function CheckIcon(props: Props) {
  return (
    <svg {...base(props)}>
      <path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
    </svg>
  );
}

export function RerecordIcon(props: Props) {
  return (
    <svg {...base(props)}>
      <path d="M12 5V2L7 6l5 4V7a5 5 0 1 1-5 5H5a7 7 0 1 0 7-7z" />
    </svg>
  );
}

export function FlipCameraIcon(props: Props) {
  return (
    <svg {...base(props)}>
      <path d="M20 5h-3.2l-1.4-1.7A2 2 0 0 0 13.9 2.6h-3.8a2 2 0 0 0-1.5.7L7.2 5H4a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zM9 12l-2-2 2-2v1.5a4 4 0 0 1 3.9 4.9l-1.5-.7A2.5 2.5 0 0 0 9 11.2V12zm6 1l2 2-2 2v-1.5a4 4 0 0 1-3.9-4.9l1.5.7A2.5 2.5 0 0 0 15 13.8V13z" />
    </svg>
  );
}

export function FiltersIcon(props: Props) {
  return (
    <svg {...base(props)}>
      <circle cx="9" cy="9" r="6" opacity="0.85" />
      <circle cx="15" cy="15" r="6" opacity="0.55" />
    </svg>
  );
}

export function SpeedIcon(props: Props) {
  return (
    <svg {...base(props)}>
      <path d="M12 4a9 9 0 0 0-9 9 8.9 8.9 0 0 0 1.6 5.1 1 1 0 0 0 .8.4h13.2a1 1 0 0 0 .8-.4A8.9 8.9 0 0 0 21 13a9 9 0 0 0-9-9zm1 9a1 1 0 1 1-2 0c0-.7 2.7-4.5 2.9-4.3.2.2-.2 3.6-.9 4.3z" />
    </svg>
  );
}

export function TimerIcon(props: Props) {
  return (
    <svg {...base(props)}>
      <path d="M9 1h6v2H9zM12 5a8 8 0 1 0 0 16 8 8 0 0 0 0-16zm1 9h-2V8h2z" />
    </svg>
  );
}

export function MusicIcon(props: Props) {
  return (
    <svg {...base(props)}>
      <path d="M9 3v10.6A3.5 3.5 0 1 0 11 17V7h6V3z" />
    </svg>
  );
}

export function EffectsIcon(props: Props) {
  return (
    <svg {...base(props)}>
      <path d="M12 2l1.8 4.2L18 8l-4.2 1.8L12 14l-1.8-4.2L6 8l4.2-1.8zM5 14l1 2.2L8 17l-2 1-1 2-1-2-2-1 2-.8zm13 0l1 2.2 2 .8-2 1-1 2-1-2-2-1 2-.8z" />
    </svg>
  );
}

export function MediaIcon(props: Props) {
  return (
    <svg {...base(props)}>
      <path d="M4 4h16a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1zm2 12h12l-3.8-5-3 3.8L9 12zm2.5-6a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z" />
    </svg>
  );
}
