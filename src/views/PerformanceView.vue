<template>
  <div class="investor-landing">
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero__container">
        <h1 class="hero__title">грОмка</h1>
        <p class="hero__subtitle">Превращаем каждый смартфон в пиксель грандиозного светового шоу</p>
        <p class="hero__description">
          Первая в России платформа для массовых интерактивных световых перформансов.
          Тысячи смартфонов зрителей синхронизируются в единое визуальное полотно,
          создавая незабываемые эмоции и вирусный контент.
        </p>
        <div class="hero__metrics">
          <div class="metric">
            <div class="metric__value">15.75 млрд ₽</div>
            <div class="metric__label">размер рынка event-tech</div>
          </div>
          <div class="metric">
            <div class="metric__value">В 10-100×</div>
            <div class="metric__label">дешевле альтернатив</div>
          </div>
          <div class="metric">
            <div class="metric__value">250 млн ₽</div>
            <div class="metric__label">прогноз за 3 года</div>
          </div>
        </div>
        <div class="hero__cta">
          <a href="#investment">
            <ButtonComp>Инвестиционная возможность</ButtonComp>
          </a>
          <router-link to="/demo">
            <ButtonComp mod="secondary">Посмотреть демо</ButtonComp>
          </router-link>
        </div>
      </div>
    </section>

    <!-- Demo Video -->
    <section class="demo">
      <div class="demo__container">
        <h2 class="section-title">Как это работает</h2>
        <div class="demo__video-wrapper">
          <video class="demo__video" autoplay loop muted src="/videos/gromka.mp4" type="video/mp4">
        Ваш браузер не поддерживает видео.
      </video>
    </div>
        <div class="demo__features">
          <div class="feature">
            <div class="feature__icon">📱</div>
            <div class="feature__title">Простое участие</div>
            <div class="feature__text">QR-код → ввод места → часть шоу</div>
          </div>
          <div class="feature">
            <div class="feature__icon">🎨</div>
            <div class="feature__title">Любая визуализация</div>
            <div class="feature__text">Паттерны, волны, логотипы, текст</div>
          </div>
          <div class="feature">
            <div class="feature__icon">⚡</div>
            <div class="feature__title">Мгновенная синхронизация</div>
            <div class="feature__text">Все устройства работают как один экран</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Key Insights -->
    <section class="key-insights">
      <div class="key-insights__container">
        <h2 class="section-title">5 ключевых инсайтов</h2>
        <div class="insights-grid">
          <div class="insight-card">
            <div class="insight-card__number">01</div>
            <h3 class="insight-card__title">Нулевая конкуренция</h3>
            <p class="insight-card__text">
              В России нет прямых конкурентов с аналогичной технологией.
              Окно возможностей: 12-18 месяцев до появления копий.
            </p>
          </div>
          <div class="insight-card">
            <div class="insight-card__number">02</div>
            <h3 class="insight-card__title">Экономика × 10-100</h3>
            <p class="insight-card__text">
              Дрон-шоу: 5-50 млн ₽ → грОмка: 2-3 млн ₽.
              LTV/CAC = 83, маржинальность 70-75%.
            </p>
          </div>
          <div class="insight-card">
            <div class="insight-card__number">03</div>
            <h3 class="insight-card__title">Рынок 15.75 млрд ₽</h3>
            <p class="insight-card__text">
              TAM 15.75 млрд ₽/год, рост 12-15% CAGR.
              SAM 1.65 млрд ₽ — реально достижимый премиум-сегмент.
            </p>
          </div>
          <div class="insight-card">
            <div class="insight-card__number">04</div>
            <h3 class="insight-card__title">Валидированный спрос</h3>
            <p class="insight-card__text">
              60% опрошенных event-менеджеров готовы обсуждать бюджет 2-3 млн ₽.
              Клубы тратят 10-50 млн ₽/год на fan experience.
            </p>
          </div>
          <div class="insight-card">
            <div class="insight-card__number">05</div>
            <h3 class="insight-card__title">ROI 42× за 5 лет</h3>
            <p class="insight-card__text">
              IRR 156% для инвесторов. Валидация Y3: 1.2 млрд ₽.
              Выход Y5: 4 млрд ₽.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Problem & Solution -->
    <section class="problem-solution">
      <div class="problem-solution__container">
        <div class="problem">
          <h2 class="section-title">Проблема</h2>
          <ul class="problem__list">
            <li>Пассивное потребление контента — зрители остаются наблюдателями</li>
            <li>Дрон-шоу стоит 5-50 млн ₽, световые браслеты требуют закупки и логистики</li>
            <li>Организаторы теряют возможность создать WOW-эффект без миллионных бюджетов</li>
            <li>Сложность масштабирования от малых залов до стадионов</li>
          </ul>
    </div>
        <div class="solution">
          <h2 class="section-title">Решение</h2>
          <ul class="solution__list">
            <li>Каждый зритель — активный участник через личный смартфон</li>
            <li>Используем устройства, которые уже есть у 100% зрителей</li>
            <li>Масштабируется от 100 до 100,000 участников одной технологией</li>
            <li>Сбор данных о зрителях для дальнейшей монетизации</li>
          </ul>
        </div>
      </div>
    </section>

    <!-- Market Sizing -->
    <section class="market-sizing">
      <div class="market-sizing__container">
        <h2 class="section-title">Размер рынка (TAM/SAM/SOM)</h2>
        <div class="market-sizing__grid">
          <div class="market-size-card market-size-card--tam">
            <div class="market-size-card__label">TAM</div>
            <div class="market-size-card__value">15.75 млрд ₽</div>
            <div class="market-size-card__description">
              Общий рынок event-технологий в России
            </div>
            <ul class="market-size-card__breakdown">
              <li>Спорт: 10.75 млрд ₽</li>
              <li>Концерты: 2.6 млрд ₽</li>
              <li>Корпоративы: 2 млрд ₽</li>
              <li>Прочее: 400 млн ₽</li>
            </ul>
          </div>
          <div class="market-size-card market-size-card--sam">
            <div class="market-size-card__label">SAM</div>
            <div class="market-size-card__value">1.65 млрд ₽</div>
            <div class="market-size-card__description">
              Реально достижимый премиум-сегмент
            </div>
            <ul class="market-size-card__breakdown">
              <li>Топ-60 спортклубов: 750 млн ₽</li>
              <li>200 крупных концертов: 400 млн ₽</li>
              <li>500 корпоративов: 500 млн ₽</li>
            </ul>
          </div>
          <div class="market-size-card market-size-card--som">
            <div class="market-size-card__label">SOM</div>
            <div class="market-size-card__value">250 млн ₽</div>
            <div class="market-size-card__description">
              Захват за 3 года (9% SAM)
            </div>
            <ul class="market-size-card__breakdown">
              <li>Год 1: 25 млн ₽ (10 проектов)</li>
              <li>Год 2: 75 млн ₽ (30 проектов)</li>
              <li>Год 3: 150 млн ₽ (60 проектов)</li>
            </ul>
          </div>
        </div>
        <div class="market-growth">
          <div class="market-growth__stat">
            <div class="market-growth__value">12-15%</div>
            <div class="market-growth__label">CAGR 2024-2028</div>
          </div>
          <div class="market-growth__stat">
            <div class="market-growth__value">+18%</div>
            <div class="market-growth__label">Рост индустрии 2023</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Target Segments -->
    <section class="target-segments">
      <div class="target-segments__container">
        <h2 class="section-title">Целевые сегменты</h2>
        <div class="segments-grid">
          <div class="segment-card segment-card--priority">
            <div class="segment-card__badge">Приоритет #1</div>
            <h3 class="segment-card__title">🏟️ Спортивные клубы</h3>
            <div class="segment-card__size">60 приоритетных клиентов</div>
            <ul class="segment-card__features">
              <li>Регулярные события (матчи каждую неделю)</li>
              <li>Бюджет на fan experience: 10-50 млн ₽/год</li>
              <li>Готовность платить: 2.5-3.5 млн ₽/проект</li>
              <li>Repeat rate: 60%</li>
            </ul>
          </div>
          <div class="segment-card">
            <h3 class="segment-card__title">🎵 Концертные промоутеры</h3>
            <div class="segment-card__size">50 крупных компаний + 200 площадок</div>
            <ul class="segment-card__features">
              <li>10-30 концертов/год на промоутера</li>
              <li>5-20% бюджета на визуальное шоу</li>
              <li>Готовность платить: 1.5-3 млн ₽</li>
              <li>Дифференциация площадок</li>
            </ul>
          </div>
          <div class="segment-card">
            <h3 class="segment-card__title">🏢 Корпоративные события</h3>
            <div class="segment-card__size">2000+ крупных событий/год</div>
            <ul class="segment-card__features">
              <li>Годовые event'ы, презентации продуктов</li>
              <li>Team-building для сотрудников</li>
              <li>Готовность платить: 1-3 млн ₽</li>
              <li>Визуализация бренда компании</li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- Unit Economics -->
    <section class="unit-economics">
      <div class="unit-economics__container">
        <h2 class="section-title">Unit-экономика</h2>
        <div class="economics-grid">
          <div class="economics-card">
            <div class="economics-card__label">LTV/CAC</div>
            <div class="economics-card__value">83</div>
            <div class="economics-card__description">
              LTV: 12.5 млн ₽ (5 проектов) / CAC: 150K ₽
            </div>
            <div class="economics-card__note">✅ Отлично (>3 считается хорошо)</div>
          </div>
          <div class="economics-card">
            <div class="economics-card__label">Маржинальность</div>
            <div class="economics-card__value">70-75%</div>
            <div class="economics-card__description">
              Выручка 2.5 млн ₽ − переменные затраты 500K ₽
            </div>
            <div class="economics-card__note">✅ Высокая масштабируемость</div>
          </div>
          <div class="economics-card">
            <div class="economics-card__label">Payback</div>
            <div class="economics-card__value">Instant</div>
            <div class="economics-card__description">
              Окупаемость после первого проекта
            </div>
            <div class="economics-card__note">✅ 2.5 млн ₽ > 150K CAC</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Financial Projections -->
    <section class="financial-projections">
      <div class="financial-projections__container">
        <h2 class="section-title">Финансовые проекции (3 года)</h2>
        <div class="projections-table">
          <div class="projection-year">
            <div class="projection-year__header">
              <div class="projection-year__title">Год 1</div>
              <div class="projection-year__subtitle">Proof-of-Concept</div>
            </div>
            <div class="projection-year__metrics">
              <div class="projection-metric">
                <div class="projection-metric__label">Проекты</div>
                <div class="projection-metric__value">10</div>
              </div>
              <div class="projection-metric">
                <div class="projection-metric__label">Выручка</div>
                <div class="projection-metric__value">25 млн ₽</div>
              </div>
              <div class="projection-metric">
                <div class="projection-metric__label">EBITDA</div>
                <div class="projection-metric__value projection-metric__value--negative">-5 млн ₽</div>
              </div>
            </div>
          </div>
          <div class="projection-year">
            <div class="projection-year__header">
              <div class="projection-year__title">Год 2</div>
              <div class="projection-year__subtitle">Product-Market Fit</div>
            </div>
            <div class="projection-year__metrics">
              <div class="projection-metric">
                <div class="projection-metric__label">Проекты</div>
                <div class="projection-metric__value">30</div>
              </div>
              <div class="projection-metric">
                <div class="projection-metric__label">Выручка</div>
                <div class="projection-metric__value">75 млн ₽</div>
              </div>
              <div class="projection-metric">
                <div class="projection-metric__label">EBITDA</div>
                <div class="projection-metric__value projection-metric__value--positive">+15 млн ₽</div>
              </div>
            </div>
          </div>
          <div class="projection-year">
            <div class="projection-year__header">
              <div class="projection-year__title">Год 3</div>
              <div class="projection-year__subtitle">Scale + Platform</div>
            </div>
            <div class="projection-year__metrics">
              <div class="projection-metric">
                <div class="projection-metric__label">Проекты</div>
                <div class="projection-metric__value">60</div>
              </div>
              <div class="projection-metric">
                <div class="projection-metric__label">Выручка</div>
                <div class="projection-metric__value">198 млн ₽</div>
              </div>
              <div class="projection-metric">
                <div class="projection-metric__label">EBITDA</div>
                <div class="projection-metric__value projection-metric__value--positive">+83 млн ₽</div>
              </div>
            </div>
            <div class="projection-year__note">
              + 48 млн ₽ подписки (10 клиентов)
            </div>
          </div>
        </div>
        <div class="projections-summary">
          <div class="projections-summary__item">
            <div class="projections-summary__label">Cumulative Revenue</div>
            <div class="projections-summary__value">298 млн ₽</div>
          </div>
          <div class="projections-summary__item">
            <div class="projections-summary__label">Break-even</div>
            <div class="projections-summary__value">Q4 Год 1</div>
          </div>
          <div class="projections-summary__item">
            <div class="projections-summary__label">EBITDA margin Y3</div>
            <div class="projections-summary__value">42%</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Investment Opportunity -->
    <section id="investment" class="investment-opportunity">
      <div class="investment-opportunity__container">
        <h2 class="section-title">Инвестиционное предложение</h2>
        <div class="investment-grid">
          <div class="investment-ask">
            <h3 class="investment-ask__title">Seed раунд</h3>
            <div class="investment-ask__amount">8-10 млн ₽</div>
            <div class="investment-ask__equity">за 12-15% equity</div>
            <div class="investment-ask__valuation">Pre-money: 57 млн ₽</div>

            <h4 class="investment-ask__subtitle">Use of Funds:</h4>
            <ul class="investment-ask__breakdown">
              <li><span class="amount">3 млн ₽</span> — MVP разработка</li>
              <li><span class="amount">3 млн ₽</span> — Команда (6 мес)</li>
              <li><span class="amount">1.5 млн ₽</span> — Sales & Marketing</li>
              <li><span class="amount">1.5 млн ₽</span> — Операционные расходы</li>
            </ul>

            <div class="investment-ask__runway">Runway: 12 месяцев</div>
          </div>

          <div class="investment-returns">
            <h3 class="investment-returns__title">Projected Returns</h3>

            <div class="return-scenario">
              <div class="return-scenario__header">
                <div class="return-scenario__name">Year 3 (Series A exit)</div>
                <div class="return-scenario__badge">Conservative</div>
              </div>
              <div class="return-scenario__metrics">
                <div class="return-metric">
                  <div class="return-metric__label">Valuation</div>
                  <div class="return-metric__value">1.2 млрд ₽</div>
                </div>
                <div class="return-metric">
                  <div class="return-metric__label">ROI</div>
                  <div class="return-metric__value">18×</div>
                </div>
                <div class="return-metric">
                  <div class="return-metric__label">IRR</div>
                  <div class="return-metric__value">212%</div>
                </div>
              </div>
            </div>

            <div class="return-scenario">
              <div class="return-scenario__header">
                <div class="return-scenario__name">Year 5 (IPO/Strategic)</div>
                <div class="return-scenario__badge return-scenario__badge--upside">Upside</div>
              </div>
              <div class="return-scenario__metrics">
                <div class="return-metric">
                  <div class="return-metric__label">Valuation</div>
                  <div class="return-metric__value">4 млрд ₽</div>
                </div>
                <div class="return-metric">
                  <div class="return-metric__label">ROI</div>
                  <div class="return-metric__value">42×</div>
                </div>
                <div class="return-metric">
                  <div class="return-metric__label">IRR</div>
                  <div class="return-metric__value">156%</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="investment-milestones">
          <h3 class="investment-milestones__title">Key Milestones</h3>
          <div class="milestones-timeline">
            <div class="milestone">
              <div class="milestone__period">M3</div>
              <div class="milestone__title">MVP ready</div>
              <div class="milestone__target">Работает с 1000 устройств</div>
            </div>
            <div class="milestone">
              <div class="milestone__period">M6</div>
              <div class="milestone__title">First Customers</div>
              <div class="milestone__target">5-7 проектов реализовано</div>
            </div>
            <div class="milestone">
              <div class="milestone__period">M12</div>
              <div class="milestone__title">PMF Achieved</div>
              <div class="milestone__target">10+ проектов, 40% repeat rate</div>
            </div>
            <div class="milestone">
              <div class="milestone__period">M18</div>
              <div class="milestone__title">Platform Beta</div>
              <div class="milestone__target">Self-service запущен</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Competitive Advantages -->
    <section class="advantages">
      <div class="advantages__container">
        <h2 class="section-title">Конкурентные преимущества</h2>
        <div class="advantages__grid">
          <div class="advantage-card">
            <h3 class="advantage-card__title">🚀 Масштабируемость</h3>
            <p class="advantage-card__text">
              От камерного театра на 100 мест до стадиона на 80,000 зрителей.
              Одна технология для любого масштаба.
            </p>
          </div>
          <div class="advantage-card">
            <h3 class="advantage-card__title">💰 Низкий порог входа</h3>
            <p class="advantage-card__text">
              Не требуется покупка специального оборудования.
              Зрители используют свои смартфоны.
            </p>
          </div>
          <div class="advantage-card">
            <h3 class="advantage-card__title">⚡ Быстрый запуск</h3>
            <p class="advantage-card__text">
              2 месяца на реализацию первого проекта.
              После 10 кейсов — автоматизация через редактор.
            </p>
          </div>
          <div class="advantage-card">
            <h3 class="advantage-card__title">🎨 Гибкость</h3>
            <p class="advantage-card__text">
              Адаптация под любой формат: концерт, спектакль,
              спортивное событие, корпоратив.
            </p>
          </div>
          <div class="advantage-card">
            <h3 class="advantage-card__title">📊 Данные</h3>
            <p class="advantage-card__text">
              Сбор аналитики о поведении зрителей,
              возможность персонализированных предложений.
            </p>
          </div>
          <div class="advantage-card">
            <h3 class="advantage-card__title">🌐 Сетевой эффект</h3>
            <p class="advantage-card__text">
              Чем больше участников, тем впечатляющее шоу.
              Зрители сами становятся промоутерами.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- References -->
    <section class="references">
      <div class="references__container">
        <h2 class="section-title">Похожие проекты в мире</h2>
        <div class="references__grid">
          <div class="reference-card">
            <div class="reference-card__image">[Изображение Coldplay Xylobands]</div>
            <h3 class="reference-card__title">Coldplay — Xylobands</h3>
            <p class="reference-card__text">
              Световые браслеты стоимостью $2-5 за штуку.
              Мы используем смартфоны — у зрителей уже есть.
            </p>
          </div>
          <div class="reference-card">
            <div class="reference-card__image">[Изображение Intel Drone Show]</div>
            <h3 class="reference-card__title">Intel Drone Shows</h3>
            <p class="reference-card__text">
              Дроны стоят миллионы. Наше решение в 100 раз дешевле
              и доступнее для любой площадки.
            </p>
          </div>
          <div class="reference-card">
            <div class="reference-card__image">[Изображение Lazio]</div>
            <h3 class="reference-card__title">Перформанс Лацио</h3>
            <p class="reference-card__text">
              Вдохновение для нашего проекта.
              Мы делаем такие шоу доступными для всех.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Roadmap -->
    <section class="roadmap">
      <div class="roadmap__container">
        <h2 class="section-title">Дорожная карта</h2>
        <div class="roadmap__timeline">
          <div class="timeline-item">
            <div class="timeline-item__period">Этап 1: 0-6 мес</div>
            <h3 class="timeline-item__title">Запуск MVP</h3>
            <ul class="timeline-item__tasks">
              <li>5-10 кастомных перформансов</li>
              <li>Отработка технологии</li>
              <li>Первые кейсы и отзывы</li>
              <li>Выручка: 10-20 млн ₽</li>
            </ul>
          </div>
          <div class="timeline-item">
            <div class="timeline-item__period">Этап 2: 6-12 мес</div>
            <h3 class="timeline-item__title">Автоматизация</h3>
            <ul class="timeline-item__tasks">
              <li>Разработка редактора</li>
              <li>Self-service платформа</li>
              <li>20+ проектов</li>
              <li>Выручка: 40-60 млн ₽</li>
            </ul>
          </div>
          <div class="timeline-item">
            <div class="timeline-item__period">Этап 3: 12-24 мес</div>
            <h3 class="timeline-item__title">Масштабирование</h3>
            <ul class="timeline-item__tasks">
              <li>Выход на международные рынки</li>
              <li>Партнерства с площадками</li>
              <li>50+ проектов в год</li>
              <li>Выручка: 100+ млн ₽</li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- Team -->
    <section class="team">
      <div class="team__container">
        <h2 class="section-title">Команда</h2>
        <div class="team__info">
          <div class="team__strength">
            <h3 class="team__subtitle">Текущий состав</h3>
            <ul class="team__list">
              <li>Frontend-разработчик (full-time)</li>
              <li>Backend-разработчик (part-time)</li>
              <li>Founder с опытом в event-индустрии</li>
            </ul>
          </div>
          <div class="team__needs">
            <h3 class="team__subtitle">Планируем усилить</h3>
            <ul class="team__list">
              <li>Product Manager</li>
              <li>Sales Manager</li>
              <li>Дизайнер визуальных эффектов</li>
            </ul>
          </div>
        </div>
    </div>
    </section>

    <!-- CTA -->
    <section class="cta">
      <div class="cta__container">
        <h2 class="cta__title">Время действовать — СЕЙЧАС</h2>
        <p class="cta__text">
          Уникальная возможность стать частью инновационного проекта на растущем рынке 15.75 млрд ₽
          с подтвержденной готовностью платить и нулевой конкуренцией.
        </p>
        <div class="cta__highlights">
          <div class="cta__highlight">
            <div class="cta__highlight-value">42×</div>
            <div class="cta__highlight-label">ROI за 5 лет</div>
          </div>
          <div class="cta__highlight">
            <div class="cta__highlight-value">12-18 мес</div>
            <div class="cta__highlight-label">окно возможностей</div>
          </div>
          <div class="cta__highlight">
            <div class="cta__highlight-value">IRR 156%</div>
            <div class="cta__highlight-label">годовых</div>
          </div>
        </div>
        <div class="cta__actions">
          <a href="https://t.me/orlovskiy_rl" target="_blank">
            <ButtonComp>Связаться с основателем</ButtonComp>
          </a>
          <router-link to="/demo">
            <ButtonComp mod="secondary">Посмотреть демо</ButtonComp>
          </router-link>
        </div>
        <div class="cta__contact">
          <p>📧 Инвестиционные предложения: <a href="https://t.me/orlovskiy_rl">Telegram</a></p>
          <p class="cta__docs">📄 Полный стратегический документ доступен по запросу</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import ButtonComp from '@/components/ButtonComp.vue'
