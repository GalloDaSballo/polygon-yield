import { useQuery } from "@apollo/client";
import { AccountData } from "../types";
import { GET_LEADERBOARD, protocolClient } from "../utils/graphql";

const useLeaderboard = (
  orderBy: string,
  orderDirection: string
): AccountData[] => {
  const { data } = useQuery(GET_LEADERBOARD, {
    variables: { orderBy, orderDirection },
    pollInterval: 10000,
    fetchPolicy: "cache-and-network",
    client: protocolClient,
  });
  return data?.accounts || [];
};

export default useLeaderboard;
