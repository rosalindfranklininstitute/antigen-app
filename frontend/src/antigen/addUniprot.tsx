import { Card, CardContent, TextField, Typography, Stack, Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import SendIcon from '@mui/icons-material/Send';
import { useState } from "react";
import { Antigen, AntigenInfo, fetchAntigen, UniProtAntigen } from "./utils";
import { postAPI } from "../utils/api";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export default function AddUniProtAntigenView() {

    const [accessionNumber, setAccessionNumber] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [antigens, setAntigens] = useState<Antigen[]>([]);

    const submit = async () => {
        setLoading(true);
        postAPI(
            "uniprot_antigen",
            {
                'uniprot_accession_number': accessionNumber
            }
        ).then(
            async (response) => {
                const uniProtAntigen: UniProtAntigen = await response.json();
                fetchAntigen(uniProtAntigen.antigen).then(
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
                    <Typography variant="h4">Add new antigen from UniProt database</Typography>
                    <Stack direction="row" spacing={2}>
                        <TextField
                            required
                            label="UniProt Accessation Number"
                            value={accessionNumber}
                            onChange={(evt) => { setAccessionNumber(evt.target.value) }}
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
                            <Accordion>
                                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                    {antigen.name}
                                </AccordionSummary>
                                <AccordionDetails>
                                    <AntigenInfo antigen={antigen} />
                                </AccordionDetails>
                            </Accordion>
                        ))
                    }
                </Stack>
            </CardContent>
        </Card >
    )
}