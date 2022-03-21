import { createSlice, Draft, PayloadAction } from "@reduxjs/toolkit";
import {
  OptionsObject,
  SnackbarMessage,
  SnackbarProvider,
  useSnackbar,
} from "notistack";
import { ReactNode, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  getAntigen,
  getAntigens,
  postLocalAntigen,
  postUniProtAntigen,
} from "../antigen/slice";
import {
  getElisaPlate,
  getElisaPlates,
  postElisaPlate,
  putElisaPlate,
} from "../elisa_plate/slice";
import {
  getElisaWells,
  getElisaWell,
  postElisaWells,
  putElisaWell,
} from "../elisa_well/slice";
import { getNanobodies, getNanobody, postNanobodies } from "../nanobody/slice";
import { RootState } from "../store";
import { APIRejection, SnackifyAPIRejection } from "./api";

export type NotificationType = [SnackbarMessage, OptionsObject];

type NotificationsState = {
  notifications: Array<NotificationType>;
};

const initialNotificationsState: NotificationsState = {
  notifications: [],
};

const PostAPIRejectionSnack = (
  state: Draft<NotificationsState>,
  action: PayloadAction<{ apiRejection: APIRejection } | undefined>
) => {
  if (action.payload)
    state.notifications.push(
      SnackifyAPIRejection(
        action.payload.apiRejection
      ) as Draft<NotificationType>
    );
};

const notificationSlice = createSlice({
  name: "notifications",
  initialState: initialNotificationsState,
  reducers: {
    notify(state, action: PayloadAction<NotificationType>) {
      state.notifications.push(action.payload as Draft<NotificationType>);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getAntigens.rejected, PostAPIRejectionSnack);
    builder.addCase(getAntigen.rejected, PostAPIRejectionSnack);
    builder.addCase(postUniProtAntigen.rejected, PostAPIRejectionSnack);
    builder.addCase(postLocalAntigen.rejected, PostAPIRejectionSnack);
    builder.addCase(getNanobodies.rejected, PostAPIRejectionSnack);
    builder.addCase(getNanobody.rejected, PostAPIRejectionSnack);
    builder.addCase(postNanobodies.rejected, PostAPIRejectionSnack);
    builder.addCase(getElisaWells.rejected, PostAPIRejectionSnack);
    builder.addCase(getElisaWell.rejected, PostAPIRejectionSnack);
    builder.addCase(postElisaWells.rejected, PostAPIRejectionSnack);
    builder.addCase(putElisaWell.rejected, PostAPIRejectionSnack);
    builder.addCase(getElisaPlates.rejected, PostAPIRejectionSnack);
    builder.addCase(getElisaPlate.rejected, PostAPIRejectionSnack);
    builder.addCase(postElisaPlate.rejected, PostAPIRejectionSnack);
    builder.addCase(putElisaPlate.rejected, PostAPIRejectionSnack);
  },
});

export const notificationsReducer = notificationSlice.reducer;
export const { notify } = notificationSlice.actions;

const selectNotifications = (state: RootState) =>
  state.notifications.notifications;

export const useSnackbarNotifier = () => {
  const notifications = useSelector(selectNotifications);
  const { enqueueSnackbar } = useSnackbar();
  const [displayed, setDisplayed] = useState<number>(0);

  useEffect(() => {
    notifications.slice(displayed).forEach((notification) => {
      enqueueSnackbar(...notification);
      setDisplayed(displayed + 1);
    });
  }, [notifications, displayed, enqueueSnackbar]);
};

export const SnackbarNotifier = (props: { children: ReactNode }) => {
  const Notifier = (props: { children: ReactNode }) => {
    const notifications = useSelector(selectNotifications);
    const { enqueueSnackbar } = useSnackbar();
    const [displayed, setDisplayed] = useState<number>(0);

    useEffect(() => {
      notifications.slice(displayed).forEach((notification) => {
        enqueueSnackbar(...notification);
        setDisplayed(displayed + 1);
      });
    }, [notifications, displayed, enqueueSnackbar]);

    return <>{props.children}</>;
  };

  return (
    <SnackbarProvider>
      <Notifier>{props.children}</Notifier>
    </SnackbarProvider>
  );
};
