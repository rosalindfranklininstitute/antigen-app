import {
  Card,
  CardContent,
  TextField,
  Typography,
  Stack,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Autocomplete,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import SendIcon from "@mui/icons-material/Send";
import { useEffect, useState } from "react";
import { AntigenInfo } from "./utils";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useDispatch, useSelector } from "react-redux";
import {
  postLocalAntigen,
  selectLoadingAntigen,
  selectPostedLocalAntignes,
} from "./slice";
import {
  getProjects,
  selectCurrentProject,
  selectProjects,
} from "../project/slice";
import { Project } from "../project/utils";

/**
 *
 * A MUI Card containing a form for adding a new local antigen; the form
 * consists of a dropdown to select the project which it corresponds to,
 * defaulting to the active project, a text field to enter the antigen
 * sequence, a numeric text field to enter the molecular mass and a submit
 * button which when pressed dispatches a request to store the antigen and
 * appends it to a list of local antigens created this session. Available
 * projects are retrieved from the redux store with a dispatch executed to
 * obtain them if unavailable
 *
 * @returns A MUI card containing a form for adding a new antigen
 */
export default function AddLocalAntigenView() {
  const dispatch = useDispatch();
  const antigens = useSelector(selectPostedLocalAntignes);
  const loading = useSelector(selectLoadingAntigen);
  const projects = useSelector(selectProjects);
  const currentProject = useSelector(selectCurrentProject);
  const [project, setProject] = useState<Project | undefined>(currentProject);
  const [sequence, setSequence] = useState<string>("");
  const [molecularMass, setMolecularMass] = useState<number>(0);

  useEffect(() => {
    dispatch(getProjects());
  }, [dispatch]);

  useEffect(() => {
    setProject(currentProject);
  }, [currentProject]);

  const submit = () => {
    if (project)
      dispatch(
        postLocalAntigen({
          project: project.short_title,
          sequence,
          molecular_mass: molecularMass,
        })
      );
  };

  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <Typography variant="h4">Add new antigen</Typography>
          <Stack direction="row" spacing={2}>
            <Autocomplete
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Project"
                  sx={{ width: "32ch" }}
                  variant="filled"
                />
              )}
              value={project}
              options={projects}
              getOptionLabel={(project) => project.short_title}
              onChange={(_, project) =>
                setProject(project ? project : undefined)
              }
            />
            <TextField
              required
              label="Sequence"
              value={sequence}
              onChange={(evt) => {
                setSequence(evt.target.value);
              }}
            />
            <TextField
              required
              label="Molecular Mass"
              type="number"
              value={molecularMass}
              onChange={(evt) => {
                setMolecularMass(Number(evt.target.value));
              }}
            />
            <LoadingButton
              variant="contained"
              loading={loading}
              endIcon={<SendIcon />}
              onClick={submit}
            >
              Submit
            </LoadingButton>
          </Stack>
          {antigens.map((antigen) => (
            <div>
              <Divider />
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  {antigen.name}
                </AccordionSummary>
                <AccordionDetails>
                  <AntigenInfo antigen={antigen} />
                </AccordionDetails>
              </Accordion>
            </div>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}
