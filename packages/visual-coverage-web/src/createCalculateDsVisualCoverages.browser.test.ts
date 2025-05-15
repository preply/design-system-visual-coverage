import { describe, expect, test, vi } from 'vitest';

import { DsVisualCoverageDeNormalizedResult } from '../../visual-coverage-core/dist';

import { OnComplete } from './types';

import { createCalculateDsVisualCoverages } from '.';
import { getOpeningHtmlTag } from './utils/getOpeningHtmlTag';

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

const coverageContainerDomAttribute = 'data-coverage-container';
const NonDSButtonStub = `<button>Non DS button</button>`;
const DSHeadingStub = `<h1 data-ds-component='Heading'>DS coverage</h1>`;
const DSButtonStub = `<button data-ds-component='Button'>DS button</button>`;
const RebrandDSComponentStub = `<div data-ds-component='RebrandComponent'>I'm a Rebrand component</div>`;

async function calculateCoverage({ rootElement }: { rootElement: HTMLElement }) {
    const onCompleteMock = vi.fn<OnComplete>();
    const createCalculateDsVisualCoveragesResult = createCalculateDsVisualCoverages({
        log: true,
        rootElement,
        getComponentData: ({ component }) => ({
            result: 'countComponent',
            weight: 1,
            dsComponentName: component.getAttribute('data-ds-component'),

            debugColor: 'green',
            debugInfo: getOpeningHtmlTag(component),
        }),
        coverageContainersDataAttribute: coverageContainerDomAttribute,
        getContainerData: ({ component }) => {
            const coverageContainerValue = component.getAttribute(coverageContainerDomAttribute);

            if (!coverageContainerValue) {
                return { result: 'isNotCoverageContainer' };
            }

            return { result: 'isCoverageContainer', coverageContainer: coverageContainerValue };
        },
    });

    createCalculateDsVisualCoveragesResult?.run({
        onError: console.error,
        onComplete: onCompleteMock,
    });

    // Waiting for the coverage count to finish
    await expect.poll(() => onCompleteMock).toHaveBeenCalledOnce();

    return onCompleteMock;
}

