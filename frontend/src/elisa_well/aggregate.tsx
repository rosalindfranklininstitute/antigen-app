import { Card, CardContent } from "@mui/material";
import { DataGrid, GridColDef, GridToolbar } from "@mui/x-data-grid";
import { useEffect } from "react";
import { LoadingPaper, FailedRetrievalPaper } from "../utils/api";
import { locationToGrid, serializeElisaWellRef } from "./utils";
import { IconLinkURIGridColDef, LinkURICellRenderer } from "../utils/elements";
import { useDispatch, useSelector } from "react-redux";
import {
  getElisaWells,
  selectElisaWells,
  selectLoadingElisaWell,
} from "./slice";
import { projectItemURI } from "../project/utils";

export default function ElisaWellsView() {
  const dispatch = useDispatch();
  const elisaWells = useSelector(selectElisaWells).map((elisaWell) => ({
    ...elisaWell,
    uri: serializeElisaWellRef(elisaWell),
  }));
  const loading = useSelector(selectLoadingElisaWell);

  useEffect(() => {
    dispatch(getElisaWells());
  }, [dispatch]);

  if (loading)
    return <LoadingPaper text="Retrieving elisa well list from database." />;
  if (!elisaWells)
    return <FailedRetrievalPaper text="Could not retrieve elisa well list." />;

  const columns: GridColDef[] = [
    IconLinkURIGridColDef("/elisa_well/"),
    { field: "project", headerName: "Project", flex: 1 },
    {
      field: "plate",
      headerName: "Plate",
      flex: 1,
    },
    {
      field: "location",
      headerName: "Location",
      valueGetter: (params) => locationToGrid(params.value),
      flex: 1,
    },
    {
      field: "antigen",
      headerName: "Antigen UUID",
      renderCell: (params) => LinkURICellRenderer("/antigen")(params),
      valueGetter: (params) => projectItemURI(params.value),
      flex: 1,
    },
    {
      field: "nanobody",
      headerName: "Nanobody UUID",
      renderCell: (params) => LinkURICellRenderer("/antigen")(params),
      valueGetter: (params) => projectItemURI(params.value),
      flex: 1,
    },
    {
      field: "optical_density",
      headerName: "Optical Density",
      flex: 1,
    },
    {
      field: "functional",
      headerName: "Functional",
      valueGetter: (params) => {
        return params.value ? "yes" : "no";
      },
      flex: 1,
    },
  ];

  return (
    <Card>
      <CardContent>
        <DataGrid
          autoHeight
          rows={elisaWells}
          columns={columns}
          getRowId={(row) => `${row.project}:${row.plate}:${row.location}`}
          components={{ Toolbar: GridToolbar }}
          initialState={{
            columns: {
              columnVisibilityModel: {
                location: false,
              },
            },
          }}
          sx={{ border: 0 }}
          disableSelectionOnClick
        />
      </CardContent>
    </Card>
  );
}
