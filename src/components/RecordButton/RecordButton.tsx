import styles from "./RecordButton.module.css";

interface Props {
  recording: boolean;
  disabled?: boolean;
  onTap: () => void;
}

export function RecordButton({ recording, disabled, onTap }: Props) {
  return (
    <button
      type="button"
      className={`${styles.button} ${recording ? styles.recording : ""}`}
      disabled={disabled}
      aria-pressed={recording}
      aria-label={recording ? "Stop recording" : "Start recording"}
      onClick={onTap}
    >
      <span className={styles.dot} />
    </button>
  );
}
