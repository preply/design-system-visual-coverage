import { describe, expect, test, vi } from 'vitest';

import type { DsVisualCoverageDeNormalizedResult } from '../../visual-coverage-core/dist';

import { OnComplete } from './types';

import { createCalculateDsVisualCoverages } from '.';

/**
 * Id must be different for every page to avoid conflicts among parallel tests.
 */
function createPage({ id, html }: { id: string; html: string }) {
    const rootElement = document.createElement('div');
    rootElement.id = id;
    rootElement.innerHTML = html;
    document.body.appendChild(rootElement);

    return {
        rootElement,
        cleanup: () => {
            document.body.removeChild(rootElement);
        },
    };
}

async function calculateCoverage({ rootElement }: { rootElement: HTMLElement }) {
    const onCompleteMock = vi.fn<OnComplete>();
    const createCalculateDsVisualCoveragesResult = createCalculateDsVisualCoverages({
        log: true,
        rootElement,
        printAsciiArt: false,
        userType: 'anonymous',
        drawAndAppendSvg: false,
    });

    createCalculateDsVisualCoveragesResult?.run({
        onError: console.error,
        onComplete: onCompleteMock,
    });

    // Waiting for the coverage count to finish
    await expect.poll(() => onCompleteMock).toHaveBeenCalledOnce();

    return onCompleteMock;
}

const DSHeadingStub = `<h1 data-preply-ds-component='Heading'>DS coverage</h1>`;
const DSButtonStub = `<button data-preply-ds-component='Button'>DS button</button>`;
const NonDSButtonStub = `<button>Non DS button</button>`;

