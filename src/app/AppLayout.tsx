import { Outlet, useLocation } from "react-router-dom";
import { BottomNav } from "../components/BottomNav/BottomNav";
import styles from "./AppLayout.module.css";

// The camera is a full-screen immersive capture surface (like TikTok's), so the
// bottom nav is hidden there; every other screen keeps it. Screens position
// themselves absolutely inside .content, which reserves nav space via padding.
export function AppLayout() {
  const { pathname } = useLocation();
  const showNav = pathname !== "/camera";

  return (
    <div className={styles.app}>
      <div className={showNav ? styles.content : styles.contentFull}>
        <Outlet />
      </div>
      {showNav && <BottomNav />}
    </div>
  );
}