</script>

<style lang="scss" scoped>
.investor-landing {
  width: 100%;
  overflow-x: hidden;
  background: $color-white;
}

// Common styles
.section-title {
  font-size: 2.8rem;
  font-weight: $font-weight-bold;
  text-align: center;
  margin-bottom: 3.5rem;
  background: $gradient-primary;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;

  @include layout-aspect-mobile {
    font-size: 2.2rem;
    margin-bottom: 2.5rem;
  }
}

// Hero Section
.hero {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  background: $gradient-hero;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 30% 50%, rgba(255, 255, 255, 0.2) 0%, transparent 50%);
    pointer-events: none;
  }

  &__container {
    max-width: 1200px;
    width: 100%;
    text-align: center;
    position: relative;
    z-index: 1;
  }

  &__title {
    font-size: 6rem;
    font-weight: $font-weight-black;
    margin-bottom: 1.5rem;
    color: $color-white;
    text-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    animation: fadeInUp 0.8s ease-out;

    @include layout-aspect-mobile {
      font-size: 3.5rem;
    }
  }

  &__subtitle {
    font-size: 2.2rem;
    font-weight: $font-weight-semi-bold;
    margin-bottom: 1rem;
    color: $color-white;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);

    @include layout-aspect-mobile {
      font-size: 1.6rem;
    }
  }

  &__description {
    font-size: 1.3rem;
    color: rgba(255, 255, 255, 0.95);
    max-width: 900px;
    margin: 0 auto 4rem;
    line-height: 1.8;
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

    @include layout-aspect-mobile {
      font-size: 1.1rem;
      margin-bottom: 3rem;
    }
  }

  &__metrics {
    display: flex;
    justify-content: center;
    gap: 5rem;
    flex-wrap: wrap;
    margin-bottom: 3rem;

    @include layout-aspect-mobile {
      gap: 2.5rem;
    }
  }

  &__cta {
    margin-top: 2rem;
    display: flex;
    justify-content: center;
    gap: 1.5rem;

    @include layout-aspect-mobile {
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }

    a {
      text-decoration: none;
    }
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.metric {
  padding: 2rem;
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(10px);
  border-radius: 1.5rem;
  border: 2px solid rgba(255, 255, 255, 0.4);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 48px rgba(0, 0, 0, 0.15);
  }

  &__value {
    font-size: 3.2rem;
    font-weight: $font-weight-black;
    color: $color-white;
    margin-bottom: 0.5rem;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);

    @include layout-aspect-mobile {
      font-size: 2.4rem;
    }
  }

  &__label {
    font-size: 1rem;
    color: rgba(255, 255, 255, 0.9);
    text-transform: uppercase;
    letter-spacing: 1.5px;
    font-weight: $font-weight-semi-bold;

    @include layout-aspect-mobile {
      font-size: 0.9rem;
    }
  }
}

