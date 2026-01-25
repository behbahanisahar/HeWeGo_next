import { useEffect, useState } from "react";
import { getAllTours } from "@/api/tour/get";
import { IAllTourItems } from "src/entities/tour";
import { useNavigate, useParams } from "react-router-dom";
import { AllTourCard } from "../allTourCard/allTourCard";
import { Pagination } from "@/components/ui/pagination";

export const AllTours = () => {
  const [tours, setTours] = useState<IAllTourItems[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalNumberOfTours = 100;
  const navigate = useNavigate();
  const { page, per_page } = useParams();

  useEffect(() => {
    const pageParam = page ? parseInt(page, 10) : 1;
    const perPageParam = per_page ? parseInt(per_page, 10) : itemsPerPage;

    setCurrentPage(pageParam);

    getAllTours(pageParam, perPageParam)
      .then((data) => {
        setTours(data.items);
      })
      .catch((error) => {
        console.error("Error fetching tours:", error);
      });
  }, [page, per_page]);

  const handlePageChange = (page: number) => {
    navigate(`/tour/${page}/${itemsPerPage}`);
  };

  const totalPages = Math.ceil(totalNumberOfTours / itemsPerPage);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {tours.map((tour: IAllTourItems) => (
          <AllTourCard key={tour.id} tour={tour} />
        ))}
      </div>
      <div className="flex justify-center pt-4">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
};
