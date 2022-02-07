import { Card, CardContent, IconButton } from "@mui/material";
import { DataGrid, GridColDef, GridToolbar, GridRenderCellParams } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { getAPI, LoadingPaper, FailedRetrievalPaper } from "../utils/api";
import { ElisaWell, locationToGrid } from "./utils";
import LinkIcon from '@mui/icons-material/Link';
import { LinkUUIDCellRenderer } from "../utils/elements";

export default function ElisaWellsView() {
    const navigate = useNavigate();

    const [elisaWells, setElisaWells] = useState<ElisaWell[]>([]);
    const [response, setResponse] = useState<Response | null>(null);

    useEffect(() => {
        const fetchElisaWells = async () => {
            const response = await getAPI("elisa_well");
            setResponse(response);
            if (response.ok) {
                const elisaWells = await response.json();
                setElisaWells(elisaWells);
            }
        };
        fetchElisaWells();
    }, []);

    if (!response) {
        return <LoadingPaper text="Retrieving elisa well list from database." />
    }

    if (!elisaWells.length) {
        return <FailedRetrievalPaper text="Could not retrieve elisa well list." />
    }

    const columns: GridColDef[] = [
        {
            field: 'uuid',
            headerName: 'Link',
            renderCell: (params: GridRenderCellParams<string>) => {
                return (
                    <IconButton onClick={() => navigate(`/elisa_well/${params.value}/`)}>
                        <LinkIcon />
                    </IconButton>
                )
            },
            width: 50
        },
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
                    style={{ border: 0 }}
                />
            </CardContent>
        </Card>

    )
};