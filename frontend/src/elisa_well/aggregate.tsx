import { Card, CardContent } from "@mui/material";
import { DataGrid, GridColDef, GridToolbar } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import { getAPI, LoadingPaper, FailedRetrievalPaper } from "../utils/api";
import { ElisaWell, locationToGrid } from "./utils";
import { IconLinkUUIDGridColDef, LinkUUIDCellRenderer } from "../utils/elements";

export default function ElisaWellsView() {
    const [elisaWells, setElisaWells] = useState<ElisaWell[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        getAPI<ElisaWell[]>(`elisa_well`).then(
            (elisaWells) => {
                setElisaWells(elisaWells);
                setLoading(false);
            },
            () => setLoading(false)
        );
    }, []);

    if (loading) return <LoadingPaper text="Retrieving elisa well list from database." />
    if (!elisaWells) return <FailedRetrievalPaper text="Could not retrieve elisa well list." />

    const columns: GridColDef[] = [
        IconLinkUUIDGridColDef("/elisa_well/"),
        {
            field: 'plate',
            headerName: 'Plate',
            renderCell: LinkUUIDCellRenderer("/elisa_plate/"),
            flex: 1,
        },
        {
            field: 'location',
            headerName: 'Location',
            valueGetter: (params) => locationToGrid(params.value),
            flex: 1,
        },
        {
            field: 'antigen',
            headerName: 'Antigen UUID',
            renderCell: LinkUUIDCellRenderer("/antigen/"),
            flex: 1,
        },
        {
            field: 'nanobody',
            headerName: 'Nanobody UUID',
            renderCell: LinkUUIDCellRenderer("/nanobody/"),
            flex: 1,
        },
        {
            field: 'optical_density',
            headerName: 'Optical Density',
            flex: 1,
        },
        {
            field: 'functional',
            headerName: 'Functional',
            valueGetter: (params) => { return params.value ? 'yes' : 'no' },
            flex: 1,
        }
    ]

    return (
        <Card>
            <CardContent>
                <DataGrid
                    autoHeight
                    rows={elisaWells}
                    columns={columns}
                    getRowId={(row) => row.uuid}
                    components={{ Toolbar: GridToolbar }}
                    initialState={{
                        columns: {
                            columnVisibilityModel: {
                                location: false,
                            }
                        }
                    }}
                    sx={{ border: 0 }}
                    disableSelectionOnClick
                />
            </CardContent>
        </Card>

    )
};