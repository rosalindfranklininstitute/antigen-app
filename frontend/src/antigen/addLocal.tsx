import { Card, CardContent, TextField, Typography, Stack, Divider, Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import SendIcon from '@mui/icons-material/Send';
import { useState } from "react";
import { AntigenInfo } from "./utils";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useDispatch, useSelector } from "react-redux";
import { postLocalAntigen, selectLoadingAntigen, selectPostedLocalAntignes } from "./slice";

export default function AddLocalAntigenView() {
    const dispatch = useDispatch();
    const antigens = useSelector(selectPostedLocalAntignes);
    const loading = useSelector(selectLoadingAntigen);
    const [sequence, setSequence] = useState<string>("");
    const [molecularMass, setMolecularMass] = useState<number>(0);

    const submit = async () => {
        dispatch(postLocalAntigen(sequence, molecularMass));
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
                        antigens.map((antigen) => (
                            <div>
                                <Divider />
                                <Accordion>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                        {antigen.name}
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <AntigenInfo uuid={antigen.uuid} />
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