// Demo Section
.demo {
  padding: 7rem 2rem;
  background: $gradient-section-1;

  &__container {
    max-width: 1200px;
    margin: 0 auto;
  }

  &__video-wrapper {
    max-width: 900px;
    margin: 0 auto 5rem;
    border-radius: 2rem;
    overflow: hidden;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
    border: 4px solid $color-white;
  }

  &__video {
    width: 100%;
    display: block;
  }

  &__features {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 2.5rem;
    margin-top: 4rem;

    @include layout-aspect-mobile {
      gap: 1.5rem;
    }
  }
}

.feature {
    text-align: center;
  padding: 3rem 2rem;
  background: $color-white;
  border-radius: 2rem;
  border: 3px solid transparent;
  background-clip: padding-box;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  transition: all 0.4s ease;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 2rem;
    padding: 3px;
    background: $gradient-primary;
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    mask-composite: exclude;
    opacity: 0;
    transition: opacity 0.4s ease;
  }

  &:hover {
    transform: translateY(-10px) scale(1.02);
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);

    &::before {
      opacity: 1;
    }
  }

  &__icon {
    font-size: 4rem;
    margin-bottom: 1.5rem;
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
  }

  &__title {
    font-size: 1.5rem;
    font-weight: $font-weight-bold;
    margin-bottom: 1rem;
    background: $gradient-primary;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  &__text {
    font-size: 1.1rem;
    color: $color-gray-600;
    line-height: 1.6;
  }
}

