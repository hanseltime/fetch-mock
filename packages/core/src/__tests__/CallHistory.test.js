import {
	afterEach,
	beforeEach,
	describe,
	expect,
	it,
	beforeAll,
	afterAll,
	vi,
} from 'vitest';
// TODO cover case where GET, POST etc are differently named routes
// ... maybe accept method as second argument to calls, called etc
// TODO consider case where multiple routes match.. make sure only one matcher logs calls

import fetchMock from '../FetchMock';

expect.extend({
	toReturnCalls(callsArray, expectedCalls) {
		// looks like it does noting, but it makes sure a bunch of irrelevant internals
		// that are passed in array indexes 2 onwards are dropped
		const sanitisedCalls = callsArray.map(([url, options]) => [url, options]);
		const sanitisedExpectations = expectedCalls.map(([url, options]) => [
			url,
			expect.objectContaining(options),
		]);
		const assertion = expect(sanitisedCalls).toEqual(sanitisedExpectations);
		const passes = Boolean(assertion);
		return {
			// do not alter your "pass" based on isNot. Vitest does it for you
			pass: passes,
			message: () => (passes ? `Calls as expected` : `Calls not as expected`),
		};
	},
	toEqualCall(call, expectation) {
		// const sanitisedCall = call.slice(0, 2);
		// const sanitisedExpectations = [
		// 	expectation[0],
		// 	expectation[1] ? expect.objectContaining(expectation[1]) : expectation[1],
		// ];
		const assertion = expect(call).toEqual(
			expect.objectContaining(expectation),
		);
		const passes = Boolean(assertion);
		return {
			// do not alter your "pass" based on isNot. Vitest does it for you
			pass: passes,
			message: () => (passes ? `Call as expected` : `Call not as expected`),
		};
	},
});

