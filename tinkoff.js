const puppeteer = require('puppeteer');

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

    // Переходим на сайт и ждем загрузки
    await page.goto('https://www.tinkoff.ru/auth/login/', { waitUntil: 'networkidle2' });

    // Проверяем текущий URL после редиректа
    const currentUrl = page.url();
    console.log("Текущий URL:", currentUrl);

    // Ожидаем появления элемента, чтобы убедиться, что страница загружена
    await page.waitForSelector('body'); // Это может быть заменено на более специфичный селектор

    const wordsToFind = ['Вход', 'Телефон'];
    const foundWords = await findWords(page, wordsToFind);
    
    console.log("Найденные слова:", foundWords);

    await browser.close();
}

main().catch(console.error);
