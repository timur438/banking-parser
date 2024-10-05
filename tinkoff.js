const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

async function findWords(page, wordsToFind) {
    if (!Array.isArray(wordsToFind) || wordsToFind.length === 0) {
        throw new Error("Список слов для поиска не должен быть пустым.");
    }

    const foundWords = await page.evaluate((words) => {
        const textContent = document.body.innerText || "";
        const wordsArray = textContent.match(/\b\w+\b/g) || [];
        console.log("Текст страницы:", textContent); // Отладочный вывод
        const matches = words.filter(word => wordsArray.includes(word));
        return matches;
    }, wordsToFind);

    return foundWords;
}

async function main() {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // Устанавливаем пользовательский агент
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36');

    // Переходим на сайт и ждем редиректа
    await page.goto('https://www.tbank.ru/auth/login/?redirectTo=%2Fmybank%2F', { waitUntil: 'networkidle2' });

    // Ждем навигации после редиректа
    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    // Проверяем текущий URL после редиректа
    let currentUrl = page.url();
    console.log("Текущий URL:", currentUrl);

    // Ждем, пока загрузится определенный элемент на странице
    await page.waitForSelector('body'); // Можно заменить на более специфичный селектор, если нужно

    // Выводим HTML-код страницы для отладки
    const pageContent = await page.content();
    console.log("HTML-код страницы:", pageContent);

    // Ищем слова
    const wordsToFind = ['Вход', 'Телефон'];
    const foundWords = await findWords(page, wordsToFind);
    
    console.log("Найденные слова:", foundWords);

    await browser.close();
}

main().catch(console.error);
