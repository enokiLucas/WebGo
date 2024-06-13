export function exploreTerritory(matrix, startX, startY) {
	const checked = new Set();
	const stack = [[startX, startY]];
	const territory = [];
	let surroundingColor = null;
	let isSurrounded = true;

	while (stack.length > 0) {
		const [cx, cy] = stack.pop();
		const key = `${cx},${cy}`;
		if (checked.has(key)) continue;
		checked.add(key);

		if (matrix[cx][cy] === null) {
			territory.push([cx, cy]);
			const directions = [[-1, 0], [0, 1], [1, 0], [0, -1]];

			/*for (let [dx, dy] of directions) {
				const nx = cx + dx, ny = cy + dy;
				if (nx >= 0 && nx < matrix.length && ny >= 0 && ny < matrix[nx].length) {
					if (matrix[nx][ny] === null && !checked.has(`${nx},${ny}`)) {
						stack.push([nx, ny]);
					} else if (surroundingColor === null) {
						surroundingColor = matrix[nx][ny];
					} else if (surroundingColor !== matrix[nx][ny]) {
						isSurrounded = false;
					}
				} else {
					isSurrounded = false;
				}
			}*/
			for (let [dx, dy] of directions) {
				const nx = cx + dx, ny = cy + dy;
				if (nx >= 0 && nx < matrix.length && ny >= 0 && ny < matrix[nx].length) {
					if (matrix[nx][ny] === null && !checked.has(`${nx},${ny}`)) {
						stack.push([nx, ny]);
					} else if (matrix[nx][ny] !== null && surroundingColor === null) {
						surroundingColor = matrix[nx][ny]; // First non-null surrounding color found.
					} else if (matrix[nx][ny] !== null && surroundingColor !== matrix[nx][ny]) {
						isSurrounded = false; // Different surrounding stone color found.
					}
				} else {
					isSurrounded = false; // Edge of the board reached and considered not surrounded.
				}
			}

		}
	}

	// Return an object with territory details
	return {
		points: territory,
		surroundedBy: isSurrounded ? surroundingColor : null,
		isCompletelySurrounded: isSurrounded
	};
}
