import { Paper, TableCell, TableContainer, TableHead, TableRow, Table, TableBody } from "@mui/material";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

type Antigen = {
    uuid: string
    antigen_elisa_wells: Array<string>
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

    console.log(antigen);
    return (
        <TableContainer component={Paper}>
            <Table>
                <TableBody>
                    <TableRow>
                        <TableCell>UUID:</TableCell>
                        <TableCell>{antigen?.uuid}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Elisa Appearances:</TableCell>
                        <TableCell>{antigen?.antigen_elisa_wells}</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </TableContainer>
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
                        <TableCell>UUID</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {
                        antigens.map((e, i) => (
                            <TableRow key={i}>
                                <TableCell><Link to={`/antigen/${e.uuid}`}>{e.uuid}</Link></TableCell>
                            </TableRow>
                        ))
                    }
                </TableBody>
            </Table>
        </TableContainer>
    )
};

export { AntigenView, AntigensView };
