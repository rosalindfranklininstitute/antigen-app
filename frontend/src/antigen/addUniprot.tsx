import {
  Card,
  CardContent,
  TextField,
  Typography,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import SendIcon from "@mui/icons-material/Send";
import { useState } from "react";
import { AntigenInfo } from "./utils";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  postUniProtAntigen,
  selectLoadingAntigen,
  selectPostedUniProtAntigens,
} from "./slice";
import { useDispatch, useSelector } from "react-redux";
import { selectCurrentProject } from "../project/slice";

export default function AddUniProtAntigenView() {
  const dispatch = useDispatch();
  const antigens = useSelector(selectPostedUniProtAntigens);
  const loading = useSelector(selectLoadingAntigen);
  const currentProject = useSelector(selectCurrentProject);
  const [accessionNumber, setAccessionNumber] = useState<string>("");

  const submit = () => {
    if (currentProject)
      dispatch(
        postUniProtAntigen({
          project: currentProject.short_title,
          uniprot_accession_number: accessionNumber,
        })
      );
  };

  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <Typography variant="h4">
            Add new antigen from UniProt database
          </Typography>
          <Stack direction="row" spacing={2}>
            <TextField
              required
              label="UniProt Accessation Number"
              value={accessionNumber}
              onChange={(evt) => {
                setAccessionNumber(evt.target.value);
              }}
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
          {antigens.map((antigen) => (
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                {antigen.name}
              </AccordionSummary>
              <AccordionDetails>
                <AntigenInfo antigen={antigen} />
              </AccordionDetails>
            </Accordion>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}
