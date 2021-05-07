import { useQuery } from "@apollo/client";
import { Post } from "../types";
import { GET_POST_QUERY } from "../utils/graphql";

const usePost = (postId: string): Post | null => {
  const { data } = useQuery(GET_POST_QUERY, {
    variables: { postId },
    pollInterval: 2000,
    fetchPolicy: "cache-and-network",
  });

  return data?.posts?.[0] || null;
};

export default usePost;
