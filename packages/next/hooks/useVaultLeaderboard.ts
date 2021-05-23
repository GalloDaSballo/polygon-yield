import { useQuery } from "@apollo/client";
import { VaultAccountData } from "../types";
import { GET_VAULT_LEADERBOARD, protocolClient } from "../utils/graphql";

const useVaultLeaderboard = (
  vaultID: string,
  orderBy: string,
  orderDirection: string
): VaultAccountData[] => {
  const { data } = useQuery(GET_VAULT_LEADERBOARD, {
    variables: { vaultID, orderBy, orderDirection },
    pollInterval: 10000,
    fetchPolicy: "cache-and-network",
    client: protocolClient,
  });
  return data?.vault?.positions || [];
};

export default useVaultLeaderboard;
