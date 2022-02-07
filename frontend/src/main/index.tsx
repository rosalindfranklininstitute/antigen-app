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
import AddLocalAntigenView from '../antigen/addLocal';
import NanobodiesView from '../nanobody/aggregate';
import NanobodyView from '../nanobody/individual';
import AddNanobodyView from '../nanobody/add';
import ElisaWellsView from '../elisa_well/aggregate';
import ElisaWellView from '../elisa_well/individual';

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
          <Route path="/antigen/local/add/" element={<AddLocalAntigenView />} />
          <Route path="/nanobody/" element={<NanobodiesView />} />
          <Route path="/nanobody/:uuid" element={<NanobodyView />} />
          <Route path="/nanobody/add/" element={<AddNanobodyView />} />
          <Route path="/elisa_well/" element={<ElisaWellsView />} />
          <Route path="/elisa_well/:uuid" element={<ElisaWellView />} />
        </Routes>
      </Container>
    </BrowserRouter>
  );
}

export default App;
