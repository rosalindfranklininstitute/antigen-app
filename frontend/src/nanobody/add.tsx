import {
  Card,
  CardContent,
  Typography,
  Stack,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import SendIcon from "@mui/icons-material/Send";
import { NanobodyInfo } from "./utils";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useDispatch, useSelector } from "react-redux";
import { postNanobody, selectNanobodies } from "./slice";
import { DispatchType } from "../store";
import { useState } from "react";
import { filterUUID } from "../utils/state_management";

export default function AddNanobodyView() {
  const dispatch = useDispatch<DispatchType>();
  const nanobodies = useSelector(selectNanobodies);
  const [posted, setPosted] = useState<Array<string>>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const submit = async () => {
    setLoading(true);
    dispatch(postNanobody()).then(
      (uuid) => {
        setPosted(posted.concat(uuid));
        setLoading(false);
      },
      (_) => setLoading(false)
    );
  };

  const postedNanobodies = filterUUID(nanobodies, posted);

  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <Typography variant="h4">Add new nanobody</Typography>
          <Stack direction="row" spacing={2}>
            <LoadingButton
              variant="contained"
              loading={loading}
              endIcon={<SendIcon />}
              onClick={submit}
            >
              Submit
            </LoadingButton>
          </Stack>
          {postedNanobodies.map((nanobody, idx) => (
            <div>
              <Divider />
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  {nanobody.name}
                </AccordionSummary>
                <AccordionDetails>
                  <NanobodyInfo uuid={nanobody.uuid} />
                </AccordionDetails>
              </Accordion>
            </div>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}
