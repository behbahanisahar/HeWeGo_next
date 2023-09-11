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
import { ILoginPostData, ILoginResponse, postLoginData } from "@/api/login/post";
import { CopyRight } from "@/components/copyRight/copyRight";
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

function LogIn() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ILoginPostData>({
    username: "",
    password: "",
  });
  const [error, setError] = useState<boolean>();
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
        await postLoginData(formData).then((l:ILoginResponse)=>{
        localStorage.setItem('userInfo', JSON.stringify(l.user));
      })
      toast('You are logged in successfully!', {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        });
      navigate('/tour');
    } catch (error) {
      setError(true);
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
          Sign in
        </Typography>
        <Box component='form' onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField
            margin='normal'
            required
            fullWidth
            id='email'
            label='Email Address'
            name='username'
            autoComplete='email'
            autoFocus
            value={formData.username}
            onChange={handleChange}
            error={error}
          />
          <TextField
            margin='normal'
            required
            fullWidth
            name='password'
            label='Password'
            type='password'
            id='password'
            autoComplete='current-password'
            value={formData.password}
            onChange={handleChange}
            error={error}
          />
          <FormControlLabel
            control={<Checkbox value='remember' color='primary' />}
            label='Remember me'
            />
           {/* todo: should add logic for this */}
          <Button
            type='submit'
            fullWidth
            variant='contained'
            sx={{ mt: 3, mb: 2 }}
          >
              Sign In
          </Button>
          <Grid container>
            <Grid item xs>
              <Link href='#' variant='body2'>
                Forgot password?
              </Link>
            </Grid>
            <Grid item>
              <Link href='/register' variant='body2'>
                {"Don't have an account? Sign Up"}
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Box>
      <CopyRight sx={{ marginTop: 5 }} />
    </Container>
  );
}

export default LogIn;
