import { Paper, TableCell, TableContainer, TableHead, TableRow, Table, TableBody } from "@mui/material";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fromAPI, LoadingPaper, FailedRetrievalPaper } from "../utils/api";
import { Antigen } from "./utils";

export default function AntigensView() {
    const [antigens, setAntigens] = useState<Antigen[]>([]);
    const [response, setResponse] = useState<Response | null>(null);

    useEffect(() => {
        const fetchAntigens = async () => {
            const response = await fromAPI("antigen");
            setResponse(response);
            if (response.ok) {
                const antigens = await response.json();
                setAntigens(antigens);
            }
        };
        fetchAntigens();
    }, []);

    if (!response) {
        return <LoadingPaper text="Retrieving antigen list from database." />
    }

    if (!antigens.length) {
        return <FailedRetrievalPaper text="Could not retrieve antigen list." />
    }

    return (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Molecular Mass</TableCell>
                        <TableCell>Associated Wells</TableCell>
                        <TableCell>Creation Time</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {
                        antigens.map((antigen, idx) => (
                            <TableRow key={idx}>
                                <TableCell><Link to={`/antigen/${antigen.uuid}`}>{antigen.name}</Link></TableCell>
                                <TableCell>{antigen.molecular_mass}</TableCell>
                                <TableCell>{antigen.antigen_elisa_wells.length}</TableCell>
                                <TableCell>{antigen.creation_time}</TableCell>
                            </TableRow>
                        ))
                    }
                </TableBody>
            </Table>
        </TableContainer>
    )
};