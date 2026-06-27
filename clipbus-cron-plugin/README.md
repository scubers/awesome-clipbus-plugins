# Cron Explainer

Clipbus plugin that automatically detects cron expressions on the clipboard and renders a visual breakdown of each field.

## Features

- **Auto-detection**: Recognises standard 5-field cron expressions (minute hour day month weekday)
- **Field breakdown**: Displays each field's raw value alongside a human-readable description in a table
- **Plain-English summary**: A concise sentence at the bottom describing the schedule's cadence
- **Domain validation**: Minute 0–59, Hour 0–23, Day 1–31, Month 1–12 (supports JAN–DEC), Weekday 0–7 (supports SUN–SAT)
- **Next run times**: Displays the next 5 upcoming fire times computed live from the current local time, refreshed every 30 seconds
- **False-positive guard**: Pure five-number strings like `1 2 3 4 5` are ignored — at least one cron special character (`* / , -`) must be present

## Supported Syntax

| Syntax        | Example    | Meaning              |
|---------------|------------|----------------------|
| Wildcard      | `*`        | every …              |
| Integer       | `30`       | at … 30              |
| Range         | `1-5`      | 1 through 5          |
| List          | `1,3,5`    | enumerated values    |
| Step          | `*/15`     | every 15 …           |
| Named month   | `JAN-MAR`  | Jan through Mar      |
| Named weekday | `MON-FRI`  | Mon through Fri      |

## Examples

```
30 9 * * 1-5     # weekdays at 9:30
*/15 * * * *     # every 15 minutes
0 0 1 * *        # midnight on the 1st of each month
0 8 * * MON-FRI  # weekdays at 8:00
```