// Problem & Solution
.problem-solution {
  padding: 7rem 2rem;
  background: $gradient-section-2;

  &__container {
    max-width: 1200px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 4rem;

    @include layout-aspect-mobile {
      grid-template-columns: 1fr;
      gap: 3rem;
    }
  }
}

.problem, .solution {
  &__list {
    list-style: none;
    padding: 0;

    li {
      padding: 2rem;
      margin-bottom: 1.5rem;
      background: $color-white;
      border-radius: 1.5rem;
      border-left: 6px solid $color-vibrant-blue;
      font-size: 1.15rem;
      line-height: 1.7;
      color: $color-gray-700;
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
      transition: all 0.3s ease;

      &:hover {
        transform: translateX(8px);
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
      }

      @include layout-aspect-mobile {
        font-size: 1.05rem;
        padding: 1.5rem;
      }
    }
  }
}

.solution__list li {
  border-left-color: $color-vibrant-teal;
}

// Market Section
.market {
  padding: 6rem 2rem;
  background: #0f0f1e;

  &__container {
    max-width: 1200px;
    margin: 0 auto;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 3rem;

    @include layout-aspect-mobile {
      grid-template-columns: 1fr;
      gap: 2rem;
    }
  }
}

.market-card {
  background: rgba(255, 255, 255, 0.05);
  padding: 3rem;
  border-radius: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);

  &__title {
    font-size: 1.8rem;
    font-weight: $font-weight-bold;
    margin-bottom: 2rem;
    color: #667eea;
  }

  &__list {
    list-style: none;
    padding: 0;

    li {
      padding: 1rem 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      font-size: 1.1rem;

      &:last-child {
        border-bottom: none;
      }
    }
  }

  &__stats {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }
}

