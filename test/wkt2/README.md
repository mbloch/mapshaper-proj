# WKT2 test corpus

A collection of WKT2 (ISO 19162) CRS definitions for developing and testing
`wkt2_to_proj4` and `wkt2_from_proj4`. Intentionally mirrors the shape of
`test/prj/` (which covers WKT1).

All strings were fetched from `https://epsg.io/{CODE}.wkt2`. The `.proj4`
endpoint of the same site provides a reference Proj4 string; the full set,
along with normalization notes, is in `expected.json`.

## Why epsg.io

- Authoritative for EPSG codes (matches the official EPSG registry).
- Free, no rate limits at the scale of this corpus.
- Always produces WKT2:2019 (the current dialect), including the newer
  `ENSEMBLE`, `DYNAMIC`, `USAGE`, `REMARK`, `BOUNDCRS` blocks.

Caveats:

- epsg.io does **not** automatically wrap definitions in `BOUNDCRS` with a
  `+towgs84` transformation, so the `+towgs84=...` values in the `.proj4`
  output come from PROJ's proj.db and are not reconstructable from the WKT2
  alone. For integration-level confidence we'll want to supplement this
  corpus with output from `projinfo EPSG:... -o WKT2:2019 --boundcrs-to-wgs84`
  (requires a local PROJ install).
- epsg.io ignores Esri WKIDs that don't also have an EPSG code.
- Some `.proj4` outputs include `+nadgrids=...tif` overrides that our
  converter should strip.

## Layout

```
epsg/             -- well-formed WKT2 definitions, one per EPSG code
unsupported/      -- CRS kinds we don't plan to support (error-path tests)
expected.json     -- reference proj4 strings + per-fixture notes
```

## Coverage

### Geographic CRS (no CONVERSION)

| Code | Name            | Interesting features                     |
| ---- | --------------- | ---------------------------------------- |
| 4326 | WGS 84          | WKT2:2019 `ENSEMBLE` datum               |
| 4269 | NAD83           | Plain `DATUM` (no ensemble)              |
| 4277 | OSGB36          | Airy 1830 ellipsoid                      |
| 4807 | NTF (Paris)     | Non-Greenwich `PRIMEM`, `BOUNDCRS` wrap  |
| 4617 | NAD83(CSRS)     | GRS80 only, no TOWGS84                   |

### Projected CRS

| Code  | Name                                | EPSG method | Exercises                                              |
| ----- | ----------------------------------- | ----------- | ------------------------------------------------------ |
| 3857  | WGS 84 / Pseudo-Mercator            | 1024        | Sphere-from-ellipsoid special case                     |
| 27700 | OSGB36 / British National Grid      | 9807        | Transverse Mercator (vanilla)                          |
| 32618 | WGS 84 / UTM zone 18N               | 9807        | UTM zone name matching                                 |
| 2193  | NZGD2000 / NZTM 2000                | 9807        | Big false_northing                                     |
| 2154  | RGF93 v1 / Lambert-93               | 9802        | LCC 2SP with false_origin parameters                   |
| 2056  | CH1903+ / LV95                      | 9815        | Hotine Oblique Mercator variant B → `+proj=somerc`     |
| 3978  | NAD83 / Canada Atlas Lambert        | 9802        | LCC 2SP, zero offsets                                  |
| 3031  | WGS 84 / Antarctic Polar Stereo     | 9829        | Polar Stereographic variant B, `MERIDIAN` AXIS subfield|
| 5514  | S-JTSK / Krovak East North          | 1041        | Krovak method, EPSG parameter code 8833 (Longitude of origin) |
| 3395  | WGS 84 / World Mercator             | 9804        | Mercator variant A (distinct from 1024)                |
| 2393  | KKJ / Finland Uniform Coordinate    | 9807        | Non-standard axis order (north, east)                  |
| 2263  | NAD83 / NY Long Island (ftUS)       | 9802        | `LENGTHUNIT["US survey foot", 0.304800609601219]`      |
| 3347  | NAD83 / StatCan Lambert             | 9802        | Vanilla LCC 2SP                                        |
| 3035  | ETRS89-extended / LAEA Europe       | 9820        | `ENSEMBLE` for ETRS89; axis order (north, east)        |
| 5070  | NAD83 / CONUS Albers                | 9822        | Albers Equal Area                                      |

### WKT2:2019 extras that should parse-and-ignore

| Code | Name            | Notes                                                 |
| ---- | --------------- | ----------------------------------------------------- |
| 9057 | WGS 84 (G1762)  | `DYNAMIC[FRAMEEPOCH[2005]]`                           |

### Unsupported (error-path)

| File                  | Kind         | Notes                             |
| --------------------- | ------------ | --------------------------------- |
| `5555_compound.wkt2`  | `COMPOUNDCRS` | Horizontal PROJCRS + vertical     |
| `5773_vertical.wkt2`  | `VERTCRS`     | EGM96 height, no horizontal       |

## Todo

- Add the same codes from `projinfo EPSG:... -o WKT2:2019` (GDAL/PROJ flavor)
  to catch dialect differences between epsg.io's and PROJ's output.
- Add `BOUNDCRS`-wrapped variants of 2056, 5514, 2393 via
  `projinfo --boundcrs-to-wgs84` so the datum-shift path is exercised.
- Add at least one real-world sample extracted from a GeoPackage
  (`definition_12_063` column), FlatGeobuf header, and GeoParquet metadata
  to guard against toolchain-specific quirks.
