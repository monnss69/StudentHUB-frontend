import { QUERY_KEYS } from "@/constants/queryKeys";
import Feed from "@/components/Feed";
import React from "react";

const CampusCommunity: React.FC = () => {
  return (
    <Feed
      category="Campus Community"
      queryKey={QUERY_KEYS.CAMPUS_COMMUNITY}
      title="Campus Community"
      sidebarCategory="Community"
    />
  );
};

export default CampusCommunity;