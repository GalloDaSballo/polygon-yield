import { useQuery } from "@apollo/client";
import { ProtocolData } from "../types";
import { GET_PROTOCOL_DATA, protocolClient } from "../utils/graphql";

const useProtocolStats = (version: string): ProtocolData | null => {
  const { data } = useQuery(GET_PROTOCOL_DATA, {
    variables: { version },
    pollInterval: 10000,
    fetchPolicy: "cache-and-network",
    client: protocolClient,
  });
  console.log("data", data);
  return data?.protocol;
};

export default useProtocolStats;
