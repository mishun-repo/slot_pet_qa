---
alwaysApply: true
---
# Enterprise QA Automation Standards

1. **Test Pyramid & Layers**:
   - Не пиши E2E UI-тесты для проверки того, что можно проверить через API или unit-контракт.
   - Предусловия (создание юзера, начисление баланса) выполняй через API/DB helper, а не через UI-клики.

2. **Code Architecture**:
   - Используй Page Object Model (`pages/`) + фикстуры.
   - Паттерн тестов: строгий `Arrange -> Act -> Assert` с явными шагами (`test.step` / `allure.step`).
   - Запрещены `waitForTimeout` / `sleep`. Используй только web-first assertions и ожидание сетевых ответов.
   - Приоритет локаторов: `data-testid` > `getByRole` > `getByText` > CSS. Если в `slot_pet_project` нет `data-testid`, фиксируй это как рекомендацию к PR или используй устойчивые ARIA/CSS селекторы.

3. **Failure Triage Rule**:
   - При падении теста ОБЯЗАТЕЛЬНО проверь: консоль браузера, HTTP-ответы (4xx/5xx), трейс Playwright и исходный код `../slot_pet_project`.
   - Если тест упал из-за неверного селектора в твоём тесте — почини тест (максимум 2 итерации).
   - Если приложение нарушило Acceptance Criteria из Jira — ЭТО БАГ. Не подгоняй тест под сломанное поведение!

4. **Git & Merge Safety**:
   - Никогда не коммить напрямую в `main`.
   - Формат ветки: `qa/<JIRA_KEY>-<short-slug>`.
   - Формат коммита: Conventional Commits (`test(SLOT-12): add spin balance validation`).