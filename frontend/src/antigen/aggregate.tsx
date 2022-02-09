import { Card, CardContent } from "@mui/material";
import { DataGrid, GridColDef, GridToolbar } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import { LoadingPaper, FailedRetrievalPaper } from "../utils/api";
import { Antigen, fetchAntigens } from "./utils";
import { IconLinkUUIDGridColDef, WellCellRenderer } from "../utils/elements";

export default function AntigensView() {
    const [antigens, setAntigens] = useState<Antigen[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        fetchAntigens().then(
            (antigens) => {
                setAntigens(antigens);
                setLoading(false);
            },
            () => setLoading(false)
        );
    }, []);

    if (loading) return <LoadingPaper text="Retrieving antigen list from database." />
    if (!antigens) return <FailedRetrievalPaper text="Could not retrieve antigen list." />

    const columns: GridColDef[] = [
        IconLinkUUIDGridColDef("/antigen/"),
        {
            field: 'name',
            headerName: 'Antigen Name',
            flex: 1,
        },
        {
            field: 'sequence',
            headerName: 'Sequence',
            flex: 1
        },
        {
            field: 'molecular_mass',
            headerName: 'Molecular Mass',
            flex: 1
        },
        {
            field: 'uniprot_accession_number',
            headerName: 'UniProt Accessation Number',
            flex: 1
        },
        {
            field: 'antigen_elisa_wells',
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
                    rows={antigens}
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
                    sx={{ border: 0 }}
                    disableSelectionOnClick
                />
            </CardContent>
        </Card>

    )
};