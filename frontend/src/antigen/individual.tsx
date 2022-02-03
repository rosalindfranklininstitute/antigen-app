import { Paper, TableCell, TableContainer, TableRow, Table, TableBody, Typography, Card } from "@mui/material";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fromAPI, LoadingPaper, FailedRetrievalPaper } from "../utils/api";
import { Antigen } from "./utils";

export default function AntigenView() {
    let params = useParams();

    const [antigen, setAntigen] = useState<Antigen | null>(null);
    const [response, setResponse] = useState<Response | null>(null);

    useEffect(() => {
        const fetchAntigen = async () => {
            const response = await fromAPI(`antigen/${params.uuid}`);
            setResponse(response);
            if (response.ok) {
                const antigen: Antigen = await response.json();
                setAntigen(antigen);
            };
        };
        fetchAntigen();
    }, [params]);

    if (!response) {
        return <LoadingPaper text="Retrieving antigen from database." />
    }

    if (!antigen) {
        let text = `Could not retrieve entry for ${window.location.href.split("/").pop()}`
        return <FailedRetrievalPaper text={text} />
    }

    return (
        <Card>
            <Typography variant="h4">{antigen.name}</Typography>
            <Typography variant="h5">({antigen.uuid})</Typography>
            <TableContainer component={Paper}>
                <Table>
                    <TableBody>
                        <TableRow>
                            <TableCell>Sequence:</TableCell>
                            <TableCell>{antigen.sequence}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Molecular Mass:</TableCell>
                            <TableCell>{antigen.molecular_mass}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Uniprot Accession Number:</TableCell>
                            <TableCell>{antigen.uniprot_accession_number}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Elisa Appearances:</TableCell>
                            <TableCell>{antigen.antigen_elisa_wells}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Creation Time:</TableCell>
                            <TableCell>{antigen.creation_time}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
        </Card>
    )
};