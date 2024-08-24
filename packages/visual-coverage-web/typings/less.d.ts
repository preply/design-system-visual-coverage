declare module '*.less' {
    const styles: { __id: string; __css: string } & Record<string, string>;
    export default styles;
}
