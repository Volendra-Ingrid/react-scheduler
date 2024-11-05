import { DragEvent } from "react";
import { alpha, useTheme } from "@mui/material";
import useStore from "./useStore";
import { revertTimeZonedDate } from "../helpers/generals";

interface Props {
  start: Date;
  end: Date;
  resourceKey: string;
  resourceVal: string | number;
}
export const useCellAttributes = ({ start, end, resourceKey, resourceVal }: Props) => {
  const {
    triggerDialog,
    onCellClick,
    onDrop,
    currentDragged,
    setCurrentDragged,
    editable,
    timeZone,
  } = useStore();
  const theme = useTheme();

  return {
    tabIndex: editable ? 0 : -1,
    disableRipple: !editable,
    onClick: () => {
      if (editable) {
        // triggerDialog(true, {
        //   start,
        //   end,
        //   [resourceKey]: resourceVal,
        // });
        // SET TO FALSE FOR THE MEANTIME, TO AVOID POPUP FOR DAY VIEW
        triggerDialog(false, {
          start,
          end,
          [resourceKey]: resourceVal,
        });
      }

      // console.log("resource key", resourceKey);
      // console.log("resouce val", resourceVal);
      // console.log("start", start);
      // console.log("end", end);

      if (onCellClick && typeof onCellClick === "function") {
        onCellClick(start, end, resourceKey, resourceVal);
      }
    },
    onDragOver: (e: DragEvent<HTMLButtonElement>) => {
      e.preventDefault();
      if (currentDragged) {
        e.currentTarget.style.backgroundColor = alpha(theme.palette.secondary.main, 0.3);
      }
    },
    onDragEnter: (e: DragEvent<HTMLButtonElement>) => {
      if (currentDragged) {
        e.currentTarget.style.backgroundColor = alpha(theme.palette.secondary.main, 0.3);
      }
    },
    onDragLeave: (e: DragEvent<HTMLButtonElement>) => {
      if (currentDragged) {
        e.currentTarget.style.backgroundColor = "";
      }
    },
    onDrop: (e: DragEvent<HTMLButtonElement>) => {
      if (currentDragged && currentDragged.event_id) {
        e.preventDefault();
        e.currentTarget.style.backgroundColor = "";
        const zonedStart = revertTimeZonedDate(start, timeZone);
        onDrop(e, currentDragged.event_id.toString(), zonedStart, resourceKey, resourceVal);
        setCurrentDragged();
      }
    },
    [resourceKey]: resourceVal,
  };
};