.stat {
  &__value {
      font-size: 3rem;
    font-weight: $font-weight-bold;
    color: #667eea;
      margin-bottom: 0.5rem;
    }

  &__label {
    font-size: 1rem;
    color: rgba(255, 255, 255, 0.7);
  }
}

// Business Model
.business-model {
  padding: 6rem 2rem;
  background: linear-gradient(135deg, #1a1a2e 0%, #0f0f1e 100%);

  &__container {
    max-width: 1200px;
    margin: 0 auto;
  }
}

.revenue-streams {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 3rem;

  @include layout-aspect-mobile {
    gap: 2rem;
  }
}

.revenue-stream {
  text-align: center;
  padding: 3rem 2rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 20px 40px rgba(102, 126, 234, 0.3);
  }

  &__icon {
    font-size: 4rem;
    margin-bottom: 1rem;
  }

  &__title {
    font-size: 1.5rem;
    font-weight: $font-weight-bold;
    margin-bottom: 1rem;
  }

  &__value {
    font-size: 2.5rem;
    font-weight: $font-weight-bold;
    color: #10b981;
    margin-bottom: 1rem;
  }

  &__description {
    font-size: 1rem;
    color: rgba(255, 255, 255, 0.7);
    line-height: 1.5;
  }
}

// Advantages
.advantages {
  padding: 6rem 2rem;
  background: #0f0f1e;

  &__container {
    max-width: 1200px;
    margin: 0 auto;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 2rem;

    @include layout-aspect-mobile {
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }
  }
}

.advantage-card {
  padding: 2.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: #667eea;
  }

  &__title {
    font-size: 1.5rem;
    font-weight: $font-weight-bold;
    margin-bottom: 1rem;
  }

  &__text {
    font-size: 1rem;
    color: rgba(255, 255, 255, 0.7);
    line-height: 1.6;
  }
}

