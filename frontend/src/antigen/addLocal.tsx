import { Card, CardContent, TextField, Typography, Stack, Divider, Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import SendIcon from '@mui/icons-material/Send';
import { useState } from "react";
import { Antigen, AntigenInfo, fetchAntigen, LocalAntigen } from "./utils";
import { postAPI } from "../utils/api";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export default function AddLocalAntigenView() {

    const [sequence, setSequence] = useState<string>("");
    const [molecularMass, setMolecularMass] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);
    const [antigens, setAntigens] = useState<Antigen[]>([]);

    const submit = async () => {
        setLoading(true);
        postAPI<LocalAntigen>(
            "local_antigen",
            {
                'sequence': sequence,
                'molecular_mass': molecularMass
            }
        ).then(
            async (localAntigen) => {
                fetchAntigen(localAntigen.antigen).then(
                    (antigen) => {
                        setAntigens([...antigens, antigen]);
                        setLoading(false);
                    },
                    () => setLoading(false)
                )
            },
            () => setLoading(false)
        );
    }

    return (
        <Card>
            <CardContent>
                <Stack spacing={2}>
                    <Typography variant="h4">Add new antigen</Typography>
                    <Stack direction="row" spacing={2}>
                        <TextField
                            required
                            label="Sequence"
                            value={sequence}
                            onChange={(evt) => { setSequence(evt.target.value) }}
                        />
                        <TextField
                            required
                            label="Molecular Mass"
                            type="number"
                            value={molecularMass}
                            onChange={(evt) => { setMolecularMass(Number(evt.target.value)) }}
                        />
                        <LoadingButton
                            variant="contained"
                            loading={loading}
                            endIcon={<SendIcon />}
                            onClick={submit}
                        >
                            Submit
                        </LoadingButton>
                    </Stack>
                    {
                        antigens.map((antigen, idx) => (
                            <div>
                                <Divider />
                                <Accordion>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                        {antigen.name}
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <AntigenInfo antigen={antigen} />
                                    </AccordionDetails>
                                </Accordion>
                            </div>
                        ))
                    }
                </Stack>
            </CardContent>
        </Card >
    )
}