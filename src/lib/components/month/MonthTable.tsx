import { Avatar, Typography, useTheme } from "@mui/material";
import {
  addDays,
  endOfDay,
  format,
  isSameDay,
  isSameMonth,
  isWithinInterval,
  setHours,
  startOfDay,
  startOfMonth,
} from "date-fns";
import { Fragment, useCallback } from "react";
import {
  getHourFormat,
  getRecurrencesForDate,
  getResourcedEvents,
  isTimeZonedToday,
  sortEventsByTheEarliest,
} from "../../helpers/generals";
import useStore from "../../hooks/useStore";
import useSyncScroll from "../../hooks/useSyncScroll";
import { TableGrid } from "../../styles/styles";
import { DefaultResource } from "../../types";
import Cell from "../common/Cell";
import MonthEvents from "../events/MonthEvents";
// import DayPopup from "../../views/DayPopup";
// import Editor from "../../views/Editor";

type Props = {
  daysList: Date[];
  resource?: DefaultResource;
  eachWeekStart: Date[];
};

const MonthTable = ({ daysList, resource, eachWeekStart }: Props) => {
  const {
    height,
    month,
    selectedDate,
    events,
    handleGotoDay,
    // handleGotoDayPopup,
    resourceFields,
    fields,
    locale,
    hourFormat,
    stickyNavigation,
    timeZone,
    // dialog,
    onClickMore,
  } = useStore();
  const { weekDays, startHour, endHour, cellRenderer, headRenderer, disableGoToDay } = month!;
  const { headersRef, bodyRef } = useSyncScroll();
  // const [showDayPopup, setShowDayPopup] = useState(false);

  const theme = useTheme();
  const monthStart = startOfMonth(selectedDate);
  const hFormat = getHourFormat(hourFormat);
  const CELL_HEIGHT = height / eachWeekStart.length;

  const renderCells = useCallback(
    (resource?: DefaultResource) => {
      // console.log(" CELL_HEIGHT" , CELL_HEIGHT,
      // "cellRenderer", cellRenderer,
      // "daysList", daysList,
      // "disableGoToDay", disableGoToDay,
      // "eachWeekStart", eachWeekStart,
      // "endHour", endHour,
      // "events", events,
      // "fields", fields,
      // "hFormat", hFormat,
      // "handleGotoDay", handleGotoDay,
      // "headRenderer", headRenderer,
      // "monthStart", monthStart,
      // "onClickMore", onClickMore,
      // "resourceFields", resourceFields,
      // "selectedDate", selectedDate,
      // "startHour", startHour,
      // "theme.palette.secondary.contrastText", theme.palette.secondary.contrastText,
      // "theme.palette.secondary.main", theme.palette.secondary.main,
      // "timeZone", timeZone,
      // "weekDays", weekDays);
      let resourcedEvents = sortEventsByTheEarliest(events);
      if (resource) {
        resourcedEvents = getResourcedEvents(events, resource, resourceFields, fields);
      }
      // console.log("resourcedEvents", resourcedEvents);
      const rows: JSX.Element[] = [];

      for (const startDay of eachWeekStart) {
        const cells = weekDays.map((d) => {
          const today = addDays(startDay, d);
          const start = new Date(`${format(setHours(today, startHour), `yyyy/MM/dd ${hFormat}`)}`);
          const end = new Date(`${format(setHours(today, endHour), `yyyy/MM/dd ${hFormat}`)}`);
          const field = resourceFields.idField;
          const eachFirstDayInCalcRow = isSameDay(startDay, today) ? today : null;
          const todayEvents = resourcedEvents
            .flatMap((e) => getRecurrencesForDate(e, today))
            .filter((e) => {
              if (isSameDay(e.start, today)) return true;
              const dayInterval = { start: startOfDay(e.start), end: endOfDay(e.end) };
              if (eachFirstDayInCalcRow && isWithinInterval(eachFirstDayInCalcRow, dayInterval))
                return true;
              return false;
            });
          const isToday = isTimeZonedToday({ dateLeft: today, timeZone });
          return (
            <span
              style={{ height: CELL_HEIGHT }}
              key={d.toString()}
              className="rs__cell"
              onClick={(e) => {
                e.stopPropagation();
                if (!disableGoToDay) {
                  handleGotoDay(today);
                }
              }}
              // onMouseEnter={(e) => {
              //   e.stopPropagation();
              //   if (!disableGoToDay) {
              //     handleGotoDayPopup(today);
              //   }

              //   setShowDayPopup(true);
              // }}
              // onClick={(e) => {
              //   e.stopPropagation();
              //   if (!disableGoToDay) {
              //     handleGotoDayPopup(today);
              //   }

              //   setShowDayPopup(true);
              // }}
              // onMouseLeave={(e) => {
              //   e.stopPropagation();
              //   if (!disableGoToDay) {
              //     handleGotoDayPopup(today);
              //   }
              //   setShowDayPopup(false);
              // }}
            >
              <Cell
                start={start}
                end={end}
                day={selectedDate}
                height={CELL_HEIGHT}
                resourceKey={field}
                resourceVal={resource ? resource[field] : null}
                cellRenderer={cellRenderer}
              />
              <Fragment>
                {typeof headRenderer === "function" ? (
                  <div style={{ position: "absolute", top: 0 }}>{headRenderer(today)}</div>
                ) : (
                  <Avatar
                    style={{
                      width: 27,
                      height: 27,
                      position: "absolute",
                      top: 0,
                      // background: isToday ? theme.palette.secondary.main : "transparent",
                      background: "transparent",
                      color: isToday ? theme.palette.secondary.contrastText : "",
                      marginBottom: 2,
                    }}
                  >
                    <Typography
                      color={!isSameMonth(today, monthStart) ? "#ccc" : "textPrimary"}
                      className={!disableGoToDay ? "rs__hover__op" : ""}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!disableGoToDay) {
                          // console.log("today, hadleGotopay calledinside monthtable", today);
                          handleGotoDay(today);
                        }
                      }}
                    >
                      {format(today, "dd")}
                    </Typography>
                  </Avatar>
                )}

                <MonthEvents
                  events={todayEvents}
                  resourceId={resource?.[field]}
                  today={today}
                  eachWeekStart={eachWeekStart}
                  eachFirstDayInCalcRow={eachFirstDayInCalcRow}
                  daysList={daysList}
                  onViewMore={(e) => {
                    onClickMore && typeof onClickMore === "function"
                      ? onClickMore(e, handleGotoDay)
                      : handleGotoDay(e);
                  }}
                  cellHeight={CELL_HEIGHT}
                />
              </Fragment>
            </span>
          );
        });
        // console.log('cells', cells);
        rows.push(<Fragment key={startDay.toString()}>{cells}</Fragment>);
      }
      return rows;
    },
    [
      CELL_HEIGHT,
      cellRenderer,
      daysList,
      disableGoToDay,
      eachWeekStart,
      endHour,
      events,
      fields,
      hFormat,
      handleGotoDay,
      headRenderer,
      monthStart,
      onClickMore,
      resourceFields,
      selectedDate,
      startHour,
      theme.palette.secondary.contrastText,
      // theme.palette.secondary.main,
      timeZone,
      weekDays,
    ]
  );
  // console.log("daysList", daysList);
  // console.log("eachWeekStart", eachWeekStart);
  // console.log("resource", resource);
  return (
    <>
      {/* Header Days */}
      <TableGrid
        days={daysList.length}
        ref={headersRef}
        indent="0"
        sticky="1"
        stickyNavigation={stickyNavigation}
      >
        {daysList.map((date, i) => (
          <Typography
            key={i}
            className="rs__cell rs__header rs__header__center"
            align="center"
            variant="body2"
          >
            {format(date, "EE", { locale })}
          </Typography>
        ))}
      </TableGrid>
      {/* Time Cells */}
      <TableGrid days={daysList.length} ref={bodyRef} indent="0">
        {renderCells(resource)}
      </TableGrid>
      {/* {showDayPopup && selectedDate && (
        // <DayPopup/>
        <Editor/>
      )} */}
    </>
  );
};

export default MonthTable;
