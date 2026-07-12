import { createBrowserRouter } from "react-router-dom";
import { CameraScreen } from "../screens/CameraScreen/CameraScreen";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <CameraScreen />,
  },
]);
