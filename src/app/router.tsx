import { createBrowserRouter } from "react-router-dom";
import { AppLayout } from "./AppLayout";
import { FeedScreen } from "../screens/FeedScreen/FeedScreen";
import { CameraScreen } from "../screens/CameraScreen/CameraScreen";
import { SetupScreen } from "../screens/SetupScreen/SetupScreen";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <FeedScreen /> },
      { path: "camera", element: <CameraScreen /> },
      { path: "setup", element: <SetupScreen /> },
    ],
  },
]);
