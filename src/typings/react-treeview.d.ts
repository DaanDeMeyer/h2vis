import * as React from "react";

interface Props {
    nodeLabel: any;
    collapsed?: boolean;
    defaultCollapsed?: boolean;
    className?: string;
    itemClassName?: string;
    childrenClassName?: string;
    treeViewClassName?: string;
}

export default class TreeView extends React.Component<Props> {}
