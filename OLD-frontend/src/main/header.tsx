import { AppBar, Autocomplete, Link, TextField, Toolbar } from "@mui/material";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link as RouterLink } from "react-router-dom";
import {
  getProjects,
  selectCurrentProject,
  selectProjects,
  switchProject,
} from "../project/slice";

/**
 *
 * A MUI AppBar containing a link to the homepage with title text and a
 * dropdown allowing for selection of the current project. Available projects
 * are retrieved from the redux store with a dispatch executed to obtain them
 * if unavailable
 *
 * @returns A MUI AppBar with title text and a dropdown for selection of the
 * current project
 */
function Header() {
  const dispatch = useDispatch();
  const currentProject = useSelector(selectCurrentProject);
  const projects = useSelector(selectProjects);

  useEffect(() => {
    dispatch(getProjects());
  });

  return (
    <AppBar position="static">
      <Toolbar>
        <Link
          variant="h6"
          component={RouterLink}
          to="/"
          color="textPrimary"
          underline="none"
          sx={{ flexGrow: 1 }}
        >
          Antigen App
        </Link>
        <Autocomplete
          renderInput={(params) => (
            <TextField
              {...params}
              label="Project"
              sx={{ width: "32ch" }}
              variant="filled"
              size="small"
            />
          )}
          options={projects}
          getOptionLabel={(project) => project.short_title}
          onChange={(_, project) => {
            if (project) dispatch(switchProject(project.short_title));
          }}
          value={currentProject}
        />
      </Toolbar>
    </AppBar>
  );
}

export { Header };
