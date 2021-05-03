import { useQuery } from "@apollo/client";
import { ReserveData } from "../types";
import { GET_RESERVE_DATA } from "../utils/graphql";

const useReserve = (reserveAddress: string): ReserveData | null => {
  const { data } = useQuery(GET_RESERVE_DATA, {
    variables: { reserveAddress },
    pollInterval: 2000,
    fetchPolicy: "cache-and-network",
  });

  return data?.reserves?.[0] || null;
};

export default useReserve;
