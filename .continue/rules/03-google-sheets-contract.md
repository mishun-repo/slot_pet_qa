---
alwaysApply: true
---
# Google Sheets Test Management Contract

При любой работе с тест-кейсами или багами используй MCP `google-sheets` и **строго** следующую таблицу:
- **spreadsheet_id**: `1D7iSdnNrzcxPoojYQISZzsT7hYikZ-qnrWLFFxQSzP8`

## Структура вкладок (не менять порядок колонок!)

### 1. Лист `TestCases` (диапазон `TestCases!A:L`)
Первая строка (заголовки) уже существует — **никогда не перезаписывай строку 1**.
Перед добавлением новых строк сначала прочитай занятые строки, чтобы определить следующий свободный `TC_ID` и первую пустую строку.

Колонки строго по порядку:
- `A`: `TC_ID` (формат `TC-001`, `TC-002`...)
- `B`: `Jira_Key` (например `SLOT-14`)
- `C`: `Title` (краткое название проверки)
- `D`: `Preconditions`
- `E`: `Steps` (нумерованный список в одной ячейке через `\n`)
- `F`: `Expected_Result`
- `G`: `Priority` (`Critical` | `High` | `Medium` | `Low`)
- `H`: `Layer` (`UI` | `API` | `E2E`)
- `I`: `Automation_Status` (`To Do` | `In Progress` | `Automated` | `Blocked`)
- `J`: `Auto_Test_Path` (путь к файлу, например `tests/e2e/spin.spec.ts`)
- `K`: `Last_Run_Status` (`Not Run` | `Passed` | `Failed`)
- `L`: `Bug_Link` (URL бага в Jira, если упал)

### 2. Лист `BugLog` (диапазон `BugLog!A:J`)
Колонки строго по порядку:
- `A`: `Bug_ID` (ключ из Jira, например `SLOT-19`)
- `B`: `Jira_Bug_URL`
- `C`: `Related_TC_ID`
- `D`: `Severity` (`Blocker` | `Critical` | `Major` | `Minor`)
- `E`: `Environment`
- `F`: `Steps_To_Reproduce`
- `G`: `Actual`
- `H`: `Expected`
- `I`: `Regression_Test_Path` (например `tests/regression/bug-SLOT-19.spec.ts`)
- `J`: `Status` (`Open` | `Fixed` | `Verified`)