import { NavLink } from "react-router-dom";
import {
  DiscoverIcon,
  HomeIcon,
  InboxIcon,
  PlusBoxIcon,
  ProfileIcon,
} from "../Icon/Icon";
import styles from "./BottomNav.module.css";

// Five-slot parody nav. Home (feed), Post (camera) and Profile (setup) navigate;
// Discover and Inbox are cosmetic props with no destination, mirroring TikTok's
// chrome without wiring features that don't exist.
export function BottomNav() {
  return (
    <nav className={styles.nav} aria-label="Primary">
      <NavLink to="/" className={linkClass} aria-label="Home" end>
        <HomeIcon />
      </NavLink>

      <button type="button" className={styles.tab} aria-label="Discover">
        <DiscoverIcon />
      </button>

      <NavLink to="/camera" className={styles.postTab} aria-label="Post">
        <span className={styles.postGlyph}>
          <PlusBoxIcon />
        </span>
      </NavLink>

      <button type="button" className={styles.tab} aria-label="Inbox">
        <InboxIcon />
      </button>

      <NavLink to="/setup" className={linkClass} aria-label="Profile">
        <ProfileIcon />
      </NavLink>
    </nav>
  );
}

function linkClass({ isActive }: { isActive: boolean }): string {
  return isActive ? `${styles.tab} ${styles.active}` : styles.tab;
}
