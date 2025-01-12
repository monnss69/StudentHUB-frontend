import { QUERY_KEYS } from "@/constants/queryKeys";
import Feed from "@/components/Feed";
import React from "react";

const PlatformSupport: React.FC = () => {
  return (
    <Feed
      category="Platform Support"
      queryKey={QUERY_KEYS.PLATFORM_SUPPORT}
      title="Platform Support"
      sidebarCategory="Support"
    />
  );
};

export default PlatformSupport;