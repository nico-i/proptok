import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  deleteFeedVideo,
  listFeedVideos,
  newId,
  reorderFeedVideos,
  saveFeedVideo,
  toDataUrl,
  updateFeedVideo,
  type FeedVideo,
} from "../../lib/storage";
import {
  buildFeedVideo,
  feedVideoToInput,
  type FeedVideoInput,
} from "../../lib/feedVideo";
import {
  DragHandleIcon,
  EditIcon,
  TrashIcon,
  UploadIcon,
} from "../../components/Icon/Icon";
import styles from "./SetupScreen.module.css";

interface SortableVideoRowProps {
  video: FeedVideo;
  onEdit: (video: FeedVideo) => void;
  onDelete: (id: string) => void;
}

function SortableVideoRow({ video, onEdit, onDelete }: SortableVideoRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: video.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : undefined,
  };

  return (
    <li ref={setNodeRef} className={styles.row} style={style}>
      <button
        type="button"
        className={styles.dragHandle}
        aria-label={`Reorder ${video.username}`}
        {...attributes}
        {...listeners}
      >
        <DragHandleIcon />
      </button>
      <video className={styles.thumb} src={video.dataUrl} muted />
      <div className={styles.rowInfo}>
        <div className={styles.rowUser}>{video.username}</div>
        <div className={styles.rowDesc}>
          {video.description || "No description"}
        </div>
      </div>
      <button
        type="button"
        className={styles.edit}
        aria-label={`Edit ${video.username}`}
        onClick={() => onEdit(video)}
      >
        <EditIcon />
      </button>
      <button
        type="button"
        className={styles.delete}
        aria-label={`Delete ${video.username}`}
        onClick={() => onDelete(video.id)}
      >
        <TrashIcon />
      </button>
    </li>
  );
}

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

function toFormState(video: FeedVideo): FormState {
  const input = feedVideoToInput(video);
  return {
    username: input.username,
    description: input.description,
    soundName: input.soundName,
    likes: String(input.likes),
    comments: String(input.comments),
    shares: String(input.shares),
    saves: String(input.saves),
  };
}

export function SetupScreen() {
  const [videos, setVideos] = useState<FeedVideo[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const refresh = () => listFeedVideos().then(setVideos);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = videos.findIndex((v) => v.id === active.id);
    const newIndex = videos.findIndex((v) => v.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const reordered = arrayMove(videos, oldIndex, newIndex);
    setVideos(reordered);
    await reorderFeedVideos(reordered.map((v) => v.id));
    await refresh();
  };

  useEffect(() => {
    refresh();
  }, []);

  const setField = (key: keyof FormState) => (value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const resetForm = () => {
    setForm(emptyForm);
    setFile(null);
    setEditingId(null);
    setError(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const startEdit = (video: FeedVideo) => {
    setEditingId(video.id);
    setForm(toFormState(video));
    setFile(null);
    setError(null);
    if (fileRef.current) fileRef.current.value = "";
    formRef.current?.scrollIntoView?.({ behavior: "smooth", block: "start" });
  };

  const editing = videos.find((v) => v.id === editingId) ?? null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing && !file) {
      setError("Choose a video file first.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const media = editing
        ? {
            id: editing.id,
            dataUrl: file ? await toDataUrl(file) : editing.dataUrl,
            mimeType: file ? file.type || "video/mp4" : editing.mimeType,
            createdAt: editing.createdAt,
            order: editing.order,
          }
        : {
            id: newId(),
            dataUrl: await toDataUrl(file as File),
            mimeType: (file as File).type || "video/mp4",
            createdAt: Date.now(),
            order: videos.length,
          };
      const video = buildFeedVideo(media, toInput(form));
      if (editing) {
        const { id: _id, ...patch } = video;
        void _id;
        await updateFeedVideo(editing.id, patch);
      } else {
        await saveFeedVideo(video);
      }
      resetForm();
      await refresh();
    } catch {
      setError("Could not save the video. Try a smaller file.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (id === editingId) resetForm();
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

      <form ref={formRef} className={styles.form} onSubmit={handleSubmit}>
        <label className={styles.fileField}>
          <span className={styles.fileGlyph}>
            <UploadIcon />
          </span>
          <span className={styles.fileText}>
            {file
              ? file.name
              : editing
                ? "Replace video file (optional)"
                : "Choose video file"}
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
          {saving ? "Saving…" : editing ? "Save changes" : "Add to feed"}
        </button>
        {editing && (
          <button
            type="button"
            className={styles.cancel}
            onClick={resetForm}
            disabled={saving}
          >
            Cancel
          </button>
        )}
      </form>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={videos.map((v) => v.id)}
          strategy={verticalListSortingStrategy}
        >
          <ul className={styles.list}>
            {videos.map((v) => (
              <SortableVideoRow
                key={v.id}
                video={v}
                onEdit={startEdit}
                onDelete={handleDelete}
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
    </div>
  );
}
