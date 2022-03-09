import { Card, CardContent } from "@mui/material";
import { DataGrid, GridColDef, GridToolbar } from "@mui/x-data-grid";
import { useEffect } from "react";
import { LoadingPaper, FailedRetrievalPaper } from "../utils/api";
import { IconLinkUUIDGridColDef, WellCellRenderer } from "../utils/elements";
import { useDispatch, useSelector } from "react-redux";
import {
  getElisaPlates,
  selectElisaPlates,
  selectLoadingElisaPlate,
} from "./slice";

export default function ElisaPlatesView() {
  const dispatch = useDispatch();
  const elisaPlates = useSelector(selectElisaPlates);
  const loading = useSelector(selectLoadingElisaPlate);

  useEffect(() => {
    dispatch(getElisaPlates());
  }, [dispatch]);

  if (loading)
    return <LoadingPaper text="Retrieving elisa plate list from database." />;
  if (!elisaPlates)
    return <FailedRetrievalPaper text="Could not retrieve elisa plate list." />;

  const columns: GridColDef[] = [
    IconLinkUUIDGridColDef("/elisa_plate/"),
    {
      field: "threshold",
      headerName: "Threshold",
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
          rows={elisaPlates}
          columns={columns}
          getRowId={(row) => row.uuid}
          components={{ Toolbar: GridToolbar }}
          sx={{ border: 0 }}
          disableSelectionOnClick
        />
      </CardContent>
    </Card>
  );
}
