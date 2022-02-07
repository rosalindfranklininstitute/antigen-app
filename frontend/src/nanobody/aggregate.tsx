import { Button, Card, CardContent, IconButton, Menu, MenuList, MenuItem } from "@mui/material";
import { DataGrid, GridColDef, GridToolbar, GridRenderCellParams } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { getAPI, LoadingPaper, FailedRetrievalPaper } from "../utils/api";
import { Nanobody } from "./utils";
import LinkIcon from '@mui/icons-material/Link';
import { WellCellRenderer } from "../utils/elements";

export default function NanobodiesView() {
    const navigate = useNavigate();

    const [nanobodies, setAntigens] = useState<Nanobody[]>([]);
    const [response, setResponse] = useState<Response | null>(null);

    useEffect(() => {
        const fetchNanobodies = async () => {
            const response = await getAPI("nanobody");
            setResponse(response);
            if (response.ok) {
                const antigens = await response.json();
                setAntigens(antigens);
            }
        };
        fetchNanobodies();
    }, []);

    if (!response) {
        return <LoadingPaper text="Retrieving nanobody list from database." />
    }

    if (!nanobodies.length) {
        return <FailedRetrievalPaper text="Could not retrieve nanobody list." />
    }

    const columns: GridColDef[] = [
        {
            field: 'uuid',
            headerName: 'Link',
            renderCell: (params: GridRenderCellParams<string>) => {
                return (
                    <IconButton onClick={() => navigate(`/nanobody/${params.value}/`)}>
                        <LinkIcon />
                    </IconButton>
                )
            },
            width: 50
        },
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
                    initialState={{
                        columns: {
                            columnVisibilityModel: {
                                sequence: false,
                                uniprot_accession_number: false
                            }
                        }
                    }}
                    style={{ border: 0 }}
                />
            </CardContent>
        </Card>

    )
};