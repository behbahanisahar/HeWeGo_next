import { Container, Typography, Grid, Card, CardContent, CardMedia, Button } from '@material-ui/core';
import './home.css';
import {destinations} from "@/constants/constants";



const HomePage = () => {
  return (
    <Container className="container">
      <Typography variant="h4" className="heading">
        Welcome to HeWeGo
      </Typography>
      <Typography variant="h6" className="sub-heading">
        The City is Yours to Discover!
      </Typography>
      <Grid container spacing={3}>
        {destinations.map((destination, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card className={`card card-hovered`}>
              <CardMedia
                className={`card-media`}
                image={destination.image}
                title={destination.title}
              />
              <CardContent className={`card-content`}>
                <Typography variant="h6">{destination.title}</Typography>
                <Typography variant="body2" color="textSecondary">
                  {destination.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <div className="explore-section">
        <Typography variant="h5">Explore More Destinations</Typography>
        <Typography variant="body2" className="text-secondary">
          Discover a world of amazing places waiting for you to explore.
        </Typography>
        <Button variant="outlined" className='explore-button'>
          Explore Now
        </Button>
      </div>
    </Container>
  );
};

export default HomePage;
