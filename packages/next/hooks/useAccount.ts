import { useQuery } from "@apollo/client";
import { AccountData } from "../types";
import { GET_ACCOUNT_DATA, protocolClient } from "../utils/graphql";

const useAccount = (address: string): AccountData | null => {
  console.log("useAccount address", address);

  const { data } = useQuery(GET_ACCOUNT_DATA, {
    variables: { address: address?.toLowerCase() },
    pollInterval: 10000,
    fetchPolicy: "cache-and-network",
    client: protocolClient,
  });
  return data?.account;
};

export default useAccount;
