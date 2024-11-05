// import {  useMemo } from "react";
import useStore from "../../hooks/useStore";
import { TableGrid } from "../../styles/styles";
import {
  differenceInDaysOmitTime,
  filterMultiDaySlot,
  // getHourFormat,
} from "../../helpers/generals";
import { MULTI_DAY_EVENT_HEIGHT } from "../../helpers/constants";
import { DefaultResource, ProcessedEvent } from "../../types";
import useSyncScroll from "../../hooks/useSyncScroll";
import { endOfDay, format, isAfter, isBefore, isSameDay, isToday, startOfDay } from "date-fns";
import TodayTypo from "../common/TodayTypo";
import usePosition from "../../positionManger/usePosition";
import EventItem from "../events/EventItem";
// import { Typography } from "@mui/material";
// import TodayEvents from "../events/TodayEvents";
// import Cell from "../common/Cell";

type Props = {
  daysList: Date[];
  hours: Date[];
  cellHeight: number;
  minutesHeight: number;
  resource?: DefaultResource;
  resourcedEvents: ProcessedEvent[];
};

const WeekTable = ({
  daysList,
  hours,
  cellHeight,
  minutesHeight,
  resourcedEvents,
  resource,
}: Props) => {
  const {
    week,
    // events,
    handleGotoDay,
    // resources,
    resourceFields,
    // resourceViewMode,
    // direction,
    locale,
    // hourFormat,
    timeZone,
    stickyNavigation,
  } = useStore();

  const {
    // startHour, endHour, step, cellRenderer,hourRenderer,
    disableGoToDay,
    headRenderer,
  } = week!;
  const { renderedSlots } = usePosition();
  const { headersRef } = useSyncScroll();
  const MULTI_SPACE = MULTI_DAY_EVENT_HEIGHT;
  const weekStart = startOfDay(daysList[0]);
  const weekEnd = endOfDay(daysList[daysList.length - 1]);
  // const hFormat = getHourFormat(hourFormat);

  // Equalizing multi-day section height except in resource/tabs mode
  // const headerHeight = useMemo(() => {
  //   const shouldEqualize = resources?.length && resourceViewMode === "default";
  //   const allWeekMulti = filterMultiDaySlot(
  //     shouldEqualize ? events : resourcedEvents,
  //     daysList,
  //     timeZone,
  //     true
  //   );
  //   return MULTI_SPACE * allWeekMulti.length + 45;
  // }, [
  //   MULTI_SPACE,
  //   daysList,
  //   events,
  //   resourceViewMode,
  //   resourcedEvents,
  //   resources.length,
  //   timeZone,
  // ]);

  const renderMultiDayEvents = (
    events: ProcessedEvent[],
    today: Date,
    resource?: DefaultResource
  ) => {
    const isFirstDayInWeek = isSameDay(weekStart, today);
    const allWeekMulti =
      events && events?.length > 0 && daysList && daysList?.length > 0 && timeZone
        ? filterMultiDaySlot(events, daysList, timeZone)
        : [];

    const multiDays = allWeekMulti
      ?.filter((e) =>
        isBefore(e?.start, weekStart) ? isFirstDayInWeek : isSameDay(e?.start, today)
      )
      .sort((a, b) => b?.end?.getTime() - a?.end?.getTime());
    return multiDays?.map((event) => {
      const hasPrev = isBefore(startOfDay(event.start), weekStart);
      const hasNext = isAfter(endOfDay(event.end), weekEnd);
      const eventLength =
        differenceInDaysOmitTime(hasPrev ? weekStart : event.start, hasNext ? weekEnd : event.end) +
        1;

      const day = format(today, "yyyy-MM-dd");
      const resourceId = resource ? resource[resourceFields.idField] : "all";
      const rendered = renderedSlots?.[resourceId]?.[day];
      const position = rendered?.[event.event_id] || 0;

      return (
        <div
          key={event?.event_id}
          className="rs__multi_day"
          style={{
            top: position * MULTI_SPACE + 45,
            width: `${99.9 * eventLength}%`,
            overflowX: "hidden",
          }}
        >
          <EventItem event={event} hasPrev={hasPrev} hasNext={hasNext} multiday />
        </div>
      );
    });
  };

  return (
    <>
      {/* Header days */}
      <TableGrid
        days={daysList.length}
        ref={headersRef}
        sticky="1"
        stickyNavigation={stickyNavigation}
      >
        <span className="rs__cell rs__time"></span>
        {daysList?.map((date, i) => (
          <span
            key={i}
            className={`rs__cell rs__header ${isToday(date) ? "rs__today_cell" : ""}`}
            // style={{ height: headerHeight }}
          >
            {typeof headRenderer === "function" ? (
              <div>{headRenderer(date)}</div>
            ) : (
              <TodayTypo
                date={date}
                onClick={!disableGoToDay ? handleGotoDay : undefined}
                locale={locale}
              />
            )}
            {renderMultiDayEvents(resourcedEvents, date, resource)}
          </span>
        ))}
      </TableGrid>
      {/* Time Cells */}
    </>
  );
};

export default WeekTable;
