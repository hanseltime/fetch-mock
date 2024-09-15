export function getAllChainedMethodCalls(fetchMockVariableName, root, j) {
	return root
		.find(j.CallExpression, {
			callee: {
				object: {
					type: 'Identifier',
					name: fetchMockVariableName,
				},
			},
		})
		.map((path) => {
			const paths = [path];
			while (path.parentPath.value.type !== 'ExpressionStatement') {
				path = path.parentPath;
				if (path.value.type === 'CallExpression') {
					paths.push(path);
				}
			}
			return paths;
		});
}

export function simpleMethods(fetchMockVariableName, root, j) {
	const fetchMockMethodCalls = getAllChainedMethodCalls(
		fetchMockVariableName,
		root,
		j,
	);

	fetchMockMethodCalls.forEach((path) => {
		const method = path.value.callee.property.name;
		if (method === 'mock') {
			path.value.callee.property.name = 'route';
		}

		if (method === 'mock') {
			path.value.callee.property.name = 'route';
		}

		if (method === 'resetHistory') {
			path.value.callee.property.name = 'clearHistory';
		}
		['get', 'post', 'put', 'delete', 'head', 'patch'].some((httpMethod) => {
			let prependStar = false;
			if (method === `${httpMethod}Any`) {
				prependStar = true;
				path.value.callee.property.name = httpMethod;
			} else if (method === `${httpMethod}AnyOnce`) {
				prependStar = true;
				path.value.callee.property.name = `${httpMethod}Once`;
			}
			if (prependStar) {
				path.value.arguments.unshift(j.stringLiteral('*'));
			}
		});
	});
	['reset', 'restore'].forEach((methodName) => {
		root
			.find(j.CallExpression, {
				callee: {
					object: {
						type: 'Identifier',
						name: fetchMockVariableName,
					},
					property: {
						name: methodName,
					},
				},
			})
			.forEach((path) => {
				const newExpressions = j(`
fetchMock.clearHistory();
fetchMock.removeRoutes({
	includeFallback: true,
});
fetchMock.unmockGlobal();
`)
					.find(j.ExpressionStatement)
					.paths();
				const insertLocation = j(path)
					.closest(j.ExpressionStatement)
					.replaceWith(newExpressions.shift().value);
				while (newExpressions.length) {
					insertLocation.insertAfter(newExpressions.pop().value);
				}
			});
	});

	[
		['lastUrl', 'url'],
		['lastOptions', 'options'],
		['lastResponse', 'response'],
	].forEach(([oldMethod, newProperty]) => {
		root
			.find(j.CallExpression, {
				callee: {
					object: {
						type: 'Identifier',
						name: fetchMockVariableName,
					},
					property: {
						name: oldMethod,
					},
				},
			})
			.closest(j.ExpressionStatement)
			.replaceWith((path) => {
				const oldCall = j(path).find(j.CallExpression).get();
				const builder = j(
					`${fetchMockVariableName}.callHistory.lastCall()?.${newProperty}`,
				);
				const newCall = builder.find(j.CallExpression).get();
				newCall.value.arguments = oldCall.value.arguments;
				return builder.find(j.ExpressionStatement).get().value;
			});
	});
}
