import { Paper, TableCell, TableContainer, TableHead, TableRow, Table, TableBody, Typography, Card } from "@mui/material";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

type Antigen = {
    uuid: string
    sequence: string
    molecular_mass: number
    name: string
    uniprot_accession_number: string
    antigen_elisa_wells: Array<string>
    creation_time: Date
};

function AntigenView() {
    let params = useParams();

    const [antigen, setAntigen] = useState<Antigen | null>(null);

    useEffect(() => {
        const fetchAntigen = async () => {
            const response = await fetch(`http://127.0.0.1:8000/api/antigen/${params.uuid}/?format=json`);
            if (response.ok) {
                const antigen: Antigen = await response.json();
                setAntigen(antigen);
            };
        };
        fetchAntigen();
    }, []);

    return (
        <Card>
            <Typography variant="h4">{antigen?.name}</Typography>
            <Typography variant="h5">({antigen?.uuid})</Typography>
            <TableContainer component={Paper}>
                <Table>
                    <TableBody>
                        <TableRow>
                            <TableCell>Sequence:</TableCell>
                            <TableCell>{antigen?.sequence}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Molecular Mass:</TableCell>
                            <TableCell>{antigen?.molecular_mass}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Uniprot Accession Number:</TableCell>
                            <TableCell>{antigen?.uniprot_accession_number}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Elisa Appearances:</TableCell>
                            <TableCell>{antigen?.antigen_elisa_wells}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Creation Time:</TableCell>
                            <TableCell>{antigen?.creation_time}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
        </Card>
    )
};

function AntigensView() {
    const [antigens, setAntigens] = useState<Antigen[]>([]);

    useEffect(() => {
        const fetchAntigens = async () => {
            const response = await fetch("http://127.0.0.1:8000/api/antigen/?format=json");
            if (response.ok) {
                const antigens = await response.json();
                setAntigens(antigens);
            }
        };
        fetchAntigens();
    }, []);

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

export { AntigenView, AntigensView };
