import { AllTours } from "@/components/tour/allTour/allTours";
import { useTranslation } from 'react-i18next';

const Tour = () => {
  const { t } = useTranslation();
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-3">{t('tours.title')}</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {t('tours.subtitle')}
        </p>
      </div>
      <div className="max-w-6xl mx-auto">
        <AllTours />
      </div>
    </div>
  );
};

export default Tour;
