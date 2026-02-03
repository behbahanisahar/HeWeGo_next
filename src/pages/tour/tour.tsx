import { AllTours } from "@/components/tour/allTour/allTours";
import { useTranslation } from 'react-i18next';
import { MapPin } from 'lucide-react';

const Tour = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen">
      {/* Modern page header */}
      <section className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-10 md:py-14 max-w-6xl">
          <div className="flex flex-col items-center text-center">
            <div className="inline-flex items-center justify-center gap-2 rounded-full bg-primary/10 text-primary px-4 py-2 mb-4">
              <MapPin className="h-4 w-4 shrink-0" />
              <span className="text-sm font-medium">{t('common.explore')}</span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-3">
              {t('tours.title')}
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl">
              {t('tours.subtitle')}
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 md:py-12 max-w-6xl">
        <AllTours />
      </div>
    </div>
  );
};

export default Tour;
