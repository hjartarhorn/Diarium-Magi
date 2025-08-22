/*
 * DiaryPractice Web App
 *
 * Этот файл содержит основную логику приложения: добавление
 * упражнений, практик и записей в дневник, сохранение данных в
 * localStorage, отображение списков и генерация PDF‑отчёта.
 */

// Хранилища для записей. При загрузке страницы загружаем из localStorage.
let exercises = [];
let practices = [];
let diaries = [];

// Устанавливаем текущую дату по умолчанию для полей даты
function setToday(id) {
  const input = document.getElementById(id);
  const today = new Date().toISOString().split('T')[0];
  input.value = today;
}

function loadData() {
  try {
    const stored = localStorage.getItem('diaryPracticeData');
    if (stored) {
      const parsed = JSON.parse(stored);
      exercises = parsed.exercises || [];
      practices = parsed.practices || [];
      diaries = parsed.diaries || [];
    }
  } catch (e) {
    console.error('Ошибка чтения localStorage', e);
  }
}

function saveData() {
  const data = { exercises, practices, diaries };
  localStorage.setItem('diaryPracticeData', JSON.stringify(data));
}

// Добавление упражнения
function addExercise() {
  const name = document.getElementById('exerciseName').value.trim();
  const date = document.getElementById('exerciseDate').value;
  const count = parseInt(document.getElementById('exerciseCount').value, 10);
  if (!name || !date || !count) return;
  exercises.push({ name, date, count });
  saveData();
  updateDisplay();
  // Сброс
  document.getElementById('exerciseName').value = '';
  setToday('exerciseDate');
  document.getElementById('exerciseCount').value = 1;
}

// Добавление практики
function addPractice() {
  const type = document.getElementById('practiceType').value; // строка с названием
  const note = document.getElementById('practiceNote').value.trim();
  const date = document.getElementById('practiceDate').value;
  if (!note || !date) return;
  practices.push({ type, note, date });
  saveData();
  updateDisplay();
  // Сброс полей
  document.getElementById('practiceNote').value = '';
  setToday('practiceDate');
  document.getElementById('practiceType').value = 'Сталкинг';
}

// Добавление записи в дневник
function addDiary() {
  const note = document.getElementById('diaryNote').value.trim();
  const date = document.getElementById('diaryDate').value;
  if (!note || !date) return;
  diaries.push({ note, date });
  saveData();
  updateDisplay();
  // Сброс
  document.getElementById('diaryNote').value = '';
  setToday('diaryDate');
}

// Обновление отображения списка записей
function updateDisplay() {
  const container = document.getElementById('entries');
  container.innerHTML = '';
  if (exercises.length) {
    const exHeader = document.createElement('h3');
    exHeader.textContent = 'Упражнения';
    container.appendChild(exHeader);
    const ul = document.createElement('ul');
    exercises.forEach((ex) => {
      const li = document.createElement('li');
      li.textContent = `${formatDate(ex.date)} • ${ex.name} • ${ex.count} раз`;
      ul.appendChild(li);
    });
    container.appendChild(ul);
  }
  if (practices.length) {
    const prHeader = document.createElement('h3');
    prHeader.textContent = 'Практики';
    container.appendChild(prHeader);
    const ul = document.createElement('ul');
    practices.forEach((pr) => {
      const li = document.createElement('li');
      li.textContent = `${formatDate(pr.date)} • Тип: ${pr.type} • ${pr.note}`;
      ul.appendChild(li);
    });
    container.appendChild(ul);
  }
  if (diaries.length) {
    const dHeader = document.createElement('h3');
    dHeader.textContent = 'Дневник';
    container.appendChild(dHeader);
    const ul = document.createElement('ul');
    diaries.forEach((d) => {
      const li = document.createElement('li');
      li.textContent = `${formatDate(d.date)} • ${d.note}`;
      ul.appendChild(li);
    });
    container.appendChild(ul);
  }
}

// Форматирование даты в человеческий вид (dd.mm.yyyy)
function formatDate(isoString) {
  const [year, month, day] = isoString.split('-');
  return `${day}.${month}.${year}`;
}

// Генерация PDF с использованием pdfMake, чтобы корректно отображать кириллицу
function exportToPdf() {
  const content = [];
  // Заголовок документа – используем новое название дневника
  content.push({ text: 'Diarium Magi', fontSize: 18, bold: true, margin: [0, 0, 0, 10] });
  if (exercises.length) {
    content.push({ text: 'Упражнения', fontSize: 14, bold: true, margin: [0, 0, 0, 5] });
    exercises.forEach((ex) => {
      const line = `${formatDate(ex.date)} • ${ex.name} • ${ex.count} раз`;
      content.push({ text: line, margin: [10, 0, 0, 2] });
    });
    content.push({ text: ' ', margin: [0, 0, 0, 5] });
  }
  if (practices.length) {
    content.push({ text: 'Практики', fontSize: 14, bold: true, margin: [0, 0, 0, 5] });
    practices.forEach((pr) => {
      const line = `${formatDate(pr.date)} • Тип: ${pr.type} • ${pr.note}`;
      content.push({ text: line, margin: [10, 0, 0, 2] });
    });
    content.push({ text: ' ', margin: [0, 0, 0, 5] });
  }
  if (diaries.length) {
    content.push({ text: 'Дневник', fontSize: 14, bold: true, margin: [0, 0, 0, 5] });
    diaries.forEach((d) => {
      const line = `${formatDate(d.date)} • ${d.note}`;
      content.push({ text: line, margin: [10, 0, 0, 2] });
    });
  }
  const docDefinition = { content };
  pdfMake.createPdf(docDefinition).download('DiaryPractice.pdf');
}

// Назначение обработчиков после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
  // Загрузка данных и установка сегодняшней даты по умолчанию
  loadData();
  ['exerciseDate', 'practiceDate', 'diaryDate'].forEach((id) => setToday(id));
  updateDisplay();

  document.getElementById('addExercise').addEventListener('click', addExercise);
  document.getElementById('addPractice').addEventListener('click', addPractice);
  document.getElementById('addDiary').addEventListener('click', addDiary);
  document.getElementById('exportPdf').addEventListener('click', exportToPdf);
});