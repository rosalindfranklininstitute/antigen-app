import { Card, CardContent, TextField, Typography, Stack, Divider, Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import SendIcon from '@mui/icons-material/Send';
import { useState } from "react";
import { Nanobody, NanobodyInfo } from "./utils";
import { getAPI, postAPI } from "../utils/api";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export default function AddNanobodyView() {
    const [waiting, setWaiting] = useState<boolean>(false);
    const [nanobodies, setNanobodies] = useState<Nanobody[]>([]);

    const submit = async () => {
        setWaiting(true);
        const response = await postAPI("nanobody", {})

        if (!response.ok) {
            setWaiting(false);
            return
        }

        let nanobody = ((await response.json()) as Nanobody)
        setNanobodies([...nanobodies, nanobody]);
        setWaiting(false);
    }

    return (
        <Card>
            <CardContent>
                <Stack spacing={2}>
                    <Typography variant="h4">Add new nanobody</Typography>
                    <Stack direction="row" spacing={2}>
                        <LoadingButton
                            variant="contained"
                            loading={waiting}
                            endIcon={<SendIcon />}
                            onClick={submit}
                        >
                            Submit
                        </LoadingButton>
                    </Stack>
                    {
                        nanobodies.map((nanobody, idx) => (
                            <div>
                                <Divider />
                                <Accordion>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                        {nanobody.name}
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <NanobodyInfo nanobody={nanobody} />
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