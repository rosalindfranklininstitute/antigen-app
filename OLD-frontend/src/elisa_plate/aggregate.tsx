import { Card, CardContent } from "@mui/material";
import { DataGrid, GridColDef, GridToolbar } from "@mui/x-data-grid";
import { useEffect } from "react";
import { LoadingPaper, FailedRetrievalPaper } from "../utils/api";
import { IconLinkURIGridColDef, WellCellRenderer } from "../utils/elements";
import { useDispatch, useSelector } from "react-redux";
import {
  getElisaPlates,
  selectElisaPlates,
  selectLoadingElisaPlate,
} from "./slice";
import { addProjectItemUri } from "../project/utils";

/**
 * A MUI Card containing a data grid of elisa plates with columns corresponding
 * to an icon link to the individual view, the threshold, the elisa wells as a
 * list of well references and the creation time. Elisa plate information is
 * retrieved from the redux store with a dispatch executed to obtain it if
 * unavailable
 *
 * @returns A MUI Card containing a data grid of elisa plates
 */
export default function ElisaPlatesView() {
  const dispatch = useDispatch();
  const elisaPlates = addProjectItemUri(useSelector(selectElisaPlates));
  const loading = useSelector(selectLoadingElisaPlate);

  useEffect(() => {
    dispatch(getElisaPlates({}));
  }, [dispatch]);

  if (loading)
    return <LoadingPaper text="Retrieving elisa plate list from database." />;
  if (!elisaPlates)
    return <FailedRetrievalPaper text="Could not retrieve elisa plate list." />;

  const columns: GridColDef[] = [
    IconLinkURIGridColDef("/elisa_plate/"),
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
          getRowId={(row) => `${row.project}:${row.number}`}
          components={{ Toolbar: GridToolbar }}
          sx={{ border: 0 }}
          disableSelectionOnClick
        />
      </CardContent>
    </Card>
  );
}