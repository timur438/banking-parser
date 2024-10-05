const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

// Подключаем плагин Stealth
puppeteer.use(StealthPlugin());

async function findWords(page, wordsToFind) {
    if (!Array.isArray(wordsToFind) || wordsToFind.length === 0) {
        throw new Error("Список слов для поиска не должен быть пустым.");
    }

    const foundWords = await page.evaluate((words) => {
        // Получаем весь текст со страницы
        const textContent = document.body.innerText || "";
        console.log("Текст страницы:", textContent); // Добавьте отладочный вывод

        // Разделяем текст на массив слов
        const wordsArray = textContent.match(/\b\w+\b/g) || []; // Убедитесь, что wordsArray не равен null

        // Ищем совпадения
        const matches = words.filter(word => wordsArray.includes(word));
        return matches;
    }, wordsToFind);

    return foundWords;
}

async function main() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // Переход к нужной странице
  await page.goto('https://www.tinkoff.ru/auth/login/', { waitUntil: 'networkidle2' });
  await page.waitForSelector('body');

  // Определяем слова для поиска
  const wordsToFind = ['Вход', 'Телефон'];
  const foundWords = await findWords(page, wordsToFind);

  // Проверяем, нашли ли необходимые слова
  const hasLogin = foundWords.includes('Вход');
  const hasPhone = foundWords.includes('Телефон');

  if (hasLogin && hasPhone) {
    console.log('Слова "Вход" и "Телефон" найдены.');

    // Находим ближайший инпут к слову "Телефон"
    const inputSelector = await page.evaluate(() => {
      const phoneLabel = Array.from(document.querySelectorAll('label')).find(label => label.innerText.includes('Телефон'));
      if (phoneLabel) {
        // Находим ближайший инпут к найденному лейблу
        const input = phoneLabel.closest('form').querySelector('input');
        return input ? input.name : null; // Возвращаем имя инпута, если он найден
      }
      return null;
    });

    if (inputSelector) {
      // Попросим пользователя ввести телефон
      const phoneNumber = await new Promise(resolve => {
        process.stdin.resume();
        process.stdout.write('Введите номер телефона: ');
        process.stdin.once('data', data => {
          process.stdin.pause();
          resolve(data.toString().trim());
        });
      });

      // Вводим номер телефона
      await page.type(`input[name="${inputSelector}"]`, phoneNumber);

      // Нажимаем на ближайшую кнопку
      await page.evaluate(() => {
        const button = Array.from(document.querySelectorAll('button')).find(btn => btn.innerText.includes('Вход'));
        if (button) {
          button.click();
        }
      });

      console.log('Номер телефона введён и кнопка нажата.');
    } else {
      console.log('Инпут для телефона не найден.');
    }
  } else {
    console.log('Не найдены слова "Вход" или "Телефон".');
  }

  await browser.close();
}

main().catch(console.error);
