import { Card, CardContent, Stack, Typography } from "@mui/material";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { LoadingPaper, FailedRetrievalPaper } from "../utils/api";
import { getNanobody, selectLoadingNanobody, selectNanobody } from "./slice";
import { NanobodyInfo } from "./utils";

export default function NanobodyView() {
  const { uuid } = useParams<{ uuid: string }>() as { uuid: string };
  const dispatch = useDispatch();
  const nanobody = useSelector(selectNanobody(uuid));
  const loading = useSelector(selectLoadingNanobody);

  useEffect(() => {
    dispatch(getNanobody(uuid));
  }, [dispatch, uuid]);

  if (loading)
    return <LoadingPaper text="Retrieving nanobody from database." />;
  if (!nanobody)
    return (
      <FailedRetrievalPaper text={`Could not retrieve entry for ${uuid}`} />
    );

  return (
    <Card>
      <CardContent>
        <Stack>
          <Typography variant="h4">{nanobody.name}</Typography>
          <NanobodyInfo uuid={uuid} />
        </Stack>
      </CardContent>
    </Card>
  );
}
