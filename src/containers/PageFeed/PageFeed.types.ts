export interface FeedProps {
    category: string;
    queryKey: [string, string];
    title: string;
    sidebarCategory: "Academic" | "Community" | "Support";
}