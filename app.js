const pascalInput = document.querySelector('#pascalInput');
const parseButton = document.querySelector('#parseButton');
const clearButton = document.querySelector('#clearButton');
const answersForm = document.querySelector('#answersForm');
const fieldCount = document.querySelector('#fieldCount');
const currentPrompt = document.querySelector('#currentPrompt');
const currentVariable = document.querySelector('#currentVariable');
const currentAnswer = document.querySelector('#currentAnswer');
const copyButton = document.querySelector('#copyButton');
const nextButton = document.querySelector('#nextButton');
const copyAllButton = document.querySelector('#copyAllButton');
const status = document.querySelector('#status');

let fields = [];
let currentIndex = 0;

function parsePascalRequests(source) {
  const tokens = [...source.matchAll(/writeln\s*\(\s*'((?:''|[^'])*)'\s*\)|readln\s*\(\s*([^)]+?)\s*\)/gi)]
    .map((match) => ({
      type: match[1] === undefined ? 'read' : 'write',
      value: (match[1] ?? match[2]).replaceAll("''", "'").trim(),
    }));

  const requests = [];
  let lastPrompt = 'Ingrese el valor solicitado por el programa';

  for (const token of tokens) {
    if (token.type === 'write') {
      lastPrompt = token.value;
      continue;
    }

    requests.push({ prompt: lastPrompt, variable: token.value, answer: '' });
    lastPrompt = 'Ingrese el valor solicitado por el programa';
  }

  return requests;
}

function renderFields() {
  answersForm.innerHTML = '';
  fieldCount.textContent = `${fields.length} campo${fields.length === 1 ? '' : 's'}`;

  fields.forEach((field, index) => {
    const wrapper = document.createElement('label');
    const prompt = document.createElement('span');
    const variable = document.createElement('small');
    const input = document.createElement('input');

    wrapper.className = 'answer-field';
    prompt.textContent = `${index + 1}. ${field.prompt}`;
    variable.textContent = field.variable;
    input.dataset.index = index;
    input.placeholder = `Valor para ${field.variable}`;
    input.value = field.answer;

    wrapper.append(prompt, variable, input);
    answersForm.append(wrapper);
  });
}

function updateRunner(message = '') {
  const hasFields = fields.length > 0;
  const field = fields[currentIndex];

  copyButton.disabled = !hasFields;
  nextButton.disabled = !hasFields || currentIndex >= fields.length - 1;
  copyAllButton.disabled = !hasFields;

  if (!field) {
    currentPrompt.textContent = 'Primero detectá los pedidos del código.';
    currentVariable.textContent = '';
    currentAnswer.textContent = '—';
    status.textContent = message;
    return;
  }

  currentPrompt.textContent = `${currentIndex + 1}/${fields.length}: ${field.prompt}`;
  currentVariable.textContent = `Variable: ${field.variable}`;
  currentAnswer.textContent = field.answer || 'Completá este valor arriba';
  status.textContent = message;
}

async function copyText(text) {
  await navigator.clipboard.writeText(text);
}

parseButton.addEventListener('click', () => {
  fields = parsePascalRequests(pascalInput.value);
  currentIndex = 0;
  renderFields();
  updateRunner(fields.length ? 'Pedidos detectados. Cargá los valores y copiá paso a paso.' : 'No encontré pares writeln/readln.');
});

clearButton.addEventListener('click', () => {
  pascalInput.value = '';
  fields = [];
  currentIndex = 0;
  renderFields();
  updateRunner('Listo para pegar otro bloque de código.');
});

answersForm.addEventListener('input', (event) => {
  if (!event.target.matches('input[data-index]')) return;
  fields[Number(event.target.dataset.index)].answer = event.target.value;
  updateRunner();
});

copyButton.addEventListener('click', async () => {
  const field = fields[currentIndex];
  if (!field) return;
  await copyText(field.answer);
  updateRunner(`Copiado: ${field.variable}. Pegalo en la consola Pascal y luego avanzá.`);
});

nextButton.addEventListener('click', () => {
  currentIndex = Math.min(currentIndex + 1, fields.length - 1);
  updateRunner();
});

copyAllButton.addEventListener('click', async () => {
  await copyText(fields.map((field) => field.answer).join('\n'));
  updateRunner('Copié todas las respuestas separadas por Enter. Sirve si tu consola acepta pegado múltiple.');
});

parseButton.click();
