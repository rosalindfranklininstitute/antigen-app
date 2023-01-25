import { Container } from "@mui/material";
import { Route, Routes } from "react-router";
import { BrowserRouter } from "react-router-dom";
import AntigenView from "../antigen/individual";
import AntigensView from "../antigen/aggregate";
import { Header } from "./header";
import { HomeView } from "./home";
import "./main.css";
import AddUniProtAntigenView from "../antigen/addUniprot";
import AddLocalAntigenView from "../antigen/addLocal";
import NanobodiesView from "../nanobody/aggregate";
import NanobodyView from "../nanobody/individual";
import AddNanobodyView from "../nanobody/add";
import ElisaWellsView from "../elisa_well/aggregate";
import ElisaWellView from "../elisa_well/individual";
import ElisaPlatesView from "../elisa_plate/aggregate";
import ElisaPlateView from "../elisa_plate/individual";
import AddElisaPlateView from "../elisa_plate/add";
import ProjectsView from "../project/aggregate";
import ProjectView from "../project/individual";
import AddProjectView from "../project/add";

/**
 *
 * A react browser router containing the header and all routed pages of the
 * application, wrapped in a container
 *
 * @returns A react element containing all routed pages of the application
 */
function App(): JSX.Element {
  return (
    <BrowserRouter>
      <Header />
      <Container sx={{ mt: 4, mb: 4 }}>
        <Routes>
          <Route path="/" element={<HomeView />} />
          <Route path="/project/" element={<ProjectsView />} />
          <Route path="/project/:project" element={<ProjectView />} />
          <Route path="/project/add" element={<AddProjectView />} />
          <Route path="/antigen/:project::number" element={<AntigenView />} />
          <Route path="/antigen/" element={<AntigensView />} />
          <Route
            path="/antigen/uniprot/add/"
            element={<AddUniProtAntigenView />}
          />
          <Route path="/antigen/local/add/" element={<AddLocalAntigenView />} />
          <Route path="/nanobody/" element={<NanobodiesView />} />
          <Route path="/nanobody/:project::number" element={<NanobodyView />} />
          <Route path="/nanobody/add/" element={<AddNanobodyView />} />
          <Route path="/elisa_well/" element={<ElisaWellsView />} />
          <Route
            path="/elisa_well/:project::plate::location/"
            element={<ElisaWellView />}
          />
          <Route path="/elisa_plate/" element={<ElisaPlatesView />} />
          <Route
            path="/elisa_plate/:project::number"
            element={<ElisaPlateView />}
          />
          <Route path="/elisa_plate/add/" element={<AddElisaPlateView />} />
        </Routes>
      </Container>
    </BrowserRouter>
  );
}

export default App;
