import { Card, CardContent } from "@mui/material";
import { DataGrid, GridColDef, GridToolbar } from "@mui/x-data-grid";
import { useEffect } from "react";
import { LoadingPaper, FailedRetrievalPaper } from "../utils/api";
import { IconLinkURIGridColDef, WellCellRenderer } from "../utils/elements";
import { useDispatch, useSelector } from "react-redux";
import {
  getNanobodies,
  selectLoadingNanobody,
  selectNanobodies,
} from "./slice";
import { addProjectItemUri } from "../project/utils";

/**
 * A MUI Card containing a data grid of nanobodies with columns corresponding
 * to an icon link to the individual view, the name, the elisa appearances as
 * a list of well references and the creation time. Nanobody information is
 * retrieved from the redux store with a dispatch executed to obtain it if
 * unavailable
 *
 * @returns A MUI Card containing a data grid of nanobodies
 */
export default function NanobodiesView() {
  const dispatch = useDispatch();
  const nanobodies = addProjectItemUri(useSelector(selectNanobodies));
  const loading = useSelector(selectLoadingNanobody);

  useEffect(() => {
    dispatch(getNanobodies({}));
  }, [dispatch]);

  if (loading)
    return <LoadingPaper text="Retrieving nanobody list from database." />;
  if (!nanobodies)
    return <FailedRetrievalPaper text="Could not retrieve nanobody list." />;

  const columns: GridColDef[] = [
    IconLinkURIGridColDef("/nanobody/"),
    {
      field: "name",
      headerName: "Nanobody Name",
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
          rows={nanobodies}
          columns={columns}
          getRowId={(row) => `${row.project}:${row.number}`}
          components={{ Toolbar: GridToolbar }}
          sx={{ border: 0 }}
          disableSelectionOnClick
        />
      </CardContent>
    </Card>
  );
}