// References
.references {
  padding: 6rem 2rem;
  background: linear-gradient(135deg, #1a1a2e 0%, #0f0f1e 100%);

  &__container {
    max-width: 1200px;
    margin: 0 auto;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 3rem;

    @include layout-aspect-mobile {
      gap: 2rem;
    }
  }
}

.reference-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 1rem;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-5px);
  }

  &__image {
    height: 200px;
    background: rgba(255, 255, 255, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(255, 255, 255, 0.5);
    font-size: 0.9rem;
  }

  &__title {
    font-size: 1.3rem;
    font-weight: $font-weight-bold;
    padding: 1.5rem 1.5rem 1rem;
  }

  &__text {
    padding: 0 1.5rem 1.5rem;
    color: rgba(255, 255, 255, 0.7);
    line-height: 1.5;
  }
}

// Roadmap
.roadmap {
  padding: 6rem 2rem;
  background: #0f0f1e;

  &__container {
    max-width: 1200px;
    margin: 0 auto;
  }

  &__timeline {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 3rem;
    margin-top: 3rem;

    @include layout-aspect-mobile {
      gap: 2rem;
    }
  }
}

.timeline-item {
  position: relative;
  padding: 2.5rem;
  background: rgba(255, 255, 255, 0.05);
    border-radius: 1rem;
  border: 2px solid #667eea;

  &__period {
    display: inline-block;
    padding: 0.5rem 1rem;
    background: #667eea;
    border-radius: 2rem;
    font-size: 0.9rem;
    font-weight: $font-weight-medium;
    margin-bottom: 1rem;
  }

  &__title {
    font-size: 1.8rem;
    font-weight: $font-weight-bold;
    margin-bottom: 1.5rem;
  }

  &__tasks {
    list-style: none;
    padding: 0;

    li {
      padding: 0.8rem 0;
      padding-left: 1.5rem;
      position: relative;
      color: rgba(255, 255, 255, 0.8);

      &::before {
        content: "✓";
        position: absolute;
        left: 0;
        color: #10b981;
        font-weight: $font-weight-bold;
      }
    }
  }
}

// Team
.team {
  padding: 6rem 2rem;
  background: linear-gradient(135deg, #1a1a2e 0%, #0f0f1e 100%);

  &__container {
    max-width: 900px;
    margin: 0 auto;
  }

  &__info {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 3rem;

    @include layout-aspect-mobile {
      grid-template-columns: 1fr;
      gap: 2rem;
    }
  }

  &__subtitle {
    font-size: 1.5rem;
    font-weight: $font-weight-bold;
    margin-bottom: 1.5rem;
    color: #667eea;
  }

  &__list {
    list-style: none;
    padding: 0;

    li {
      padding: 1rem 0;
      padding-left: 2rem;
      position: relative;
      font-size: 1.1rem;
      color: rgba(255, 255, 255, 0.8);

      &::before {
        content: "•";
        position: absolute;
        left: 0;
        color: #667eea;
        font-size: 1.5rem;
      }
    }
  }
}

// CTA Section
.cta {
  padding: 6rem 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    text-align: center;

  &__container {
    max-width: 900px;
    margin: 0 auto;
  }

  &__title {
    font-size: 3rem;
    font-weight: $font-weight-bold;
    margin-bottom: 1.5rem;

    @include layout-aspect-mobile {
      font-size: 2rem;
    }
  }

  &__text {
    font-size: 1.3rem;
    margin-bottom: 3rem;
    line-height: 1.6;
    opacity: 0.9;

    @include layout-aspect-mobile {
      font-size: 1.1rem;
    }
  }

  &__actions {
    display: flex;
    justify-content: center;
    gap: 2rem;
    margin-bottom: 2rem;
    flex-wrap: wrap;

    @include layout-aspect-mobile {
      gap: 1rem;
    }
  }

  &__button {
    padding: 1.2rem 3rem;
    font-size: 1.1rem;
    font-weight: $font-weight-bold;
    border-radius: 3rem;
    text-decoration: none;
    transition: all 0.3s ease;
    display: inline-block;

    &--primary {
      background: white;
      color: #667eea;

      &:hover {
        transform: translateY(-3px);
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      }
    }

    &--secondary {
      background: transparent;
      color: white;
      border: 2px solid white;

      &:hover {
        background: white;
        color: #667eea;
        transform: translateY(-3px);
      }
    }

    @include layout-aspect-mobile {
      padding: 1rem 2rem;
      font-size: 1rem;
    }
  }

  &__contact {
    margin-top: 3rem;
    font-size: 1.1rem;
    opacity: 0.9;

    a {
      color: white;
      text-decoration: underline;

      &:hover {
        opacity: 0.8;
      }
    }
  }

  &__highlights {
    display: flex;
    justify-content: center;
    gap: 4rem;
    margin: 3rem 0;

    @include layout-aspect-mobile {
      flex-direction: column;
      gap: 2rem;
    }
  }

  &__highlight {
    text-align: center;

    &-value {
      font-size: 3rem;
      font-weight: $font-weight-bold;
      margin-bottom: 0.5rem;
    }

    &-label {
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 1px;
      opacity: 0.9;
    }
  }

  &__docs {
    margin-top: 1rem;
    opacity: 0.8;
  }
}

// Key Insights Section
.key-insights {
  padding: 7rem 2rem;
  background: $gradient-section-3;

  &__container {
    max-width: 1400px;
    margin: 0 auto;
  }
}

.insights-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2.5rem;

  @include layout-aspect-mobile {
    gap: 1.5rem;
  }
}

.insight-card {
  padding: 3rem;
  background: $color-white;
  border-radius: 2rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  position: relative;
    overflow: hidden;
  transition: all 0.4s ease;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 6px;
    background: $gradient-accent;
  }

  &:hover {
    transform: translateY(-12px) scale(1.03);
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);

    .insight-card__number {
      opacity: 0.3;
      transform: scale(1.1);
    }
  }

  &__number {
    position: absolute;
    top: 1.5rem;
    right: 1.5rem;
    font-size: 4rem;
    font-weight: $font-weight-black;
    background: $gradient-primary;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    opacity: 0.15;
    transition: all 0.4s ease;
  }

  &__title {
    font-size: 1.6rem;
    font-weight: $font-weight-bold;
    margin-bottom: 1.2rem;
    color: $color-gray-700;
    position: relative;
    z-index: 1;
  }

  &__text {
    font-size: 1.05rem;
    color: $color-gray-600;
    line-height: 1.7;
    position: relative;
    z-index: 1;
  }
}

