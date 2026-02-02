import { siteUrl } from "@/constants/constants";
import { Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';

interface ICopyrightProps {
  className?: string;
}

export const CopyRight = ({ className }: ICopyrightProps) => {
  const { t } = useTranslation();
  
  return (
    <p className={`text-sm text-muted-foreground text-center ${className || ""}`}>
      {t('copyright.text')}{' '}
      <Link to={siteUrl} className="text-primary hover:underline">
        HeWeGo
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </p>
  );
};
