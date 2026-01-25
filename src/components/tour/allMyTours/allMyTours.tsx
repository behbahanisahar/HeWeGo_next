import { useEffect, useState } from "react";
import { getAllTours } from "@/api/tour/get";
import { IAllTourItems } from "src/entities/tour";
import { MyTourCard } from "../myTourCard/myTourCard";
import { useNavigate, useParams } from "react-router-dom";
import { Pagination } from "@/components/ui/pagination";

export const AllMyTours = () => {
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
    <div className="space-y-4">
      {tours.map((tour: IAllTourItems, index: number) => (
        <div key={tour.id}>
          <MyTourCard tour={tour} />
          {index < tours.length - 1 && (
            <hr className="my-4 border-border" />
          )}
        </div>
      ))}
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
