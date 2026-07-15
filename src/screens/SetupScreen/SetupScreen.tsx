import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  deleteFeedVideo,
  listFeedVideos,
  newId,
  saveFeedVideo,
  toDataUrl,
  type FeedVideo,
} from "../../lib/storage";
import { buildFeedVideo, type FeedVideoInput } from "../../lib/feedVideo";
import { TrashIcon, UploadIcon } from "../../components/Icon/Icon";
import styles from "./SetupScreen.module.css";

interface FormState {
  username: string;
  description: string;
  soundName: string;
  likes: string;
  comments: string;
  shares: string;
  saves: string;
}

const emptyForm: FormState = {
  username: "",
  description: "",
  soundName: "",
  likes: "",
  comments: "",
  shares: "",
  saves: "",
};

// Blank count fields read as 0; buildFeedVideo clamps anything invalid.
function toInput(form: FormState): FeedVideoInput {
  const num = (v: string) => (v.trim() === "" ? 0 : Number(v));
  return {
    username: form.username,
    description: form.description,
    soundName: form.soundName,
    likes: num(form.likes),
    comments: num(form.comments),
    shares: num(form.shares),
    saves: num(form.saves),
  };
}

export function SetupScreen() {
  const [videos, setVideos] = useState<FeedVideo[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const refresh = () => listFeedVideos().then(setVideos);

  useEffect(() => {
    refresh();
  }, []);

  const setField = (key: keyof FormState) => (value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Choose a video file first.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const dataUrl = await toDataUrl(file);
      const video = buildFeedVideo(
        {
          id: newId(),
          dataUrl,
          mimeType: file.type || "video/mp4",
          createdAt: Date.now(),
          order: videos.length,
        },
        toInput(form),
      );
      await saveFeedVideo(video);
      setForm(emptyForm);
      setFile(null);
      if (fileRef.current) fileRef.current.value = "";
      await refresh();
    } catch {
      setError("Could not save the video. Try a smaller file.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteFeedVideo(id);
    await refresh();
  };

  return (
    <div className={styles.screen}>
      <header className={styles.header}>
        <h1 className={styles.title}>Feed setup</h1>
        <Link to="/" className={styles.viewFeed}>
          View feed
        </Link>
      </header>

      <form className={styles.form} onSubmit={handleSubmit}>
        <label className={styles.fileField}>
          <span className={styles.fileGlyph}>
            <UploadIcon />
          </span>
          <span className={styles.fileText}>
            {file ? file.name : "Choose video file"}
          </span>
          <input
            ref={fileRef}
            type="file"
            accept="video/*"
            className={styles.fileInput}
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </label>

        <input
          className={styles.input}
          placeholder="Username (e.g. grip_dept)"
          value={form.username}
          onChange={(e) => setField("username")(e.target.value)}
        />
        <textarea
          className={styles.input}
          placeholder="Description"
          rows={2}
          value={form.description}
          onChange={(e) => setField("description")(e.target.value)}
        />
        <input
          className={styles.input}
          placeholder="Sound name"
          value={form.soundName}
          onChange={(e) => setField("soundName")(e.target.value)}
        />

        <div className={styles.numbers}>
          <label className={styles.numField}>
            Likes
            <input
              type="number"
              inputMode="numeric"
              min={0}
              value={form.likes}
              onChange={(e) => setField("likes")(e.target.value)}
            />
          </label>
          <label className={styles.numField}>
            Comments
            <input
              type="number"
              inputMode="numeric"
              min={0}
              value={form.comments}
              onChange={(e) => setField("comments")(e.target.value)}
            />
          </label>
          <label className={styles.numField}>
            Shares
            <input
              type="number"
              inputMode="numeric"
              min={0}
              value={form.shares}
              onChange={(e) => setField("shares")(e.target.value)}
            />
          </label>
          <label className={styles.numField}>
            Saves
            <input
              type="number"
              inputMode="numeric"
              min={0}
              value={form.saves}
              onChange={(e) => setField("saves")(e.target.value)}
            />
          </label>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <button type="submit" className={styles.submit} disabled={saving}>
          {saving ? "Saving…" : "Add to feed"}
        </button>
      </form>

      <ul className={styles.list}>
        {videos.map((v) => (
          <li key={v.id} className={styles.row}>
            <video className={styles.thumb} src={v.dataUrl} muted />
            <div className={styles.rowInfo}>
              <div className={styles.rowUser}>{v.username}</div>
              <div className={styles.rowDesc}>
                {v.description || "No description"}
              </div>
            </div>
            <button
              type="button"
              className={styles.delete}
              aria-label={`Delete ${v.username}`}
              onClick={() => handleDelete(v.id)}
            >
              <TrashIcon />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