describe('createCalculateDsVisualCoverages', () => {
    describe('Happy paths', () => {
        test('When called against a simple page, should count the coverage and get the results', async () => {
            // --------------------------------------------------
            // ARRANGE
            const expectedMinimumCoverage = 88; // This could change if the components weight change
            const coverageContainerComponent = 'MainApp';

            const { cleanup, rootElement } = createPage({
                id: 'root1',
                html: `
                <div ${coverageContainerDomAttribute}='${coverageContainerComponent}'> <!-- Coverage container -->
                    ${DSHeadingStub}
                    ${DSButtonStub}
                    ${NonDSButtonStub}
                    ${RebrandDSComponentStub}
                </div>
                `,
            });

            // --------------------------------------------------
            // ACT
            const onCompleteMock = await calculateCoverage({ rootElement });

            // --------------------------------------------------
            // ASSERT
            if (!onCompleteMock.mock.calls[0]) {
                throw new Error(
                    'onCompleteMock.mock.calls[0] is undefined (this should be a TS-only protection)',
                );
            }
            const call = onCompleteMock.mock.calls[0][0];

            const results: DsVisualCoverageDeNormalizedResult[] = call.dsVisualCoverageResults;
            expect(
                results.length,
                'The page contains only one coverage container, the result should contain just one coverage count',
            ).toBe(1);

            const firstResult = results[0];
            if (!firstResult)
                throw new Error('firstResult is undefined (this should be a TS-only protection)');
            expect(firstResult.coverageContainerAttributeValue).toContain(
                coverageContainerComponent,
            );
            expect(firstResult.coverage).toBeGreaterThan(expectedMinimumCoverage);

            const { readablePixelCounts } = firstResult;

            // The numbers have been snapshotted from the first test run
            expect(readablePixelCounts.Heading).toBe(898);
            expect(readablePixelCounts.Button).toBe(188);
            expect(readablePixelCounts.RebrandComponent).toBe(860);

            // The exact number for the empty pixels is unstable, it could slightly change in the
            // future but no drastic changes should happen
            expect(readablePixelCounts.emptyPixel).toBeGreaterThan(28_000);

            cleanup();
        });

        test('When called against a simple page with two containers, should count the coverage and get the results', async () => {
            // --------------------------------------------------
            // ARRANGE
            const coverageContainerComponent1 = 'App1';
            const coverageContainerComponent2 = 'App2';

            const { cleanup, rootElement } = createPage({
                id: 'root2',
                html: `
            <div ${coverageContainerDomAttribute}='${coverageContainerComponent1}'> <!-- Coverage container -->
                ${DSHeadingStub}
            </div>
            <div ${coverageContainerDomAttribute}='${coverageContainerComponent2}'> <!-- Coverage container -->
                ${DSHeadingStub}
            </div>
            `,
            });

            // --------------------------------------------------
            // ACT
            const onCompleteMock = await calculateCoverage({ rootElement });

            // --------------------------------------------------
            // ASSERT
            if (!onCompleteMock.mock.calls[0]) {
                throw new Error(
                    'onCompleteMock.mock.calls[0] is undefined (this should be a TS-only protection)',
                );
            }
            const call = onCompleteMock.mock.calls[0][0];

            const results = call.dsVisualCoverageResults;
            expect(
                results.length,
                'The page contains two coverage containers, the result should contain two counts',
            ).toBe(2);

            // Results are sorted because the order is not guaranteed
            const sortedResults = results.sort((a, b) =>
                a.coverageContainerAttributeValue!.localeCompare(
                    b.coverageContainerAttributeValue!,
                ),
            );
            const teamsAndComponents = sortedResults.map(obj => ({
                coverageContainerAttributeValue: obj.coverageContainerAttributeValue,
            }));
            expect(teamsAndComponents).toStrictEqual([
                {
                    coverageContainerAttributeValue: `App1`,
                },
                {
                    coverageContainerAttributeValue: `App2`,
                },
            ]);

            cleanup();
        });

        test('When there are containers that are direct child of other containers, should warn about them', async () => {
            // --------------------------------------------------
            // ARRANGE
            const { cleanup, rootElement } = createPage({
                id: 'root3',
                html: `
            <div ${coverageContainerDomAttribute}='emptyCoverageContainer1'> <!-- Empty coverage container -->
                <div ${coverageContainerDomAttribute}='emptyCoverageContainer2'> <!-- Empty coverage container -->
                    <div ${coverageContainerDomAttribute}='App'> <!-- Coverage container -->
                        ${DSHeadingStub}
                    </div>
                </div>
            </div>
            `,
            });

            const expectedResult = [
                {
                    coverageContainer: `App`,
                    warnings: [],
                },
                {
                    coverageContainer: `emptyCoverageContainer1`,
                    warnings: ['doesNotContainChildren'],
                },
                {
                    coverageContainer: `emptyCoverageContainer2`,
                    warnings: ['doesNotContainChildren'],
                },
            ] as const;

            // --------------------------------------------------
            // ACT
            const onCompleteMock = await calculateCoverage({ rootElement });

            // --------------------------------------------------
            // ASSERT
            if (!onCompleteMock.mock.calls[0]) {
                throw new Error(
                    'onCompleteMock.mock.calls[0] is undefined (this should be a TS-only protection)',
                );
            }
            const call = onCompleteMock.mock.calls[0][0];

            const results = call.dsVisualCoverageResults
                .map(r => ({
                    warnings: r.warnings,
                    coverageContainer: r.coverageContainerAttributeValue,
                }))
                .sort((a, b) =>
                    (a.coverageContainer ?? 'coverageContainerIsNull').localeCompare(
                        b.coverageContainer ?? 'coverageContainerIsNull',
                    ),
                );

            expect(results).toEqual(expectedResult);

            cleanup();
        });

        test('When there is a container without children, should warn about it', async () => {
            // --------------------------------------------------
            // ARRANGE
            const { cleanup, rootElement } = createPage({
                id: 'root4',
                html: `
                <div>
                    <div style="width:100px;height:100px;" ${coverageContainerDomAttribute}='containerWithNoChildren'>
                         <!-- Empty coverage container -->
                    </div>
                </div>
            `,
            });

            const expectedResult = [
                {
                    coverageContainer: 'containerWithNoChildren',
                    warnings: ['doesNotContainChildren'],
                },
            ] as const;

            // --------------------------------------------------
            // ACT
            const onCompleteMock = await calculateCoverage({ rootElement });

            // --------------------------------------------------
            // ASSERT
            if (!onCompleteMock.mock.calls[0]) {
                throw new Error(
                    'onCompleteMock.mock.calls[0] is undefined (this should be a TS-only protection)',
                );
            }
            const call = onCompleteMock.mock.calls[0][0];

            const results = call.dsVisualCoverageResults.map(r => ({
                warnings: r.warnings,
                coverageContainer: r.coverageContainerAttributeValue,
            }));

            expect(results).toEqual(expectedResult);

            cleanup();
        });

        test('When there is a container which size is 0, should warn about it', async () => {
            // --------------------------------------------------
            // ARRANGE
            const { cleanup, rootElement } = createPage({
                id: 'root5',
                html: `
                <div>
                    <div style="width:0;" ${coverageContainerDomAttribute}='containerWithNoSize'>
                        ${DSHeadingStub}
                    </div>
                </div>
            `,
            });

            const expectedResult = [
                {
                    coverageContainer: 'containerWithNoSize',
                    warnings: ['hasNoSize'],
                },
            ] as const;

            // --------------------------------------------------
            // ACT
            const onCompleteMock = await calculateCoverage({ rootElement });

            // --------------------------------------------------
            // ASSERT
            if (!onCompleteMock.mock.calls[0]) {
                throw new Error(
                    'onCompleteMock.mock.calls[0] is undefined (this should be a TS-only protection)',
                );
            }
            const call = onCompleteMock.mock.calls[0][0];

            const results = call.dsVisualCoverageResults.map(r => ({
                warnings: r.warnings,
                coverageContainer: r.coverageContainerAttributeValue,
            }));

            expect(results).toEqual(expectedResult);

            cleanup();
        });

        test('When the container is the rootElement, should count the coverage and get the results', async () => {
            // --------------------------------------------------
            // ARRANGE
            const { cleanup, rootElement } = createPage({
                id: 'root6',
                html: DSHeadingStub,
            });
            const coverageContainerComponent = 'MainApp';
            rootElement.setAttribute(coverageContainerDomAttribute, coverageContainerComponent); // Coverage container

            // --------------------------------------------------
            // ACT
            const onCompleteMock = await calculateCoverage({ rootElement });

            // --------------------------------------------------
            // ASSERT
            if (!onCompleteMock.mock.calls[0]) {
                throw new Error(
                    'onCompleteMock.mock.calls[0] is undefined (this should be a TS-only protection)',
                );
            }
            const call = onCompleteMock.mock.calls[0][0];

            const results = call.dsVisualCoverageResults;
            const firstResult = results[0];
            if (!firstResult)
                throw new Error('firstResult is undefined (this should be a TS-only protection)');
            expect(firstResult.coverageContainerAttributeValue).toContain(
                coverageContainerComponent,
            );

            cleanup();
        });

        test('When there is an icon from the DS, should count it', async () => {
            // --------------------------------------------------
            // ARRANGE
            const { cleanup, rootElement } = createPage({
                id: 'root7',
                html: `
                    <div ${coverageContainerDomAttribute}='{"component":"App","team":"design_system"}'>
                         <svg data-ds-component="SvgTokyoUIIcon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
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
            if (!onCompleteMock.mock.calls[0]) {
                throw new Error(
                    'onCompleteMock.mock.calls[0] is undefined (this should be a TS-only protection)',
                );
            }
            const call = onCompleteMock.mock.calls[0][0];
            const results = call.dsVisualCoverageResults;
            const firstResult = results[0];
            if (!firstResult)
                throw new Error('firstResult is undefined (this should be a TS-only protection)');
            expect(firstResult.coverage).toBe(100);

            cleanup();
        });

        test('When there is an illustration from the DS, should count it', async () => {
            // --------------------------------------------------
            // ARRANGE
            const { cleanup, rootElement } = createPage({
                id: 'root8',
                html: `
                    <div ${coverageContainerDomAttribute}='{"component":"App","team":"design_system"}'>
                         <svg data-ds-component="SvgTokyoUIIllustration" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <!-- Please note the following is an icon, but from a DS coverage perspective only its data-ds-component counts -->
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
            if (!onCompleteMock.mock.calls[0]) {
                throw new Error(
                    'onCompleteMock.mock.calls[0] is undefined (this should be a TS-only protection)',
                );
            }
            const call = onCompleteMock.mock.calls[0][0];
            const results = call.dsVisualCoverageResults;
            const firstResult = results[0];
            if (!firstResult)
                throw new Error('firstResult is undefined (this should be a TS-only protection)');
            expect(firstResult.coverage).toBe(100);

            cleanup();
        });

        test('When there is invisible component, should not count it', async () => {
            // --------------------------------------------------
            // ARRANGE
            const { cleanup, rootElement } = createPage({
                id: 'root9',
                html: `
                    <div ${coverageContainerDomAttribute}='{"component":"App","team":"design_system"}'>
                         ${NonDSButtonStub} <!-- Necessary otherwise the container is discarded because it's considered empty -->
                         <h1 data-ds-component='Heading' style="display:none;">DS coverage</h1>
                    </div>
            `,
            });

            // --------------------------------------------------
            // ACT
            const onCompleteMock = await calculateCoverage({ rootElement });

            // --------------------------------------------------
            // ASSERT
            if (!onCompleteMock.mock.calls[0]) {
                throw new Error(
                    'onCompleteMock.mock.calls[0] is undefined (this should be a TS-only protection)',
                );
            }
            const call = onCompleteMock.mock.calls[0][0];
            const results = call.dsVisualCoverageResults;
            const firstResult = results[0];
            if (!firstResult)
                throw new Error('firstResult is undefined (this should be a TS-only protection)');
            expect(firstResult.coverage).toBe(0);

            cleanup();
        });
    });
});
