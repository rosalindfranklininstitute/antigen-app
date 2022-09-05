import {
  Card,
  CardContent,
  TextField,
  Typography,
  Stack,
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
import {
  postUniProtAntigen,
  selectLoadingAntigen,
  selectPostedUniProtAntigens,
} from "./slice";
import { useDispatch, useSelector } from "react-redux";
import {
  getProjects,
  selectCurrentProject,
  selectProjects,
} from "../project/slice";
import { Project } from "../project/utils";

/**
 *
 * A MUI Card containing a form for adding a new uniprot antigen; the form
 * consists of a dropdown to select the project which it corresponds to,
 * defaulting to the active project, a text field to enter the uniprot
 * accession number, and a submit button which when pressed dispatches a request
 * to store the antigen and appends it to a list of uniprot antigens created
 * this session. Available projects are retrieved from the redux store with a
 * dispatch executed to obtain them if unavailable
 *
 * @returns A MUI card containing a form for adding a new antigen
 */
export default function AddUniProtAntigenView() {
  const dispatch = useDispatch();
  const antigens = useSelector(selectPostedUniProtAntigens);
  const loading = useSelector(selectLoadingAntigen);
  const projects = useSelector(selectProjects);
  const currentProject = useSelector(selectCurrentProject);
  const [project, setProject] = useState<Project | null>(currentProject);
  const [accessionNumber, setAccessionNumber] = useState<string>("");

  useEffect(() => {
    dispatch(getProjects());
  }, [dispatch]);

  useEffect(() => {
    setProject(currentProject);
  }, [currentProject]);

  const submit = () => {
    if (project)
      dispatch(
        postUniProtAntigen({
          project: project.short_title,
          uniprot_accession_number: accessionNumber,
        })
      );
  };

  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <Typography variant="h4">
            Add new antigen from UniProt database
          </Typography>
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
                setProject(project ? project : null)
              }
            />
            <TextField
              required
              label="UniProt Accession Number"
              value={accessionNumber}
              onChange={(evt) => {
                setAccessionNumber(evt.target.value);
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
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                {antigen.name}
              </AccordionSummary>
              <AccordionDetails>
                <AntigenInfo antigenRef={antigen} />
              </AccordionDetails>
            </Accordion>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}
