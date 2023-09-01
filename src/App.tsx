import { FC } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import RenderRouter from './routes';
import { ThemeProvider } from '@mui/material/styles';
import theme from './utils/theme/theme';

const App: FC = (): JSX.Element => {
  return (
    <ThemeProvider theme={theme}>
    <Router>
        <RenderRouter />
    </Router>
    </ThemeProvider>
  );
};
export default App;
