import { Card, CardContent, Stack, Typography } from "@mui/material";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { LoadingPaper, FailedRetrievalPaper } from "../utils/api";
import { getAntigen, selectAntigen, selectLoadingAntigen } from "./slice";
import { AntigenInfo, AntigenRef } from "./utils";

type StrAntigenRef = { [K in keyof AntigenRef]: string };

/**
 * A MUI Card containing a antigen name header and antigen information table.
 * Antigen information is retrieved from the redux store with a dispatch
 * executed to obtain it if unavailable
 *
 * @returns A MUI Card containing antigen name and antigen information table
 */
export default function AntigenView() {
  const { project, number: number_str } =
    useParams<StrAntigenRef>() as StrAntigenRef;
  const number = parseInt(number_str);
  const dispatch = useDispatch();
  const antigen = useSelector(selectAntigen({ project, number }));
  const loading = useSelector(selectLoadingAntigen);

  useEffect(() => {
    dispatch(getAntigen({ project, number }));
  }, [dispatch, project, number]);

  if (loading) return <LoadingPaper text="Retrieving antigen from database." />;
  if (!antigen)
    return (
      <FailedRetrievalPaper
        text={`Could not retrieve entry for ${project}:${number}`}
      />
    );

  return (
    <Card>
      <CardContent>
        <Stack>
          <Typography variant="h4">{antigen.name}</Typography>
          <AntigenInfo antigen={{ project, number }} />
        </Stack>
      </CardContent>
    </Card>
  );
}
