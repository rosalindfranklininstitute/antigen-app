import {
  Card,
  CardContent,
  Typography,
  Stack,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Autocomplete,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import SendIcon from "@mui/icons-material/Send";
import { NanobodyInfo } from "./utils";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useDispatch, useSelector } from "react-redux";
import {
  postNanobodies,
  selectLoadingNanobody,
  selectPostedNanobodies,
} from "./slice";
import {
  getProjects,
  selectCurrentProject,
  selectProjects,
} from "../project/slice";
import { useEffect, useState } from "react";
import { Project } from "../project/utils";
import { Box } from "@mui/system";

export default function AddNanobodyView() {
  const dispatch = useDispatch();
  const nanobodies = useSelector(selectPostedNanobodies);
  const loading = useSelector(selectLoadingNanobody);
  const projects = useSelector(selectProjects);
  const currentProject = useSelector(selectCurrentProject);
  const [project, setProject] = useState<Project | undefined>(currentProject);

  console.log(currentProject);

  useEffect(() => {
    dispatch(getProjects());
  }, [dispatch]);

  useEffect(() => {
    setProject(currentProject);
  }, [currentProject]);

  const submit = () => {
    if (project) dispatch(postNanobodies([{ project: project.short_title }]));
  };

  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <Typography variant="h4">Add new nanobody</Typography>
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
            <LoadingButton
              variant="contained"
              loading={loading}
              endIcon={<SendIcon />}
              onClick={submit}
            >
              Submit
            </LoadingButton>
          </Stack>
          {nanobodies.map((nanobody, idx) => (
            <Box key={idx}>
              <Divider />
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  {nanobody.name}
                </AccordionSummary>
                <AccordionDetails>
                  <NanobodyInfo nanobodyRef={nanobody} />
                </AccordionDetails>
              </Accordion>
            </Box>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}