describe('CallHistory', () => {
	let fm;
	beforeEach(() => {
		fm = fetchMock.createInstance();
	});

	const fetchTheseUrls = (...urls) =>
		Promise.all(urls.map(fm.fetchHandler.bind(fm)));

	describe('helper methods', () => {
		// beforeAll(() => {
		// 	fm.route('http://a.com/', 200).route('http://b.com/', 200);
		// 	return fm.fetchHandler('http://a.com/', {
		// 		method: 'post',
		// 		arbitraryOption: true,
		// 	});
		// });
		// afterAll(() => fm.restore());
		// it('called() returns boolean', () => {
		// 	expect(fm.called('http://a.com/')).toBe(true);
		// 	expect(fm.called('http://b.com/')).toBe(false);
		// });
		// it('calls() returns array of calls', () => {
		// 	expect(fm.calls('http://a.com/')).toReturnCalls([
		// 		['http://a.com/', { method: 'post', arbitraryOption: true }],
		// 	]);
		// 	expect(fm.calls('http://b.com/')).toEqual([]);
		// });
		// it('lastCall() returns array of parameters', () => {
		// 	expect(fm.lastCall('http://a.com/')).toEqualCall([
		// 		'http://a.com/',
		// 		{ method: 'post', arbitraryOption: true },
		// 	]);
		// 	expect(fm.lastCall('http://b.com/')).toBeUndefined();
		// });
		// describe('applying filters', () => {
		// 	beforeEach(() => {
		// 		vi.spyOn(fm, 'callHistory.calls').mockReturnValue([]);
		// 	});
		// 	afterEach(() => {
		// 		fm.callHistory.calls.mockRestore();
		// 	});
		// 	['called', 'calls', 'lastCall', 'lastUrl', 'lastOptions'].forEach(
		// 		(method) => {
		// 			it(`${method}() uses the internal filtering method`, () => {
		// 				fm[method]('name', { an: 'option' });
		// 				expect(fm.callHistory.calls).toHaveBeenCalledWith('name', {
		// 					an: 'option',
		// 				});
		// 			});
		// 		},
		// 	);
		// });
		describe('called()', () => {
			// returns boolean
			// passes filters through
		});
		describe('lastCall()', () => {
			// returns boolean
			// passes filters through
		});

		describe('calls()', () => {
			it('returns call log objects', async () => {
				fm.route('http://a.com/', 200, { name: 'fetch-mock' });

				await fm.fetchHandler('http://a.com/', { method: 'get' });
				expect(fm.callHistory.calls()[0]).toEqualCall({
					url: 'http://a.com/',
					options: { method: 'get' },
				});
			});

			it('retrieves all calls by default', async () => {
				fm.route('http://a.com/', 200).catch();

				await fetchTheseUrls('http://a.com/', 'http://b.com/');
				expect(fm.callHistory.calls().length).toEqual(2);
			});
			describe('filters', () => {
				const expectFilteredLength =
					(...filter) =>
					(length) =>
						expect(fm.callHistory.calls(...filter).length).toEqual(length);

				const expectFilteredUrl =
					(...filter) =>
					(url) =>
						expect(fm.callHistory.calls(...filter)[0].url).toEqual(url);

				const expectSingleUrl =
					(...filter) =>
					(url) => {
						expectFilteredLength(...filter)(1);
						expectFilteredUrl(...filter)(url);
					};

				const expectFilteredResponse =
					(...filter) =>
					(...response) =>
						expect(fm.callHistory.calls(...filter)[0]).toEqualCall(response);

				describe('boolean and named route filters', () => {
					it('can retrieve calls matched by non-fallback routes', async () => {
						fm.route('http://a.com/', 200).catch();

						await fetchTheseUrls('http://a.com/', 'http://b.com/');
						expectSingleUrl(true)('http://a.com/');
						expectSingleUrl('matched')('http://a.com/');
					});

					it('can retrieve calls matched by the fallback route', async () => {
						fm.route('http://a.com/', 200).catch();

						await fetchTheseUrls('http://a.com/', 'http://b.com/');
						expectSingleUrl(false)('http://b.com/');
						expectSingleUrl('unmatched')('http://b.com/');
					});

					it('can retrieve only calls handled by a named route', async () => {
						fm.route('http://a.com/', 200, { name: 'a' }).catch();

						await fetchTheseUrls('http://a.com/', 'http://b.com/');
						expectSingleUrl('a')('http://a.com/');
					});
				});

				describe('filtering with a matcher', () => {
					it('should be able to filter with any of the built in url matchers', () => {})
					it('should be able to filter with a method', () => { })
					it('should be able to filter with headers', () => { })
					//TODO write a test that just makes it clear this is contracted out to Route
				});

				describe('filtering with options', () => {
					it('can retrieve all calls', async () => {
						fm.route('http://a.com/', 200).catch();

						await fm.fetchHandler('http://a.com/', {
							headers: { a: 'z' },
						});
						await fm.fetchHandler('http://a.com/');
						await fm.fetchHandler('http://b.com/', {
							headers: { a: 'z' },
						});
						await fm.fetchHandler('http://b.com/');
						
						expectFilteredLength(undefined, { headers: { a: 'z' } })(2);
						expect(
							fm.callHistory
								.calls(undefined, { headers: { a: 'z' } })
								.filter(([, options]) => options.headers.a).length,
						).toEqual(2);
					});

					it('can retrieve calls matched by non-fallback routes', async () => {
						fm.route('http://a.com/', 200).catch();

						await fm.fetchHandler('http://a.com/', {
							headers: { a: 'z' },
						});
						await fm.fetchHandler('http://a.com/');
						await fm.fetchHandler('http://b.com/', {
							headers: { a: 'z' },
						});
						await fm.fetchHandler('http://b.com/');
						expectFilteredLength(true, { headers: { a: 'z' } })(1);
						expectFilteredResponse(true, { headers: { a: 'z' } })(
							'http://a.com/',
							{
								headers: { a: 'z' },
							},
						);
					});

					it('can retrieve calls matched by the fallback route', async () => {
						fm.route('http://a.com/', 200).catch();

						await fm.fetchHandler('http://a.com/', {
							headers: { a: 'z' },
						});
						await fm.fetchHandler('http://a.com/');
						await fm.fetchHandler('http://b.com/', {
							headers: { a: 'z' },
						});
						await fm.fetchHandler('http://b.com/');
						expectFilteredLength(false, { headers: { a: 'z' } })(1);
						expectFilteredResponse(false, { headers: { a: 'z' } })(
							'http://b.com/',
							{ headers: { a: 'z' } },
						);
					});

					it('can retrieve only calls handled by a named route', async () => {
						fm.route('http://a.com/', 200, { name: 'here' }).catch();

						await fm.fetchHandler('http://a.com/', {
							headers: { a: 'z' },
						});
						await fm.fetchHandler('http://a.com/');
						expectFilteredLength('here', { headers: { a: 'z' } })(1);
						expectFilteredResponse('here', { headers: { a: 'z' } })(
							'http://a.com/',
							{ headers: { a: 'z' } },
						);
					});
					
				});
			});

			describe('call order', () => {
				it('retrieves calls in correct order', () => {
					fm.route('http://a.com/', 200).route('http://b.com/', 200).catch();

					fm.fetchHandler('http://a.com/');
					fm.fetchHandler('http://b.com/');
					fm.fetchHandler('http://b.com/');
					expect(fm.calls()[0][0]).toEqual('http://a.com/');
					expect(fm.calls()[1][0]).toEqual('http://b.com/');
					expect(fm.calls()[2][0]).toEqual('http://b.com/');
					fm.reset();
				});
			});

			describe('retrieving call parameters', () => {
				beforeAll(() => {
					fm.route('http://a.com/', 200);
					fm.fetchHandler('http://a.com/');
					fm.fetchHandler('http://a.com/', { method: 'POST' });
				});
				afterAll(() => fm.restore());

				it('calls (call history)', () => {
					expect(fm.calls()[0]).toEqualCall(['http://a.com/', undefined]);
					expect(fm.calls()[1]).toEqualCall([
						'http://a.com/',
						{ method: 'POST' },
					]);
				});

				it('lastCall', () => {
					expect(fm.lastCall()).toEqualCall([
						'http://a.com/',
						{ method: 'POST' },
					]);
				});

				it('lastOptions', () => {
					expect(fm.lastOptions()).toEqual({ method: 'POST' });
				});

				it('lastUrl', () => {
					expect(fm.lastUrl()).toEqual('http://a.com/');
				});

				it('when called with Request instance', () => {
					const req = new fm.config.Request('http://a.com/', {
						method: 'POST',
					});
					fm.fetchHandler(req);
					const [url, callOptions] = fm.lastCall();

					expect(url).toEqual('http://a.com/');
					expect(callOptions).toEqual(
						expect.objectContaining({ method: 'POST' }),
					);
					expect(fm.lastUrl()).toEqual('http://a.com/');
					const options = fm.lastOptions();
					expect(options).toEqual(expect.objectContaining({ method: 'POST' }));
					expect(fm.lastCall().request).toEqual(req);
				});

				it('when called with Request instance and arbitrary option', () => {
					const req = new fm.config.Request('http://a.com/', {
						method: 'POST',
					});
					fm.fetchHandler(req, { arbitraryOption: true });
					const [url, callOptions] = fm.lastCall();
					expect(url).toEqual('http://a.com/');
					expect(callOptions).toEqual(
						expect.objectContaining({
							method: 'POST',
							arbitraryOption: true,
						}),
					);
					expect(fm.lastUrl()).toEqual('http://a.com/');
					const options = fm.lastOptions();
					expect(options).toEqual(
						expect.objectContaining({
							method: 'POST',
							arbitraryOption: true,
						}),
					);
					expect(fm.lastCall().request).toEqual(req);
				});

				it('Not make default signal available in options when called with Request instance using signal', () => {
					const req = new fm.config.Request('http://a.com/', {
						method: 'POST',
					});
					fm.fetchHandler(req);
					const [, callOptions] = fm.lastCall();

					expect(callOptions.signal).toBeUndefined();
					const options = fm.lastOptions();
					expect(options.signal).toBeUndefined();
				});
			});

			describe('retrieving responses', () => {
				it('exposes responses', async () => {
					fm.once('*', 200).once('*', 201, { overwriteRoutes: false });

					await fm.fetchHandler('http://a.com/');
					await fm.fetchHandler('http://a.com/');
					expect(fm.calls()[0].response.status).toEqual(200);
					expect(fm.calls()[1].response.status).toEqual(201);
					fm.restore();
				});

				it('exposes Responses', async () => {
					fm.once('*', new fm.config.Response('blah'));

					await fm.fetchHandler('http://a.com/');
					expect(fm.calls()[0].response.status).toEqual(200);
					expect(await fm.calls()[0].response.text()).toEqual('blah');
					fm.restore();
				});

				it('has lastResponse shorthand', async () => {
					fm.once('*', 200).once('*', 201, { overwriteRoutes: false });

					await fm.fetchHandler('http://a.com/');
					await fm.fetchHandler('http://a.com/');
					expect(fm.lastResponse().status).toEqual(201);
					fm.restore();
				});

				it('has readable response when response already read if using lastResponse', async () => {
					const respBody = { foo: 'bar' };
					fm.once('*', { status: 200, body: respBody }).once('*', 201, {
						overwriteRoutes: false,
					});

					const resp = await fm.fetchHandler('http://a.com/');

					await resp.json();
					expect(await fm.lastResponse().json()).toEqual(respBody);
				});
			});

			describe('repeat and done()', () => {
				let fm;
				beforeAll(() => {
					fm = fetchMock.createInstance();
					fm.config.warnOnUnmatched = false;
				});

				afterEach(() => fm.restore());

				it('can expect a route to be called', () => {
					fm.route('http://a.com/', 200);

					expect(fm.done()).toBe(false);
					expect(fm.done('http://a.com/')).toBe(false);
					fm.fetchHandler('http://a.com/');
					expect(fm.done()).toBe(true);
					expect(fm.done('http://a.com/')).toBe(true);
				});

				it('can expect a route to be called n times', () => {
					fm.route('http://a.com/', 200, { repeat: 2 });

					fm.fetchHandler('http://a.com/');
					expect(fm.done()).toBe(false);
					expect(fm.done('http://a.com/')).toBe(false);
					fm.fetchHandler('http://a.com/');
					expect(fm.done()).toBe(true);
					expect(fm.done('http://a.com/')).toBe(true);
				});

				it('regression: can expect an un-normalized url to be called n times', () => {
					fm.route('http://a.com/', 200, { repeat: 2 });
					fm.fetchHandler('http://a.com/');
					expect(fm.done()).toBe(false);
					fm.fetchHandler('http://a.com/');
					expect(fm.done()).toBe(true);
				});

				it('can expect multiple routes to have been called', () => {
					fm.route('http://a.com/', 200, {
						repeat: 2,
					}).route('http://b.com/', 200, { repeat: 2 });

					fm.fetchHandler('http://a.com/');
					expect(fm.done()).toBe(false);
					expect(fm.done('http://a.com/')).toBe(false);
					expect(fm.done('http://b.com/')).toBe(false);
					fm.fetchHandler('http://a.com/');
					expect(fm.done()).toBe(false);
					expect(fm.done('http://a.com/')).toBe(true);
					expect(fm.done('http://b.com/')).toBe(false);
					fm.fetchHandler('http://b.com/');
					expect(fm.done()).toBe(false);
					expect(fm.done('http://a.com/')).toBe(true);
					expect(fm.done('http://b.com/')).toBe(false);
					fm.fetchHandler('http://b.com/');
					expect(fm.done()).toBe(true);
					expect(fm.done('http://a.com/')).toBe(true);
					expect(fm.done('http://b.com/')).toBe(true);
				});

				// todo more tests for filtering
				it('`done` filters on match types', async () => {
					fm.once('http://a.com/', 200)
						.once('http://b.com/', 200)
						.once('http://c.com/', 200)
						.catch();

					await fm.fetchHandler('http://a.com/');
					await fm.fetchHandler('http://b.com/');
					expect(fm.done()).toBe(false);
					expect(fm.done(true)).toBe(false);
					expect(fm.done('http://a.com/')).toBe(true);
					expect(fm.done('http://b.com/')).toBe(true);
					expect(fm.done('http://c.com/')).toBe(false);
				});

				it("can tell when done if using '*'", () => {
					fm.route('*', '200');
					fm.fetchHandler('http://a.com');
					expect(fm.done()).toBe(true);
				});

				it('can tell when done if using begin:', () => {
					fm.route('begin:http', '200');
					fm.fetchHandler('http://a.com');
					expect(fm.done()).toBe(true);
				});

				it('falls back to second route if first route already done', async () => {
					fm.route('http://a.com/', 404, {
						repeat: 1,
					}).route('http://a.com/', 200, { overwriteRoutes: false });

					const res = await fm.fetchHandler('http://a.com/');
					expect(res.status).toEqual(404);

					const res2 = await fm.fetchHandler('http://a.com/');
					expect(res2.status).toEqual(200);
				});

				it('resetHistory() resets count', async () => {
					fm.route('http://a.com/', 200, { repeat: 1 });
					await fm.fetchHandler('http://a.com/');
					expect(fm.done()).toBe(true);
					fm.resetHistory();
					expect(fm.done()).toBe(false);
					expect(fm.done('http://a.com/')).toBe(false);
					await fm.fetchHandler('http://a.com/');
					expect(fm.done()).toBe(true);
					expect(fm.done('http://a.com/')).toBe(true);
				});

				it('logs unmatched calls', () => {
					vi.spyOn(console, 'warn'); //eslint-disable-line
					fm.route('http://a.com/', 200).route('http://b.com/', 200, {
						repeat: 2,
					});

					fm.fetchHandler('http://b.com/');
					fm.done();
					expect(console.warn).toHaveBeenCalledWith(
						'Warning: http://a.com/ not called',
					); //eslint-disable-line
					expect(console.warn).toHaveBeenCalledWith(
						'Warning: http://b.com/ only called 1 times, but 2 expected',
					); //eslint-disable-line

					console.warn.mockClear(); //eslint-disable-line
					fm.done('http://a.com/');
					expect(console.warn).toHaveBeenCalledWith(
						'Warning: http://a.com/ not called',
					); //eslint-disable-line
					expect(console.warn).not.toHaveBeenCalledWith(
						'Warning: http://b.com/ only called 1 times, but 2 expected',
					); //eslint-disable-line
					console.warn.mockRestore(); //eslint-disable-line
				});

				describe('sandbox isolation', () => {
					it("doesn't propagate to children of global", () => {
						fm.route('http://a.com/', 200, { repeat: 1 });

						const sb1 = fm.sandbox();

						fm.fetchHandler('http://a.com/');

						expect(fm.done()).toBe(true);
						expect(sb1.done()).toBe(false);

						expect(() => sb1.fetchHandler('http://a.com/')).not.toThrow();
					});

					it("doesn't propagate to global from children", () => {
						fm.route('http://a.com/', 200, { repeat: 1 });

						const sb1 = fm.sandbox();

						sb1.fetchHandler('http://a.com/');

						expect(fm.done()).toBe(false);
						expect(sb1.done()).toBe(true);

						expect(() => fm.fetchHandler('http://a.com/')).not.toThrow();
					});

					it("doesn't propagate to children of sandbox", () => {
						const sb1 = fm.sandbox().route('http://a.com/', 200, { repeat: 1 });

						const sb2 = sb1.sandbox();

						sb1.fetchHandler('http://a.com/');

						expect(sb1.done()).toBe(true);
						expect(sb2.done()).toBe(false);

						expect(() => sb2.fetchHandler('http://a.com/')).not.toThrow();
					});

					it("doesn't propagate to sandbox from children", () => {
						const sb1 = fm.sandbox().route('http://a.com/', 200, { repeat: 1 });

						const sb2 = sb1.sandbox();

						sb2.fetchHandler('http://a.com/');

						expect(sb1.done()).toBe(false);
						expect(sb2.done()).toBe(true);

						expect(() => sb1.fetchHandler('http://a.com/')).not.toThrow();
					});

					it('Allow overwriting routes when using multiple function matchers', async () => {
						const matcher1 = () => true;

						const matcher2 = () => true;

						const sb = fm.sandbox();

						expect(() =>
							sb.postOnce(matcher1, 200).postOnce(matcher2, 200),
						).not.toThrow();

						await sb('https://example.com/', { method: 'POST' });
						expect(sb.done()).toBe(false);
						expect(sb.done(matcher1)).toBe(true);
						expect(sb.done(matcher2)).toBe(false);
						await sb('https://example.com/', { method: 'POST' });

						expect(sb.done()).toBe(true);
						expect(sb.done(matcher1)).toBe(true);
						expect(sb.done(matcher2)).toBe(true);
					});
				});
			});
		});
	});
});
