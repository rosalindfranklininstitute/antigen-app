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
import {
  postNanobody,
  selectLoadingNanobody,
  selectPostedNanobodies,
} from "./slice";

export default function AddNanobodyView() {
  const dispatch = useDispatch();
  const nanobodies = useSelector(selectPostedNanobodies);
  const loading = useSelector(selectLoadingNanobody);

  const submit = async () => {
    dispatch(postNanobody());
  };

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
          {nanobodies.map((nanobody, idx) => (
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
