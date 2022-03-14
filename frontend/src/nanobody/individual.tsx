import { Card, CardContent, Stack, Typography } from "@mui/material";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { LoadingPaper, FailedRetrievalPaper } from "../utils/api";
import { getNanobody, selectLoadingNanobody, selectNanobody } from "./slice";
import { NanobodyInfo, NanobodyRef } from "./utils";

type StrNanobodyRef = { [K in keyof NanobodyRef]: string };

export default function NanobodyView() {
  const { project, number: number_str } =
    useParams<StrNanobodyRef>() as StrNanobodyRef;
  const number = parseInt(number_str);
  const dispatch = useDispatch();
  const nanobody = useSelector(selectNanobody({ project, number }));
  const loading = useSelector(selectLoadingNanobody);

  useEffect(() => {
    dispatch(getNanobody({ project, number }));
  }, [dispatch, project, number]);

  if (loading)
    return <LoadingPaper text="Retrieving nanobody from database." />;
  if (!nanobody)
    return (
      <FailedRetrievalPaper
        text={`Could not retrieve entry for ${project}:${number}`}
      />
    );

  return (
    <Card>
      <CardContent>
        <Stack>
          <Typography variant="h4">{nanobody.name}</Typography>
          <NanobodyInfo nanobodyRef={{ project, number }} />
        </Stack>
      </CardContent>
    </Card>
  );
}
