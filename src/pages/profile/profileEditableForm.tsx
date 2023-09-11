import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { useState } from "react";
import { CopyRight } from "@/components/copyRight/copyRight";
import { IProfilePostData } from "@/api/profile/post";
import EditIcon from "@mui/icons-material/Edit";

const ProfileEditableForm =()=> {
  const [formData, setFormData] = useState<IProfilePostData>({
    name: "",
    email: "",
    city:'',
  });
  const [error, setError] = useState<boolean>();
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(false);
  };

  return (
    <Container component='main' maxWidth='xs'>
      <CssBaseline />
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
          <EditIcon />
        </Avatar>
        <Typography component='h1' variant='h5'>
Edit Profile
        </Typography>
        <Box component='form' onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
        <TextField
            margin='normal'
            required
            fullWidth
            id='name'
            label='Name'
            name='name'
            autoFocus
            value={formData.name}
            onChange={handleChange}
            error={error}
          />
          <TextField
            margin='normal'
            required
            fullWidth
            id='email'
            label='Email Address'
            name='name'
            autoComplete='email'
            autoFocus
            value={formData.email}
            onChange={handleChange}
            error={error}
          />
          <TextField
            margin='normal'
            required
            fullWidth
            name='city'
            label='city'
            id='city'
            value={formData.city}
            onChange={handleChange}
            error={error}
          />
          <Button
            type='submit'
            fullWidth
            variant='contained'
            sx={{ mt: 3, mb: 2 }}
          >
            Submit
          </Button>
        </Box>
      </Box>
      <CopyRight sx={{ marginTop: 5 }} />
    </Container>
  );
}

export default ProfileEditableForm;
