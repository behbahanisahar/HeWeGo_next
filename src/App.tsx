import { FC } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import RenderRouter from './routes';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const App: FC = (): JSX.Element => {
  let theme = createTheme({
    palette: {
      primary: {
        main: '#001C30',
      },
      secondary: {
        main: '#64CCC5',
      },
    },
    
  });
  
  theme = createTheme(theme, {
    palette: {
      info: {
        main: theme.palette.secondary.main,
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
    <Router>
        <RenderRouter />
    </Router>
    </ThemeProvider>
  );
};
export default App;
