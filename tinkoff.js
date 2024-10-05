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

    // Переходим на сайт и ждем редиректа
    await page.goto('https://www.tinkoff.ru/auth/login/', { waitUntil: 'networkidle2' });

    // Ждем навигации после редиректа
    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    // Проверяем текущий URL после редиректа
    let currentUrl = page.url();
    console.log("Текущий URL:", currentUrl);

    // Извлекаем cid из текущего URL
    const cidMatch = currentUrl.match(/cid=([^&]+)/);
    if (cidMatch) {
        const cid = cidMatch[1];
        const newUrl = `https://id.tbank.ru/auth/step?cid=${cid}`;

        // Переходим на новый URL
        await page.goto(newUrl);
        console.log("Переход на URL:", newUrl);
    } else {
        console.log("Не удалось извлечь cid из URL.");
        await browser.close();
        return;
    }

    // Ждем загрузки новой страницы
    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    // Проверяем текущий URL после перехода на новый
    currentUrl = page.url();
    console.log("Текущий URL после перехода:", currentUrl);

    const wordsToFind = ['Вход', 'Телефон'];
    const foundWords = await findWords(page, wordsToFind);
    
    console.log("Найденные слова:", foundWords);

    await browser.close();
}

main().catch(console.error);
