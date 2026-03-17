// ==========================================================================
// Inquiry Form JS — Dynamic budget ranges + dual slider behavior
// ==========================================================================

(() => {
	const minSlider = document.getElementById('input-min');
	const maxSlider = document.getElementById('input-max');
	const sliderHighlight = document.getElementById('slider-highlight');
	const budgetDisplay = document.getElementById('budget-display');
	const minLabel = document.getElementById('budget-min-label');
	const maxLabel = document.getElementById('budget-max-label');
	const interestInputs = document.querySelectorAll('input[name="interest"]');

	if (!minSlider || !maxSlider || !sliderHighlight || !budgetDisplay || !minLabel || !maxLabel || !interestInputs.length) {
		return;
	}

	const rangeConfig = {
		'rodinny-dum': {
			min: 4000000,
			max: 15000000,
			step: 500000,
		},
		'tiny-house': {
			min: 1000000,
			max: 6000000,
			step: 250000,
		},
		'projektova-dokumentace': {
			min: 60000,
			max: 160000,
			step: 10000,
		},
	};

	let previousMinValue = Number(minSlider.value);
	let previousMaxValue = Number(maxSlider.value);

	const formatCZK = (value) => `${new Intl.NumberFormat('cs-CZ').format(value)} Kč`;

	const updateDisplay = (minValue, maxValue) => {
		budgetDisplay.textContent = `${formatCZK(minValue)} - ${formatCZK(maxValue)}`;
	};

	const updateHighlight = (minValue, maxValue) => {
		const sliderMin = Number(minSlider.min);
		const sliderMax = Number(minSlider.max);
		const range = sliderMax - sliderMin;

		const leftPercent = ((minValue - sliderMin) / range) * 100;
		const rightPercent = ((maxValue - sliderMin) / range) * 100;

		sliderHighlight.style.left = `${leftPercent}%`;
		sliderHighlight.style.width = `${rightPercent - leftPercent}%`;
	};

	const updateSlider = (activeSlider) => {
		const step = Number(minSlider.step);
		let minValue = Number(minSlider.value);
		let maxValue = Number(maxSlider.value);

		if (minValue >= maxValue) {
			const movedMin = activeSlider === minSlider || minValue !== previousMinValue;

			if (movedMin) {
				minValue = maxValue - step;
				minSlider.value = String(minValue);
			} else {
				maxValue = minValue + step;
				maxSlider.value = String(maxValue);
			}
		}

		updateHighlight(minValue, maxValue);
		updateDisplay(minValue, maxValue);

		previousMinValue = minValue;
		previousMaxValue = maxValue;
	};

	const applyCategoryRange = (category) => {
		const config = rangeConfig[category];
		if (!config) {
			return;
		}

		minSlider.min = String(config.min);
		minSlider.max = String(config.max);
		minSlider.step = String(config.step);

		maxSlider.min = String(config.min);
		maxSlider.max = String(config.max);
		maxSlider.step = String(config.step);

		const midpoint = Math.round((config.min + config.max) / 2 / config.step) * config.step;

		minSlider.value = String(config.min);
		maxSlider.value = String(midpoint);

		minLabel.textContent = formatCZK(config.min);
		maxLabel.textContent = formatCZK(config.max);

		previousMinValue = config.min;
		previousMaxValue = midpoint;

		updateSlider();
	};

	minSlider.addEventListener('input', () => updateSlider(minSlider));
	maxSlider.addEventListener('input', () => updateSlider(maxSlider));

	interestInputs.forEach((input) => {
		input.addEventListener('change', (event) => {
			applyCategoryRange(event.target.value);
		});
	});

	const selectedInterest = document.querySelector('input[name="interest"]:checked')?.value || 'rodinny-dum';
	applyCategoryRange(selectedInterest);
})();

