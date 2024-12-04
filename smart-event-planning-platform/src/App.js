import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from '../src/components/login/Login';
import Signup from '../src/components/login/Signup';
import Home from '../src/components/event/Home';
import Profile from './components/profile/Profile';
import EventProfile from './components/profile/EventProfile';

//<Route exact path='/home/:userId' Component={Home}></Route>
function App() {
  return (
    <div className="App">
          <BrowserRouter>
            <Routes>
              <Route exact path='/login' Component={Login}></Route>
              <Route exact path='/signup' Component={Signup}></Route>
              <Route exact path='/profile/:userId' element={<div className="profile-page"><Profile /></div>} />
              <Route exact path='/profile/eventprofile/:userId' element={<div className="profile-page"><EventProfile /></div>} />
              <Route exact path='/home/:userId' element={<div className="home-page"><Home /></div>} />             
              
            </Routes>
          </BrowserRouter>
    </div>
  );
}

export default App;
