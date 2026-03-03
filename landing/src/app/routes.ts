import { createHashRouter } from "react-router";
import { CoachView } from "./pages/CoachView";
import { AthleteProgram } from "./pages/AthleteProgram";
import { AthleteView } from "./pages/AthleteView";
import { DayDetail } from "./pages/DayDetail";

export const router = createHashRouter([
  {
    path: "/",
    Component: AthleteView,
  },
  {
    path: "/coach",
    Component: CoachView,
  },
  {
    path: "/coach/athlete/:athleteId",
    Component: AthleteProgram,
  },
  {
    path: "/coach/athlete/:athleteId/day/:dayIndex",
    Component: DayDetail,
  },
  {
    path: "/athlete",
    Component: AthleteView,
  },
]);