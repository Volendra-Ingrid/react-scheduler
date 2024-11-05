// import * as React from "react";
// import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
// import ReactDOM from "react-dom/client";
// import App from "./App";

// const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
// root.render(
//   <React.StrictMode>
//     <ThemeProvider theme={createTheme()}>
//       <CssBaseline />
//       <App />
//     </ThemeProvider>
//   </React.StrictMode>
// );

import { forwardRef } from "react";
import SchedulerComponent from "./lib/SchedulerComponent";
import { Scheduler as SchedulerProps, SchedulerRef } from "./lib/types";
import { StoreProvider } from "./lib/store/provider";
import { enUS } from "date-fns/locale";

// const Scheduler = forwardRef<SchedulerRef, SchedulerProps>(function Scheduler(props, ref) {
//   return (
//     <StoreProvider initial={props}>
//       <SchedulerComponent ref={ref} />
//     </StoreProvider>
//   );
// });

// export { Scheduler };

const Scheduler = forwardRef<SchedulerRef, SchedulerProps>(function Scheduler(props, ref) {
  // console.log("Scheduler props", props);

  const locale = props.locale || enUS;

  return (
    <StoreProvider initial={{ ...props, locale }}>
      <SchedulerComponent ref={ref} />
    </StoreProvider>
  );
});

export { Scheduler };
