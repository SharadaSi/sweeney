// ==========================================================================
// Form Validation — Inquiry form client-side validation
// ==========================================================================

(() => {
	const form = document.querySelector('.inquiry__form');

	// Bail out if no form on the page
	if (!form) {
		return;
	}

	// ---- Field references ----
	const nameInput = document.getElementById('inquiry-name');
	const emailInput = document.getElementById('inquiry-email');
	const locationSelect = document.getElementById('inquiry-location');
	const interestFieldset = form.querySelector('.inquiry__fieldset:has(input[name="interest"])');
	const urgencyFieldset = form.querySelector('.inquiry__fieldset:has(input[name="urgency"])');

	// ---- Validation rules ----
	// Each rule returns an error string or null if valid
	const validators = {
		name(value) {
			const trimmed = value.trim();

			if (!trimmed) {
				return 'Vyplňte prosím jméno a příjmení.';
			}

			if (trimmed.length < 3) {
				return 'Jméno musí mít alespoň 3 znaky.';
			}

			return null;
		},

		email(value) {
			const trimmed = value.trim();

			if (!trimmed) {
				return 'Vyplňte prosím e-mail.';
			}

			// Simple but effective email pattern — validates structure, not deliverability
			const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

			if (!emailPattern.test(trimmed)) {
				return 'Zadejte platnou e-mailovou adresu.';
			}

			return null;
		},

		location(value) {
			if (!value) {
				return 'Vyberte prosím kraj.';
			}

			return null;
		},

		radioGroup(name) {
			const checked = form.querySelector(`input[name="${name}"]:checked`);

			if (!checked) {
				return name === 'interest'
					? 'Vyberte prosím oblast zájmu.'
					: 'Vyberte prosím termín realizace.';
			}

			return null;
		},
	};

	// ---- Error display helpers ----

	/**
	 * Creates or updates the error message element below the target.
	 * @param {HTMLElement} target — the input, select, or fieldset to mark
	 * @param {string|null} message — the error text, or null to clear
	 */
	const setFieldError = (target, message) => {
		// Determine the container element that wraps the field
		const container = target.closest('.inquiry__group') || target.closest('.inquiry__fieldset');
		if (!container) {
			return;
		}

		// Find existing error span or create one
		let errorElement = container.querySelector('.inquiry__error');

		if (message) {
			// Apply invalid state
			container.classList.add('is-invalid');

			if (!errorElement) {
				errorElement = document.createElement('span');
				errorElement.className = 'inquiry__error';
				errorElement.setAttribute('role', 'alert');
				container.appendChild(errorElement);
			}

			errorElement.textContent = message;

			// Link the error to the input via aria-describedby for screen readers
			if (target.id) {
				const errorId = `${target.id}-error`;
				errorElement.id = errorId;
				target.setAttribute('aria-describedby', errorId);
				target.setAttribute('aria-invalid', 'true');
			}
		} else {
			// Clear invalid state
			container.classList.remove('is-invalid');

			if (errorElement) {
				errorElement.remove();
			}

			if (target.id) {
				target.removeAttribute('aria-describedby');
				target.removeAttribute('aria-invalid');
			}
		}
	};

	/**
	 * Sets error on a radio group fieldset.
	 * The fieldset itself becomes the target.
	 */
	const setRadioGroupError = (fieldset, message) => {
		if (!fieldset) {
			return;
		}

		let errorElement = fieldset.querySelector('.inquiry__error');

		if (message) {
			fieldset.classList.add('is-invalid');

			if (!errorElement) {
				errorElement = document.createElement('span');
				errorElement.className = 'inquiry__error';
				errorElement.setAttribute('role', 'alert');
				fieldset.appendChild(errorElement);
			}

			errorElement.textContent = message;
		} else {
			fieldset.classList.remove('is-invalid');

			if (errorElement) {
				errorElement.remove();
			}
		}
	};

	// ---- Individual field validation ----

	const validateName = () => {
		const error = validators.name(nameInput.value);
		setFieldError(nameInput, error);
		return !error;
	};

	const validateEmail = () => {
		const error = validators.email(emailInput.value);
		setFieldError(emailInput, error);
		return !error;
	};

	const validateLocation = () => {
		const error = validators.location(locationSelect.value);
		setFieldError(locationSelect, error);
		return !error;
	};

	const validateInterest = () => {
		const error = validators.radioGroup('interest');
		setRadioGroupError(interestFieldset, error);
		return !error;
	};

	const validateUrgency = () => {
		const error = validators.radioGroup('urgency');
		setRadioGroupError(urgencyFieldset, error);
		return !error;
	};

	// ---- Real-time validation on user interaction ----
	// Validate on blur so the user sees feedback after leaving a field,
	// and on input so errors clear as soon as the value becomes valid.

	nameInput.addEventListener('blur', validateName);
	nameInput.addEventListener('input', () => {
		// Only clear error live — don't show new errors while typing
		if (nameInput.closest('.inquiry__group')?.classList.contains('is-invalid')) {
			validateName();
		}
	});

	emailInput.addEventListener('blur', validateEmail);
	emailInput.addEventListener('input', () => {
		if (emailInput.closest('.inquiry__group')?.classList.contains('is-invalid')) {
			validateEmail();
		}
	});

	locationSelect.addEventListener('change', validateLocation);

	// Radio groups: clear error as soon as user picks an option
	form.querySelectorAll('input[name="interest"]').forEach((radio) => {
		radio.addEventListener('change', validateInterest);
	});

	form.querySelectorAll('input[name="urgency"]').forEach((radio) => {
		radio.addEventListener('change', validateUrgency);
	});

	// ---- Form submission ----

	form.addEventListener('submit', (event) => {
		event.preventDefault();

		// Run all validators and capture results
		const results = [
			validateName(),
			validateEmail(),
			validateInterest(),
			validateUrgency(),
			validateLocation(),
		];

		const isFormValid = results.every(Boolean);

		if (!isFormValid) {
			// Focus the first invalid field so the user can fix it immediately
			const firstInvalid = form.querySelector('.is-invalid input, .is-invalid select');

			if (firstInvalid) {
				firstInvalid.focus();
			}

			return;
		}

		// ---- Collect data and submit ----
		const formData = new FormData(form);

		// Append budget values from the sliders (they live outside <form> control flow)
		const minSlider = document.getElementById('input-min');
		const maxSlider = document.getElementById('input-max');

		if (minSlider && maxSlider) {
			formData.set('budget_min', minSlider.value);
			formData.set('budget_max', maxSlider.value);
		}

		// Disable the submit button to prevent double-send
		const submitButton = form.querySelector('.inquiry__submit');
		submitButton.disabled = true;
		submitButton.textContent = 'Odesílání…';

		fetch('../php/inquiryform.php', {
			method: 'POST',
			body: formData,
		})
			.then((response) => {
				if (!response.ok) {
					throw new Error(`Server responded with ${response.status}`);
				}

				return response.json();
			})
			.then(() => {
				// Show success feedback
				submitButton.textContent = 'Odesláno ✓';
				submitButton.classList.add('btn--success');

				// Reset form after a short delay so user sees confirmation
				setTimeout(() => {
					form.reset();
					submitButton.disabled = false;
					submitButton.textContent = 'Odeslat poptávku';
					submitButton.classList.remove('btn--success');

					// Re-apply default budget range after form reset
					const defaultInterest = 'rodinny-dum';
					const changeEvent = new Event('change', { bubbles: true });
					const firstInterest = form.querySelector(`input[name="interest"][value="${defaultInterest}"]`);

					if (firstInterest) {
						firstInterest.checked = true;
						firstInterest.dispatchEvent(changeEvent);
					}
				}, 2500);
			})
			.catch(() => {
				// Show error feedback and re-enable the button
				submitButton.textContent = 'Chyba — zkuste znovu';
				submitButton.classList.add('btn--error');
				submitButton.disabled = false;

				setTimeout(() => {
					submitButton.textContent = 'Odeslat poptávku';
					submitButton.classList.remove('btn--error');
				}, 3000);
			});
	});
})();
