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

const DSButtonStub = `<button data-preply-ds-component='Button'>DS button</button>`;
const NonDSButtonStub = `<button>Non DS button</button>`;

describe('createCalculateDsVisualCoverages', () => {
    describe('Happy paths', () => {
        test('When called against a simple page, should count the coverage and get the results', async () => {
            // --------------------------------------------------
            // ARRANGE
            const expectedMinimumCoverage = 80; // This could change if the components weight change
            const coverageContainerComponent = 'App';
            const coverageContainerTeam = 'design_system';

            const { cleanup, rootElement } = createPage({
                id: 'root1',
                html: `
                <div data-preply-ds-coverage='{"component":"${coverageContainerComponent}","team":"${coverageContainerTeam}"}'> <!-- Coverage container -->
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
            expect(readablePixelCounts.layoutDsComponent).toBe(0);
            expect(readablePixelCounts.unknownDsComponent).toBe(0);

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
                ${DSButtonStub}
            </div>
            <div data-preply-ds-coverage='{"component":"${coverageContainerComponent2}","team":"${coverageContainerTeam2}"}'> <!-- Coverage container -->
                ${DSButtonStub}
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
                        ${DSButtonStub}
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
