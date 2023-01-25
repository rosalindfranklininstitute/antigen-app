import { Card, CardContent, Stack, Typography } from "@mui/material";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { FailedRetrievalPaper, LoadingPaper } from "../utils/api";
import { getProject, selectLoadingProject, selectProject } from "./slice";
import { ProjectInfo, ProjectRef } from "./utils";

/**
 *
 * A MUI Card containing a project short title header and project information
 * table. Project information is retrieved from the redux store with a dispatch
 * executed to obtain it if unavailable
 *
 * @returns A MUI Card containing a project short title header and project
 * information table
 */
export default function ProjectView(): JSX.Element {
  const { project: projectRef } = useParams<{ project: ProjectRef }>() as {
    project: ProjectRef;
  };
  const dispatch = useDispatch();
  const project = useSelector(selectProject(projectRef));
  const loading = useSelector(selectLoadingProject);

  useEffect(() => {
    dispatch(getProject(projectRef));
  }, [dispatch, projectRef]);

  if (loading) return <LoadingPaper text="Retrieving project from database." />;
  if (!project)
    return (
      <FailedRetrievalPaper
        text={`Could not retrieve entry for ${projectRef}`}
      />
    );
  return (
    <Card>
      <CardContent>
        <Stack>
          <Typography variant="h4">{project.short_title}</Typography>
          <ProjectInfo projectRef={projectRef} />
        </Stack>
      </CardContent>
    </Card>
  );
}
