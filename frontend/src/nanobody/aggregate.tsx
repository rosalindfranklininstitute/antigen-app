import { Card, CardContent } from "@mui/material";
import { DataGrid, GridColDef, GridToolbar } from "@mui/x-data-grid";
import { useEffect } from "react";
import { LoadingPaper, FailedRetrievalPaper } from "../utils/api";
import { IconLinkUUIDGridColDef, WellCellRenderer } from "../utils/elements";
import { useDispatch, useSelector } from "react-redux";
import {
  getNanobodies,
  selectLoadingNanobody,
  selectNanobodies,
} from "./slice";

export default function NanobodiesView() {
  const dispatch = useDispatch();
  const nanobodies = useSelector(selectNanobodies);
  const loading = useSelector(selectLoadingNanobody);

  useEffect(() => {
    dispatch(getNanobodies());
  }, [dispatch]);

  if (loading)
    return <LoadingPaper text="Retrieving nanobody list from database." />;
  if (!nanobodies)
    return <FailedRetrievalPaper text="Could not retrieve nanobody list." />;

  const columns: GridColDef[] = [
    IconLinkUUIDGridColDef("/nanobody/"),
    {
      field: "name",
      headerName: "Nanobody Name",
      flex: 1,
    },
    {
      field: "nanobody_elisa_wells",
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
          rows={nanobodies}
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