// Market Sizing Section
.market-sizing {
  padding: 7rem 2rem;
  background: $gradient-section-4;

  &__container {
    max-width: 1400px;
    margin: 0 auto;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 3rem;
    margin-bottom: 4rem;

    @include layout-aspect-mobile {
      grid-template-columns: 1fr;
    }
  }
}

.market-size-card {
  padding: 3.5rem;
  background: $color-white;
  border-radius: 2rem;
  border: 4px solid;
  transition: all 0.4s ease;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);

  &:hover {
    transform: translateY(-10px) scale(1.02);
    box-shadow: 0 25px 60px rgba(0, 0, 0, 0.15);
  }

  &--tam {
    border-color: $color-vibrant-blue;
  }

  &--sam {
    border-color: $color-vibrant-teal;
  }

  &--som {
    border-color: $color-vibrant-orange;
  }

  &__label {
    font-size: 1rem;
    text-transform: uppercase;
    letter-spacing: 3px;
    margin-bottom: 1.5rem;
    font-weight: $font-weight-bold;
    color: $color-gray-500;
  }

  &__value {
    font-size: 3.5rem;
    font-weight: $font-weight-black;
    margin-bottom: 1.5rem;
    color: $color-vibrant-blue;

    .market-size-card--sam & {
      color: $color-vibrant-teal;
    }

    .market-size-card--som & {
      color: $color-vibrant-orange;
    }
  }

  &__description {
    font-size: 1.2rem;
    margin-bottom: 2rem;
    color: $color-gray-700;
    font-weight: $font-weight-medium;
  }

  &__breakdown {
    list-style: none;
    padding: 0;

    li {
      padding: 1rem 0;
      border-bottom: 2px solid $color-gray-200;
      font-size: 1.05rem;
      color: $color-gray-600;

      &:last-child {
        border-bottom: none;
      }
    }
  }
}

.market-growth {
  display: flex;
  justify-content: center;
  gap: 8rem;
  margin-top: 5rem;
  padding: 3rem;
  background: $color-white;
  border-radius: 2rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);

  @include layout-aspect-mobile {
    gap: 3rem;
    flex-direction: column;
  }

  &__stat {
    text-align: center;
  }

  &__value {
    font-size: 4rem;
    font-weight: $font-weight-black;
    background: $gradient-success;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 0.8rem;
  }

  &__label {
    font-size: 1.1rem;
    color: $color-gray-600;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    font-weight: $font-weight-semi-bold;
  }
}

// Target Segments Section
.target-segments {
  padding: 7rem 2rem;
  background: $gradient-section-5;

  &__container {
    max-width: 1400px;
    margin: 0 auto;
  }
}

.segments-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2.5rem;

  @include layout-aspect-mobile {
    grid-template-columns: 1fr;
  }
}

.segment-card {
  padding: 3rem;
  background: $color-white;
  border-radius: 2rem;
  border: 3px solid $color-gray-200;
  position: relative;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
  transition: all 0.4s ease;

  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
    border-color: $color-vibrant-purple;
  }

  &--priority {
    border: 4px solid $color-vibrant-purple;
    background: linear-gradient(135deg, $color-white 0%, rgba($color-vibrant-purple, 0.05) 100%);

    .segment-card__title {
      background: $gradient-primary;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
  }

  &__badge {
    position: absolute;
    top: -15px;
    right: 20px;
    padding: 0.8rem 1.5rem;
    background: $gradient-accent;
    border-radius: 3rem;
    font-size: 0.85rem;
    font-weight: $font-weight-bold;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    color: $color-white;
    box-shadow: 0 4px 20px rgba(245, 87, 108, 0.4);
  }

  &__title {
    font-size: 2rem;
    font-weight: $font-weight-bold;
    margin-bottom: 1.2rem;
    color: $color-gray-700;
  }

  &__size {
    font-size: 1.2rem;
    color: $color-vibrant-purple;
    margin-bottom: 2rem;
    font-weight: $font-weight-semi-bold;
  }

  &__features {
    list-style: none;
    padding: 0;

    li {
      padding: 1.2rem 0;
      padding-left: 2rem;
      position: relative;
      border-bottom: 2px solid $color-gray-200;
      font-size: 1.05rem;
      color: $color-gray-600;

      &:last-child {
        border-bottom: none;
      }

      &::before {
        content: "✓";
        position: absolute;
        left: 0;
        color: $color-vibrant-teal;
        font-weight: $font-weight-black;
        font-size: 1.3rem;
      }
    }
  }
}

// Unit Economics Section
.unit-economics {
  padding: 7rem 2rem;
  background: $gradient-section-1;

  &__container {
    max-width: 1300px;
    margin: 0 auto;
  }
}

.economics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 2.5rem;

  @include layout-aspect-mobile {
    grid-template-columns: 1fr;
  }
}

.economics-card {
  padding: 3.5rem;
  background: $color-white;
  border-radius: 2rem;
  border: 3px solid transparent;
  text-align: center;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  transition: all 0.4s ease;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 6px;
    background: $gradient-success;
  }

  &:hover {
    transform: translateY(-10px) scale(1.03);
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  }

  &__label {
    font-size: 1.1rem;
    text-transform: uppercase;
    letter-spacing: 2px;
    color: $color-gray-500;
    margin-bottom: 1.5rem;
    font-weight: $font-weight-bold;
  }

  &__value {
    font-size: 5rem;
    font-weight: $font-weight-black;
    background: $gradient-success;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 1.5rem;
    line-height: 1;
  }

  &__description {
    font-size: 1.1rem;
    color: $color-gray-600;
    margin-bottom: 1.5rem;
    line-height: 1.6;
  }

  &__note {
    font-size: 1rem;
    color: $color-vibrant-teal;
    font-weight: $font-weight-semi-bold;
    padding: 1rem;
    background: rgba($color-vibrant-teal, 0.1);
    border-radius: 1rem;
  }
}

