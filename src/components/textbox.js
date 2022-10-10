import * as React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';

export default function TextBox() {
  return (
    <Box
      component="form"
      sx={{
        '& > :not(style)': { m: 1, width: '25ch', 
        position: 'absolute',
        right: '45%',
        bottom: 15,
        backgroundColor: '#b9faac'},
      }}
      noValidate
      autoComplete="off"
    >
      <TextField id="outlined-basic" label="Prompt" variant="outlined" />
    </Box>
  );
}