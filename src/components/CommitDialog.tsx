import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

export default function CommitDialog(props: {callback: (string?) => void }) {
  return (
    <>
      <Dialog
        open={true}
        onClose={x => props.callback()}
        PaperProps={{
          component: 'form',
          onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            const formJson = Object.fromEntries((formData as any).entries());
            props.callback(formJson.msg);
          },
        }}
      >
        <DialogTitle>Commit Changes</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Enter commit message for saving changes to repository:
          </DialogContentText>
          <TextField autoFocus required margin="dense" id="msg" name="msg" label="message" type="input" fullWidth variant="standard"/>
        </DialogContent>
        <DialogActions>
          <Button onClick={x => props.callback()}>Cancel</Button>
          <Button type="submit">Commit</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
