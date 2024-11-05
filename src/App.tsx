import { Scheduler } from "./lib";
import { EVENTS } from "./events";
import { useRef } from "react";
import { SchedulerRef } from "./lib/types";
import { Button } from "@vechaiui/react";

function App() {
  const calendarRef = useRef<SchedulerRef>(null);

  return (
    <Scheduler
      ref={calendarRef}
      events={EVENTS}
      height={2000}
      view="month"
      month={{
        weekDays: [0, 1, 2, 3, 4, 5, 6],
        weekStartOn: 0,
        startHour: 0,
        endHour: 24,
        cellRenderer: ({ onClick, ...props }) => {
          // console.log('cellRenderer props', props);
          return (
            <Button
              style={{
                height: "100%",
              }}
              onClick={() => {
                onClick();
                alert("clicked");
              }}
              // disabled={disabled}
              {...props}
            ></Button>
          );
        },
      }}
      // events={generateRandomEvents(200)}
    />
  );
}

export default App;
