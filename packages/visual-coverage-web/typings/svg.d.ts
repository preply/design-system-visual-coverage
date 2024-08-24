declare module '*.svg' {
    import React from 'react';

    const value: React.ComponentType<SVGAttributes<SVGElement>>;
    export = value;
}
