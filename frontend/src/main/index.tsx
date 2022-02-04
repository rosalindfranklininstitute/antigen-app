import { Container } from '@mui/material';
import { Route, Routes } from 'react-router';
import { BrowserRouter } from 'react-router-dom';
import AntigenView from '../antigen/individual';
import AntigensView from '../antigen/aggregate';
import { Header } from './header';
import { HomeView } from "./home";
import logo from './logo.svg';
import './main.css';
import AddUniProtAntigenView from '../antigen/addUniprot';

function App() {
  return (
    <BrowserRouter>
      <Header logo={logo} title='Antigen App' />
      <Container sx={{ mt: 4, mb: 4 }}>
        <Routes>
          <Route path="/" element={<HomeView />} />
          <Route path="/antigen/:uuid" element={<AntigenView />} />
          <Route path="/antigen/" element={<AntigensView />} />
          <Route path="/antigen/uniprot/add/" element={<AddUniProtAntigenView />} />
        </Routes>
      </Container>
    </BrowserRouter>
  );
}

export default App;
