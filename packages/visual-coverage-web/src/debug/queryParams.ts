export function isLogQueryParamSet(query: string): boolean {
    return query.toLowerCase().includes('dsCovLog=1'.toLowerCase());
}
export function isVisualizeQueryParamSet(query: string): boolean {
    return query.toLowerCase().includes('dsCovVisualize=1'.toLowerCase());
}
export function isRunAndAlertParamSet(query: string): boolean {
    return query.toLowerCase().includes('dsCovRunAndAlert=1'.toLowerCase());
}
