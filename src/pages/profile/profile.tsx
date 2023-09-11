import {
  Avatar,
  Card,
  CardActions,
  CardContent,
  Chip,
  IconButton,
  Typography,
} from "@mui/material";
import PermIdentityIcon from "@mui/icons-material/PermIdentity";
import EmailIcon from "@mui/icons-material/Email";
import LocationCityIcon from "@mui/icons-material/LocationCity";
import EditIcon from "@mui/icons-material/Edit";
import "./profile.css";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import IUserInfo from "src/entities/userinfo";

const Profile = () => {
  const [userInfo, setUserInfo] = useState<IUserInfo>();
  useEffect(() => {
    const userInfoString = localStorage.getItem('userInfo');

    if (userInfoString) {
      const parsedUserInfo = JSON.parse(userInfoString);
      setUserInfo(parsedUserInfo);
    }
  }, []);
  return (
    <div className='container'>
      <Card>
        <CardContent>
          <div className='avatar-row'>
            <Avatar className='avatar' sx={{ width: 60, height: 60 }}>
              <PermIdentityIcon />
            </Avatar>
            <Typography gutterBottom variant='h5' component='div'>
              {userInfo?.name}
            </Typography>
            <div className='edit-icon'>
            <Link to="/profile/edit" target="_blank">
              <IconButton aria-label='edit'>
                <EditIcon />
              </IconButton>
            </Link>
            </div>
          </div>
        </CardContent>
        <CardActions>
          <div className='left-actions'>
            <IconButton aria-label='add to favorites'>
              <EmailIcon /> 
            </IconButton>
            {userInfo?.email}
            <IconButton aria-label='share'>
              <LocationCityIcon />
            </IconButton>
            {userInfo?.city}
          </div>
          <div className='right-actions'>
            <Chip label='Guide' color='secondary' />
          </div>
        </CardActions>
      </Card>
    </div>
  );
};

export default Profile;
