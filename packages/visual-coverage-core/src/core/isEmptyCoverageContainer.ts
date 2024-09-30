import type { ChildData } from '../types';

type Params = {
    childrenData: Array<ChildData>;
};

export function isEmptyCoverageContainer({ childrenData }: Params): boolean {
    // It happens when a direct child of a DS visual coverage container... is another DS visual
    // coverage container! This makes the parent count stopping immediately, and the parent is
    // discarded here. The common use case is
    // 1. FE Squad added ds visual coverage containers to all the services' index pages
    // 2. Every single page also add containers to their root
    return childrenData.length === 0;
}
