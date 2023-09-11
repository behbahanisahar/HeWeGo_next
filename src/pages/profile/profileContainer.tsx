import { Grid, Paper } from "@mui/material";
import "./profile.css";
import Profile from "./profile";

const ProfileContainer = () => {
  return (
    <>
      <Grid container className='user-container' spacing={4}>
        <Grid item xs={12}>
          <Profile />
        </Grid>
        <Grid item xs={4}>
          <Paper>My tours</Paper>{" "}
        </Grid>
        <Grid item xs={4}>
          <Paper>Favorites</Paper>
        </Grid>
        <Grid item xs={4}>
          <Paper>Groups</Paper>
        </Grid>
      </Grid>
    </>
  );
};

export default ProfileContainer;
