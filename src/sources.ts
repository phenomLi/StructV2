
// 连接目标信息
export type LinkTarget = number | string;

// 结点连接声明
export type sourceLinkData = LinkTarget | LinkTarget[];

// 结点指针声明
export type sourcePointerData = string | string[];

// 源数据单元
export interface SourceElement {
    id: string | number;
    [key: string]: any | sourceLinkData | sourcePointerData;
}


export type Sources = {
    [key: string]: { data: SourceElement[]; layouter: string; }
};
    


