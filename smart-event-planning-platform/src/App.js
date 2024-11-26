import './App.css';
import { BrowserRouter,Switch, Route } from 'react-router-dom';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Login from '../src/components/login/Login';


const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

function App() {
  return (
    <div className="App">

      <ThemeProvider theme={darkTheme}>
          <CssBaseline />   
          <Login></Login>    
      </ThemeProvider>
      

    </div>
  );
}

export default App;