// Financial Projections Section
.financial-projections {
  padding: 7rem 2rem;
  background: $gradient-section-2;

  &__container {
    max-width: 1400px;
    margin: 0 auto;
  }
}

.projections-table {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
    margin-bottom: 3rem;

    @include layout-aspect-mobile {
    grid-template-columns: 1fr;
  }
}

.projection-year {
  padding: 3rem;
  background: $color-white;
  border-radius: 2rem;
  border: 3px solid $color-gray-200;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  transition: all 0.4s ease;

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
    border-color: $color-vibrant-purple;
  }

  &__header {
    margin-bottom: 2.5rem;
    padding-bottom: 2rem;
    border-bottom: 3px solid $color-gray-200;
  }

  &__title {
    font-size: 2.5rem;
    font-weight: $font-weight-black;
    margin-bottom: 0.5rem;
    color: $color-gray-700;
  }

  &__subtitle {
    font-size: 1.1rem;
    color: $color-vibrant-purple;
    font-weight: $font-weight-semi-bold;
  }

  &__metrics {
    display: flex;
    flex-direction: column;
    gap: 1.8rem;
  }

  &__note {
    margin-top: 2rem;
    padding-top: 2rem;
    border-top: 2px solid $color-gray-200;
    font-size: 1rem;
    color: $color-vibrant-teal;
    text-align: center;
    font-weight: $font-weight-semi-bold;
  }
}

.projection-metric {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;

  &__label {
    font-size: 1.1rem;
    color: $color-gray-600;
    font-weight: $font-weight-medium;
  }

  &__value {
    font-size: 2.2rem;
    font-weight: $font-weight-black;
    color: $color-vibrant-blue;

    &--positive {
      color: $color-vibrant-teal;
    }

    &--negative {
      color: $color-vibrant-coral;
    }
  }
}

.projections-summary {
  display: flex;
  justify-content: space-around;
  padding: 3.5rem;
  background: $color-white;
  border-radius: 2rem;
  border: 4px solid $color-vibrant-purple;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);

  @include layout-aspect-mobile {
    flex-direction: column;
    gap: 2rem;
  }

  &__item {
    text-align: center;
  }

  &__label {
    font-size: 1.1rem;
    color: $color-gray-600;
    margin-bottom: 0.8rem;
    font-weight: $font-weight-medium;
  }

  &__value {
    font-size: 3rem;
    font-weight: $font-weight-black;
    background: $gradient-primary;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
}

// Investment Opportunity Section
.investment-opportunity {
  padding: 6rem 2rem;
  background: #0f0f1e;

  &__container {
    max-width: 1400px;
    margin: 0 auto;
  }
}

.investment-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 3rem;
  margin-bottom: 4rem;

  @include layout-aspect-mobile {
    grid-template-columns: 1fr;
  }
}

.investment-ask {
  padding: 3rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 1rem;
  border: 2px solid #667eea;

  &__title {
    font-size: 1.5rem;
    font-weight: $font-weight-bold;
    margin-bottom: 1.5rem;
    color: #667eea;
  }

  &__amount {
    font-size: 3.5rem;
    font-weight: $font-weight-bold;
    color: #10b981;
    margin-bottom: 0.5rem;
  }

  &__equity {
    font-size: 1.3rem;
    opacity: 0.8;
    margin-bottom: 0.5rem;
  }

  &__valuation {
    font-size: 1rem;
    opacity: 0.6;
    margin-bottom: 2rem;
  }

  &__subtitle {
    font-size: 1.2rem;
    font-weight: $font-weight-bold;
    margin: 2rem 0 1rem;
  }

  &__breakdown {
    list-style: none;
    padding: 0;

    li {
      padding: 1rem 0;
      font-size: 1.1rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);

      &:last-child {
        border-bottom: none;
      }

      .amount {
        color: #10b981;
        font-weight: $font-weight-bold;
        margin-right: 0.5rem;
      }
    }
  }

  &__runway {
    margin-top: 2rem;
    padding-top: 2rem;
    border-top: 2px solid rgba(255, 255, 255, 0.1);
    font-size: 1.2rem;
    font-weight: $font-weight-bold;
    color: #667eea;
  }
}

.investment-returns {
  display: flex;
  flex-direction: column;
  gap: 2rem;

  &__title {
    font-size: 1.5rem;
    font-weight: $font-weight-bold;
      margin-bottom: 1rem;
    }
  }

.return-scenario {
  padding: 2.5rem;
  background: rgba(255, 255, 255, 0.05);
    border-radius: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  &__name {
    font-size: 1.2rem;
    font-weight: $font-weight-bold;
  }

  &__badge {
    padding: 0.4rem 1rem;
    background: #667eea;
    border-radius: 2rem;
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 1px;

    &--upside {
      background: #10b981;
    }
  }

  &__metrics {
    display: flex;
    justify-content: space-around;

    @include layout-aspect-mobile {
      flex-direction: column;
      gap: 1.5rem;
    }
  }
}

.return-metric {
  text-align: center;

  &__label {
    font-size: 0.9rem;
    opacity: 0.7;
    margin-bottom: 0.5rem;
  }

  &__value {
    font-size: 2.5rem;
    font-weight: $font-weight-bold;
    color: #10b981;
  }
}

.investment-milestones {
  padding: 3rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 1rem;

  &__title {
    font-size: 1.5rem;
    font-weight: $font-weight-bold;
    margin-bottom: 2rem;
    text-align: center;
  }
}

.milestones-timeline {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;

  @include layout-aspect-mobile {
    grid-template-columns: 1fr;
  }
}

.milestone {
  text-align: center;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 0.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);

  &__period {
    display: inline-block;
    padding: 0.5rem 1rem;
    background: #667eea;
    border-radius: 2rem;
    font-size: 0.9rem;
    font-weight: $font-weight-bold;
    margin-bottom: 1rem;
  }

  &__title {
    font-size: 1.3rem;
    font-weight: $font-weight-bold;
    margin-bottom: 0.5rem;
  }

  &__target {
    font-size: 0.9rem;
    opacity: 0.7;
  }
}
</style>
