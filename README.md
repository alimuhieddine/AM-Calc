# AM-Calc

AM-Calc is a mobile-first diamond pricing calculator for AM Solutions. It loads two CSV price lists: one for round stones and one shared list for every non-round shape.

## Price Lists

Use the menu button in the top-right of the calculator to load updated CSV files.

- Round List: every row must have `BR` in column 1.
- Other Shapes List: every row must have `PS` in column 1.

The app rejects a selected file if any row has the wrong first-column code.

## CSV Format

Each row should use this column order:

`shape_code,clarity,color,from_carat,to_carat,price_per_carat,date`

Example round row:

`BR,VS2,H,1.00,1.49,5000.0,3/20/2026`

Example other-shapes row:

`PS,VS2,H,1.00,1.49,4200.0,3/20/2026`

## Pricing Behavior

- `Round` uses the Round List.
- `Cushion`, `Oval`, `Pear`, `Emerald`, `Heart`, `Marquise`, `Radiant`, `Asscher`, and `Other` use the Other Shapes List.
- The clarity picker intentionally excludes `SI3` because GIA does not use an SI3 grade.
- When 10 ct pricing is off, stones at or above 5 ct use the 5 ct pricing bucket.
- When 10 ct pricing is on, stones at or above 10 ct use the 10 ct pricing bucket.

## Development

This is a dependency-free static app. To run the validation tests:

```sh
npm test
```

The tests cover CSV parsing, first-column price-list validation, and carat bucket behavior.
