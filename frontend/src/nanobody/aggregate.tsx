import { Card, CardContent } from "@mui/material";
import { DataGrid, GridColDef, GridToolbar } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import { getAPI, LoadingPaper, FailedRetrievalPaper } from "../utils/api";
import { Nanobody } from "./utils";
import { IconLinkUUIDGridColDef, WellCellRenderer } from "../utils/elements";

export default function NanobodiesView() {
    const [nanobodies, setNanobodies] = useState<Nanobody[]>([]);
    const [response, setResponse] = useState<Response | null>(null);

    useEffect(() => {
        const fetchNanobodies = async () => {
            const response = await getAPI("nanobody");
            setResponse(response);
            if (response.ok) {
                const nanobodies = await response.json();
                setNanobodies(nanobodies);
            }
        };
        fetchNanobodies();
    }, []);

    if (!response) {
        return <LoadingPaper text="Retrieving nanobody list from database." />
    }

    if (!response.ok) {
        return <FailedRetrievalPaper text="Could not retrieve nanobody list." />
    }

    const columns: GridColDef[] = [
        IconLinkUUIDGridColDef("/nanobody/"),
        {
            field: 'name',
            headerName: 'Nanobody Name',
            flex: 1,
        },
        {
            field: 'nanobody_elisa_wells',
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
                    rows={nanobodies}
                    columns={columns}
                    getRowId={(row) => row.uuid}
                    components={{ Toolbar: GridToolbar }}
                    style={{ border: 0 }}
                />
            </CardContent>
        </Card>

    )
};