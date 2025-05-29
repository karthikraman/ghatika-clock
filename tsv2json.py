import csv
import json

input_tsv = "places_lat_lon_tz_db.tsv"
output_json = "cities.json"

cities = {}

def convert(data):
    if ':' in data:
        return sexastr2deci(data.strip())
    else:
        return float(data.strip())

def sexastr2deci(sexa_str):
    """Converts as sexagesimal string to decimal

    Converts a given sexagesimal string to its decimal value

    Args:
      A string encoding of a sexagesimal value, with the various
      components separated by colons

    Returns:
      A decimal value corresponding to the sexagesimal string

    Examples:
      >>> sexastr2deci('15:30:00')
      15.5
      >>> sexastr2deci('-15:30:45')
      -15.5125
    """

    if sexa_str[0] == '-':
        sgn = -1.0
        dms = sexa_str[1:].split(':')  # dms = degree minute second
    else:
        sgn = 1.0
        dms = sexa_str.split(':')

    decival = 0
    for i in range(0, len(dms)):
        decival = decival + float(dms[i]) / (60.0 ** i)

    return decival * sgn

with open(input_tsv, newline='', encoding='utf-8') as tsvfile:
    reader = csv.DictReader(tsvfile, delimiter='\t')
    for row in reader:
        city_key = row['Name'].strip().lower()
        cities[city_key] = {
            "lat": convert(row['Lat']),
            "lon": convert(row['Long']),
            "timezone": row['Timezone'].strip()
        }

with open(output_json, 'w', encoding='utf-8') as jsonfile:
    json.dump(cities, jsonfile, indent=2)

print(f"Saved {len(cities)} cities to {output_json}")

