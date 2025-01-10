interface ArticleTree {
    index: string;
    text: string;
    link?: string;
    lastUpdated?: number;
    collapsible?: true;
    collapsed?: boolean;
    items?: ArticleTree[];
    category?: string;
}
declare function calculateSidebar(targets?: Array<string | {
    folderName: string;
    separate: boolean;
}>, base?: string): ArticleTree[] | Record<string, ArticleTree[]>;

export { calculateSidebar };
