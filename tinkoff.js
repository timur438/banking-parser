const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const readline = require('readline');

puppeteer.use(StealthPlugin());

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Функция для поиска слов на странице
async function findWords(page, wordsToFind) {
  const foundWords = await page.evaluate((words) => {
    // Получаем весь текст со страницы
    const textContent = document.body.innerText;

    // Разделяем текст на массив слов
    const wordsArray = textContent.match(/\b\w+\b/g); // Слова, состоящие из букв и цифр

    // Ищем совпадения
    const matches = words.filter(word => wordsArray.includes(word));
    return matches;
  }, wordsToFind);

  return foundWords;
}

async function main() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  // Переход к нужной странице
  await page.goto('https://www.tinkoff.ru/login');

  // Ввод слов для поиска
  const inputWords = await new Promise(resolve => {
    rl.question('Введите слова для поиска (через запятую): ', input => {
      resolve(input.split(',').map(word => word.trim()));
    });
  });

  // Поиск слов на странице
  const foundWords = await findWords(page, inputWords);
  console.log('Найденные слова:', foundWords);

  await browser.close();
  rl.close();
}

main().catch(console.error);