describe('createCalculateDsVisualCoverages', () => {
    describe('Happy paths', () => {
        test('When called against a simple page, should count the coverage and get the results', async () => {
            // --------------------------------------------------
            // ARRANGE
            const expectedMinimumCoverage = 90; // This could change if the components weight change
            const coverageContainerComponent = 'App';
            const coverageContainerTeam = 'design_system';

            const { cleanup, rootElement } = createPage({
                id: 'root1',
                html: `
                <div data-preply-ds-coverage='{"component":"${coverageContainerComponent}","team":"${coverageContainerTeam}"}'> <!-- Coverage container -->
                    ${DSHeadingStub}
                    ${DSButtonStub}
                    ${NonDSButtonStub}
                </div>
                `,
            });

            // --------------------------------------------------
            // ACT
            const onCompleteMock = await calculateCoverage({ rootElement });

            // --------------------------------------------------
            // ASSERT
            const call = onCompleteMock.mock.calls[0][0];

            const results: DsVisualCoverageDeNormalizedResult[] = call.dsVisualCoverageResults;
            expect(
                results.length,
                'The page contains only one coverage container, the result should contain just one coverage count',
            ).toBe(1);

            const firstResult = results[0];
            expect(firstResult.team).toBe(coverageContainerTeam);
            expect(firstResult.component).toBe(coverageContainerComponent);
            expect(firstResult.coverage).toBeGreaterThan(expectedMinimumCoverage);

            const { readablePixelCounts } = firstResult;
            expect(readablePixelCounts.utilDsComponent).toBe(0);
            expect(readablePixelCounts.rebrandComponent).toBe(0);
            expect(readablePixelCounts.layoutDsComponent).toBe(0);
            expect(readablePixelCounts.unknownDsComponent).toBe(0);
            expect(readablePixelCounts.outdatedDsComponent).toBe(0);

            // They are generic assertions not to rely on the specific number of pixels which depends
            // on the components weight. They are important because they are sent to DataDog.
            expect(readablePixelCounts.emptyPixel).toBeGreaterThan(0);
            expect(readablePixelCounts.uiDsComponent).toBeGreaterThan(0);
            expect(readablePixelCounts.nonDsComponent).toBeGreaterThan(0);

            cleanup();
        });

        test('When called against a simple page with two containers, should count the coverage and get the results', async () => {
            // --------------------------------------------------
            // ARRANGE
            const coverageContainerComponent1 = 'App1';
            const coverageContainerComponent2 = 'App2';
            const coverageContainerTeam1 = 'team1';
            const coverageContainerTeam2 = 'team2';
            const { cleanup, rootElement } = createPage({
                id: 'root2',
                html: `
            <div data-preply-ds-coverage='{"component":"${coverageContainerComponent1}","team":"${coverageContainerTeam1}"}'> <!-- Coverage container -->
                ${DSHeadingStub}
            </div>
            <div data-preply-ds-coverage='{"component":"${coverageContainerComponent2}","team":"${coverageContainerTeam2}"}'> <!-- Coverage container -->
                ${DSHeadingStub}
            </div>
            `,
            });

            // --------------------------------------------------
            // ACT
            const onCompleteMock = await calculateCoverage({ rootElement });

            // --------------------------------------------------
            // ASSERT
            const call = onCompleteMock.mock.calls[0][0];

            const results = call.dsVisualCoverageResults;
            expect(
                results.length,
                'The page contains two coverage containers, the result should contain two counts',
            ).toBe(2);

            // Results are sorted because the order is not guaranteed
            const sortedResults = results.sort((a, b) => a.team.localeCompare(b.team));
            const teamsAndComponents = sortedResults.map(obj => ({
                team: obj.team,
                component: obj.component,
            }));
            expect(teamsAndComponents).toStrictEqual([
                {
                    component: coverageContainerComponent1,
                    team: coverageContainerTeam1,
                },
                {
                    component: coverageContainerComponent2,
                    team: coverageContainerTeam2,
                },
            ]);

            cleanup();
        });

        test('When there are containers direct child of other containers, should ignore them', async () => {
            // --------------------------------------------------
            // ARRANGE
            const coverageContainerComponent = 'App';

            const { cleanup, rootElement } = createPage({
                id: 'root3',
                html: `
            <div data-preply-ds-coverage='{"component":"emptyCoverageContainer1","team":"design_system"}'> <!-- Empty coverage container -->
                <div data-preply-ds-coverage='{"component":"emptyCoverageContainer2","team":"design_system"}'> <!-- Empty coverage container -->
                    <div data-preply-ds-coverage='{"component":"${coverageContainerComponent}","team":"design_system"}'> <!-- Coverage container -->
                        ${DSHeadingStub}
                    </div>
                </div>
            </div>
            `,
            });

            // --------------------------------------------------
            // ACT
            const onCompleteMock = await calculateCoverage({ rootElement });

            // --------------------------------------------------
            // ASSERT
            const call = onCompleteMock.mock.calls[0][0];

            const results = call.dsVisualCoverageResults;
            expect(
                results.length,
                'The page contains empty containers that should be ignored',
            ).toBe(1);

            const firstResult = results[0];
            expect(firstResult.component).toBe(coverageContainerComponent);

            cleanup();
        });

        test('When there is a container without children, should ignore it', async () => {
            // --------------------------------------------------
            // ARRANGE
            const { cleanup, rootElement } = createPage({
                id: 'root4',
                html: `
                <div>
                    <div data-preply-ds-coverage='{"component":"containerWithNoChildren","team":"design_system"}'>
                         <!-- Empty coverage container -->
                    </div>
                </div>
            `,
            });

            // --------------------------------------------------
            // ACT
            const onCompleteMock = await calculateCoverage({ rootElement });

            // --------------------------------------------------
            // ASSERT
            const call = onCompleteMock.mock.calls[0][0];

            const results = call.dsVisualCoverageResults;

            expect(results.length).toBe(0);

            cleanup();
        });

        test('When there is an icon from the DS, should count it', async () => {
            // --------------------------------------------------
            // ARRANGE
            const { cleanup, rootElement } = createPage({
                id: 'root4',
                html: `
                    <div data-preply-ds-coverage='{"component":"App","team":"design_system"}'>
                         <svg data-preply-ds-component="SvgTokyoUIIcon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <path d="m17.1 14.275-1.225-1.225c.367-.434.646-.909.837-1.425A4.634 4.634 0 0 0 17 10c0-.667-.133-1.3-.4-1.9a5.274 5.274 0 0 0-1.1-1.6l1.2-1.2a6.972 6.972 0 0 1 1.475 2.15c.35.8.525 1.65.525 2.55 0 .8-.142 1.562-.425 2.287a7.15 7.15 0 0 1-1.175 1.988ZM14.125 11.3 10.7 7.875c.2-.117.408-.209.625-.275.217-.067.442-.1.675-.1.7 0 1.292.241 1.775.725.483.483.725 1.075.725 1.775 0 .233-.033.458-.1.675a2.97 2.97 0 0 1-.275.625Zm5.375 5.35-1.2-1.2a7.604 7.604 0 0 0 1.5-2.538 8.666 8.666 0 0 0-.113-6.1A7.969 7.969 0 0 0 17.9 4.1l1.2-1.2c.917.966 1.63 2.058 2.137 3.275A9.825 9.825 0 0 1 22 10c0 1.233-.213 2.42-.638 3.562A9.68 9.68 0 0 1 19.5 16.65Zm.275 5.95L13 15.825V21h-2v-7.175L7 9.85V10c0 .666.133 1.3.4 1.9.267.6.633 1.133 1.1 1.6l-1.2 1.2a6.971 6.971 0 0 1-1.475-2.15c-.35-.8-.525-1.65-.525-2.55 0-.284.017-.559.05-.825.033-.267.092-.542.175-.825L4.25 7.075c-.183.483-.32.966-.413 1.45A7.899 7.899 0 0 0 3.7 10c0 1.1.204 2.162.612 3.187A7.969 7.969 0 0 0 6.1 15.9l-1.2 1.2a10.742 10.742 0 0 1-2.138-3.275A9.824 9.824 0 0 1 2 10a9.753 9.753 0 0 1 .95-4.225L1.4 4.225 2.8 2.8l18.4 18.4-1.425 1.4Z"/>
                        </svg>
                    </div>
            `,
            });

            // --------------------------------------------------
            // ACT
            const onCompleteMock = await calculateCoverage({ rootElement });

            // --------------------------------------------------
            // ASSERT
            const call = onCompleteMock.mock.calls[0][0];
            const results = call.dsVisualCoverageResults;
            const firstResult = results[0];
            expect(firstResult.coverage).toBe(100);

            cleanup();
        });

        test('When there is an illustration from the DS, should count it', async () => {
            // --------------------------------------------------
            // ARRANGE
            const { cleanup, rootElement } = createPage({
                id: 'root4',
                html: `
                    <div data-preply-ds-coverage='{"component":"App","team":"design_system"}'>
                         <svg data-preply-ds-component="SvgTokyoUIIllustration" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <!-- Please note the following is an icon, but from a DS coverage perspective only its data-preply-ds-component counts -->
                            <path d="m17.1 14.275-1.225-1.225c.367-.434.646-.909.837-1.425A4.634 4.634 0 0 0 17 10c0-.667-.133-1.3-.4-1.9a5.274 5.274 0 0 0-1.1-1.6l1.2-1.2a6.972 6.972 0 0 1 1.475 2.15c.35.8.525 1.65.525 2.55 0 .8-.142 1.562-.425 2.287a7.15 7.15 0 0 1-1.175 1.988ZM14.125 11.3 10.7 7.875c.2-.117.408-.209.625-.275.217-.067.442-.1.675-.1.7 0 1.292.241 1.775.725.483.483.725 1.075.725 1.775 0 .233-.033.458-.1.675a2.97 2.97 0 0 1-.275.625Zm5.375 5.35-1.2-1.2a7.604 7.604 0 0 0 1.5-2.538 8.666 8.666 0 0 0-.113-6.1A7.969 7.969 0 0 0 17.9 4.1l1.2-1.2c.917.966 1.63 2.058 2.137 3.275A9.825 9.825 0 0 1 22 10c0 1.233-.213 2.42-.638 3.562A9.68 9.68 0 0 1 19.5 16.65Zm.275 5.95L13 15.825V21h-2v-7.175L7 9.85V10c0 .666.133 1.3.4 1.9.267.6.633 1.133 1.1 1.6l-1.2 1.2a6.971 6.971 0 0 1-1.475-2.15c-.35-.8-.525-1.65-.525-2.55 0-.284.017-.559.05-.825.033-.267.092-.542.175-.825L4.25 7.075c-.183.483-.32.966-.413 1.45A7.899 7.899 0 0 0 3.7 10c0 1.1.204 2.162.612 3.187A7.969 7.969 0 0 0 6.1 15.9l-1.2 1.2a10.742 10.742 0 0 1-2.138-3.275A9.824 9.824 0 0 1 2 10a9.753 9.753 0 0 1 .95-4.225L1.4 4.225 2.8 2.8l18.4 18.4-1.425 1.4Z"/>
                        </svg>
                    </div>
            `,
            });

            // --------------------------------------------------
            // ACT
            const onCompleteMock = await calculateCoverage({ rootElement });

            // --------------------------------------------------
            // ASSERT
            const call = onCompleteMock.mock.calls[0][0];
            const results = call.dsVisualCoverageResults;
            const firstResult = results[0];
            expect(firstResult.coverage).toBe(100);

            cleanup();
        });

        test('When there is invisible component, should not count it', async () => {
            // --------------------------------------------------
            // ARRANGE
            const { cleanup, rootElement } = createPage({
                id: 'root4',
                html: `
                    <div data-preply-ds-coverage='{"component":"App","team":"design_system"}'>
                         ${NonDSButtonStub} <!-- Necessary otherwise the container is discarded because it's considered empty -->
                         <h1 data-preply-ds-component='Heading' style="display:none;">DS coverage</h1>
                    </div>
            `,
            });

            // --------------------------------------------------
            // ACT
            const onCompleteMock = await calculateCoverage({ rootElement });

            // --------------------------------------------------
            // ASSERT
            const call = onCompleteMock.mock.calls[0][0];
            const results = call.dsVisualCoverageResults;
            const firstResult = results[0];
            expect(firstResult.coverage).toBe(0);

            cleanup();
        });

        test('When there is component with no opacity, should not count it', async () => {
            // --------------------------------------------------
            // ARRANGE
            const { cleanup, rootElement } = createPage({
                id: 'root4',
                html: `
                    <div data-preply-ds-coverage='{"component":"App","team":"design_system"}'>
                         ${NonDSButtonStub} <!-- Necessary otherwise the container is discarded because it's considered empty -->
                         <h1 data-preply-ds-component='Heading' style="opacity:0;">DS coverage</h1>
                    </div>
            `,
            });

            // --------------------------------------------------
            // ACT
            const onCompleteMock = await calculateCoverage({ rootElement });

            // --------------------------------------------------
            // ASSERT
            const call = onCompleteMock.mock.calls[0][0];
            const results = call.dsVisualCoverageResults;
            const firstResult = results[0];
            expect(firstResult.coverage).toBe(0);

            cleanup();
        });
    });
});
