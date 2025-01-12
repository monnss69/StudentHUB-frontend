import { QUERY_KEYS } from "@/constants/queryKeys";
import Feed from "@/components/Feed";
import React from "react";

const AcademicHub: React.FC = () => {
  return (
    <Feed
      category="Academic Hub"
      queryKey={QUERY_KEYS.ACADEMIC_HUB}
      title="Academic Hub"
      sidebarCategory="Academic"
    />
  );
};

export default AcademicHub;