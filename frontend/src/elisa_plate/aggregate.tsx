import { Card, CardContent } from "@mui/material";
import { DataGrid, GridColDef, GridToolbar } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import { getAPI, LoadingPaper, FailedRetrievalPaper } from "../utils/api";
import { ElisaPlate } from "./utils";
import { IconLinkUUIDGridColDef, WellCellRenderer } from "../utils/elements";

export default function ElisaPlatesView() {
    const [elisaPlates, setElisaPlates] = useState<ElisaPlate[]>([]);
    const [response, setResponse] = useState<Response | null>(null);

    useEffect(() => {
        const fetchElisaPlates = async () => {
            const response = await getAPI("elisa_plate");
            setResponse(response);
            if (response.ok) {
                const elisaPlates = await response.json();
                setElisaPlates(elisaPlates);
            }
        };
        fetchElisaPlates();
    }, []);

    if (!response) {
        return <LoadingPaper text="Retrieving elisa plate list from database." />
    }

    if (!response.ok) {
        return <FailedRetrievalPaper text="Could not retrieve elisa plate list." />
    }

    const columns: GridColDef[] = [
        IconLinkUUIDGridColDef("/elisa_plate/"),
        {
            field: 'threshold',
            headerName: 'Threshold',
            flex: 1,
        },
        {
            field: 'plate_elisa_wells',
            headerName: 'Associated Wells',
            renderCell: WellCellRenderer,
            flex: 1,
        },
        {
            field: 'creation_time',
            headerName: 'Creation Time',
            flex: 1
        }
    ]

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

    )
};