import { Card, CardContent, TextField, Typography, Stack, List, Divider, ListItem } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import SendIcon from '@mui/icons-material/Send';
import { useState } from "react";
import { Antigen, AntigenInfo, UniProtAntigen } from "./utils";
import { fromAPI } from "../utils/api";

export default function AddUniProtAntigenView() {

    const [accessionNumber, setAccessionNumber] = useState<string>("");
    const [waiting, setWaiting] = useState<boolean>(false);
    const [antigens, setAntigens] = useState<Antigen[]>([]);

    const submit = async () => {
        setWaiting(true);
        const response = await fetch(
            "http://127.0.0.1:8000/api/uniprot_antigen/",
            {
                method: 'POST',
                mode: 'cors',
                cache: 'no-cache',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 'uniprot_accession_number': accessionNumber })
            }
        )

        if (!response.ok) {
            setWaiting(false);
            return
        }

        let antigenUUID = ((await response.json()) as UniProtAntigen).antigen
        const getResponse = await fromAPI(`antigen/${antigenUUID}`)

        if (!getResponse.ok) {
            setWaiting(false);
            return
        }

        var antigen: Antigen = await getResponse.json();
        setAntigens([...antigens, antigen]);
        setWaiting(false);
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
                            loading={waiting}
                            endIcon={<SendIcon />}
                            onClick={submit}
                        >
                            Submit
                        </LoadingButton>
                    </Stack>
                    <Divider />
                    <List>
                        {
                            antigens.map((antigen, idx) => (
                                <ListItem>
                                    <AntigenInfo antigen={antigen} />
                                </ListItem>
                            ))
                        }
                    </List>
                </Stack>
            </CardContent>
        </Card >
    )
}