import { createTheme } from '@mui/material/styles';
let theme = createTheme({
    palette: {
      primary: {
        main: '#000000',
      },
      secondary: {
        main: '#64CCC5',
        contrastText: '#fff',
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
  export default theme;