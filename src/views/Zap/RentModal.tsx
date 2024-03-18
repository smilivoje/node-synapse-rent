import { Box, Dialog, DialogTitle, FormControl, Link, TextField, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import { Signer, ethers } from "ethers";
import { Icon, PrimaryButton } from "@olympusdao/component-library";
import axios from "axios";
import { ChangeEvent, FC, FormEvent, SetStateAction, useEffect, useState } from "react";
import React from "react";
import { toast } from "react-hot-toast";
import { messages } from "src/constants/messages";
import apiRequest from "src/helpers/connections";
import { getValidChainId } from "src/constants/data";
import { useAccount, useNetwork, useSigner } from "wagmi";
import { Providers } from "src/helpers/providers/Providers/Providers";
import { NetworkId } from "src/networkDetails";
import { clearPendingTxn, fetchPendingTxns } from "../../slices/PendingTxnsSlice";
import { AsyncThunkAction, Dispatch, AnyAction } from "@reduxjs/toolkit";
import { useDispatch } from "react-redux";
import { NODE_MANAGER } from "src/constants/addresses";
import { NftManagerContract__factory, NodeRentContract__factory } from "src/typechain";
import { sleep } from "src/helpers/sleep";

const PREFIX = "RentModal";
const classes = {
  root: `${PREFIX}-root`,
};

const StyledDialog = styled(Dialog)(({ theme }) => ({
  [`& .${classes.root}`]: {
    [theme.breakpoints.down("md")]: {
      paddingInline: "16px",
    },
    [theme.breakpoints.up("sm")]: {
      paddingInline: "64px",
    },
  },
}));

export interface RentModal {
  handleClose: () => void;
  modalOpen: boolean;
  currentNode: number;
  NodePrice: number;
  // setCustomNode: { (value: SetStateAction<string>): void; (arg0: string): void };
}

interface FormData {
  rent_sshkey: string;
}

interface AuthState {
  loggedIn: boolean;
}

const RentModal: FC<RentModal> = ({ handleClose, modalOpen, currentNode, NodePrice }) => {
  const { address = "", isConnected } = useAccount();
  const { chain = { id: 1 } } = useNetwork();
  const provider = Providers.getStaticProvider(getValidChainId(chain.id) as NetworkId);
  const { data: signer } = useSigner();

  const [formData, setFormData] = useState<FormData>({
    rent_sshkey: "",
  });

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = event.target;
    setFormData({ ...formData, [id]: value });
  };

  const auth: { state: boolean } = {
    state: false,
  };
  auth.state = true;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const responseReg = await apiRequest(
        "regist/approverent",
        {
          currentNode: currentNode,
          rent_sshkey: formData.rent_sshkey,
        },
        "POST",
        undefined,
      );

      toast.success(messages.tx_successfully_send);
    } catch (error: any) {
      if (error?.info?.error?.status === 422) {
        toast.error(messages.error_422);
      } else {
        toast.error(messages.error_else);
      }
    }

    await sleep(1);
    handleClose();
  };

  return (
    <StyledDialog
      onClose={handleClose}
      open={modalOpen}
      fullWidth
      maxWidth="xs"
      PaperProps={{ sx: { borderRadius: "9px" } }}
    >
      <DialogTitle>
        <Box display="flex" flexDirection="row" alignItems="center" justifyContent="space-between">
          <Box />
          <Box>
            <Typography id="migration-modal-title" variant="h6" component="h2" style={{ textAlign: "center" }}>
              Would you like to rent node-{currentNode}?
            </Typography>
          </Box>
          <Link onClick={handleClose} alignItems="center">
            <Icon name="x" />
          </Link>
        </Box>
      </DialogTitle>
      <Box paddingBottom="15px" className={classes.root}>
      </Box>
      <Box paddingBottom="15px" margin={"25px"}>
        <FormControl fullWidth sx={{ paddingBottom: "10px" }}>
          <Typography>New SSK</Typography>
          <TextField
            id="rent_sshkey"
            type="text"
            placeholder="Type a new ssk for rent"
            // value={"Node " + currentNode}
            style={{ marginBottom: "20px", background: "#030712", borderRadius: "12px" }}
            onChange={handleChange}
            required
          />
          <Box display="flex" justifyContent={"space-between"}>
            <PrimaryButton onClick={handleClose}>
              <Typography fontWeight="500" style={{ color: "#fff" }}>{`Cancel`}</Typography>
            </PrimaryButton>
            <PrimaryButton onClick={handleSubmit}>
              <Typography fontWeight="500" style={{ color: "#fff" }}>{`Approve`}</Typography>
            </PrimaryButton>
          </Box>
        </FormControl>
      </Box>
    </StyledDialog>
  );
};

export default RentModal;
