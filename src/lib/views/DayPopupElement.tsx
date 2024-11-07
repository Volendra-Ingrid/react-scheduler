import { useEffect, useCallback, useMemo } from "react";
import { CircularProgress, Typography } from "@mui/material";
import {
  // format,
  eachMinuteOfInterval,
  isToday,
  isBefore,
  isAfter,
  startOfDay,
  endOfDay,
  addDays,
  // addMinutes,
  set,
} from "date-fns";
import TodayTypo from "../components/common/TodayTypo";
import EventItem from "../components/events/EventItem";
import { CellRenderedProps, DayHours, DefaultResource, ProcessedEvent } from "../types";
import {
  calcCellHeight,
  calcMinuteHeight,
  filterMultiDaySlot,
  filterTodayEvents,
  // getHourFormat,
  getResourcedEvents,
} from "../helpers/generals";
import { WithResources } from "../components/common/WithResources";
// import Cell from "../components/common/Cell";
import TodayEvents from "../components/events/TodayEvents";
import { TableGrid } from "../styles/styles";
import { MULTI_DAY_EVENT_HEIGHT } from "../helpers/constants";
import useStore from "../hooks/useStore";
import { DayAgenda } from "./DayAgenda";
// import { isArray } from "@vechaiui/react";

export interface DayProps {
  startHour: DayHours;
  endHour: DayHours;
  step: number;
  cellRenderer?(props: CellRenderedProps): JSX.Element;
  headRenderer?(day: Date): JSX.Element;
  hourRenderer?(hour: string): JSX.Element;
  navigation?: boolean;
}

// This is a modification of the Day module
const DayPopupElement = () => {
  const {
    day,
    selectedDate,
    events,
    height,
    getRemoteEvents,
    triggerLoading,
    handleState,
    resources,
    resourceFields,
    resourceViewMode,
    fields,
    direction,
    locale,
    loading,
    loadingComponent,
    translations,
    // hourFormat,
    timeZone,
    stickyNavigation,
    agenda,
  } = useStore();

  // useEffect(() => {
  //   console.log("selected date in day", selectedDate);
  // }, [selectedDate]);

  const { startHour, endHour, step, headRenderer } = day!;
  const START_TIME = set(selectedDate, { hours: startHour, minutes: 0, seconds: 0 });
  const END_TIME = set(selectedDate, { hours: endHour, minutes: -step, seconds: 0 });
  const hours = eachMinuteOfInterval(
    {
      start: START_TIME,
      end: END_TIME,
    },
    { step: step }
  );
  const CELL_HEIGHT = calcCellHeight(height, hours.length);
  const MINUTE_HEIGHT = calcMinuteHeight(CELL_HEIGHT, step);
  // const hFormat = getHourFormat(hourFormat);

  const LoadingComp = useMemo(() => {
    return (
      <div className="rs__table_loading">
        {loadingComponent || (
          <div className="rs__table_loading_internal">
            <span>
              <CircularProgress size={50} />
              <Typography align="center">{translations.loading}</Typography>
            </span>
          </div>
        )}
      </div>
    );
  }, [loadingComponent, translations.loading]);

  const fetchEvents = useCallback(async () => {
    try {
      triggerLoading(true);
      const start = addDays(START_TIME, -1);
      const end = addDays(END_TIME, 1);
      const events = await getRemoteEvents!({
        start,
        end,
        view: "day",
      });
      if (events && events?.length) {
        handleState(events, "events");
      }
    } catch (error) {
      throw error;
    } finally {
      triggerLoading(false);
    }
    // eslint-disable-next-line
  }, [selectedDate, getRemoteEvents]);

  useEffect(() => {
    if (getRemoteEvents instanceof Function) {
      fetchEvents();
    }
  }, [fetchEvents, getRemoteEvents]);

  const renderMultiDayEvents = (events: ProcessedEvent[]) => {
    const todayMulti = filterMultiDaySlot(events, selectedDate, timeZone);
    return (
      <>
        {todayMulti && todayMulti?.length > 0 && (
          <div
            className="rs__block_col"
            style={{ height: MULTI_DAY_EVENT_HEIGHT * todayMulti?.length,  }}
          >
            {todayMulti?.map((event, i) => {
              const hasPrev = isBefore(event?.start, startOfDay(selectedDate));
              const hasNext = isAfter(event?.end, endOfDay(selectedDate));
              return (
                <div
                  key={event?.event_id}
                  className="rs__multi_day popup"
                  style={{
                    top: i * MULTI_DAY_EVENT_HEIGHT,
                    width: "99.9%",
                    overflowX: "hidden",
                    marginBottom: "5px",
                  }}
                >
                  <EventItem event={event} multiday hasPrev={hasPrev} hasNext={hasNext} popup={true} />
                </div>
              );
            })}
          </div>
        )}
      </>
    );
  };

  const renderTable = (resource?: DefaultResource) => {
    let resourcedEvents = events;
    if (resource) {
      resourcedEvents = getResourcedEvents(events, resource, resourceFields, fields);
    }

    if (agenda) {
      return <DayAgenda events={resourcedEvents} />;
    }

    // Equalizing multi-day section height
    const shouldEqualize = resources.length && resourceViewMode === "default";
    const allWeekMulti = filterMultiDaySlot(
      shouldEqualize ? events : resourcedEvents,
      selectedDate,
      timeZone
    );
    const headerHeight = MULTI_DAY_EVENT_HEIGHT * allWeekMulti.length + 45;
    return (
      <>
      <div style={{paddingBottom: "5px", paddingLeft: "5px", paddingRight: "5px"}}>
      {loading ? LoadingComp : null}
        {/* Header */}
        {!loading && selectedDate && locale && headerHeight && (
         
            
         <div style={{ gap: "1rem", maxHeight: "401px" , paddingBottom: "5px", overflowY: "scroll"}}>
             <span
              className={`rs__cell rs__header ${isToday(selectedDate) ? "rs__today_cell" : ""}`}
            >
              {/* {typeof headRenderer === "function" ? (
                <div>{headRenderer(selectedDate)}</div>
              ) : (
                <TodayTypo date={selectedDate} locale={locale} />
              )} */}
              {resourcedEvents && resourcedEvents?.length > 0 && selectedDate && timeZone
                ? renderMultiDayEvents(resourcedEvents)
                : null}
            </span>
         </div>
          
        )}

        {/* Can be deleted below:  */}
        <TableGrid days={1}>
         
          {selectedDate && (
            <span className={`rs__cell ${isToday(selectedDate) ? "rs__today_cell" : ""}`}>
              {resourcedEvents &&
                selectedDate &&
                timeZone &&
                START_TIME &&
                MINUTE_HEIGHT &&
                startHour &&
                endHour &&
                step &&
                direction && (
                  <TodayEvents
                    todayEvents={filterTodayEvents(resourcedEvents, selectedDate, timeZone)}
                    today={START_TIME}
                    minuteHeight={MINUTE_HEIGHT}
                    startHour={startHour}
                    endHour={endHour}
                    step={step}
                    direction={direction}
                    timeZone={timeZone}
                  />
                )}
             
            </span>
          )}
         
        </TableGrid>
      </div>
      </>
    );
  };

  return resources.length ? <WithResources renderChildren={renderTable} /> : renderTable();
};

export { DayPopupElement };