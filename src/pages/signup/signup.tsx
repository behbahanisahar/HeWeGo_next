import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Link from "@mui/material/Link";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { useState } from "react";
import { ISignUpPostData, postSignUpData } from "@/api/signUp/post";
import { CopyRight } from "@/components/copyRight/copyRight";
import InfoIcon from "@mui/icons-material/Info";

interface IFieldErrors {
  name: boolean;
  email: boolean;
  password: boolean;
  confirmPassword: boolean;
  city: boolean;
}
export default function SignUp() {
  const [formData, setFormData] = useState<ISignUpPostData>({
    name: "",
    password: "",
    email: "",
    city: "",
    confirmPassword: "",
  });
  const [fieldErrors, setFieldErrors] = useState<IFieldErrors>({
    name: false,
    email: false,
    password: false,
    confirmPassword: false,
    city: false,
  });
  const [message, setMessage] = useState<string>("");
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage("");
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setFieldErrors({ ...fieldErrors, [name]: false });
  };
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newFieldErrors = {
      name: formData.name.trim() === "",
      email: formData.email.trim() === "",
      password: formData.password.trim() === "",
      confirmPassword: formData.confirmPassword?.trim() === "",
      city: formData.city.trim() === "",
    };

    setFieldErrors(newFieldErrors);
    const formIsValid = !Object.values(newFieldErrors).some((error) => error);
    if (formIsValid)
      try {
        await postSignUpData(formData);
      } catch (error: any) {
        setMessage(error.message);
      }
    else {
      setMessage("Please fill in all mandatory fields!");
    }
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
          <LockOutlinedIcon />
        </Avatar>
        <Typography component='h1' variant='h5'>
          Sign up
        </Typography>
        <Box component='form' noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={12}>
              <TextField
                autoComplete='given-name'
                name='name'
                required
                fullWidth
                id='name'
                label='Full Name'
                autoFocus
                onChange={handleChange}
                error={fieldErrors.name}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id='email'
                label='Email Address'
                name='email'
                autoComplete='email'
                onChange={handleChange}
                error={fieldErrors.email}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                name='password'
                label='Password'
                type='password'
                id='password'
                autoComplete='new-password'
                onChange={handleChange}
                error={fieldErrors.password}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                name='confirmPassword'
                label='Confirm Password'
                type='password'
                id='confirmPassword'
                autoComplete='confirm-password'
                onChange={handleChange}
                error={fieldErrors.confirmPassword}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                name='city'
                label='City'
                id='city'
                autoComplete='confirm-password'
                onChange={handleChange}
                error={fieldErrors.city} //to be: should be city dropdown in the future
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={<Checkbox value='allowExtraEmails' color='primary' />}
                label='I want to receive inspiration, marketing promotions and updates via email.'
              />
            </Grid>
            {message && (
              <Grid item xs={12} sx={{ display: "flex", alignItems: "center" }}>
                <InfoIcon color='secondary' />
                <Typography color='secondary'>{message}</Typography>
              </Grid>
            )}
          </Grid>
          <Button
            type='submit'
            fullWidth
            variant='contained'
            sx={{ mt: 3, mb: 2 }}
          >
            Sign Up
          </Button>
          <Grid container justifyContent='flex-end'>
            <Grid item>
              <Link href='/login' variant='body2'>
                Already have an account? Sign in
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Box>
      <CopyRight sx={{ marginTop: 5 }} />
    </Container>
  );
}
