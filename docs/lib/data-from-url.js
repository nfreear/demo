/**
 * Use a <form> with hidden/visible <input> fields to declare and validate URL parameters.
 *
 * @see https://github.com/nfreear/survey-bot/blob/main/public/js/app.js#L61
 */

export function getFilterDataFromUrl () {
  setFormFromUrlParams();

  return getFormDataFromEvent();
}

export function setFormFromUrlParams(form = getFirstForm()) {
  const inputFields = [...form.elements].filter(el => el.nodeName !== 'BUTTON');
  let data = {};
  inputFields.forEach(el => {
    const re = new RegExp(`${el.id}=${el.dataset.regex ? el.dataset.regex : '([^&]+)'}`);

    el.value = param(re, el.value);
    document.body.classList.add(`fl-${el.id}-${el.value.replace(' ', '-')}`);
    data[el.id] = el.value;
  });
  return data;
}

export function getFormDataFromEvent(event = null) {
  const form = event ? event.target : getFirstForm();

  const inputFields = [...form.elements].filter(el => el.nodeName !== 'BUTTON');
  const DATA = {};
  inputFields.forEach(el => {
    const isNum = el.type === 'number';
    const re = el.dataset.regex ? new RegExp(`^${el.dataset.regex}$`) : null;

    DATA[el.id] = isNum ? parseFloat(el.value) : re && re.test(el.value) ? el.value : null;
  });
  return DATA;
}

export function getFirstForm () {
  return document.querySelectorAll('form')[0];
}

export function param(regex, def = null) {
  const matches = window.location.href.match(regex);

  return matches ? decodeURIComponent(matches[1]) : def;
}
