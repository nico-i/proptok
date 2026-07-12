import { useEffect, useState } from "react";
import { CheckIcon, EditIcon, PostIcon, SaveIcon } from "../Icon/Icon";
import styles from "./ActionBar.module.css";

interface Props {
  // Identifies the current take; resets the save state per take.
  takeKey: string;
  // Exports the take to device storage; resolves true when the user saved it.
  onSave: () => Promise<boolean>;
  onEdit?: () => void;
  onPost?: () => void;
}

export function ActionBar({ takeKey, onSave, onEdit, onPost }: Props) {
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setSaved(false);
    setBusy(false);
  }, [takeKey]);

  const handleSave = async () => {
    if (busy || saved) return;
    setBusy(true);
    try {
      if (await onSave()) setSaved(true);
    } finally {
      setBusy(false);
    }
  };

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
        disabled={busy}
        onClick={handleSave}
      >
        <span className={`${styles.glyph} ${saved ? styles.saved : ""}`}>
          {saved ? <CheckIcon /> : <SaveIcon />}
        </span>
        {saved ? "Saved" : "Save"}
      </button>
    </div>
  );
}
