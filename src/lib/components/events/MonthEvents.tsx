import { Fragment, useMemo } from "react";
import {
  closestTo,
  isBefore,
  startOfWeek,
  differenceInDays,
  differenceInCalendarWeeks,
  format,
} from "date-fns";
import { ProcessedEvent } from "../../types";
import { Typography } from "@mui/material";
import EventItem from "./EventItem";
import {
  MONTH_BAR_HEIGHT,
  MONTH_NUMBER_HEIGHT,
  MULTI_DAY_EVENT_HEIGHT,
} from "../../helpers/constants";
import { convertEventTimeZone, differenceInDaysOmitTime } from "../../helpers/generals";
import useStore from "../../hooks/useStore";
import usePosition from "../../positionManger/usePosition";

interface MonthEventProps {
  events: ProcessedEvent[];
  resourceId?: string;
  today: Date;
  eachWeekStart: Date[];
  eachFirstDayInCalcRow: Date | null;
  daysList: Date[];
  onViewMore(day: Date): void;
  cellHeight: number;
}

const MonthEvents = ({
  events,
  resourceId,
  today,
  eachWeekStart,
  eachFirstDayInCalcRow,
  daysList,
  onViewMore,
  cellHeight,
}: MonthEventProps) => {
  const LIMIT = Math.round((cellHeight - MONTH_NUMBER_HEIGHT) / MULTI_DAY_EVENT_HEIGHT - 1);
  // console.log("LIMIT", LIMIT);
  // console.log("EVENTS.LENGTH", events.length);
  // console.log("EVENTS", events);
  const { translations, month, locale, timeZone } = useStore();
  const { renderedSlots } = usePosition();

  const renderEvents = useMemo(() => {
    const elements: JSX.Element[] = [];

    // console.log("today events", events);
    // console.log("today", today);

    // for (let i = 0; i < Math.min(events.length, LIMIT + 1); i++) {
      for (let i = 0; i < events.length; i++) {
      // console.log("INSIDE");
      const event = convertEventTimeZone(events[i], timeZone);
      const fromPrevWeek = !!eachFirstDayInCalcRow && isBefore(event.start, eachFirstDayInCalcRow);
      const start = fromPrevWeek && eachFirstDayInCalcRow ? eachFirstDayInCalcRow : event.start;
      let eventLength = differenceInDaysOmitTime(start, event.end) + 1;

      const toNextWeek =
        differenceInCalendarWeeks(event.end, start, {
          weekStartsOn: month?.weekStartOn,
          locale,
        }) > 0;

      if (toNextWeek) {
        // Rethink it
        const NotAccurateWeekStart = startOfWeek(event.start, {
          weekStartsOn: month?.weekStartOn,
          locale,
        });
        const closestStart = closestTo(NotAccurateWeekStart, eachWeekStart);
        if (closestStart) {
          eventLength =
            daysList.length -
            (!eachFirstDayInCalcRow ? differenceInDays(event.start, closestStart) : 0);
        }
      }

      const day = format(today, "yyyy-MM-dd");
      const rendered = renderedSlots?.[resourceId || "all"]?.[day];
      const position = rendered?.[event.event_id] || 0;

      const topSpace = Math.min(position, LIMIT) * MULTI_DAY_EVENT_HEIGHT + MONTH_NUMBER_HEIGHT;

      if (position >= LIMIT) {
        elements.push(
          <Typography
            key={i}
            width="100%"
            className="rs__multi_day rs__hover__op"
            style={{ top: topSpace, fontSize: 11 }}
            onClick={(e) => {
              e.stopPropagation();
              onViewMore(event.start);
            }}
          >
            {`${Math.abs(events.length - i)} ${translations.moreEvents}`}
          </Typography>
        );
        break;
      }

      elements.push(
        <div
          key={`${event.event_id}_${i}`}
          className={`rs__multi_day ${eventLength > 1? "multiple": "single"}`}
          style={{
            top: topSpace,
            width: `${100 * eventLength}%`,
            height: MONTH_BAR_HEIGHT,
            backgroundColor: eventLength > 1?"rgb(211, 173, 237)": " rgb(253, 208, 255)"
          }}
        >
          <EventItem
            event={event}
            showdate={false}
            multiday={differenceInDaysOmitTime(event.start, event.end) > 0}
            hasPrev={fromPrevWeek}
            hasNext={toNextWeek}
          />
        </div>
      );
    }

    return elements;
  }, [
    resourceId,
    renderedSlots,
    events,
    LIMIT,
    eachFirstDayInCalcRow,
    month?.weekStartOn,
    locale,
    today,
    eachWeekStart,
    daysList.length,
    translations.moreEvents,
    onViewMore,
    timeZone,
  ]);

  return <Fragment>{renderEvents}</Fragment>;
};

export default MonthEvents;
