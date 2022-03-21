import { Card, CardContent } from "@mui/material";
import { DataGrid, GridColDef, GridToolbar } from "@mui/x-data-grid";
import { useEffect } from "react";
import { LoadingPaper, FailedRetrievalPaper } from "../utils/api";
import { IconLinkURIGridColDef, WellCellRenderer } from "../utils/elements";
import { getAntigens, selectAntigens, selectLoadingAntigen } from "./slice";
import { useDispatch, useSelector } from "react-redux";
import { addProjectItemUri } from "../project/utils";

export default function AntigensView() {
  const dispatch = useDispatch();
  const antigens = addProjectItemUri(useSelector(selectAntigens));
  const loading = useSelector(selectLoadingAntigen);

  useEffect(() => {
    dispatch(getAntigens({}));
  }, [dispatch]);

  if (loading)
    return <LoadingPaper text="Retrieving antigen list from database." />;
  if (!antigens)
    return <FailedRetrievalPaper text="Could not retrieve antigen list." />;

  const columns: GridColDef[] = [
    IconLinkURIGridColDef("/antigen/"),
    { field: "project", headerName: "Project", flex: 1 },
    { field: "number", headerName: "Antigen Number", flex: 1 },
    {
      field: "name",
      headerName: "Antigen Name",
      flex: 1,
    },
    {
      field: "sequence",
      headerName: "Sequence",
      flex: 1,
    },
    {
      field: "molecular_mass",
      headerName: "Molecular Mass",
      flex: 1,
    },
    {
      field: "uniprot_accession_number",
      headerName: "UniProt Accessation Number",
      flex: 1,
    },
    {
      field: "elisawell_set",
      headerName: "Associated Wells",
      renderCell: WellCellRenderer,
      flex: 1,
    },
    {
      field: "creation_time",
      headerName: "Creation Time",
      flex: 1,
    },
  ];

  return (
    <Card>
      <CardContent>
        <DataGrid
          autoHeight
          rows={antigens}
          columns={columns}
          getRowId={(row) => `${row.project}:${row.number}`}
          components={{ Toolbar: GridToolbar }}
          initialState={{
            columns: {
              columnVisibilityModel: {
                project: false,
                number: false,
                sequence: false,
                uniprot_accession_number: false,
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
