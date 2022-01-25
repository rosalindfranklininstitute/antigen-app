import { Route, Routes } from 'react-router';
import { BrowserRouter } from 'react-router-dom';
import { AntigensView, AntigenView } from './antigen';
import { Header } from './header';
import { HomeView } from "./home";
import logo from './logo.svg';
import './main.css';

function App() {
  return (
    <BrowserRouter>
      <Header logo={logo} title='Antigen App' />
      <div className='container'>
        <Routes>
          <Route path="/" element={<HomeView />} />
          <Route path="/antigen/:uuid" element={<AntigenView />} />
          <Route path="/antigens/" element={<AntigensView />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
