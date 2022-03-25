import { Card, CardContent } from "@mui/material";
import { DataGrid, GridColDef, GridToolbar } from "@mui/x-data-grid";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FailedRetrievalPaper, LoadingPaper } from "../utils/api";
import { IconLinkURIGridColDef } from "../utils/elements";
import { getProjects, selectLoadingProject, selectProjects } from "./slice";

/**
 *
 * A MUI Card containing a data grid of projects with columns corresponding to
 * an icon link to the individual view, the short title, the full title and the
 * description. Project information is retrieved from the redux store with a
 * dispatch executed to obtain it if unavailable
 *
 * @returns A MUI card containing a data grid of projects
 */
export default function ProjectsView() {
  const dispatch = useDispatch();
  const projects = useSelector(selectProjects).map((project) => ({
    ...project,
    uri: project.short_title,
  }));
  const loading = useSelector(selectLoadingProject);

  useEffect(() => {
    dispatch(getProjects());
  }, [dispatch]);

  if (loading)
    return <LoadingPaper text="Retrieving project list from database." />;
  if (!projects)
    return <FailedRetrievalPaper text="Could not retrieve project list." />;

  const columns: Array<GridColDef> = [
    IconLinkURIGridColDef("/project/"),
    { field: "short_title", headerName: "Short Title", flex: 1 },
    { field: "title", headerName: "Title", flex: 1 },
    { field: "description", headerName: "Description", flex: 1 },
  ];

  return (
    <Card>
      <CardContent>
        <DataGrid
          autoHeight
          rows={projects}
          columns={columns}
          getRowId={(row) => row.short_title}
          components={{ Toolbar: GridToolbar }}
          sx={{ border: 0 }}
          disableSelectionOnClick
        />
      </CardContent>
    </Card>
  );
}
