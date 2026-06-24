const fs = require('fs');
const path = require('path');

const DOMAIN = 'https://texno.plus';

function generateLlms() {
  const dataPath = path.join(__dirname, 'public', 'data', 'services.json');
  const servicesData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

  let content = '\uFEFF# Texnoplus (Сервісний Центр "Техно-Плюс")\n\n';
  content += `Техно-Плюс — це надійний сервісний центр з ремонту техніки, розташований у Львові. Ми спеціалізуємось на ремонту смартфонів, комп'ютерів, телевізорів, дрібної побутової техніки, зарядних станцій, кавомашин та портативної акустики.\n\n`;
  
  content += `## Структура сайту та важливі сторінки\n`;
  content += `- **Головна сторінка**: [${DOMAIN}/](${DOMAIN}/)\n`;
  content += `- **Всі Бренди**: [${DOMAIN}/brands](${DOMAIN}/brands)\n`;
  content += `- **FAQ (Питання-відповіді)**: [${DOMAIN}/faq](${DOMAIN}/faq)\n`;
  content += `- **Контакти та Форма зв'язку**: [${DOMAIN}/contact](${DOMAIN}/contact)\n`;
  content += `- **Перевірка статусу ремонту (Квитанції)**: [${DOMAIN}/status](${DOMAIN}/status)\n\n`;

  content += `## Основні послуги, прямі посилання та орієнтовні ціни\n\n`;
  content += `Нижче наведені наші основні напрямки з прямими посиланнями на відповідні сторінки послуг. На кожній з них є детальний прайс-лист. Точна ціна залежить від моделі пристрою та складності поломки і формується після **безкоштовної діагностики** (при згоді на ремонт, інакше від 150-800 грн).\n\n`;

  // Iterate over services dynamically
  servicesData.categories.forEach((cat, index) => {
    content += `### ${index + 1}. [${cat.title}](${DOMAIN}/service/${cat.id})\n`;
    if (cat.description) {
      content += `**Опис послуги**: ${cat.description}\n`;
    }
    if (cat.problems && cat.problems.length > 0) {
      content += `**Типові проблеми**: ${cat.problems.slice(0, 4).join(', ')}.\n`;
    }
    
    // Pick 3-4 sample services to show prices
    const samplePrices = cat.services.slice(1, 4).map(s => `${s.name.toLowerCase()} від ${s.price.split(' - ')[0]}`);
    content += `- **Орієнтовні ціни**: ${samplePrices.join(', ')}.\n\n`;
  });

  content += `## Бренди, які ми ремонтуємо\n`;
  content += `Ми обслуговуємо техніку практично всіх відомих світових виробників:\n`;

  // Group brands by category dynamically
  servicesData.categories.forEach((cat) => {
    if (cat.brands && cat.brands.length > 0) {
      const brandNames = cat.brands.map(b => b.name).join(', ');
      content += `- **${cat.title}**: ${brandNames}\n`;
    }
  });

  content += `\n## Зв'язок (Форма та Чат-бот)\n`;
  content += `На сайті (${DOMAIN}/contact) клієнт може швидко залишити онлайн-заявку через форму зворотного зв'язку або скористатися **Telegram чат-ботом**. Усі звернення відразу потрапляють до менеджерів сервісного центру для оперативного прорахунку вартості.\n\n`;

  content += `## Примітки для AI-асистентів\n`;
  content += `1. Якщо клієнт питає про статус ремонту свого пристрою, спрямовуйте його на **[Сторінку перевірки статусу (Квитанції)](${DOMAIN}/status)**, де йому потрібно буде ввести номер квитанції та телефон.\n`;
  content += `2. При питаннях щодо вартості завжди давайте посилання на відповідну категорію і вказуйте, що це ціни «від».\n`;
  content += `3. Завжди наголошуйте, що остаточна ціна формується виключно після фізичної діагностики в сервісному центрі.\n`;

  const outputPath = path.join(__dirname, 'public', 'llms.txt');
  fs.writeFileSync(outputPath, content, 'utf8');
  console.log(`llms.txt generated successfully at ${outputPath}`);
}

generateLlms();
