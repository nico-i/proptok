import { useEffect, useState } from "react";
import { CheckIcon, EditIcon, PostIcon, SaveIcon } from "../Icon/Icon";
import styles from "./ActionBar.module.css";

interface Props {
  // Identifies the current take; resets the save state per take.
  takeKey: string;
  // Opens the native share dialog for the take.
  onEdit?: () => void;
  onPost?: () => void;
}

export function ActionBar({ takeKey, onEdit, onPost }: Props) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(false);
  }, [takeKey]);

  return (
    <div className={styles.bar}>
      <button type="button" className={styles.action} onClick={onEdit}>
        <span className={styles.glyph}>
          <EditIcon />
        </span>
        Edit
      </button>
      <button type="button" className={styles.action} onClick={onPost}>
        <span className={styles.glyph}>
          <PostIcon />
        </span>
        Post
      </button>
      <button
        type="button"
        className={styles.action}
        aria-label={saved ? "Saved" : "Save to device"}
        onClick={() => setSaved(true)}
      >
        <span className={`${styles.glyph} ${saved ? styles.saved : ""}`}>
          {saved ? <CheckIcon /> : <SaveIcon />}
        </span>
        {saved ? "Saved" : "Save"}
      </button>
    </div>
  );
}
