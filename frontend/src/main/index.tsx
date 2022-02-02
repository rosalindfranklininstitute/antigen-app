import { Route, Routes } from 'react-router';
import { BrowserRouter } from 'react-router-dom';
import { AntigensView, AntigenView } from './antigen';
import { Header } from './header';
import { HomeView } from "./home";
import logo from './logo.svg';
import './main.css';
import GithubLogin from '../auth/github';

function App() {
  return (
    <BrowserRouter>
      <Header logo={logo} title='Antigen App'/>
      <GithubLogin clientId="58e428dc6c5ba44e6374" scope="code" redirectUri="http://127.0.0.1:3000/"/>
      <div className='container'>
        <Routes>
          <Route path="/" element={<HomeView/>}/>
          <Route path="/antigen/:uuid" element={<AntigenView/>}/>
          <Route path="/antigens/" element={<AntigensView/>}/>
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
