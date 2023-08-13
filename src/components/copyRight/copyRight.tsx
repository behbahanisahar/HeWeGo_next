import { siteUrl } from "@/constants/constants";
import { Link, Typography } from "@mui/material";

interface ICopyrightProps {
    sx?: React.CSSProperties;
  }
export const CopyRight =({sx}: ICopyrightProps) =>{
    return (
        <Typography variant="body2" color="text.secondary" align="center" sx={sx}>
          {'Copyright © '}
          <Link color="inherit" href={siteUrl}>
          HeWeGo
          </Link>{' '}
          {new Date().getFullYear()}
          {'.'}
        </Typography>
      );
}