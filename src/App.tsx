import React, { FC } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import RenderRouter from "./routes";
import 'react-toastify/dist/ReactToastify.css';
import { ThemeProvider } from './components/theme/theme-provider';
import AppContextProvider from './context/AppContextProvider';
import { ErrorBoundary } from "./components/ErrorBoundary";

const App: FC = (): React.ReactElement => {
  return (
    <ThemeProvider defaultTheme="system" storageKey="hewego-ui-theme">
      <AppContextProvider>
        <ErrorBoundary>
          <Router>
            <RenderRouter />
          </Router>
        </ErrorBoundary>
      </AppContextProvider>
    </ThemeProvider>
  );
};
export default App;
